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

// Statuses that end an entitlement. Once a purchase reaches one of these, no
// later webhook redelivery or success-page verification may move it back to
// 'completed'.
export const REVOKED_PURCHASE_STATUSES = ['refunded', 'disputed'] as const;

export function isRevokedPurchaseStatus(status: unknown): boolean {
  return typeof status === 'string' && (REVOKED_PURCHASE_STATUSES as readonly string[]).includes(status);
}

export type EmailVerificationFields = {
  email_verified_at?: string | null;
  google_id?: string | null;
  apple_id?: string | null;
};

// An account's email counts as verified only when an identity provider vouched
// for it: Google and Apple sign-in both require a provider-verified address.
// Password signups have no verification flow, so they never count.
export function isUserEmailVerified(user: EmailVerificationFields | null | undefined): boolean {
  if (!user) return false;
  return Boolean(user.email_verified_at || user.google_id || user.apple_id);
}

// Links a guest purchase to an account by email, but only to an account whose
// email is verified. Otherwise anyone could sign up with a buyer's address and
// collect their purchase.
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
    .select('*')
    .eq('email', cleanedCustomerEmail)
    .limit(1);

  const user = users?.[0];
  return user?.id && isUserEmailVerified(user) ? user.id : null;
}

async function loadUserVerification(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ email: string | null; verified: boolean }> {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .limit(1);

  if (error) throw error;
  const user = users?.[0];
  return {
    email: cleanCustomerEmail(user?.email),
    verified: isUserEmailVerified(user),
  };
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
  // Access is granted by account id. Email is only a fallback for guest
  // purchases, and only for a signed-in account whose email is verified.
  if (!user?.id) return null;

  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('id, tier, status, createdAt:created_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  if (purchases && purchases.length > 0) return purchases[0];

  const account = await loadUserVerification(supabase, user.id);
  if (!account.verified || !account.email) return null;

  const { data: emailPurchases, error: emailError } = await supabase
    .from('purchases')
    .select('id, tier, status, createdAt:created_at')
    .eq('customer_email', account.email)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1);

  if (emailError) throw emailError;
  return emailPurchases?.[0] || null;
}

export type CheckoutSessionAccess =
  // No purchase row yet (webhook not processed): the caller must rely on a
  // fresh Stripe check of the session.
  | { state: 'unrecorded' }
  | { state: 'entitled'; purchase: StoredPurchase }
  | { state: 'revoked'; purchase: StoredPurchase }
  | { state: 'other_account'; purchase: StoredPurchase };

type StoredPurchase = {
  id?: string | null;
  user_id: string | null;
  customer_email: string | null;
  status: string | null;
  tier: string | null;
};

export async function getCheckoutSessionAccess(
  supabase: SupabaseClient,
  sessionId: string,
  user: PurchaseAccessUser | null | undefined,
): Promise<CheckoutSessionAccess> {
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('id, user_id, customer_email, status, tier')
    .eq('stripe_session_id', sessionId)
    .limit(1);

  if (error) throw error;
  const purchase = purchases?.[0] as StoredPurchase | undefined;
  if (!purchase) return { state: 'unrecorded' };

  // The database status decides: a refund or dispute ends access even though
  // Stripe still reports the session itself as paid.
  if (isRevokedPurchaseStatus(purchase.status)) return { state: 'revoked', purchase };

  // A purchase bound to an account cannot be redeemed from a different
  // logged-in account. Anonymous requests keep bearer semantics so the buyer's
  // own success-page flow works before they sign in.
  if (purchase.user_id && user?.id && user.id !== purchase.user_id) {
    return { state: 'other_account', purchase };
  }

  return { state: 'entitled', purchase };
}

export async function isCheckoutSessionRedeemableBy(
  supabase: SupabaseClient,
  sessionId: string,
  user: PurchaseAccessUser | null | undefined,
): Promise<boolean> {
  const access = await getCheckoutSessionAccess(supabase, sessionId, user);
  return access.state === 'unrecorded' || access.state === 'entitled';
}

// For callers that already confirmed with Stripe that the session is paid:
// true unless the stored purchase was refunded, disputed, or belongs to a
// different account.
export const isSessionEntitled = isCheckoutSessionRedeemableBy;

function isUniqueViolation(error: { code?: string } | null | undefined): boolean {
  return error?.code === '23505';
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
  const purchase = {
    stripe_session_id: session.id,
    payment_intent_id: stripeObjectId(session.payment_intent),
    stripe_customer_id: stripeCustomerId(session.customer),
    customer_email: customerEmail,
    amount: session.amount_total ?? null,
    currency: session.currency || 'cad',
    tier,
    ...purchaseAttributionFromCheckoutSession(session),
    ...(session.created ? { created_at: new Date(session.created * 1000).toISOString() } : {}),
  };

  const updateExisting = async (existing: { id: string; user_id: string | null; status: string | null }) => {
    // Never move a refunded or disputed purchase back to completed, and never
    // rebind a purchase that already belongs to an account.
    const status = isRevokedPurchaseStatus(existing.status) ? existing.status : 'completed';
    const userId = existing.user_id
      || await findPurchaseUserId(supabase, explicitUserId, customerEmail);
    const update: Record<string, unknown> = { ...purchase, status };
    if (!existing.user_id) update.user_id = userId;

    const { error } = await supabase
      .from('purchases')
      .update(update)
      .eq('id', existing.id);

    if (error) throw error;
    if (status === 'completed') await markCheckoutIntentCompleted(supabase, session);
    return { id: existing.id, ...purchase, user_id: userId, status };
  };

  const lookupExisting = async () => {
    const { data, error } = await supabase
      .from('purchases')
      .select('id, user_id, status')
      .eq('stripe_session_id', session.id)
      .limit(1);
    if (error) throw error;
    return data?.[0] as { id: string; user_id: string | null; status: string | null } | undefined;
  };

  const existing = await lookupExisting();
  if (existing) return updateExisting(existing);

  const userId = await findPurchaseUserId(supabase, explicitUserId, customerEmail);
  const newPurchase = { ...purchase, user_id: userId, status: 'completed' };
  const { data, error } = await supabase
    .from('purchases')
    .insert(newPurchase)
    .select('id')
    .single();

  if (error) {
    // A concurrent webhook or verification inserted the row first.
    if (isUniqueViolation(error)) {
      const raced = await lookupExisting();
      if (raced) return updateExisting(raced);
    }
    throw error;
  }

  await markCheckoutIntentCompleted(supabase, session);
  return { id: data?.id, ...newPurchase };
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
