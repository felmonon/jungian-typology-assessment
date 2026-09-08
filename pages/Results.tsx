import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Link2,
  Loader2,
  RefreshCcw,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PatternLens } from '../components/brand/PatternLens';
import { ResultNavigation, resultViewForHash, type ResultView } from '../components/results/ResultNavigation';
import { ChatBot } from '../components/ChatBot';
import { DiscountCaptureCard } from '../components/discount/DiscountCaptureCard';
import { FunctionEmblem } from '../components/brand/FunctionEmblem';
import { FunctionStackArtwork } from '../components/brand/FunctionStackArtwork';
import { PersonalReportReader } from '../components/results/PersonalReportReader';
import { ReportSamplePreview } from '../components/results/ReportSamplePreview';
import { useOfferImpression } from '../hooks/useOfferImpression';
import { PAGE_SEO, useSEO } from '../hooks/useSEO';
import { Button } from '../components/ui/Button';
import {
  ATTITUDE_LABELS,
  AttitudeDirection,
  depthLayerMeta,
  FUNCTION_LABELS,
  FunctionChannel,
} from '../data/depthAssessment';
import { discountedPriceLabel } from '../data/discount';
import { PRICING, type PaidTierId } from '../data/pricing';
import { SUPPORT_EMAIL } from '../data/support';
import {
  useAiAnalysis,
  type AnalysisInput,
  type PremiumAnalysis,
} from '../hooks/use-ai-analysis';
import { useAuth } from '../hooks/use-auth';
import { usePremiumStatus } from '../hooks/use-premium-status';
import {
  pathWithSource,
  readAcquisitionSource,
} from '../lib/acquisition-source';
import {
  AnalyticsEvents,
  getFunnelAnonymousId,
  trackEvent,
} from '../lib/analytics';
import {
  INTENT_RESULT_FRAMING,
  readAssessmentIntent,
} from '../lib/assessment-intent';
import { createDirectCheckoutSession } from '../lib/direct-checkout';
import { writePendingCheckout } from '../lib/pending-checkout';
import { resultUpgradeContextFromSource } from '../lib/result-upgrade-context';
import { readUpgradeIntent } from '../lib/upgrade-intent';
import { depthResultToLegacyAnalysisInput } from '../utils/depthCompatibility';
import {
  DepthAssessmentResult,
  isDepthAssessmentResult,
} from '../utils/depthScoring';

const RESULTS_KEY = 'jungian_assessment_results';
const CHECKOUT_SESSION_KEY = 'jungian_assessment_checkout_session_id';
const LIFECYCLE_EMAIL_ENDPOINT = '/api/lifecycle-email';
const RESULT_READY_EMAIL_ATTEMPT_PREFIX =
  'typejung_lifecycle_email_result_ready_';
const UPGRADE_EMAIL_DUE_PREFIX = 'typejung_lifecycle_email_upgrade_due_';
const UPGRADE_EMAIL_ATTEMPT_PREFIX = 'typejung_lifecycle_email_upgrade_';
const UPGRADE_EMAIL_DELAY_MS = 36 * 60 * 60 * 1000;
const PUBLIC_SHARE_SLUG_PREFIX = 'typejung_public_share_slug_';
const REFERRAL_INVITE_GOAL = 3;
const REFERRAL_INVITE_CAMPAIGN = 'friend_compare';
type InviteShareLocation = 'results_compare_banner' | 'results_invite_card';

const inviteSourceByLocation: Record<InviteShareLocation, string> = {
  results_compare_banner: 'result_compare_banner',
  results_invite_card: 'result_compare_card',
};

const paidTierPrice = (tier: PaidTierId) =>
  discountedPriceLabel(PRICING[tier].amount);

const premiumReportSectionConfig: Array<{
  key: keyof PremiumAnalysis;
  title: string;
}> = [
    { key: 'overview', title: 'Pattern synthesis' },
    { key: 'functionAnalysis', title: 'Function dynamics' },
    { key: 'archetypes', title: 'Archetypal pattern' },
    { key: 'theGrip', title: 'Grip sequence and recovery' },
    { key: 'relationships', title: 'Relationship pattern and repair' },
    { key: 'career', title: 'Work conditions and friction' },
    { key: 'individuation', title: 'Individuation path' },
    { key: 'shadow', title: 'Shadow triggers and integration' },
    { key: 'growth', title: 'Growth practices' },
    { key: 'dreams', title: 'Dream reflection prompts' },
  ];

type ResultsState =
  | { status: 'loading' }
  | { status: 'no-results' }
  | { status: 'legacy' }
  | { status: 'ready'; results: DepthAssessmentResult };

const positionLabels = {
  dominant: 'Dominant',
  auxiliary: 'Auxiliary',
  tertiary: 'Tertiary',
  inferior: 'Inferior',
} as const;

const functionCodeByChannel: Record<
  FunctionChannel,
  Record<AttitudeDirection, string>
> = {
  thinking: {
    introverted: 'Ti',
    extraverted: 'Te',
  },
  feeling: {
    introverted: 'Fi',
    extraverted: 'Fe',
  },
  sensation: {
    introverted: 'Si',
    extraverted: 'Se',
  },
  intuition: {
    introverted: 'Ni',
    extraverted: 'Ne',
  },
};

const getFunctionCode = (
  channel: FunctionChannel,
  attitude: AttitudeDirection,
) => functionCodeByChannel[channel]?.[attitude] ?? 'unknown';

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return 'Recently completed';
  }
};

const readResults = (): ResultsState => {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (!raw) return { status: 'no-results' };
    const parsed = JSON.parse(raw);
    if (isDepthAssessmentResult(parsed))
      return { status: 'ready', results: parsed };
    return { status: 'legacy' };
  } catch {
    return { status: 'no-results' };
  }
};

const readCheckoutSessionId = (): string | undefined => {
  try {
    const value = localStorage.getItem(CHECKOUT_SESSION_KEY)?.trim();
    return value || undefined;
  } catch {
    return undefined;
  }
};

const postLifecycleEmail = async (body: Record<string, unknown>) => {
  try {
    const response = await fetch(LIFECYCLE_EMAIL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);
    return (
      response.ok && !!data && (data.sent === true || data.skipped === true)
    );
  } catch {
    return false;
  }
};

