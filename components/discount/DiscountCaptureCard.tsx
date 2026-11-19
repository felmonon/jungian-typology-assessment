import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { isPaidTierId, type PaidTierId } from '../../data/pricing';
import { useAuth } from '../../hooks/use-auth';
import { AnalyticsEvents, trackEvent } from '../../lib/analytics';
import { pathWithSource, readAcquisitionSource } from '../../lib/acquisition-source';
import { readSavedResultCode } from '../../lib/result-link';

// Email capture on the free result. It posts to the existing discount-lead
// flow, which emails a link back to the result (with the dominant-inferior
// labels) and then a short follow-up sequence. That backend cannot yet send
// the map itself, so the copy only promises the link. Checkout no longer
// needs a code, so the card no longer offers one.

type DiscountCaptureCardProps = {
  source: string;
  dominantLabel?: string;
  inferiorLabel?: string;
  compact?: boolean;
  showCheckoutButtons?: boolean;
  onCheckout?: (tier: PaidTierId) => void;
  checkoutButtonLabel?: string;
  minimal?: boolean;
  minimalTitle?: string;
  minimalDescription?: string;
  minimalSubmitLabel?: string;
  minimalFootnote?: string;
  minimalSentMessage?: string;
  minimalTone?: 'light' | 'dark';
  preferredTier?: PaidTierId;
  className?: string;
};

type SubmitState = 'idle' | 'submitting' | 'sent' | 'error';

const STORAGE_KEY = 'typejung_discount_capture';

// Express consent for the link email and the follow-ups the lead flow sends.
// Unticked by default and stated on its own line.
export const RESULT_LINK_CONSENT_LABEL =
  'Email me this link and up to four follow-ups about the optional report. Unsubscribe anytime.';
export const RESULT_LINK_CONSENT_VERSION = 'result_link_and_followups_v1';

type CapturedLead = {
  email: string;
  sent: boolean;
  source?: string;
  tierIntent?: PaidTierId;
};

function readCapturedLead(): CapturedLead {
  if (typeof window === 'undefined') return { email: '', sent: false };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const tierIntent = isPaidTierId(saved.tierIntent) ? saved.tierIntent : undefined;
    const email = typeof saved.email === 'string' ? saved.email : '';
    // Older saves recorded the emailed code; newer ones record linkSent. A bare
    // email (saved by checkout) only prefills the field.
    const sent = Boolean(email) && (saved.linkSent === true || typeof saved.discountCode === 'string');
    return {
      email,
      sent,
      source: typeof saved.source === 'string' ? saved.source : undefined,
      tierIntent,
    };
  } catch {
    return { email: '', sent: false };
  }
}

