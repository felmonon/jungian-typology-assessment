import type { SupabaseClient } from '@supabase/supabase-js';
import type { PaidTierId } from '../../data/pricing.js';

type CheckoutIntentAttribution = {
  source?: string | null;
  ref?: string | null;
  utmCampaign?: string | null;
  utmSource?: string | null;
  sharedResult?: string | null;
  parentSource?: string | null;
  sourceChain?: string | null;
};

export type CheckoutIntentStartInput = {
  tier: PaidTierId;
  amountCents: number;
  currency: string;
  source: string;
  attribution?: CheckoutIntentAttribution;
  checkoutEmailSource: string;
  hasCustomerEmail: boolean;
  recoveryEmailConsent: string;
};

type CheckoutSessionLike = {
  id: string;
  amount_total?: number | null;
  currency?: string | null;
  expires_at?: number | null;
  payment_status?: string | null;
  status?: string | null;
  metadata?: Record<string, string | null | undefined> | null;
};

function cleanIntentToken(value: unknown, maxLength = 100): string | null {
  if (typeof value !== 'string') return null;

  const cleaned = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, maxLength);

  return cleaned || null;
}

function cleanIntentSourceChain(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const tokens = value
    .split('>')
    .map((token) => cleanIntentToken(token, 80))
    .filter((token): token is string => Boolean(token));
  const uniqueTokens = Array.from(new Set(tokens));
  const cleaned = uniqueTokens.join('>').slice(0, 240);

  return cleaned || null;
}

function unixSecondsToIso(value: unknown): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return new Date(value * 1000).toISOString();
}

function checkoutIntentIdFromSession(session: CheckoutSessionLike): string | null {
  return cleanIntentToken(session.metadata?.checkout_intent_id, 100);
}

function checkoutIntentUpdateFromSession(session: CheckoutSessionLike) {
  return {
    stripe_session_id: session.id,
    stripe_status: session.payment_status || session.status || null,
    ...(typeof session.amount_total === 'number' ? { amount: session.amount_total } : {}),
    ...(typeof session.currency === 'string' ? { currency: session.currency } : {}),
    ...(unixSecondsToIso(session.expires_at) ? { expires_at: unixSecondsToIso(session.expires_at) } : {}),
    updated_at: new Date().toISOString(),
  };
}

async function safeUpdateIntentById(
  supabase: SupabaseClient,
  id: string | null,
  update: Record<string, unknown>,
): Promise<boolean> {
  if (!id) return false;

  try {
    const { error } = await supabase
      .from('checkout_intents')
      .update(update)
      .eq('id', id);

    if (error) {
      console.warn('Checkout intent update failed:', error.message);
      return false;
    }
  } catch (error) {
    console.warn('Checkout intent update failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }

  return true;
}

async function safeUpdateIntentByStripeSession(
  supabase: SupabaseClient,
  stripeSessionId: string,
  update: Record<string, unknown>,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('checkout_intents')
      .update(update)
      .eq('stripe_session_id', stripeSessionId);

    if (error) {
      console.warn('Checkout intent session update failed:', error.message);
      return false;
    }
  } catch (error) {
    console.warn('Checkout intent session update failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }

  return true;
}

export async function recordCheckoutIntentStarted(
  supabase: SupabaseClient,
  input: CheckoutIntentStartInput,
): Promise<string | null> {
  const attribution = input.attribution || {};

  try {
    const { data, error } = await supabase
      .from('checkout_intents')
      .insert({
        tier: input.tier,
        amount: input.amountCents,
        currency: input.currency.toLowerCase(),
        status: 'started',
        source: cleanIntentToken(input.source, 120) || 'unknown',
        acquisition_source: cleanIntentToken(attribution.source, 120) || cleanIntentToken(input.source, 120) || 'unknown',
        acquisition_ref: cleanIntentToken(attribution.ref, 120),
        utm_campaign: cleanIntentToken(attribution.utmCampaign),
        utm_source: cleanIntentToken(attribution.utmSource),
        shared_result: cleanIntentToken(attribution.sharedResult),
        parent_source: cleanIntentToken(attribution.parentSource),
        source_chain: cleanIntentSourceChain(attribution.sourceChain),
        checkout_email_source: cleanIntentToken(input.checkoutEmailSource, 80),
        has_customer_email: input.hasCustomerEmail,
        recovery_email_consent: cleanIntentToken(input.recoveryEmailConsent, 80),
      })
      .select('id')
      .single();

    if (error) {
      console.warn('Checkout intent insert failed:', error.message);
      return null;
    }

    return typeof data?.id === 'string' ? data.id : null;
  } catch (error) {
    console.warn('Checkout intent insert failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export async function markCheckoutIntentStripeCreated(
  supabase: SupabaseClient,
  id: string | null,
  session: CheckoutSessionLike,
): Promise<void> {
  await safeUpdateIntentById(supabase, id, {
    ...checkoutIntentUpdateFromSession(session),
    status: 'stripe_created',
  });
}

export async function markCheckoutIntentStripeFailed(
  supabase: SupabaseClient,
  id: string | null,
  errorMessage: string,
): Promise<void> {
  await safeUpdateIntentById(supabase, id, {
    status: 'stripe_failed',
    error_message: errorMessage.trim().slice(0, 500) || 'Stripe session failed',
    updated_at: new Date().toISOString(),
  });
}

export async function markCheckoutIntentCompleted(
  supabase: SupabaseClient,
  session: CheckoutSessionLike,
): Promise<void> {
  const update = {
    ...checkoutIntentUpdateFromSession(session),
    status: 'completed',
    completed_at: new Date().toISOString(),
  };

  const updatedById = await safeUpdateIntentById(supabase, checkoutIntentIdFromSession(session), update);
  if (!updatedById) {
    await safeUpdateIntentByStripeSession(supabase, session.id, update);
  }
}

export async function markCheckoutIntentExpired(
  supabase: SupabaseClient,
  session: CheckoutSessionLike,
): Promise<void> {
  const update = {
    ...checkoutIntentUpdateFromSession(session),
    status: 'expired',
    expired_at: new Date().toISOString(),
  };

  const updatedById = await safeUpdateIntentById(supabase, checkoutIntentIdFromSession(session), update);
  if (!updatedById) {
    await safeUpdateIntentByStripeSession(supabase, session.id, update);
  }
}
