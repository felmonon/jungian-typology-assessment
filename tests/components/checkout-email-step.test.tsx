import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { depthQuestions } from '../../data/depthAssessment';
import { STORAGE_KEYS } from '../../lib/validation';
import {
  Checkout,
  CHECKOUT_RECOVERY_CONSENT_LABEL,
  resolveCheckoutRecoveryChoice,
} from '../../pages/Checkout';
import { calculateDepthResults } from '../../utils/depthScoring';

const { authState } = vi.hoisted(() => ({ authState: { user: null as null | { email: string } } }));

vi.mock('../../hooks/use-auth', () => ({ useAuth: () => authState }));
vi.mock('../../hooks/useSEO', () => ({ useSEO: () => undefined }));
vi.mock('../../lib/analytics', () => ({
  trackEvent: vi.fn(),
  getFunnelAnonymousId: () => 'anon',
  AnalyticsEvents: { ctaClicked: vi.fn(), purchaseStarted: vi.fn() },
}));
vi.mock('../../lib/pending-checkout', () => ({ writePendingCheckout: vi.fn() }));

const result = calculateDepthResults(
  Object.fromEntries(depthQuestions.map((q) => [q.id, q.options[1].id])),
);

const renderCheckout = (tier = 'insight') =>
  render(
    <MemoryRouter initialEntries={[`/checkout/${tier}`]}>
      <Routes>
        <Route path="/checkout/:tier" element={<Checkout />} />
      </Routes>
    </MemoryRouter>,
  );

const checkoutRequestBody = () => {
  const call = vi.mocked(fetch).mock.calls.find(([url]) => url === '/api/create-checkout-session');
  expect(call).toBeDefined();
  return JSON.parse(String(call![1]!.body));
};

describe('checkout email step', () => {
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
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(result));
    authState.user = null;
    vi.mocked(fetch).mockReset().mockImplementation(async (url) => {
      if (url === '/api/create-checkout-session') {
        // Stop before navigation: an error keeps the page mounted.
        return { ok: false, json: async () => ({ error: 'stop here' }) } as Response;
      }
      return { ok: true, json: async () => ({ show: false }) } as Response;
    });
  });

  it('shows the email field and an unticked consent line above the payment button', () => {
    renderCheckout();
    const email = screen.getByRole('textbox', { name: /^Email/ });
    const consent = screen.getByRole('checkbox', { name: CHECKOUT_RECOVERY_CONSENT_LABEL });
    const pay = screen.getByRole('button', { name: /Continue to payment/ });

    expect(email).toBeVisible();
    expect(email.closest('details')).toBeNull();
    expect(consent).toBeVisible();
    expect(consent).not.toBeChecked();
    expect(email.compareDocumentPosition(pay) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(consent.compareDocumentPosition(pay) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText('(optional)')).toBeInTheDocument();
  });

  it('prefills from an earlier capture, then from the signed-in account', () => {
    localStorage.setItem('typejung_discount_capture', JSON.stringify({ email: 'Saved@Example.com' }));
    const { unmount } = renderCheckout();
    expect(screen.getByRole('textbox', { name: /^Email/ })).toHaveValue('saved@example.com');
    unmount();

    localStorage.removeItem('typejung_discount_capture');
    authState.user = { email: 'account@example.com' };
    renderCheckout();
    expect(screen.getByRole('textbox', { name: /^Email/ })).toHaveValue('account@example.com');
  });

  it('pays without an email or consent', async () => {
    renderCheckout();
    fireEvent.click(screen.getByRole('button', { name: /Continue to payment/ }));
    await waitFor(() => expect(checkoutRequestBody()).toMatchObject({ tier: 'insight', recoveryEmailOptIn: false }));
    expect(checkoutRequestBody().customerEmail).toBeUndefined();
  });

  it('sends consent only when the box is ticked, and nothing to the discount-lead flow', async () => {
    renderCheckout('mastery');
    fireEvent.change(screen.getByRole('textbox', { name: /^Email/ }), { target: { value: ' Reader@Example.com ' } });
    fireEvent.click(screen.getByRole('checkbox', { name: CHECKOUT_RECOVERY_CONSENT_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: /Continue to payment/ }));

    await waitFor(() => expect(checkoutRequestBody()).toMatchObject({
      tier: 'mastery',
      customerEmail: 'reader@example.com',
      recoveryEmailOptIn: true,
    }));
    const urls = vi.mocked(fetch).mock.calls.map(([url]) => String(url));
    expect(urls).not.toContain('/api/auth/discount-lead');
  });

  it('keeps a typed email but no consent when the box is left unticked', async () => {
    renderCheckout();
    fireEvent.change(screen.getByRole('textbox', { name: /^Email/ }), { target: { value: 'reader@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue to payment/ }));
    await waitFor(() => expect(checkoutRequestBody()).toMatchObject({
      customerEmail: 'reader@example.com',
      recoveryEmailOptIn: false,
    }));
  });

  it('asks for an email instead of sending consent with none', async () => {
    renderCheckout();
    fireEvent.click(screen.getByRole('checkbox', { name: CHECKOUT_RECOVERY_CONSENT_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: /Continue to payment/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Add your email');
    expect(vi.mocked(fetch).mock.calls.some(([url]) => url === '/api/create-checkout-session')).toBe(false);
    expect(screen.getByRole('textbox', { name: /^Email/ })).toHaveFocus();
  });

  it('shows the list price with no discount lines', () => {
    renderCheckout('mastery');
    expect(screen.getAllByText('CA$19').length).toBeGreaterThan(0);
    expect(document.body.textContent).not.toMatch(/offer applied|Regular price|20\.30|TYPEJUNG30/);
  });
});

describe('resolveCheckoutRecoveryChoice', () => {
  it.each([
    [{ typedEmail: '', optIn: false }, { recoveryEmailOptIn: false, customerEmail: undefined }],
    [{ typedEmail: '', optIn: false, fallbackEmail: 'account@example.com' }, { recoveryEmailOptIn: false, customerEmail: 'account@example.com' }],
    [{ typedEmail: 'A@B.co', optIn: true }, { recoveryEmailOptIn: true, customerEmail: 'a@b.co' }],
    [{ typedEmail: 'a@b.co', optIn: false }, { recoveryEmailOptIn: false, customerEmail: 'a@b.co' }],
  ])('%o', (input, expected) => {
    expect(resolveCheckoutRecoveryChoice(input)).toEqual(expected);
  });

  it('never uses a hidden fallback address for consent', () => {
    expect(resolveCheckoutRecoveryChoice({ typedEmail: '', optIn: true, fallbackEmail: 'account@example.com' }))
      .toEqual({ recoveryEmailOptIn: false, error: 'consent_needs_email' });
  });

  it('flags a mistyped address', () => {
    expect(resolveCheckoutRecoveryChoice({ typedEmail: 'reader@', optIn: false }))
      .toEqual({ recoveryEmailOptIn: false, error: 'invalid_email' });
  });
});
