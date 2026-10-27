import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setAnalyticsEnabled, trackEvent, trackPageView } from '../../lib/analytics';
import { normalizeAnalyticsEvent } from '../../api/_lib/analytics-event';
import { recordFunnelEvent } from '../../api/_lib/funnel-events';

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));
vi.mock('@vercel/analytics/server', () => ({ track: vi.fn() }));
const traffic = vi.hoisted(() => ({
  traffic_attribution_version: '1',
  traffic_source_kind: 'referrer',
  traffic_source: 'www.google.com',
  traffic_referrer_host: 'www.google.com',
  traffic_landing_path: '/jungian-cognitive-functions-test',
  traffic_captured_at: '2026-10-27T14:00:00.000Z',
}));
vi.mock('../../lib/traffic-attribution', () => ({ trafficAttributionParams: () => traffic }));

describe('report-offer funnel stages', () => {
  beforeEach(() => {
    vi.stubEnv('DEV', false);
    vi.stubGlobal('window', { location: new URL('https://typejung.com/results'), crypto: window.crypto });
    Object.defineProperty(navigator, 'sendBeacon', { configurable: true, value: vi.fn(() => false) });
    setAnalyticsEnabled(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('mirrors a real page view as a private-data-free visit', () => {
    trackPageView('/auth?email=private@example.com', 'private account');
    const [, request] = vi.mocked(fetch).mock.calls[0];
    const payload = JSON.parse(request!.body as string);
    expect(payload).toMatchObject({ eventName: 'site_visited', path: '/', properties: traffic });
    expect(normalizeAnalyticsEvent(payload)?.funnelEvent?.properties).toEqual(traffic);
    expect(JSON.stringify(payload)).not.toContain('private');
  });

  it.each([
    ['results_premium_preview_viewed', { source: 'results_locked_preview', tier: 'insight', offer_version: 'stress-reflection-v1' }],
    ['result_report_sample_explored', { topic: 'stress', source: 'results_locked_preview', tier: 'insight' }],
    ['results_direct_checkout_failed', { reason: 'checkout_unavailable', source: 'results_locked_preview', tier: 'insight' }],
    ['result_upgrade_prompt_viewed', { source: 'results_locked_preview', tier: 'insight', measurement_version: 'visibility-v1' }],
    ['result_upgrade_entry_clicked', { source: 'results_locked_preview', tier: 'insight', measurement_version: 'visibility-v1' }],
    ['result_report_opened', { source: 'results_locked_preview', tier: 'insight', measurement_version: 'visibility-v1' }],
  ])('persists %s from the browser through the first-party API', async (eventName, properties) => {
    trackEvent(eventName, properties);
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, request] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/analytics');
    const payload = JSON.parse(request!.body as string);
    const event = normalizeAnalyticsEvent(payload);
    expect(event?.funnelEvent).toMatchObject({ eventName, source: 'results_locked_preview', tier: 'insight', properties });
    const upsert = vi.fn().mockResolvedValue({ error: null });
    await recordFunnelEvent({ from: vi.fn().mockReturnValue({ upsert }) } as any, event!.funnelEvent!);
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ event_name: eventName, properties: { ...properties, ...traffic } }), { onConflict: 'event_id' });
  });
});
