import { describe, expect, it } from 'vitest';
import { resultUpgradeContextFromSource } from '../../lib/result-upgrade-context';

describe('result upgrade context', () => {
  it('recognizes mistype intent without making final-type claims', () => {
    const context = resultUpgradeContextFromSource('seo_mbti_mistype_test_hero');

    expect(context).toMatchObject({
      category: 'mistype',
      eyebrow: 'Mistype follow-through',
    });
    expect(context?.previewBody('Insight', 'Introverted Intuition', 'Extraverted Sensing'))
      .toContain('does not claim to prove a final MBTI type');
  });

  it('recognizes type-comparison and dominant-function result intents', () => {
    expect(resultUpgradeContextFromSource('seo_infj_vs_infp_test_final')).toMatchObject({
      category: 'type_compare',
    });
    expect(resultUpgradeContextFromSource('seo_dominant_function_test_hero')).toMatchObject({
      category: 'dominant_function',
    });
    expect(resultUpgradeContextFromSource('seo_ni_dominant_test_final')).toMatchObject({
      category: 'dominant_function',
    });
  });

  it('recognizes stress-edge, alternative, and generic map intents', () => {
    expect(resultUpgradeContextFromSource('seo_inferior_function_test_hero')).toMatchObject({
      category: 'stress_edge',
    });
    expect(resultUpgradeContextFromSource('seo_sakinorva_alternative_hero')).toMatchObject({
      category: 'alternative',
    });
    expect(resultUpgradeContextFromSource('blog_why_mbti_type_keeps_changing_article_cta')).toMatchObject({
      category: 'function_map',
    });
  });

  it('recognizes creator-review result intent without public-promo pressure', () => {
    const context = resultUpgradeContextFromSource('seo_creator_preview_hero', {
      parentSource: 'creator_review_invite',
      utmCampaign: 'creator_outreach_2026_05',
      utmSource: 'joyce_meng',
    });

    expect(context).toMatchObject({
      category: 'creator_review',
      eyebrow: 'Creator review follow-through',
    });
    expect(context?.headline).toContain('only if the free map would help your audience');
    expect(context?.previewBody('Mastery', 'Introverted Intuition', 'Extraverted Sensing'))
      .toContain('private review layer');
  });

  it('returns null for non-acquisition result sources', () => {
    expect(resultUpgradeContextFromSource('')).toBeNull();
    expect(resultUpgradeContextFromSource(null)).toBeNull();
    expect(resultUpgradeContextFromSource('shared_result_cta')).toBeNull();
  });
});
