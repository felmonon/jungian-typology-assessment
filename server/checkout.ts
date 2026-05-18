import { isPaidTierId } from '../data/pricing.js';
import type { PaidTierId } from '../data/pricing.js';

const DEFAULT_CHECKOUT_BASE_URL = 'https://typejung.com';

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function originFromHost(host: string | undefined): string | undefined {
  if (!host) return undefined;
  const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

function isAllowedCheckoutOrigin(url: URL): boolean {
  const host = url.hostname.toLowerCase();

  if (host === 'typejung.com' || host === 'www.typejung.com') return true;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  return host.endsWith('.vercel.app') && host.includes('jungian-typology-assessment');
}

export function parsePaidTier(tier: unknown): PaidTierId | null {
  return isPaidTierId(tier) ? tier : null;
}

export function cleanStripeEnvValue(value: string | undefined): string | undefined {
  const cleaned = value?.trim().replace(/\\n+$/g, '').trim();
  return cleaned || undefined;
}

export function getStripeSecretKey(): string | undefined {
  return cleanStripeEnvValue(process.env.STRIPE_SECRET_KEY);
}

export function getStripeWebhookSecret(): string | undefined {
  return cleanStripeEnvValue(process.env.STRIPE_WEBHOOK_SECRET);
}

export function getStripePriceIdForTier(tier: PaidTierId): string | undefined {
  const priceId = tier === 'insight'
    ? process.env.STRIPE_INSIGHT_PRICE_ID
    : process.env.STRIPE_MASTERY_PRICE_ID;

  return cleanStripeEnvValue(priceId);
}

export function resolveCheckoutBaseUrl(
  originHeader: string | string[] | undefined,
  hostHeader?: string | string[] | undefined,
): string {
  const candidate = firstHeaderValue(originHeader) || originFromHost(firstHeaderValue(hostHeader));

  if (!candidate) return DEFAULT_CHECKOUT_BASE_URL;

  try {
    const url = new URL(candidate);
    if (!isAllowedCheckoutOrigin(url)) return DEFAULT_CHECKOUT_BASE_URL;
    return url.origin;
  } catch {
    return DEFAULT_CHECKOUT_BASE_URL;
  }
}
