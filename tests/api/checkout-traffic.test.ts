import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../../api/create-checkout-session';
import { checkoutAttributionEventParams } from '../../api/webhook';
import { recordFunnelEvent } from '../../api/_lib/funnel-events';
import { schemas } from '../../server/middleware/validate';

vi.mock('@vercel/analytics/server', () => ({ track: vi.fn().mockResolvedValue(undefined) }));
vi.mock('../../api/_lib/auth-utils', () => ({ getSessionUserFromCookie: vi.fn().mockResolvedValue(null) }));
vi.mock('../../api/_lib/supabase', () => ({
  hasSupabaseAdminConfig: () => true,
  getSupabaseAdminClient: () => ({}),
}));
vi.mock('../../api/_lib/checkout-intents', () => ({
  recordCheckoutIntentStarted: vi.fn().mockResolvedValue('intent_fixture'),
  markCheckoutIntentStripeCreated: vi.fn().mockResolvedValue(undefined),
  markCheckoutIntentStripeFailed: vi.fn().mockResolvedValue(undefined),
  markCheckoutIntentExpired: vi.fn(),
}));
vi.mock('../../api/_lib/funnel-events', () => ({ recordFunnelEvent: vi.fn() }));
vi.mock('../../api/_lib/report-availability', () => ({ guardPaidReportCheckout: vi.fn().mockResolvedValue(true) }));
vi.mock('../../api/_lib/rate-limit', () => ({ enforceRateLimit: vi.fn(() => false) }));
vi.mock('../../server/checkout', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../server/checkout')>(),
  getAutoPromotionCode: () => null,
}));

const traffic = {
  traffic_attribution_version: '1',
  traffic_source_kind: 'utm',
  traffic_source: 'google',
  traffic_referrer_host: 'google.com',
  traffic_medium: 'organic',
  traffic_campaign: 'autumn_2026',
  traffic_landing_path: '/inferior-function-test',
  traffic_captured_at: '2026-10-27T12:00:00.000Z',
};

const response = () => {
  const res: any = { statusCode: 200, body: null };
  res.status = (status: number) => { res.statusCode = status; return res; };
  res.json = (body: unknown) => { res.body = body; return res; };
  res.setHeader = vi.fn();
  return res;
};

const createCheckout = async (trafficAttribution?: unknown) => {
  const res = response();
  await handler({
    method: 'POST',
    headers: { origin: 'https://typejung.com' },
    body: {
      tier: 'insight', source: 'results_locked_preview', anonymousId: 'fixture_browser',
      attribution: { source: 'seo_inferior_function_test_hero' },
      trafficAttribution,
    },
  } as any, res);
  expect(res.statusCode).toBe(200);
  const call = vi.mocked(fetch).mock.calls.find(([url]) => url === 'https://api.stripe.com/v1/checkout/sessions');
  expect(call).toBeDefined();
  return new URLSearchParams(String(call![1]!.body));
};

describe('checkout traffic snapshot', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'cs_fixture', url: 'https://checkout.stripe.com/c/pay/cs_fixture', amount_total: 700, currency: 'cad' }),
    } as Response);
  });

  it('preserves external traffic through Stripe and server events independently of internal CTA source', async () => {
    const params = await createCheckout({ ...traffic, source: 'forged_internal_source', product: 'forged_product', raw_url: 'https://example.com/private' });
    expect(params.get('metadata[source]')).toBe('results_locked_preview');
    expect(params.get('metadata[acquisition_source]')).toBe('seo_inferior_function_test_hero');
    expect(params.get('metadata[product]')).toBe('typejung_premium');
    for (const [key, value] of Object.entries(traffic)) {
      expect(params.get(`metadata[${key}]`)).toBe(value);
      expect(params.get(`payment_intent_data[metadata][${key}]`)).toBe(value);
    }
    expect(params.has('metadata[raw_url]')).toBe(false);
    expect(recordFunnelEvent).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      eventName: 'checkout_session_created',
      properties: expect.objectContaining({ ...traffic, acquisition_source: 'seo_inferior_function_test_hero' }),
    }));

    const metadata = Object.fromEntries([...params.entries()].flatMap(([key, value]) => {
      const match = /^metadata\[([^\]]+)\]$/.exec(key);
      return match ? [[match[1], value]] : [];
    }));
    const purchaseProperties = checkoutAttributionEventParams({ metadata });
    expect(purchaseProperties).toMatchObject(traffic);
    expect(purchaseProperties.acquisition_source).toBe('seo_inferior_function_test_hero');
  });

  it.each([undefined, { ...traffic, traffic_source: 'buyer@example.com' }])('does not invent source data for missing or rejected snapshots', async snapshot => {
    const params = await createCheckout(snapshot);
    expect([...params.keys()].filter(key => key.includes('traffic_'))).toEqual([]);
    const properties = vi.mocked(recordFunnelEvent).mock.calls[0][1].properties!;
    expect(Object.keys(properties).filter(key => key.startsWith('traffic_'))).toEqual([]);
  });

  it('drops unsafe optional metadata at checkout and on historical webhook reads', async () => {
    const snapshot = { ...traffic, traffic_campaign: 'buyer@example.com', traffic_referrer_host: 'https://google.com/?private=value' };
    const params = await createCheckout(snapshot);
    expect(params.has('metadata[traffic_campaign]')).toBe(false);
    expect(params.has('metadata[traffic_referrer_host]')).toBe(false);
    const properties = checkoutAttributionEventParams({ metadata: snapshot });
    expect(properties).not.toHaveProperty('traffic_campaign');
    expect(properties).not.toHaveProperty('traffic_referrer_host');
    expect(properties.traffic_source).toBe('google');
    expect(checkoutAttributionEventParams({ metadata: null })).not.toHaveProperty('traffic_source');
  });

  it('keeps the same sanitized snapshot through Express request validation', () => {
    const parsed = schemas.checkoutSession.parse({ tier: 'insight', trafficAttribution: { ...traffic, email: 'buyer@example.com' } });
    expect(parsed.trafficAttribution).toEqual(traffic);
    expect(schemas.checkoutSession.parse({ tier: 'insight' }).trafficAttribution).toEqual({});
  });
});
