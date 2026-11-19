import type { VercelRequest, VercelResponse } from '@vercel/node';
import { track as trackVercelServerEvent } from '@vercel/analytics/server';
import { getSessionUserFromCookie } from './_lib/auth-utils.js';
import {
  markCheckoutIntentStripeCreated,
  markCheckoutIntentStripeFailed,
  recordCheckoutIntentStarted,
} from './_lib/checkout-intents.js';
import { recordFunnelEvent } from './_lib/funnel-events.js';
import { guardPaidReportCheckout } from './_lib/report-availability.js';
import { enforceRateLimit } from './_lib/rate-limit.js';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from './_lib/supabase.js';
import { getStripePaymentMethodConfigurationId, getStripeSecretKey, parsePaidTier, resolveCheckoutBaseUrl } from '../server/checkout.js';
import { amountInCents, PRICING } from '../data/pricing.js';
import type { PaidTierId } from '../data/pricing.js';
import { createDebriefCheckoutSession } from './_lib/debrief-checkout.js';
import { createMasteryUpgradeSession } from './_lib/mastery-upgrade.js';
import { handleResultFitStatsRequest } from './_lib/result-fit-stats.js';
import { sanitizeTrafficAttributionParams } from '../shared/traffic-attribution.js';
import { isResearchBrowserId, RESEARCH_CAMPAIGN, RESEARCH_SOURCE } from '../shared/research-traffic.js';

const CHECKOUT_PRODUCT_COPY: Record<PaidTierId, { name: string; description: string }> = {
  insight: {
    name: 'TypeJung Insight Report',
    description: 'Ten personalized interpretation sections built from your free map: function dynamics, archetypes, grip and recovery, relationships, work, individuation, shadow, growth, and dream reflection, plus the Function Stack in Depth guide (PDF).',
  },
  mastery: {
    name: 'TypeJung Mastery Report',
    description: 'The ten-section Insight report plus the AI Type Guide, tailored growth exercises, and an individuation practice roadmap for working with your result over time.',
  },
};

// Short expiry so the checkout.session.expired webhook, which queues the
// recovery email, fires soon after someone leaves. Stripe's minimum is 30 min.
export const CHECKOUT_SESSION_EXPIRATION_SECONDS = 60 * 60;

// Identifies the consent wording shown next to the checkout email field, so a
// recorded opt-in can be traced to the exact text the buyer agreed to.
export const RECOVERY_EMAIL_CONSENT_VERSION = 'checkout_link_if_unfinished_v1';

export type CheckoutAttribution = {
  source?: string;
  ref?: string;
  utmCampaign?: string;
  utmSource?: string;
  sharedResult?: string;
  parentSource?: string;
  sourceChain?: string;
};

function cleanCheckoutToken(source: unknown, maxLength = 80): string | undefined {
  if (typeof source !== 'string' || !source.trim()) return undefined;

  const cleaned = source
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, maxLength);

  return cleaned || undefined;
}

function cleanCheckoutSource(source: unknown): string {
  return cleanCheckoutToken(source) || 'unknown';
}

function cleanCheckoutSourceChain(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;

  const tokens = value
    .split('>')
    .map((token) => cleanCheckoutToken(token))
    .filter((token): token is string => Boolean(token));
  const uniqueTokens = Array.from(new Set(tokens));
  const cleaned = uniqueTokens.join('>').slice(0, 240);

  return cleaned || undefined;
}

function cleanCheckoutAttribution(value: unknown): CheckoutAttribution {
  if (!value || typeof value !== 'object') return {};

  const input = value as Record<string, unknown>;
  const source = cleanCheckoutToken(input.source);
  const ref = cleanCheckoutToken(input.ref);
  const utmCampaign = cleanCheckoutToken(input.utmCampaign ?? input.utm_campaign);
  const utmSource = cleanCheckoutToken(input.utmSource ?? input.utm_source);
  const sharedResult = cleanCheckoutToken(input.sharedResult ?? input.shared_result);
  const parentSource = cleanCheckoutToken(input.parentSource ?? input.parent_source);
  const sourceChain = cleanCheckoutSourceChain(input.sourceChain ?? input.source_chain);

  return {
    ...(source ? { source } : {}),
    ...(ref ? { ref } : {}),
    ...(utmCampaign ? { utmCampaign } : {}),
    ...(utmSource ? { utmSource } : {}),
    ...(sharedResult ? { sharedResult } : {}),
    ...(parentSource ? { parentSource } : {}),
    ...(sourceChain ? { sourceChain } : {}),
  };
}

