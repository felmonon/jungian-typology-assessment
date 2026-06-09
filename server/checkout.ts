import { isPaidTierId } from '../data/pricing.js';
import type { PaidTierId } from '../data/pricing.js';
import { EMAIL_CAPTURE_OFFER } from '../data/discount.js';
import { cleanEnvValue } from './env.js';

const DEFAULT_CHECKOUT_BASE_URL = 'https://typejung.com';
const DEFAULT_WALLET_PAYMENT_METHOD_CONFIGURATION_ID = 'pmc_1SPRZeGeCLOK5swhDiddUaPL';

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
  return cleanEnvValue(value);
}

export function getStripeSecretKey(): string | undefined {
  return cleanStripeEnvValue(process.env.STRIPE_SECRET_KEY);
}

export function getStripeWebhookSecret(): string | undefined {
  return cleanStripeEnvValue(process.env.STRIPE_WEBHOOK_SECRET);
}

export function getStripePaymentMethodConfigurationId(): string | undefined {
  return cleanStripeEnvValue(
    process.env.STRIPE_PAYMENT_METHOD_CONFIGURATION_ID || DEFAULT_WALLET_PAYMENT_METHOD_CONFIGURATION_ID,
  );
}

export function getStripePriceIdForTier(tier: PaidTierId): string | undefined {
  const priceId = tier === 'insight'
    ? process.env.STRIPE_INSIGHT_PRICE_ID
    : process.env.STRIPE_MASTERY_PRICE_ID;

  return cleanStripeEnvValue(priceId);
}

export function cleanPromotionCode(value: string | undefined): string | null {
  const cleaned = value?.trim().toUpperCase();
  return cleaned && /^[A-Z0-9_-]{3,80}$/.test(cleaned) ? cleaned : null;
}

export function getAutoPromotionCode(): string | null {
  return cleanPromotionCode(process.env.EMAIL_CAPTURE_DISCOUNT_CODE || EMAIL_CAPTURE_OFFER.code);
}

export async function findActivePromotionCodeId(
  stripe: { promotionCodes: { list: (params: { code: string; active: boolean; limit: number }) => Promise<{ data: Array<{ id?: string }> }> } },
  code: string,
): Promise<string | null> {
  try {
    const promotionCodes = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1,
    });
    return promotionCodes.data[0]?.id || null;
  } catch (error) {
    console.warn('Stripe promotion code lookup failed:', error instanceof Error ? error.message : 'Unknown Stripe error');
    return null;
  }
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
