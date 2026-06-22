// Personal Type Debrief: a founder-reviewed, human-delivered interpretation of
// a TypeJung result. Unlike Insight/Mastery this is a service, not a feature
// unlock — it never grants premium access and is excluded from TYPEJUNG30.
export const DEBRIEF_OFFER = {
  id: 'debrief',
  name: 'Personal Type Debrief',
  price: 'CA$129',
  amount: 129,
  currency: 'CAD',
  deliveryHours: 72,
  weeklyCap: 5,
  // The Stripe metadata.product value that routes a session around the
  // premium-granting purchase path. Must match the webhook/verify-session guard.
  productTag: 'typejung_debrief',
} as const;

// Cap intake answers so they fit comfortably inside Stripe metadata (500 char
// limit per value) — this lets the founder notification email be built from the
// session metadata without depending on a database lookup.
export const DEBRIEF_FIELD_MAX = 480;

export type DebriefIntake = {
  email: string;
  resultSummary: string;
  testedAs: string;
  stuckBetween: string;
  feltAccurate: string;
  feltConfusing: string;
};
