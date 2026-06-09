import { discountedPriceLabel } from '../data/discount';
import { isPaidTierId, PRICING, type PaidTierId } from '../data/pricing';
import { pathWithSource } from './acquisition-source';

const PENDING_CHECKOUT_STORAGE_KEY = 'typejung_pending_checkout';
const PENDING_CHECKOUT_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const PENDING_CHECKOUT_FALLBACK_EXPIRATION_MS = 24 * 60 * 60 * 1000;
const PENDING_CHECKOUT_CHANGED_EVENT = 'typejung:pending-checkout-changed';

export type PendingCheckout = {
  tier: PaidTierId;
  sessionId?: string;
  url: string;
  createdAt: string;
  expiresAt?: string;
  source: string;
  ref?: string;
  utmCampaign?: string;
  utmSource?: string;
  sharedResult?: string;
  parentSource?: string;
  sourceChain?: string;
  status: 'open' | 'expired';
};

type PendingCheckoutAttributionInput = {
  ref?: string;
  utmCampaign?: string;
  utmSource?: string;
  sharedResult?: string;
  parentSource?: string;
  sourceChain?: string;
};

type PendingCheckoutInput = {
  tier: PaidTierId;
  url: string;
  sessionId?: string;
  expiresAt?: number | string;
  source: string;
  attribution?: PendingCheckoutAttributionInput;
};

const isStripeCheckoutUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === 'checkout.stripe.com';
  } catch {
    return false;
  }
};

export const pendingCheckoutPriceLabel = (tier: PaidTierId) =>
  discountedPriceLabel(PRICING[tier].amount);

export const pendingCheckoutName = (tier: PaidTierId) =>
  PRICING[tier].name;

const cleanToken = (value: unknown, maxLength = 100): string | undefined => {
  if (typeof value !== 'string') return undefined;

  const cleaned = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, maxLength);

  return cleaned || undefined;
};

const cleanSourceChain = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;

  const tokens = value
    .split('>')
    .map((token) => cleanToken(token, 80))
    .filter((token): token is string => Boolean(token));
  const uniqueTokens = Array.from(new Set(tokens));
  const cleaned = uniqueTokens.join('>').slice(0, 240);

  return cleaned || undefined;
};

const cleanStoredSource = (value: unknown): string =>
  cleanToken(value, 80) || 'unknown';

const notifyPendingCheckoutChanged = () => {
  if (typeof window === 'undefined') return;

  try {
    window.dispatchEvent(new Event(PENDING_CHECKOUT_CHANGED_EVENT));
  } catch {
    // Non-critical analytics/UI refresh signal.
  }
};

function normalizeExpiresAt(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const timestamp = value > 10_000_000_000 ? value : value * 1000;
    return new Date(timestamp).toISOString();
  }

  if (typeof value !== 'string' || !value.trim()) return undefined;

  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) {
    const timestamp = numericValue > 10_000_000_000 ? numericValue : numericValue * 1000;
    return new Date(timestamp).toISOString();
  }

  const parsedMs = Date.parse(value);
  return Number.isFinite(parsedMs) ? new Date(parsedMs).toISOString() : undefined;
}

export const clearPendingCheckout = () => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(PENDING_CHECKOUT_STORAGE_KEY);
    notifyPendingCheckoutChanged();
  } catch {
    // Non-critical cleanup.
  }
};

