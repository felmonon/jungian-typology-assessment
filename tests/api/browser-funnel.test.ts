import { describe, expect, it, vi } from 'vitest';
import { loadBrowserFunnel, summarizeBrowserFunnel, type BrowserFunnelEvent } from '../../api/_lib/browser-funnel';

const now = new Date('2026-10-27T12:00:00Z');
const at = (day: number, hour = 12) => `2026-10-${String(day).padStart(2, '0')}T${hour}:00:00Z`;
const event = (name: string, browser: string, day: number, extra = {}): BrowserFunnelEvent => ({
  event_id: `client:${name}:${browser}:${day}`, event_name: name, anonymous_id: browser, occurred_at: at(day), ...extra,
});
const checkout = (browser: string, day = 24) => event('checkout_session_created', browser, day, {
  event_id: `checkout_session_created:cs_${browser}`, stripe_session_id: `cs_${browser}`, checkout_intent_id: `intent_${browser}`,
});
const purchase = (browser: string, day = 25) => event('purchase', browser, day, {
  event_id: `purchase:cs_${browser}`, stripe_session_id: `cs_${browser}`, checkout_intent_id: `intent_${browser}`, purchase_id: `purchase_${browser}`,
});
const paid = (browser: string) => ({ id: `purchase_${browser}`, stripe_session_id: `cs_${browser}`, status: 'completed', amount: 700, tier: 'insight' });
const intent = (browser: string) => ({ id: `intent_${browser}`, stripe_session_id: `cs_${browser}`, created_at: at(24) });
const journey = (browser: string) => [
  event('site_visited', browser, 20), event('assessment_started', browser, 21), event('assessment_completed', browser, 22),
  event('results_premium_preview_viewed', browser, 23), checkout(browser), purchase(browser),
];

