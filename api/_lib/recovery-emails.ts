import type { SupabaseClient } from '@supabase/supabase-js';
import { discountedPriceLabel } from '../../data/discount.js';
import { isPaidTierId, PRICING, type PaidTierId } from '../../data/pricing.js';
import { sendCheckoutRecoveryEmail } from '../../server/resend.js';

const RECOVERY_SEND_DELAY_MS = 60 * 60 * 1000;
const RECOVERY_SEND_LIMIT = 40;

type CheckoutSessionLike = {
  id: string;
  cancel_url?: string | null;
  customer_details?: {
    email?: string | null;
  } | null;
  customer_email?: string | null;
  after_expiration?: {
    recovery?: {
      url?: string | null;
    } | null;
  } | null;
  consent?: {
    promotions?: string | null;
  } | null;
  metadata?: Record<string, string | null | undefined> | null;
};

type RecoveryEmailRow = {
  id: string;
  stripe_session_id: string;
  customer_email: string | null;
  tier: string | null;
  recovery_url: string | null;
  consent_source: 'stripe' | 'site' | null;
};

function cleanEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;

  const cleaned = email.trim().toLowerCase();
  if (!cleaned || cleaned.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) return null;
  return cleaned;
}

function cleanToken(value: unknown, maxLength = 100): string | null {
  if (typeof value !== 'string') return null;

  const cleaned = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, maxLength);

  return cleaned || null;
}

function checkoutSessionEmail(session: CheckoutSessionLike): string | null {
  return cleanEmail(session.customer_details?.email || session.customer_email);
}

function checkoutSessionTier(session: CheckoutSessionLike): PaidTierId | null {
  const tier = session.metadata?.tier;
  return isPaidTierId(tier) ? tier : null;
}

function checkoutRecoveryConsentSource(session: CheckoutSessionLike): 'stripe' | 'site' | null {
  if (session.consent?.promotions === 'opt_in') return 'stripe';
  if (session.metadata?.recovery_email_consent === 'site_opt_in') return 'site';
  return null;
}

function stripeRecoveryUrl(session: CheckoutSessionLike): string | null {
  const url = session.after_expiration?.recovery?.url;
  if (typeof url !== 'string') return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return null;
    if (parsed.hostname !== 'buy.stripe.com' && parsed.hostname !== 'checkout.stripe.com') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function checkoutBaseUrl(session: CheckoutSessionLike): string {
  const fallback = 'https://typejung.com';
  const candidate = session.cancel_url;
  if (typeof candidate !== 'string') return fallback;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return fallback;
    return parsed.origin;
  } catch {
    return fallback;
  }
}

function freshRecoveryUrl(session: CheckoutSessionLike, tier: PaidTierId): string {
  const url = new URL(`/checkout/${tier}`, checkoutBaseUrl(session));
  const metadata = session.metadata || {};
  url.searchParams.set('checkout', 'recovery');
  url.searchParams.set('source', 'checkout_recovery_email');
  url.searchParams.set('recovered_from', session.id);

  if (metadata.utm_campaign) url.searchParams.set('utm_campaign', metadata.utm_campaign);
  if (metadata.utm_source) url.searchParams.set('utm_source', metadata.utm_source);
  if (metadata.parent_source || metadata.source) url.searchParams.set('parent_source', metadata.parent_source || metadata.source || '');
  if (metadata.source_chain) url.searchParams.set('source_chain', metadata.source_chain);

  return url.toString();
}

async function hasCompletedPurchase(
  supabase: SupabaseClient,
  stripeSessionId: string,
  email: string | null,
): Promise<boolean> {
  const sessionLookup = await supabase
    .from('purchases')
    .select('id')
    .eq('stripe_session_id', stripeSessionId)
    .eq('status', 'completed')
    .limit(1);

  if (sessionLookup.error) {
    console.warn('Recovery purchase session lookup failed:', sessionLookup.error.message);
  } else if (sessionLookup.data?.length) {
    return true;
  }

  if (!email) return false;

  const emailLookup = await supabase
    .from('purchases')
    .select('id')
    .eq('customer_email', email)
    .eq('status', 'completed')
    .gt('amount', 0)
    .limit(1);

  if (emailLookup.error) {
    console.warn('Recovery purchase email lookup failed:', emailLookup.error.message);
    return false;
  }

  return Boolean(emailLookup.data?.length);
}

