import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Results } from '../../pages/Results';
import { trackEvent } from '../../lib/analytics';
import { PREMIUM_REPORT_KEYS, type PremiumAnalysis } from '../../lib/premium-report';
import { calculateDepthResults } from '../../utils/depthScoring';
import { PAGE_SEO } from '../../hooks/useSEO';

let premiumState: { tier: string; isPremium: boolean; isLoading: boolean };
let analysisState: {
  freeAnalysis: string;
  premiumAnalysis: PremiumAnalysis | null;
  isLoadingFree: boolean;
  isLoadingPremium: boolean;
  freeError: null;
  premiumError: null;
  fetchFreeAnalysis: ReturnType<typeof vi.fn>;
  fetchPremiumAnalysis: ReturnType<typeof vi.fn>;
};
let scrolledIds: string[];

vi.mock('../../hooks/use-auth', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false, isLoading: false }),
}));
vi.mock('../../hooks/use-premium-status', () => ({ usePremiumStatus: () => premiumState }));
vi.mock('../../hooks/use-ai-analysis', () => ({ useAiAnalysis: () => analysisState }));
vi.mock('../../lib/analytics', () => ({
  trackEvent: vi.fn(),
  AnalyticsEvents: { resultsViewed: vi.fn() },
  getFunnelAnonymousId: vi.fn(),
}));
vi.mock('../../components/discount/DiscountCaptureCard', () => ({ DiscountCaptureCard: () => null }));
vi.mock('../../components/ChatBot', () => ({ ChatBot: () => null }));

class ObserverMock {
  static instances: ObserverMock[] = [];
  targets: Element[] = [];
  disconnect = vi.fn();
  constructor(private callback: IntersectionObserverCallback) { ObserverMock.instances.push(this); }
  observe(element: Element) { this.targets.push(element); }
  emit(isIntersecting: boolean) {
    this.callback(this.targets.map((target) => ({ target, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 }) as IntersectionObserverEntry), this as unknown as IntersectionObserver);
  }
}

function LocationControls() {
  const location = useLocation();
  const navigate = useNavigate();
  return <>
    <output aria-label="Current location">{location.pathname}{location.search}{location.hash}</output>
    <button onClick={() => navigate({ pathname: '/results', hash: '#report-career' })}>Open a saved work-section link</button>
  </>;
}

function ResultsRoute({ initial = '/results?source=integration' }: { initial?: string }) {
  return <MemoryRouter initialEntries={[initial]}><LocationControls /><Results /></MemoryRouter>;
}

const reportFixture = Object.fromEntries(PREMIUM_REPORT_KEYS.map((key) => [key, `Personal interpretation for ${key}.`])) as PremiumAnalysis;
const offerImpressions = () => vi.mocked(trackEvent).mock.calls.filter(([event]) => event === 'result_upgrade_offer_viewed');

