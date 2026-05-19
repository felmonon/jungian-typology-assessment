import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSessionUserFromCookie } from './_lib/auth-utils.js';
import { recordCheckoutPurchase, resolveCheckoutTransactionId, resolveTierFromCheckoutSession } from './_lib/purchases.js';
import { enforceRateLimit } from './_lib/rate-limit.js';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from './_lib/supabase.js';
import { getStripeSecretKey } from '../server/checkout.js';

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

  if (enforceRateLimit(req, res, {
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
      console.error('Stripe API error:', session);
      return res.status(response.status).json({ error: session.error?.message || 'Stripe error' });
    }

    if (session.payment_status === 'paid') {
      const tier = resolveTierFromCheckoutSession(session);
      const transactionId = resolveCheckoutTransactionId(session);
      if (hasSupabaseAdminConfig()) {
        const supabase = getSupabaseAdminClient();
        const user = await getSessionUserFromCookie(req.headers.cookie, supabase);
        await recordCheckoutPurchase(supabase, session, user?.id || null);
      }

      return res.status(200).json({
        success: true,
        paid: true,
        tier,
        metadata: { tier },
        transactionId,
        customerEmail: session.customer_details?.email,
      });
    } else {
      return res.status(200).json({
        success: true,
        paid: false,
        status: session.payment_status,
      });
    }
  } catch (error: any) {
    console.error('Session verification error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to verify session'
    });
  }
}
