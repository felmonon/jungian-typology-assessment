import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CreditCard, Loader2, Lock, Mail, RefreshCcw, ShieldCheck, Tag } from 'lucide-react';
import { TypeJungMark } from '../components/brand/TypeJungMark';
import { DiscountCaptureCard } from '../components/discount/DiscountCaptureCard';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/use-auth';
import { useSEO } from '../hooks/useSEO';
import { AnalyticsEvents, trackEvent } from '../lib/analytics';
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
    headline: 'Go deeper on the result you already saw.',
    description:
      'Insight turns your free TypeJung map into a deeper report with your developmental edge, stress patterns, relationship triggers, and practical somatic guidance.',
    includes: [
      'Complete TypeJung depth report',
      'Developmental edge and inferior-function analysis',
      'Stress, relationship, and work-pattern interpretation',
      'Somatic grounding practices',
      'Lifetime access to this unlocked result',
    ],
    previewModules: [
      { title: 'Developmental edge', body: 'A deeper read on what your inferior function may be asking you to build, tolerate, or integrate.' },
      { title: 'Stress pattern map', body: 'Concrete ways the axis can show up in conflict, pressure, avoidance, and relationship triggers.' },
      { title: 'Practice guidance', body: 'Somatic and reflective practices matched to the pattern in your free map.' },
    ],
    nextStep: 'Stripe handles payment securely. After checkout, return to TypeJung and sign in with the purchase email if prompted so the unlocked report can be attached to your account.',
  },
  mastery: {
    packageName: 'Mastery Package',
    headline: 'Turn your result into an ongoing practice plan.',
    description:
      'Mastery includes everything in Insight plus the AI Type Coach, tailored growth exercises, reassessment tracking, and ongoing support for working with your cognitive stack.',
    includes: [
      'Everything in Insight',
      'AI Type Coach for follow-up questions',
      'Individuation roadmap and practice library',
      'Growth exercises tailored to your cognitive stack',
      'Priority support and reassessment tracking',
    ],
    previewModules: [
      { title: 'AI Type Coach', body: 'Follow-up questions about the result, with coaching prompts grounded in your mapped stack.' },
      { title: 'Individuation roadmap', body: 'A practice sequence for using the report after the first read-through.' },
      { title: 'Tracking over time', body: 'Reassessment context so later maps can be compared against the current one.' },
    ],
    nextStep: 'Stripe handles payment securely. After checkout, return to TypeJung and sign in with the purchase email if prompted so Mastery features can be enabled on your account.',
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

    trackEvent('checkout_review_viewed', {
      tier: paidTier,
      value: PRICING[paidTier].amount,
      currency: PRICING[paidTier].currency,
    });
  }, [navigate, paidTier]);

  const orderRows = useMemo(() => {
    if (!tierPrice || !checkoutDetails) return [];

    return [
      ['Subtotal', tierPrice.price],
      ['Email offer', 'Enter on Stripe'],
      ['Total due today', tierPrice.price],
    ];
  }, [checkoutDetails, tierPrice]);

  const startStripeCheckout = useCallback(async () => {
    if (!paidTier || !tierPrice) return;

    setIsOpeningStripe(true);
    setError(null);
    AnalyticsEvents.purchaseStarted(paidTier, tierPrice.amount);
    AnalyticsEvents.ctaClicked('continue_to_secure_payment', 'checkout_review', {
      buttonText: `Pay ${tierPrice.price}`,
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

      window.location.href = data.url;
    } catch (err: any) {
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
                { icon: Lock, label: 'Private by default', body: 'Your result stays tied to your TypeJung access.' },
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
                  One-time TypeJung upgrade
                </p>
              </div>
              <p className="text-lg font-semibold text-jung-dark">{tierPrice.price}</p>
            </div>

            <div className="mt-5 grid gap-3 border-b border-jung-border pb-5">
              {orderRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 text-sm">
                  <span className={label === 'Total due today' ? 'font-semibold text-jung-dark' : 'text-jung-secondary'}>
                    {label}
                  </span>
                  <span className={label === 'Total due today' ? 'font-semibold text-jung-dark' : 'text-jung-secondary'}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <DiscountCaptureCard source={`checkout_${paidTier}`} compact showCheckoutButtons={false} className="mt-5" />

            <div className="mt-5 rounded-lg border border-jung-border bg-jung-base p-4">
              <div className="flex gap-3">
                <Tag className="mt-0.5 h-4 w-4 flex-none text-jung-accent" />
                <p className="text-xs leading-5 text-jung-secondary">
                  Promotion codes are entered on the secure Stripe step before payment is confirmed.
                </p>
              </div>
            </div>

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
