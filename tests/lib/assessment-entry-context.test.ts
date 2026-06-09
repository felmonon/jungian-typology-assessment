import { describe, expect, it } from 'vitest';
import { assessmentEntryContextFromSource } from '../../lib/assessment-entry-context';

describe('assessment entry context', () => {
  it('recognizes mistype and changing-MBTI entry sources', () => {
    expect(assessmentEntryContextFromSource('seo_mbti_mistype_test_hero')).toMatchObject({
      category: 'mistype',
      eyebrow: 'Mistype check',
    });
    expect(assessmentEntryContextFromSource('seo_mbti_keeps_changing_final')).toMatchObject({
      category: 'mistype',
    });
  });

  it('recognizes type-comparison and dominant-function sources', () => {
    expect(assessmentEntryContextFromSource('seo_infj_vs_infp_test_hero')).toMatchObject({
      category: 'type_compare',
    });
    expect(assessmentEntryContextFromSource('seo_ni_dominant_test_final')).toMatchObject({
      category: 'dominant_function',
    });
    expect(assessmentEntryContextFromSource('seo_dominant_function_test_nav')).toMatchObject({
      category: 'dominant_function',
    });
  });

  it('recognizes stress-edge, alternative, and generic SEO routes', () => {
    expect(assessmentEntryContextFromSource('seo_inferior_function_test_hero')).toMatchObject({
      category: 'stress_edge',
    });
    expect(assessmentEntryContextFromSource('seo_sakinorva_alternative_hero')).toMatchObject({
      category: 'alternative',
    });
    expect(assessmentEntryContextFromSource('blog_why_mbti_type_keeps_changing_article_cta')).toMatchObject({
      category: 'function_map',
    });
  });

  it('recognizes creator-review traffic from direct and preserved attribution sources', () => {
    expect(assessmentEntryContextFromSource('creator_review_invite')).toMatchObject({
      category: 'creator_review',
      eyebrow: 'Creator review path',
    });
    expect(assessmentEntryContextFromSource('seo_creator_preview_hero')).toMatchObject({
      category: 'creator_review',
    });
    expect(assessmentEntryContextFromSource('seo_jungian_test_hero', {
      parentSource: 'creator_review_invite',
      utmCampaign: 'creator_outreach_2026_05',
      utmSource: 'joyce_meng',
    })).toMatchObject({
      category: 'creator_review',
    });
  });

  it('returns null when no useful source exists', () => {
    expect(assessmentEntryContextFromSource('')).toBeNull();
    expect(assessmentEntryContextFromSource(null)).toBeNull();
    expect(assessmentEntryContextFromSource('shared_result_cta')).toBeNull();
  });
});
