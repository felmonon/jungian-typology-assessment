// TYPEJUNG30 is no longer applied automatically. Stripe still accepts it when
// a buyer types it (older emails and links carry it), so the offer stays
// defined here, but site copy should not advertise it.
export const EMAIL_CAPTURE_OFFER = {
  code: 'TYPEJUNG30',
  percentOff: 30,
  appliesTo: 'Insight or Mastery',
} as const;

// Percentage taken off automatically before Stripe. Zero: checkout charges the
// list price in data/pricing.ts.
export const AUTO_APPLIED_PERCENT_OFF = 0;

const centsForAmount = (amount: number) => Math.round(amount * 100);

export const formatCadAmount = (amount: number) => {
  const cents = centsForAmount(amount);
  const dollars = cents / 100;
  return cents % 100 === 0 ? `CA$${dollars.toFixed(0)}` : `CA$${dollars.toFixed(2)}`;
};

// What checkout charges for a list price. With no automatic discount this is
// the list price itself.
export const checkoutAmount = (amount: number) => {
  const baseCents = centsForAmount(amount);
  const chargedCents = Math.round(baseCents * (100 - AUTO_APPLIED_PERCENT_OFF) / 100);
  return chargedCents / 100;
};

export const checkoutPriceLabel = (amount: number) =>
  formatCadAmount(checkoutAmount(amount));

// The names below predate the switch to list prices. They are kept so existing
// callers keep compiling and show what Stripe charges; new code should read
// PRICING[tier].price / .amount directly.

/** @deprecated Checkout charges the list price. Use PRICING[tier].amount. */
export const discountedAmount = checkoutAmount;

/** @deprecated No automatic discount, so this is always 0. */
export const discountSavingsAmount = (amount: number) =>
  (centsForAmount(amount) - centsForAmount(checkoutAmount(amount))) / 100;

/** @deprecated Checkout charges the list price. Use PRICING[tier].price. */
export const discountedPriceLabel = checkoutPriceLabel;
