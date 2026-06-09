import { describe, expect, it } from 'vitest';
import { buildCheckoutCancelUrl } from '../../api/create-checkout-session';

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
});
