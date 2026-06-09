import { describe, expect, it } from 'vitest';
import {
  dailyAssessmentCounts,
  popularTypes,
  summarizeCheckoutIntents,
  summarizeDiscountLeads,
  summarizePurchases,
} from '../../api/_lib/growth-metrics';

describe('growth metrics', () => {
  const now = new Date('2026-05-24T12:00:00.000Z');

  it('summarizes paying customers, revenue, tiers, recency, and sources', () => {
    const summary = summarizePurchases([
      {
        id: 'purchase_1',
        customer_email: 'Buyer@example.com',
        amount: 700,
        tier: 'insight',
        utm_source: 'joyce_meng',
        source_chain: 'creator_review_invite>creator_safe_mention>seo_mbti_mistype_test_hero',
        created_at: '2026-05-23T12:00:00.000Z',
      },
      {
        id: 'purchase_2',
        customer_email: 'buyer@example.com',
        amount: 2030,
        tier: 'mastery',
        utm_source: 'joyce_meng',
        created_at: '2026-05-21T12:00:00.000Z',
      },
      {
        id: 'purchase_3',
        user_id: 'user_2',
        amount: 700,
        tier: 'insight',
        acquisition_source: 'seo_mbti_mistype_test_hero',
        parent_source: 'creator_review_invite',
        created_at: '2026-05-01T12:00:00.000Z',
      },
    ], now);

    expect(summary).toMatchObject({
      purchaseCount: 3,
      uniquePayingCustomers: 2,
      payingCustomerRemaining: 98,
      revenueCad: 34.3,
      purchasesLast7Days: 2,
      insightPurchaseCount: 2,
      masteryPurchaseCount: 1,
    });
    expect(summary.topPurchaseSources[0]).toEqual({
      source: 'joyce_meng',
      count: 2,
      revenueCad: 27.3,
    });
    expect(summary.topPurchaseChains).toContainEqual({
      sourceChain: 'creator_review_invite>creator_safe_mention>seo_mbti_mistype_test_hero',
      count: 1,
      revenueCad: 7,
    });
  });

  it('summarizes discount recovery pipeline counts', () => {
    expect(summarizeDiscountLeads([
      {
        id: 'lead_1',
        source: 'checkout_recovery_prestripe',
        email_sent: true,
        followup_email_sent: true,
        followup_email_sent_id: 'email_1',
        second_followup_email_sent: true,
        second_followup_email_sent_id: 'email_2',
        created_at: '2026-05-23T12:00:00.000Z',
      },
      {
        id: 'lead_2',
        source: 'checkout_recovery_prestripe',
        utm_source: 'joyce_meng',
        email_sent: true,
        followup_email_sent: true,
        followup_email_sent_id: 'email_3',
        second_followup_email_sent: false,
        created_at: '2026-05-22T12:00:00.000Z',
      },
      {
        id: 'lead_3',
        source: 'seo_email_code',
        email_sent: false,
        followup_email_sent: false,
        second_followup_email_sent: false,
        created_at: '2026-05-01T12:00:00.000Z',
      },
    ], now)).toEqual({
      discountLeadCount: 3,
      rawDiscountLeadCount: 3,
      duplicateDiscountLeadCount: 0,
      recoverableLeadCount: 2,
      followupSentCount: 2,
      secondFollowupSentCount: 1,
      skippedPurchasedCount: 0,
      skippedInvalidEmailCount: 0,
      awaitingFollowupCount: 0,
      awaitingSecondFollowupCount: 1,
      unrecoverableLeadCount: 1,
      leadRecoveryCoverage: 2 / 3,
      followupCoverage: 1,
      secondFollowupCoverage: 1 / 2,
      leadsLast7Days: 2,
      topLeadSources: [
        {
          source: 'joyce_meng',
          count: 1,
          recoverableCount: 1,
          awaitingFollowupCount: 0,
          awaitingSecondFollowupCount: 1,
          followupSentCount: 1,
          secondFollowupSentCount: 0,
          skippedPurchasedCount: 0,
          skippedInvalidEmailCount: 0,
        },
        {
          source: 'checkout_recovery_prestripe',
          count: 1,
          recoverableCount: 1,
          awaitingFollowupCount: 0,
          awaitingSecondFollowupCount: 0,
          followupSentCount: 1,
          secondFollowupSentCount: 1,
          skippedPurchasedCount: 0,
          skippedInvalidEmailCount: 0,
        },
        {
          source: 'seo_email_code',
          count: 1,
          recoverableCount: 0,
          awaitingFollowupCount: 0,
          awaitingSecondFollowupCount: 0,
          followupSentCount: 0,
          secondFollowupSentCount: 0,
          skippedPurchasedCount: 0,
          skippedInvalidEmailCount: 0,
        },
      ],
    });
  });

  it('deduplicates repeated discount captures by email, source, and tier intent', () => {
    const summary = summarizeDiscountLeads([
      {
        id: 'lead_newest',
        email: 'buyer@example.com',
        source: 'checkout_recovery_prestripe',
        tier_intent: 'mastery',
        email_sent: true,
        followup_email_sent: false,
        second_followup_email_sent: false,
        created_at: '2026-05-23T12:00:00.000Z',
      },
      {
        id: 'lead_duplicate',
        email: 'Buyer@Example.com',
        source: 'checkout_recovery_prestripe',
        tier_intent: 'mastery',
        email_sent: true,
        followup_email_sent: true,
        followup_email_error: 'skipped_already_purchased',
        second_followup_email_sent: false,
        created_at: '2026-05-22T12:00:00.000Z',
      },
      {
        id: 'lead_other_tier',
        email: 'buyer@example.com',
        source: 'checkout_recovery_prestripe',
        tier_intent: 'insight',
        email_sent: true,
        followup_email_sent: false,
        second_followup_email_sent: false,
        created_at: '2026-05-21T12:00:00.000Z',
      },
    ], now);

    expect(summary).toMatchObject({
      rawDiscountLeadCount: 3,
      discountLeadCount: 2,
      duplicateDiscountLeadCount: 1,
      recoverableLeadCount: 2,
      awaitingFollowupCount: 2,
      followupSentCount: 0,
      skippedPurchasedCount: 0,
    });
  });

  it('summarizes checkout intent funnel leakage and sources', () => {
    const summary = summarizeCheckoutIntents([
      {
        id: 'intent_1',
        stripe_session_id: 'cs_paid_1',
        status: 'completed',
        tier: 'insight',
        utm_source: 'joyce_meng',
        created_at: '2026-05-23T12:00:00.000Z',
        completed_at: '2026-05-23T12:05:00.000Z',
      },
      {
        id: 'intent_2',
        stripe_session_id: 'cs_expired_1',
        status: 'stripe_created',
        tier: 'mastery',
        source: 'results_upgrade',
        source_chain: 'seo_mbti_mistype_test_hero>results_upgrade',
        has_customer_email: false,
        recovery_email_consent: 'none',
        created_at: '2026-05-22T12:00:00.000Z',
        expires_at: '2026-05-23T12:00:00.000Z',
      },
      {
        id: 'intent_3',
        status: 'stripe_failed',
        tier: 'insight',
        source: 'pricing_page',
        created_at: '2026-05-21T12:00:00.000Z',
      },
      {
        id: 'intent_4',
        stripe_session_id: 'cs_expired_2',
        status: 'expired',
        tier: 'insight',
        source: 'checkout_recovery_prestripe',
        has_customer_email: true,
        recovery_email_consent: 'site_opt_in',
        created_at: '2026-05-20T12:00:00.000Z',
        expires_at: '2026-05-21T12:00:00.000Z',
      },
    ], now);

    expect(summary).toMatchObject({
      checkoutIntentCount: 4,
      checkoutSessionsCreatedCount: 3,
      checkoutCompletedIntentCount: 1,
      checkoutExpiredIntentCount: 2,
      checkoutAbandonedIntentCount: 2,
      checkoutRecoverableAbandonedIntentCount: 1,
      checkoutUnrecoverableAbandonedIntentCount: 1,
      checkoutStripeFailureCount: 1,
      checkoutIntentsLast7Days: 4,
      checkoutEmailKnownIntentCount: 1,
      checkoutRecoveryConsentedIntentCount: 1,
      checkoutRecoveryConsentRate: 1 / 3,
      checkoutAbandonedRecoveryCoverage: 1 / 2,
      checkoutIntentCompletionRate: 1 / 3,
      checkoutIntentFailureRate: 1 / 4,
    });
    expect(summary.topCheckoutIntentSources).toContainEqual({
      source: 'results_upgrade',
      intentCount: 1,
      stripeCreatedCount: 1,
      completedCount: 0,
      expiredCount: 1,
      failedCount: 0,
      recoverableAbandonedCount: 0,
      unrecoverableAbandonedCount: 1,
    });
    expect(summary.topCheckoutIntentSources).toContainEqual({
      source: 'pricing_page',
      intentCount: 1,
      stripeCreatedCount: 0,
      completedCount: 0,
      expiredCount: 0,
      failedCount: 1,
      recoverableAbandonedCount: 0,
      unrecoverableAbandonedCount: 0,
    });
    expect(summary.topCheckoutIntentSources).toContainEqual({
      source: 'checkout_recovery_prestripe',
      intentCount: 1,
      stripeCreatedCount: 1,
      completedCount: 0,
      expiredCount: 1,
      failedCount: 0,
      recoverableAbandonedCount: 1,
      unrecoverableAbandonedCount: 0,
    });
  });

  it('builds daily assessment counts and popular type summaries', () => {
    const rows = [
      { stack: ['Ni', 'Te'], created_at: '2026-05-24T10:00:00.000Z' },
      { stack: ['Ni', 'Fe'], created_at: '2026-05-24T09:00:00.000Z' },
      { stack: [{ function: 'Ti' }], created_at: '2026-05-23T09:00:00.000Z' },
    ];

    expect(popularTypes(rows)).toEqual([
      { type: 'Ni', count: 2 },
      { type: 'Ti', count: 1 },
    ]);
    expect(dailyAssessmentCounts(rows, now, 2)).toEqual([
      { date: '2026-05-23', count: 1 },
      { date: '2026-05-24', count: 2 },
    ]);
  });
});
