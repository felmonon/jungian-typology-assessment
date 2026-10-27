import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));
vi.mock('../../lib/traffic-attribution', () => ({ trafficAttributionParams: () => ({}) }));

describe('funnel event delivery during UI event bursts', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-27T14:00:00Z'));
    vi.stubEnv('DEV', false);
    vi.stubGlobal('window', { location: new URL('https://typejung.com/results'), crypto: window.crypto });
    Object.defineProperty(navigator, 'sendBeacon', { configurable: true, value: vi.fn(() => false) });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('keeps completion, report navigation and offer views even after the UI event limit', async () => {
    const { trackEvent } = await import('../../lib/analytics');
    for (let i = 0; i < 100; i++) expect(trackEvent('question_interaction')).toBe(true);
    expect(trackEvent('question_interaction')).toBe(false);
    const stages = ['assessment_completed', 'results_viewed', 'result_upgrade_prompt_viewed', 'result_upgrade_entry_clicked', 'result_report_opened', 'results_premium_preview_viewed'];
    for (const stage of stages) expect(trackEvent(stage)).toBe(true);
    expect(vi.mocked(fetch).mock.calls.map(([, options]) => JSON.parse(options!.body as string).eventName)).toEqual(stages);
  });

  it('resets the rate window after a minute of ongoing activity, without requiring an idle minute', async () => {
    const { trackEvent } = await import('../../lib/analytics');
    for (let i = 0; i < 100; i++) {
      expect(trackEvent('question_interaction')).toBe(true);
      vi.advanceTimersByTime(500);
    }
    expect(trackEvent('question_interaction')).toBe(false);
    vi.advanceTimersByTime(10_000);
    expect(trackEvent('question_interaction')).toBe(true);
  });
});
