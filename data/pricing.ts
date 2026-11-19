export const PAID_TIER_IDS = ['insight', 'mastery'] as const;

export type PaidTierId = (typeof PAID_TIER_IDS)[number];
export type PricingTierId = 'free' | PaidTierId;

// List prices are what Stripe charges. No promotion code is applied
// automatically; a code the buyer types on Stripe (for example from an older
// email) can still lower the total there.
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
    price: 'CA$7',
    amount: 7,
    currency: 'CAD',
  },
  mastery: {
    id: 'mastery',
    name: 'Mastery',
    price: 'CA$19',
    amount: 19,
    currency: 'CAD',
  },
} as const;

// An Insight buyer upgrading to Mastery pays only the difference.
export const MASTERY_UPGRADE_DELTA_AMOUNT =
  Math.round((PRICING.mastery.amount - PRICING.insight.amount) * 100) / 100;

export const amountInCents = (amount: number) => Math.round(amount * 100);

export function isPaidTierId(tier: unknown): tier is PaidTierId {
  return typeof tier === 'string' && PAID_TIER_IDS.includes(tier as PaidTierId);
}
