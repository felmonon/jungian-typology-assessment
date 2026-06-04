import { EMAIL_CAPTURE_OFFER } from './discount';

export const PAID_TIER_IDS = ['insight', 'mastery'] as const;

export type PaidTierId = (typeof PAID_TIER_IDS)[number];
export type PricingTierId = 'free' | PaidTierId;

export const ASSESSMENT_QUESTION_COUNT = 42;
export const ASSESSMENT_TIME_RANGE = '12-16 minutes';

export const PRICING = {
  free: {
    id: 'free',
    name: 'Free',
    price: 'CA$0',
    amount: 0,
    currency: 'CAD',
  },
  insight: {
    id: 'insight',
    name: 'Insight',
    price: 'CA$10',
    amount: 10,
    currency: 'CAD',
  },
  mastery: {
    id: 'mastery',
    name: 'Mastery',
    price: 'CA$29',
    amount: 29,
    currency: 'CAD',
  },
} as const;

export function formatCadAmount(amount: number): string {
  return Number.isInteger(amount) ? `CA$${amount}` : `CA$${amount.toFixed(2)}`;
}

export function getEmailOfferAmount(tier: PaidTierId): number {
  const multiplier = 1 - (EMAIL_CAPTURE_OFFER.percentOff / 100);
  return Math.round(PRICING[tier].amount * multiplier * 100) / 100;
}

export function getEmailOfferPrice(tier: PaidTierId): string {
  return formatCadAmount(getEmailOfferAmount(tier));
}

export const EMAIL_OFFER_PRICES: Record<PaidTierId, string> = {
  insight: getEmailOfferPrice('insight'),
  mastery: getEmailOfferPrice('mastery'),
};

export function isPaidTierId(tier: unknown): tier is PaidTierId {
  return typeof tier === 'string' && PAID_TIER_IDS.includes(tier as PaidTierId);
}
