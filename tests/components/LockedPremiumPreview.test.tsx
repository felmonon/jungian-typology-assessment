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

const results = calculateDepthResults({});
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
    fireEvent.click(screen.getByRole('tab', { name: 'Work' }));
    expect(trackEvent).toHaveBeenCalledWith('result_report_sample_explored', {
      topic: 'work', source: 'results_locked_preview', tier: 'mastery',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Read the full illustrative sample' }));
    expect(onViewSampleReport).toHaveBeenCalledWith('results_locked_preview');
  });
});
