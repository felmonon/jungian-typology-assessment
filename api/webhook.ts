import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { track as trackVercelServerEvent } from '@vercel/analytics/server';
import { markCheckoutIntentExpired } from './_lib/checkout-intents.js';
import { recordFunnelEvent } from './_lib/funnel-events.js';
import { markPurchaseStatusByPaymentIntent, recordCheckoutPurchase } from './_lib/purchases.js';
import { queueCheckoutRecoveryEmail } from './_lib/recovery-emails.js';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from './_lib/supabase.js';
import { getStripeSecretKey, getStripeWebhookSecret } from '../server/checkout.js';
import { sendDebriefRequestNotification } from '../server/resend.js';
import { DEBRIEF_OFFER } from '../data/debrief.js';

// Personal Type Debrief is a human-delivered service, not a premium unlock.
// Notify the founder with the intake and mark the request paid, but never run
// the premium-granting purchase path for these sessions.
async function handleDebriefSessionCompleted(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  session: Stripe.Checkout.Session,
) {
  const metadata = session.metadata || {};
  const requestId = metadata.debrief_request_id || session.id;
  const customerEmail = session.customer_details?.email || metadata.debrief_email || '';
  const amountLabel = session.currency === 'cad' && typeof session.amount_total === 'number'
    ? `CA$${(session.amount_total / 100).toFixed(2)}`
    : undefined;

  try {
    await sendDebriefRequestNotification({
      requestId,
      customerEmail,
      resultSummary: metadata.debrief_result_summary,
      testedAs: metadata.debrief_tested_as,
      stuckBetween: metadata.debrief_stuck_between,
      feltAccurate: metadata.debrief_felt_accurate,
      feltConfusing: metadata.debrief_felt_confusing,
      amountLabel,
      idempotencyKey: `debrief-notify:${session.id}`,
    });
  } catch (notifyError) {
    console.error('Debrief founder notification failed:', notifyError instanceof Error ? notifyError.message : 'unknown');
  }

  try {
    await supabase
      .from('debrief_requests')
      .update({ status: 'paid', stripe_session_id: session.id, paid_at: new Date().toISOString() })
      .eq('request_id', requestId);
  } catch (storeError) {
    console.warn('Debrief request status update skipped:', storeError instanceof Error ? storeError.message : 'unknown');
  }
}

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

function checkoutAttributionEventParams(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};

  return {
    acquisition_source: metadata.acquisition_source || metadata.source || 'unknown',
    acquisition_ref: metadata.acquisition_ref || 'unknown',
    utm_campaign: metadata.utm_campaign || 'unknown',
    utm_source: metadata.utm_source || 'unknown',
    shared_result: metadata.shared_result || 'none',
    parent_source: metadata.parent_source || 'none',
    source_chain: metadata.source_chain || 'none',
  };
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

async function trackCheckoutWebhookEvent(eventName: string, params: Record<string, unknown>) {
  try {
    await trackVercelServerEvent(eventName, vercelEventProperties(params));
  } catch (error) {
    console.warn('Vercel checkout webhook analytics event failed:', eventName, error instanceof Error ? error.message : 'Unknown error');
  }
}

function stripeObjectId(value: string | { id?: string | null } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id || null;
}

async function updatePurchaseStatusFromPaymentIntent(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  paymentIntent: string | { id?: string | null } | null | undefined,
  status: 'refunded' | 'disputed',
) {
  const paymentIntentId = stripeObjectId(paymentIntent);
  const purchaseFound = await markPurchaseStatusByPaymentIntent(supabase, paymentIntentId, status);

  await trackCheckoutWebhookEvent('server_purchase_status_updated', {
    status,
    purchase_found: purchaseFound,
  });

  if (!purchaseFound) {
    console.warn(`No purchase found for ${status} payment intent:`, paymentIntentId || 'missing');
  }
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
    case 'checkout.session.completed': {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const session = await stripe.checkout.sessions.retrieve(checkoutSession.id, {
        expand: ['line_items.data.price'],
      });

      if (session.metadata?.product === DEBRIEF_OFFER.productTag) {
        await handleDebriefSessionCompleted(supabase, session);
        await trackCheckoutWebhookEvent('server_debrief_paid', {
          source: session.metadata?.source || 'unknown',
          amount_cad: session.currency === 'cad' && session.amount_total ? session.amount_total / 100 : null,
          status: session.payment_status || 'unknown',
        });
        break;
      }

      const purchase = await recordCheckoutPurchase(supabase, session);
      console.log('Payment recorded for session:', session.id);
      if (purchase) {
        try {
          await recordFunnelEvent(supabase, {
            eventId: `purchase:${session.id}`,
            eventName: 'purchase',
            anonymousId: session.metadata?.anonymous_id,
            source: session.metadata?.source || 'unknown',
            tier: purchase.tier,
            checkoutIntentId: session.metadata?.checkout_intent_id,
            stripeSessionId: session.id,
            purchaseId: typeof purchase.id === 'string' ? purchase.id : null,
            value: typeof session.amount_total === 'number' ? session.amount_total / 100 : null,
            currency: typeof session.currency === 'string' ? session.currency.toUpperCase() : 'CAD',
            properties: {
              ...checkoutAttributionEventParams(session),
              payment_status: session.payment_status || 'unknown',
              stripe_customer_present: Boolean(session.customer),
            },
          });
        } catch (funnelError) {
          console.warn('Purchase funnel event insert failed:', funnelError instanceof Error ? funnelError.message : 'Unknown error');
        }
      }
      await trackCheckoutWebhookEvent('server_purchase_recorded', {
        tier: session.metadata?.tier || 'unknown',
        source: session.metadata?.source || 'unknown',
        ...checkoutAttributionEventParams(session),
        amount_cad: session.currency === 'cad' && session.amount_total ? session.amount_total / 100 : null,
        status: session.payment_status || 'unknown',
      });
      break;
    }

    case 'checkout.session.expired': {
      const expiredSession = event.data.object as Stripe.Checkout.Session;
      await markCheckoutIntentExpired(supabase, expiredSession);
      const queueResult = await queueCheckoutRecoveryEmail(supabase, expiredSession);
      await trackCheckoutWebhookEvent(queueResult.queued ? 'server_checkout_recovery_queued' : 'server_checkout_recovery_skipped', {
        reason: queueResult.reason || (queueResult.queued ? 'queued' : 'unknown'),
        tier: expiredSession.metadata?.tier || 'unknown',
        source: expiredSession.metadata?.source || 'unknown',
        ...checkoutAttributionEventParams(expiredSession),
      });
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      await updatePurchaseStatusFromPaymentIntent(supabase, charge.payment_intent, 'refunded');
      break;
    }

    case 'charge.dispute.created': {
      const dispute = event.data.object as Stripe.Dispute;
      await updatePurchaseStatusFromPaymentIntent(supabase, (dispute as any).payment_intent, 'disputed');
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return res.status(200).json({ received: true });
}
