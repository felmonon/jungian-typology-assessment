import { ArrowRight, Loader2, Lock } from 'lucide-react';
import React from 'react';
import { type PaidTierId, PRICING } from '../../data/pricing';
import { SUPPORT_EMAIL } from '../../data/support';
import { PREMIUM_REPORT_KEYS } from '../../lib/premium-report';
import {
  FEATURED_PREVIEW_SECTION,
  PREMIUM_REPORT_SECTION_TITLES,
  type ReportPreview,
} from '../../lib/report-preview';
import { paidTierPrice } from '../../lib/result-format';
import { Button } from '../ui/Button';

// Shown blurred under each locked opener. It is generic filler, never report
// text, and it is hidden from assistive technology.
const LOCKED_FILLER =
  'The rest of this section continues from your result with examples, a short practice, and questions to bring into the week ahead.';

const FEATURED_POSITION = PREMIUM_REPORT_KEYS.indexOf(FEATURED_PREVIEW_SECTION) + 1;

export const ReportPreviewOffer: React.FC<{
  preview: ReportPreview | null;
  offerRef?: React.Ref<HTMLElement>;
  intendedTier: PaidTierId;
  onUnlock: (tier: PaidTierId, location: string) => void;
  onViewSampleReport: (location: string) => void;
  checkoutOpeningTier: PaidTierId | null;
  checkoutError: string | null;
  notReadyCapture?: React.ReactNode;
}> = ({
  preview,
  offerRef,
  intendedTier,
  onUnlock,
  onViewSampleReport,
  checkoutOpeningTier,
  checkoutError,
  notReadyCapture,
}) => {
  const tierName = PRICING[intendedTier].name;
  const offerPrice = paidTierPrice(intendedTier);
  const regularPrice = PRICING[intendedTier].price;
  const isOpening = checkoutOpeningTier === intendedTier;
  const lockedSections = preview?.sections
    ?? PREMIUM_REPORT_KEYS.filter((key) => key !== FEATURED_PREVIEW_SECTION).map((key) => ({
      key,
      title: PREMIUM_REPORT_SECTION_TITLES[key],
      opener: '',
    }));
  const paragraphs = preview?.featured.body.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean) ?? [];

  return (
    <section
      id="report-offer"
      ref={offerRef}
      className="studio-report-offer mb-8 scroll-mt-28"
      data-offer-variant="preview_v2"
      aria-labelledby="report-preview-heading"
    >
      <div className="mx-auto max-w-3xl">
        <p className="journey-eyebrow">The first section of your {tierName} report</p>
        <h2 id="report-preview-heading" className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
          Read your stress edge before you decide.
        </h2>
        <p className="mt-4 text-sm leading-7 text-jung-secondary">
          This section was written by AI from your completed assessment, for educational self-reflection. Read it in full. If it fits, the other nine sections follow the same pattern. Your free map stays free either way.
        </p>

        <article
          className="mt-6 rounded-2xl border border-jung-accent-muted bg-white p-5 sm:p-8"
          aria-labelledby="report-preview-featured-title"
          aria-busy={preview ? undefined : true}
        >
          <p className="text-label">Section {FEATURED_POSITION} of {PREMIUM_REPORT_KEYS.length} · Free to read</p>
          <h3 id="report-preview-featured-title" className="mt-2 font-display text-2xl text-jung-dark">
            {PREMIUM_REPORT_SECTION_TITLES[FEATURED_PREVIEW_SECTION]}
          </h3>
          {preview ? (
            <div className="mt-4 space-y-4 text-sm leading-7 text-jung-secondary sm:text-base sm:leading-8">
              {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          ) : (
            <div className="mt-4">
              <p role="status" className="flex items-center gap-2 text-sm text-jung-secondary">
                <Loader2 className="h-4 w-4 animate-spin text-jung-accent" aria-hidden="true" />
                Writing this section from your answers. This can take up to a minute.
              </p>
              <div className="mt-4 space-y-2" aria-hidden="true">
                {[100, 96, 92, 98, 70].map((width, index) => (
                  <div key={index} className="h-3 animate-pulse rounded bg-jung-border-light" style={{ width: `${width}%` }} />
                ))}
              </div>
            </div>
          )}
        </article>

        <div className="mt-8">
          <h3 className="text-base font-semibold text-jung-dark">The other nine sections</h3>
          <p className="mt-1 text-xs leading-6 text-jung-muted">Each opens with the line shown here. The rest stays locked until you get the report.</p>
          <ol className="mt-4 space-y-3">
            {lockedSections.map((section) => (
              <li key={section.key} className="rounded-xl border border-jung-border bg-jung-surface p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-jung-dark">{section.title}</h4>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs text-jung-muted">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    Locked
                  </span>
                </div>
                {section.opener ? (
                  <p className="mt-2 text-sm leading-6 text-jung-secondary">{section.opener}</p>
                ) : (
                  <div className="mt-3 h-3 w-4/5 animate-pulse rounded bg-jung-border-light" aria-hidden="true" />
                )}
                <p
                  aria-hidden="true"
                  data-locked-filler
                  className="pointer-events-none mt-1 select-none text-sm leading-6 text-jung-secondary opacity-60 blur-[3px]"
                >
                  {LOCKED_FILLER}
                </p>
                <p className="sr-only">The rest of this section is not readable until you get the report.</p>
              </li>
            ))}
          </ol>
        </div>

        <div id="report-purchase" className="mt-8 scroll-mt-28 rounded-2xl border border-jung-accent-muted bg-white p-5 text-center sm:p-6">
          <div data-report-buy>
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={() => onUnlock(intendedTier, 'results_report_preview')}
              disabled={isOpening}
              rightIcon={isOpening ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            >
              {isOpening ? 'Checking availability…' : `Get my full ${tierName} report — ${offerPrice}`}
            </Button>
          </div>
          {regularPrice !== offerPrice && (
            <p className="mt-2 text-xs text-jung-muted">
              <span className="sr-only">Regular price </span>
              <s>{regularPrice}</s> regular price · current offer
            </p>
          )}
          <p className="mt-3 text-xs leading-6 text-jung-muted">
            One-time payment in CAD. No subscription. 7-day refund policy. The section above stays in your full report.
          </p>
          {checkoutError && (
            <p className="mt-4 rounded-lg border border-error/20 bg-error/5 p-3 text-left text-sm leading-6 text-error" role="alert">
              {checkoutError}{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">Contact support</a>
            </p>
          )}
          <button
            type="button"
            className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-jung-accent underline underline-offset-4"
            onClick={() => onViewSampleReport('results_report_preview')}
          >
            Or read the full illustrative sample
          </button>
        </div>

        {notReadyCapture && (
          <div className="mt-6 border-t border-jung-border pt-5" data-testid="offer-not-ready">
            {notReadyCapture}
          </div>
        )}
      </div>
    </section>
  );
};
