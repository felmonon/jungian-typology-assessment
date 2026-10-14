import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  FileText,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ATTITUDE_LABELS, FUNCTION_LABELS } from '../data/depthAssessment';
import {
  discountedPriceLabel,
  discountSavingsAmount,
  EMAIL_CAPTURE_OFFER,
  formatCadAmount,
} from '../data/discount';
import type { PaidTierId } from '../data/pricing';
import { isPaidTierId, PRICING } from '../data/pricing';
import { SUPPORT_EMAIL } from '../data/support';
import { useAuth } from '../hooks/use-auth';
import { useSEO } from '../hooks/useSEO';
import {
  captureAcquisitionSourceFromLocation,
  pathWithSource,
  sourceForCheckout,
} from '../lib/acquisition-source';
import {
  AnalyticsEvents,
  getFunnelAnonymousId,
  trackEvent,
} from '../lib/analytics';
import { writePendingCheckout } from '../lib/pending-checkout';
import {
  encodeResultCode,
  RESULT_CODE_HASH_KEY,
  resultCodeFromHash,
  resultFromCode,
} from '../lib/result-link';
import { writeUpgradeIntent } from '../lib/upgrade-intent';
import { STORAGE_KEYS } from '../lib/validation';
import {
  DepthAssessmentResult,
  isDepthAssessmentResult,
} from '../utils/depthScoring';

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
    packageName: 'Insight Report',
    headline:
      'Get the ten-section interpretation behind the free map you just saw.',
    description:
      'The free map shows your scores, hierarchy, dominant-inferior axis, and consistency signal. Insight starts after that boundary with ten personalized sections across function dynamics, archetypes, grip and recovery, relationships, work, individuation, shadow, growth, and dream reflection.',
    includes: [
      'Ten personalized interpretation sections',
      'Grip sequence with pressure and recovery cues',
      'Relationship and work-pattern reflections',
      'Archetype, shadow, individuation, growth, and dream prompts',
      'The Function Stack in Depth — 15-page theory guide (PDF)',
      'Unlocked result access in this browser, with account restore after sign-in',
    ],
    previewModules: [
      {
        title: 'Grip sequence and recovery',
        body: 'A separate read of early pressure signals, escalation, and the grounded move that can restore choice.',
      },
      {
        title: 'Relationship and work patterns',
        body: 'Two distinct sections for conflict, repair, feedback, pacing, and the conditions that strain your weaker channel.',
      },
      {
        title: 'Shadow and growth prompts',
        body: 'Archetypal, shadow, individuation, growth, and dream-reflection sections that go beyond the free hierarchy.',
      },
    ],
    nextStep:
      'Stripe handles payment securely in one step. After checkout, return to TypeJung and sign in with the purchase email if prompted so the ten-section report can be attached to your account.',
  },
  mastery: {
    packageName: 'Mastery Report',
    headline: 'The ten-section report plus ongoing practice tools.',
    description:
      'Mastery includes everything in Insight plus the AI Type Guide, tailored growth exercises, and a practice roadmap for working with your cognitive stack.',
    includes: [
      'Everything in Insight',
      'AI Type Guide for follow-up reflection questions',
      'Individuation roadmap and practice plan',
      'Growth exercises tailored to your cognitive stack',
      'The Function Stack in Depth — 15-page theory guide (PDF)',
      'Account-based guide access after sign-in',
    ],
    previewModules: [
      {
        title: 'AI Type Guide',
        body: 'Follow-up questions about the result, with reflection prompts grounded in your mapped stack.',
      },
      {
        title: 'Individuation roadmap',
        body: 'A practice sequence for using the report after the first read-through.',
      },
      {
        title: 'Tracking over time',
        body: 'Reassessment context so later maps can be compared against the current one.',
      },
    ],
    nextStep:
      'Stripe handles payment securely. After checkout, return to TypeJung and sign in with the purchase email if prompted so Mastery features can be enabled on your account.',
  },
};

const DISCOUNT_CAPTURE_STORAGE_KEY = 'typejung_discount_capture';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const readCapturedDiscountEmail = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const saved = JSON.parse(
      localStorage.getItem(DISCOUNT_CAPTURE_STORAGE_KEY) || '{}',
    );
    const email =
      typeof saved.email === 'string' ? saved.email.trim().toLowerCase() : '';
    return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : null;
  } catch {
    return null;
  }
};

