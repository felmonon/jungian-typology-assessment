export type PurchaseMetricRow = {
  id?: string | null;
  user_id?: string | null;
  customer_email?: string | null;
  amount?: number | null;
  tier?: string | null;
  source?: string | null;
  acquisition_source?: string | null;
  utm_campaign?: string | null;
  utm_source?: string | null;
  parent_source?: string | null;
  source_chain?: string | null;
  created_at?: string | null;
};

export type DiscountLeadMetricRow = {
  id?: string | null;
  email?: string | null;
  source?: string | null;
  tier_intent?: string | null;
  email_sent?: boolean | null;
  followup_email_sent?: boolean | null;
  followup_email_sent_id?: string | null;
  followup_email_error?: string | null;
  second_followup_email_sent?: boolean | null;
  second_followup_email_sent_id?: string | null;
  second_followup_email_error?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  parent_source?: string | null;
  source_chain?: string | null;
  created_at?: string | null;
};

export type CheckoutIntentMetricRow = {
  id?: string | null;
  stripe_session_id?: string | null;
  status?: string | null;
  amount?: number | null;
  tier?: string | null;
  source?: string | null;
  acquisition_source?: string | null;
  utm_campaign?: string | null;
  utm_source?: string | null;
  parent_source?: string | null;
  source_chain?: string | null;
  checkout_email_source?: string | null;
  has_customer_email?: boolean | null;
  recovery_email_consent?: string | null;
  created_at?: string | null;
  expires_at?: string | null;
  completed_at?: string | null;
  expired_at?: string | null;
};

export type AssessmentMetricRow = {
  stack?: unknown;
  created_at?: string | null;
};

export type PurchaseSourceSummary = {
  source: string;
  count: number;
  revenueCad: number;
};

export type PurchaseChainSummary = {
  sourceChain: string;
  count: number;
  revenueCad: number;
};

export type DiscountLeadSourceSummary = {
  source: string;
  count: number;
  recoverableCount: number;
  awaitingFollowupCount: number;
  awaitingSecondFollowupCount: number;
  followupSentCount: number;
  secondFollowupSentCount: number;
  skippedPurchasedCount: number;
  skippedInvalidEmailCount: number;
};

export type CheckoutIntentSourceSummary = {
  source: string;
  intentCount: number;
  stripeCreatedCount: number;
  completedCount: number;
  expiredCount: number;
  failedCount: number;
  recoverableAbandonedCount: number;
  unrecoverableAbandonedCount: number;
};

export type CheckoutIntentChainSummary = {
  sourceChain: string;
  intentCount: number;
  stripeCreatedCount: number;
  completedCount: number;
  expiredCount: number;
  failedCount: number;
  recoverableAbandonedCount: number;
  unrecoverableAbandonedCount: number;
};

const CUSTOMER_GOAL = 100;

function customerKey(row: PurchaseMetricRow, index: number): string {
  const email = typeof row.customer_email === 'string' ? row.customer_email.trim().toLowerCase() : '';
  if (email) return `email:${email}`;

  const userId = typeof row.user_id === 'string' ? row.user_id.trim() : '';
  if (userId) return `user:${userId}`;

  const id = typeof row.id === 'string' ? row.id.trim() : '';
  return id ? `purchase:${id}` : `purchase:index:${index}`;
}

function cadFromCents(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value / 100 : 0;
}

function isWithinDays(isoDate: unknown, days: number, now = new Date()): boolean {
  if (typeof isoDate !== 'string') return false;
  const parsed = Date.parse(isoDate);
  if (!Number.isFinite(parsed)) return false;
  return now.getTime() - parsed <= days * 24 * 60 * 60 * 1000;
}

function sourceKey(row: PurchaseMetricRow): string {
  return (
    row.utm_source?.trim()
    || row.acquisition_source?.trim()
    || row.source?.trim()
    || 'unknown'
  ).slice(0, 100);
}

