import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createTrafficAttributionApi, sanitizeTrafficAttribution } from '../../shared/traffic-attribution-core.js';
import { sanitizeTrafficAttributionParams } from '../../shared/traffic-attribution';
import { standaloneAnalyticsSnippet, withStandaloneAnalytics } from '../../scripts/standalone-analytics.mjs';

const started = Date.parse('2026-10-27T12:00:00.000Z');
const valid = {
  traffic_attribution_version: '1', traffic_source_kind: 'utm', traffic_source: 'google',
  traffic_landing_path: '/inferior-function-test', traffic_captured_at: new Date(started).toISOString(),
};

function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) || null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    values,
  };
}

function browser(url: string, referrer = '', sessionStorage = storage()) {
  return { location: new URL(url), document: { referrer }, navigator: {}, sessionStorage };
}

function captureIn(context: ReturnType<typeof browser>, clock = () => started) {
  return createTrafficAttributionApi(context, sanitizeTrafficAttribution, clock);
}

describe('external traffic attribution', () => {
  it('retains the original SEO entry and external hostname through static → SPA → checkout', () => {
    const tabStorage = storage();
    const entry = browser('https://typejung.com/inferior-function-test/?email=private@example.com',
      'https://www.google.com/search?q=private+search&email=private@example.com', tabStorage);
    const first = captureIn(entry).capture();
    expect(first).toEqual({
      ...valid, traffic_source_kind: 'referrer', traffic_source: 'www.google.com',
      traffic_referrer_host: 'www.google.com',
    });

    const app = browser('https://typejung.com/assessment?source=seo_inferior_hero',
      'https://typejung.com/inferior-function-test/?email=private@example.com', tabStorage);
    const api = captureIn(app);
    expect(api.capture()).toEqual(first);
    app.location = new URL('https://typejung.com/checkout/insight?source=results_card');
    expect(api.capture()).toEqual(first);
    expect(JSON.stringify([...tabStorage.values.values()])).not.toMatch(/private|search\?|email|seo_inferior|results_card/);
  });

  it('keeps campaign source separate from internal CTA source and strips every other query', () => {
    const entry = browser('https://typejung.com/?source=home_hero&utm_source=Newsletter&utm_medium=email&utm_campaign=Autumn_2026&utm_term=private@example.com&token=secret#private',
      'https://mail.example.com/private/inbox?token=secret');
    expect(captureIn(entry).capture()).toEqual({
      ...valid, traffic_source: 'newsletter', traffic_landing_path: '/',
      traffic_medium: 'email', traffic_campaign: 'autumn_2026', traffic_referrer_host: 'mail.example.com',
    });
  });

  it('does not use internal source, ref or old attribution records as acquisition evidence', () => {
    const entry = browser('https://typejung.com/assessment?source=seo_google_hero&ref=creator');
    entry.sessionStorage.setItem('typejung_acquisition_source', JSON.stringify({ source: 'google', referrer: 'https://google.com/' }));
    expect(captureIn(entry).capture()).toEqual({
      ...valid, traffic_source_kind: 'direct_or_unknown', traffic_source: 'direct_or_unknown', traffic_landing_path: '/assessment',
    });
  });

  it('keeps direct-or-unknown explicit when referrers are absent or only internal', () => {
    for (const referrer of ['', 'https://typejung.com/', 'https://www.typejung.com/']) {
      expect(captureIn(browser('https://typejung.com/assessment', referrer)).capture()).toMatchObject({
        traffic_source_kind: 'direct_or_unknown', traffic_source: 'direct_or_unknown',
      });
    }
  });

  it('expires idle context without reviving the fixed document referrer or old UTM query', () => {
    let now = started;
    const entry = browser('https://typejung.com/?utm_source=newsletter', 'https://google.com/');
    const api = captureIn(entry, () => now);
    expect(api.capture().traffic_source).toBe('newsletter');
    now += 31 * 60 * 1000;
    expect(api.capture()).toMatchObject({
      traffic_source_kind: 'direct_or_unknown', traffic_source: 'direct_or_unknown',
      traffic_captured_at: new Date(now).toISOString(),
    });
  });

  it('does not revive an expired campaign from a full-document internal CTA with forwarded UTM tags', () => {
    const tabStorage = storage();
    captureIn(browser('https://typejung.com/?utm_source=creator', '', tabStorage)).capture();
    const later = browser('https://typejung.com/assessment?source=seo_cta&utm_source=creator', 'https://typejung.com/inferior-function-test/', tabStorage);
    expect(captureIn(later, () => started + 31 * 60_000).capture()).toMatchObject({
      traffic_source_kind: 'direct_or_unknown', traffic_source: 'direct_or_unknown',
      traffic_landing_path: '/assessment', traffic_captured_at: '2026-10-27T12:31:00.000Z',
    });
  });

  it('starts a fresh source for a new external arrival, even inside the activity window', () => {
    const tabStorage = storage();
    captureIn(browser('https://typejung.com/', 'https://google.com/', tabStorage)).capture();
    const later = captureIn(browser('https://typejung.com/sample-report', 'https://reddit.com/r/example', tabStorage), () => started + 60_000).capture();
    expect(later).toMatchObject({ traffic_source: 'reddit.com', traffic_landing_path: '/sample-report', traffic_captured_at: '2026-10-27T12:01:00.000Z' });
  });

  it('recognizes a different referrer-less campaign but preserves same-campaign reloads and internal CTAs', () => {
    const tabStorage = storage();
    const first = captureIn(browser('https://typejung.com/?utm_source=creator', '', tabStorage)).capture();
    const reload = browser('https://typejung.com/?utm_source=creator', '', tabStorage);
    expect(captureIn(reload, () => started + 30_000).capture()).toEqual(first);
    const internal = browser('https://typejung.com/assessment?utm_source=newsletter', 'https://typejung.com/', tabStorage);
    expect(captureIn(internal, () => started + 45_000).capture()).toEqual(first);
    const next = browser('https://typejung.com/assessment?utm_source=newsletter', '', tabStorage);
    const second = captureIn(next, () => started + 60_000).capture();
    expect(second).toMatchObject({ traffic_source: 'newsletter', traffic_captured_at: '2026-10-27T12:01:00.000Z' });
    const campaignOnlyChange = browser('https://typejung.com/?utm_source=newsletter&utm_campaign=october', '', tabStorage);
    expect(captureIn(campaignOnlyChange, () => started + 120_000).capture())
      .toMatchObject({ traffic_source: 'newsletter', traffic_campaign: 'october', traffic_captured_at: '2026-10-27T12:02:00.000Z' });
  });

  it('preserves the original source on payment/auth returns and does not invent a provider source', () => {
    for (const referrer of ['https://checkout.stripe.com/c/pay/private', 'https://accounts.google.com/o/oauth2/auth', 'https://project.supabase.co/auth/v1/callback']) {
      const tabStorage = storage();
      const original = captureIn(browser('https://typejung.com/?utm_source=creator', '', tabStorage)).capture();
      const returned = browser('https://typejung.com/success?session_id=private&utm_source=stripe', referrer, tabStorage);
      expect(captureIn(returned, () => started + 60 * 60 * 1000).capture()).toEqual(original);
      expect(captureIn(browser('https://typejung.com/success?session_id=private&utm_source=stripe', referrer)).capture())
        .toMatchObject({ traffic_source_kind: 'direct_or_unknown', traffic_source: 'direct_or_unknown' });
    }
  });

  it('does not preserve a stale payment-return source indefinitely', () => {
    const tabStorage = storage();
    captureIn(browser('https://typejung.com/?utm_source=creator', '', tabStorage)).capture();
    const returned = browser('https://typejung.com/success', 'https://checkout.stripe.com/', tabStorage);
    expect(captureIn(returned, () => started + 25 * 60 * 60 * 1000).capture().traffic_source).toBe('direct_or_unknown');
  });

  it('survives blocked storage within a document and reports unknown across documents when evidence is unavailable', () => {
    const entry = browser('https://typejung.com/?utm_source=newsletter');
    Object.defineProperty(entry, 'sessionStorage', { get() { throw new Error('Storage disabled'); } });
    const api = captureIn(entry);
    const original = api.capture();
    entry.location = new URL('https://typejung.com/assessment?source=home_hero');
    expect(api.capture()).toEqual(original);
    const next = browser('https://typejung.com/results', 'https://typejung.com/assessment');
    Object.defineProperty(next, 'sessionStorage', { get() { throw new Error('Storage disabled'); } });
    expect(captureIn(next).capture().traffic_source).toBe('direct_or_unknown');
  });

  it('honors privacy signals and removes already captured context', () => {
    const entry = browser('https://typejung.com/?utm_source=creator');
    const api = captureIn(entry);
    api.capture();
    Object.assign(entry.navigator, { globalPrivacyControl: true });
    expect(api.capture()).toEqual({});
    expect(entry.sessionStorage.values.size).toBe(0);
    for (const doNotTrack of ['1', 'yes']) {
      const optedOut = browser('https://typejung.com/?utm_source=creator');
      Object.assign(optedOut.navigator, { doNotTrack });
      expect(captureIn(optedOut).capture()).toEqual({});
      expect(optedOut.sessionStorage.values.size).toBe(0);
    }
  });

  it('drops invalid stored data and does not expose private landing identifiers', () => {
    const entry = browser('https://typejung.com/share/private-result-id?email=private@example.com');
    entry.sessionStorage.setItem('typejung_traffic_attribution_v1', JSON.stringify({ props: { ...valid, traffic_source: 'private@example.com' }, lastSeen: started }));
    expect(captureIn(entry).capture()).toMatchObject({ traffic_source: 'direct_or_unknown', traffic_landing_path: '/share' });
    expect(captureIn(browser('https://typejung.com/private-person')).capture().traffic_landing_path).toBe('/other');
  });

  it('captures the real entry in the generated standalone script before the SPA reads it', () => {
    const entry = browser('https://typejung.com/blog/understanding-the-grip.html', 'https://www.google.com/search?q=private');
    const source = readFileSync(resolve('public/traffic-attribution.js'), 'utf8');
    runInNewContext(source, { window: entry, URL, URLSearchParams });
    const next = browser('https://typejung.com/assessment?source=blog_hero', 'https://typejung.com/blog/understanding-the-grip.html', entry.sessionStorage);
    expect(captureIn(next, Date.now).capture()).toMatchObject({ traffic_source: 'www.google.com', traffic_landing_path: '/blog/understanding-the-grip.html' });
    expect(standaloneAnalyticsSnippet).toContain('data-typejung-traffic-attribution src="/traffic-attribution.js"');
    const refreshed = withStandaloneAnalytics(withStandaloneAnalytics('<html><head></head><body>Existing content</body></html>'));
    expect(refreshed.match(/data-typejung-traffic-attribution/g)).toHaveLength(1);
    expect(refreshed).toContain('<body>Existing content</body>');
  });
});

