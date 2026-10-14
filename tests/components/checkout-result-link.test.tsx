import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { depthQuestions } from '../../data/depthAssessment';
import { encodeResultCode } from '../../lib/result-link';
import { STORAGE_KEYS } from '../../lib/validation';
import { Checkout } from '../../pages/Checkout';
import { calculateDepthResults } from '../../utils/depthScoring';

const { trackEvent } = vi.hoisted(() => ({ trackEvent: vi.fn() }));

vi.mock('../../hooks/use-auth', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('../../hooks/useSEO', () => ({ useSEO: () => undefined }));

vi.mock('../../lib/analytics', () => ({
  trackEvent,
  getFunnelAnonymousId: () => 'anon',
  AnalyticsEvents: { ctaClicked: vi.fn(), purchaseStarted: vi.fn() },
}));

const answers = Object.fromEntries(
  depthQuestions.map((question, index) => [
    question.id,
    question.options[index % question.options.length].id,
  ]),
);
const result = calculateDepthResults(answers);
const code = encodeResultCode(result)!;

let currentHash = '';
const HashProbe = () => {
  currentHash = useLocation().hash;
  return null;
};

const renderCheckout = (entry: string) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route
          path="/checkout/:tier"
          element={
            <>
              <Checkout />
              <HashProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

describe('checkout opened from an emailed link', () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        clear: () => values.clear(),
        getItem: (key: string) => values.get(key) ?? null,
        key: (index: number) => Array.from(values.keys())[index] ?? null,
        removeItem: (key: string) => values.delete(key),
        setItem: (key: string, value: string) => values.set(key, String(value)),
        get length() {
          return values.size;
        },
      },
    });
    currentHash = '';
  });

  it('asks a browser with no saved map to take the assessment first', () => {
    renderCheckout('/checkout/insight?source=x_email');

    expect(
      screen.getByRole('heading', { name: /Take the assessment before paying/ }),
    ).toBeInTheDocument();
  });

  it('rebuilds the map from the link and shows the payment step', () => {
    renderCheckout(`/checkout/insight?source=x_email#map=${code}`);

    expect(
      screen.getByRole('button', { name: /Continue to payment/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('Based on your saved map')).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS)!);
    expect(saved.dominant).toBe(result.dominant);
    expect(currentHash).toBe('');
    expect(trackEvent).toHaveBeenCalledWith(
      'checkout_review_viewed',
      expect.objectContaining({
        has_local_results: true,
        result_restored_from_link: true,
      }),
    );
  });

  it('keeps an existing saved map instead of the one in the link', () => {
    const other = calculateDepthResults(
      Object.fromEntries(depthQuestions.map((q) => [q.id, q.options[0].id])),
    );
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(other));

    renderCheckout(`/checkout/insight#map=${code}`);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS)!);
    expect(saved.completedAt).toBe(other.completedAt);
    expect(trackEvent).toHaveBeenCalledWith(
      'checkout_result_link_opened',
      expect.objectContaining({ restored: false, had_local_results: true }),
    );
  });
});
