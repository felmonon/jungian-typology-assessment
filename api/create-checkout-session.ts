import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const { tier } = req.body;

    // Resolve the price ID based on tier
    let resolvedPriceId;
    let resolvedTier = tier || 'insight';

    if (tier === 'insight') {
      resolvedPriceId = process.env.STRIPE_INSIGHT_PRICE_ID;
    } else if (tier === 'mastery') {
      resolvedPriceId = process.env.STRIPE_MASTERY_PRICE_ID;
    }

    if (!resolvedPriceId) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    // Get the origin for redirect URLs
    const origin = req.headers.origin || 'https://typejung.com';

    // Use fetch directly to Stripe API
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'payment_method_types[0]': 'card',
        'line_items[0][price]': resolvedPriceId,
        'line_items[0][quantity]': '1',
        'allow_promotion_codes': 'true',
        'success_url': `${origin}/#/success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${origin}/#/results`,
        'metadata[product]': 'jungian_assessment_premium',
        'metadata[tier]': resolvedTier,
      }).toString(),
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
