import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSessionUserFromCookie } from './auth-utils.js';
import { getCheckoutSessionAccess, isUserEmailVerified } from './purchases.js';
import { enforceSharedRateLimit } from './rate-limit.js';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from './supabase.js';
import {
  getStripePaymentMethodConfigurationId,
  getStripeSecretKey,
  resolveCheckoutBaseUrl,
} from '../../server/checkout.js';
import { PRICING } from '../../data/pricing.js';
import { discountedAmount, formatCadAmount } from '../../data/discount.js';
import { guardPaidReportCheckout } from './report-availability.js';

const CHECKOUT_SESSION_EXPIRATION_SECONDS = 60 * 60;

// Post-purchase upgrade: an Insight buyer pays only the difference to Mastery.
// Charged as a one-time delta of the list prices (no promotion code) and recorded as a Mastery purchase so premium status,
// which reads the most recent completed purchase, reflects the upgrade.
export const masteryUpgradeAmount = () =>
  Math.round((discountedAmount(PRICING.mastery.amount) - discountedAmount(PRICING.insight.amount)) * 100) / 100;

function cleanEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().toLowerCase();
  if (!cleaned || cleaned.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) return null;
  return cleaned;
}

function cleanToken(value: unknown, max = 80): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').slice(0, max) || undefined;
}

const CHECKOUT_SESSION_ID_PATTERN = /^cs_[A-Za-z0-9_]+$/;

function cleanCheckoutSessionId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length <= 255 && CHECKOUT_SESSION_ID_PATTERN.test(trimmed) ? trimmed : null;
}

type InsightOwnership = { owned: true; customerEmail: string | null } | { owned: false };

