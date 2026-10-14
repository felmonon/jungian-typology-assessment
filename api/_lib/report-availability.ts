import type { VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { generateGeminiText } from './gemini.js';
import { recordFunnelEvent } from './funnel-events.js';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from './supabase.js';

// A healthy probe is trusted for a few minutes so a buyer who retries, or a
// new buyer upgrading right after purchase, does not wait on a second probe.
// Failures are never cached: the next attempt always probes again.
const HEALTHY_PROBE_TTL_MS = 5 * 60 * 1000;
// Gemini rejects deadlines below 10 seconds, even for a one-word probe.
const PROBE_TIMEOUT_MS = 15000;
// Only retry failures that come back quickly (provider 5xx/429 blips), never a
// probe that already used most of its deadline.
const FAST_FAILURE_RETRY_MS = 5000;

let lastHealthyProbeAt = 0;

export type GuardBlockReason = 'timeout' | 'provider_error' | 'unexpected_response';

export type GuardCheckoutContext = {
  tier?: string | null;
  source?: string | null;
  anonymousId?: string | null;
};

export function resetReportAvailabilityCache() {
  lastHealthyProbeAt = 0;
}

type ProbeResult = { ok: boolean; reason: GuardBlockReason | null; elapsedMs: number };

async function probeOnce(): Promise<ProbeResult> {
  const startedAt = Date.now();
  try {
    const response = await generateGeminiText('Reply with exactly the word READY.', {
      temperature: 0,
      maxOutputTokens: 16,
      thinkingBudget: 0,
      timeoutMs: PROBE_TIMEOUT_MS,
    });
    if (/^READY[.!]?$/i.test(response.trim())) return { ok: true, reason: null, elapsedMs: Date.now() - startedAt };
    return { ok: false, reason: 'unexpected_response', elapsedMs: Date.now() - startedAt };
  } catch (error) {
    const elapsedMs = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : '';
    const reason: GuardBlockReason = /timeout|deadline|abort/i.test(message) || elapsedMs >= PROBE_TIMEOUT_MS - 500
      ? 'timeout'
      : 'provider_error';
    return { ok: false, reason, elapsedMs };
  }
}

async function recordGuardBlocked(context: GuardCheckoutContext, reason: GuardBlockReason, attempts: number) {
  if (!hasSupabaseAdminConfig()) return;

  try {
    await recordFunnelEvent(getSupabaseAdminClient(), {
      eventId: `checkout_guard_blocked:${randomUUID()}`,
      eventName: 'checkout_guard_blocked',
      anonymousId: context.anonymousId,
      source: context.source,
      tier: context.tier,
      properties: { reason, attempts },
    });
  } catch (error) {
    console.warn('Checkout guard block could not be recorded:', error instanceof Error ? error.message : 'unknown');
  }
}

// A tiny request to the same provider/model checks billing and availability
// before a new paid checkout is created. No customer data is sent in the probe.
export async function guardPaidReportCheckout(
  res: VercelResponse,
  context: GuardCheckoutContext = {},
): Promise<boolean> {
  if (Date.now() - lastHealthyProbeAt < HEALTHY_PROBE_TTL_MS) return true;

  let attempts = 1;
  let result = await probeOnce();
  if (!result.ok && result.reason !== 'timeout' && result.elapsedMs < FAST_FAILURE_RETRY_MS) {
    attempts = 2;
    result = await probeOnce();
  }

  if (result.ok) {
    lastHealthyProbeAt = Date.now();
    return true;
  }

  // Provider details stay out of customer responses; the reason category is
  // stored so outages show up in the funnel instead of as silent lost sales.
  const reason = result.reason ?? 'provider_error';
  console.error(`Paid checkout paused: report generation service is unavailable (${reason}, ${attempts} attempt(s))`);
  await recordGuardBlocked(context, reason, attempts);
  res.setHeader('Retry-After', '60');
  res.setHeader('Cache-Control', 'no-store');
  res.status(503).json({
    code: 'reports_temporarily_unavailable',
    error: 'Personalized reports are temporarily unavailable. Please try again later. The free assessment and your saved map remain available.',
  });
  return false;
}
