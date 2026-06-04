import React, { useState } from 'react';
import { Check, Copy, Tag } from 'lucide-react';
import { EMAIL_CAPTURE_OFFER } from '../data/discount';
import { EMAIL_OFFER_PRICES } from '../data/pricing';
import type { PaidTierId } from '../data/pricing';
import { AnalyticsEvents } from '../lib/analytics';

type OfferCodeCalloutProps = {
  location: string;
  tier?: PaidTierId;
  compact?: boolean;
  className?: string;
};

export const OfferCodeCallout: React.FC<OfferCodeCalloutProps> = ({
  location,
  tier,
  compact = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL_CAPTURE_OFFER.code);
      setCopied(true);
      AnalyticsEvents.offerCodeCopied(EMAIL_CAPTURE_OFFER.code, location, tier);
      window.setTimeout(() => setCopied(false), 2200);
    } catch (error) {
      AnalyticsEvents.errorOccurred('offer_code_copy_failed', error instanceof Error ? error.message : undefined);
    }
  };

  return (
    <div className={`rounded-lg border border-jung-accent-muted bg-jung-accent-light/70 ${compact ? 'p-4' : 'p-5'} ${className}`}>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-lg bg-jung-surface px-3 py-1.5 text-xs font-semibold text-jung-accent">
            <Tag className="h-3.5 w-3.5" />
            Optional Stripe code
          </div>
          <p className={`${compact ? 'mt-3 text-sm' : 'mt-4 text-base'} font-semibold text-jung-dark`}>
            Use {EMAIL_CAPTURE_OFFER.code} on Stripe for {EMAIL_CAPTURE_OFFER.percentOff}% off.
          </p>
          <p className="mt-2 text-xs leading-5 text-jung-secondary">
            Final total is confirmed on Stripe before payment. With the code, Insight is {EMAIL_OFFER_PRICES.insight} and Mastery is {EMAIL_OFFER_PRICES.mastery}.
          </p>
        </div>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-jung-border bg-jung-surface px-4 text-sm font-semibold text-jung-dark transition hover:border-jung-accent-muted hover:bg-jung-base focus:outline-none focus-visible:ring-2 focus-visible:ring-jung-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jung-base"
        >
          {copied ? <Check className="h-4 w-4 text-jung-accent" /> : <Copy className="h-4 w-4 text-jung-accent" />}
          {copied ? 'Copied' : 'Copy code'}
        </button>
      </div>
    </div>
  );
};
