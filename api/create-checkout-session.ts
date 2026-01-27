import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, tier } = req.body;

    // Resolve the price ID based on tier
    let resolvedPriceId = priceId;
    let resolvedTier = tier || 'insight';

    if (tier === 'insight') {
      resolvedPriceId = process.env.STRIPE_INSIGHT_PRICE_ID;
    } else if (tier === 'mastery') {
      resolvedPriceId = process.env.STRIPE_MASTERY_PRICE_ID;
    }

    if (!resolvedPriceId) {
      resolvedPriceId = process.env.STRIPE_PRICE_ID;
    }

    // Get the origin for redirect URLs
    const origin = req.headers.origin || 'https://typejung.com';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: resolvedPriceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      success_url: `${origin}/#/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#/results`,
      metadata: {
        product: 'jungian_assessment_premium',
        tier: resolvedTier,
      },
    });

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
