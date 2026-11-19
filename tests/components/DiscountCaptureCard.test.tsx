import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DiscountCaptureCard,
  RESULT_LINK_CONSENT_LABEL,
  RESULT_LINK_CONSENT_VERSION,
} from '../../components/discount/DiscountCaptureCard';
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
    errorOccurred: vi.fn(),
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
    fireEvent.click(screen.getByRole('checkbox', { name: RESULT_LINK_CONSENT_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: /Email my link/ }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.resultCode).toBe(encodeResultCode(result));
  });

  it('asks for explicit, unticked consent before sending anything', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ sent: true, captured: true }), { status: 200 }));

    render(<DiscountCaptureCard source="results_save_return_link" minimal preferredTier="insight" />);
    const consent = screen.getByRole('checkbox', { name: RESULT_LINK_CONSENT_LABEL });
    expect(consent).not.toBeChecked();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'reader@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Email my link/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Tick the box');
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(consent);
    fireEvent.click(screen.getByRole('button', { name: /Email my link/ }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body).toMatchObject({
      email: 'reader@example.com',
      source: 'results_save_return_link',
      emailConsent: true,
      consentVersion: RESULT_LINK_CONSENT_VERSION,
    });
    expect(await screen.findByText(/Your link is in your inbox/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('typejung_discount_capture')!)).toMatchObject({ linkSent: true });
  });

  it('no longer offers a backup of the auto-applied code', () => {
    const { container } = render(<DiscountCaptureCard source="results_offer_not_ready" />);
    expect(container.textContent).not.toMatch(/TYPEJUNG30|% off|backup code|discount/i);
  });

  it('only prefills, and does not mark as sent, an email saved by checkout', () => {
    localStorage.setItem('typejung_discount_capture', JSON.stringify({
      email: 'buyer@example.com',
      source: 'checkout_recovery_prestripe',
    }));
    render(<DiscountCaptureCard source="results_offer_not_ready" minimal />);
    expect(screen.getByRole('textbox')).toHaveValue('buyer@example.com');
    expect(screen.getByRole('button', { name: /Email my link/ })).toBeInTheDocument();
  });
});