function chainKey(row: { source_chain?: string | null; parent_source?: string | null; source?: string | null; acquisition_source?: string | null; utm_source?: string | null }): string {
  return (
    row.source_chain?.trim()
    || [
      row.parent_source?.trim(),
      row.utm_source?.trim() || row.acquisition_source?.trim() || row.source?.trim(),
    ].filter(Boolean).join('>')
    || 'unknown'
  ).slice(0, 240);
}

function leadSourceKey(row: DiscountLeadMetricRow): string {
  return (
    row.utm_source?.trim()
    || row.source?.trim()
    || row.parent_source?.trim()
    || 'unknown'
  ).slice(0, 100);
}

function discountLeadIdentityKey(row: DiscountLeadMetricRow, index: number): string {
  const email = typeof row.email === 'string' ? row.email.trim().toLowerCase() : '';
  if (email) {
    return [
      email,
      row.source?.trim() || 'unknown',
      row.tier_intent?.trim() || 'any',
    ].join('|');
  }

  const id = typeof row.id === 'string' ? row.id.trim() : '';
  return id ? `lead:${id}` : `lead:index:${index}`;
}

function uniqueDiscountLeadRows(rows: DiscountLeadMetricRow[]): DiscountLeadMetricRow[] {
  const seen = new Set<string>();

  return rows.filter((row, index) => {
    const key = discountLeadIdentityKey(row, index);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function followupError(row: DiscountLeadMetricRow, stage: 'first' | 'second'): string {
  const value = stage === 'second' ? row.second_followup_email_error : row.followup_email_error;
  return typeof value === 'string' ? value.trim() : '';
}

function followupWasSent(row: DiscountLeadMetricRow, stage: 'first' | 'second' = 'first'): boolean {
  const sent = stage === 'second' ? row.second_followup_email_sent : row.followup_email_sent;
  const error = followupError(row, stage);

  return sent === true && !error.startsWith('skipped_');
}

function followupWasSkipped(row: DiscountLeadMetricRow, reason: 'skipped_already_purchased' | 'skipped_invalid_email'): boolean {
  return followupError(row, 'first') === reason || followupError(row, 'second') === reason;
}

function checkoutIntentSourceKey(row: CheckoutIntentMetricRow): string {
  return (
    row.utm_source?.trim()
    || row.acquisition_source?.trim()
    || row.source?.trim()
    || 'unknown'
  ).slice(0, 100);
}

function checkoutIntentCompleted(row: CheckoutIntentMetricRow): boolean {
  return row.status === 'completed' || typeof row.completed_at === 'string';
}

function checkoutIntentExpired(row: CheckoutIntentMetricRow, now: Date): boolean {
  if (row.status === 'expired' || typeof row.expired_at === 'string') return true;
  if (checkoutIntentCompleted(row)) return false;
  if (!row.expires_at || !row.stripe_session_id) return false;

  const parsed = Date.parse(row.expires_at);
  return Number.isFinite(parsed) && parsed <= now.getTime();
}

function checkoutIntentStripeCreated(row: CheckoutIntentMetricRow): boolean {
  return Boolean(row.stripe_session_id)
    || row.status === 'stripe_created'
    || row.status === 'completed'
    || row.status === 'expired';
}

function checkoutIntentFailed(row: CheckoutIntentMetricRow): boolean {
  return row.status === 'stripe_failed';
}

function checkoutIntentHasRecoveryConsent(row: CheckoutIntentMetricRow): boolean {
  const value = typeof row.recovery_email_consent === 'string'
    ? row.recovery_email_consent.trim().toLowerCase()
    : '';

  return Boolean(row.has_customer_email) && value !== '' && value !== 'none';
}

export function summarizePurchases(rows: PurchaseMetricRow[], now = new Date()) {
  const uniqueCustomers = new Set<string>();
  const sourceMap = new Map<string, PurchaseSourceSummary>();
  const chainMap = new Map<string, PurchaseChainSummary>();
  let revenueCad = 0;
  let insightPurchaseCount = 0;
  let masteryPurchaseCount = 0;
  let purchasesLast7Days = 0;

  rows.forEach((row, index) => {
    uniqueCustomers.add(customerKey(row, index));
    const amountCad = cadFromCents(row.amount);
    revenueCad += amountCad;

    if (row.tier === 'insight') insightPurchaseCount += 1;
    if (row.tier === 'mastery') masteryPurchaseCount += 1;
    if (isWithinDays(row.created_at, 7, now)) purchasesLast7Days += 1;

    const key = sourceKey(row);
    const current = sourceMap.get(key) || { source: key, count: 0, revenueCad: 0 };
    current.count += 1;
    current.revenueCad += amountCad;
    sourceMap.set(key, current);

    const chain = chainKey(row);
    const currentChain = chainMap.get(chain) || { sourceChain: chain, count: 0, revenueCad: 0 };
    currentChain.count += 1;
    currentChain.revenueCad += amountCad;
    chainMap.set(chain, currentChain);
  });

  const uniquePayingCustomers = uniqueCustomers.size;

  return {
    purchaseCount: rows.length,
    uniquePayingCustomers,
    payingCustomerGoal: CUSTOMER_GOAL,
    payingCustomerRemaining: Math.max(0, CUSTOMER_GOAL - uniquePayingCustomers),
    payingCustomerProgress: uniquePayingCustomers / CUSTOMER_GOAL,
    revenueCad,
    purchasesLast7Days,
    insightPurchaseCount,
    masteryPurchaseCount,
    topPurchaseSources: Array.from(sourceMap.values())
      .sort((a, b) => b.count - a.count || b.revenueCad - a.revenueCad)
      .slice(0, 8),
    topPurchaseChains: Array.from(chainMap.values())
      .sort((a, b) => b.count - a.count || b.revenueCad - a.revenueCad)
      .slice(0, 8),
  };
}

export function summarizeCheckoutIntents(rows: CheckoutIntentMetricRow[], now = new Date()) {
  const sourceMap = new Map<string, CheckoutIntentSourceSummary>();
  const chainMap = new Map<string, CheckoutIntentChainSummary>();
  let checkoutSessionsCreatedCount = 0;
  let checkoutCompletedIntentCount = 0;
  let checkoutExpiredIntentCount = 0;
  let checkoutStripeFailureCount = 0;
  let checkoutIntentsLast7Days = 0;
  let checkoutEmailKnownIntentCount = 0;
  let checkoutRecoveryConsentedIntentCount = 0;
  let checkoutRecoverableAbandonedIntentCount = 0;
  let checkoutUnrecoverableAbandonedIntentCount = 0;

  rows.forEach((row) => {
    const stripeCreated = checkoutIntentStripeCreated(row);
    const completed = checkoutIntentCompleted(row);
    const expired = checkoutIntentExpired(row, now);
    const failed = checkoutIntentFailed(row);
    const abandoned = stripeCreated && !completed && expired;
    const hasRecoveryConsent = checkoutIntentHasRecoveryConsent(row);

    if (stripeCreated) checkoutSessionsCreatedCount += 1;
    if (completed) checkoutCompletedIntentCount += 1;
    if (expired) checkoutExpiredIntentCount += 1;
    if (failed) checkoutStripeFailureCount += 1;
    if (isWithinDays(row.created_at, 7, now)) checkoutIntentsLast7Days += 1;
    if (stripeCreated && row.has_customer_email === true) checkoutEmailKnownIntentCount += 1;
    if (stripeCreated && hasRecoveryConsent) checkoutRecoveryConsentedIntentCount += 1;
    if (abandoned && hasRecoveryConsent) checkoutRecoverableAbandonedIntentCount += 1;
    if (abandoned && !hasRecoveryConsent) checkoutUnrecoverableAbandonedIntentCount += 1;

    const source = checkoutIntentSourceKey(row);
    const current = sourceMap.get(source) || {
      source,
      intentCount: 0,
      stripeCreatedCount: 0,
      completedCount: 0,
      expiredCount: 0,
      failedCount: 0,
      recoverableAbandonedCount: 0,
      unrecoverableAbandonedCount: 0,
    };
    current.intentCount += 1;
    if (stripeCreated) current.stripeCreatedCount += 1;
    if (completed) current.completedCount += 1;
    if (expired) current.expiredCount += 1;
    if (failed) current.failedCount += 1;
    if (abandoned && hasRecoveryConsent) current.recoverableAbandonedCount += 1;
    if (abandoned && !hasRecoveryConsent) current.unrecoverableAbandonedCount += 1;
    sourceMap.set(source, current);

    const sourceChain = chainKey(row);
    const currentChain = chainMap.get(sourceChain) || {
      sourceChain,
      intentCount: 0,
      stripeCreatedCount: 0,
      completedCount: 0,
      expiredCount: 0,
      failedCount: 0,
      recoverableAbandonedCount: 0,
      unrecoverableAbandonedCount: 0,
    };
    currentChain.intentCount += 1;
    if (stripeCreated) currentChain.stripeCreatedCount += 1;
    if (completed) currentChain.completedCount += 1;
    if (expired) currentChain.expiredCount += 1;
    if (failed) currentChain.failedCount += 1;
    if (abandoned && hasRecoveryConsent) currentChain.recoverableAbandonedCount += 1;
    if (abandoned && !hasRecoveryConsent) currentChain.unrecoverableAbandonedCount += 1;
    chainMap.set(sourceChain, currentChain);
  });

  const checkoutIntentCount = rows.length;
  const checkoutAbandonedIntentCount = checkoutRecoverableAbandonedIntentCount + checkoutUnrecoverableAbandonedIntentCount;

  return {
    checkoutIntentCount,
    checkoutSessionsCreatedCount,
    checkoutCompletedIntentCount,
    checkoutExpiredIntentCount,
    checkoutAbandonedIntentCount,
    checkoutRecoverableAbandonedIntentCount,
    checkoutUnrecoverableAbandonedIntentCount,
    checkoutStripeFailureCount,
    checkoutIntentsLast7Days,
    checkoutEmailKnownIntentCount,
    checkoutRecoveryConsentedIntentCount,
    checkoutRecoveryConsentRate: checkoutSessionsCreatedCount > 0
      ? checkoutRecoveryConsentedIntentCount / checkoutSessionsCreatedCount
      : 0,
    checkoutAbandonedRecoveryCoverage: checkoutAbandonedIntentCount > 0
      ? checkoutRecoverableAbandonedIntentCount / checkoutAbandonedIntentCount
      : 0,
    checkoutIntentCompletionRate: checkoutSessionsCreatedCount > 0
      ? checkoutCompletedIntentCount / checkoutSessionsCreatedCount
      : 0,
    checkoutIntentFailureRate: checkoutIntentCount > 0
      ? checkoutStripeFailureCount / checkoutIntentCount
      : 0,
    topCheckoutIntentSources: Array.from(sourceMap.values())
      .sort((a, b) => (
        b.unrecoverableAbandonedCount - a.unrecoverableAbandonedCount
        || (b.failedCount + b.expiredCount) - (a.failedCount + a.expiredCount)
      ) || b.intentCount - a.intentCount)
      .slice(0, 8),
    topCheckoutIntentChains: Array.from(chainMap.values())
      .sort((a, b) => (
        b.unrecoverableAbandonedCount - a.unrecoverableAbandonedCount
        || (b.failedCount + b.expiredCount) - (a.failedCount + a.expiredCount)
      ) || b.intentCount - a.intentCount)
      .slice(0, 8),
  };
}

export function summarizeDiscountLeads(rows: DiscountLeadMetricRow[], now = new Date()) {
  const uniqueRows = uniqueDiscountLeadRows(rows);
  const sourceMap = new Map<string, DiscountLeadSourceSummary>();

  uniqueRows.forEach((row) => {
    const key = leadSourceKey(row);
    const current = sourceMap.get(key) || {
      source: key,
      count: 0,
      recoverableCount: 0,
      awaitingFollowupCount: 0,
      awaitingSecondFollowupCount: 0,
      followupSentCount: 0,
      secondFollowupSentCount: 0,
      skippedPurchasedCount: 0,
      skippedInvalidEmailCount: 0,
    };
    current.count += 1;
    if (row.email_sent === true) current.recoverableCount += 1;
    if (row.email_sent === true && row.followup_email_sent !== true) {
      current.awaitingFollowupCount += 1;
    }
    if (row.followup_email_sent === true && row.second_followup_email_sent !== true) {
      current.awaitingSecondFollowupCount += 1;
    }
    if (followupWasSent(row, 'first')) current.followupSentCount += 1;
    if (followupWasSent(row, 'second')) current.secondFollowupSentCount += 1;
    if (followupWasSkipped(row, 'skipped_already_purchased')) current.skippedPurchasedCount += 1;
    if (followupWasSkipped(row, 'skipped_invalid_email')) current.skippedInvalidEmailCount += 1;
    sourceMap.set(key, current);
  });

  const recoverableLeadCount = uniqueRows.filter((row) => row.email_sent === true).length;
  const followupSentCount = uniqueRows.filter((row) => followupWasSent(row, 'first')).length;
  const secondFollowupSentCount = uniqueRows.filter((row) => followupWasSent(row, 'second')).length;
  const skippedPurchasedCount = uniqueRows.filter((row) => followupWasSkipped(row, 'skipped_already_purchased')).length;
  const skippedInvalidEmailCount = uniqueRows.filter((row) => followupWasSkipped(row, 'skipped_invalid_email')).length;

  return {
    discountLeadCount: uniqueRows.length,
    rawDiscountLeadCount: rows.length,
    duplicateDiscountLeadCount: Math.max(0, rows.length - uniqueRows.length),
    recoverableLeadCount,
    followupSentCount,
    secondFollowupSentCount,
    skippedPurchasedCount,
    skippedInvalidEmailCount,
    awaitingFollowupCount: uniqueRows.filter((row) => row.email_sent === true && row.followup_email_sent !== true).length,
    awaitingSecondFollowupCount: uniqueRows.filter((row) => row.followup_email_sent === true && row.second_followup_email_sent !== true).length,
    unrecoverableLeadCount: uniqueRows.filter((row) => row.email_sent !== true).length,
    leadRecoveryCoverage: uniqueRows.length > 0 ? recoverableLeadCount / uniqueRows.length : 0,
    followupCoverage: recoverableLeadCount > 0 ? followupSentCount / recoverableLeadCount : 0,
    secondFollowupCoverage: followupSentCount > 0 ? secondFollowupSentCount / followupSentCount : 0,
    leadsLast7Days: uniqueRows.filter((row) => isWithinDays(row.created_at, 7, now)).length,
    topLeadSources: Array.from(sourceMap.values())
      .sort((a, b) => (
        (b.awaitingFollowupCount + b.awaitingSecondFollowupCount)
        - (a.awaitingFollowupCount + a.awaitingSecondFollowupCount)
      ) || b.count - a.count)
      .slice(0, 8),
  };
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function dailyAssessmentCounts(rows: AssessmentMetricRow[], now = new Date(), days = 7) {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const counts = new Map<string, number>();
  for (let index = 0; index < days; index += 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    counts.set(dayKey(date), 0);
  }

  rows.forEach((row) => {
    if (typeof row.created_at !== 'string') return;
    const parsed = new Date(row.created_at);
    const key = Number.isFinite(parsed.getTime()) ? dayKey(parsed) : '';
    if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}

export function popularTypes(rows: AssessmentMetricRow[]) {
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    const stack = row.stack;
    const first = Array.isArray(stack) ? stack[0] : null;
    const type = typeof first === 'string'
      ? first
      : first && typeof first === 'object' && 'function' in first
        ? String((first as { function?: unknown }).function || '')
        : '';

    if (!type) return;
    counts.set(type, (counts.get(type) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));
}