export const readPendingCheckout = (): PendingCheckout | null => {
  if (typeof window === 'undefined') return null;

  try {
    const parsed = JSON.parse(localStorage.getItem(PENDING_CHECKOUT_STORAGE_KEY) || 'null');
    if (!parsed || typeof parsed !== 'object') return null;

    const tier = (parsed as Partial<PendingCheckout>).tier;
    const url = (parsed as Partial<PendingCheckout>).url;
    const createdAt = (parsed as Partial<PendingCheckout>).createdAt;
    const source = (parsed as Partial<PendingCheckout>).source;
    const sessionId = (parsed as Partial<PendingCheckout>).sessionId;
    const expiresAt = normalizeExpiresAt((parsed as Partial<PendingCheckout>).expiresAt);
    const ref = cleanToken((parsed as Partial<PendingCheckout>).ref);
    const utmCampaign = cleanToken((parsed as Partial<PendingCheckout>).utmCampaign ?? (parsed as any).utm_campaign);
    const utmSource = cleanToken((parsed as Partial<PendingCheckout>).utmSource ?? (parsed as any).utm_source);
    const sharedResult = cleanToken((parsed as Partial<PendingCheckout>).sharedResult ?? (parsed as any).shared_result);
    const parentSource = cleanToken((parsed as Partial<PendingCheckout>).parentSource ?? (parsed as any).parent_source);
    const sourceChain = cleanSourceChain((parsed as Partial<PendingCheckout>).sourceChain ?? (parsed as any).source_chain);

    if (!isPaidTierId(tier) || typeof url !== 'string' || !isStripeCheckoutUrl(url)) {
      clearPendingCheckout();
      return null;
    }

    const createdAtMs = typeof createdAt === 'string' ? Date.parse(createdAt) : NaN;
    if (!Number.isFinite(createdAtMs) || Date.now() - createdAtMs > PENDING_CHECKOUT_MAX_AGE_MS) {
      clearPendingCheckout();
      return null;
    }

    // Legacy saved Stripe URLs did not include expiresAt and may point at older
    // full-price sessions. Restart those from the site so pricing stays current.
    const status: PendingCheckout['status'] = !expiresAt || Date.now() > Date.parse(expiresAt)
      ? 'expired'
      : 'open';

    return {
      tier,
      url,
      createdAt: typeof createdAt === 'string' ? createdAt : new Date(createdAtMs).toISOString(),
      ...(expiresAt ? { expiresAt } : {}),
      source: cleanStoredSource(source),
      ...(ref ? { ref } : {}),
      ...(utmCampaign ? { utmCampaign } : {}),
      ...(utmSource ? { utmSource } : {}),
      ...(sharedResult ? { sharedResult } : {}),
      ...(parentSource ? { parentSource } : {}),
      ...(sourceChain ? { sourceChain } : {}),
      status,
      ...(typeof sessionId === 'string' && sessionId.trim() ? { sessionId: sessionId.trim().slice(0, 120) } : {}),
    };
  } catch {
    clearPendingCheckout();
    return null;
  }
};

export const pendingCheckoutRestartPath = (
  pendingCheckout: PendingCheckout,
  source = 'global_recovery_banner',
) => pathWithSource(`/checkout/${pendingCheckout.tier}`, source, {
  restart: 'pending_checkout',
  ...(pendingCheckout.ref ? { ref: pendingCheckout.ref } : {}),
  ...(pendingCheckout.utmCampaign ? { utm_campaign: pendingCheckout.utmCampaign } : {}),
  ...(pendingCheckout.utmSource ? { utm_source: pendingCheckout.utmSource } : {}),
  ...(pendingCheckout.sharedResult ? { shared_result: pendingCheckout.sharedResult } : {}),
  ...(pendingCheckout.sourceChain ? { source_chain: pendingCheckout.sourceChain } : {}),
  parent_source: pendingCheckout.parentSource || pendingCheckout.source,
});

export const writePendingCheckout = ({ tier, url, sessionId, expiresAt, source, attribution }: PendingCheckoutInput) => {
  if (typeof window === 'undefined' || !isStripeCheckoutUrl(url)) return;

  const normalizedExpiresAt = normalizeExpiresAt(expiresAt)
    || new Date(Date.now() + PENDING_CHECKOUT_FALLBACK_EXPIRATION_MS).toISOString();

  try {
    localStorage.setItem(PENDING_CHECKOUT_STORAGE_KEY, JSON.stringify({
      tier,
      url,
      sessionId,
      expiresAt: normalizedExpiresAt,
      source: cleanStoredSource(source),
      ref: cleanToken(attribution?.ref),
      utmCampaign: cleanToken(attribution?.utmCampaign),
      utmSource: cleanToken(attribution?.utmSource),
      sharedResult: cleanToken(attribution?.sharedResult),
      parentSource: cleanToken(attribution?.parentSource),
      sourceChain: cleanSourceChain(attribution?.sourceChain),
      createdAt: new Date().toISOString(),
    }));
    notifyPendingCheckoutChanged();
  } catch {
    // Non-critical persistence.
  }
};
