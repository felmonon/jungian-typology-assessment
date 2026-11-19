import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsEvents, setAnalyticsEnabled, trackEvent } from '../../lib/analytics';
import { normalizeAnalyticsEvent } from '../../api/_lib/analytics-event';
import { isFunnelEventName, recordFunnelEvent } from '../../api/_lib/funnel-events';
import { reportPreviewOfferProperties } from '../../lib/report-preview-variant';

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));
vi.mock('@vercel/analytics/server', () => ({ track: vi.fn() }));
vi.mock('../../lib/traffic-attribution', () => ({ trafficAttributionParams: () => ({}) }));

// Event names as the pages really send them (Assessment, Checkout, Results,
// SharePage, CheckoutSuccess). An event missing from either allow-list is
// dropped silently behind a 202.
const NEWLY_MIRRORED = [
  'result_report_preview_status',
  'paid_offer_clicked',
  'assessment_section_completed',
  'stripe_checkout_returned_without_payment',
  'checkout_recovery_lead_captured',
  'checkout_recovery_lead_failed',
  'checkout_recovery_path_saved',
  'checkout_recovery_email_opted_in',
  'checkout_recovery_email_skipped',
  'result_referral_prompt_viewed',
  'result_compare_link_created',
  'result_compare_link_failed',
  'assessment_invite_shared',
  'inbound_shared_result_prompt_viewed',
  'inbound_shared_result_reply_copied',
  'inbound_shared_result_original_opened',
  'shared_result_viewed',
  'shared_result_cta_clicked',
  'post_purchase_referral_prompt_viewed',
  'post_purchase_share_link_created',
  'post_purchase_referral_copied',
];

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

async function persisted() {
  const [, request] = vi.mocked(fetch).mock.calls[0];
  const event = normalizeAnalyticsEvent(JSON.parse(request!.body as string));
  expect(event?.funnelEvent).toBeDefined();
  const upsert = vi.fn().mockResolvedValue({ error: null });
  await recordFunnelEvent({ from: vi.fn().mockReturnValue({ upsert }) } as any, event!.funnelEvent!);
  expect(upsert).toHaveBeenCalledTimes(1);
  return upsert.mock.calls[0][0];
}

describe('report-tab A/B properties reach funnel_events', () => {
  it.each(['result_report_opened', 'result_upgrade_prompt_viewed', 'results_unlock_clicked'])(
    'keeps offer_version and offer_variant on %s',
    async (eventName) => {
      trackEvent(eventName, { source: 'results_report_preview', tier: 'insight', ...reportPreviewOfferProperties('preview_v2') });
      const row = await persisted();
      expect(row).toMatchObject({
        event_name: eventName,
        properties: expect.objectContaining({ offer_version: 'report-preview-v2', offer_variant: 'preview_v2' }),
      });
    },
  );
});

describe('newly mirrored events', () => {
  it.each(NEWLY_MIRRORED)('%s is in the server allow-list', (eventName) => {
    expect(isFunnelEventName(eventName)).toBe(true);
  });

  it.each(NEWLY_MIRRORED)('%s is mirrored by the browser and stored', async (eventName) => {
    trackEvent(eventName, { source: 'test_source', tier: 'insight' });
    expect(fetch).toHaveBeenCalledTimes(1);
    const row = await persisted();
    expect(row.event_name).toBe(eventName);
  });

  it('stores paid_offer_clicked with its placement, tier and price', async () => {
    AnalyticsEvents.paidOfferClicked('sample_report', 'insight', '/checkout/insight?source=sample_report', { value: 10, currency: 'CAD' });
    const row = await persisted();
    expect(row).toMatchObject({
      event_name: 'paid_offer_clicked',
      source: 'sample_report',
      tier: 'insight',
      value: 10,
      currency: 'CAD',
      properties: expect.objectContaining({ placement: 'sample_report', destination: '/checkout/insight?source=sample_report' }),
    });
  });
});