describe('server traffic-attribution boundary', () => {
  it('keeps only safe versioned fields and hostname-only referrers', () => {
    expect(sanitizeTrafficAttributionParams({ ...valid, traffic_medium: 'organic', traffic_campaign: 'autumn_2026', traffic_referrer_host: 'google.com', source: 'cta', email: 'private@example.com' }))
      .toEqual({ ...valid, traffic_medium: 'organic', traffic_campaign: 'autumn_2026', traffic_referrer_host: 'google.com' });
    expect(sanitizeTrafficAttributionParams({ ...valid, traffic_referrer_host: 'https://google.com/search?q=private', traffic_campaign: 'private@example.com' })).toEqual(valid);
  });

  it.each(['private@example.com', 'https://example.com/private', 'phone_1234567890', 'session_abcd', 'a123456789012345678901234567890'])('rejects personal or opaque source value %s', (traffic_source) => {
    expect(sanitizeTrafficAttributionParams({ ...valid, traffic_source })).toEqual({});
  });

  it('rejects malformed versions, kind/source mismatches, private routes and invalid dates', () => {
    for (const invalid of [
      { traffic_attribution_version: '0' }, { traffic_source_kind: 'direct' },
      { traffic_source_kind: 'direct_or_unknown' }, { traffic_source_kind: 'referrer', traffic_source: 'google' },
      { traffic_landing_path: '/results?email=private@example.com' }, { traffic_landing_path: '/share/private-id' },
      { traffic_captured_at: 'yesterday' }, { traffic_captured_at: '2026-02-31T12:00:00.000Z' },
    ]) expect(sanitizeTrafficAttributionParams({ ...valid, ...invalid })).toEqual({});
    expect(sanitizeTrafficAttributionParams(undefined)).toEqual({});
  });
});
