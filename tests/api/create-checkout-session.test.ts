import { describe, expect, it } from 'vitest';
import { applyCheckoutCustomerParams, buildCheckoutCancelUrl } from '../../api/create-checkout-session';

describe('checkout session attribution', () => {
  it('keeps source-chain attribution on Stripe cancel returns', () => {
    const cancelUrl = buildCheckoutCancelUrl(
      'https://typejung.com',
      'insight',
      'custom_checkout_review_seo_mbti_mistype_test_hero',
      {
        source: 'seo_mbti_mistype_test_hero',
        ref: 'discount_email',
        utmCampaign: 'creator_outreach_2026_05',
        utmSource: 'joyce_meng',
        parentSource: 'creator_review_invite',
        sourceChain: 'creator_review_invite>creator_safe_mention>seo_mbti_mistype_test_hero',
      },
    );

    expect(cancelUrl).toBe('https://typejung.com/checkout/insight?checkout=cancelled&source=custom_checkout_review_seo_mbti_mistype_test_hero&ref=discount_email&utm_campaign=creator_outreach_2026_05&utm_source=joyce_meng&parent_source=creator_review_invite&source_chain=creator_review_invite%3Ecreator_safe_mention%3Eseo_mbti_mistype_test_hero');
  });

  it('requests a Stripe Customer for every completed checkout', () => {
    const params = new URLSearchParams();

    applyCheckoutCustomerParams(params);

    expect(params.get('customer_creation')).toBe('always');
    expect(params.has('customer_email')).toBe(false);
  });

  it('prefills Stripe email while still creating a Customer', () => {
    const params = new URLSearchParams();

    applyCheckoutCustomerParams(params, 'buyer@example.com');

    expect(params.get('customer_creation')).toBe('always');
    expect(params.get('customer_email')).toBe('buyer@example.com');
  });
});
