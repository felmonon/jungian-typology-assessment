import { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LockedPremiumPreview } from '../../pages/Results';
import { discountedPriceLabel } from '../../data/discount';
import { PRICING, type PaidTierId } from '../../data/pricing';
import { calculateDepthResults } from '../../utils/depthScoring';
import { trackEvent } from '../../lib/analytics';

vi.mock('../../lib/analytics', () => ({
  trackEvent: vi.fn(),
  AnalyticsEvents: {},
  getFunnelAnonymousId: vi.fn(),
}));

const results = calculateDepthResults({ inferior_03: 'inferior-feeling' });
const commonProps = {
  results,
  inferiorLabel: 'Extraverted feeling',
  intendedTier: 'insight' as PaidTierId,
  onUnlock: vi.fn(),
  onViewSampleReport: vi.fn(),
  checkoutOpeningTier: null,
  checkoutError: null,
};

describe('optional report offer', () => {
  it.each(['insight', 'mastery'] as const)('shows the configured discounted %s price and passes that selected tier to checkout', (tier) => {
    const onUnlock = vi.fn();
    render(<LockedPremiumPreview {...commonProps} intendedTier={tier} onUnlock={onUnlock} />);
    const price = discountedPriceLabel(PRICING[tier].amount);
    expect(screen.getByText(`Optional ${PRICING[tier].name} report`)).toBeVisible();
    expect(screen.getByText('one time · CAD')).toBeVisible();
    const button = screen.getByRole('button', { name: `Get my report — ${price}` });
    fireEvent.click(button);
    expect(onUnlock).toHaveBeenCalledExactlyOnceWith(tier, 'results_locked_preview');
    fireEvent.click(screen.getByText('How this connects to your free map'));
    expect(screen.getByText(results.narrative.developmentalEdge)).toBeVisible();
    expect(screen.getByText(/Your free map is complete. No subscription./)).toBeVisible();
    expect(screen.getByText(/7-day refund policy/)).toBeVisible();
    expect(Boolean(screen.queryByText('AI Type Guide and practice tools'))).toBe(tier === 'mastery');
  });

  it('disables repeat checkout clicks while availability is being checked', () => {
    const onUnlock = vi.fn();
    function PendingOffer() {
      const [openingTier, setOpeningTier] = useState<PaidTierId | null>(null);
      return <LockedPremiumPreview {...commonProps} checkoutOpeningTier={openingTier} onUnlock={(tier, source) => {
        onUnlock(tier, source);
        setOpeningTier(tier);
      }} />;
    }
    render(<PendingOffer />);
    fireEvent.click(screen.getByRole('button', { name: /Get my report/ }));
    const pending = screen.getByRole('button', { name: 'Checking availability…' });
    expect(pending).toBeDisabled();
    fireEvent.click(pending);
    expect(onUnlock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Read the full illustrative sample' })).toBeEnabled();
  });

  it('shows a recoverable checkout error without removing the free-map reassurance', () => {
    render(<LockedPremiumPreview {...commonProps} checkoutError="Secure checkout is temporarily unavailable. Please try again." />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Secure checkout is temporarily unavailable. Please try again.');
    expect(within(alert).getByRole('link', { name: 'Contact support' })).toHaveAttribute('href', expect.stringMatching(/^mailto:/));
    expect(screen.getByRole('button', { name: /Get my report/ })).toBeEnabled();
    expect(screen.getByText(/Your free map is complete. No subscription./)).toBeVisible();
  });

  it('keeps sample exploration connected to its offer tier and exposes the actual section to impression tracking', () => {
    const onViewSampleReport = vi.fn();
    const offerRef = vi.fn();
    render(<LockedPremiumPreview {...commonProps} intendedTier="mastery" onViewSampleReport={onViewSampleReport} offerRef={offerRef} />);
    expect(offerRef).toHaveBeenCalledWith(document.getElementById('report-offer'));
    expect(trackEvent).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Why this reflection?'));
    expect(screen.getByText('“I can be flooded by need, shame, or sensitivity I usually keep hidden”')).toBeVisible();
    expect(trackEvent).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Read the full illustrative sample' }));
    expect(onViewSampleReport).toHaveBeenCalledWith('results_locked_preview');
  });

  it('shows personal evidence before the paid offer and explains what remains free', () => {
    render(<LockedPremiumPreview {...commonProps} />);
    expect(screen.getByRole('heading', { level: 2, name: /Notice the shift/ })).toBeVisible();
    expect(screen.getByText(/Your map, first read, and the reflection here stay free/)).toBeVisible();
    expect(screen.getByText(/No retake needed/)).toBeVisible();
    expect(screen.getByText('Secure payment by Stripe')).toBeVisible();
    const preview = screen.getByRole('heading', { name: 'When feeling valued becomes the question.' });
    const purchaseCard = document.getElementById('report-purchase')!;
    expect(preview.compareDocumentPosition(purchaseCard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('places the not-ready email option inside the purchase card, after the checkout button', () => {
    render(<LockedPremiumPreview {...commonProps} notReadyCapture={<p>Not ready to decide?</p>} />);
    const purchaseCard = document.getElementById('report-purchase')!;
    const capture = within(purchaseCard).getByTestId('offer-not-ready');
    expect(within(capture).getByText('Not ready to decide?')).toBeVisible();
    const checkoutButton = within(purchaseCard).getByRole('button', { name: /Get my report/ });
    expect(checkoutButton.compareDocumentPosition(capture) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('omits the not-ready slot when none is given', () => {
    render(<LockedPremiumPreview {...commonProps} />);
    expect(screen.queryByTestId('offer-not-ready')).toBeNull();
  });
});
