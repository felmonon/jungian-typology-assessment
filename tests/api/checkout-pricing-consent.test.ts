import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler, {
  buildCheckoutSessionParams,
  CHECKOUT_SESSION_EXPIRATION_SECONDS,
  checkoutSessionExpiresAt,
  hasSiteRecoveryEmailConsent,
  RECOVERY_EMAIL_CONSENT_VERSION,
} from '../../api/create-checkout-session';
import { masteryUpgradeAmount } from '../../api/_lib/mastery-upgrade';
import { recordCheckoutIntentStarted } from '../../api/_lib/checkout-intents';
import {
  AUTO_APPLIED_PERCENT_OFF,
  checkoutPriceLabel,
  discountedAmount,
  discountedPriceLabel,
  discountSavingsAmount,
} from '../../data/discount';
import { MASTERY_UPGRADE_DELTA_AMOUNT, PRICING } from '../../data/pricing';

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

const response = () => {
  const res: any = { statusCode: 200, body: null };
  res.status = (status: number) => { res.statusCode = status; return res; };
  res.json = (body: unknown) => { res.body = body; return res; };
  res.setHeader = vi.fn();
  return res;
};

const createCheckout = async (body: Record<string, unknown>) => {
  const res = response();
  await handler({ method: 'POST', headers: { origin: 'https://typejung.com' }, body } as any, res);
  expect(res.statusCode).toBe(200);
  const call = vi.mocked(fetch).mock.calls.find(([url]) => url === 'https://api.stripe.com/v1/checkout/sessions');
  expect(call).toBeDefined();
  return { res, params: new URLSearchParams(String(call![1]!.body)) };
};

const baseParams = {
  baseUrl: 'https://typejung.com',
  checkoutSource: 'checkout_review',
  expiresAt: 1_900_000_000,
  checkoutEmailSource: 'none',
  siteRecoveryEmailConsent: false,
  includeStripePromotionConsent: true,
} as const;

describe('list prices', () => {
  it('charges CA$7 for Insight and CA$19 for Mastery with no automatic discount', () => {
    expect(PRICING.insight).toMatchObject({ amount: 7, price: 'CA$7', currency: 'CAD' });
    expect(PRICING.mastery).toMatchObject({ amount: 19, price: 'CA$19', currency: 'CAD' });
    expect(AUTO_APPLIED_PERCENT_OFF).toBe(0);
    for (const tier of ['insight', 'mastery'] as const) {
      expect(checkoutPriceLabel(PRICING[tier].amount)).toBe(PRICING[tier].price);
      // Deprecated names still used by other pages must show what Stripe charges.
      expect(discountedPriceLabel(PRICING[tier].amount)).toBe(PRICING[tier].price);
      expect(discountedAmount(PRICING[tier].amount)).toBe(PRICING[tier].amount);
      expect(discountSavingsAmount(PRICING[tier].amount)).toBe(0);
    }
  });

  it('charges the CA$12 difference for an Insight to Mastery upgrade', () => {
    expect(MASTERY_UPGRADE_DELTA_AMOUNT).toBe(12);
    expect(masteryUpgradeAmount()).toBe(MASTERY_UPGRADE_DELTA_AMOUNT);
  });

  it.each([['insight', '700'], ['mastery', '1900']] as const)('sends %s to Stripe at %s cents and accepts typed codes', (tier, cents) => {
    const params = buildCheckoutSessionParams({ ...baseParams, tier });
    expect(params.get('line_items[0][price_data][unit_amount]')).toBe(cents);
    expect(params.get('line_items[0][price_data][currency]')).toBe('cad');
    expect(params.get('metadata[amount_cad]')).toBe(String(PRICING[tier].amount));
    expect(params.get('allow_promotion_codes')).toBe('true');
    expect(params.get('after_expiration[recovery][allow_promotion_codes]')).toBe('true');
    expect([...params.keys()].some((key) => key.startsWith('discounts'))).toBe(false);
    expect(params.has('metadata[discount_code]')).toBe(false);
  });
});

