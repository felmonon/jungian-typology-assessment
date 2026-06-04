import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiscountCaptureCard } from '../../components/discount/DiscountCaptureCard';

const authState = vi.hoisted(() => ({
  user: null as { email?: string } | null,
}));

vi.mock('../../hooks/use-auth', () => ({
  useAuth: () => ({ user: authState.user }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../lib/analytics', () => ({
  AnalyticsEvents: {
    ctaClicked: vi.fn(),
    errorOccurred: vi.fn(),
  },
  trackEvent: vi.fn(),
}));

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

describe('DiscountCaptureCard', () => {
  beforeEach(() => {
    authState.user = null;
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    });
    vi.mocked(fetch).mockReset();
  });

  it('does not show a stale captured email from local storage', () => {
    localStorage.setItem('typejung_discount_capture', JSON.stringify({
      email: 'felmonon@gmail.com',
      capturedAt: '2026-05-20T00:00:00.000Z',
    }));

    render(<DiscountCaptureCard source="test_source" />);

    expect(screen.queryByText(/Check your inbox/i)).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('felmonon@gmail.com')).not.toBeInTheDocument();
    expect(localStorage.getItem('typejung_discount_capture')).toBeNull();
  });

  it('only shows the sent state when the API confirms delivery', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      sent: false,
      skipped: true,
      reason: 'resend_not_configured',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));

    render(<DiscountCaptureCard source="test_source" />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'person@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /email my offer/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email sending is not available right now/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Check your inbox/i)).not.toBeInTheDocument();
  });

  it('confirms delivery without rendering the submitted email address', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      sent: true,
      captured: true,
      percentOff: 30,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));

    render(<DiscountCaptureCard source="test_source" />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'private@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /email my offer/i }));

    await waitFor(() => {
      expect(screen.getByText(/Check your inbox for the code/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/email you entered/i)).toBeInTheDocument();
    expect(screen.queryByText(/private@example.com/i)).not.toBeInTheDocument();
  });
});
