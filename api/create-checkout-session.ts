import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSessionUserFromCookie } from './_lib/auth-utils.js';
import { enforceRateLimit } from './_lib/rate-limit.js';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from './_lib/supabase.js';
import { getStripeSecretKey, parsePaidTier, resolveCheckoutBaseUrl } from '../server/checkout.js';
import { PRICING } from '../data/pricing.js';
import type { PaidTierId } from '../data/pricing.js';

const CHECKOUT_PRODUCT_COPY: Record<PaidTierId, { name: string; description: string }> = {
  insight: {
    name: 'TypeJung Insight Package',
    description: 'Deep TypeJung report with developmental edge analysis, stress patterns, relationship triggers, and somatic practice guidance.',
  },
  mastery: {
    name: 'TypeJung Mastery Package',
    description: 'Complete TypeJung experience with the deep report, AI Type Coach, tailored growth exercises, and individuation practice support.',
  },
};

function cleanCheckoutSource(source: unknown): string {
  return typeof source === 'string' && source.trim()
    ? source.trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80)
    : 'unknown';
}

async function getCheckoutCustomerEmail(req: VercelRequest): Promise<string | null> {
  if (!hasSupabaseAdminConfig()) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const user = await getSessionUserFromCookie(req.headers.cookie, supabase);
  return user?.email || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (enforceRateLimit(req, res, {
    keyPrefix: 'checkout:create-session',
    limit: 12,
    windowMs: 60 * 60 * 1000,
    message: 'Too many checkout attempts. Please wait and try again.',
  })) return;

  try {
    const stripeSecretKey = getStripeSecretKey();
    if (!stripeSecretKey) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const resolvedTier = parsePaidTier(req.body?.tier);

    if (!resolvedTier) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    const baseUrl = resolveCheckoutBaseUrl(req.headers.origin, req.headers.host);
    const customerEmail = await getCheckoutCustomerEmail(req);
    const tierPricing = PRICING[resolvedTier];
    const productCopy = CHECKOUT_PRODUCT_COPY[resolvedTier];
    const checkoutSource = cleanCheckoutSource(req.body?.source);
    const checkoutParams = new URLSearchParams({
      'mode': 'payment',
      'payment_method_types[0]': 'card',
      'line_items[0][price_data][currency]': tierPricing.currency.toLowerCase(),
      'line_items[0][price_data][unit_amount]': String(Math.round(tierPricing.amount * 100)),
      'line_items[0][price_data][product_data][name]': productCopy.name,
      'line_items[0][price_data][product_data][description]': productCopy.description,
      'line_items[0][quantity]': '1',
      'allow_promotion_codes': 'true',
      'submit_type': 'pay',
      'success_url': `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url': `${baseUrl}/checkout/${resolvedTier}`,
      'custom_text[after_submit][message]': 'TypeJung paid access is a one-time CAD purchase. No subscription is created.',
      'payment_intent_data[description]': productCopy.name,
      'payment_intent_data[metadata][product]': 'typejung_premium',
      'payment_intent_data[metadata][tier]': resolvedTier,
      'payment_intent_data[metadata][source]': checkoutSource,
      'metadata[product]': 'typejung_premium',
      'metadata[tier]': resolvedTier,
      'metadata[source]': checkoutSource,
      'metadata[amount_cad]': String(tierPricing.amount),
    });

    if (customerEmail) {
      checkoutParams.set('customer_email', customerEmail);
    }

    // Use fetch directly to Stripe API
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: checkoutParams.toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      console.error('Stripe API error:', session);
      return res.status(response.status).json({ error: session.error?.message || 'Stripe error' });
    }

    return res.status(200).json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create checkout session'
    });
  }
}
