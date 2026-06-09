import { describe, expect, it } from 'vitest';
import {
  discountLeadAttributionParams,
  getDiscountLeadFollowupDestination,
  isAssessmentProgressReturnSource,
  isAssessmentReturnSource,
  isCheckoutReturnSource,
  isResultUpgradeSource,
} from '../../lib/discount-lead-routing';

describe('discount lead source routing', () => {
  it('routes pre-result email captures back to the free assessment', () => {
    expect(isAssessmentReturnSource('assessment_progress_email_code')).toBe(true);
    expect(isAssessmentProgressReturnSource('assessment_progress_email_code')).toBe(true);
    expect(isAssessmentReturnSource('home_hero_email_code')).toBe(true);
    expect(isAssessmentReturnSource('sample_report_email_code')).toBe(true);
    expect(isAssessmentReturnSource('pricing_upgrade_prompt')).toBe(true);
    expect(isAssessmentReturnSource('seo_cognitive_functions_quiz_email_code')).toBe(true);
    expect(isAssessmentReturnSource('blog_why_mbti_type_keeps_changing_email_code')).toBe(true);

    expect(getDiscountLeadFollowupDestination('seo_cognitive_functions_quiz_email_code', true)).toBe('assessment');
  });

  it('routes result-page upgrade captures back to checkout when a tier was selected', () => {
    expect(isResultUpgradeSource('results_upgrade_strip')).toBe(true);
    expect(isResultUpgradeSource('results_paid_report_card')).toBe(true);
    expect(isResultUpgradeSource('results_hero_axis_save_path')).toBe(true);

    expect(getDiscountLeadFollowupDestination('results_upgrade_strip', true)).toBe('checkout');
    expect(getDiscountLeadFollowupDestination('results_paid_report_card', true)).toBe('checkout');
    expect(getDiscountLeadFollowupDestination('results_hero_axis_save_path', true)).toBe('checkout');
  });

  it('keeps checkout recovery sources on checkout and unknown sources on sample report', () => {
    expect(isCheckoutReturnSource('checkout_recovery_email_code')).toBe(true);
    expect(getDiscountLeadFollowupDestination('checkout_recovery_email_code', true)).toBe('checkout');
    expect(getDiscountLeadFollowupDestination('results_upgrade_strip', false)).toBe('sample_report');
    expect(getDiscountLeadFollowupDestination('unknown_discount_capture', true)).toBe('sample_report');
  });

  it('preserves creator attribution for discount email and follow-up URLs', () => {
    expect(discountLeadAttributionParams({
      utmSource: 'joyce meng',
      utmCampaign: 'creator_outreach_2026_05',
      parentSource: 'seo_mbti_mistype_test_hero',
      sourceChain: 'creator_review_invite > creator_safe_mention > seo_mbti_mistype_test_hero',
    })).toEqual({
      utm_source: 'joyce_meng',
      utm_campaign: 'creator_outreach_2026_05',
      parent_source: 'seo_mbti_mistype_test_hero',
      source_chain: 'creator_review_invite>creator_safe_mention>seo_mbti_mistype_test_hero',
    });

    expect(discountLeadAttributionParams()).toEqual({
      utm_campaign: 'discount_recovery',
    });
  });
});
