import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Copy, CreditCard, FileText, Loader2, Lock, Mail, RefreshCcw, ShieldCheck, Tag } from 'lucide-react';
import { TypeJungMark } from '../components/brand/TypeJungMark';
import { DiscountCaptureCard } from '../components/discount/DiscountCaptureCard';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/use-auth';
import { useSEO } from '../hooks/useSEO';
import { AnalyticsEvents, getFunnelAnonymousId, trackEvent } from '../lib/analytics';
import { captureAcquisitionSourceFromLocation, pathWithSource, sourceForCheckout } from '../lib/acquisition-source';
import { ATTITUDE_LABELS, FUNCTION_LABELS } from '../data/depthAssessment';
import { isPaidTierId, PRICING } from '../data/pricing';
import type { PaidTierId } from '../data/pricing';
import { discountedAmount, discountedPriceLabel, discountSavingsAmount, EMAIL_CAPTURE_OFFER, formatCadAmount } from '../data/discount';
import { SUPPORT_EMAIL } from '../data/support';
import { writePendingCheckout } from '../lib/pending-checkout';
import { writeUpgradeIntent } from '../lib/upgrade-intent';
import { STORAGE_KEYS } from '../lib/validation';
import { DepthAssessmentResult, isDepthAssessmentResult } from '../utils/depthScoring';

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
      'Insight turns your free TypeJung map into a deeper report with your developmental edge, stress-pattern reflection, relationship-pattern reflection, and practical prompts.',
    includes: [
      'Complete TypeJung depth report',
      'Developmental edge and inferior-function analysis',
      'Stress, relationship, and work-pattern interpretation',
      'Practical reflection prompts',
      'Unlocked result access in this browser, with account restore after sign-in',
    ],
    previewModules: [
      { title: 'Developmental edge', body: 'A deeper read on what your inferior function may be asking you to build, tolerate, or integrate.' },
      { title: 'Stress-pattern map', body: 'Concrete ways the axis can show up in conflict, pressure, avoidance, and relationship patterns.' },
      { title: 'Practice prompts', body: 'Reflection exercises matched to the pattern in your free map.' },
    ],
    nextStep: 'Stripe handles payment securely. After checkout, return to TypeJung and sign in with the purchase email if prompted so the unlocked report can be attached to your account.',
  },
  mastery: {
    packageName: 'Mastery Package',
    headline: 'Turn your result into an ongoing practice plan.',
    description:
      'Mastery includes everything in Insight plus the AI Type Guide, tailored growth exercises, and a practice roadmap for working with your cognitive stack.',
    includes: [
      'Everything in Insight',
      'AI Type Guide for follow-up reflection questions',
      'Individuation roadmap and practice plan',
      'Growth exercises tailored to your cognitive stack',
      'Account-based guide access after sign-in',
    ],
    previewModules: [
      { title: 'AI Type Guide', body: 'Follow-up questions about the result, with reflection prompts grounded in your mapped stack.' },
      { title: 'Individuation roadmap', body: 'A practice sequence for using the report after the first read-through.' },
      { title: 'Tracking over time', body: 'Reassessment context so later maps can be compared against the current one.' },
    ],
    nextStep: 'Stripe handles payment securely. After checkout, return to TypeJung and sign in with the purchase email if prompted so Mastery features can be enabled on your account.',
  },
};

const DISCOUNT_CAPTURE_STORAGE_KEY = 'typejung_discount_capture';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const APPROX_USD_PRICE: Record<PaidTierId, string> = {
  insight: 'US$7',
  mastery: 'US$21',
};

const readCapturedDiscountEmail = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const saved = JSON.parse(localStorage.getItem(DISCOUNT_CAPTURE_STORAGE_KEY) || '{}');
    const email = typeof saved.email === 'string' ? saved.email.trim().toLowerCase() : '';
    return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : null;
  } catch {
    return null;
  }
};

