import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSessionUserFromCookie } from './_lib/auth-utils.js';
import { enforceRateLimit } from './_lib/rate-limit.js';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from './_lib/supabase.js';
import {
  getStripePaymentMethodConfigurationId,
  getStripeSecretKey,
  resolveCheckoutBaseUrl,
} from '../server/checkout.js';
import { DEBRIEF_FIELD_MAX, DEBRIEF_OFFER } from '../data/debrief.js';

const CHECKOUT_SESSION_EXPIRATION_SECONDS = 24 * 60 * 60;

function cleanField(value: unknown, max = DEBRIEF_FIELD_MAX): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, max);
}

function cleanEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().toLowerCase();
  if (!cleaned || cleaned.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) return null;
  return cleaned;
}

function randomRequestId(): string {
  return `dbr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (enforceRateLimit(req, res, {
    keyPrefix: 'checkout:create-debrief',
    limit: 8,
    windowMs: 60 * 60 * 1000,
    message: 'Too many debrief requests. Please wait and try again.',
  })) return;

  try {
    const stripeSecretKey = getStripeSecretKey();
    if (!stripeSecretKey) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const customerEmail = cleanEmail(req.body?.email);
    if (!customerEmail) {
      return res.status(400).json({ error: 'A valid email is required for delivery.' });
    }

    const intake = {
      email: customerEmail,
      resultSummary: cleanField(req.body?.resultSummary),
      testedAs: cleanField(req.body?.testedAs),
      stuckBetween: cleanField(req.body?.stuckBetween),
      feltAccurate: cleanField(req.body?.feltAccurate),
      feltConfusing: cleanField(req.body?.feltConfusing),
    };
    const source = cleanField(req.body?.source, 80) || 'debrief_page';
    const requestId = randomRequestId();

    // Best-effort record so the founder has the full intake even if the
    // notification email is delayed. Tolerates a missing table.
    if (hasSupabaseAdminConfig()) {
      try {
        const supabase = getSupabaseAdminClient();
        const sessionUser = await getSessionUserFromCookie(req.headers.cookie, supabase);
        await supabase.from('debrief_requests').insert({
          request_id: requestId,
          user_id: sessionUser?.id || null,
          email: intake.email,
          result_summary: intake.resultSummary,
          tested_as: intake.testedAs,
          stuck_between: intake.stuckBetween,
          felt_accurate: intake.feltAccurate,
          felt_confusing: intake.feltConfusing,
          source,
          status: 'started',
        });
      } catch (storeError) {
        console.warn('Debrief request store skipped:', storeError instanceof Error ? storeError.message : 'unknown');
      }
    }

    const baseUrl = resolveCheckoutBaseUrl(req.headers.origin, req.headers.host);
    const expiresAt = Math.floor(Date.now() / 1000) + CHECKOUT_SESSION_EXPIRATION_SECONDS;
    const paymentMethodConfigurationId = getStripePaymentMethodConfigurationId();

    const metadata: Record<string, string> = {
      product: DEBRIEF_OFFER.productTag,
      debrief_request_id: requestId,
      debrief_email: intake.email,
      debrief_result_summary: intake.resultSummary,
      debrief_tested_as: intake.testedAs,
      debrief_stuck_between: intake.stuckBetween,
      debrief_felt_accurate: intake.feltAccurate,
      debrief_felt_confusing: intake.feltConfusing,
      source,
    };

    const params = new URLSearchParams({
      'mode': 'payment',
      'line_items[0][price_data][currency]': DEBRIEF_OFFER.currency.toLowerCase(),
      'line_items[0][price_data][unit_amount]': String(Math.round(DEBRIEF_OFFER.amount * 100)),
      'line_items[0][price_data][product_data][name]': DEBRIEF_OFFER.name,
      'line_items[0][price_data][product_data][description]': `Founder-reviewed breakdown of your TypeJung map, likely mistype risks, and stress edge, delivered within ${DEBRIEF_OFFER.deliveryHours} hours.`,
      'line_items[0][quantity]': '1',
      'submit_type': 'pay',
      'success_url': `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url': `${baseUrl}/debrief?checkout=cancelled`,
      'expires_at': String(expiresAt),
      'customer_email': intake.email,
      'customer_creation': 'always',
      'custom_text[submit][message]': `One-time CAD purchase. Your debrief is delivered within ${DEBRIEF_OFFER.deliveryHours} hours.`,
      'payment_intent_data[description]': DEBRIEF_OFFER.name,
    });

    // Intentionally no TYPEJUNG30 / promotion codes on the human-delivered service.
    Object.entries(metadata).forEach(([key, value]) => {
      if (!value) return;
      params.set(`metadata[${key}]`, value);
      params.set(`payment_intent_data[metadata][${key}]`, value);
    });

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
      console.error('Stripe debrief session error:', session);
      return res.status(response.status).json({ error: session.error?.message || 'Stripe error' });
    }

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      expiresAt: session.expires_at || expiresAt,
    });
  } catch (error: any) {
    console.error('Debrief checkout error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create debrief session' });
  }
}