const EnergyBars: React.FC<{ results: DepthAssessmentResult }> = ({
  results,
}) => (
  <div className="card-premium p-6 sm:p-8">
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-label">Energy distribution</p>
        <h2 className="mt-2 text-heading text-3xl text-jung-dark">
          Your four function channels
        </h2>
      </div>
      <div className="rounded-lg bg-jung-accent-light px-3 py-2 text-sm font-semibold text-jung-accent">
        {results.reliability.score}% consistency
      </div>
    </div>

    <div className="space-y-5">
      {results.energy.map((item) => {
        const isDominant = item.channel === results.dominant;
        const isInferior = item.channel === results.inferior;

        return (
          <div key={item.channel}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-jung-dark">
                  {item.label}
                </span>
                {isDominant && (
                  <span className="rounded-lg bg-jung-accent px-2 py-1 text-[11px] font-semibold text-white">
                    Dominant
                  </span>
                )}
                {isInferior && (
                  <span className="rounded-lg border border-jung-border px-2 py-1 text-[11px] font-semibold text-jung-muted">
                    Inferior
                  </span>
                )}
              </div>
              <span className="font-mono text-sm font-semibold text-jung-muted">
                {item.score}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-jung-border-light">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.score}%` }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full rounded-full ${isInferior ? 'bg-jung-accent-muted' : 'bg-jung-accent'}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const Hierarchy: React.FC<{ results: DepthAssessmentResult }> = ({
  results,
}) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {results.hierarchy.map((item) => (
      <div
        key={item.position}
        className={`rounded-lg border p-5 ${item.position === 'dominant' ? 'border-jung-accent-muted bg-jung-accent-light/70' : 'border-jung-border bg-jung-surface'}`}
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold text-jung-muted">
            {positionLabels[item.position]}
          </p>
          <FunctionEmblem code={getFunctionCode(item.channel, item.attitude)} className="h-9 w-9 shrink-0 text-jung-accent" />
        </div>
        <h3 className="mt-3 text-2xl font-semibold text-jung-dark">
          {item.label}
        </h3>
        <p className="mt-2 text-sm leading-6 text-jung-secondary">
          {ATTITUDE_LABELS[item.attitude]} channel, {item.score}% of mapped
          energy.
        </p>
      </div>
    ))}
  </div>
);

const SignalGrid: React.FC<{ results: DepthAssessmentResult }> = ({
  results,
}) => {
  const signals = useMemo(
    () =>
      [
        [
          'behavioral',
          results.layerSignals.behavioral
            ? FUNCTION_LABELS[
            results.layerSignals.behavioral as FunctionChannel
            ]
            : 'Mixed',
        ],
        [
          'inferior',
          results.layerSignals.inferior
            ? FUNCTION_LABELS[results.layerSignals.inferior as FunctionChannel]
            : FUNCTION_LABELS[results.inferior],
        ],
        [
          'somatic',
          results.layerSignals.somatic
            ? FUNCTION_LABELS[results.layerSignals.somatic as FunctionChannel]
            : 'Mixed',
        ],
        ['attitude', ATTITUDE_LABELS[results.attitude.dominant]],
      ] as const,
    [results],
  );

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {signals.map(([layer, value]) => {
        const meta = depthLayerMeta[layer as keyof typeof depthLayerMeta];
        return (
          <div
            key={layer}
            className="rounded-lg border border-jung-border bg-jung-surface p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-jung-muted">
              {meta.shortLabel}
            </p>
            <p className="mt-2 text-lg font-semibold text-jung-dark">
              {value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export const LockedPremiumPreview: React.FC<{
  results: DepthAssessmentResult;
  inferiorLabel: string;
  offerRef?: React.Ref<HTMLElement>;
  intendedTier: PaidTierId;
  onUnlock: (tier: PaidTierId, location: string) => void;
  onViewSampleReport: (location: string) => void;
  checkoutOpeningTier: PaidTierId | null;
  checkoutError: string | null;
}> = ({
  results,
  inferiorLabel,
  offerRef,
  intendedTier,
  onUnlock,
  onViewSampleReport,
  checkoutOpeningTier,
  checkoutError,
}) => {
    const offerPrice = paidTierPrice(intendedTier);
    const isOpening = checkoutOpeningTier === intendedTier;
    return (
      <section
        id="report-offer"
        ref={offerRef}
        className="studio-report-offer mb-8 scroll-mt-28"
      >
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="studio-report-sample">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="journey-eyebrow">Your map is a beginning</p>
              <a href="#report-purchase" className="inline-flex min-h-11 items-center text-xs font-semibold text-jung-accent underline underline-offset-4 lg:hidden">{offerPrice} once · See the offer ↓</a>
            </div>
            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">Bring the pattern<br />into your everyday life.</h2>
            <p className="mt-4 mb-6 text-sm leading-7 text-jung-secondary">Your map points to {inferiorLabel.toLowerCase()} as a growth edge. Explore what a report can help you notice in stress, relationships, and work.</p>
            <ReportSamplePreview onExplore={topic => trackEvent('result_report_sample_explored', { topic, source: 'results_locked_preview', tier: intendedTier })} />
          </div>
          <div id="report-purchase" className="scroll-mt-28 rounded-2xl border border-jung-border bg-white p-6 sm:p-8 lg:sticky lg:top-36">
            <p className="journey-eyebrow">
              Optional {PRICING[intendedTier].name} report
            </p>
            <p className="mt-4 font-display text-4xl">
              {offerPrice}
              <span className="ml-2 font-sans text-xs text-jung-muted">
                one time · CAD
              </span>
            </p>
            <ul className="my-6 space-y-3">
              {[
                'Ten personalized, AI-generated sections',
                'Stress and recovery reflections',
                'Relationship, work, and growth prompts',
                'The Function Stack in Depth guide (PDF)',
                ...(intendedTier === 'mastery'
                  ? ['AI Type Guide and practice tools']
                  : []),
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-6 text-jung-secondary"
                >
                  <Check className="mt-1 h-4 w-4 shrink-0 text-jung-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={() => onUnlock(intendedTier, 'results_locked_preview')}
              disabled={isOpening}
              rightIcon={
                isOpening ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )
              }
            >
              {isOpening
                ? 'Checking availability…'
                : `Get my report — ${offerPrice}`}
            </Button>
            {checkoutError && (
              <p
                className="mt-4 rounded-lg border border-error/20 bg-error/5 p-3 text-sm leading-6 text-error"
                role="alert"
              >
                {checkoutError}
                {' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
                  Contact support
                </a>
              </p>
            )}
            <Button
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => onViewSampleReport('results_locked_preview')}
            >
              Read the full illustrative sample
            </Button>
            <p className="mt-3 text-center text-xs leading-6 text-jung-muted">
              Your free map is complete. No subscription.
              <br />
              7-day refund policy.
            </p>
            <details className="mt-6 border-t border-jung-border pt-4">
              <summary className="cursor-pointer text-xs font-semibold text-jung-secondary">How this connects to your free map</summary>
              <p className="mt-3 text-sm leading-7 text-jung-secondary">
                {results.narrative.developmentalEdge}
              </p>
              <p className="mt-3 text-xs leading-6 text-jung-muted">Your paid report develops this pattern across ten sections, using your assessment result.</p>
            </details>
          </div>
        </div>
      </section>
    );
  };

// Lightweight reaction prompt seeded as analytics (and a trust signal). Kept as
// its own component so its hooks stay valid regardless of the parent's early
// returns. Stores the answer per-result so it is asked once.
const ResultReaction: React.FC<{ completedAt: string }> = ({ completedAt }) => {
  const storageKey = `typejung_result_reaction_${completedAt}`;
  const [reaction, setReaction] = useState<string | null>(null);

  useEffect(() => {
    try {
      setReaction(localStorage.getItem(storageKey));
    } catch {
      /* storage unavailable */
    }
  }, [storageKey]);

  const submit = (value: 'yes' | 'somewhat' | 'not_yet') => {
    try {
      localStorage.setItem(storageKey, value);
    } catch {
      /* storage unavailable */
    }
    setReaction(value);
    trackEvent('result_reaction_submitted', { reaction: value });
  };

  const options: Array<{
    value: 'yes' | 'somewhat' | 'not_yet';
    label: string;
  }> = [
      { value: 'yes', label: 'Yes' },
      { value: 'somewhat', label: 'Somewhat' },
      { value: 'not_yet', label: 'Not yet' },
    ];

  return (
    <section className="mb-10 rounded-lg border border-jung-border bg-jung-surface p-5 shadow-sm sm:p-6">
      {reaction ? (
        <div className="flex items-start gap-3">
          <Check className="mt-0.5 h-5 w-5 flex-none text-jung-accent" />
          <div>
            <p className="text-sm font-semibold text-jung-dark">
              Thanks — that helps tune the map.
            </p>
            <p className="mt-1 text-sm leading-6 text-jung-secondary">
              {reaction === 'not_yet'
                ? 'If the map missed you, the dominant–inferior axis and reliability signal below are the best places to inspect why.'
                : 'Glad it named something real. Read the evidence layers below to see why the pattern resolved this way.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-jung-dark">
            Did this map name something real?
          </p>
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => submit(option.value)}
                className="rounded-full border border-jung-border bg-jung-base px-4 py-1.5 text-sm font-medium text-jung-dark transition-colors hover:border-jung-accent hover:text-jung-accent"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export const Results: React.FC = () => {
  useSEO(PAGE_SEO.results);
  const navigate = useNavigate();
  const location = useLocation();
  const resultView = resultViewForHash(location.hash);
  const pendingPanelFocusRef = useRef<ResultView | null>(null);
  const selectResultView = (view: ResultView, focusPanel = false) => {
    pendingPanelFocusRef.current = focusPanel ? view : null;
    const hashes: Record<ResultView, string> = { overview: '', map: '#free-map', report: isPremium ? '#premium-report' : '#report-offer', save: '#save-share' };
    navigate({ pathname: location.pathname, search: location.search, hash: hashes[view] }, { replace: true, preventScrollReset: true });
  };
  const [state, setState] = useState<ResultsState>({ status: 'loading' });
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { tier, isPremium, isLoading: premiumLoading } = usePremiumStatus();
  const {
    freeAnalysis,
    premiumAnalysis,
    isLoadingFree,
    isLoadingPremium,
    freeError,
    premiumError,
    fetchFreeAnalysis,
    fetchPremiumAnalysis,
  } = useAiAnalysis();
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'error' | 'skipped'
  >('idle');
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [returnCopied, setReturnCopied] = useState(false);
  const [shareLinkState, setShareLinkState] = useState<
    'idle' | 'creating' | 'error'
  >('idle');
  const [upgradeIntent] = useState(readUpgradeIntent);
  const [acquisition] = useState(readAcquisitionSource);
  const [checkoutOpeningTier, setCheckoutOpeningTier] =
    useState<PaidTierId | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const referralPromptTrackedRef = useRef<string | null>(null);
  const inboundSharedResultSlug =
    acquisition?.sharedResult && acquisition.sharedResult !== shareSlug
      ? acquisition.sharedResult
      : null;
  const intendedTier = upgradeIntent?.tier ?? 'insight';
  const upgradeContext = useMemo(
    () =>
      resultUpgradeContextFromSource(acquisition?.source, {
        parentSource: acquisition?.parentSource,
        utmCampaign: acquisition?.utmCampaign,
        utmSource: acquisition?.utmSource,
        sourceChain: acquisition?.sourceChain,
      }),
    [
      acquisition?.parentSource,
      acquisition?.source,
      acquisition?.sourceChain,
      acquisition?.utmCampaign,
      acquisition?.utmSource,
    ],
  );

  const openUpgradeCheckout = useCallback(
    async (paidTier: PaidTierId, ctaSource: string) => {
      if (checkoutOpeningTier) return;

      const destination = 'secure_stripe_checkout';
      trackEvent('results_unlock_clicked', {
        source: ctaSource,
        tier: paidTier,
        destination,
        checkout_mode: 'direct',
        value: PRICING[paidTier].amount,
        currency: PRICING[paidTier].currency,
        price_cad: PRICING[paidTier].amount,
        displayed_price: PRICING[paidTier].price,
        discounted_price: paidTierPrice(paidTier),
      });
      AnalyticsEvents.upgradeClicked(ctaSource, paidTier);
      AnalyticsEvents.purchaseStarted(paidTier, PRICING[paidTier].amount);
      AnalyticsEvents.ctaClicked(`unlock_${paidTier}`, ctaSource, {
        buttonText: `Get ${PRICING[paidTier].name} - ${paidTierPrice(paidTier)}`,
        destination,
      });

      setCheckoutError(null);
      setCheckoutOpeningTier(paidTier);

      try {
        const { session, attribution } = await createDirectCheckoutSession({
          tier: paidTier,
          source: ctaSource,
          acquisition,
          customerEmail: user?.email,
          anonymousId: getFunnelAnonymousId(),
        });

        writePendingCheckout({
          tier: paidTier,
          url: session.url,
          sessionId: session.sessionId,
          expiresAt: session.expiresAt,
          source: ctaSource,
          attribution,
        });
        trackEvent('results_direct_checkout_created', {
          source: ctaSource,
          tier: paidTier,
          has_account_email: Boolean(user?.email),
        });
        window.location.assign(session.url);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Secure checkout could not open. Please try again.';
        setCheckoutError(message);
        setCheckoutOpeningTier(null);
        trackEvent('results_direct_checkout_failed', {
          source: ctaSource,
          tier: paidTier,
          reason: 'checkout_unavailable',
        });
      }
    },
    [acquisition, checkoutOpeningTier, user?.email],
  );

  const viewSampleReport = useCallback(
    (location: string) => {
      const destination = pathWithSource('/sample-report', location);
      AnalyticsEvents.ctaClicked('view_sample_report', location, {
        buttonText: 'View sample report',
        destination,
      });
      navigate(destination);
    },
    [navigate],
  );

  useEffect(() => {
    setState(readResults());
  }, []);

  const currentResults = state.status === 'ready' ? state.results : null;
  const resolvedHashRef = useRef<string | null>(null);
  useEffect(() => {
    if (!location.hash) {
      resolvedHashRef.current = null;
      return;
    }
    if (!currentResults) return;
    const requestKey = `${location.key}:${location.hash}`;
    if (resolvedHashRef.current === requestKey) return;
    let targetId: string;
    try {
      targetId = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const target = document.getElementById(targetId)
      ?? (isPremium && (targetId === 'report-offer' || targetId === 'report-purchase')
        ? document.getElementById('premium-report') : null);
    if (!target || target.closest('[hidden]')) return;
    // The shared route scroller can run before a saved result or a generated
    // report exists. Resolve that pending anchor after its visible pane mounts.
    target.scrollIntoView({ behavior: 'auto', block: 'start' });
    resolvedHashRef.current = requestKey;
  }, [currentResults, isLoadingPremium, isPremium, location.hash, location.key, premiumAnalysis, premiumLoading]);
  useEffect(() => {
    if (!currentResults || pendingPanelFocusRef.current !== resultView) return;
    document.getElementById(`result-panel-${resultView}`)?.focus({ preventScroll: true });
    pendingPanelFocusRef.current = null;
  }, [currentResults, resultView]);
  const legacyInput = useMemo(
    () =>
      currentResults ? depthResultToLegacyAnalysisInput(currentResults) : null,
    [currentResults],
  );
  const premiumAnalysisInput = useMemo<AnalysisInput | null>(() => {
    if (!legacyInput) return null;
    const checkoutSessionId = readCheckoutSessionId();
    return checkoutSessionId
      ? { ...legacyInput, checkoutSessionId }
      : legacyInput;
  }, [legacyInput]);

  useEffect(() => {
    if (!currentResults) return;

    const dominantFunction = getFunctionCode(
      currentResults.dominant,
      currentResults.attitude.dominant,
    );
    const viewedKey = `typejung_results_viewed_${currentResults.completedAt}`;

    try {
      if (sessionStorage.getItem(viewedKey)) return;
      AnalyticsEvents.resultsViewed(dominantFunction);
      sessionStorage.setItem(viewedKey, 'true');
    } catch {
      AnalyticsEvents.resultsViewed(dominantFunction);
    }
  }, [currentResults]);

  useEffect(() => {
    if (!currentResults || !inboundSharedResultSlug) return;

    trackEvent('inbound_shared_result_prompt_viewed', {
      source: acquisition?.source || 'unknown',
      shared_result: inboundSharedResultSlug,
      utm_campaign: acquisition?.utmCampaign || 'unknown',
      dominant_function: getFunctionCode(
        currentResults.dominant,
        currentResults.attitude.dominant,
      ),
    });
  }, [
    acquisition?.source,
    acquisition?.utmCampaign,
    currentResults,
    inboundSharedResultSlug,
  ]);

  const offerRef = useOfferImpression<HTMLElement>({
    impressionKey: currentResults ? `${currentResults.completedAt}_${intendedTier}_${upgradeContext?.category || 'default'}` : null,
    enabled: Boolean(currentResults) && !premiumLoading && !isPremium && resultView === 'report',
    onImpression: () => {
      if (!currentResults) return;
      trackEvent('result_upgrade_offer_viewed', {
        source: acquisition?.source || 'unknown',
        intended_tier: intendedTier,
        context_category: upgradeContext?.category || 'default',
        has_context: Boolean(upgradeContext),
        dominant_function: getFunctionCode(
          currentResults.dominant,
          currentResults.attitude.dominant,
        ),
        has_upgrade_intent: Boolean(upgradeIntent),
        ...(acquisition?.parentSource
          ? { parent_source: acquisition.parentSource }
          : {}),
        ...(acquisition?.utmCampaign
          ? { utm_campaign: acquisition.utmCampaign }
          : {}),
        ...(acquisition?.utmSource ? { utm_source: acquisition.utmSource } : {}),
        ...(acquisition?.sourceChain
          ? { source_chain: acquisition.sourceChain }
          : {}),
      });
      const previewPayload = {
        source: acquisition?.source || 'unknown',
        preview_source: 'results_locked_preview',
        intended_tier: intendedTier,
        tier: intendedTier,
        value: PRICING[intendedTier].amount,
        currency: PRICING[intendedTier].currency,
        dominant_function: getFunctionCode(
          currentResults.dominant,
          currentResults.attitude.dominant,
        ),
        inferior_function: getFunctionCode(
          currentResults.inferior,
          currentResults.hierarchy.find((item) => item.position === 'inferior')
            ?.attitude ?? 'extraverted',
        ),
        reliability: currentResults.reliability.label,
        has_upgrade_intent: Boolean(upgradeIntent),
        context_category: upgradeContext?.category || 'default',
        ...(acquisition?.parentSource
          ? { parent_source: acquisition.parentSource }
          : {}),
        ...(acquisition?.utmCampaign
          ? { utm_campaign: acquisition.utmCampaign }
          : {}),
        ...(acquisition?.utmSource ? { utm_source: acquisition.utmSource } : {}),
        ...(acquisition?.sourceChain
          ? { source_chain: acquisition.sourceChain }
          : {}),
      };

      trackEvent('results_premium_preview_viewed', previewPayload);
      trackEvent('result_locked_preview_viewed', previewPayload);
      if (upgradeContext) {
        trackEvent('result_upgrade_context_viewed', {
          source: acquisition?.source || 'unknown',
          context_category: upgradeContext.category,
          intended_tier: intendedTier,
          dominant_function: getFunctionCode(
            currentResults.dominant,
            currentResults.attitude.dominant,
          ),
          ...(acquisition?.parentSource
            ? { parent_source: acquisition.parentSource }
            : {}),
          ...(acquisition?.utmCampaign
            ? { utm_campaign: acquisition.utmCampaign }
            : {}),
          ...(acquisition?.utmSource ? { utm_source: acquisition.utmSource } : {}),
          ...(acquisition?.sourceChain
            ? { source_chain: acquisition.sourceChain }
            : {}),
        });
      }
    },
  });

  useEffect(() => {
    if (!currentResults) return;

    const trackedKey = `${currentResults.completedAt}_${shareSlug || 'no_share_slug'}`;
    if (referralPromptTrackedRef.current === trackedKey) return;
    referralPromptTrackedRef.current = trackedKey;

    trackEvent('result_referral_prompt_viewed', {
      source: 'results_page',
      dominant_function: getFunctionCode(
        currentResults.dominant,
        currentResults.attitude.dominant,
      ),
      has_share_slug: Boolean(shareSlug),
      invite_goal: REFERRAL_INVITE_GOAL,
    });
  }, [currentResults, shareSlug]);

  const lifecycleEmailSummary = useMemo(() => {
    if (!currentResults) return null;

    return {
      dominantLabel: `${ATTITUDE_LABELS[currentResults.attitude.dominant]} ${FUNCTION_LABELS[currentResults.dominant]}`,
      inferiorLabel: `${ATTITUDE_LABELS[currentResults.hierarchy.find((item) => item.position === 'inferior')?.attitude ?? 'extraverted']} ${FUNCTION_LABELS[currentResults.inferior]}`,
    };
  }, [currentResults]);

  useEffect(() => {
    if (!currentResults || shareSlug) return;

    try {
      const savedPublicSlug = localStorage.getItem(
        `${PUBLIC_SHARE_SLUG_PREFIX}${currentResults.completedAt}`,
      );
      if (savedPublicSlug) {
        setShareSlug(savedPublicSlug);
      }
    } catch {
      // Share links are helpful but should never block the result page.
    }
  }, [currentResults, shareSlug]);

  useEffect(() => {
    if (!currentResults || !legacyInput || authLoading) return;

    if (!isAuthenticated) {
      setSaveState('skipped');
      return;
    }

    const savedKey = `jungian_depth_saved_${currentResults.completedAt}`;
    const savedSlug = localStorage.getItem(`${savedKey}_share_slug`);
    if (localStorage.getItem(savedKey)) {
      setSaveState('saved');
      setShareSlug(savedSlug);
      return;
    }

    let cancelled = false;
    setSaveState('saving');

    fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(legacyInput),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.message || 'Failed to save result');
        }
        return response.json();
      })
      .then((saved) => {
        if (cancelled) return;
        localStorage.setItem(savedKey, 'true');
        if (saved?.shareSlug) {
          localStorage.setItem(`${savedKey}_share_slug`, saved.shareSlug);
          localStorage.setItem(
            'jungian_assessment_share_slug',
            saved.shareSlug,
          );
          setShareSlug(saved.shareSlug);
        }
        AnalyticsEvents.resultSaved(
          'auto_save_after_result',
          Boolean(saved?.shareSlug),
        );
        setSaveState('saved');
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Failed to save depth result:', error);
        setSaveState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, currentResults, isAuthenticated, legacyInput]);

  useEffect(() => {
    if (!legacyInput || freeAnalysis || freeError || isLoadingFree) return;
    fetchFreeAnalysis(legacyInput);
  }, [fetchFreeAnalysis, freeAnalysis, freeError, isLoadingFree, legacyInput]);

  useEffect(() => {
    if (
      !premiumAnalysisInput ||
      !isPremium ||
      premiumLoading ||
      premiumAnalysis ||
      premiumError ||
      isLoadingPremium
    )
      return;
    if (!isAuthenticated && !premiumAnalysisInput.checkoutSessionId) return;
    fetchPremiumAnalysis(premiumAnalysisInput);
  }, [
    fetchPremiumAnalysis,
    isAuthenticated,
    isLoadingPremium,
    isPremium,
    premiumAnalysis,
    premiumAnalysisInput,
    premiumError,
    premiumLoading,
  ]);

  useEffect(() => {
    if (
      !currentResults ||
      !lifecycleEmailSummary ||
      authLoading ||
      !user?.email
    )
      return;

    const attemptKey = `${RESULT_READY_EMAIL_ATTEMPT_PREFIX}${currentResults.completedAt}`;
    if (localStorage.getItem(attemptKey)) return;

    void postLifecycleEmail({
      lifecycle: 'result-ready',
      idempotencyKey: attemptKey,
      completedAt: currentResults.completedAt,
      dominantLabel: lifecycleEmailSummary.dominantLabel,
      inferiorLabel: lifecycleEmailSummary.inferiorLabel,
    }).then((ok) => {
      if (ok) {
        localStorage.setItem(attemptKey, new Date().toISOString());
      }
    });
  }, [authLoading, currentResults, lifecycleEmailSummary, user?.email]);

  useEffect(() => {
    if (
      !currentResults ||
      !lifecycleEmailSummary ||
      authLoading ||
      premiumLoading ||
      !user?.email
    )
      return;

    const dueKey = `${UPGRADE_EMAIL_DUE_PREFIX}${currentResults.completedAt}`;
    const attemptKey = `${UPGRADE_EMAIL_ATTEMPT_PREFIX}${currentResults.completedAt}`;

    if (isPremium) {
      localStorage.removeItem(dueKey);
      return;
    }

    if (localStorage.getItem(attemptKey)) return;

    const savedDueAt = Number(localStorage.getItem(dueKey));
    const dueAt =
      Number.isFinite(savedDueAt) && savedDueAt > 0
        ? savedDueAt
        : Date.now() + UPGRADE_EMAIL_DELAY_MS;

    if (!Number.isFinite(savedDueAt) || savedDueAt <= 0) {
      localStorage.setItem(dueKey, String(dueAt));
    }

    const timer = window.setTimeout(
      () => {
        if (localStorage.getItem('jungian_assessment_unlocked') === 'true')
          return;
        if (localStorage.getItem(attemptKey)) return;

        void postLifecycleEmail({
          lifecycle: 'free-result-upgrade',
          idempotencyKey: attemptKey,
          completedAt: currentResults.completedAt,
          dominantLabel: lifecycleEmailSummary.dominantLabel,
          inferiorLabel: lifecycleEmailSummary.inferiorLabel,
        }).then((ok) => {
          if (ok) {
            localStorage.setItem(attemptKey, new Date().toISOString());
          }
        });
      },
      Math.max(0, dueAt - Date.now()),
    );

    return () => window.clearTimeout(timer);
  }, [
    authLoading,
    currentResults,
    isPremium,
    lifecycleEmailSummary,
    premiumLoading,
    user?.email,
  ]);

  const downloadResults = useCallback(() => {
    if (state.status !== 'ready') return;
    const blob = new Blob([JSON.stringify(state.results, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `typejung-function-stack-map-${state.results.completedAt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const ensureShareSlug = useCallback(
    async (source = 'results_share_card'): Promise<string | null> => {
      if (shareSlug) return shareSlug;
      if (!legacyInput || !currentResults) return null;

      setShareLinkState('creating');

      try {
        const response = await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...legacyInput,
            shareOnly: true,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.message || 'Failed to create share link');
        }

        const saved = await response.json();
        if (!saved?.shareSlug) {
          throw new Error('Share link was not returned');
        }

        localStorage.setItem(
          `${PUBLIC_SHARE_SLUG_PREFIX}${currentResults.completedAt}`,
          saved.shareSlug,
        );
        localStorage.setItem('jungian_assessment_share_slug', saved.shareSlug);
        setShareSlug(saved.shareSlug);
        setShareLinkState('idle');
        AnalyticsEvents.resultSaved('public_compare_link_created', true);
        trackEvent('result_compare_link_created', {
          source,
          signed_in: Boolean(isAuthenticated),
        });
        return saved.shareSlug;
      } catch (error) {
        console.error('Failed to create share link:', error);
        setShareLinkState('error');
        trackEvent('result_compare_link_failed', {
          source,
          signed_in: Boolean(isAuthenticated),
        });
        return null;
      }
    },
    [currentResults, isAuthenticated, legacyInput, shareSlug],
  );

  const buildInviteUrls = useCallback(
    (location: InviteShareLocation, slug: string | null) => {
      if (typeof window === 'undefined') {
        return { assessmentUrl: '', sharedResultUrl: null as string | null };
      }

      const inviteSource = inviteSourceByLocation[location];
      const assessmentPath = pathWithSource('/assessment', inviteSource, {
        ref: 'result_share',
        utm_campaign: REFERRAL_INVITE_CAMPAIGN,
        compare: slug,
      });
      const sharedResultPath = slug
        ? pathWithSource(`/share/${slug}`, inviteSource, {
          ref: 'result_share',
          utm_campaign: REFERRAL_INVITE_CAMPAIGN,
        })
        : null;

      return {
        assessmentUrl: `${window.location.origin}${assessmentPath}`,
        sharedResultUrl: sharedResultPath
          ? `${window.location.origin}${sharedResultPath}`
          : null,
      };
    },
    [],
  );

  const shareAssessmentInvite = useCallback(
    async (location: InviteShareLocation = 'results_invite_card') => {
      if (typeof window === 'undefined') return;

      const nextShareSlug =
        shareSlug ?? (await ensureShareSlug(`invite_${location}`));
      const { assessmentUrl, sharedResultUrl } = buildInviteUrls(
        location,
        nextShareSlug,
      );
      const url = sharedResultUrl ?? assessmentUrl;
      const axisText = lifecycleEmailSummary
        ? `My TypeJung map came out as ${lifecycleEmailSummary.dominantLabel} with ${lifecycleEmailSummary.inferiorLabel} as the growth edge.`
        : 'I just mapped my Jungian function-stack pattern with TypeJung.';
      const text = sharedResultUrl
        ? `${axisText} Compare your map with mine here: ${url}`
        : `${axisText} Take the free assessment and compare your map with mine: ${url}`;

      try {
        if (navigator.share) {
          await navigator.share({
            title: 'Compare TypeJung maps',
            text,
            url,
          });
          trackEvent('assessment_invite_shared', {
            source: location,
            method: 'native',
            invite_source: inviteSourceByLocation[location],
            has_share_slug: Boolean(nextShareSlug),
            invite_goal: REFERRAL_INVITE_GOAL,
          });
          return;
        }

        await navigator.clipboard.writeText(text);
        setInviteCopied(true);
        window.setTimeout(() => setInviteCopied(false), 2400);
        trackEvent('assessment_invite_shared', {
          source: location,
          method: 'copy',
          invite_source: inviteSourceByLocation[location],
          has_share_slug: Boolean(nextShareSlug),
          invite_goal: REFERRAL_INVITE_GOAL,
        });
      } catch (error) {
        console.error('Failed to share assessment invite:', error);
      }
    },
    [buildInviteUrls, ensureShareSlug, lifecycleEmailSummary, shareSlug],
  );

  const copyReturnCompareReply = useCallback(async () => {
    if (typeof window === 'undefined' || !inboundSharedResultSlug) return;

    const nextShareSlug =
      shareSlug ?? (await ensureShareSlug('inbound_result_reply'));
    if (!nextShareSlug) return;

    const ownSharePath = pathWithSource(
      `/share/${nextShareSlug}`,
      'inbound_result_reply',
      {
        ref: 'shared_result_reply',
        utm_campaign: REFERRAL_INVITE_CAMPAIGN,
        parent_source: acquisition?.source || 'shared_result_cta',
        shared_result: inboundSharedResultSlug,
      },
    );
    const originalSharePath = pathWithSource(
      `/share/${inboundSharedResultSlug}`,
      'result_reply_original',
      {
        ref: 'shared_result_reply',
        utm_campaign: REFERRAL_INVITE_CAMPAIGN,
      },
    );
    const ownShareUrl = `${window.location.origin}${ownSharePath}`;
    const originalShareUrl = `${window.location.origin}${originalSharePath}`;
    const axisText = lifecycleEmailSummary
      ? `I took TypeJung too. My map came out as ${lifecycleEmailSummary.dominantLabel} to ${lifecycleEmailSummary.inferiorLabel}.`
      : 'I took TypeJung too and made my own function-stack map.';
    const text = `${axisText} Here is mine so we can compare both maps: ${ownShareUrl}\n\nYour original map: ${originalShareUrl}`;

    try {
      await navigator.clipboard.writeText(text);
      setReturnCopied(true);
      window.setTimeout(() => setReturnCopied(false), 2400);
      trackEvent('inbound_shared_result_reply_copied', {
        source: acquisition?.source || 'unknown',
        shared_result: inboundSharedResultSlug,
        reply_share_slug: nextShareSlug,
        utm_campaign: REFERRAL_INVITE_CAMPAIGN,
      });
    } catch (error) {
      console.error('Failed to copy shared-result reply:', error);
    }
  }, [
    acquisition?.source,
    ensureShareSlug,
    inboundSharedResultSlug,
    lifecycleEmailSummary,
    shareSlug,
  ]);

  const openInboundSharedResult = useCallback(() => {
    if (typeof window === 'undefined' || !inboundSharedResultSlug) return;

    const originalSharePath = pathWithSource(
      `/share/${inboundSharedResultSlug}`,
      'result_reply_original',
      {
        ref: 'shared_result_reply',
        utm_campaign: REFERRAL_INVITE_CAMPAIGN,
      },
    );
    trackEvent('inbound_shared_result_original_opened', {
      source: acquisition?.source || 'unknown',
      shared_result: inboundSharedResultSlug,
    });
    window.location.href = originalSharePath;
  }, [acquisition?.source, inboundSharedResultSlug]);

  if (state.status === 'loading') {
    return (
      <div className="min-h-[60vh] bg-jung-base px-4 py-20">
        <div className="editorial-container">
          <div className="card-premium mx-auto max-w-xl p-8 text-center">
            <div className="mx-auto h-12 w-12 animate-pulse rounded-lg bg-jung-accent-light" />
            <p className="mt-5 text-sm font-semibold text-jung-muted">
              Loading results
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'no-results') {
    return (
      <div className="min-h-[60vh] bg-jung-base px-4 py-20">
        <div className="editorial-container">
          <div className="card-premium mx-auto max-w-xl p-8 text-center">
            <h1 className="text-heading text-3xl text-jung-dark">
              No function-stack map yet
            </h1>
            <p className="mt-3 text-sm leading-6 text-jung-secondary">
              Complete the assessment first, then your result will appear here.
            </p>
            <Button
              className="mt-6"
              variant="accent"
              onClick={() => navigate('/assessment')}
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Start assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'legacy') {
    return (
      <div className="min-h-[60vh] bg-jung-base px-4 py-20">
        <div className="editorial-container">
          <div className="card-premium mx-auto max-w-xl p-8 text-center">
            <h1 className="text-heading text-3xl text-jung-dark">
              Retake for the new function-stack map
            </h1>
            <p className="mt-3 text-sm leading-6 text-jung-secondary">
              Your saved result was created with the older 8-function scorer.
              The redesigned flow uses the new 42-question depth model.
            </p>
            <Button
              className="mt-6"
              variant="accent"
              onClick={() => navigate('/assessment')}
              rightIcon={<RefreshCcw className="h-5 w-5" />}
            >
              Retake assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { results } = state;
  const inboundOriginalShareUrl =
    inboundSharedResultSlug && typeof window !== 'undefined'
      ? `${window.location.origin}${pathWithSource(
        `/share/${inboundSharedResultSlug}`,
        'result_reply_original',
        {
          ref: 'shared_result_reply',
          utm_campaign: REFERRAL_INVITE_CAMPAIGN,
        },
      )}`
      : null;
  const isPreparingReferral = shareLinkState === 'creating' && !shareSlug;
  // Plain const (not a hook) — this runs after the early returns above, so it
  // must not be useMemo. readAssessmentIntent is a cheap localStorage read.
  const resultIntent = readAssessmentIntent();
  const intentFraming = resultIntent
    ? INTENT_RESULT_FRAMING[resultIntent.id]
    : null;
  const dominantLabel =
    lifecycleEmailSummary?.dominantLabel ??
    `${ATTITUDE_LABELS[results.attitude.dominant]} ${FUNCTION_LABELS[results.dominant]}`;
  const inferiorLabel =
    lifecycleEmailSummary?.inferiorLabel ??
    `${ATTITUDE_LABELS[results.hierarchy.find((item) => item.position === 'inferior')?.attitude ?? 'extraverted']} ${FUNCTION_LABELS[results.inferior]}`;
  const chatProfile = legacyInput
    ? {
      dominantFunction: legacyInput.stack.dominant.function,
      auxiliaryFunction: legacyInput.stack.auxiliary.function,
      tertiaryFunction: legacyInput.stack.tertiary.function,
      inferiorFunction: legacyInput.stack.inferior.function,
      scores: legacyInput.scores.map((score) => ({
        function: score.function,
        score: score.score,
      })),
      attitudeScore: legacyInput.attitudeScore,
    }
    : null;
  const functionStackCodes = results.hierarchy.map((item) =>
    getFunctionCode(item.channel, item.attitude),
  );
  const allFunctionScores = legacyInput
    ? [...legacyInput.scores].sort((left, right) => right.score - left.score)
    : [];
  const premiumReportSections = premiumAnalysis
    ? premiumReportSectionConfig
      .map((section) => ({
        ...section,
        body: premiumAnalysis[section.key],
      }))
      .filter((section) => Boolean(section.body && section.body.trim()))
    : [];
  const hasMasteryAccess = tier === 'mastery';

  return (
    <div className="studio-results min-h-screen bg-jung-base pb-16">
      <div className="editorial-container">
        <header className="studio-results-title">
          <div>
            <p className="journey-eyebrow">Your TypeJung map · {formatDate(results.completedAt)}</p>
            <h1>A clearer view of your pattern.</h1>
          </div>
          <p>Your result is a starting point for reflection. Compare what you read with what you notice in everyday life.</p>
        </header>
        <ResultNavigation value={resultView} onChange={selectResultView} isPremium={isPremium} />
        <div role="tabpanel" id="result-panel-overview" aria-labelledby="result-tab-overview" tabIndex={0} hidden={resultView !== 'overview'} className="studio-result-panel">
          <div className="studio-result-overview">
            <div className="studio-result-summary">
              <p className="journey-eyebrow mb-3">Your leading pattern</p>
              <h2>{dominantLabel}.</h2>
              <p className="mt-5 text-sm leading-7 text-jung-secondary">
                {results.narrative.energyMap}
              </p>
            </div>
            <PatternLens items={results.hierarchy.map(item => ({ code: getFunctionCode(item.channel, item.attitude), role: positionLabels[item.position] }))} />
            <div className="studio-result-reflection">
              <p className="journey-eyebrow">A place to start</p>
              <h3 className="mt-2">Notice your growth edge.</h3>
              <p>
                {results.narrative.developmentalEdge}
              </p>
            </div>
          </div>
          <div className="studio-result-next">
            <button type="button" onClick={() => selectResultView('map', true)}>
              <span>
                <strong>Explore your function map</strong>
                <span>All eight functions, your stack, and the signals behind it.</span>
              </span>
              <ArrowRight />
            </button>
            <button type="button" onClick={() => selectResultView('report', true)}>
              <span>
                <strong>
                  {isPremium ? 'Open your personal report' : 'See your pattern in everyday life'}
                </strong>
                <span>
                  {isPremium ? 'Your full interpretation is here.' : 'Explore a sample of the optional Insight report · ' + paidTierPrice('insight') + ' once.'}
                </span>
              </span>
              <ArrowRight />
            </button>
          </div>
          <div className="mt-8">
            {' '}
            <div className="rounded-lg border border-jung-border bg-jung-surface p-6">
              <p className="text-label">First read</p>
              <h2 className="mt-3 text-2xl font-semibold text-jung-dark">
                What to notice this week
              </h2>
              {isLoadingFree ? (
                <div className="mt-5 flex items-center gap-3 text-sm text-jung-secondary">
                  <Loader2 className="h-4 w-4 animate-spin text-jung-accent" />
                  Preparing your introductory interpretation.
                </div>
              ) : freeAnalysis ? (
                <p className="mt-4 text-sm leading-7 text-jung-secondary">
                  {freeAnalysis}
                </p>
              ) : (
                <p className="mt-4 text-sm leading-7 text-jung-secondary">
                  {freeError
                    ? `What to notice this week unavailable: ${freeError}`
                    : 'A short synthesis will appear here when it is ready.'}
                </p>
              )}
            </div>
            <div className="mt-5">
              <ResultReaction completedAt={results.completedAt} />
            </div>
          </div>

        </div>
        <div role="tabpanel" id="result-panel-map" aria-labelledby="result-tab-map" tabIndex={0} hidden={resultView !== 'map'} className="studio-result-panel">
          <div id="free-map">
            <p className="journey-eyebrow">The full picture</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">Your eight-function view.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-jung-secondary">These values are derived from four function channels and your attention direction. They help you compare the pattern; they are not eight independent psychological measurements.</p>
          </div>
          <div className="studio-eight-map">
            {allFunctionScores.map(score => <div key={score.function}>
              <div className="studio-eight-symbol">
                <FunctionEmblem code={score.function} />
              </div>
              <div>
                <div className="studio-eight-label">
                  <span>
                    <strong>
                      {score.function}
                    </strong>
                    {({ Ti: 'Introverted Thinking', Te: 'Extraverted Thinking', Ni: 'Introverted Intuition', Ne: 'Extraverted Intuition', Si: 'Introverted Sensation', Se: 'Extraverted Sensation', Fi: 'Introverted Feeling', Fe: 'Extraverted Feeling' } as Record<string, string>)[score.function]}
                  </span>
                  <strong>{score.score}%</strong>
                </div>
                <div className="studio-eight-track">
                  <span style={{ width: `${score.score}%` }} />
                </div>
              </div>
            </div>)}
          </div>
          <section className="mt-9">
            <p className="journey-eyebrow mb-4">How the leading functions fit together</p>
            <Hierarchy results={results} />
          </section>
          <details className="mt-8 rounded-xl border border-jung-border bg-white p-5 sm:p-6">
            <summary className="cursor-pointer text-sm font-semibold">How this map was formed · scoring and consistency</summary>
            <div className="mt-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
                <EnergyBars results={results} />

                <div className="grid gap-6">
                  <div className="card-premium p-6 sm:p-8">
                    <div className="mb-5 flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-jung-accent-light text-jung-accent">
                        <ShieldCheck className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-label">Answer consistency signal</p>
                        <h2 className="text-2xl font-semibold text-jung-dark">
                          {results.reliability.label}
                        </h2>
                      </div>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-jung-border-light">
                      <div
                        className="h-full rounded-full bg-jung-accent"
                        style={{ width: `${results.reliability.score}%` }}
                      />
                    </div>
                    <div className="mt-5 space-y-3">
                      {results.reliability.notes.map((note) => (
                        <p
                          key={note}
                          className="text-sm leading-6 text-jung-secondary"
                        >
                          {note}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="card-premium p-6 sm:p-8">
                    <p className="text-label">Attitude</p>
                    <h2 className="mt-2 text-2xl font-semibold text-jung-dark">
                      {(results.attitude.balanced ??
                        Math.abs(
                          results.attitude.introverted - results.attitude.extraverted,
                        ) <= 6)
                        ? 'Balanced direction'
                        : `${ATTITUDE_LABELS[results.attitude.dominant]} direction`}
                    </h2>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-jung-border bg-jung-surface p-4">
                        <p className="text-sm text-jung-muted">Introverted</p>
                        <p className="mt-2 text-3xl font-semibold text-jung-dark">
                          {results.attitude.introverted}%
                        </p>
                      </div>
                      <div className="rounded-lg border border-jung-border bg-jung-surface p-4">
                        <p className="text-sm text-jung-muted">Extraverted</p>
                        <p className="mt-2 text-3xl font-semibold text-jung-dark">
                          {results.attitude.extraverted}%
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-jung-secondary">
                      {results.attitude.summary}
                    </p>
                  </div>
                </div>
              </div>

              <section className="mt-6">
                <SignalGrid results={results} />
              </section>
            </div>
          </details>
          <section className="mt-8 grid gap-3">
            {[
              [
                'How to read this result',
                'The percentages are not fixed traits. They are a map of where this assessment found habitual energy, stress vulnerability, body signal, and attitude direction.',
              ],
              [
                'Why the inferior matters',
                'The inferior function is usually less differentiated, so it often appears through stress, projection, attraction, embarrassment, or body symptoms before it becomes conscious skill.',
              ],
              [
                'What to do next',
                'Use the developmental edge as a practice target, then reassess later. The goal is not to change labels but to see whether energy distribution becomes more flexible.',
              ],
            ].map(([title, body]) => (
              <details
                key={title}
                className="rounded-lg border border-jung-border bg-jung-surface p-5"
              >
                <summary className="flex min-h-11 cursor-pointer list-none items-center text-base font-semibold text-jung-dark">
                  {title}
                </summary>
                <p className="mt-3 text-sm leading-6 text-jung-secondary">
                  {body}
                </p>
              </details>
            ))}
          </section>

        </div>
        <div role="tabpanel" id="result-panel-report" aria-labelledby="result-tab-report" tabIndex={0} hidden={resultView !== 'report'} className="studio-result-panel">
          {isPremium && (
            <section
              id="premium-report"
              className="mt-8 rounded-lg border border-jung-accent-muted bg-jung-surface p-5 shadow-sm sm:p-6"
            >
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-label">Unlocked report</p>
                  <h2 className="mt-2 text-heading text-3xl text-jung-dark">
                    Your full {tier || 'Premium'} interpretation
                  </h2>
                </div>
                <span className="w-fit rounded-lg bg-jung-accent-light px-3 py-2 text-xs font-semibold text-jung-accent">
                  Purchase saved
                </span>
              </div>

              {isLoadingPremium && (
                <div className="flex items-center gap-3 rounded-lg border border-jung-border bg-jung-base p-4 text-sm text-jung-secondary">
                  <Loader2 className="h-4 w-4 animate-spin text-jung-accent" />
                  Generating the full premium report.
                </div>
              )}

              {!isLoadingPremium && premiumError && (
                <div
                  role="alert"
                  className="rounded-lg border border-jung-border bg-jung-base p-5 text-sm leading-6 text-jung-secondary"
                >
                  <h3 className="text-base font-semibold text-jung-dark">
                    Your report could not be completed yet
                  </h3>
                  <p className="mt-2">
                    {premiumError}
                  </p>
                  <p className="mt-2">
                    You do not need to buy again or retake the assessment. Your
                    free map and Type Depth Guide are still available.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button
                      variant="accent"
                      disabled={!premiumAnalysisInput}
                      onClick={() =>
                        premiumAnalysisInput &&
                        fetchPremiumAnalysis(premiumAnalysisInput)
                      }
                      leftIcon={<RefreshCcw className="h-4 w-4" />}
                    >
                      Try my report again
                    </Button>
                    <a
                      className="inline-flex min-h-11 items-center px-2 font-semibold text-jung-accent hover:underline"
                      href={`mailto:${SUPPORT_EMAIL}?subject=Help%20with%20my%20paid%20TypeJung%20report`}
                    >
                      Get help or request a refund
                    </a>
                  </div>
                </div>
              )}

              {!isLoadingPremium &&
                !premiumError &&
                premiumReportSections.length > 0 && (
                  <PersonalReportReader sections={premiumReportSections} functionCodes={functionStackCodes} />
                )}

              {!isLoadingPremium &&
                !premiumError &&
                premiumReportSections.length === 0 && (
                  <p className="rounded-lg border border-jung-border bg-jung-base p-4 text-sm leading-6 text-jung-secondary">
                    Your paid access is active. The full report will appear here
                    when the analysis is available.
                  </p>
                )}
            </section>
          )}

          {!premiumLoading && !isPremium && (
            <>
              <p className="journey-eyebrow mb-5">Your free map is complete · Optional depth</p>
              {intentFraming && (
                <p className="mb-5 rounded-lg border border-jung-accent-muted bg-jung-accent-light/70 px-4 py-3 text-sm leading-6 text-jung-dark">
                  {intentFraming.line}
                </p>
              )}
              <LockedPremiumPreview
                results={results}
                offerRef={offerRef}
                inferiorLabel={inferiorLabel}
                intendedTier={intendedTier}
                onUnlock={openUpgradeCheckout}
                onViewSampleReport={viewSampleReport}
                checkoutOpeningTier={checkoutOpeningTier}
                checkoutError={checkoutError}
              />
            </>
          )}

          {premiumLoading && <p role="status" className="py-8 text-sm text-jung-secondary">Checking your report access…</p>}
        </div>
        <div role="tabpanel" id="result-panel-save" aria-labelledby="result-tab-save" tabIndex={0} hidden={resultView !== 'save'} className="studio-result-panel">
          <div id="save-share" className="scroll-mt-28">
            <p className="journey-eyebrow mb-3">Keep the conversation going</p>
            <h2 className="mb-6 font-display text-3xl">Save it. Share it. Come back to it.</h2>
          </div>
          {inboundSharedResultSlug && (
            <section className="mb-8 overflow-hidden rounded-lg border border-jung-accent-muted bg-jung-accent-light/70 shadow-sm">
              <div className="grid gap-0 lg:grid-cols-[1fr_26rem]">
                <div className="p-5 sm:p-6">
                  <p className="text-label">Reply to the shared map</p>
                  <h2 className="mt-2 text-2xl font-semibold text-jung-dark">
                    Send your map back while the comparison is fresh.
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-jung-secondary">
                    You arrived from someone else's TypeJung result. Share your
                    own map back so both dominant-inferior axes can sit in the
                    same conversation.
                  </p>
                </div>
                <div className="border-t border-jung-accent-muted bg-jung-surface p-5 sm:p-6 lg:border-l lg:border-t-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-jung-dark">
                    <Share2 className="h-4 w-4 text-jung-accent" />
                    Return-share prompt
                  </div>
                  <p className="mt-3 text-sm leading-6 text-jung-secondary">
                    This creates your compare page and copies a reply that
                    includes both maps.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Button
                      variant="accent"
                      className="w-full"
                      onClick={copyReturnCompareReply}
                      disabled={isPreparingReferral}
                      leftIcon={
                        isPreparingReferral ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : returnCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )
                      }
                    >
                      {isPreparingReferral
                        ? 'Preparing reply'
                        : returnCopied
                          ? 'Reply copied'
                          : 'Copy reply'}
                    </Button>
                    {inboundOriginalShareUrl && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={openInboundSharedResult}
                        leftIcon={<Link2 className="h-4 w-4" />}
                      >
                        Open their map
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="mt-8 grid gap-5 lg:grid-cols-2 lg:items-start">
            <div className="rounded-xl border border-jung-border bg-jung-surface p-6">
              <p className="journey-eyebrow">Keep your map</p>
              <h2 className="mt-3 font-display text-2xl">
                Come back when you need it.
              </h2>
              <p className="mt-4 text-sm leading-7 text-jung-secondary">
                {isAuthenticated
                  ? saveState === 'saved'
                    ? 'Your result is saved to your account history.'
                    : saveState === 'error'
                      ? 'Your map is saved on this device, but could not be saved to your account yet.'
                      : 'Saving this result to your account history.'
                  : 'Your map is saved in this browser. Sign in to save a copy to your account and access it on another device.'}
              </p>
              <Button
                variant="outline"
                className="mt-5"
                onClick={() => navigate(isAuthenticated ? '/history' : '/auth')}
              >
                {isAuthenticated ? 'Open my history' : 'Sign in to save my map'}
              </Button>
            </div>
            {!isPremium && (
              <div className="rounded-xl border border-jung-border bg-jung-surface p-6">
                <DiscountCaptureCard
                  source="results_save_return_link"
                  dominantLabel={dominantLabel}
                  inferiorLabel={inferiorLabel}
                  preferredTier={intendedTier}
                  compact
                  minimal
                  showCheckoutButtons={false}
                  minimalTitle="Keep a link for later"
                  minimalDescription="Email a summary of your leading pattern and a link to the optional report."
                  minimalSubmitLabel="Email my link"
                  minimalFootnote="By requesting this, you agree to receive the link and follow-up emails about the report. Your complete map stays in this browser unless you save it to an account."
                  minimalSentMessage="Your link and report code are in your inbox. Your complete map is still here on this device."
                />
              </div>
            )}
            {isPremium && (
              <div className="rounded-xl border border-jung-border bg-jung-surface p-6">
                <p className="journey-eyebrow">Your purchase</p>
                <h2 className="mt-3 font-display text-2xl">
                  {PRICING[tier === 'mastery' ? 'mastery' : 'insight'].name}{' '}
                  access
                </h2>
                <p className="mt-4 text-sm leading-7 text-jung-secondary">
                  Use your purchase email when signing in to restore paid access.
                  Keep your Stripe receipt in case you need help.
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-jung-accent underline underline-offset-4"
                >
                  Contact support
                </a>
              </div>
            )}
          </section>
          <section className="my-10 grid items-center gap-7 rounded-2xl border border-jung-border bg-jung-surface p-5 sm:p-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="journey-eyebrow">A conversation worth having</p>
              <h2 className="mt-3 font-display text-3xl">Different patterns.<br />More to understand.</h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-jung-secondary">Share your map with someone you know. Compare how you approach decisions, attention, and stress.</p>
              <Button variant="accent" className="mt-5" onClick={() => shareAssessmentInvite('results_compare_banner')} disabled={isPreparingReferral} leftIcon={<Share2 className="h-4 w-4" />}>
                {isPreparingReferral ? 'Preparing link…' : inviteCopied ? 'Invite copied' : 'Share my map'}
              </Button>
              <p className="mt-3 text-xs leading-6 text-jung-muted">Creates a public result link. Share only if you are comfortable making your map public.</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-jung-border bg-jung-base p-4 sm:p-5">
              <div className="mb-4 flex justify-between gap-3 text-xs text-jung-accent">
                <span className="font-semibold">TypeJung</span>
                <span>My function-stack map</span>
              </div>
              <FunctionStackArtwork items={results.hierarchy.map(item => ({ code: getFunctionCode(item.channel, item.attitude), role: positionLabels[item.position] }))} compact />
              <p className="mt-4 font-display text-xl">
                {dominantLabel}
              </p>
              <p className="mt-2 text-xs text-jung-muted">A pattern to explore. A conversation to begin.</p>
            </div>
          </section>

          <div className="mb-6 flex flex-wrap gap-3">
            <Button variant="outline" onClick={downloadResults} leftIcon={<Download className="h-4 w-4" />}>Export data (JSON)</Button>
            <Button variant="outline" onClick={() => navigate('/assessment')} leftIcon={<RefreshCcw className="h-4 w-4" />}>Retake assessment</Button>
          </div>



        </div>
      </div>
      {isAuthenticated && hasMasteryAccess && chatProfile && <ChatBot userProfile={chatProfile} />}
    </div>
  );
};
