import fs from 'node:fs';
import process from 'node:process';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const envArg = process.argv.slice(2).find((arg) => arg.startsWith('--env='));
const maxPagesArg = process.argv.slice(2).find((arg) => arg.startsWith('--max-pages='));
const maxPages = maxPagesArg ? Number(maxPagesArg.split('=')[1]) : Infinity;

function parseDotEnv(path) {
  if (!path || !fs.existsSync(path)) return {};

  const env = {};
  const text = fs.readFileSync(path, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const raw = line.slice(index + 1).trim();

    try {
      env[key] = raw.startsWith('"') ? JSON.parse(raw) : raw;
    } catch {
      env[key] = raw.replace(/^"|"$/g, '');
    }
  }

  return env;
}

const fileEnv = parseDotEnv(envArg?.slice('--env='.length));
const env = { ...fileEnv, ...process.env };

function requiredEnv(name) {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function stripeId(value) {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id || null;
}

function isoFromSeconds(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return new Date(value * 1000).toISOString();
}

function cleanMetadataToken(value, maxLength = 120) {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().slice(0, maxLength);
  return cleaned || null;
}

function recoveryConsent(session) {
  const metadataConsent = cleanMetadataToken(session.metadata?.recovery_email_consent, 80);
  if (metadataConsent) return metadataConsent;
  if (session.consent?.promotions === 'opt_in') return 'stripe_opt_in';
  return 'none';
}

function checkoutEmailSource(session) {
  const metadataSource = cleanMetadataToken(session.metadata?.checkout_email_source, 80);
  if (metadataSource) return metadataSource;
  if (session.customer_details?.email || session.customer_email) return 'stripe_customer';
  return 'none';
}

function statusFromSession(session) {
  if (session.payment_status === 'paid') return 'completed';
  if (session.status === 'expired') return 'expired';
  return 'stripe_created';
}

function intentFromSession(session) {
  const status = statusFromSession(session);
  const expiresAt = isoFromSeconds(session.expires_at);

  return {
    stripe_session_id: session.id,
    payment_intent_id: stripeId(session.payment_intent),
    status,
    tier: cleanMetadataToken(session.metadata?.tier, 80),
    amount: typeof session.amount_total === 'number' ? session.amount_total : null,
    currency: cleanMetadataToken(session.currency, 12),
    source: cleanMetadataToken(session.metadata?.source, 120) || 'stripe_backfill',
    acquisition_source: cleanMetadataToken(session.metadata?.acquisition_source, 120)
      || cleanMetadataToken(session.metadata?.source, 120)
      || 'stripe_backfill',
    acquisition_ref: cleanMetadataToken(session.metadata?.acquisition_ref, 120),
    utm_campaign: cleanMetadataToken(session.metadata?.utm_campaign, 100),
    utm_source: cleanMetadataToken(session.metadata?.utm_source, 100),
    shared_result: cleanMetadataToken(session.metadata?.shared_result, 100),
    parent_source: cleanMetadataToken(session.metadata?.parent_source, 100),
    source_chain: cleanMetadataToken(session.metadata?.source_chain, 240),
    checkout_email_source: checkoutEmailSource(session),
    has_customer_email: Boolean(session.customer_details?.email || session.customer_email),
    recovery_email_consent: recoveryConsent(session),
    stripe_status: cleanMetadataToken(session.payment_status || session.status, 80),
    created_at: isoFromSeconds(session.created),
    updated_at: new Date().toISOString(),
    expires_at: expiresAt,
    completed_at: status === 'completed' ? isoFromSeconds(session.created) : null,
    expired_at: status === 'expired' ? expiresAt : null,
  };
}

function summarize(intents) {
  const summary = {
    total: intents.length,
    completed: 0,
    expired: 0,
    stripeCreated: 0,
    withCustomerEmail: 0,
    siteRecoveryConsent: 0,
    stripeRecoveryConsent: 0,
  };

  for (const intent of intents) {
    if (intent.status === 'completed') summary.completed += 1;
    if (intent.status === 'expired') summary.expired += 1;
    if (intent.status === 'stripe_created') summary.stripeCreated += 1;
    if (intent.has_customer_email) summary.withCustomerEmail += 1;
    if (intent.recovery_email_consent === 'site_opt_in') summary.siteRecoveryConsent += 1;
    if (intent.recovery_email_consent === 'stripe_opt_in') summary.stripeRecoveryConsent += 1;
  }

  return summary;
}

async function main() {
  if (!Number.isFinite(maxPages) && maxPages !== Infinity) {
    throw new Error('--max-pages must be a number');
  }

  const stripe = new Stripe(requiredEnv('STRIPE_SECRET_KEY'));
  const supabase = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const intents = [];
  let startingAfter;
  let page = 0;

  do {
    page += 1;
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    intents.push(...sessions.data.map(intentFromSession));
    startingAfter = sessions.has_more ? sessions.data.at(-1)?.id : undefined;

    if (!sessions.has_more || page >= maxPages) break;
  } while (startingAfter);

  const summary = summarize(intents);
  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    pagesRead: page,
    ...summary,
  }, null, 2));

  if (!apply || intents.length === 0) return;

  for (let index = 0; index < intents.length; index += 100) {
    const batch = intents.slice(index, index + 100);
    const { error } = await supabase
      .from('checkout_intents')
      .upsert(batch, { onConflict: 'stripe_session_id' });

    if (error) {
      throw new Error(`checkout_intents upsert failed: ${error.message}`);
    }
  }

  console.log(JSON.stringify({
    upserted: intents.length,
    note: 'No payment was created or modified; only checkout session metadata was copied into checkout_intents.',
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
