import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getFunnelAnonymousId, setAnalyticsEnabled, trackEvent } from '../../lib/analytics';
import {
  captureAcquisitionSourceFromLocation,
  pathWithSource,
  readAcquisitionSource,
  sourceForCheckout,
  sourceFromSearch,
} from '../../lib/acquisition-source';

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe('acquisition source storage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    });
    Object.defineProperty(window, 'sessionStorage', { configurable: true, value: createMemoryStorage() });
    delete window.__typejungResearchAnonymousId;
    delete window.__typejungResearchAcquisition;
    delete window.__typejungFunnelAnonymousId;
    window.history.replaceState({}, '', '/');
    setAnalyticsEnabled(true);
  });
  afterEach(() => { window.history.replaceState({}, '', '/'); setAnalyticsEnabled(true); });

  it('isolates study CTA attribution and restores the unchanged ordinary source in a later tab', () => {
    captureAcquisitionSourceFromLocation('?source=home_hero&utm_source=google&utm_campaign=organic', '/');
    const savedCustomer = window.localStorage.getItem('typejung_acquisition_source');
    const study = '/?utm_source=typejung_research&utm_campaign=offer_observation_2026_10';
    window.history.replaceState({}, '', study);
    captureAcquisitionSourceFromLocation(window.location.search, study);
    expect(readAcquisitionSource()).toMatchObject({ utmSource: 'typejung_research', utmCampaign: 'offer_observation_2026_10' });
    const next = pathWithSource('/assessment', 'home_hero');
    expect(next).toContain('utm_source=typejung_research');
    window.history.replaceState({}, '', next);
    captureAcquisitionSourceFromLocation(window.location.search, next);
    expect(readAcquisitionSource()?.source).toBe('home_hero');
    expect(window.localStorage.getItem('typejung_acquisition_source')).toBe(savedCustomer);

    // A full reload restores the study's tab-scoped acquisition.
    delete window.__typejungResearchAnonymousId;
    delete window.__typejungResearchAcquisition;
    window.history.replaceState({}, '', '/results');
    expect(readAcquisitionSource()).toMatchObject({ source: 'home_hero', utmSource: 'typejung_research' });

    // A new normal tab has no study session storage, but shares localStorage.
    delete window.__typejungResearchAnonymousId;
    delete window.__typejungResearchAcquisition;
    Object.defineProperty(window, 'sessionStorage', { configurable: true, value: createMemoryStorage() });
    window.history.replaceState({}, '', '/');
    expect(captureAcquisitionSourceFromLocation('', '/')).toMatchObject({ utmSource: 'google', utmCampaign: 'organic' });
    expect(window.localStorage.getItem('typejung_acquisition_source')).toBe(savedCustomer);
    expect(pathWithSource('/assessment', 'home_hero')).not.toContain('typejung_research');
  });

  it('captures research identity before an analytics-disabled entry loses its query', () => {
    setAnalyticsEnabled(false);
    window.history.replaceState({}, '', '/?utm_source=typejung_research&utm_campaign=offer_observation_2026_10');
    captureAcquisitionSourceFromLocation(window.location.search, '/');
    const identity = window.__typejungResearchAnonymousId;
    expect(identity).toMatch(/^research_observation_v1_/);
    expect(trackEvent('site_visited')).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
    window.history.replaceState({}, '', '/results');
    expect(getFunnelAnonymousId()).toBe(identity);
    expect(window.localStorage.getItem('typejung_acquisition_source')).toBeNull();
  });

  it('reads source from explicit SEO query params', () => {
    expect(sourceFromSearch('?source=seo_jungian_test_hero')).toBe('seo_jungian_test_hero');
    expect(sourceFromSearch('?ref=result-share')).toBe('result-share');
  });

  it('prefers the creator UTM source over the broader campaign when no explicit source exists', () => {
    expect(sourceFromSearch('?utm_campaign=creator_outreach_2026_05&utm_source=joyce_meng')).toBe('joyce_meng');
  });

  it('captures and reuses source through checkout', () => {
    const captured = captureAcquisitionSourceFromLocation(
      '?source=seo_mbti_alternative_hero&utm_campaign=mistype_pages&utm_source=google',
      '/assessment?source=seo_mbti_alternative_hero&utm_campaign=mistype_pages&utm_source=google',
      'https://google.com/',
    );

    expect(captured).toMatchObject({
      source: 'seo_mbti_alternative_hero',
      entryPage: '/assessment?source=seo_mbti_alternative_hero&utm_campaign=mistype_pages&utm_source=google',
      referrer: 'https://google.com/',
      utmCampaign: 'mistype_pages',
      utmSource: 'google',
    });
    expect(readAcquisitionSource()?.source).toBe('seo_mbti_alternative_hero');
    expect(sourceForCheckout()).toBe('custom_checkout_review_seo_mbti_alternative_hero');
  });

  it('keeps the shared-result attribution chain for checkout attribution', () => {
    captureAcquisitionSourceFromLocation(
      '?source=shared_result_cta&ref=shared_result&utm_campaign=friend_compare&shared_result=demo-compare&parent_source=result_summary_share',
      '/assessment?source=shared_result_cta&ref=shared_result&utm_campaign=friend_compare&shared_result=demo-compare&parent_source=result_summary_share',
    );

    expect(readAcquisitionSource()).toMatchObject({
      source: 'shared_result_cta',
      ref: 'shared_result',
      utmCampaign: 'friend_compare',
      sharedResult: 'demo-compare',
      parentSource: 'result_summary_share',
      sourceChain: 'result_summary_share>shared_result_cta',
    });
    expect(sourceForCheckout()).toBe('custom_checkout_review_shared_result_cta');
  });

  it('keeps an existing source when the next page has no source query', () => {
    captureAcquisitionSourceFromLocation(
      '?source=seo_cognitive_function_test_final',
      '/sample-report?source=seo_cognitive_function_test_final',
    );
    captureAcquisitionSourceFromLocation('', '/assessment');

    expect(readAcquisitionSource()?.source).toBe('seo_cognitive_function_test_final');
  });

  it('preserves stored creator attribution when React CTAs set a new conversion source', () => {
    captureAcquisitionSourceFromLocation(
      '?source=seo_mbti_mistype_test_hero&utm_source=joyce_meng&utm_campaign=creator_outreach_2026_05',
      '/assessment?source=seo_mbti_mistype_test_hero&utm_source=joyce_meng&utm_campaign=creator_outreach_2026_05',
    );

    expect(pathWithSource('/checkout/insight', 'results_paid_report_card', { tier: 'insight' }))
      .toBe('/checkout/insight?source=results_paid_report_card&utm_campaign=creator_outreach_2026_05&utm_source=joyce_meng&parent_source=seo_mbti_mistype_test_hero&source_chain=seo_mbti_mistype_test_hero%3Eresults_paid_report_card&tier=insight');
  });

  it('keeps the full creator safe-mention chain through the React checkout handoff', () => {
    captureAcquisitionSourceFromLocation(
      '?source=seo_mbti_mistype_test_hero&utm_source=joyce_meng&utm_campaign=creator_outreach_2026_05&parent_source=creator_review_invite&source_chain=creator_review_invite%3Ecreator_safe_mention%3Eseo_mbti_mistype_test_hero',
      '/assessment?source=seo_mbti_mistype_test_hero&utm_source=joyce_meng&utm_campaign=creator_outreach_2026_05&parent_source=creator_review_invite&source_chain=creator_review_invite%3Ecreator_safe_mention%3Eseo_mbti_mistype_test_hero',
    );

    expect(readAcquisitionSource()).toMatchObject({
      source: 'seo_mbti_mistype_test_hero',
      parentSource: 'creator_review_invite',
      sourceChain: 'creator_review_invite>creator_safe_mention>seo_mbti_mistype_test_hero',
    });
    expect(pathWithSource('/checkout/insight', 'results_paid_report_card'))
      .toBe('/checkout/insight?source=results_paid_report_card&utm_campaign=creator_outreach_2026_05&utm_source=joyce_meng&parent_source=creator_review_invite&source_chain=creator_review_invite%3Ecreator_safe_mention%3Eseo_mbti_mistype_test_hero%3Eresults_paid_report_card');
  });

  it('preserves recovery attribution when checkout falls back to assessment first', () => {
    captureAcquisitionSourceFromLocation(
      '?checkout=cancelled&source=custom_checkout_review_seo_mbti_mistype_test_hero&ref=discount_followup&utm_source=joyce_meng&utm_campaign=creator_outreach_2026_05&parent_source=creator_review_invite&source_chain=creator_review_invite%3Ecreator_safe_mention%3Eseo_mbti_mistype_test_hero',
      '/checkout/insight?checkout=cancelled&source=custom_checkout_review_seo_mbti_mistype_test_hero&ref=discount_followup&utm_source=joyce_meng&utm_campaign=creator_outreach_2026_05&parent_source=creator_review_invite&source_chain=creator_review_invite%3Ecreator_safe_mention%3Eseo_mbti_mistype_test_hero',
    );

    expect(pathWithSource('/assessment', 'checkout_without_result', { tier: 'insight' }))
      .toBe('/assessment?source=checkout_without_result&ref=discount_followup&utm_campaign=creator_outreach_2026_05&utm_source=joyce_meng&parent_source=creator_review_invite&source_chain=creator_review_invite%3Ecreator_safe_mention%3Eseo_mbti_mistype_test_hero%3Ecustom_checkout_review_seo_mbti_mistype_test_hero%3Echeckout_without_result&tier=insight');
  });

  it('sanitizes noisy source values', () => {
    expect(sourceFromSearch('?source=SEO Jungian Test Hero!!!')).toBe('SEO_Jungian_Test_Hero');
  });

  it('adds clean source and extra params to internal conversion paths', () => {
    expect(pathWithSource('/assessment', 'home type comparison', { tier: 'insight' }))
      .toBe('/assessment?source=home_type_comparison&tier=insight');

    expect(pathWithSource('/pricing?tier=mastery', 'home_pricing_mastery'))
      .toBe('/pricing?tier=mastery&source=home_pricing_mastery');
  });
});
