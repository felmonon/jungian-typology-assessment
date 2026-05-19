import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { recordCheckoutPurchase } from './_lib/purchases.js';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from './_lib/supabase.js';
import { getStripeSecretKey, getStripeWebhookSecret } from '../server/checkout.js';

// Disable body parsing, need raw body for webhook signature
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripeSecretKey = getStripeSecretKey();
  const webhookSecret = getStripeWebhookSecret();
  if (!stripeSecretKey || !webhookSecret) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  if (!hasSupabaseAdminConfig()) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const stripe = new Stripe(stripeSecretKey);
  const supabase = getSupabaseAdminClient();
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const session = await stripe.checkout.sessions.retrieve(checkoutSession.id, {
        expand: ['line_items.data.price'],
      });
      await recordCheckoutPurchase(supabase, session);
      console.log('Payment recorded for session:', session.id);
      break;

    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return res.status(200).json({ received: true });
}
