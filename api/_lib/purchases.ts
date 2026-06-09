import type { SupabaseClient } from '@supabase/supabase-js';
import { getStripePriceIdForTier, parsePaidTier } from '../../server/checkout.js';
import { markCheckoutIntentCompleted } from './checkout-intents.js';

type CheckoutSessionLike = {
  id: string;
  amount_total?: number | null;
  currency?: string | null;
  customer?: string | { id?: string } | null;
  customer_details?: {
    email?: string | null;
  } | null;
  line_items?: {
    data?: Array<{
      price?: {
        id?: string;
      } | null;
    }>;
  } | null;
  metadata?: {
    tier?: string | null;
    source?: string | null;
    acquisition_source?: string | null;
    acquisition_ref?: string | null;
    utm_campaign?: string | null;
    utm_source?: string | null;
    shared_result?: string | null;
    parent_source?: string | null;
    source_chain?: string | null;
    discount_code?: string | null;
    recovery_email_consent?: string | null;
  } | null;
  payment_intent?: string | { id?: string | null } | null;
  payment_status?: string | null;
  created?: number | null;
};

function stripeCustomerId(customer: CheckoutSessionLike['customer']): string | null {
  if (!customer) return null;
  return typeof customer === 'string' ? customer : customer.id || null;
}

function stripeObjectId(value: string | { id?: string | null } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id || null;
}

function cleanCustomerEmail(email: string | null | undefined): string | null {
  const cleaned = email?.trim().toLowerCase();
  return cleaned ? cleaned.slice(0, 320) : null;
}

function cleanPurchaseToken(value: unknown, maxLength = 100): string | null {
  if (typeof value !== 'string') return null;

  const cleaned = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, maxLength);

  return cleaned || null;
}

function cleanPurchaseSourceChain(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const tokens = value
    .split('>')
    .map((token) => cleanPurchaseToken(token, 80))
    .filter((token): token is string => Boolean(token));
  const uniqueTokens = Array.from(new Set(tokens));
  const cleaned = uniqueTokens.join('>').slice(0, 240);

  return cleaned || null;
}

export function resolveCheckoutTransactionId(session: CheckoutSessionLike): string {
  return stripeObjectId(session.payment_intent) || session.id;
}

export function resolveTierFromCheckoutSession(session: CheckoutSessionLike): 'insight' | 'mastery' {
  const metadataTier = parsePaidTier(session.metadata?.tier);
  if (metadataTier) return metadataTier;

  const priceId = session.line_items?.data?.[0]?.price?.id;
  if (priceId === getStripePriceIdForTier('mastery')) return 'mastery';
  return 'insight';
}

export async function findPurchaseUserId(
  supabase: SupabaseClient,
  explicitUserId: string | null,
  customerEmail?: string | null,
): Promise<string | null> {
  if (explicitUserId) return explicitUserId;
  const cleanedCustomerEmail = cleanCustomerEmail(customerEmail);
  if (!cleanedCustomerEmail) return null;

  const { data: users } = await supabase
    .from('users')
    .select('id')
    .eq('email', cleanedCustomerEmail)
    .limit(1);

  return users?.[0]?.id || null;
}

export function purchaseAttributionFromCheckoutSession(session: CheckoutSessionLike) {
  const metadata = session.metadata || {};
  const source = cleanPurchaseToken(metadata.source, 120);
  const acquisitionSource = cleanPurchaseToken(metadata.acquisition_source, 120) || source;

  return {
    source,
    acquisition_source: acquisitionSource,
    acquisition_ref: cleanPurchaseToken(metadata.acquisition_ref, 120),
    utm_campaign: cleanPurchaseToken(metadata.utm_campaign),
    utm_source: cleanPurchaseToken(metadata.utm_source),
    shared_result: cleanPurchaseToken(metadata.shared_result),
    parent_source: cleanPurchaseToken(metadata.parent_source),
    source_chain: cleanPurchaseSourceChain(metadata.source_chain),
    discount_code: cleanPurchaseToken(metadata.discount_code, 80),
    recovery_email_consent: cleanPurchaseToken(metadata.recovery_email_consent, 80),
  };
}

export type PurchaseAccessUser = {
  id?: string | null;
  email?: string | null;
};