export const DiscountCaptureCard: React.FC<DiscountCaptureCardProps> = ({
  source,
  dominantLabel,
  inferiorLabel,
  compact = false,
  showCheckoutButtons = true,
  onCheckout,
  checkoutButtonLabel,
  minimal = false,
  minimalTitle,
  minimalDescription,
  minimalSubmitLabel,
  minimalFootnote,
  minimalSentMessage,
  minimalTone = 'light',
  preferredTier,
  className = '',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const savedLead = useMemo(readCapturedLead, []);
  const [email, setEmail] = useState(savedLead.email || user?.email || '');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<SubmitState>(savedLead.sent ? 'sent' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const viewTrackedRef = useRef(false);

  useEffect(() => {
    if (!email && user?.email) setEmail(user.email);
  }, [email, user?.email]);

  useEffect(() => {
    if (viewTrackedRef.current) return;
    viewTrackedRef.current = true;

    trackEvent('discount_capture_card_viewed', {
      source,
      tier: preferredTier || 'unknown',
      minimal,
      show_checkout_buttons: showCheckoutButtons,
      has_email_prefill: Boolean(email),
      has_axis_context: Boolean(dominantLabel && inferiorLabel),
      has_saved_discount: savedLead.sent,
    });
  }, [dominantLabel, email, inferiorLabel, minimal, preferredTier, savedLead.sent, showCheckoutButtons, source]);

  const preferredTierName = preferredTier ? (preferredTier === 'insight' ? 'Insight' : 'Mastery') : null;
  const titleCopy = minimalTitle || 'Not ready to decide?';
  const descriptionCopy = minimalDescription || `Email yourself a link back to your result and come back when you want ${preferredTierName ? `the ${preferredTierName} report` : 'the deeper report'}.`;
  const submitLabelCopy = minimalSubmitLabel || 'Email my link';
  const footnoteCopy = minimalFootnote || 'Your complete map stays in this browser unless you save it to an account.';
  const sentMessageCopy = minimalSentMessage || 'Your link is in your inbox. Your complete map is still here on this device.';
  const hasAxisContext = Boolean(dominantLabel && inferiorLabel);
  const isDark = minimal && minimalTone === 'dark';
  const primaryText = isDark ? 'text-white' : 'text-jung-dark';
  const secondaryText = isDark ? 'text-white/70' : 'text-jung-secondary';
  const mutedText = isDark ? 'text-white/50' : 'text-jung-muted';
  const sentStyles = isDark
    ? 'border border-white/10 bg-white/5 text-white/70'
    : 'bg-jung-surface text-jung-secondary';
  const inputStyles = isDark
    ? 'border-white/15 bg-white/5 text-white placeholder:text-white/35 focus:border-jung-accent focus:ring-jung-accent/30'
    : 'border-jung-border bg-jung-surface text-jung-dark focus:border-jung-accent focus:ring-jung-accent/20';
  const buttonClass = isDark ? 'border-white/15 text-white hover:border-white/30 hover:bg-white/10' : '';
  const inputId = `${source}-discount-email`;
  const consentId = `${source}-email-consent`;
  const errorId = `${source}-email-error`;

  const goToCheckout = (tier: PaidTierId) => {
    const destination = onCheckout
      ? 'secure_stripe_checkout'
      : pathWithSource(`/checkout/${tier}`, `${source}_${tier}_checkout`);
    AnalyticsEvents.paidOfferClicked(`${source}_discount_card`, tier, destination);
    AnalyticsEvents.ctaClicked(`open_${tier}_checkout_after_discount_email`, source, {
      buttonText: checkoutButtonLabel || `Open ${tier} checkout`,
      destination,
    });

    if (onCheckout) {
      onCheckout(tier);
      return;
    }

    navigate(destination);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!consent) {
      setError('Tick the box so we can email you the link.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setError(null);
    trackEvent('discount_lead_submit', {
      source,
      tier: preferredTier || 'unknown',
      has_axis_context: hasAxisContext,
    });

    try {
      const acquisition = readAcquisitionSource();
      const response = await fetch('/api/auth/discount-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          website,
          source,
          dominantLabel,
          inferiorLabel,
          tierIntent: preferredTier,
          resultCode: preferredTier ? readSavedResultCode() || undefined : undefined,
          emailConsent: true,
          consentVersion: RESULT_LINK_CONSENT_VERSION,
          utmSource: acquisition?.utmSource,
          utmCampaign: acquisition?.utmCampaign,
          parentSource: acquisition?.parentSource || acquisition?.source,
          sourceChain: acquisition?.sourceChain,
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Could not send the link. Please try again.');
      }

      trackEvent('discount_lead_request_completed', {
        source,
        tier: preferredTier || 'unknown',
        captured: Boolean(data?.captured),
        capture_reason: typeof data?.captureReason === 'string' ? data.captureReason : 'unknown',
        email_sent: Boolean(data?.sent),
        skip_reason: typeof data?.reason === 'string' ? data.reason : 'none',
        has_axis_context: hasAxisContext,
      });

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          email,
          linkSent: true,
          capturedAt: new Date().toISOString(),
          source,
          ...(preferredTier ? { tierIntent: preferredTier } : {}),
        }));
      } catch {
        // Non-critical persistence.
      }

      if (data?.captured === true) {
        trackEvent('discount_lead_captured', {
          source,
          tier: preferredTier || 'unknown',
          has_axis_context: hasAxisContext,
        });
      }
      if (data?.sent === true) {
        trackEvent('discount_lead_email_sent', {
          source,
          tier: preferredTier || 'unknown',
          has_axis_context: hasAxisContext,
        });
      }
      setStatus('sent');
    } catch (err: any) {
      setError(err.message || 'Could not send the link. Please try again.');
      setStatus('error');
      AnalyticsEvents.errorOccurred('discount_lead_capture_failed', err.message);
    }
  };

  const form = (
    <form onSubmit={submit} noValidate className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
      <label className="sr-only" htmlFor={inputId}>
        Email address
      </label>
      <input
        id={inputId}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`h-12 w-full rounded-lg border px-3 text-base outline-none transition focus:ring-2 sm:text-sm ${inputStyles}`}
      />
      <Button
        type="submit"
        variant={minimal ? 'outline' : 'accent'}
        size="sm"
        className={buttonClass}
        disabled={status === 'submitting'}
        isLoading={status === 'submitting'}
      >
        {submitLabelCopy}
      </Button>
      <input
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        className="hidden"
        name="website"
      />
      <label
        htmlFor={consentId}
        className={`flex min-h-11 cursor-pointer items-start gap-3 text-xs leading-5 sm:col-span-2 ${secondaryText}`}
      >
        <input
          id={consentId}
          type="checkbox"
          checked={consent}
          onChange={(event) => {
            setConsent(event.target.checked);
            if (event.target.checked) setError(null);
          }}
          className="mt-0.5 h-5 w-5 shrink-0 accent-jung-accent"
        />
        <span>{RESULT_LINK_CONSENT_LABEL}</span>
      </label>
      {error && (
        <p id={errorId} role="alert" className="text-xs leading-5 text-error sm:col-span-2">
          {error}
        </p>
      )}
      <p className={`text-xs leading-5 sm:col-span-2 ${mutedText}`}>
        {footnoteCopy}
      </p>
    </form>
  );

  const sentNotice = (
    <div className={`mt-3 grid gap-3 rounded-lg px-3 py-3 text-xs leading-5 ${sentStyles}`}>
      <div className="flex items-start gap-2">
        <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-jung-accent" />
        <span>{sentMessageCopy}</span>
      </div>
      {showCheckoutButtons && preferredTier && (
        <Button
          type="button"
          variant="accent"
          size="sm"
          className="w-full"
          onClick={() => goToCheckout(preferredTier)}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          {checkoutButtonLabel || `Continue to ${preferredTierName}`}
        </Button>
      )}
    </div>
  );

  const body = (
    <>
      <div className="flex items-start gap-3">
        <Mail className="mt-0.5 h-4 w-4 flex-none text-jung-accent" />
        <div className="min-w-0">
          <p className={`${minimal ? 'text-sm' : compact ? 'text-lg' : 'text-xl'} font-semibold ${primaryText}`}>{titleCopy}</p>
          <p className={`mt-1 text-xs leading-5 ${secondaryText}`}>
            {descriptionCopy}
          </p>
        </div>
      </div>
      {status === 'sent' ? sentNotice : form}
    </>
  );

  if (minimal) {
    return <div className={className}>{body}</div>;
  }

  return (
    <div className={`rounded-lg border border-jung-accent-muted bg-jung-accent-light/70 p-5 shadow-sm ${className}`}>
      {body}
    </div>
  );
};
