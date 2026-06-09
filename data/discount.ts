export const EMAIL_CAPTURE_OFFER = {
  code: 'TYPEJUNG30',
  percentOff: 30,
  appliesTo: 'Insight or Mastery',
} as const;

const centsForAmount = (amount: number) => Math.round(amount * 100);

export const formatCadAmount = (amount: number) => {
  const cents = centsForAmount(amount);
  const dollars = cents / 100;
  return cents % 100 === 0 ? `CA$${dollars.toFixed(0)}` : `CA$${dollars.toFixed(2)}`;
};

export const discountedAmount = (amount: number) => {
  const baseCents = centsForAmount(amount);
  const discountedCents = Math.round(baseCents * (100 - EMAIL_CAPTURE_OFFER.percentOff) / 100);
  return discountedCents / 100;
};

export const discountSavingsAmount = (amount: number) =>
  (centsForAmount(amount) - centsForAmount(discountedAmount(amount))) / 100;

export const discountedPriceLabel = (amount: number) =>
  formatCadAmount(discountedAmount(amount));

export const discountSavingsLabel = (amount: number) =>
  `Save ${formatCadAmount(discountSavingsAmount(amount))}`;
