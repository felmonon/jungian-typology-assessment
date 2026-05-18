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
    price: 'CA$19',
    amount: 19,
    currency: 'CAD',
  },
  mastery: {
    id: 'mastery',
    name: 'Mastery',
    price: 'CA$39',
    amount: 39,
    currency: 'CAD',
  },
} as const;

export function isPaidTierId(tier: unknown): tier is PaidTierId {
  return typeof tier === 'string' && PAID_TIER_IDS.includes(tier as PaidTierId);
}
