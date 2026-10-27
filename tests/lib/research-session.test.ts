import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getFunnelAnonymousId, setAnalyticsEnabled, trackEvent } from '../../lib/analytics';

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));
vi.mock('../../lib/traffic-attribution', () => ({ trafficAttributionParams: () => ({}) }));

const studyUrl = 'https://typejung.com/?utm_source=typejung_research&utm_campaign=offer_observation_2026_10';
const customerKey = 'typejung_funnel_anonymous_id';
const store = () => {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
};
let tabStorage: ReturnType<typeof store>;
let customerStorage: ReturnType<typeof store>;
const crypto = window.crypto;
function load(url: string) {
  vi.stubGlobal('window', { location: new URL(url), sessionStorage: tabStorage, crypto });
}
beforeEach(() => {
  tabStorage = store();
  customerStorage = store();
  customerStorage.setItem(customerKey, 'existing_customer_browser');
  vi.stubGlobal('localStorage', customerStorage);
  vi.stubEnv('DEV', false);
  Object.defineProperty(navigator, 'sendBeacon', { configurable: true, value: vi.fn(() => false) });
  setAnalyticsEnabled(true);
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('isolated research browser identity', () => {
  it('keeps ordinary traffic on its existing customer identity', () => {
    load('https://typejung.com/');
    expect(getFunnelAnonymousId()).toBe('existing_customer_browser');
  });

  it('separates a study entry even after a normal ID was cached without overwriting it', () => {
    load('https://typejung.com/');
    expect(getFunnelAnonymousId()).toBe('existing_customer_browser');
    window.location = new URL(studyUrl) as unknown as Location;
    const research = getFunnelAnonymousId();
    expect(research).toMatch(/^research_observation_v1_/);
    expect(customerStorage.getItem(customerKey)).toBe('existing_customer_browser');
    window.location = new URL('https://typejung.com/results') as unknown as Location;
    expect(getFunnelAnonymousId()).toBe(research);
    load('https://typejung.com/results');
    expect(getFunnelAnonymousId()).toBe(research);
  });

  it('does not mark a new tab after the study tab storage is gone', () => {
    load(studyUrl);
    expect(getFunnelAnonymousId()).toMatch(/^research_observation_v1_/);
    tabStorage = store();
    load('https://typejung.com/');
    expect(getFunnelAnonymousId()).toBe('existing_customer_browser');
  });

  it.each([
    'https://typejung.com/?utm_source=typejung_research',
    'https://typejung.com/?utm_source=google&utm_campaign=offer_observation_2026_10',
    'https://typejung.com/?utm_source=typejung_research&utm_campaign=another_study',
  ])('requires the exact study marker: %s', url => {
    load(url);
    expect(getFunnelAnonymousId()).toBe('existing_customer_browser');
  });

  it('retains the study ID in memory when storage is blocked and mirrors it without campaign fields', () => {
    load(studyUrl);
    Object.defineProperty(window, 'sessionStorage', { get: () => { throw new Error('Storage denied'); } });
    const study = getFunnelAnonymousId();
    window.location = new URL('https://typejung.com/results') as unknown as Location;
    trackEvent('results_premium_preview_viewed');
    const payload = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(payload.anonymousId).toBe(study);
    expect(study).toMatch(/^research_observation_v1_/);
    expect(payload.properties).toEqual({});
    expect(customerStorage.getItem(customerKey)).toBe('existing_customer_browser');
  });
});