async function findAccountInsightPurchase(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null },
): Promise<InsightOwnership> {
  const { data: byUser, error } = await supabase
    .from('purchases')
    .select('id, customer_email')
    .eq('user_id', user.id)
    .eq('tier', 'insight')
    .eq('status', 'completed')
    .limit(1);
  if (error) throw error;
  if (byUser?.[0]) return { owned: true, customerEmail: byUser[0].customer_email || null };

  // Guest purchases count only for an account whose email a provider verified.
  const { data: accounts, error: accountError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .limit(1);
  if (accountError) throw accountError;
  const account = accounts?.[0];
  const email = typeof account?.email === 'string' ? account.email.trim().toLowerCase() : '';
  if (!email || !isUserEmailVerified(account)) return { owned: false };

  const { data: byEmail, error: emailError } = await supabase
    .from('purchases')
    .select('id, customer_email')
    .eq('customer_email', email)
    .eq('tier', 'insight')
    .eq('status', 'completed')
    .limit(1);
  if (emailError) throw emailError;
  return byEmail?.[0] ? { owned: true, customerEmail: email } : { owned: false };
}

async function findSessionInsightPurchase(
  supabase: SupabaseClient,
  sessionId: string,
  user: { id: string } | null,
  stripeSecretKey: string,
): Promise<InsightOwnership> {
  const access = await getCheckoutSessionAccess(supabase, sessionId, user);
  if (access.state === 'revoked' || access.state === 'other_account') return { owned: false };
  if (access.state === 'entitled') {
    return access.purchase.tier === 'insight' && access.purchase.status === 'completed'
      ? { owned: true, customerEmail: access.purchase.customer_email || null }
      : { owned: false };
  }

  // Not recorded yet (webhook still in flight): confirm with Stripe directly.
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${stripeSecretKey}` },
  });
  if (!response.ok) return { owned: false };
  const session = await response.json();
  const isInsight = session?.payment_status === 'paid'
    && session?.metadata?.product === 'typejung_premium'
    && session?.metadata?.tier === 'insight';
  if (!isInsight) return { owned: false };
  const email = session.customer_details?.email;
  return { owned: true, customerEmail: typeof email === 'string' ? email.trim().toLowerCase() : null };
}

// The upgrade price is only for buyers who already own Insight: a signed-in
// account with a completed Insight purchase, or the Stripe session of a
// completed, non-refunded Insight checkout.
async function resolveInsightOwnership(req: VercelRequest, stripeSecretKey: string): Promise<InsightOwnership> {
  if (!hasSupabaseAdminConfig()) return { owned: false };
  const supabase = getSupabaseAdminClient();
  const user = await getSessionUserFromCookie(req.headers.cookie, supabase);

  if (user?.id) {
    const owned = await findAccountInsightPurchase(supabase, user);
    if (owned.owned) return owned;
  }

  const sessionId = cleanCheckoutSessionId(
    req.body?.checkoutSessionId ?? req.body?.sessionId ?? req.body?.session_id,
  );
  if (!sessionId) return { owned: false };
  return findSessionInsightPurchase(supabase, sessionId, user?.id ? { id: user.id } : null, stripeSecretKey);
}

export async function createMasteryUpgradeSession(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (await enforceSharedRateLimit(req, res, {
    keyPrefix: 'checkout:mastery-upgrade',
    limit: 10,
    windowMs: 60 * 60 * 1000,
    message: 'Too many upgrade attempts. Please wait and try again.',
  })) return;

  try {
    const stripeSecretKey = getStripeSecretKey();
    if (!stripeSecretKey) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    if (!await guardPaidReportCheckout(res, {
      tier: 'mastery',
      source: cleanToken(req.body?.source) || 'success_upsell',
      anonymousId: cleanToken(req.body?.anonymousId ?? req.body?.anonymous_id, 160),
    })) return;

    const ownership = await resolveInsightOwnership(req, stripeSecretKey);
    if (!ownership.owned) {
      return res.status(403).json({ error: 'The upgrade price is for Insight owners. Sign in or use the link from your Insight purchase.' });
    }

    const customerEmail = cleanEmail(ownership.customerEmail) || cleanEmail(req.body?.email ?? req.body?.customerEmail);
    const source = cleanToken(req.body?.source) || 'success_upsell';
    const amount = masteryUpgradeAmount();
    const baseUrl = resolveCheckoutBaseUrl(req.headers.origin, req.headers.host);
    const expiresAt = Math.floor(Date.now() / 1000) + CHECKOUT_SESSION_EXPIRATION_SECONDS;
    const paymentMethodConfigurationId = getStripePaymentMethodConfigurationId();

    const metadata: Record<string, string> = {
      product: 'typejung_premium',
      tier: 'mastery',
      upgrade: 'insight_to_mastery',
      amount_cad: String(amount),
      source,
    };

    const params = new URLSearchParams({
      'mode': 'payment',
      'line_items[0][price_data][currency]': PRICING.mastery.currency.toLowerCase(),
      'line_items[0][price_data][unit_amount]': String(Math.round(amount * 100)),
      'line_items[0][price_data][product_data][name]': 'TypeJung Mastery Upgrade',
      'line_items[0][price_data][product_data][description]': 'Upgrade from Insight to Mastery: AI Type Guide, individuation roadmap, growth exercises, and practice support.',
      'line_items[0][quantity]': '1',
      'submit_type': 'pay',
      'success_url': `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url': `${baseUrl}/results`,
      'expires_at': String(expiresAt),
      'custom_text[submit][message]': 'One-time CAD upgrade to Mastery. No subscription.',
      'payment_intent_data[description]': 'TypeJung Mastery Upgrade',
    });

    Object.entries(metadata).forEach(([key, value]) => {
      if (!value) return;
      params.set(`metadata[${key}]`, value);
      params.set(`payment_intent_data[metadata][${key}]`, value);
    });

    if (customerEmail) {
      params.set('customer_email', customerEmail);
      params.set('customer_creation', 'always');
    }
    if (paymentMethodConfigurationId) {
      params.set('payment_method_configuration', paymentMethodConfigurationId);
    }

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await response.json();
    if (!response.ok) {
      console.error('Stripe mastery upgrade error:', response.status, session?.error?.code || session?.error?.type || 'unknown');
      return res.status(502).json({ error: 'Could not start the upgrade. Please try again.' });
    }

    return res.status(200).json({ sessionId: session.id, url: session.url, expiresAt: session.expires_at || expiresAt });
  } catch (error) {
    console.error('Mastery upgrade error:', error instanceof Error ? error.message : 'unknown');
    return res.status(500).json({ error: 'Failed to create upgrade session' });
  }
}
