import { describe, expect, it } from 'vitest';
import { purchaseAttributionFromCheckoutSession } from '../../api/_lib/purchases';

describe('purchase attribution', () => {
  it('extracts checkout metadata into durable purchase attribution fields', () => {
    expect(purchaseAttributionFromCheckoutSession({
      id: 'cs_test_123',
      payment_status: 'paid',
      metadata: {
        source: 'custom_checkout_review_seo_mbti_mistype_test_hero',
        acquisition_source: 'seo_mbti_mistype_test_hero',
        acquisition_ref: 'discount_followup',
        utm_campaign: 'creator_outreach_2026_05',
        utm_source: 'joyce_meng',
        shared_result: 'demo_compare',
        parent_source: 'result_summary_share',
        source_chain: 'creator_review_invite>creator_safe_mention>seo_mbti_mistype_test_hero',
        discount_code: 'TYPEJUNG30',
        recovery_email_consent: 'site_opt_in',
      },
    })).toEqual({
      source: 'custom_checkout_review_seo_mbti_mistype_test_hero',
      acquisition_source: 'seo_mbti_mistype_test_hero',
      acquisition_ref: 'discount_followup',
      utm_campaign: 'creator_outreach_2026_05',
      utm_source: 'joyce_meng',
      shared_result: 'demo_compare',
      parent_source: 'result_summary_share',
      source_chain: 'creator_review_invite>creator_safe_mention>seo_mbti_mistype_test_hero',
      discount_code: 'TYPEJUNG30',
      recovery_email_consent: 'site_opt_in',
    });
  });

  it('falls back to checkout source and sanitizes noisy metadata', () => {
    expect(purchaseAttributionFromCheckoutSession({
      id: 'cs_test_456',
      payment_status: 'paid',
      metadata: {
        source: 'Results Paid Report!!',
        utm_source: 'Joyce Meng / YouTube',
        source_chain: 'Creator Review Invite > Creator Safe Mention',
      },
    })).toMatchObject({
      source: 'Results_Paid_Report',
      acquisition_source: 'Results_Paid_Report',
      utm_source: 'Joyce_Meng_YouTube',
      source_chain: 'Creator_Review_Invite>Creator_Safe_Mention',
    });
  });
});
