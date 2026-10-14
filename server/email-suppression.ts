import crypto from 'crypto';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from '../api/_lib/supabase.js';
import { getEnvValue } from './env.js';

export type SuppressionReason = 'unsubscribe' | 'bounce' | 'complaint' | 'manual';

export type EmailCategory = 'marketing' | 'transactional' | 'internal';

export type SuppressionCheck =
  | { suppressed: false }
  | { suppressed: true; reason: SuppressionReason | 'suppression_check_failed' };

const SUPPRESSIONS_TABLE = 'email_suppressions';
const DEFAULT_SITE_URL = 'https://typejung.com';
// Reasons that mean the address cannot or must not receive any mail at all,
// so they block transactional sends too. An unsubscribe only stops marketing.
const HARD_SUPPRESSION_REASONS = new Set<string>(['bounce', 'complaint']);

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === '42P01'
    || error.code === 'PGRST205'
    || (/email_suppressions/.test(error.message || '') && /does not exist|schema cache/.test(error.message || ''));
}

export async function getEmailSuppression(email: string): Promise<{ reason: string } | null> {
  if (!hasSupabaseAdminConfig()) return null;

  const { data, error } = await getSupabaseAdminClient()
    .from(SUPPRESSIONS_TABLE)
    .select('reason')
    .eq('email', normalizeEmail(email))
    .maybeSingle();

  if (error) {
    // Until migration 0019 is applied nobody can be on the list, so a missing
    // table must not stop every email.
    if (isMissingTableError(error)) return null;
    throw new Error(`Email suppression lookup failed: ${error.message}`);
  }

  return data ? { reason: String(data.reason || 'unsubscribe') } : null;
}

export async function checkEmailSuppression(email: string, category: EmailCategory): Promise<SuppressionCheck> {
  if (category === 'internal') return { suppressed: false };

  let suppression: { reason: string } | null;
  try {
    suppression = await getEmailSuppression(email);
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Email suppression lookup failed');
    // Marketing fails closed so an outage never mails someone who opted out;
    // transactional mail (a paid report) fails open.
    return category === 'marketing'
      ? { suppressed: true, reason: 'suppression_check_failed' }
      : { suppressed: false };
  }

  if (!suppression) return { suppressed: false };
  if (category === 'marketing' || HARD_SUPPRESSION_REASONS.has(suppression.reason)) {
    return { suppressed: true, reason: suppression.reason as SuppressionReason };
  }
  return { suppressed: false };
}

export async function suppressEmail(
  email: string,
  reason: SuppressionReason,
  source?: string,
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await getSupabaseAdminClient()
    .from(SUPPRESSIONS_TABLE)
    .upsert(
      { email: normalizeEmail(email), reason, source: source || null, updated_at: now },
      { onConflict: 'email' },
    );

  if (error) {
    throw new Error(`Email suppression write failed: ${error.message}`);
  }
}

function getUnsubscribeSecret(): string {
  const secret = getEnvValue('EMAIL_UNSUBSCRIBE_SECRET') || getEnvValue('SESSION_SECRET');
  if (!secret) {
    throw new Error('EMAIL_UNSUBSCRIBE_SECRET or SESSION_SECRET must be set');
  }
  return secret;
}

function signEmail(normalizedEmail: string): string {
  return crypto
    .createHmac('sha256', getUnsubscribeSecret())
    .update(`unsubscribe:${normalizedEmail}`)
    .digest('base64url');
}

export function createUnsubscribeToken(email: string): string {
  const normalized = normalizeEmail(email);
  return `${Buffer.from(normalized).toString('base64url')}.${signEmail(normalized)}`;
}

export function verifyUnsubscribeToken(token: unknown): string | null {
  if (typeof token !== 'string' || token.length > 1024) return null;

  const [encodedEmail, signature, extra] = token.split('.');
  if (!encodedEmail || !signature || extra !== undefined) return null;

  const email = Buffer.from(encodedEmail, 'base64url').toString('utf8');
  if (!email.includes('@') || email !== normalizeEmail(email)) return null;

  const expected = Buffer.from(signEmail(email));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;

  return email;
}

export function getSiteUrl(): string {
  return (getEnvValue('PUBLIC_SITE_URL') || DEFAULT_SITE_URL).replace(/\/$/, '');
}

export function buildUnsubscribeUrl(email: string): string {
  return `${getSiteUrl()}/api/unsubscribe?token=${encodeURIComponent(createUnsubscribeToken(email))}`;
}
