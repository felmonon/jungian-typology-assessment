import type { SupabaseClient } from '@supabase/supabase-js';
import { getStripePriceIdForTier, parsePaidTier } from '../../server/checkout.js';

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
  } | null;
  payment_intent?: string | { id?: string | null } | null;
  payment_status?: string | null;
};

function stripeCustomerId(customer: CheckoutSessionLike['customer']): string | null {
  if (!customer) return null;
  return typeof customer === 'string' ? customer : customer.id || null;
}

function stripeObjectId(value: string | { id?: string | null } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id || null;
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
  if (!customerEmail) return null;

  const { data: users } = await supabase
    .from('users')
    .select('id')
    .eq('email', customerEmail)
    .limit(1);

  return users?.[0]?.id || null;
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
  const customerEmail = session.customer_details?.email || null;
  const userId = await findPurchaseUserId(supabase, explicitUserId, customerEmail);
  const purchase = {
    user_id: userId,
    stripe_session_id: session.id,
    stripe_customer_id: stripeCustomerId(session.customer),
    amount: session.amount_total ?? null,
    currency: session.currency || 'cad',
    status: 'completed',
    tier,
  };

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
    return { id: existingPurchases[0].id, ...purchase };
  }

  const { data, error } = await supabase
    .from('purchases')
    .insert(purchase)
    .select('id')
    .single();

  if (error) throw error;
  return { id: data?.id, ...purchase };
}
