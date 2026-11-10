import React from 'react';
import { ArrowRight, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { SUPPORT_EMAIL } from '../../data/support';

export type ReportUnlockSection = {
  title: string;
  detail: string;
};

/**
 * Describes what each of the ten report sections covers for this visitor's own
 * stack. These lines describe the sections; they are not excerpts, because the
 * report itself is generated only after purchase.
 */
export function buildReportUnlockSections({
  stackCodes,
  dominantLabel,
  inferiorLabel,
}: {
  stackCodes: string[];
  dominantLabel: string;
  inferiorLabel: string;
}): ReportUnlockSection[] {
  const [dominant = 'your leading function', auxiliary = 'your supporting function', tertiary = 'your third function', inferior = 'your inferior function'] = stackCodes;
  const stackList = stackCodes.length > 1
    ? `${stackCodes.slice(0, -1).join(', ')}, and ${stackCodes[stackCodes.length - 1]}`
    : stackCodes[0] || 'your four functions';
  return [
    { title: 'Pattern synthesis', detail: `How ${stackList} work together as one pattern.` },
    { title: 'Function dynamics', detail: `Where ${dominant} leads, how ${auxiliary} supports it, and what ${tertiary} adds.` },
    { title: 'Archetypal pattern', detail: 'The role each function tends to play in your stack.' },
    { title: 'Grip sequence and recovery', detail: `What can happen when ${inferior} takes over under stress, and ways back.` },
    { title: 'Relationship pattern and repair', detail: `How ${dominantLabel} can show up with people close to you.` },
    { title: 'Work conditions and friction', detail: `Where ${dominant} tends to do its best work, and what wears it down.` },
    { title: 'Individuation path', detail: `Developing ${inferiorLabel} without abandoning ${dominantLabel}.` },
    { title: 'Shadow triggers and integration', detail: 'What tends to set off your less conscious side.' },
    { title: 'Growth practices', detail: 'Small practices matched to your stack.' },
    { title: 'Dream reflection prompts', detail: 'Questions for working with dreams and imagery.' },
  ];
}

type ReportUnlockCardProps = {
  cardRef?: React.Ref<HTMLElement>;
  tierName: string;
  offerPrice: string;
  regularPrice: string;
  stackCodes: string[];
  dominantLabel: string;
  inferiorLabel: string;
  isOpening: boolean;
  checkoutError: string | null;
  onUnlock: () => void;
  onSeeDetails: () => void;
  onViewSample: () => void;
  /** Email-a-link option for visitors who are not ready to buy on first read. */
  notReadyCapture?: React.ReactNode;
};

export const ReportUnlockCard: React.FC<ReportUnlockCardProps> = ({
  cardRef,
  tierName,
  offerPrice,
  regularPrice,
  stackCodes,
  dominantLabel,
  inferiorLabel,
  isOpening,
  checkoutError,
  onUnlock,
  onSeeDetails,
  onViewSample,
  notReadyCapture,
}) => {
  const sections = buildReportUnlockSections({ stackCodes, dominantLabel, inferiorLabel });
  return (
    <section
      id="report-unlock"
      ref={cardRef}
      aria-labelledby="report-unlock-title"
      className="report-unlock mt-6 scroll-mt-28 overflow-hidden rounded-2xl border border-jung-accent-muted bg-white"
    >
      <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6 sm:p-8">
          <p className="journey-eyebrow">
            Your {tierName} report{stackCodes.length > 0 ? ` · ${stackCodes.join(' · ')}` : ''}
          </p>
          <h2 id="report-unlock-title" className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
            You have the map.<br />Now work with it.
          </h2>
          <p className="mt-4 text-sm leading-7 text-jung-secondary">
            That reflection came from one of your answers. Your report covers ten sections written for your {dominantLabel}–{inferiorLabel} pattern: what happens under stress, how it shows up in relationships and work, and practices to try.
          </p>
          <ol className="report-unlock-sections mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2 sm:gap-y-3" aria-label="The ten sections in your report">
            {sections.map((section, index) => (
              <li key={section.title} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jung-accent-light text-jung-accent" aria-hidden="true">
                  <Lock className="h-3 w-3" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-6 text-jung-dark">
                    <span className="sr-only">Section {index + 1}: </span>
                    {section.title}
                  </span>
                  <span className="hidden text-xs leading-5 text-jung-secondary sm:block">{section.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex flex-col justify-center border-t border-jung-border bg-jung-accent-light/60 p-6 sm:p-8 lg:border-l lg:border-t-0">
          <p className="font-display text-4xl text-jung-dark">
            {offerPrice}
            <span className="ml-2 font-sans text-xs tracking-normal text-jung-muted">one time · CAD</span>
          </p>
          {regularPrice !== offerPrice && (
            <p className="mt-1 text-xs text-jung-muted">
              <span className="sr-only">Regular price </span>
              <s>{regularPrice}</s> regular price · current offer
            </p>
          )}
          <div data-report-buy className="mt-5">
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={onUnlock}
              disabled={isOpening}
              rightIcon={isOpening ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            >
              {isOpening ? 'Checking availability…' : `Get my full report — ${offerPrice}`}
            </Button>
          </div>
          {checkoutError && (
            <p className="mt-4 rounded-lg border border-error/20 bg-error/5 p-3 text-sm leading-6 text-error" role="alert">
              {checkoutError}{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">Contact support</a>
            </p>
          )}
          <ul className="mt-4 space-y-1.5 text-xs leading-5 text-jung-secondary">
            <li>Opens on this page after payment. No retake.</li>
            <li>One-time payment. No subscription.</li>
            <li>7-day refund policy.</li>
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-jung-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-jung-accent" aria-hidden="true" />
            Secure payment by Stripe
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
            <button type="button" onClick={onSeeDetails} className="inline-flex min-h-11 items-center text-sm font-semibold text-jung-accent underline underline-offset-4">
              See what my report adds
            </button>
            <button type="button" onClick={onViewSample} className="inline-flex min-h-11 items-center text-sm font-semibold text-jung-accent underline underline-offset-4">
              Read a sample
            </button>
          </div>
          {notReadyCapture && (
            <div className="mt-4 border-t border-jung-border pt-4" data-testid="unlock-not-ready">
              {notReadyCapture}
            </div>
          )}
        </div>
      </div>
      <p className="border-t border-jung-border px-6 py-3 text-xs leading-5 text-jung-muted sm:px-8">
        Your map, first read, and reflection stay free. The report is generated by AI from your assessment result, for educational self-reflection.
      </p>
    </section>
  );
};

type StickyReportBarProps = {
  visible: boolean;
  tierName: string;
  offerPrice: string;
  isOpening: boolean;
  onUnlock: () => void;
  onDismiss: () => void;
};

/** Small-screen bar that keeps the report one tap away while reading the free map. */
export const StickyReportBar: React.FC<StickyReportBarProps> = ({
  visible,
  tierName,
  offerPrice,
  isOpening,
  onUnlock,
  onDismiss,
}) => {
  if (!visible) return null;
  return (
    <aside
      aria-label="Get your report"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-jung-border bg-jung-surface/95 shadow-[0_-12px_32px_rgba(41,28,18,0.14)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto grid max-w-screen-sm grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-jung-dark">Your full {tierName} report</p>
          <p className="mt-0.5 text-xs leading-4 text-jung-muted">Ten sections · {offerPrice} once</p>
        </div>
        <Button
          variant="accent"
          size="sm"
          className="flex-none"
          onClick={onUnlock}
          disabled={isOpening}
          rightIcon={isOpening ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        >
          {isOpening ? 'Opening…' : 'Get it'}
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Hide report bar"
          className="flex h-11 w-9 flex-none items-center justify-center text-lg leading-none text-jung-muted"
        >
          ×
        </button>
      </div>
    </aside>
  );
};
