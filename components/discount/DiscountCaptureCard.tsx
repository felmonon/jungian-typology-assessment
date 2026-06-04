import React, { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Check, Mail, ShieldCheck, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { EMAIL_CAPTURE_OFFER } from '../../data/discount';
import { EMAIL_OFFER_PRICES } from '../../data/pricing';
import type { PaidTierId } from '../../data/pricing';
import { useAuth } from '../../hooks/use-auth';
import { AnalyticsEvents, trackEvent } from '../../lib/analytics';

type DiscountCaptureCardProps = {
  source: string;
  dominantLabel?: string;
  inferiorLabel?: string;
  compact?: boolean;
  showCheckoutButtons?: boolean;
  className?: string;
};

type SubmitState = 'idle' | 'submitting' | 'sent' | 'error';
type DeliveryTarget = 'account' | 'entered';

const STORAGE_KEY = 'typejung_discount_capture';

function clearStoredCapture() {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Non-critical cleanup.
  }
}

export const DiscountCaptureCard: React.FC<DiscountCaptureCardProps> = ({
  source,
  dominantLabel,
  inferiorLabel,
  compact = false,
  showCheckoutButtons = true,
  className = '',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<SubmitState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [deliveryTarget, setDeliveryTarget] = useState<DeliveryTarget>('entered');

  useEffect(() => {
    clearStoredCapture();

    const clearForm = () => {
      setEmail('');
      setWebsite('');
      setStatus('idle');
      setError(null);
      setDeliveryTarget('entered');
      clearStoredCapture();
    };

    window.addEventListener('typejung:auth-state-cleared', clearForm);
    return () => window.removeEventListener('typejung:auth-state-cleared', clearForm);
  }, []);

  useEffect(() => {
    if (status === 'idle' && !email && user?.email) setEmail(user.email);
  }, [email, status, user?.email]);

  const checkoutCopy = `${EMAIL_CAPTURE_OFFER.code}: ${EMAIL_CAPTURE_OFFER.percentOff}% off ${EMAIL_CAPTURE_OFFER.appliesTo}`;

  const goToCheckout = (tier: PaidTierId) => {
    AnalyticsEvents.ctaClicked(`open_${tier}_checkout_after_discount_email`, source, {
      buttonText: `Open ${tier} checkout`,
      destination: `/checkout/${tier}`,
    });
    navigate(`/checkout/${tier}`);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    setError(null);
    trackEvent('discount_lead_submit', { source });
    const normalizedEmail = email.trim().toLowerCase();
    const isAccountEmail = Boolean(user?.email && normalizedEmail === user.email.toLowerCase());
    if (!normalizedEmail) {
      setError('Enter a valid email address.');
      setStatus('error');
      return;
    }

    try {
      const response = await fetch('/api/auth/discount-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: normalizedEmail,
          website,
          source,
          dominantLabel,
          inferiorLabel,
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Could not send the code. Please try again.');
      }

      if (data?.sent !== true) {
        throw new Error(
          data?.reason === 'resend_not_configured'
            ? 'Email sending is not available right now. Please try again later.'
            : 'The code was not sent. Please try again.',
        );
      }

      clearStoredCapture();
      trackEvent('discount_lead_captured', {
        source,
        percent_off: EMAIL_CAPTURE_OFFER.percentOff,
      });
      setDeliveryTarget(isAccountEmail ? 'account' : 'entered');
      setStatus('sent');
    } catch (err: any) {
      setError(err.message || 'Could not send the code. Please try again.');
      setStatus('error');
      AnalyticsEvents.errorOccurred('discount_lead_capture_failed', err.message);
    }
  };

  return (
    <div className={`rounded-lg border border-jung-accent-muted bg-jung-accent-light/70 p-5 shadow-sm ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-jung-surface px-3 py-1.5 text-xs font-semibold text-jung-accent">
            <Tag className="h-3.5 w-3.5" />
            {checkoutCopy}
          </div>
          <h3 className={`${compact ? 'mt-3 text-xl' : 'mt-4 text-2xl'} font-semibold text-jung-dark`}>
            Get the private upgrade offer by email.
          </h3>
          <p className={`${compact ? 'mt-2 text-xs leading-5' : 'mt-3 text-sm leading-6'} text-jung-secondary`}>
            If your free map earned a deeper read, use the email code on Stripe before payment. With the code, Insight is {EMAIL_OFFER_PRICES.insight} and Mastery is {EMAIL_OFFER_PRICES.mastery}.
          </p>
        </div>
        <ShieldCheck className="hidden h-5 w-5 flex-none text-jung-accent sm:block" />
      </div>

      {status === 'sent' ? (
        <div className="mt-5 grid gap-4">
          <div className="rounded-lg border border-jung-border bg-jung-surface p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-jung-accent-light text-jung-accent">
                <Check className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-jung-dark">Check your inbox for the code.</p>
                <p className="mt-2 text-xs leading-5 text-jung-secondary">
                  {deliveryTarget === 'account'
                    ? 'We sent it to your account email. '
                    : 'We sent it to the email you entered. '}
                  Keep that inbox open when you continue to Stripe.
                </p>
              </div>
            </div>
          </div>
          {showCheckoutButtons && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="accent"
                size="sm"
                onClick={() => goToCheckout('insight')}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Open Insight checkout
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToCheckout('mastery')}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Open Mastery checkout
              </Button>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="mt-5 grid gap-3">
          <label className="sr-only" htmlFor={`${source}-discount-email`}>
            Email address
          </label>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-jung-muted" />
              <input
                id={`${source}-discount-email`}
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 w-full rounded-lg border border-jung-border bg-jung-surface pl-10 pr-3 text-sm text-jung-dark outline-none transition focus:border-jung-accent focus:ring-2 focus:ring-jung-accent/20"
              />
            </div>
            <Button type="submit" variant="accent" disabled={status === 'submitting'} isLoading={status === 'submitting'}>
              Email my offer
            </Button>
          </div>
          <input
            aria-hidden="true"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            className="hidden"
            name="website"
          />
          {error && <p className="text-xs leading-5 text-error">{error}</p>}
          <p className="text-xs leading-5 text-jung-muted">
            We will send {EMAIL_CAPTURE_OFFER.code} by email, plus result follow-up when it is relevant. No spam.
          </p>
        </form>
      )}
    </div>
  );
};