describe('checkout handler', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset().mockImplementation(async (url) => {
      if (String(url).startsWith('https://api.stripe.com/v1/customers')) {
        return { ok: true, json: async () => ({ data: [] }) } as Response;
      }
      return {
        ok: true,
        json: async () => ({ id: 'cs_fixture', url: 'https://checkout.stripe.com/c/pay/cs_fixture', amount_total: 1900, currency: 'cad' }),
      } as Response;
    });
  });

  it('never looks up or pre-applies a promotion code', async () => {
    const { params } = await createCheckout({ tier: 'mastery', source: 'pricing_tier_card' });
    const urls = vi.mocked(fetch).mock.calls.map(([url]) => String(url));
    expect(urls.some((url) => url.includes('promotion_codes'))).toBe(false);
    expect(params.get('line_items[0][price_data][unit_amount]')).toBe('1900');
    expect(params.has('discounts[0][promotion_code]')).toBe(false);
    expect(vi.mocked(recordCheckoutIntentStarted).mock.calls[0][1].amountCents).toBe(1900);
  });

  it('records site consent, its wording version and time only when ticked with an email', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-18T12:00:00.000Z'));
    try {
      const { params, res } = await createCheckout({
        tier: 'insight', source: 'checkout_review', customerEmail: ' Reader@Example.com ', recoveryEmailOptIn: true,
      });
      expect(params.get('customer_email')).toBe('reader@example.com');
      expect(params.get('metadata[recovery_email_consent]')).toBe('site_opt_in');
      expect(params.get('payment_intent_data[metadata][recovery_email_consent]')).toBe('site_opt_in');
      expect(params.get('metadata[recovery_email_consent_version]')).toBe(RECOVERY_EMAIL_CONSENT_VERSION);
      expect(params.get('metadata[recovery_email_consent_at]')).toBe('2026-11-18T12:00:00.000Z');
      expect(params.get('expires_at')).toBe(String(Date.parse('2026-11-18T13:00:00.000Z') / 1000));
      expect(res.body.expiresAt).toBe(Date.parse('2026-11-18T13:00:00.000Z') / 1000);
      expect(vi.mocked(recordCheckoutIntentStarted).mock.calls[0][1].recoveryEmailConsent).toBe('site_opt_in');
    } finally {
      vi.useRealTimers();
    }
  });

  it.each([
    ['unticked', { customerEmail: 'reader@example.com', recoveryEmailOptIn: false }],
    ['ticked without an email', { recoveryEmailOptIn: true }],
    ['a truthy non-boolean', { customerEmail: 'reader@example.com', recoveryEmailOptIn: 'true' }],
  ])('does not record consent when %s', async (_label, body) => {
    const { params } = await createCheckout({ tier: 'insight', source: 'checkout_review', ...body });
    expect(params.get('metadata[recovery_email_consent]')).toBe('none');
    expect(params.has('metadata[recovery_email_consent_version]')).toBe(false);
    expect(params.has('metadata[recovery_email_consent_at]')).toBe(false);
  });
});

describe('site recovery consent rule', () => {
  it('needs an explicit true and an email', () => {
    expect(hasSiteRecoveryEmailConsent(true, 'reader@example.com')).toBe(true);
    expect(hasSiteRecoveryEmailConsent(true, null)).toBe(false);
    expect(hasSiteRecoveryEmailConsent(false, 'reader@example.com')).toBe(false);
    expect(hasSiteRecoveryEmailConsent('on', 'reader@example.com')).toBe(false);
    expect(hasSiteRecoveryEmailConsent(undefined, 'reader@example.com')).toBe(false);
  });
});

describe('checkout session expiry', () => {
  it('expires about an hour after creation, inside Stripe limits', () => {
    expect(CHECKOUT_SESSION_EXPIRATION_SECONDS).toBe(60 * 60);
    expect(CHECKOUT_SESSION_EXPIRATION_SECONDS).toBeGreaterThanOrEqual(30 * 60);
    expect(CHECKOUT_SESSION_EXPIRATION_SECONDS).toBeLessThanOrEqual(24 * 60 * 60);
    const now = Date.parse('2026-11-18T12:00:00.000Z');
    expect(checkoutSessionExpiresAt(now) - now / 1000).toBe(3600);
    const params = buildCheckoutSessionParams({ ...baseParams, tier: 'insight', expiresAt: checkoutSessionExpiresAt(now) });
    expect(params.get('expires_at')).toBe(String(now / 1000 + 3600));
    expect(params.get('after_expiration[recovery][enabled]')).toBe('true');
  });
});