describe('browser funnel', () => {
  it('separates explicitly tagged study browsers across their complete journey', () => {
    const study = journey('study');
    study[2].properties = {
      traffic_attribution_version: '1', traffic_source_kind: 'utm',
      traffic_source: 'typejung_research', traffic_campaign: 'offer_observation_2026_10',
    };
    const summary = summarizeBrowserFunnel([
      ...study, ...journey('customer'),
    ], [paid('study'), paid('customer')], [intent('study'), intent('customer')], now);
    expect(summary.stages.map(stage => stage.browsers)).toEqual([1, 1, 1, 1, 1, 1]);
    expect(summary).toMatchObject({ completingBrowsers: 1, payingCompletingBrowsers: 1, researchExcludedBrowsers: 1, researchExcludedEvents: 6 });
  });

  it('excludes a dedicated study browser when privacy settings omit traffic fields', () => {
    const summary = summarizeBrowserFunnel([
      ...journey('research_observation_v1_private'), ...journey('legacy-untagged'),
    ], [paid('research_observation_v1_private'), paid('legacy-untagged')], [intent('research_observation_v1_private'), intent('legacy-untagged')], now);
    expect(summary).toMatchObject({ completingBrowsers: 1, payingCompletingBrowsers: 1, researchExcludedBrowsers: 1 });
  });

  it('does not let an out-of-window campaign marker remove ordinary in-window activity', () => {
    const summary = summarizeBrowserFunnel([
      ...journey('returning'),
      event('assessment_completed', 'returning', 28, { properties: { utm_source: 'typejung_research', utm_campaign: 'offer_observation_2026_10' } }),
    ], [paid('returning')], [intent('returning')], now);
    expect(summary).toMatchObject({ completingBrowsers: 1, payingCompletingBrowsers: 1, researchExcludedBrowsers: 0 });
  });

  it('accepts steps emitted in the same millisecond regardless of delivery order', () => {
    const rows = journey('buyer').map((row) => ({ ...row, occurred_at: at(26) })).reverse();
    expect(summarizeBrowserFunnel(rows, [paid('buyer')], [intent('buyer')], now).stages.map((stage) => stage.browsers)).toEqual([1, 1, 1, 1, 1, 1]);
  });

  it('deduplicates browsers, requires ordered steps, and measures paid after completion without requiring a tracked visit', () => {
    const rows = [
      ...journey('buyer'), ...journey('buyer'), event('assessment_completed', 'buyer', 26),
      event('assessment_completed', 'older-visit', 22), purchase('older-visit'),
      event('site_visited', 'reader', 20), event('assessment_started', 'reader', 21), event('assessment_completed', 'reader', 22),
      event('site_visited', 'out-of-order', 23), event('assessment_started', 'out-of-order', 20),
    ];
    const summary = summarizeBrowserFunnel(rows.reverse(), [paid('buyer'), paid('older-visit')], [intent('buyer'), intent('older-visit')], now);
    expect(summary.stages.map((stage) => stage.browsers)).toEqual([3, 2, 2, 1, 1, 1]);
    expect(summary).toMatchObject({ completingBrowsers: 3, payingCompletingBrowsers: 2, completionToPaidRate: 2 / 3 });
  });

  it('excludes invalid dates, missing identity, future events and events outside the 30-day window', () => {
    const summary = summarizeBrowserFunnel([
      event('assessment_completed', 'old', 1, { occurred_at: '2026-09-27T11:59:59Z' }),
      event('assessment_completed', 'future', 28),
      event('assessment_completed', 'invalid', 1, { occurred_at: 'invalid' }),
      event('assessment_completed', '', 20),
      event('assessment_completed', 'boundary', 1, { occurred_at: '2026-09-27T12:00:00Z' }),
    ], [], [], now);
    expect(summary).toMatchObject({ completingBrowsers: 1, payingCompletingBrowsers: 0, completionToPaidRate: 0 });
    expect(summarizeBrowserFunnel([], [], [], now).completionToPaidRate).toBeNull();
  });

  it('does not count forged, free, refunded, mismatched or pre-completion payments', () => {
    const browsers = ['forged', 'free', 'refunded', 'mismatched', 'wrong-intent', 'before', 'client-id'];
    const rows = browsers.flatMap((browser) => [event('assessment_completed', browser, 25), purchase(browser, browser === 'before' ? 24 : 26)]);
    rows.find((row) => row.anonymous_id === 'client-id' && row.event_name === 'purchase')!.event_id = 'client:purchase:fake';
    const purchases = [paid('free'), paid('refunded'), paid('mismatched'), paid('wrong-intent'), paid('before'), paid('client-id')];
    purchases[0].amount = 0;
    purchases[1].status = 'refunded';
    purchases[2].id = 'different-purchase';
    const intents = browsers.filter((browser) => browser !== 'wrong-intent').map(intent);
    expect(summarizeBrowserFunnel(rows, purchases, intents, now).payingCompletingBrowsers).toBe(0);
  });

  it('does not count fabricated Stripe handoffs without a matching checkout intent', () => {
    const summary = summarizeBrowserFunnel(journey('fake'), [paid('fake')], [], now);
    expect(summary.stages.map((stage) => stage.browsers)).toEqual([1, 1, 1, 1, 0, 0]);
  });

  it('reports missing database data as unavailable instead of zero conversion', async () => {
    const query: any = {};
    for (const name of ['select', 'in', 'gte', 'lte', 'order']) query[name] = vi.fn(() => query);
    query.range = vi.fn().mockResolvedValue({ data: null, error: { code: '42P01' } });
    const result = await loadBrowserFunnel({ from: vi.fn(() => query) } as any, now);
    expect(result.status).toBe('unavailable');
    expect(result.completionToPaidRate).toBeNull();
  });

  it('marks truncated event reads as partial', async () => {
    const query: any = {};
    for (const name of ['select', 'in', 'gte', 'lte', 'order']) query[name] = vi.fn(() => query);
    query.range = vi.fn().mockResolvedValue({ data: Array.from({ length: 1000 }, (_, i) => event('site_visited', `b${i}`, 20)), error: null });
    const result = await loadBrowserFunnel({ from: vi.fn(() => query) } as any, now);
    expect(result.status).toBe('partial');
    expect(query.range).toHaveBeenCalledTimes(21);
  });
});
