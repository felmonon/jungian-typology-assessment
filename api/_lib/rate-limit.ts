import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  const remaining = Math.max(0, config.limit - bucket.count);
  const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

  res.setHeader('RateLimit-Limit', String(config.limit));
  res.setHeader('RateLimit-Remaining', String(remaining));
  res.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count <= config.limit) return false;

  res.setHeader('Retry-After', String(retryAfterSeconds));
  res.status(429).json({
    error: config.message || 'Too many requests. Please try again later.',
  });
  return true;
}
