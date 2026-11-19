import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSessionUserFromCookie } from './_lib/auth-utils.js';
import { markCheckoutIntentExpired } from './_lib/checkout-intents.js';
import {
  getCheckoutSessionAccess,
  isRevokedPurchaseStatus,
  recordCheckoutPurchase,
  resolveCheckoutTransactionId,
  resolveTierFromCheckoutSession,
} from './_lib/purchases.js';
import { enforceSharedRateLimit } from './_lib/rate-limit.js';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from './_lib/supabase.js';
import { getStripeSecretKey } from '../server/checkout.js';

function centsToAmount(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value / 100 : null;
}

// Stripe Checkout Session ids. Anything else is rejected before it can be
// placed in the Stripe API path.
const CHECKOUT_SESSION_ID_PATTERN = /^cs_[A-Za-z0-9_]+$/;

export function isValidCheckoutSessionId(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 255 && CHECKOUT_SESSION_ID_PATTERN.test(value);
}

function normalizedCurrency(value: unknown): string {
  return typeof value === 'string' && /^[a-zA-Z]{3}$/.test(value)
    ? value.toUpperCase()
    : 'CAD';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Support both GET (query param) and POST (body)
  // Frontend sends sessionId (camelCase), also support session_id (snake_case)
  const session_id = req.method === 'GET'
    ? req.query.session_id
    : (req.body?.sessionId || req.body?.session_id);

  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'Missing session_id parameter' });
  }

  if (!isValidCheckoutSessionId(session_id)) {
    return res.status(400).json({ error: 'Invalid session_id parameter' });
  }

  if (await enforceSharedRateLimit(req, res, {
    keyPrefix: 'checkout:verify-session',
    limit: 30,
    windowMs: 15 * 60 * 1000,
    message: 'Too many payment verification attempts. Please wait and try again.',
  })) return;

  const stripeSecretKey = getStripeSecretKey();
  if (!stripeSecretKey) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  try {
    const query = new URLSearchParams({
      'expand[]': 'line_items.data.price',
    });
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
      },
    });

    const session = await response.json();

    if (!response.ok) {
      console.error('Stripe API error:', response.status, session?.error?.code || session?.error?.type || 'unknown');
      if (response.status === 404) {
        return res.status(404).json({ error: 'Checkout session not found' });
      }
      return res.status(502).json({ error: 'Could not verify payment. Please try again.' });
    }

    const isDebrief = session.metadata?.product === 'typejung_debrief';

    if (session.payment_status === 'paid') {
      // Debrief is a human-delivered service: never run the premium-granting
      // purchase path for it; just confirm the request was received.
      if (isDebrief) {
        return res.status(200).json({
          success: true,
          paid: true,
          product: 'debrief',
          tier: null,
          metadata: { product: 'debrief' },
          amountTotal: typeof session.amount_total === 'number' ? session.amount_total : null,
          amountPaid: centsToAmount(session.amount_total),
          currency: normalizedCurrency(session.currency),
        });
      }

      const tier = resolveTierFromCheckoutSession(session);
      const transactionId = resolveCheckoutTransactionId(session);
      // The buyer email is returned only to the account the purchase is bound
      // to. Without a database there is no binding to check, so it is withheld.
      let ownsPurchase = false;
      if (hasSupabaseAdminConfig()) {
        const supabase = getSupabaseAdminClient();
        const user = await getSessionUserFromCookie(req.headers.cookie, supabase);
        const access = await getCheckoutSessionAccess(supabase, session.id, user);

        if (access.state === 'revoked') {
          return res.status(200).json({ success: true, paid: false, status: access.purchase.status });
        }
        if (access.state === 'other_account') {
          return res.status(403).json({ error: 'This purchase belongs to a different account.' });
        }

        // recordCheckoutPurchase never rebinds a purchase that already has an
        // account, and never moves a refunded/disputed purchase back to completed.
        const recorded = await recordCheckoutPurchase(supabase, session, user?.id || null);
        if (recorded && isRevokedPurchaseStatus(recorded.status)) {
          return res.status(200).json({ success: true, paid: false, status: recorded.status });
        }
        ownsPurchase = Boolean(user?.id && recorded?.user_id === user.id);
      }

      return res.status(200).json({
        success: true,
        paid: true,
        product: 'premium',
        tier,
        metadata: { tier },
        transactionId,
        amountTotal: typeof session.amount_total === 'number' ? session.amount_total : null,
        amountPaid: centsToAmount(session.amount_total),
        amountDiscount: centsToAmount(session.total_details?.amount_discount),
        currency: normalizedCurrency(session.currency),
        discountCode: typeof session.metadata?.discount_code === 'string' ? session.metadata.discount_code : null,
        ...(ownsPurchase && session.customer_details?.email ? { customerEmail: session.customer_details.email } : {}),
      });
    } else {
      if (session.status === 'expired' && hasSupabaseAdminConfig()) {
        const supabase = getSupabaseAdminClient();
        await markCheckoutIntentExpired(supabase, session);
      }

      return res.status(200).json({
        success: true,
        paid: false,
        status: session.payment_status,
      });
    }
  } catch (error) {
    console.error('Session verification error:', error instanceof Error ? error.message : 'unknown');
    return res.status(500).json({ error: 'Failed to verify session' });
  }
}
