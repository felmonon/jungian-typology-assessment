import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiscountCaptureCard } from '../../components/discount/DiscountCaptureCard';
import { depthQuestions } from '../../data/depthAssessment';
import { encodeResultCode } from '../../lib/result-link';
import { STORAGE_KEYS } from '../../lib/validation';
import { calculateDepthResults } from '../../utils/depthScoring';

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../hooks/use-auth', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('../../lib/analytics', () => ({
  trackEvent: vi.fn(),
  AnalyticsEvents: {
    ctaClicked: vi.fn(),
  },
}));

describe('DiscountCaptureCard', () => {
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
    mockNavigate.mockReset();
  });

  it('continues directly through the supplied checkout handler after email capture', () => {
    localStorage.setItem('typejung_discount_capture', JSON.stringify({
      email: 'reader@example.com',
      discountCode: 'TYPEJUNG30',
      tierIntent: 'insight',
    }));
    const onCheckout = vi.fn();

    render(
      <DiscountCaptureCard
        source="results_hero_axis_save_path"
        minimal
        preferredTier="insight"
        showCheckoutButtons
        onCheckout={onCheckout}
        checkoutButtonLabel="Continue to secure checkout - CA$7"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue to secure checkout - CA$7' }));

    expect(onCheckout).toHaveBeenCalledWith('insight');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('sends the saved map code with a checkout email request so the link can restore it', async () => {
    const result = calculateDepthResults(
      Object.fromEntries(depthQuestions.map((q) => [q.id, q.options[1].id])),
    );
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(result));
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ sent: true, captured: true }), { status: 200 }));

    render(<DiscountCaptureCard source="results_offer_not_ready" minimal preferredTier="insight" />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'reader@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Email code/ }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.resultCode).toBe(encodeResultCode(result));
  });
});