beforeEach(() => {
  for (const name of ['localStorage', 'sessionStorage']) {
    const entries = new Map<string, string>();
    vi.stubGlobal(name, {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, String(value)),
      removeItem: (key: string) => entries.delete(key),
      clear: () => entries.clear(),
    });
  }
  localStorage.setItem('jungian_assessment_results', JSON.stringify(calculateDepthResults({})));
  premiumState = { tier: 'free', isPremium: false, isLoading: false };
  analysisState = {
    freeAnalysis: 'A reflection from your free map.', premiumAnalysis: null,
    isLoadingFree: false, isLoadingPremium: false, freeError: null, premiumError: null,
    fetchFreeAnalysis: vi.fn(), fetchPremiumAnalysis: vi.fn(),
  };
  ObserverMock.instances = [];
  scrolledIds = [];
  vi.stubGlobal('IntersectionObserver', ObserverMock);
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as MediaQueryList));
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  Element.prototype.scrollIntoView = vi.fn(function (this: Element) { scrolledIds.push(this.id); });
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('result views and report visibility', () => {
  it('opens a saved map link and switches accessible panes while preserving attribution', async () => {
    render(<ResultsRoute initial="/results?source=integration#free-map" />);
    await screen.findByRole('tab', { name: 'Function map' });
    expect(document.title).toBe(PAGE_SEO.results.title);
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    expect(screen.getByRole('tabpanel', { name: 'Function map' })).toBeVisible();
    expect(document.getElementById('result-panel-overview')).not.toBeVisible();
    expect(document.getElementById('result-panel-report')).not.toBeVisible();
    expect(scrolledIds).toContain('free-map');
    expect(offerImpressions()).toHaveLength(0);
    fireEvent.click(screen.getByRole('tab', { name: 'Save & share' }));
    expect(screen.getByRole('tabpanel', { name: 'Save & share' })).toBeVisible();
    expect(screen.getByLabelText('Current location')).toHaveTextContent('/results?source=integration#save-share');
    expect(scrolledIds.at(-1)).toBe('save-share');
    fireEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
    expect(screen.getByLabelText('Current location')).toHaveTextContent('/results?source=integration');
  });

  it('only counts an offer actually seen in the report pane, rejecting queued hidden-pane entries', async () => {
    render(<ResultsRoute />);
    await screen.findByRole('tab', { name: 'Overview' });
    expect(ObserverMock.instances).toHaveLength(0);
    expect(offerImpressions()).toHaveLength(0);

    fireEvent.click(screen.getByRole('tab', { name: 'Go deeper' }));
    const firstObserver = ObserverMock.instances[0];
    expect(firstObserver.targets[0]).toBe(document.getElementById('report-offer'));
    act(() => firstObserver.emit(false));
    expect(offerImpressions()).toHaveLength(0);
    fireEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    expect(firstObserver.disconnect).toHaveBeenCalled();
    act(() => firstObserver.emit(true));
    expect(offerImpressions()).toHaveLength(0);

    fireEvent.click(screen.getByRole('tab', { name: 'Go deeper' }));
    act(() => ObserverMock.instances[1].emit(true));
    expect(offerImpressions()).toHaveLength(1);
    fireEvent.click(screen.getByRole('tab', { name: 'Function map' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Go deeper' }));
    expect(ObserverMock.instances).toHaveLength(2);
    expect(offerImpressions()).toHaveLength(1);
  });

  it('hands focus to the new pane from an overview action while keeping tab navigation focused on its tabs', async () => {
    render(<ResultsRoute />);
    const action = await screen.findByRole('button', { name: /Explore your function map/ });
    action.focus();
    fireEvent.click(action);
    expect(screen.getByRole('tabpanel', { name: 'Function map' })).toHaveFocus();
    const mapTab = screen.getByRole('tab', { name: 'Function map' });
    mapTab.focus();
    fireEvent.keyDown(mapTab, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Go deeper' })).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Go deeper' })).toBeVisible();
  });

  it('resolves a paid report deep link after asynchronous report content arrives, without later jumping back', async () => {
    premiumState = { tier: 'insight', isPremium: true, isLoading: false };
    analysisState.isLoadingPremium = true;
    const view = render(<ResultsRoute initial="/results#report-career" />);
    await screen.findByRole('tab', { name: 'Your report' });
    expect(screen.getByRole('tabpanel', { name: 'Your report' })).toBeVisible();
    expect(document.getElementById('report-career')).toBeNull();
    expect(scrolledIds).toEqual([]);

    analysisState = { ...analysisState, isLoadingPremium: false, premiumAnalysis: reportFixture };
    view.rerender(<ResultsRoute initial="/results#report-career" />);
    await screen.findByRole('heading', { name: 'Work conditions and friction' });
    expect(document.getElementById('report-career')).toBeVisible();
    expect(scrolledIds).toEqual(['report-career']);
    const contents = screen.getByRole('navigation', { name: 'Your report contents' });
    expect(within(contents).getAllByRole('link')).toHaveLength(10);
    for (const link of within(contents).getAllByRole('link')) {
      const article = document.getElementById(link.getAttribute('href')!.slice(1));
      expect(article).toBeVisible();
    }
    analysisState = { ...analysisState, premiumAnalysis: { ...reportFixture } };
    view.rerender(<ResultsRoute initial="/results#report-career" />);
    expect(scrolledIds).toEqual(['report-career']);
    expect(offerImpressions()).toHaveLength(0);
  });

  it('reveals a hidden paid report from a section link and uses the premium destination for its tab', async () => {
    premiumState = { tier: 'insight', isPremium: true, isLoading: false };
    analysisState.premiumAnalysis = reportFixture;
    render(<ResultsRoute />);
    await screen.findByRole('tab', { name: 'Your report' });
    expect(document.getElementById('report-career')).not.toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Open a saved work-section link' }));
    await waitFor(() => expect(screen.getByRole('tabpanel', { name: 'Your report' })).toBeVisible());
    expect(document.getElementById('report-career')).toBeVisible();
    expect(scrolledIds.at(-1)).toBe('report-career');
    fireEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Your report' }));
    expect(screen.getByLabelText('Current location')).toHaveTextContent('/results#premium-report');
    expect(scrolledIds.at(-1)).toBe('premium-report');
  });
});
