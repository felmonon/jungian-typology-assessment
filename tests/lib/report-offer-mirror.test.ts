import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setAnalyticsEnabled, trackEvent } from '../../lib/analytics';
import { normalizeAnalyticsEvent } from '../../api/_lib/analytics-event';
import { recordFunnelEvent } from '../../api/_lib/funnel-events';

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));
vi.mock('@vercel/analytics/server', () => ({ track: vi.fn() }));

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

  it.each([
    ['result_report_sample_explored', { topic: 'stress', source: 'results_locked_preview', tier: 'insight' }],
    ['results_direct_checkout_failed', { reason: 'checkout_unavailable', source: 'results_locked_preview', tier: 'insight' }],
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
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ event_name: eventName, properties }), { onConflict: 'event_id' });
  });
});
