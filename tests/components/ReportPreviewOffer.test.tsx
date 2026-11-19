import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReportPreviewOffer } from '../../components/results/ReportPreviewOffer';
import { requestReportPreview } from '../../hooks/use-report-preview';
import { discountedPriceLabel } from '../../data/discount';
import { PRICING } from '../../data/pricing';
import { PREMIUM_REPORT_KEYS, type PremiumAnalysis } from '../../lib/premium-report';
import { buildReportPreview, firstSentence, readReportPreview } from '../../lib/report-preview';

const report = Object.fromEntries(PREMIUM_REPORT_KEYS.map((key) => [
  key,
  `Opening line for ${key}. Second sentence of ${key} that stays locked.\n\nAnother paragraph for ${key}.`,
])) as PremiumAnalysis;
const preview = buildReportPreview(report);

const props = {
  intendedTier: 'insight' as const,
  onUnlock: vi.fn(),
  onViewSampleReport: vi.fn(),
  checkoutOpeningTier: null,
  checkoutError: null,
};

describe('report preview offer', () => {
  it('shows the stress-edge section in full and the other nine as title plus opener', () => {
    render(<ReportPreviewOffer {...props} preview={preview} />);

    const featured = screen.getByRole('article', { name: 'Grip sequence and recovery' });
    expect(within(featured).getByText(/Second sentence of theGrip/)).toBeVisible();
    expect(within(featured).getByText('Another paragraph for theGrip.')).toBeVisible();

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(9);
    expect(within(items[0]).getByRole('heading', { name: 'Pattern synthesis' })).toBeVisible();
    expect(within(items[0]).getByText('Opening line for overview.')).toBeVisible();
    expect(screen.queryByText(/Second sentence of overview/)).toBeNull();
  });

  it('hides the blurred filler from assistive technology and says the section is not readable', () => {
    const { container } = render(<ReportPreviewOffer {...props} preview={preview} />);
    const fillers = container.querySelectorAll('[data-locked-filler]');
    expect(fillers).toHaveLength(9);
    fillers.forEach((filler) => expect(filler).toHaveAttribute('aria-hidden', 'true'));
    expect(screen.getAllByText('The rest of this section is not readable until you get the report.')).toHaveLength(9);
  });

  it('offers one keyboard-reachable unlock button at the Insight price, plus the sample link', () => {
    const onUnlock = vi.fn();
    const onViewSampleReport = vi.fn();
    render(<ReportPreviewOffer {...props} preview={preview} onUnlock={onUnlock} onViewSampleReport={onViewSampleReport} />);

    const price = discountedPriceLabel(PRICING.insight.amount);
    const buttons = screen.getAllByRole('button', { name: /Get my full/ });
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAccessibleName(`Get my full Insight report — ${price}`);
    buttons[0].focus();
    expect(buttons[0]).toHaveFocus();
    fireEvent.click(buttons[0]);
    expect(onUnlock).toHaveBeenCalledExactlyOnceWith('insight', 'results_report_preview');

    fireEvent.click(screen.getByRole('button', { name: 'Or read the full illustrative sample' }));
    expect(onViewSampleReport).toHaveBeenCalledWith('results_report_preview');
    expect(screen.getByText(/One-time payment in CAD. No subscription./)).toBeVisible();
  });

  it('keeps the unlock button available while the section is still being written', () => {
    render(<ReportPreviewOffer {...props} preview={null} />);
    expect(screen.getByRole('status')).toHaveTextContent('Writing this section from your answers.');
    expect(screen.getAllByRole('listitem')).toHaveLength(9);
    expect(screen.getByRole('button', { name: /Get my full Insight report/ })).toBeEnabled();
  });
});

describe('report preview helpers', () => {
  it('caps a long first sentence at a word boundary', () => {
    const long = `${'word '.repeat(80)}end. Next.`;
    const opener = firstSentence(long);
    expect(opener.length).toBeLessThanOrEqual(221);
    expect(opener.endsWith('…')).toBe(true);
  });

  it('rejects a preview response that carries an extra full section', () => {
    expect(readReportPreview(preview)).not.toBeNull();
    expect(readReportPreview({ ...preview, sections: preview.sections.slice(1) })).toBeNull();
    expect(readReportPreview({ ...preview, featured: { ...preview.featured, key: 'overview' } })).toBeNull();
    expect(readReportPreview(null)).toBeNull();
  });
});

describe('preview request fallback', () => {
  const json = (status: number, body: unknown) =>
    vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body }) as unknown as typeof fetch;

  it('returns the preview when the server prepared one', async () => {
    await expect(requestReportPreview({}, json(200, { available: true, preview }))).resolves.toEqual({ status: 'ready', preview });
  });

  it.each([
    ['the table is missing', json(200, { available: false, reason: 'cache_unavailable' }), 'cache_unavailable'],
    ['generation failed', json(503, { available: false, reason: 'generation_failed' }), 'generation_failed'],
    ['the response is malformed', json(200, { available: true, preview: { featured: null } }), 'invalid_response'],
    ['the body is not JSON', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('bad'); } }) as unknown as typeof fetch, 'http_500'],
    ['the network fails', vi.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch, 'network_error'],
  ])('falls back to the previous offer when %s', async (_name, fetcher, reason) => {
    await expect(requestReportPreview({}, fetcher)).resolves.toEqual({ status: 'fallback', reason });
  });
});
