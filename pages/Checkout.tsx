import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CreditCard, Loader2, Lock, Mail, RefreshCcw, ShieldCheck } from 'lucide-react';
import { OfferCodeCallout } from '../components/OfferCodeCallout';
import { TypeJungMark } from '../components/brand/TypeJungMark';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/use-auth';
import { useSEO } from '../hooks/useSEO';
import { AnalyticsEvents } from '../lib/analytics';
import { EMAIL_CAPTURE_OFFER } from '../data/discount';
import { isPaidTierId, PRICING } from '../data/pricing';
import type { PaidTierId } from '../data/pricing';

type CheckoutTierDetails = {
  packageName: string;
  headline: string;
  description: string;
  includes: string[];
  previewModules: Array<{ title: string; body: string }>;
  nextStep: string;
};

const CHECKOUT_DETAILS: Record<PaidTierId, CheckoutTierDetails> = {
  insight: {
    packageName: 'Insight Package',
    headline: 'Unlock the full ranking and analysis behind the result you already saw.',
    description:
      'Insight turns your free TypeJung map into a complete paid report with your 8-function personal ranking, confidence read, developmental edge, stress patterns, relationship triggers, and practical guidance.',
    includes: [
      'Full 8-function personal ranking',
      'Complete TypeJung depth report',
      'Developmental edge and inferior-function analysis',
      'Stress, relationship, and work-pattern interpretation',
      'Somatic grounding practices',
      'Instant access after Stripe returns you to TypeJung',
    ],
    previewModules: [
      { title: 'Personal ranking', body: 'All 8 functions ordered with score interpretation, confidence signal, and dominant-inferior axis.' },
      { title: 'Stress pattern map', body: 'Concrete ways the axis can show up in conflict, pressure, avoidance, and relationship triggers.' },
      { title: 'Practice guidance', body: 'Somatic and reflective practices matched to the pattern in your free map.' },
    ],
    nextStep: 'Stripe handles payment securely. After checkout, TypeJung verifies the session and opens your full report immediately. Sign-in is optional for saving access across devices.',
  },
  mastery: {
    packageName: 'Mastery Package',
    headline: 'Unlock the full ranking, deep analysis, and AI Type Coach.',
    description:
      'Mastery includes everything in Insight plus the AI Type Coach, tailored growth exercises, reassessment tracking, and ongoing support for working with your ranking over time.',
    includes: [
      'Everything in Insight',
      'AI Type Coach for follow-up questions',
      'Individuation roadmap and practice library',
      'Growth exercises tailored to your cognitive stack',
      'Instant report access after Stripe plus account restore when signed in',
    ],
    previewModules: [
      { title: 'Full ranking', body: 'The complete 8-function profile stays available as the base for every follow-up prompt.' },
      { title: 'AI Type Coach', body: 'Follow-up questions about the result, with coaching prompts grounded in your mapped stack.' },
      { title: 'Individuation roadmap', body: 'A practice sequence for using the report after the first read-through.' },
    ],
    nextStep: 'Stripe handles payment securely. After checkout, the full report opens immediately. Sign in with the purchase email when you want account-based coach access and cross-device restore.',
  },
};

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { tier } = useParams<{ tier: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const paidTier = isPaidTierId(tier) ? tier : null;
  const [isOpeningStripe, setIsOpeningStripe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkoutDetails = paidTier ? CHECKOUT_DETAILS[paidTier] : null;
  const tierPrice = paidTier ? PRICING[paidTier] : null;

  useSEO({
    title: checkoutDetails ? `Checkout - ${checkoutDetails.packageName} | TypeJung` : 'Checkout | TypeJung',
    description: 'Review your TypeJung order before continuing to secure Stripe payment.',
    noIndex: true,
  });

  useEffect(() => {
    if (!paidTier) {
      navigate('/pricing', { replace: true });
      return;
    }

    AnalyticsEvents.checkoutReviewViewed(paidTier, PRICING[paidTier].amount);
  }, [navigate, paidTier]);

  const orderRows = useMemo(() => {
    if (!paidTier || !tierPrice || !checkoutDetails) return [];

    return [
      ['Base price before code', tierPrice.price],
      [EMAIL_CAPTURE_OFFER.code, 'Optional on Stripe'],
      ['Final total', 'Confirmed on Stripe'],
    ];
  }, [checkoutDetails, paidTier, tierPrice]);

  const startStripeCheckout = useCallback(async () => {
    if (!paidTier || !tierPrice) return;

    setIsOpeningStripe(true);
    setError(null);
    AnalyticsEvents.purchaseStarted(paidTier, tierPrice.amount);
    AnalyticsEvents.ctaClicked('continue_to_secure_payment', 'checkout_review', {
      buttonText: `Continue to Stripe - ${tierPrice.price}`,
      destination: 'stripe_checkout',
    });

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tier: paidTier,
          source: 'custom_checkout_review',
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to start checkout');
      }

      if (!data.url) {
        throw new Error('Stripe did not return a checkout URL');
      }

      AnalyticsEvents.stripeRedirectStarted(paidTier, tierPrice.amount);
      window.location.href = data.url;
    } catch (err: any) {
      AnalyticsEvents.checkoutStartFailed(paidTier, err?.message);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsOpeningStripe(false);
    }
  }, [paidTier, tierPrice]);

  if (!paidTier || !checkoutDetails || !tierPrice) {
    return null;
  }

  return (
    <div className="min-h-screen bg-jung-base">
      <section className="section-rule py-8 sm:py-10">
        <div className="mx-auto w-full max-w-[1160px] px-4 sm:px-8">
          <Link
            to="/pricing"
            className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-jung-secondary transition-colors hover:text-jung-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to pricing
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1160px] px-4 py-10 sm:px-8 lg:py-14">
        <div className="grid w-full max-w-full min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start">
          <div className="mx-auto min-w-0 w-full max-w-[19rem] rounded-lg border border-jung-border bg-jung-surface p-5 shadow-sm sm:max-w-full sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-lg border border-jung-border bg-jung-base px-3 py-2 text-sm font-semibold text-jung-secondary">
              <TypeJungMark size="xs" />
              TypeJung secure checkout
            </div>

            <h1 className="mt-6 max-w-3xl break-words text-display text-3xl text-jung-dark sm:text-5xl">
              Review {checkoutDetails.packageName} before Stripe.
            </h1>
            <p className="mt-5 max-w-2xl break-words text-body-lg text-jung-secondary">
              {checkoutDetails.headline}
            </p>
            <p className="mt-4 max-w-2xl break-words text-sm leading-7 text-jung-secondary">
              {checkoutDetails.description}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: CreditCard, label: 'One-time CAD', body: 'No subscription or renewal.' },
                { icon: ShieldCheck, label: 'Secure Stripe step', body: 'You confirm payment on Stripe next.' },
                { icon: Lock, label: 'Instant unlock', body: 'The full report opens after payment verification.' },
                { icon: RefreshCcw, label: '30-day refund', body: 'Contact support if the paid report is not useful.' },
              ].map(({ icon: Icon, label, body }) => (
                <div key={label} className="rounded-lg border border-jung-border bg-jung-base p-4">
                  <Icon className="h-4 w-4 text-jung-accent" />
                  <p className="mt-3 text-sm font-semibold text-jung-dark">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-jung-muted">{body}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-lg border border-jung-border bg-jung-base p-5">
              <h2 className="text-lg font-semibold text-jung-dark">Included</h2>
              <ul className="mt-4 grid gap-3">
                {checkoutDetails.includes.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-jung-secondary">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-jung-accent" />
                    <span className="min-w-0 break-words">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 rounded-lg border border-jung-border bg-jung-base p-5">
              <h2 className="text-lg font-semibold text-jung-dark">Preview modules</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {checkoutDetails.previewModules.map((module) => (
                  <div key={module.title} className="rounded-lg border border-jung-border bg-jung-surface p-4">
                    <p className="text-sm font-semibold text-jung-dark">{module.title}</p>
                    <p className="mt-2 text-xs leading-5 text-jung-secondary">{module.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-jung-border bg-jung-surface p-5">
              <p className="text-sm font-semibold text-jung-dark">What happens next</p>
              <p className="mt-2 text-sm leading-6 text-jung-secondary">{checkoutDetails.nextStep}</p>
            </div>
          </div>

          <aside className="mx-auto min-w-0 w-full max-w-[19rem] rounded-lg border border-jung-border bg-jung-surface p-5 shadow-md sm:max-w-full sm:p-6 lg:sticky lg:top-28">
            <p className="text-label">Order summary</p>
            <div className="mt-5 flex items-start justify-between gap-4 border-b border-jung-border pb-5">
              <div>
                <h2 className="text-heading text-2xl text-jung-dark">{checkoutDetails.packageName}</h2>
                <p className="mt-2 text-sm leading-6 text-jung-secondary">
                  Full personal ranking and analysis
                </p>
              </div>
              <p className="text-lg font-semibold text-jung-dark">{tierPrice.price}</p>
            </div>

            <div className="mt-5 grid gap-3 border-b border-jung-border pb-5">
              {orderRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 text-sm">
                  <span className={label === 'Final total' ? 'font-semibold text-jung-dark' : 'text-jung-secondary'}>
                    {label}
                  </span>
                  <span className={label === 'Final total' ? 'font-semibold text-jung-dark' : 'text-jung-secondary'}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <OfferCodeCallout location="checkout_review" tier={paidTier} compact className="mt-5" />

            <div className="mt-4 rounded-lg border border-jung-accent-muted bg-jung-accent-light/70 p-4">
              <div className="flex gap-3">
                <RefreshCcw className="mt-0.5 h-4 w-4 flex-none text-jung-accent" />
                <p className="text-xs leading-5 text-jung-secondary">
                  If the paid report does not feel helpful, contact support within 30 days with your Stripe receipt.
                </p>
              </div>
            </div>

            {!authLoading && user?.email && (
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-jung-accent-light px-4 py-3 text-sm text-jung-accent">
                <Mail className="h-4 w-4 flex-none" />
                <span className="min-w-0 truncate">Logged in as {user.email}</span>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error" role="alert">
                {error}
              </div>
            )}

            <Button
              variant="accent"
              size="lg"
              className="mt-5 w-full"
              onClick={startStripeCheckout}
              disabled={isOpeningStripe}
              rightIcon={!isOpeningStripe ? <ArrowRight className="h-5 w-5" /> : undefined}
            >
              {isOpeningStripe ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Opening Stripe
                </>
              ) : (
                `Continue to Stripe - ${tierPrice.price}`
              )}
            </Button>

            <p className="mt-4 text-xs leading-5 text-jung-muted">
              Stripe may offer Link saved checkout. Choose Pay without Link on Stripe if you prefer to enter card details manually.
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
};