async function existingRecoveryRow(supabase: SupabaseClient, stripeSessionId: string) {
  const { data, error } = await supabase
    .from('recovery_emails')
    .select('id, status')
    .eq('stripe_session_id', stripeSessionId)
    .limit(1);

  if (error) {
    console.warn('Recovery email lookup failed:', error.message);
    return null;
  }

  return data?.[0] || null;
}

async function logSkippedRecovery(
  supabase: SupabaseClient,
  session: CheckoutSessionLike,
  reason: string,
  input: {
    customerEmail?: string | null;
    tier?: PaidTierId | null;
    consentSource?: 'stripe' | 'site' | null;
    recoveryUrl?: string | null;
    stripeRecoveryUrl?: string | null;
  } = {},
) {
  const existing = await existingRecoveryRow(supabase, session.id);
  if (existing?.status === 'sent' || existing?.status === 'queued') {
    return { queued: false, skipped: true, reason: 'already_recorded' };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('recovery_emails')
    .upsert({
      stripe_session_id: session.id,
      checkout_intent_id: cleanToken(session.metadata?.checkout_intent_id, 100),
      customer_email: input.customerEmail || null,
      tier: input.tier || null,
      recovery_url: input.recoveryUrl || null,
      stripe_recovery_url: input.stripeRecoveryUrl || null,
      consent_source: input.consentSource || null,
      status: 'skipped',
      skipped_at: now,
      error_message: reason,
      metadata: {
        source: cleanToken(session.metadata?.source, 120) || 'unknown',
        acquisition_source: cleanToken(session.metadata?.acquisition_source, 120) || cleanToken(session.metadata?.source, 120) || 'unknown',
      },
      updated_at: now,
    }, { onConflict: 'stripe_session_id' });

  if (error) {
    console.warn('Recovery skipped-row upsert failed:', error.message);
  }

  return { queued: false, skipped: true, reason };
}

export async function queueCheckoutRecoveryEmail(
  supabase: SupabaseClient,
  session: CheckoutSessionLike,
): Promise<{ queued: boolean; skipped?: boolean; reason?: string }> {
  const existing = await existingRecoveryRow(supabase, session.id);
  if (existing?.status === 'queued' || existing?.status === 'sent') {
    return { queued: false, skipped: true, reason: `already_${existing.status}` };
  }

  const consentSource = checkoutRecoveryConsentSource(session);
  const customerEmail = checkoutSessionEmail(session);
  const tier = checkoutSessionTier(session);
  const appRecoveryUrl = tier ? freshRecoveryUrl(session, tier) : null;
  const stripeUrl = stripeRecoveryUrl(session);

  if (!consentSource) {
    return logSkippedRecovery(supabase, session, 'missing_consent', {
      customerEmail,
      tier,
      consentSource,
      recoveryUrl: appRecoveryUrl,
      stripeRecoveryUrl: stripeUrl,
    });
  }

  if (!customerEmail) {
    return logSkippedRecovery(supabase, session, 'missing_email', {
      customerEmail,
      tier,
      consentSource,
      recoveryUrl: appRecoveryUrl,
      stripeRecoveryUrl: stripeUrl,
    });
  }

  if (!tier || !appRecoveryUrl) {
    return logSkippedRecovery(supabase, session, 'missing_tier_or_recovery_url', {
      customerEmail,
      tier,
      consentSource,
      recoveryUrl: appRecoveryUrl,
      stripeRecoveryUrl: stripeUrl,
    });
  }

  if (await hasCompletedPurchase(supabase, session.id, customerEmail)) {
    return logSkippedRecovery(supabase, session, 'already_purchased', {
      customerEmail,
      tier,
      consentSource,
      recoveryUrl: appRecoveryUrl,
      stripeRecoveryUrl: stripeUrl,
    });
  }

  const now = new Date();
  const { error } = await supabase
    .from('recovery_emails')
    .upsert({
      stripe_session_id: session.id,
      checkout_intent_id: cleanToken(session.metadata?.checkout_intent_id, 100),
      customer_email: customerEmail,
      tier,
      recovery_url: appRecoveryUrl,
      stripe_recovery_url: stripeUrl,
      consent_source: consentSource,
      status: 'queued',
      send_after: new Date(now.getTime() + RECOVERY_SEND_DELAY_MS).toISOString(),
      error_message: null,
      metadata: {
        source: cleanToken(session.metadata?.source, 120) || 'unknown',
        acquisition_source: cleanToken(session.metadata?.acquisition_source, 120) || cleanToken(session.metadata?.source, 120) || 'unknown',
        utm_campaign: cleanToken(session.metadata?.utm_campaign, 100),
        utm_source: cleanToken(session.metadata?.utm_source, 100),
        parent_source: cleanToken(session.metadata?.parent_source, 100),
        source_chain: typeof session.metadata?.source_chain === 'string' ? session.metadata.source_chain.slice(0, 240) : undefined,
      },
      updated_at: now.toISOString(),
    }, { onConflict: 'stripe_session_id' });

  if (error) {
    console.warn('Recovery email queue upsert failed:', error.message);
    return { queued: false, skipped: true, reason: 'queue_failed' };
  }

  return { queued: true };
}

export async function processQueuedRecoveryEmails(
  supabase: SupabaseClient,
  options: { dryRun?: boolean; limit?: number } = {},
) {
  const limit = Math.max(1, Math.min(options.limit || RECOVERY_SEND_LIMIT, 100));
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('recovery_emails')
    .select('id, stripe_session_id, customer_email, tier, recovery_url, consent_source')
    .eq('status', 'queued')
    .lte('send_after', now)
    .order('send_after', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Recovery email due-row lookup failed:', error.message);
    throw error;
  }

  const counters = {
    considered: data?.length || 0,
    sent: 0,
    skippedPurchased: 0,
    skippedInvalid: 0,
    wouldSend: 0,
    failed: 0,
  };

  for (const row of (data || []) as RecoveryEmailRow[]) {
    const email = cleanEmail(row.customer_email);
    const tier = isPaidTierId(row.tier) ? row.tier : null;
    const recoveryUrl = typeof row.recovery_url === 'string' && row.recovery_url.startsWith('https://')
      ? row.recovery_url
      : null;
    const consentSource = row.consent_source === 'stripe' || row.consent_source === 'site'
      ? row.consent_source
      : null;

    if (!email || !tier || !recoveryUrl || !consentSource) {
      counters.skippedInvalid += 1;
      await supabase
        .from('recovery_emails')
        .update({
          status: 'skipped',
          skipped_at: new Date().toISOString(),
          error_message: 'invalid_recovery_row',
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);
      continue;
    }

    if (await hasCompletedPurchase(supabase, row.stripe_session_id, email)) {
      counters.skippedPurchased += 1;
      await supabase
        .from('recovery_emails')
        .update({
          status: 'skipped',
          skipped_at: new Date().toISOString(),
          error_message: 'already_purchased',
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);
      continue;
    }

    if (options.dryRun) {
      counters.wouldSend += 1;
      continue;
    }

    try {
      const sendResult = await sendCheckoutRecoveryEmail({
        toEmail: email,
        recoveryUrl,
        tier,
        priceLabel: discountedPriceLabel(PRICING[tier].amount),
        consentSource,
        idempotencyKey: `checkout-recovery:${row.stripe_session_id}`,
      });

      if (sendResult.sent) {
        counters.sent += 1;
        await supabase
          .from('recovery_emails')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            resend_email_id: 'id' in sendResult ? sendResult.id : null,
            error_message: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', row.id);
      } else {
        counters.failed += 1;
        await supabase
          .from('recovery_emails')
          .update({
            status: 'failed',
            failed_at: new Date().toISOString(),
            error_message: 'reason' in sendResult ? sendResult.reason : 'not_sent',
            updated_at: new Date().toISOString(),
          })
          .eq('id', row.id);
      }
    } catch (error) {
      counters.failed += 1;
      await supabase
        .from('recovery_emails')
        .update({
          status: 'failed',
          failed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message.slice(0, 500) : 'send_failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);
    }
  }

  return counters;
}