const readSavedDepthResult = (): DepthAssessmentResult | null => {
  if (typeof window === 'undefined') return null;

  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || 'null');
    return isDepthAssessmentResult(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tier } = useParams<{ tier: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const paidTier = isPaidTierId(tier) ? tier : null;
  const [isOpeningStripe, setIsOpeningStripe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountCopyStatus, setDiscountCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [capturedEmail] = useState(readCapturedDiscountEmail);
  const [checkoutRecoveryEmail, setCheckoutRecoveryEmail] = useState(() => capturedEmail || '');
  const [checkoutRecoveryOptIn, setCheckoutRecoveryOptIn] = useState(true);
  const [showRecoveryEmailControls, setShowRecoveryEmailControls] = useState(() => !capturedEmail);
  const checkoutAxisTrackedRef = useRef<string | null>(null);
  const checkoutOpeningRef = useRef(false);
  const checkoutEmailInputRef = useRef<HTMLInputElement>(null);
  const [recoveryEmailError, setRecoveryEmailError] = useState<string | null>(null);
  const [savedDepthResult] = useState(readSavedDepthResult);
  const hasLocalResults = Boolean(savedDepthResult);
  const returnedFromStripe = new URLSearchParams(location.search).get('checkout') === 'cancelled';
  const acquisition = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const path = `${location.pathname}${location.search}${location.hash}`;
    return captureAcquisitionSourceFromLocation(location.search, path, document.referrer);
  }, [location.hash, location.pathname, location.search]);
  const acquisitionSource = acquisition?.source || null;
  const checkoutAttribution = useMemo(() => acquisition ? {
    source: acquisition.source,
    ref: acquisition.ref,
    utmCampaign: acquisition.utmCampaign,
    utmSource: acquisition.utmSource,
    sharedResult: acquisition.sharedResult,
    parentSource: acquisition.parentSource,
    sourceChain: acquisition.sourceChain,
  } : undefined, [
    acquisition?.source,
    acquisition?.ref,
    acquisition?.utmCampaign,
    acquisition?.utmSource,
    acquisition?.sharedResult,
    acquisition?.parentSource,
    acquisition?.sourceChain,
  ]);

  const checkoutDetails = paidTier ? CHECKOUT_DETAILS[paidTier] : null;
  const tierPrice = paidTier ? PRICING[paidTier] : null;
  const savedResultAxis = useMemo(() => {
    if (!savedDepthResult) return null;

    const inferiorPosition = savedDepthResult.hierarchy.find((item) => item.position === 'inferior');
    return {
      dominantLabel: `${ATTITUDE_LABELS[savedDepthResult.attitude.dominant]} ${FUNCTION_LABELS[savedDepthResult.dominant]}`,
      inferiorLabel: `${ATTITUDE_LABELS[inferiorPosition?.attitude ?? 'extraverted']} ${FUNCTION_LABELS[savedDepthResult.inferior]}`,
      dominantChannel: savedDepthResult.dominant,
      inferiorChannel: savedDepthResult.inferior,
      reliability: savedDepthResult.reliability.label,
    };
  }, [savedDepthResult]);

  useEffect(() => {
    if (!checkoutRecoveryEmail && user?.email) {
      setCheckoutRecoveryEmail(user.email);
      setShowRecoveryEmailControls(false);
    }
  }, [checkoutRecoveryEmail, user?.email]);

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
      returned_from_stripe: returnedFromStripe,
      acquisition_source: acquisitionSource || 'unknown',
      acquisition_ref: acquisition?.ref || 'unknown',
      utm_campaign: acquisition?.utmCampaign || 'unknown',
      utm_source: acquisition?.utmSource || 'unknown',
      shared_result: acquisition?.sharedResult || 'none',
      parent_source: acquisition?.parentSource || 'none',
      source_chain: acquisition?.sourceChain || 'none',
      has_local_results: hasLocalResults,
    });
  }, [acquisition?.parentSource, acquisition?.ref, acquisition?.sharedResult, acquisition?.sourceChain, acquisition?.utmCampaign, acquisition?.utmSource, acquisitionSource, hasLocalResults, navigate, paidTier, returnedFromStripe]);

  useEffect(() => {
    if (!paidTier || !returnedFromStripe) return;

    trackEvent('stripe_checkout_returned_without_payment', {
      tier: paidTier,
      source: 'stripe_cancel_url',
    });
  }, [paidTier, returnedFromStripe]);

  useEffect(() => {
    if (!paidTier || !savedDepthResult || !savedResultAxis) return;

    const trackedKey = `${paidTier}_${savedDepthResult.completedAt}`;
    if (checkoutAxisTrackedRef.current === trackedKey) return;
    checkoutAxisTrackedRef.current = trackedKey;

    trackEvent('checkout_result_axis_context_viewed', {
      tier: paidTier,
      dominant_channel: savedResultAxis.dominantChannel,
      inferior_channel: savedResultAxis.inferiorChannel,
      reliability: savedResultAxis.reliability,
      acquisition_source: acquisitionSource || 'unknown',
      utm_campaign: acquisition?.utmCampaign || 'unknown',
      utm_source: acquisition?.utmSource || 'unknown',
    });
  }, [acquisition?.utmCampaign, acquisition?.utmSource, acquisitionSource, paidTier, savedDepthResult, savedResultAxis]);

  const orderRows = useMemo(() => {
    if (!tierPrice || !checkoutDetails) return [];

    return [
      ['Subtotal', tierPrice.price],
      [`${EMAIL_CAPTURE_OFFER.code} (${EMAIL_CAPTURE_OFFER.percentOff}% off)`, `-${formatCadAmount(discountSavingsAmount(tierPrice.amount))}`],
      ['After code', formatCadAmount(discountedAmount(tierPrice.amount))],
    ];
  }, [checkoutDetails, tierPrice]);

  const finalPriceLabel = tierPrice ? discountedPriceLabel(tierPrice.amount) : '';
  const paymentButtonText = finalPriceLabel ? `Pay ${finalPriceLabel} on Stripe` : 'Continue to Stripe';
  const mobilePaymentButtonText = isOpeningStripe ? 'Opening' : 'Pay';
  const recoveryEmailPreview = checkoutRecoveryEmail.trim() || user?.email || capturedEmail || '';
  const priceContext = paidTier && tierPrice
    ? `${tierPrice.price} ≈ ${APPROX_USD_PRICE[paidTier]} list price. ${EMAIL_CAPTURE_OFFER.code} currently reduces today's Stripe total to ${finalPriceLabel}.`
    : '';

  const copyDiscountCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL_CAPTURE_OFFER.code);
      setDiscountCopyStatus('copied');
      trackEvent('checkout_discount_code_copied', {
        tier: paidTier || 'unknown',
        percent_off: EMAIL_CAPTURE_OFFER.percentOff,
      });
      window.setTimeout(() => setDiscountCopyStatus('idle'), 1800);
    } catch {
      setDiscountCopyStatus('idle');
    }
  }, [paidTier]);

  const rememberCheckoutRecoveryEmail = useCallback((email: string) => {
    if (!paidTier) return;

    try {
      localStorage.setItem(DISCOUNT_CAPTURE_STORAGE_KEY, JSON.stringify({
        email,
        discountCode: EMAIL_CAPTURE_OFFER.code,
        capturedAt: new Date().toISOString(),
        source: 'checkout_recovery_prestripe',
        tierIntent: paidTier,
      }));
    } catch {
      // Non-critical persistence.
    }
  }, [paidTier]);

  const sendCheckoutRecoveryLead = useCallback(async (email: string) => {
    if (!paidTier) return;

    try {
      const response = await fetch('/api/auth/discount-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          website: '',
          source: 'checkout_recovery_prestripe',
          tierIntent: paidTier,
          dominantLabel: savedResultAxis?.dominantLabel,
          inferiorLabel: savedResultAxis?.inferiorLabel,
          utmSource: checkoutAttribution?.utmSource,
          utmCampaign: checkoutAttribution?.utmCampaign,
          parentSource: checkoutAttribution?.parentSource || checkoutAttribution?.source,
          sourceChain: checkoutAttribution?.sourceChain,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        trackEvent('checkout_recovery_lead_failed', {
          tier: paidTier,
          status: response.status,
          reason: typeof data?.error === 'string' ? data.error : 'request_failed',
        });
        return;
      }

      trackEvent('checkout_recovery_lead_captured', {
        tier: paidTier,
        captured: Boolean(data?.captured),
        email_sent: Boolean(data?.sent),
        capture_reason: typeof data?.captureReason === 'string' ? data.captureReason : 'unknown',
        skip_reason: typeof data?.reason === 'string' ? data.reason : 'none',
      });
    } catch (error) {
      trackEvent('checkout_recovery_lead_failed', {
        tier: paidTier,
        status: 'network',
        reason: error instanceof Error ? error.message.substring(0, 120) : 'network_error',
      });
      // Checkout recovery capture is best-effort; Stripe should still open.
    }
  }, [
    checkoutAttribution?.parentSource,
    checkoutAttribution?.source,
    checkoutAttribution?.sourceChain,
    checkoutAttribution?.utmCampaign,
    checkoutAttribution?.utmSource,
    paidTier,
    savedResultAxis?.dominantLabel,
    savedResultAxis?.inferiorLabel,
  ]);

  const viewSampleReport = useCallback(() => {
    const destination = pathWithSource('/sample-report', 'checkout_sample_report');
    AnalyticsEvents.ctaClicked('view_sample_report', 'checkout_review', {
      buttonText: 'View sample report',
      destination,
    });
    navigate(destination);
  }, [navigate]);

  const startAssessmentFirst = useCallback(() => {
    if (!paidTier) return;

    const destination = pathWithSource('/assessment', 'checkout_without_result', { tier: paidTier });
    writeUpgradeIntent(paidTier, 'checkout_without_result');
    AnalyticsEvents.ctaClicked('start_assessment_before_checkout', 'checkout_without_result', {
      buttonText: 'Start free assessment',
      destination,
      tier: paidTier,
    });
    trackEvent('checkout_without_result_assessment_started', {
      tier: paidTier,
      acquisition_source: checkoutAttribution?.source || 'unknown',
      utm_campaign: checkoutAttribution?.utmCampaign || 'unknown',
      utm_source: checkoutAttribution?.utmSource || 'unknown',
      parent_source: checkoutAttribution?.parentSource || 'none',
      source_chain: checkoutAttribution?.sourceChain || 'none',
    });
    navigate(destination);
  }, [checkoutAttribution?.parentSource, checkoutAttribution?.source, checkoutAttribution?.sourceChain, checkoutAttribution?.utmCampaign, checkoutAttribution?.utmSource, navigate, paidTier]);

  const startStripeCheckout = useCallback(async () => {
    if (!paidTier || !tierPrice) return;
    if (checkoutOpeningRef.current) return;

    const checkoutSource = sourceForCheckout();
    const typedRecoveryEmail = checkoutRecoveryEmail.trim().toLowerCase();
    const validTypedRecoveryEmail = EMAIL_PATTERN.test(typedRecoveryEmail) ? typedRecoveryEmail : '';
    const checkoutCustomerEmail = validTypedRecoveryEmail || readCapturedDiscountEmail() || capturedEmail || user?.email || undefined;

    if (!checkoutCustomerEmail) {
      setShowRecoveryEmailControls(true);
      setRecoveryEmailError('Enter an email before Stripe so the receipt and recovery link have somewhere to go.');
      trackEvent('checkout_recovery_email_required', {
        tier: paidTier,
        source: checkoutSource,
        acquisition_source: checkoutAttribution?.source || 'unknown',
        utm_campaign: checkoutAttribution?.utmCampaign || 'unknown',
        utm_source: checkoutAttribution?.utmSource || 'unknown',
        has_result_axis: Boolean(savedResultAxis),
      });

      window.requestAnimationFrame(() => {
        checkoutEmailInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        checkoutEmailInputRef.current?.focus();
      });
      return;
    }

    try {
      checkoutOpeningRef.current = true;
      setIsOpeningStripe(true);
      setError(null);
      setRecoveryEmailError(null);
      AnalyticsEvents.purchaseStarted(paidTier, tierPrice.amount);
      AnalyticsEvents.ctaClicked('continue_to_secure_payment', 'checkout_review', {
        buttonText: `Pay ${finalPriceLabel || tierPrice.price}`,
        destination: 'stripe_checkout',
      });

      const recoveryEmail = checkoutCustomerEmail;
      const shouldUseSiteRecoveryConsent = checkoutRecoveryOptIn && Boolean(recoveryEmail);

      if (shouldUseSiteRecoveryConsent) {
        rememberCheckoutRecoveryEmail(recoveryEmail);
        void sendCheckoutRecoveryLead(recoveryEmail);
        trackEvent('checkout_recovery_email_opted_in', {
          tier: paidTier,
          source: checkoutSource,
          acquisition_source: checkoutAttribution?.source || 'unknown',
          shared_result: checkoutAttribution?.sharedResult || 'none',
          utm_campaign: checkoutAttribution?.utmCampaign || 'unknown',
          utm_source: checkoutAttribution?.utmSource || 'unknown',
          source_chain: checkoutAttribution?.sourceChain || 'none',
          has_logged_in_email: Boolean(user?.email),
          has_result_axis: Boolean(savedResultAxis),
          dominant_channel: savedResultAxis?.dominantChannel || 'unknown',
          inferior_channel: savedResultAxis?.inferiorChannel || 'unknown',
          reliability: savedResultAxis?.reliability || 'unknown',
        });
      } else if (checkoutRecoveryOptIn) {
        trackEvent('checkout_recovery_email_skipped', {
          tier: paidTier,
          source: checkoutSource,
          acquisition_source: checkoutAttribution?.source || 'unknown',
          has_logged_in_email: Boolean(user?.email),
          has_captured_email: Boolean(capturedEmail),
          has_result_axis: Boolean(savedResultAxis),
        });
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tier: paidTier,
          source: checkoutSource,
          attribution: checkoutAttribution,
          customerEmail: recoveryEmail,
          recoveryEmailOptIn: shouldUseSiteRecoveryConsent,
          anonymousId: getFunnelAnonymousId(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to start checkout');
      }

      if (!data.url) {
        throw new Error('Stripe did not return a checkout URL');
      }

      writePendingCheckout({
        tier: paidTier,
        url: data.url,
        sessionId: typeof data.sessionId === 'string' ? data.sessionId : undefined,
        expiresAt: typeof data.expiresAt === 'number' || typeof data.expiresAt === 'string' ? data.expiresAt : undefined,
        source: checkoutSource,
        attribution: checkoutAttribution,
      });
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      checkoutOpeningRef.current = false;
      setIsOpeningStripe(false);
    }
  }, [capturedEmail, checkoutAttribution, checkoutRecoveryEmail, checkoutRecoveryOptIn, finalPriceLabel, paidTier, rememberCheckoutRecoveryEmail, savedResultAxis, sendCheckoutRecoveryLead, tierPrice, user?.email]);

  const handleMobilePaymentClick = useCallback(() => {
    void startStripeCheckout();
  }, [startStripeCheckout]);

  if (!paidTier || !checkoutDetails || !tierPrice) {
    return null;
  }

  if (!hasLocalResults) {
    return (
      <div className="min-h-screen bg-jung-base">
        <section className="section-rule py-8 sm:py-10">
          <div className="mx-auto w-full max-w-[960px] px-4 sm:px-8">
            <Link
              to="/pricing"
              className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-jung-secondary transition-colors hover:text-jung-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to pricing
            </Link>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[960px] px-4 py-12 sm:px-8 lg:py-16">
          <div className="rounded-lg border border-jung-border bg-jung-surface p-6 shadow-sm sm:p-9">
            <div className="inline-flex items-center gap-2 rounded-lg border border-jung-accent-muted bg-jung-accent-light px-3 py-1.5 text-xs font-semibold text-jung-accent">
              <ShieldCheck className="h-4 w-4" />
              Free map needed first
            </div>
            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
              <div>
                <h1 className="text-display text-4xl text-jung-dark sm:text-5xl">
                  Take the assessment before paying for {checkoutDetails.packageName}.
                </h1>
                <p className="mt-5 max-w-2xl text-body-lg text-jung-secondary">
                  The paid report is built from your TypeJung result. Complete the free 42-question map first, then the {PRICING[paidTier].name} upgrade stays selected if the result feels worth keeping.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="accent"
                    size="lg"
                    onClick={startAssessmentFirst}
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Start free assessment
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={viewSampleReport}
                    leftIcon={<FileText className="h-5 w-5" />}
                  >
                    View sample report
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-jung-border bg-jung-base p-5">
                <p className="text-label">Selected upgrade</p>
                <h2 className="mt-3 text-heading text-2xl text-jung-dark">{checkoutDetails.packageName}</h2>
                <p className="mt-3 text-sm leading-6 text-jung-secondary">{checkoutDetails.headline}</p>
                <div className="mt-5 rounded-lg border border-jung-accent-muted bg-jung-accent-light/70 p-4">
                  <p className="text-sm font-semibold text-jung-dark">
                    {EMAIL_CAPTURE_OFFER.code} price: {discountedPriceLabel(PRICING[paidTier].amount)}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-jung-secondary">
                    One-time CAD purchase after your free result. No subscription.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-jung-base pb-28 lg:pb-0">
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
          <div className="mx-auto min-w-0 w-full max-w-full rounded-lg border border-jung-border bg-jung-surface p-5 shadow-sm sm:p-8">
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

            <div className="mt-6 rounded-lg border border-jung-dark bg-jung-dark p-5 text-white shadow-xl sm:p-6">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/55">Before Stripe</p>
                  <h2 className="mt-3 text-2xl font-semibold leading-tight text-white">
                    {priceContext} One-time, not a subscription.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    Secure checkout via Stripe. Apple Pay, Google Pay, and Link can appear when they are enabled in Stripe and supported by the buyer's browser/device.
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                  <p className="text-sm font-semibold text-white">7-day money-back guarantee</p>
                  <p className="mt-2 text-xs leading-5 text-white/65">
                    If the paid report does not feel useful, email {SUPPORT_EMAIL} with the Stripe receipt within 7 days.
                  </p>
                </div>
              </div>
              <ul className="mt-5 grid gap-3 text-sm leading-6 text-white/75 sm:grid-cols-2">
                {checkoutDetails.includes.slice(0, paidTier === 'insight' ? 4 : 5).map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-jung-subtle" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {savedResultAxis && (
              <div className="mt-6 rounded-lg border border-jung-accent-muted bg-jung-accent-light/70 p-5 shadow-sm">
                <div className="inline-flex items-center gap-2 rounded-lg bg-jung-surface px-3 py-1.5 text-xs font-semibold text-jung-accent">
                  <FileText className="h-3.5 w-3.5" />
                  Built from your free map
                </div>
                <h2 className="mt-4 text-2xl font-semibold leading-tight text-jung-dark">
                  This report expands your {savedResultAxis.dominantLabel} to {savedResultAxis.inferiorLabel} axis.
                </h2>
                <p className="mt-3 text-sm leading-6 text-jung-secondary">
                  Stripe is only the payment step. The paid report stays tied to the free map already saved in this browser.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-jung-border bg-jung-surface p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-jung-muted">Dominant</p>
                    <p className="mt-1 text-sm font-semibold text-jung-dark">{savedResultAxis.dominantLabel}</p>
                  </div>
                  <div className="rounded-lg border border-jung-border bg-jung-surface p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-jung-muted">Growth edge</p>
                    <p className="mt-1 text-sm font-semibold text-jung-dark">{savedResultAxis.inferiorLabel}</p>
                  </div>
                  <div className="rounded-lg border border-jung-border bg-jung-surface p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-jung-muted">Signal</p>
                    <p className="mt-1 text-sm font-semibold text-jung-dark">{savedResultAxis.reliability}</p>
                  </div>
                </div>
              </div>
            )}

            {returnedFromStripe && (
              <div className="mt-6 rounded-lg border border-jung-accent-muted bg-jung-accent-light/70 p-4">
                <div className="flex gap-3">
                  <RefreshCcw className="mt-0.5 h-4 w-4 flex-none text-jung-accent" />
                  <div>
                    <p className="text-sm font-semibold text-jung-dark">Payment was not completed.</p>
                    <p className="mt-1 text-sm leading-6 text-jung-secondary">
                      Your {EMAIL_CAPTURE_OFFER.code} discount is still ready. Continue when you are ready, or view the sample report first.
                    </p>
                  </div>
                </div>
                <DiscountCaptureCard
                  source="checkout_cancel_return"
                  compact
                  minimal
                  dominantLabel={savedResultAxis?.dominantLabel}
                  inferiorLabel={savedResultAxis?.inferiorLabel}
                  preferredTier={paidTier}
                  showCheckoutButtons={false}
                  className="mt-4 border-t border-jung-accent-muted pt-4"
                />
              </div>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: CreditCard, label: 'One-time CAD', body: 'No subscription or renewal.' },
                { icon: ShieldCheck, label: 'Secure checkout via Stripe', body: 'You confirm payment on Stripe next.' },
                { icon: Lock, label: 'Private by default', body: 'Your result stays tied to your TypeJung access.' },
                { icon: RefreshCcw, label: '7-day guarantee', body: 'Contact support if the paid report is not useful.' },
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

          <aside className="order-first mx-auto min-w-0 w-full max-w-full rounded-lg border border-jung-border bg-jung-surface p-5 shadow-md sm:p-6 lg:sticky lg:top-28 lg:order-none">
            <p className="text-label">Order summary</p>
            <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-jung-border bg-jung-base p-2 text-center">
              {[
                { icon: Check, label: 'Review' },
                { icon: CreditCard, label: 'Stripe' },
                { icon: FileText, label: 'Unlock' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-lg bg-jung-surface px-2 py-2">
                  <Icon className="mx-auto h-4 w-4 text-jung-accent" />
                  <p className="mt-1 text-[11px] font-semibold text-jung-secondary">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-start justify-between gap-4 border-b border-jung-border pb-5">
              <div>
                <h2 className="text-heading text-2xl text-jung-dark">{checkoutDetails.packageName}</h2>
                <p className="mt-2 text-sm leading-6 text-jung-secondary">
                  One-time TypeJung upgrade
                </p>
                <p className="mt-1 text-xs leading-5 text-jung-muted">
                  {tierPrice.price} ≈ {APPROX_USD_PRICE[paidTier]} list price
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-jung-dark">{finalPriceLabel}</p>
                <p className="mt-1 text-xs text-jung-muted line-through">{tierPrice.price}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 border-b border-jung-border pb-5">
              {orderRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 text-sm">
                  <span className={label === 'After code' ? 'font-semibold text-jung-dark' : 'text-jung-secondary'}>
                    {label}
                  </span>
                  <span className={label === 'After code' ? 'font-semibold text-jung-dark' : 'text-jung-secondary'}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

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
                paymentButtonText
              )}
            </Button>

            <p className="mt-3 text-center text-xs leading-5 text-jung-muted">
              Secure checkout via Stripe. You will confirm the discounted total before payment is collected.
            </p>

            <div className="mt-5 rounded-lg border border-jung-border bg-jung-base p-4">
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 flex-none text-jung-accent" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-jung-dark">
                        {recoveryEmailPreview ? 'Recovery email ready' : 'Protect this checkout'}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-jung-secondary">
                        {recoveryEmailPreview
                          ? `Ready for Stripe prefill and one interrupted-checkout recovery link: ${recoveryEmailPreview}`
                          : 'Add an email now so Stripe can prefill the receipt address and TypeJung can send one recovery link if checkout expires before payment.'}
                      </p>
                    </div>
                    <span className="rounded-lg bg-jung-accent-light px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-jung-accent">
                      {recoveryEmailPreview ? 'Recoverable' : 'Recommended'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRecoveryEmailControls((value) => !value)}
                    className="mt-3 text-xs font-semibold text-jung-accent hover:underline"
                  >
                    {showRecoveryEmailControls ? 'Hide email options' : recoveryEmailPreview ? 'Edit email options' : 'Add email options'}
                  </button>
                </div>
              </div>
              {showRecoveryEmailControls && (
                <div className="mt-3">
                  <label className="sr-only" htmlFor="checkout-recovery-email">
                    Checkout email
                  </label>
                  <input
                    ref={checkoutEmailInputRef}
                    id="checkout-recovery-email"
                    type="email"
                    value={checkoutRecoveryEmail}
                    onChange={(event) => {
                      setCheckoutRecoveryEmail(event.target.value);
                      if (recoveryEmailError) setRecoveryEmailError(null);
                    }}
                    placeholder={user?.email || capturedEmail || 'you@example.com'}
                    aria-invalid={Boolean(recoveryEmailError)}
                    aria-describedby={recoveryEmailError ? 'checkout-recovery-email-error' : undefined}
                    className="h-11 w-full rounded-lg border border-jung-border bg-jung-surface px-3 text-sm text-jung-dark outline-none transition focus:border-jung-accent focus:ring-2 focus:ring-jung-accent/20"
                  />
                  {recoveryEmailError && (
                    <p id="checkout-recovery-email-error" className="mt-2 text-xs leading-5 text-error">
                      {recoveryEmailError}
                    </p>
                  )}
                  <label className="mt-3 flex items-start gap-3 text-xs leading-5 text-jung-secondary">
                    <input
                      type="checkbox"
                      checked={checkoutRecoveryOptIn}
                      onChange={(event) => setCheckoutRecoveryOptIn(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-jung-border text-jung-accent focus:ring-jung-accent"
                    />
                    <span>
                      Also use this email for one TypeJung recovery link if checkout expires. No subscription is created.
                    </span>
                  </label>
                  {!checkoutRecoveryOptIn && (
                    <p className="mt-2 text-xs leading-5 text-jung-muted">
                      TypeJung recovery emails are off. Stripe will still receive this email for receipt and checkout prefill.
                    </p>
                  )}
                </div>
              )}
            </div>

            <p className="mt-2 text-center text-xs leading-5 text-jung-muted">
              Email is required before Stripe for receipt and interrupted-checkout recovery. No subscription is created.
            </p>

            <div className="mt-5 border-y border-jung-border py-5">
              <div className="flex gap-3">
                <Tag className="mt-0.5 h-4 w-4 flex-none text-jung-accent" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-jung-dark">
                    {EMAIL_CAPTURE_OFFER.code} is applied on Stripe for {EMAIL_CAPTURE_OFFER.percentOff}% off.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-jung-secondary">
                    Continue to Stripe and confirm the discounted total before payment. Copy the code only if Stripe asks for it.
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="flex min-h-11 min-w-0 items-center rounded-lg border border-jung-border bg-jung-base px-3 font-mono text-sm font-semibold tracking-[0.12em] text-jung-dark">
                      {EMAIL_CAPTURE_OFFER.code}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyDiscountCode}
                      leftIcon={discountCopyStatus === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    >
                      {discountCopyStatus === 'copied' ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-jung-accent-muted bg-jung-accent-light/70 p-4">
              <div className="flex gap-3">
                <RefreshCcw className="mt-0.5 h-4 w-4 flex-none text-jung-accent" />
                <p className="text-xs leading-5 text-jung-secondary">
                  If the paid report does not feel helpful, email {SUPPORT_EMAIL} within 7 days with your Stripe receipt.
                </p>
              </div>
            </div>

            {!authLoading && user?.email && (
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-jung-accent-light px-4 py-3 text-sm text-jung-accent">
                <Mail className="h-4 w-4 flex-none" />
                <span className="min-w-0 truncate">Logged in as {user.email}</span>
              </div>
            )}

            {!authLoading && !user?.email && capturedEmail && (
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-jung-accent-light px-4 py-3 text-sm text-jung-accent">
                <Mail className="h-4 w-4 flex-none" />
                <span className="min-w-0 truncate">Stripe email prefilled from {capturedEmail}</span>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error" role="alert">
                {error}
              </div>
            )}

            <Button
              variant="secondary"
              size="md"
              className="mt-5 w-full"
              onClick={viewSampleReport}
              leftIcon={<FileText className="h-4 w-4" />}
            >
              View sample report
            </Button>

            <p className="mt-4 text-xs leading-5 text-jung-muted">
              Stripe may offer Link saved checkout. Choose Pay without Link on Stripe if you prefer to enter card details manually.
            </p>
          </aside>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-jung-border bg-jung-surface/95 shadow-[0_-12px_32px_rgba(41,28,18,0.14)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-screen-sm items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-jung-dark">
              {checkoutDetails.packageName} - {finalPriceLabel}
            </p>
            <p className="mt-0.5 text-xs leading-4 text-jung-muted">
              {EMAIL_CAPTURE_OFFER.code} applied. One-time CAD.
            </p>
          </div>
          <Button
            variant="accent"
            size="sm"
            className="flex-none"
            onClick={handleMobilePaymentClick}
            disabled={isOpeningStripe}
            rightIcon={!isOpeningStripe ? <ArrowRight className="h-4 w-4" /> : undefined}
          >
            {mobilePaymentButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