function checkoutAttributionMetadata(attribution: CheckoutAttribution): Record<string, string | undefined> {
  return {
    acquisition_source: attribution.source,
    acquisition_ref: attribution.ref,
    utm_campaign: attribution.utmCampaign,
    utm_source: attribution.utmSource,
    shared_result: attribution.sharedResult,
    parent_source: attribution.parentSource,
    source_chain: attribution.sourceChain,
  };
}

function addCheckoutMetadata(params: URLSearchParams, metadata: Record<string, string | undefined>) {
  Object.entries(metadata).forEach(([key, value]) => {
    if (!value) return;
    params.set(`metadata[${key}]`, value);
    params.set(`payment_intent_data[metadata][${key}]`, value);
  });
}

export function applyCheckoutCustomerParams(
  params: URLSearchParams,
  checkoutCustomerEmail?: string,
  stripeCustomerId?: string | null,
) {
  if (stripeCustomerId) {
    params.set('customer', stripeCustomerId);
    return;
  }

  params.set('customer_creation', 'always');

  if (checkoutCustomerEmail) {
    params.set('customer_email', checkoutCustomerEmail);
  }
}

export function buildCheckoutCancelUrl(
  baseUrl: string,
  tier: PaidTierId,
  checkoutSource: string,
  attribution: CheckoutAttribution = {},
): string {
  const url = new URL(`/checkout/${tier}`, baseUrl);
  url.searchParams.set('checkout', 'cancelled');
  url.searchParams.set('source', checkoutSource);

  if (attribution.ref) url.searchParams.set('ref', attribution.ref);
  if (attribution.utmCampaign) url.searchParams.set('utm_campaign', attribution.utmCampaign);
  if (attribution.utmSource) url.searchParams.set('utm_source', attribution.utmSource);
  if (attribution.sharedResult) url.searchParams.set('shared_result', attribution.sharedResult);
  if (attribution.parentSource || attribution.source) {
    url.searchParams.set('parent_source', attribution.parentSource || attribution.source || '');
  }
  if (attribution.sourceChain) url.searchParams.set('source_chain', attribution.sourceChain);

  return url.toString();
}

function cleanCheckoutEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;

  const cleaned = email.trim().toLowerCase();
  if (!cleaned || cleaned.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) return null;
  return cleaned;
}

// Site recovery consent is only the explicit, unticked-by-default checkbox on
// the checkout review. It needs an email to be useful.
export function hasSiteRecoveryEmailConsent(value: unknown, suppliedCustomerEmail: string | null): boolean {
  return value === true && Boolean(suppliedCustomerEmail);
}

function stripePromotionConsentUnsupported(payload: any): boolean {
  const error = payload?.error;
  if (!error) return false;

  const param = typeof error.param === 'string' ? error.param : '';
  const message = typeof error.message === 'string' ? error.message : '';

  return (
    param.includes('consent_collection') ||
    /consent_collection|promotions/i.test(message)
  );
}

function vercelEventProperties(params: Record<string, unknown>): Record<string, string | number | boolean | null> {
  return Object.fromEntries(
    Object.entries(params).flatMap(([key, value]) => {
      if (value === null || typeof value === 'boolean') return [[key, value]];
      if (typeof value === 'number') return Number.isFinite(value) ? [[key, value]] : [];
      if (typeof value === 'string') return [[key, value.slice(0, 500)]];
      return [];
    }),
  ) as Record<string, string | number | boolean | null>;
}

async function trackCheckoutServerEvent(eventName: string, params: Record<string, unknown>) {
  try {
    await trackVercelServerEvent(eventName, vercelEventProperties(params));
  } catch (error) {
    console.warn('Vercel checkout analytics event failed:', eventName, error instanceof Error ? error.message : 'Unknown error');
  }
}

