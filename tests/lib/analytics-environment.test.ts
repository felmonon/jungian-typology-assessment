import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { track as trackVercelEvent } from '@vercel/analytics';
import { initAnalytics, isAnalyticsEnabled, setAnalyticsEnabled, trackEvent, trackPageView } from '../../lib/analytics';

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));

const beacon = vi.fn(() => false);
const gtag = vi.fn();

function browserAt(url: string) {
  vi.stubGlobal('window', { location: new URL(url), gtag, dataLayer: [], crypto: window.crypto });
}

describe('analytics environment isolation', () => {
  beforeEach(() => {
    vi.stubEnv('DEV', false);
    Object.defineProperty(navigator, 'sendBeacon', { configurable: true, value: beacon });
    setAnalyticsEnabled(true);
  });

  afterEach(() => {
    document.querySelectorAll('script[src*="googletagmanager.com"]').forEach(script => script.remove());
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  function expectTrackingBlocked() {
    // Re-enabling the existing consent control must not override isolation.
    setAnalyticsEnabled(false);
    setAnalyticsEnabled(true);
    expect(isAnalyticsEnabled()).toBe(false);
    expect(initAnalytics()).toBe(false);
    expect(trackPageView('/results', 'Results')).toBe(false);
    expect(trackEvent('results_premium_preview_viewed', { tier: 'insight' })).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
    expect(trackVercelEvent).not.toHaveBeenCalled();
    expect(beacon).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull();
  }

  it.each(['http://localhost:5003', 'http://127.0.0.1:5003', 'http://[::1]:5003'])(
    'suppresses initialization, pageviews and first-party events at %s even in a production build', (url) => {
      browserAt(url);
      expectTrackingBlocked();
    },
  );

  it('suppresses a development build even on a non-local hostname', () => {
    browserAt('https://development.example.com');
    vi.stubEnv('DEV', true);
    expectTrackingBlocked();
  });

  it.each(['https://typejung.com', 'https://typejung-report-preview.vercel.app'])(
    'preserves initialization and tracking in a hosted production build at %s', (url) => {
      browserAt(url);
      expect(isAnalyticsEnabled()).toBe(true);
      expect(initAnalytics()).toBe(true);
      expect(gtag).toHaveBeenCalledWith('config', expect.any(String), expect.any(Object));
      expect(trackPageView('/results', 'Results')).toBe(true);
      expect(trackEvent('results_premium_preview_viewed', { tier: 'insight' })).toBe(true);
      expect(trackVercelEvent).toHaveBeenCalledWith('page_view', { page_path: '/results', page_title: 'Results' });
      expect(fetch).toHaveBeenCalledWith('/api/analytics', expect.objectContaining({ method: 'POST' }));
    },
  );

  it('still respects disabled consent on a hosted production page', () => {
    browserAt('https://typejung.com');
    setAnalyticsEnabled(false);
    expect(isAnalyticsEnabled()).toBe(false);
    expect(initAnalytics()).toBe(false);
    expect(trackPageView('/results', 'Results')).toBe(false);
    expect(trackEvent('results_premium_preview_viewed')).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
    expect(trackVercelEvent).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});
