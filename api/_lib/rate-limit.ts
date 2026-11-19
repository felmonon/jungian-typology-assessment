import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from './supabase.js';

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitConfig = {
  keyPrefix: string;
  limit: number;
  windowMs: number;
  message?: string;
};

// enforceRateLimit keeps its buckets in the memory of a single serverless
// instance, so a limit holds per instance rather than across the deployment.
// enforceSharedRateLimit counts in Postgres (migration 0022, rate_limit_hit)
// so the limit holds across instances, and falls back to the in-memory
// buckets when the database call fails or is not configured.
const buckets = new Map<string, Bucket>();
let lastCleanupAt = 0;

function getHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getClientIp(req: VercelRequest): string {
  const forwardedFor = getHeaderValue(req.headers['x-forwarded-for']);
  const forwardedIp = forwardedFor?.split(',')[0]?.trim();

  return (
    getHeaderValue(req.headers['x-real-ip']) ||
    getHeaderValue(req.headers['cf-connecting-ip']) ||
    forwardedIp ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function cleanupExpiredBuckets(now: number) {
  if (now - lastCleanupAt < 60_000) return;
  lastCleanupAt = now;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function applyRateLimitResult(
  res: VercelResponse,
  config: RateLimitConfig,
  count: number,
  resetAt: number,
  now: number,
): boolean {
  const remaining = Math.max(0, config.limit - count);
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000));

  res.setHeader('RateLimit-Limit', String(config.limit));
  res.setHeader('RateLimit-Remaining', String(remaining));
  res.setHeader('RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

  if (count <= config.limit) return false;

  res.setHeader('Retry-After', String(retryAfterSeconds));
  res.status(429).json({
    error: config.message || 'Too many requests. Please try again later.',
  });
  return true;
}

export function enforceRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  config: RateLimitConfig,
): boolean {
  if (req.method === 'OPTIONS') return false;

  const now = Date.now();
  cleanupExpiredBuckets(now);

  const key = `${config.keyPrefix}:${getClientIp(req)}`;
  const current = buckets.get(key);
  const bucket = current && current.resetAt > now
    ? current
    : { count: 0, resetAt: now + config.windowMs };

  bucket.count += 1;
  buckets.set(key, bucket);

  return applyRateLimitResult(res, config, bucket.count, bucket.resetAt, now);
}

const SHARED_LIMIT_TIMEOUT_MS = 1500;

function sharedRateLimitKey(keyPrefix: string, clientIp: string): string {
  // Raw client IPs are not written to the database.
  const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex').slice(0, 32);
  return `${keyPrefix}:${ipHash}`;
}

async function hitSharedCounter(key: string, windowMs: number): Promise<{ count: number; resetAt: number } | null> {
  if (!hasSupabaseAdminConfig()) return null;

  const call = (async () => {
    const { data, error } = await getSupabaseAdminClient().rpc('rate_limit_hit', {
      p_key: key,
      p_window_ms: Math.max(1000, Math.round(windowMs)),
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    const count = Number(row?.count);
    const resetAt = Date.parse(row?.reset_at);
    if (!Number.isFinite(count) || !Number.isFinite(resetAt)) throw new Error('Malformed rate limit response');
    return { count, resetAt };
  })();

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Rate limit lookup timed out')), SHARED_LIMIT_TIMEOUT_MS);
  });

  try {
    return await Promise.race([call, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// Same contract as enforceRateLimit (true means a 429 was sent), but counted
// across all instances. Callers await it: `if (await enforceSharedRateLimit(...)) return;`
export async function enforceSharedRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  config: RateLimitConfig,
): Promise<boolean> {
  if (req.method === 'OPTIONS') return false;

  try {
    const shared = await hitSharedCounter(sharedRateLimitKey(config.keyPrefix, getClientIp(req)), config.windowMs);
    if (shared) return applyRateLimitResult(res, config, shared.count, shared.resetAt, Date.now());
  } catch (error) {
    console.warn('Shared rate limit unavailable; using in-memory limit:', error instanceof Error ? error.message : 'unknown');
  }

  return enforceRateLimit(req, res, config);
}