const readSavedDepthResult = (): DepthAssessmentResult | null => {
  if (typeof window === 'undefined') return null;

  try {
    const parsed = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.RESULTS) || 'null',
    );
    return isDepthAssessmentResult(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

// Emailed checkout links carry the map's answer code, so a visitor who opens
// the email in a browser that never took the test still reaches checkout.
const readInitialDepthResult = (
  hash: string,
): {
  result: DepthAssessmentResult | null;
  restoredFromLink: boolean;
} => {
  const saved = readSavedDepthResult();
  if (saved || typeof window === 'undefined') {
    return { result: saved, restoredFromLink: false };
  }

  const restored = resultFromCode(resultCodeFromHash(hash));
  if (!restored) return { result: null, restoredFromLink: false };

  try {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(restored));
  } catch {
    // The restored map still renders for this visit.
  }
  return { result: restored, restoredFromLink: true };
};

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tier } = useParams<{ tier: string }>();
  const { user } = useAuth();
  const paidTier = isPaidTierId(tier) ? tier : null;
  const [isOpeningStripe, setIsOpeningStripe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedEmail] = useState(readCapturedDiscountEmail);
  const [checkoutRecoveryEmail, setCheckoutRecoveryEmail] = useState(
    () => capturedEmail || '',
  );
  const [checkoutRecoveryOptIn, setCheckoutRecoveryOptIn] = useState(false);

  const checkoutAxisTrackedRef = useRef<string | null>(null);
  const checkoutOpeningRef = useRef(false);
  const checkoutEmailInputRef = useRef<HTMLInputElement>(null);
  const [recoveryEmailError, setRecoveryEmailError] = useState<string | null>(
    null,
  );
  const [checkoutRecoverySaveStatus, setCheckoutRecoverySaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [{ result: savedDepthResult, restoredFromLink }] = useState(() =>
    readInitialDepthResult(location.hash),
  );
  const hasLocalResults = Boolean(savedDepthResult);
  const linkedResultCode = resultCodeFromHash(location.hash);
  const returnedFromStripe =
    new URLSearchParams(location.search).get('checkout') === 'cancelled';
  const acquisition = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const hash = resultCodeFromHash(location.hash) ? '' : location.hash;
    const path = `${location.pathname}${location.search}${hash}`;
    return captureAcquisitionSourceFromLocation(
      location.search,
      path,
      document.referrer,
    );
  }, [location.hash, location.pathname, location.search]);
  const acquisitionSource = acquisition?.source || null;
  const checkoutAttribution = useMemo(
    () =>
      acquisition
        ? {
            source: acquisition.source,
            ref: acquisition.ref,
            utmCampaign: acquisition.utmCampaign,
            utmSource: acquisition.utmSource,
            sharedResult: acquisition.sharedResult,
            parentSource: acquisition.parentSource,
            sourceChain: acquisition.sourceChain,
          }
        : undefined,
    [
      acquisition?.source,
      acquisition?.ref,
      acquisition?.utmCampaign,
      acquisition?.utmSource,
      acquisition?.sharedResult,
      acquisition?.parentSource,
      acquisition?.sourceChain,
    ],
  );

  const checkoutDetails = paidTier ? CHECKOUT_DETAILS[paidTier] : null;
  const tierPrice = paidTier ? PRICING[paidTier] : null;
  const savedResultAxis = useMemo(() => {
    if (!savedDepthResult) return null;

    const inferiorPosition = savedDepthResult.hierarchy.find(
      (item) => item.position === 'inferior',
    );
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
    }
  }, [checkoutRecoveryEmail, user?.email]);

  useEffect(() => {
    if (!linkedResultCode) return;

    const params = new URLSearchParams(location.hash.replace(/^#/, ''));
    params.delete(RESULT_CODE_HASH_KEY);
    const remainingHash = params.toString();
    navigate(
      `${location.pathname}${location.search}${remainingHash ? `#${remainingHash}` : ''}`,
      { replace: true },
    );
  }, [linkedResultCode, location.hash, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!paidTier || !linkedResultCode) return;

    trackEvent('checkout_result_link_opened', {
      tier: paidTier,
      restored: restoredFromLink,
      had_local_results: hasLocalResults && !restoredFromLink,
    });
    // Once per visit: the code leaves the URL right after this runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useSEO({
    title: checkoutDetails
      ? `Checkout - ${checkoutDetails.packageName} | TypeJung`
      : 'Checkout | TypeJung',
    description:
      'Review your TypeJung order before continuing to secure Stripe payment.',
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
      result_restored_from_link: restoredFromLink,
    });
  }, [
    acquisition?.parentSource,
    acquisition?.ref,
    acquisition?.sharedResult,
    acquisition?.sourceChain,
    acquisition?.utmCampaign,
    acquisition?.utmSource,
    acquisitionSource,
    hasLocalResults,
    navigate,
    paidTier,
    restoredFromLink,
    returnedFromStripe,
  ]);

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
  }, [
    acquisition?.utmCampaign,
    acquisition?.utmSource,
    acquisitionSource,
    paidTier,
    savedDepthResult,
    savedResultAxis,
  ]);

  const recoveryEmailPreview =
    checkoutRecoveryEmail.trim() || user?.email || capturedEmail || '';
  const checkoutEmailCandidate = recoveryEmailPreview.trim();
  const hasCheckoutEmail = EMAIL_PATTERN.test(
    checkoutEmailCandidate.toLowerCase(),
  );
  const finalPriceLabel = tierPrice
    ? discountedPriceLabel(tierPrice.amount)
    : '';

  const rememberCheckoutRecoveryEmail = useCallback(
    (email: string) => {
      if (!paidTier) return;

      try {
        localStorage.setItem(
          DISCOUNT_CAPTURE_STORAGE_KEY,
          JSON.stringify({
            email,
            discountCode: EMAIL_CAPTURE_OFFER.code,
            capturedAt: new Date().toISOString(),
            source: 'checkout_recovery_prestripe',
            tierIntent: paidTier,
          }),
        );
      } catch {
        // Non-critical persistence.
      }
    },
    [paidTier],
  );

  const sendCheckoutRecoveryLead = useCallback(
    async (email: string): Promise<boolean> => {
      if (!paidTier) return false;

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
            resultCode: savedDepthResult
              ? encodeResultCode(savedDepthResult) || undefined
              : undefined,
            dominantLabel: savedResultAxis?.dominantLabel,
            inferiorLabel: savedResultAxis?.inferiorLabel,
            utmSource: checkoutAttribution?.utmSource,
            utmCampaign: checkoutAttribution?.utmCampaign,
            parentSource:
              checkoutAttribution?.parentSource || checkoutAttribution?.source,
            sourceChain: checkoutAttribution?.sourceChain,
          }),
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
          trackEvent('checkout_recovery_lead_failed', {
            tier: paidTier,
            status: response.status,
            reason:
              typeof data?.error === 'string' ? data.error : 'request_failed',
          });
          return false;
        }

        trackEvent('checkout_recovery_lead_captured', {
          tier: paidTier,
          captured: Boolean(data?.captured),
          email_sent: Boolean(data?.sent),
          capture_reason:
            typeof data?.captureReason === 'string'
              ? data.captureReason
              : 'unknown',
          skip_reason: typeof data?.reason === 'string' ? data.reason : 'none',
        });
        return true;
      } catch (error) {
        trackEvent('checkout_recovery_lead_failed', {
          tier: paidTier,
          status: 'network',
          reason:
            error instanceof Error
              ? error.message.substring(0, 120)
              : 'network_error',
        });
        // Checkout recovery capture is best-effort; Stripe should still open.
        return false;
      }
    },
    [
      checkoutAttribution?.parentSource,
      checkoutAttribution?.source,
      checkoutAttribution?.sourceChain,
      checkoutAttribution?.utmCampaign,
      checkoutAttribution?.utmSource,
      paidTier,
      savedDepthResult,
      savedResultAxis?.dominantLabel,
      savedResultAxis?.inferiorLabel,
    ],
  );

  const saveCheckoutRecoveryPath = useCallback(
    async (source: string) => {
      if (!paidTier) return false;

      const email = checkoutEmailCandidate.trim().toLowerCase();
      if (!EMAIL_PATTERN.test(email)) {
        setRecoveryEmailError('Enter a valid email address before Stripe.');
        window.requestAnimationFrame(() => {
          checkoutEmailInputRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          checkoutEmailInputRef.current?.focus();
        });
        return false;
      }

      setCheckoutRecoverySaveStatus('saving');
      setRecoveryEmailError(null);
      rememberCheckoutRecoveryEmail(email);
      const captured = await sendCheckoutRecoveryLead(email);

      if (captured) {
        setCheckoutRecoverySaveStatus('saved');
        trackEvent('checkout_recovery_path_saved', {
          tier: paidTier,
          source,
          acquisition_source: checkoutAttribution?.source || 'unknown',
          utm_campaign: checkoutAttribution?.utmCampaign || 'unknown',
          utm_source: checkoutAttribution?.utmSource || 'unknown',
          has_result_axis: Boolean(savedResultAxis),
        });
        return true;
      }

      setCheckoutRecoverySaveStatus('error');
      setRecoveryEmailError(
        'The checkout path could not be emailed yet. You can still continue to Stripe.',
      );
      return false;
    },
    [
      checkoutAttribution?.source,
      checkoutAttribution?.utmCampaign,
      checkoutAttribution?.utmSource,
      checkoutEmailCandidate,
      paidTier,
      rememberCheckoutRecoveryEmail,
      savedResultAxis,
      sendCheckoutRecoveryLead,
    ],
  );

  const viewSampleReport = useCallback(() => {
    const destination = pathWithSource(
      '/sample-report',
      'checkout_sample_report',
    );
    AnalyticsEvents.ctaClicked('view_sample_report', 'checkout_review', {
      buttonText: 'View sample report',
      destination,
    });
    navigate(destination);
  }, [navigate]);

  const startAssessmentFirst = useCallback(() => {
    if (!paidTier) return;

    const destination = pathWithSource(
      '/assessment',
      'checkout_without_result',
      { tier: paidTier },
    );
    writeUpgradeIntent(paidTier, 'checkout_without_result');
    AnalyticsEvents.ctaClicked(
      'start_assessment_before_checkout',
      'checkout_without_result',
      {
        buttonText: 'Start free assessment',
        destination,
        tier: paidTier,
      },
    );
    trackEvent('checkout_without_result_assessment_started', {
      tier: paidTier,
      acquisition_source: checkoutAttribution?.source || 'unknown',
      utm_campaign: checkoutAttribution?.utmCampaign || 'unknown',
      utm_source: checkoutAttribution?.utmSource || 'unknown',
      parent_source: checkoutAttribution?.parentSource || 'none',
      source_chain: checkoutAttribution?.sourceChain || 'none',
    });
    navigate(destination);
  }, [
    checkoutAttribution?.parentSource,
    checkoutAttribution?.source,
    checkoutAttribution?.sourceChain,
    checkoutAttribution?.utmCampaign,
    checkoutAttribution?.utmSource,
    navigate,
    paidTier,
  ]);

  const startStripeCheckout = useCallback(async () => {
    if (!paidTier || !tierPrice) return;
    if (checkoutOpeningRef.current) return;

    const checkoutSource = sourceForCheckout();
    const typedRecoveryEmail = checkoutRecoveryEmail.trim().toLowerCase();
    const validTypedRecoveryEmail = EMAIL_PATTERN.test(typedRecoveryEmail)
      ? typedRecoveryEmail
      : '';
    const checkoutCustomerEmail =
      validTypedRecoveryEmail ||
      readCapturedDiscountEmail() ||
      capturedEmail ||
      user?.email ||
      undefined;

    try {
      checkoutOpeningRef.current = true;
      setIsOpeningStripe(true);
      setError(null);
      setRecoveryEmailError(null);
      AnalyticsEvents.purchaseStarted(paidTier, tierPrice.amount);
      AnalyticsEvents.ctaClicked(
        'continue_to_secure_payment',
        'checkout_review',
        {
          buttonText: `Pay ${finalPriceLabel || tierPrice.price}`,
          destination: 'stripe_checkout',
        },
      );

      const recoveryEmail = checkoutCustomerEmail;
      const shouldUseSiteRecoveryConsent =
        checkoutRecoveryOptIn && Boolean(recoveryEmail);

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
        sessionId:
          typeof data.sessionId === 'string' ? data.sessionId : undefined,
        expiresAt:
          typeof data.expiresAt === 'number' ||
          typeof data.expiresAt === 'string'
            ? data.expiresAt
            : undefined,
        source: checkoutSource,
        attribution: checkoutAttribution,
      });
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      checkoutOpeningRef.current = false;
      setIsOpeningStripe(false);
    }
  }, [
    capturedEmail,
    checkoutAttribution,
    checkoutRecoveryEmail,
    checkoutRecoveryOptIn,
    finalPriceLabel,
    paidTier,
    rememberCheckoutRecoveryEmail,
    savedResultAxis,
    sendCheckoutRecoveryLead,
    tierPrice,
    user?.email,
  ]);

  const handleCheckoutActionClick = useCallback(() => {
    trackEvent('checkout_direct_stripe_clicked', {
      source: 'checkout_primary_button',
      tier: paidTier || 'unknown',
      has_prefilled_email: hasCheckoutEmail,
      recovery_opted_in: checkoutRecoveryOptIn,
    });
    void startStripeCheckout();
  }, [checkoutRecoveryOptIn, hasCheckoutEmail, paidTier, startStripeCheckout]);

  const checkoutEmailCard = (
    <details className="co-later">
      <summary>
        Email me a link to return later (optional)
      </summary>
      <div className="co-later-body">
        <label
          htmlFor="checkout-recovery-email"
          className="co-label"
        >
          Email address
        </label>
        <input
          ref={checkoutEmailInputRef}
          id="checkout-recovery-email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          value={checkoutRecoveryEmail}
          onChange={(event) => {
            setCheckoutRecoveryEmail(event.target.value);
            setCheckoutRecoverySaveStatus('idle');
            setRecoveryEmailError(null);
          }}
          placeholder="you@example.com"
          aria-invalid={Boolean(recoveryEmailError)}
          aria-describedby={
            recoveryEmailError ? 'checkout-recovery-email-error' : undefined
          }
          className="input-premium mt-2"
        />
        <label className="co-check">
          <input
            type="checkbox"
            checked={checkoutRecoveryOptIn}
            onChange={(event) => setCheckoutRecoveryOptIn(event.target.checked)}
          />
          Email me my result link and reminders about this optional report.
        </label>
        {checkoutRecoveryOptIn && (
          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={() => void saveCheckoutRecoveryPath('checkout_email_card')}
            disabled={checkoutRecoverySaveStatus === 'saving'}
          >
            {checkoutRecoverySaveStatus === 'saving'
              ? 'Sending…'
              : checkoutRecoverySaveStatus === 'saved'
                ? 'Link sent'
                : 'Send my return link'}
          </Button>
        )}
        {recoveryEmailError && (
          <p
            id="checkout-recovery-email-error"
            role="alert"
            className="co-field-error"
          >
            <AlertCircle className="h-4 w-4 flex-none" aria-hidden="true" />
            {recoveryEmailError}
          </p>
        )}
        <p className="co-fine">
          Stripe collects your receipt email during payment. This extra email is
          optional.
        </p>
      </div>
    </details>
  );

  if (!paidTier || !checkoutDetails || !tierPrice) {
    return null;
  }

  if (!hasLocalResults) {
    return (
      <div className="co">
        <div className="co-wrap">
          <Link
            to="/pricing"
            className="co-back"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to pricing
          </Link>
          <div className="co-grid">
            <div>
              <p className="co-flag">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Free map needed first
              </p>
              <h1 className="co-title">
                Take the assessment before paying for{' '}
                {checkoutDetails.packageName}.
              </h1>
              <p className="co-lead">
                The paid report is built from your TypeJung result. Complete
                the free 42-question map first, then the{' '}
                {PRICING[paidTier].name} upgrade stays selected if the result
                feels worth keeping.
              </p>
              <p className="co-text">
                Already took it in another browser or on another device? Your
                map is saved there, so open this link in that browser to
                continue to checkout.
              </p>
              <div className="co-actions">
                <Button
                  variant="accent"
                  size="lg"
                  onClick={startAssessmentFirst}
                  className="whitespace-nowrap"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Start free assessment
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={viewSampleReport}
                  className="whitespace-nowrap"
                  leftIcon={<FileText className="h-5 w-5" />}
                >
                  View sample report
                </Button>
              </div>
            </div>

            <aside className="co-card">
              <p className="co-card-label">Selected upgrade</p>
              <h2 className="co-card-name">
                {checkoutDetails.packageName}
              </h2>
              <p className="co-text">
                {checkoutDetails.headline}
              </p>
              <p className="co-card-offer">
                Current offer:{' '}
                {discountedPriceLabel(PRICING[paidTier].amount)}
                <span className="co-card-regular">
                  <span className="sr-only">Regular price </span>
                  <s>{PRICING[paidTier].price}</s>
                </span>
              </p>
              <p className="co-fine">
                One-time CAD purchase after your free result. No
                subscription.
              </p>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="co">
      <div className="co-wrap">
        <h1 className="co-title">
          Make room for a deeper look.
        </h1>
        <p className="co-lead">
          Add {checkoutDetails.packageName} to the result you have already
          completed.
        </p>
        <div className="co-grid">
          <div>
            {savedResultAxis && (
              <div className="co-axis">
                <p className="co-axis-label">Based on your saved map</p>
                <div className="co-axis-day">
                  <p className="co-axis-name">
                    {savedResultAxis.dominantLabel}
                  </p>
                  <p className="co-axis-role">Leads your map</p>
                </div>
                <div className="co-axis-line" aria-hidden="true" />
                <div className="co-axis-night">
                  <p className="co-axis-name">{savedResultAxis.inferiorLabel}</p>
                  <p className="co-axis-role">
                    With {savedResultAxis.inferiorLabel.toLowerCase()} as your
                    growth edge.
                  </p>
                  <Link
                    to="/results"
                    className="co-axis-link"
                  >
                    Read my free map <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}
            <h2 className="co-h2">What you will receive</h2>
            <ul className="list-diamond co-list">
              {checkoutDetails.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="co-fine">
              Your interpretation is generated by AI from your assessment result.
              Use it for self-reflection and compare it with your experience.
            </p>
            <button
              type="button"
              className="text-link mt-4"
              onClick={viewSampleReport}
            >
              Read the sample report
            </button>
            <details className="faq-tile co-after">
              <summary>
                What happens after I pay?
              </summary>
              <p>
                Stripe returns you to TypeJung to generate your report. Keep this
                browser's saved map and your receipt. Sign in with the purchase
                email to restore paid access on another device. Contact support if
                you need help.
              </p>
            </details>
          </div>
          <aside className="co-card co-pay">
            <h2 className="co-card-name">
              {checkoutDetails.packageName}
            </h2>
            <p className="co-price">{finalPriceLabel}</p>
            <p className="co-price-unit">
              One payment · Canadian dollars
            </p>
            <dl className="co-sum">
              <div>
                <dt>Regular price</dt>
                <dd>{tierPrice.price}</dd>
              </div>
              <div>
                <dt>{EMAIL_CAPTURE_OFFER.percentOff}% offer applied</dt>
                <dd>
                  −{formatCadAmount(discountSavingsAmount(tierPrice.amount))}
                </dd>
              </div>
              <div className="is-total">
                <dt>Report total</dt>
                <dd>{finalPriceLabel}</dd>
              </div>
            </dl>
            {returnedFromStripe && (
              <p
                className="co-status"
                role="status"
              >
                Payment was not completed. Your free map is still saved, and you
                can return whenever you are ready.
              </p>
            )}
            {error && (
              <div
                id="checkout-error"
                className="co-error"
                role="alert"
              >
                <p>
                  <AlertCircle className="h-5 w-5 flex-none" aria-hidden="true" />
                  <span>{error}</span>
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="link-ink"
                >
                  Contact support
                </a>
              </div>
            )}
            <Button
              variant="accent"
              size="lg"
              className="mt-6 w-full"
              onClick={handleCheckoutActionClick}
              disabled={isOpeningStripe}
              rightIcon={
                isOpeningStripe ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )
              }
            >
              {isOpeningStripe
                ? 'Checking availability…'
                : error
                  ? 'Try checkout again'
                  : 'Continue to payment'}
            </Button>
            <p className="co-fine co-center">
              Secure payment with Stripe. Review the final total before paying.
            </p>
            <p className="co-refund">
              <ShieldCheck className="h-4 w-4 flex-none" aria-hidden="true" />
              No subscription. 7-day refund policy.
            </p>
            <p className="co-fine">
              If the report is not useful, email{' '}
              <a
                className="link-ink"
                href={`mailto:${SUPPORT_EMAIL}`}
              >
                support
              </a>{' '}
              within 7 days with your receipt.
            </p>
            {checkoutEmailCard}
          </aside>
        </div>
      </div>
    </div>
  );
};
