export const PAID_TIER_IDS = ['insight', 'mastery'] as const;

export type PaidTierId = (typeof PAID_TIER_IDS)[number];
export type PricingTierId = 'free' | PaidTierId;

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

export function isPaidTierId(tier: unknown): tier is PaidTierId {
  return typeof tier === 'string' && PAID_TIER_IDS.includes(tier as PaidTierId);
}