export async function findCompletedPurchaseForUser(
  supabase: SupabaseClient,
  user: PurchaseAccessUser | null | undefined,
) {
  if (!user?.id && !user?.email) return null;

  if (user.id) {
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('id, tier, status, createdAt:created_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    if (purchases && purchases.length > 0) return purchases[0];
  }

  const customerEmail = cleanCustomerEmail(user.email);
  if (!customerEmail) return null;

  const { data: emailPurchases, error } = await supabase
    .from('purchases')
    .select('id, tier, status, createdAt:created_at')
    .eq('customer_email', customerEmail)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  return emailPurchases?.[0] || null;
}

export async function isCheckoutSessionRedeemableBy(
  supabase: SupabaseClient,
  sessionId: string,
  user: PurchaseAccessUser | null | undefined,
): Promise<boolean> {
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('user_id, customer_email')
    .eq('stripe_session_id', sessionId)
    .limit(1);

  if (error) throw error;
  const purchase = purchases?.[0];
  // Unknown session (webhook not yet processed) or guest purchase with no
  // account binding: the session id itself acts as the unlock token.
  if (!purchase || !purchase.user_id) return true;

  // The purchase is bound to an account: deny redemption from a different
  // logged-in account. Anonymous requests keep bearer semantics so the
  // buyer's own success-page flow works before they sign in.
  if (!user?.id) return true;
  return user.id === purchase.user_id;
}

export async function recordCheckoutPurchase(
  supabase: SupabaseClient,
  session: CheckoutSessionLike,
  explicitUserId: string | null = null,
) {
  if (session.payment_status !== 'paid') {
    return null;
  }

  const tier = resolveTierFromCheckoutSession(session);
  const customerEmail = cleanCustomerEmail(session.customer_details?.email);
  const userId = await findPurchaseUserId(supabase, explicitUserId, customerEmail);
  const purchase = {
    user_id: userId,
    stripe_session_id: session.id,
    payment_intent_id: stripeObjectId(session.payment_intent),
    stripe_customer_id: stripeCustomerId(session.customer),
    customer_email: customerEmail,
    amount: session.amount_total ?? null,
    currency: session.currency || 'cad',
    status: 'completed',
    tier,
    ...purchaseAttributionFromCheckoutSession(session),
    ...(session.created ? { created_at: new Date(session.created * 1000).toISOString() } : {}),
  };

  const { data: upsertedPurchase, error: upsertError } = await supabase
    .from('purchases')
    .upsert(purchase, { onConflict: 'stripe_session_id' })
    .select('id')
    .single();

  if (!upsertError) {
    await markCheckoutIntentCompleted(supabase, session);
    return { id: upsertedPurchase?.id, ...purchase };
  }

  console.warn('Purchase upsert by Stripe session failed; falling back to lookup/update:', upsertError.message);

  const { data: existingPurchases, error: lookupError } = await supabase
    .from('purchases')
    .select('id')
    .eq('stripe_session_id', session.id)
    .limit(1);

  if (lookupError) {
    throw lookupError;
  }

  if (existingPurchases && existingPurchases.length > 0) {
    const { error } = await supabase
      .from('purchases')
      .update(purchase)
      .eq('id', existingPurchases[0].id);

    if (error) throw error;
    await markCheckoutIntentCompleted(supabase, session);
    return { id: existingPurchases[0].id, ...purchase };
  }

  const { data, error } = await supabase
    .from('purchases')
    .insert(purchase)
    .select('id')
    .single();

  if (error) throw error;
  await markCheckoutIntentCompleted(supabase, session);
  return { id: data?.id, ...purchase };
}

export async function markPurchaseStatusByPaymentIntent(
  supabase: SupabaseClient,
  paymentIntentId: string | null | undefined,
  status: 'refunded' | 'disputed',
): Promise<boolean> {
  const cleanedPaymentIntentId = stripeObjectId(paymentIntentId || null);
  if (!cleanedPaymentIntentId) return false;

  const { data, error } = await supabase
    .from('purchases')
    .update({ status })
    .eq('payment_intent_id', cleanedPaymentIntentId)
    .select('id');

  if (error) {
    throw error;
  }

  return Boolean(data?.length);
}