async function findStripeCustomerIdByEmail(
  stripeSecretKey: string,
  customerEmail: string | null,
): Promise<string | null> {
  if (!customerEmail) return null;

  const query = new URLSearchParams({
    email: customerEmail,
    limit: '1',
  });

  const response = await fetch(`https://api.stripe.com/v1/customers?${query.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = payload?.error?.message || response.statusText || 'Stripe customer lookup failed';
    console.warn('Stripe customer lookup failed:', error);
    return null;
  }

  const customerId = payload?.data?.[0]?.id;
  return typeof customerId === 'string' ? customerId : null;
}

async function getCheckoutCustomerEmail(req: VercelRequest): Promise<string | null> {
  if (!hasSupabaseAdminConfig()) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const user = await getSessionUserFromCookie(req.headers.cookie, supabase);
  return user?.email || null;
}

export function checkoutSessionExpiresAt(nowMs = Date.now()): number {
  return Math.floor(nowMs / 1000) + CHECKOUT_SESSION_EXPIRATION_SECONDS;
}

export type CheckoutSessionParamsInput = {
  tier: PaidTierId;
  baseUrl: string;
  checkoutSource: string;
  attribution?: CheckoutAttribution;
  trafficAttribution?: Record<string, string | undefined>;
  expiresAt: number;
  checkoutIntentId?: string | null;
  paymentMethodConfigurationId?: string | null;
  anonymousId?: string | null;
  siteRecoveryEmailConsent: boolean;
  consentRecordedAt?: string;
  checkoutEmailSource: string;
  checkoutCustomerEmail?: string | null;
  stripeCustomerId?: string | null;
  includeStripePromotionConsent: boolean;
};

// Stripe Checkout form params. Charges the list price; promotion codes are
// accepted when typed (TYPEJUNG30 links still work) but none is pre-applied.
export function buildCheckoutSessionParams(input: CheckoutSessionParamsInput): URLSearchParams {
  const tierPricing = PRICING[input.tier];
  const productCopy = CHECKOUT_PRODUCT_COPY[input.tier];
  const attribution = input.attribution || {};
  const recoveryConsent = input.siteRecoveryEmailConsent ? 'site_opt_in' : 'none';
  const cancelUrl = buildCheckoutCancelUrl(input.baseUrl, input.tier, input.checkoutSource, attribution);
  const checkoutParams = new URLSearchParams({
    'mode': 'payment',
    'line_items[0][price_data][currency]': tierPricing.currency.toLowerCase(),
    'line_items[0][price_data][unit_amount]': String(amountInCents(tierPricing.amount)),
    'line_items[0][price_data][product_data][name]': productCopy.name,
    'line_items[0][price_data][product_data][description]': productCopy.description,
    'line_items[0][quantity]': '1',
    'submit_type': 'pay',
    'success_url': `${input.baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    'cancel_url': cancelUrl,
    'expires_at': String(input.expiresAt),
    'after_expiration[recovery][enabled]': 'true',
    'after_expiration[recovery][allow_promotion_codes]': 'true',
    'allow_promotion_codes': 'true',
    'custom_text[after_submit][message]': 'TypeJung paid access is a one-time CAD purchase. No subscription is created.',
    'custom_text[submit][message]': 'One-time CAD purchase. 7-day money-back guarantee if the paid report is not useful.',
    'payment_intent_data[description]': productCopy.name,
    'payment_intent_data[metadata][product]': 'typejung_premium',
    'payment_intent_data[metadata][tier]': input.tier,
    'payment_intent_data[metadata][source]': input.checkoutSource,
    'payment_intent_data[metadata][recovery_email_consent]': recoveryConsent,
    'payment_intent_data[metadata][checkout_email_source]': input.checkoutEmailSource,
    'metadata[product]': 'typejung_premium',
    'metadata[tier]': input.tier,
    'metadata[source]': input.checkoutSource,
    'metadata[amount_cad]': String(tierPricing.amount),
    'metadata[recovery_email_consent]': recoveryConsent,
    'metadata[checkout_email_source]': input.checkoutEmailSource,
  });

  // Proof of the CASL opt-in: which wording and when. No email is stored here.
  if (input.siteRecoveryEmailConsent) {
    addCheckoutMetadata(checkoutParams, {
      recovery_email_consent_version: RECOVERY_EMAIL_CONSENT_VERSION,
      recovery_email_consent_at: input.consentRecordedAt,
    });
  }

  if (input.checkoutIntentId) {
    checkoutParams.set('payment_intent_data[metadata][checkout_intent_id]', input.checkoutIntentId);
    checkoutParams.set('metadata[checkout_intent_id]', input.checkoutIntentId);
  }

  if (input.paymentMethodConfigurationId) {
    checkoutParams.set('payment_method_configuration', input.paymentMethodConfigurationId);
  }

  if (input.anonymousId) {
    checkoutParams.set('payment_intent_data[metadata][anonymous_id]', input.anonymousId);
    checkoutParams.set('metadata[anonymous_id]', input.anonymousId);
  }

  addCheckoutMetadata(checkoutParams, checkoutAttributionMetadata(attribution));
  if (input.trafficAttribution) addCheckoutMetadata(checkoutParams, input.trafficAttribution);

  if (input.includeStripePromotionConsent) {
    checkoutParams.set('consent_collection[promotions]', 'auto');
  }

  applyCheckoutCustomerParams(checkoutParams, input.checkoutCustomerEmail || undefined, input.stripeCustomerId);

  return checkoutParams;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Aggregate "the map fit" share for Pricing and Checkout. Served from this
  // function to stay within the Hobby serverless-function limit.
  if (req.method === 'GET' && req.query?.view === 'result-fit') {
    return handleResultFitStatsRequest(req, res);
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Personal Type Debrief is a separate, human-delivered service. Routed here to
  // stay within the Hobby serverless-function limit; it never grants premium.
  if (req.body?.product === 'debrief') {
    return createDebriefCheckoutSession(req, res);
  }

  // Post-purchase Insight -> Mastery upgrade charges only the price difference.
  if (req.body?.product === 'mastery_upgrade') {
    return createMasteryUpgradeSession(req, res);
  }

  if (enforceRateLimit(req, res, {
    keyPrefix: 'checkout:create-session',
    limit: 12,
    windowMs: 60 * 60 * 1000,
    message: 'Too many checkout attempts. Please wait and try again.',
  })) return;

  let checkoutIntentSupabase: ReturnType<typeof getSupabaseAdminClient> | null = null;
  let checkoutIntentId: string | null = null;

  try {
    const stripeSecretKey = getStripeSecretKey();
    if (!stripeSecretKey) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const resolvedTier = parsePaidTier(req.body?.tier);

    if (!resolvedTier) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    if (!await guardPaidReportCheckout(res, {
      tier: resolvedTier,
      source: cleanCheckoutSource(req.body?.source),
      anonymousId: cleanCheckoutToken(req.body?.anonymousId ?? req.body?.anonymous_id, 160),
    })) return;

    const baseUrl = resolveCheckoutBaseUrl(req.headers.origin, req.headers.host);
    const customerEmail = await getCheckoutCustomerEmail(req);
    const tierPricing = PRICING[resolvedTier];
    const checkoutSource = cleanCheckoutSource(req.body?.source);
    const checkoutAttribution = cleanCheckoutAttribution(req.body?.attribution);
    // A dedicated study browser remains research even if storage/privacy
    // settings removed its UTM snapshot before checkout.
    if (isResearchBrowserId(req.body?.anonymousId ?? req.body?.anonymous_id)) {
      checkoutAttribution.utmSource = RESEARCH_SOURCE;
      checkoutAttribution.utmCampaign = RESEARCH_CAMPAIGN;
    }
    const trafficAttribution = sanitizeTrafficAttributionParams(req.body?.trafficAttribution);
    const suppliedCustomerEmail = cleanCheckoutEmail(req.body?.customerEmail);
    const checkoutCustomerEmail = suppliedCustomerEmail || customerEmail;
    const checkoutEmailSource = suppliedCustomerEmail ? 'typed_or_captured' : customerEmail ? 'account' : 'none';
    const siteRecoveryEmailConsent = hasSiteRecoveryEmailConsent(req.body?.recoveryEmailOptIn, checkoutCustomerEmail);
    const stripeCustomerId = await findStripeCustomerIdByEmail(stripeSecretKey, checkoutCustomerEmail);
    const anonymousId = cleanCheckoutToken(req.body?.anonymousId ?? req.body?.anonymous_id, 160);
    const paymentMethodConfigurationId = getStripePaymentMethodConfigurationId();
    const expiresAt = checkoutSessionExpiresAt();
    const consentRecordedAt = siteRecoveryEmailConsent ? new Date().toISOString() : undefined;
    checkoutIntentSupabase = hasSupabaseAdminConfig() ? getSupabaseAdminClient() : null;
    checkoutIntentId = checkoutIntentSupabase
      ? await recordCheckoutIntentStarted(checkoutIntentSupabase, {
        tier: resolvedTier,
        amountCents: amountInCents(tierPricing.amount),
        currency: tierPricing.currency,
        source: checkoutSource,
        attribution: checkoutAttribution,
        checkoutEmailSource,
        hasCustomerEmail: Boolean(checkoutCustomerEmail),
        recoveryEmailConsent: siteRecoveryEmailConsent ? 'site_opt_in' : 'none',
      })
      : null;
    const buildCheckoutParams = (includeStripePromotionConsent: boolean) => buildCheckoutSessionParams({
      tier: resolvedTier,
      baseUrl,
      checkoutSource,
      attribution: checkoutAttribution,
      trafficAttribution,
      expiresAt,
      checkoutIntentId,
      paymentMethodConfigurationId,
      anonymousId,
      siteRecoveryEmailConsent,
      consentRecordedAt,
      checkoutEmailSource,
      checkoutCustomerEmail,
      stripeCustomerId,
      includeStripePromotionConsent,
    });

    const createStripeSession = async (includeStripePromotionConsent: boolean) => {
      const checkoutParams = buildCheckoutParams(includeStripePromotionConsent);

      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: checkoutParams.toString(),
      });

      const session = await response.json();
      return { response, session };
    };

    let stripePromotionConsentFallbackUsed = false;
    let { response, session } = await createStripeSession(true);

    if (!response.ok && response.status === 400 && stripePromotionConsentUnsupported(session)) {
      console.warn('Stripe promotion consent collection unavailable; retrying checkout without consent_collection[promotions].');
      stripePromotionConsentFallbackUsed = true;
      ({ response, session } = await createStripeSession(false));
    }

    if (!response.ok) {
      console.error('Stripe API error:', session);
      if (checkoutIntentSupabase && checkoutIntentId) {
        await markCheckoutIntentStripeFailed(
          checkoutIntentSupabase,
          checkoutIntentId,
          session.error?.message || response.statusText || 'Stripe error',
        );
      }
      return res.status(response.status).json({ error: session.error?.message || 'Stripe error' });
    }

    if (checkoutIntentSupabase && checkoutIntentId && typeof session.id === 'string') {
      await markCheckoutIntentStripeCreated(checkoutIntentSupabase, checkoutIntentId, {
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        expires_at: session.expires_at || expiresAt,
        payment_status: session.payment_status,
        status: session.status,
      });
    }

    if (checkoutIntentSupabase && typeof session.id === 'string') {
      try {
        await recordFunnelEvent(checkoutIntentSupabase, {
          eventId: `checkout_session_created:${session.id}`,
          eventName: 'checkout_session_created',
          anonymousId,
          source: checkoutSource,
          tier: resolvedTier,
          checkoutIntentId,
          stripeSessionId: session.id,
          value: typeof session.amount_total === 'number' ? session.amount_total / 100 : tierPricing.amount,
          currency: typeof session.currency === 'string' ? session.currency.toUpperCase() : tierPricing.currency,
          properties: {
            ...trafficAttribution,
            acquisition_source: checkoutAttribution.source || 'unknown',
            acquisition_ref: checkoutAttribution.ref || 'unknown',
            utm_campaign: checkoutAttribution.utmCampaign || 'unknown',
            utm_source: checkoutAttribution.utmSource || 'unknown',
            shared_result: checkoutAttribution.sharedResult || 'none',
            parent_source: checkoutAttribution.parentSource || 'none',
            source_chain: checkoutAttribution.sourceChain || 'none',
            has_customer_email: Boolean(checkoutCustomerEmail),
            stripe_customer_reused: Boolean(stripeCustomerId),
            site_recovery_email_consent: siteRecoveryEmailConsent,
            checkout_email_source: checkoutEmailSource,
            discount_auto_applied: false,
          },
        });
      } catch (funnelError) {
        console.warn('Checkout funnel event insert failed:', funnelError instanceof Error ? funnelError.message : 'Unknown error');
      }
    }

    void trackCheckoutServerEvent('server_checkout_session_created', {
      ...trafficAttribution,
      tier: resolvedTier,
      source: checkoutSource,
      acquisition_source: checkoutAttribution.source || 'unknown',
      acquisition_ref: checkoutAttribution.ref || 'unknown',
      utm_campaign: checkoutAttribution.utmCampaign || 'unknown',
      utm_source: checkoutAttribution.utmSource || 'unknown',
      shared_result: checkoutAttribution.sharedResult || 'none',
      parent_source: checkoutAttribution.parentSource || 'none',
      source_chain: checkoutAttribution.sourceChain || 'none',
      amount_cad: tierPricing.amount,
      site_recovery_email_consent: siteRecoveryEmailConsent,
      checkout_email_source: checkoutEmailSource,
      stripe_customer_reused: Boolean(stripeCustomerId),
      stripe_promotion_consent_requested: true,
      stripe_promotion_consent_fallback_used: stripePromotionConsentFallbackUsed,
      discount_auto_applied: false,
      checkout_intent_recorded: Boolean(checkoutIntentId),
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      expiresAt: session.expires_at || expiresAt,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    if (checkoutIntentSupabase && checkoutIntentId) {
      await markCheckoutIntentStripeFailed(
        checkoutIntentSupabase,
        checkoutIntentId,
        error?.message || 'Failed to create checkout session',
      );
    }
    return res.status(500).json({
      error: error.message || 'Failed to create checkout session'
    });
  }
}
