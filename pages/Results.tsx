import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Download, Link2, Loader2, LogIn, RefreshCcw, Save, Share2, ShieldCheck, Sparkles } from 'lucide-react';
import { ChatBot } from '../components/ChatBot';
import { DiscountCaptureCard } from '../components/discount/DiscountCaptureCard';
import { Button } from '../components/ui/Button';
import { ATTITUDE_LABELS, AttitudeDirection, FUNCTION_LABELS, FunctionChannel, depthLayerMeta } from '../data/depthAssessment';
import { PRICING, type PaidTierId } from '../data/pricing';
import { useAiAnalysis } from '../hooks/use-ai-analysis';
import { useAuth } from '../hooks/use-auth';
import { usePremiumStatus } from '../hooks/use-premium-status';
import { AnalyticsEvents } from '../lib/analytics';
import { depthResultToLegacyAnalysisInput } from '../utils/depthCompatibility';
import { DepthAssessmentResult, isDepthAssessmentResult } from '../utils/depthScoring';

const RESULTS_KEY = 'jungian_assessment_results';
const LIFECYCLE_EMAIL_ENDPOINT = '/api/lifecycle-email';
const RESULT_READY_EMAIL_ATTEMPT_PREFIX = 'typejung_lifecycle_email_result_ready_';
const UPGRADE_EMAIL_DUE_PREFIX = 'typejung_lifecycle_email_upgrade_due_';
const UPGRADE_EMAIL_ATTEMPT_PREFIX = 'typejung_lifecycle_email_upgrade_';
const UPGRADE_EMAIL_DELAY_MS = 36 * 60 * 60 * 1000;

const upgradeOptions: Array<{
  tier: PaidTierId;
  label: string;
  description: string;
  features: string[];
  preview: string;
}> = [
  {
    tier: 'insight',
    label: 'Insight',
    description: 'Best when you want the deeper report after the free map feels accurate.',
    features: ['Developmental edge', 'Stress pattern map', 'Somatic practices'],
    preview: 'Unlocks a detailed interpretation of your inferior-function edge, stress triggers, and practice guidance.',
  },
  {
    tier: 'mastery',
    label: 'Mastery',
    description: 'Best when you want the report plus ongoing AI coaching and exercises.',
    features: ['Everything in Insight', 'AI Type Coach', 'Practice roadmap'],
    preview: 'Adds coach questions, tailored exercises, and a roadmap for working with the result over time.',
  },
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

const axisCopy: Record<FunctionChannel, string> = {
  thinking: 'Thinking holds the most conscious energy here. Feeling is the opposite pole and the likely site of value, attachment, shame, or relational development.',
  feeling: 'Feeling holds the most conscious energy here. Thinking is the opposite pole and the likely site of clarity, precision, judgment, or intellectual development.',
  sensation: 'Sensation holds the most conscious energy here. Intuition is the opposite pole and the likely site of meaning, possibility, dread, or symbolic development.',
  intuition: 'Intuition holds the most conscious energy here. Sensation is the opposite pole and the likely site of embodiment, limits, appetite, and concrete follow-through.',
};

const functionCodeByChannel: Record<FunctionChannel, Record<AttitudeDirection, string>> = {
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

const getFunctionCode = (channel: FunctionChannel, attitude: AttitudeDirection) =>
  functionCodeByChannel[channel]?.[attitude] ?? 'unknown';

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
    if (isDepthAssessmentResult(parsed)) return { status: 'ready', results: parsed };
    return { status: 'legacy' };
  } catch {
    return { status: 'no-results' };
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
    return response.ok && !!data && (data.sent === true || data.skipped === true);
  } catch {
    return false;
  }
};

const EnergyBars: React.FC<{ results: DepthAssessmentResult }> = ({ results }) => (
  <div className="card-premium p-6 sm:p-8">
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-label">Energy distribution</p>
        <h2 className="mt-2 text-heading text-3xl text-jung-dark">Your energy map</h2>
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
                <span className="font-semibold text-jung-dark">{item.label}</span>
                {isDominant && <span className="rounded-lg bg-jung-accent px-2 py-1 text-[11px] font-semibold text-white">Dominant</span>}
                {isInferior && <span className="rounded-lg border border-jung-border px-2 py-1 text-[11px] font-semibold text-jung-muted">Inferior</span>}
              </div>
              <span className="font-mono text-sm font-semibold text-jung-muted">{item.score}%</span>
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

const Hierarchy: React.FC<{ results: DepthAssessmentResult }> = ({ results }) => (
  <div className="grid gap-4 lg:grid-cols-4">
    {results.hierarchy.map((item) => (
      <div key={item.position} className={`rounded-lg border p-5 ${item.position === 'dominant' ? 'border-jung-accent-muted bg-jung-accent-light/70' : 'border-jung-border bg-jung-surface'}`}>
        <p className="text-sm font-semibold text-jung-muted">{positionLabels[item.position]}</p>
        <h3 className="mt-3 text-2xl font-semibold text-jung-dark">{item.label}</h3>
        <p className="mt-2 text-sm leading-6 text-jung-secondary">
          {ATTITUDE_LABELS[item.attitude]} channel, {item.score}% of mapped energy.
        </p>
      </div>
    ))}
  </div>
);

const SignalGrid: React.FC<{ results: DepthAssessmentResult }> = ({ results }) => {
  const signals = useMemo(() => ([
    ['behavioral', results.layerSignals.behavioral ? FUNCTION_LABELS[results.layerSignals.behavioral as FunctionChannel] : 'Mixed'],
    ['inferior', results.layerSignals.inferior ? FUNCTION_LABELS[results.layerSignals.inferior as FunctionChannel] : FUNCTION_LABELS[results.inferior]],
    ['somatic', results.layerSignals.somatic ? FUNCTION_LABELS[results.layerSignals.somatic as FunctionChannel] : 'Mixed'],
    ['attitude', ATTITUDE_LABELS[results.attitude.dominant]],
  ] as const), [results]);

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {signals.map(([layer, value]) => {
        const meta = depthLayerMeta[layer as keyof typeof depthLayerMeta];
        return (
          <div key={layer} className="rounded-lg border border-jung-border bg-jung-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-jung-muted">{meta.shortLabel}</p>
            <p className="mt-2 text-lg font-semibold text-jung-dark">{value}</p>
          </div>
        );
      })}
    </div>
  );
};

export const Results: React.FC = () => {
  const navigate = useNavigate();
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
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error' | 'skipped'>('idle');
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const openUpgradeCheckout = useCallback((paidTier: PaidTierId, location: string) => {
    AnalyticsEvents.upgradeClicked(location, paidTier);
    AnalyticsEvents.ctaClicked(`unlock_${paidTier}`, location, {
      buttonText: `Unlock ${PRICING[paidTier].name}`,
      destination: `/checkout/${paidTier}`,
    });
    navigate(`/checkout/${paidTier}`);
  }, [navigate]);

  useEffect(() => {
    setState(readResults());
  }, []);

  const currentResults = state.status === 'ready' ? state.results : null;
  const legacyInput = useMemo(
    () => currentResults ? depthResultToLegacyAnalysisInput(currentResults) : null,
    [currentResults],
  );

  useEffect(() => {
    if (!currentResults) return;

    const dominantFunction = getFunctionCode(currentResults.dominant, currentResults.attitude.dominant);
    const viewedKey = `typejung_results_viewed_${currentResults.completedAt}`;

    try {
      if (sessionStorage.getItem(viewedKey)) return;
      AnalyticsEvents.resultsViewed(dominantFunction);
      sessionStorage.setItem(viewedKey, 'true');
    } catch {
      AnalyticsEvents.resultsViewed(dominantFunction);
    }
  }, [currentResults]);

  const lifecycleEmailSummary = useMemo(() => {
    if (!currentResults) return null;

    return {
      dominantLabel: `${ATTITUDE_LABELS[currentResults.attitude.dominant]} ${FUNCTION_LABELS[currentResults.dominant]}`,
      inferiorLabel: `${ATTITUDE_LABELS[currentResults.hierarchy.find((item) => item.position === 'inferior')?.attitude ?? 'extraverted']} ${FUNCTION_LABELS[currentResults.inferior]}`,
    };
  }, [currentResults]);

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
          localStorage.setItem('jungian_assessment_share_slug', saved.shareSlug);
          setShareSlug(saved.shareSlug);
        }
        AnalyticsEvents.resultSaved('auto_save_after_result', Boolean(saved?.shareSlug));
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
    if (!legacyInput || !isPremium || !isAuthenticated || premiumLoading || premiumAnalysis || premiumError || isLoadingPremium) return;
    fetchPremiumAnalysis(legacyInput);
  }, [fetchPremiumAnalysis, isAuthenticated, isLoadingPremium, isPremium, legacyInput, premiumAnalysis, premiumError, premiumLoading]);

  useEffect(() => {
    if (!currentResults || !lifecycleEmailSummary || authLoading || !user?.email) return;

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
    if (!currentResults || !lifecycleEmailSummary || authLoading || premiumLoading || !user?.email) return;

    const dueKey = `${UPGRADE_EMAIL_DUE_PREFIX}${currentResults.completedAt}`;
    const attemptKey = `${UPGRADE_EMAIL_ATTEMPT_PREFIX}${currentResults.completedAt}`;

    if (isPremium) {
      localStorage.removeItem(dueKey);
      return;
    }

    if (localStorage.getItem(attemptKey)) return;

    const savedDueAt = Number(localStorage.getItem(dueKey));
    const dueAt = Number.isFinite(savedDueAt) && savedDueAt > 0
      ? savedDueAt
      : Date.now() + UPGRADE_EMAIL_DELAY_MS;

    if (!Number.isFinite(savedDueAt) || savedDueAt <= 0) {
      localStorage.setItem(dueKey, String(dueAt));
    }

    const timer = window.setTimeout(() => {
      if (localStorage.getItem('jungian_assessment_unlocked') === 'true') return;
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
    }, Math.max(0, dueAt - Date.now()));

    return () => window.clearTimeout(timer);
  }, [authLoading, currentResults, isPremium, lifecycleEmailSummary, premiumLoading, user?.email]);

  const downloadResults = useCallback(() => {
    if (state.status !== 'ready') return;
    const blob = new Blob([JSON.stringify(state.results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `typejung-energy-map-${state.results.completedAt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const copyShareUrl = useCallback(async () => {
    if (!shareSlug || typeof window === 'undefined') return;

    const url = `${window.location.origin}/share/${shareSlug}`;

    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      AnalyticsEvents.resultsShared('link');
      window.setTimeout(() => setShareCopied(false), 2400);
    } catch (error) {
      console.error('Failed to copy share URL:', error);
    }
  }, [shareSlug]);

  const openShareWindow = useCallback((method: 'twitter' | 'linkedin') => {
    if (!shareSlug || typeof window === 'undefined') return;

    const url = `${window.location.origin}/share/${shareSlug}`;
    const text = 'I mapped my Jungian energy pattern with TypeJung. It shows cognitive functions, inferior-function stress, and a growth edge.';
    const shareUrl = method === 'twitter'
      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
      : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

    AnalyticsEvents.resultsShared(method);
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }, [shareSlug]);

  if (state.status === 'loading') {
    return (
      <div className="min-h-[60vh] bg-jung-base px-4 py-20">
        <div className="editorial-container">
          <div className="card-premium mx-auto max-w-xl p-8 text-center">
            <div className="mx-auto h-12 w-12 animate-pulse rounded-lg bg-jung-accent-light" />
            <p className="mt-5 text-sm font-semibold text-jung-muted">Loading results</p>
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
            <h1 className="text-heading text-3xl text-jung-dark">No energy map yet</h1>
            <p className="mt-3 text-sm leading-6 text-jung-secondary">
              Complete the assessment first, then your result will appear here.
            </p>
            <Button className="mt-6" variant="accent" onClick={() => navigate('/assessment')} rightIcon={<ArrowRight className="h-5 w-5" />}>
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
            <h1 className="text-heading text-3xl text-jung-dark">Retake for the new energy map</h1>
            <p className="mt-3 text-sm leading-6 text-jung-secondary">
              Your saved result was created with the older 8-function scorer. The redesigned flow uses the new 42-question depth model.
            </p>
            <Button className="mt-6" variant="accent" onClick={() => navigate('/assessment')} rightIcon={<RefreshCcw className="h-5 w-5" />}>
              Retake assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { results } = state;
  const shareUrl = shareSlug && typeof window !== 'undefined' ? `${window.location.origin}/share/${shareSlug}` : null;
  const dominantLabel = lifecycleEmailSummary?.dominantLabel ?? `${ATTITUDE_LABELS[results.attitude.dominant]} ${FUNCTION_LABELS[results.dominant]}`;
  const inferiorLabel = lifecycleEmailSummary?.inferiorLabel ?? `${ATTITUDE_LABELS[results.hierarchy.find((item) => item.position === 'inferior')?.attitude ?? 'extraverted']} ${FUNCTION_LABELS[results.inferior]}`;
  const chatProfile = legacyInput ? {
    dominantFunction: legacyInput.stack.dominant.function,
    auxiliaryFunction: legacyInput.stack.auxiliary.function,
    tertiaryFunction: legacyInput.stack.tertiary.function,
    inferiorFunction: legacyInput.stack.inferior.function,
    scores: legacyInput.scores.map((score) => ({ function: score.function, score: score.score })),
    attitudeScore: legacyInput.attitudeScore,
  } : null;

  return (
    <div className="min-h-screen bg-jung-base pb-20">
      <div className="editorial-container py-10 lg:py-16">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={() => navigate('/')} className="justify-start px-0 text-jung-muted hover:text-jung-accent">
            Return home
          </Button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={downloadResults} leftIcon={<Download className="h-4 w-4" />}>
              Download result file
            </Button>
            <Button variant="outline" onClick={() => navigate('/assessment')} leftIcon={<RefreshCcw className="h-4 w-4" />}>
              Retake
            </Button>
          </div>
        </div>

        <section className="mb-10 rounded-lg border border-jung-border bg-jung-dark p-7 text-white shadow-xl sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-white/60">{formatDate(results.completedAt)}</p>
              <h1 className="mt-4 text-display text-5xl text-white sm:text-6xl">Your energy map</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/75">
                {results.narrative.energyMap}
              </p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-5">
              <p className="text-sm font-semibold text-white/60">Dominant-inferior axis</p>
              <p className="mt-3 text-2xl font-semibold">{dominantLabel}</p>
              <p className="my-2 text-sm text-white/45">to</p>
              <p className="text-2xl font-semibold text-jung-subtle">{inferiorLabel}</p>
            </div>
          </div>
        </section>

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
                  <h2 className="text-2xl font-semibold text-jung-dark">{results.reliability.label}</h2>
                </div>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-jung-border-light">
                <div className="h-full rounded-full bg-jung-accent" style={{ width: `${results.reliability.score}%` }} />
              </div>
              <div className="mt-5 space-y-3">
                {results.reliability.notes.map((note) => (
                  <p key={note} className="text-sm leading-6 text-jung-secondary">{note}</p>
                ))}
              </div>
            </div>

            <div className="card-premium p-6 sm:p-8">
              <p className="text-label">Attitude</p>
              <h2 className="mt-2 text-2xl font-semibold text-jung-dark">{ATTITUDE_LABELS[results.attitude.dominant]} direction</h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-jung-border bg-jung-surface p-4">
                  <p className="text-sm text-jung-muted">Introverted</p>
                  <p className="mt-2 text-3xl font-semibold text-jung-dark">{results.attitude.introverted}%</p>
                </div>
                <div className="rounded-lg border border-jung-border bg-jung-surface p-4">
                  <p className="text-sm text-jung-muted">Extraverted</p>
                  <p className="mt-2 text-3xl font-semibold text-jung-dark">{results.attitude.extraverted}%</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-jung-secondary">{results.attitude.summary}</p>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <Hierarchy results={results} />
        </section>

        <section className="mt-8">
          <SignalGrid results={results} />
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3 lg:items-start">
          <div className="rounded-lg border border-jung-border bg-jung-surface p-6">
            <p className="text-label">Account</p>
            <h2 className="mt-3 text-2xl font-semibold text-jung-dark">Save this result</h2>
            <div className="mt-4 text-sm leading-7 text-jung-secondary">
              {authLoading && 'Checking your session.'}
              {!authLoading && !user && 'Sign in to save this result to your history, create a share link, and restore any paid access tied to your email.'}
              {isAuthenticated && saveState === 'saving' && 'Saving this result to your account history.'}
              {isAuthenticated && saveState === 'saved' && 'Saved to your account history.'}
              {isAuthenticated && saveState === 'error' && 'The result is ready, but it could not be saved to your account right now.'}
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {!authLoading && !user && (
                <Button variant="outline" onClick={() => navigate('/auth')} leftIcon={<LogIn className="h-4 w-4" />}>
                  Sign in
                </Button>
              )}
              {isAuthenticated && (
                <Button variant="outline" onClick={() => navigate('/history')} leftIcon={saveState === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}>
                  Open history
                </Button>
              )}
              {shareUrl && (
                <div className="rounded-lg border border-jung-border bg-jung-base p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-jung-dark">
                    <Share2 className="h-4 w-4 text-jung-accent" />
                    Launch-ready share link
                  </div>
                  <a className="mt-3 block break-all text-xs leading-5 text-jung-accent hover:underline" href={shareUrl}>
                    {shareUrl}
                  </a>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <Button variant="outline" size="sm" onClick={copyShareUrl} leftIcon={shareCopied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}>
                      {shareCopied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openShareWindow('twitter')}>
                      Share on X
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openShareWindow('linkedin')}>
                      LinkedIn
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-jung-border bg-jung-surface p-6">
            <p className="text-label">First read</p>
            <h2 className="mt-3 text-2xl font-semibold text-jung-dark">Pattern synthesis</h2>
            {isLoadingFree ? (
              <div className="mt-5 flex items-center gap-3 text-sm text-jung-secondary">
                <Loader2 className="h-4 w-4 animate-spin text-jung-accent" />
                Generating a live synthesis.
              </div>
            ) : freeAnalysis ? (
              <p className="mt-4 text-sm leading-7 text-jung-secondary">{freeAnalysis}</p>
            ) : (
              <p className="mt-4 text-sm leading-7 text-jung-secondary">
                {freeError ? `Pattern synthesis unavailable: ${freeError}` : 'A short synthesis will appear here when it is ready.'}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-jung-border bg-jung-surface p-6">
            <p className="text-label">Paid report</p>
            <h2 className="mt-3 text-2xl font-semibold text-jung-dark">{isPremium ? `${tier} access` : 'Detailed report'}</h2>
            {premiumLoading ? (
              <div className="mt-5 flex items-center gap-3 text-sm text-jung-secondary">
                <Loader2 className="h-4 w-4 animate-spin text-jung-accent" />
                Checking premium status.
              </div>
            ) : isPremium && !isAuthenticated ? (
              <div className="mt-4 text-sm leading-7 text-jung-secondary">
                Your paid status is active for this session. Sign in with the purchase email to save the unlock to your account and use premium report or coach features across devices.
              </div>
            ) : isPremium ? (
              <div className="mt-4 text-sm leading-7 text-jung-secondary">
                {isLoadingPremium && 'Generating premium analysis.'}
                {premiumAnalysis?.overview || premiumAnalysis?.growth || 'Premium status is active. Your deeper report APIs are available.'}
                {premiumError && ` Premium analysis unavailable: ${premiumError}`}
              </div>
            ) : (
              <>
                <p className="mt-4 text-sm leading-7 text-jung-secondary">
                  Unlock only after the free map earns it. Paid access is a one-time CAD purchase handled by Stripe, with no hidden subscription.
                </p>
                <DiscountCaptureCard
                  source="results_paid_report_card"
                  dominantLabel={dominantLabel}
                  inferiorLabel={inferiorLabel}
                  compact
                  className="mt-5"
                />
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ['Pay after value', 'Read your free map first. Upgrade only if it feels worth keeping.'],
                    ['One-time CAD', 'Insight is CA$10 and Mastery is CA$29. No renewal or hidden subscription.'],
                    ['30-day refund', 'If the paid report is not useful, contact support with your Stripe receipt.'],
                  ].map(([label, copy]) => (
                    <div key={label} className="rounded-lg border border-jung-border bg-jung-base p-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-jung-dark">
                        <Check className="h-3.5 w-3.5 text-jung-accent" />
                        {label}
                      </div>
                      <p className="mt-2 text-xs leading-5 text-jung-muted">{copy}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 divide-y divide-jung-border rounded-lg border border-jung-border bg-jung-base">
                  {upgradeOptions.map((option) => (
                    <div key={option.tier} className="p-4">
                      <div className="grid gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-jung-dark">{option.label}</h3>
                            <span className="rounded-lg bg-jung-accent-light px-2 py-1 text-xs font-semibold text-jung-accent">
                              {PRICING[option.tier].price} one-time
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-jung-secondary">{option.description}</p>
                          <div className="mt-3 rounded-lg border border-jung-border bg-jung-surface p-3 text-xs leading-5 text-jung-secondary">
                            {option.preview}
                          </div>
                          <ul className="mt-3 grid gap-2 text-xs text-jung-muted">
                            {option.features.map((feature) => (
                              <li key={feature} className="flex gap-2">
                                <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-jung-accent" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button
                          variant={option.tier === 'insight' ? 'accent' : 'outline'}
                          size="sm"
                          className="w-full"
                          onClick={() => openUpgradeCheckout(option.tier, 'results_paid_report_card')}
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                        >
                          Unlock {option.label}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  className="mt-4"
                  variant="ghost"
                  onClick={() => {
                    AnalyticsEvents.ctaClicked('compare_pricing', 'results_paid_report_card', {
                      buttonText: 'Compare plans',
                      destination: '/pricing',
                    });
                    navigate('/pricing');
                  }}
                  leftIcon={<Sparkles className="h-4 w-4" />}
                >
                  Compare all plans
                </Button>
              </>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="rounded-lg border border-jung-border bg-jung-surface p-6">
            <p className="text-label">Developmental edge</p>
            <h2 className="mt-3 text-2xl font-semibold text-jung-dark">{FUNCTION_LABELS[results.inferior]} asks for development</h2>
            <p className="mt-4 text-sm leading-7 text-jung-secondary">{results.narrative.developmentalEdge}</p>
          </div>

          <div className="rounded-lg border border-jung-border bg-jung-surface p-6">
            <p className="text-label">Complex vulnerability</p>
            <h2 className="mt-3 text-2xl font-semibold text-jung-dark">Where capture is likely</h2>
            <p className="mt-4 text-sm leading-7 text-jung-secondary">{results.narrative.complexVulnerability}</p>
          </div>

          <div className="rounded-lg border border-jung-border bg-jung-surface p-6">
            <p className="text-label">Somatic signal</p>
            <h2 className="mt-3 text-2xl font-semibold text-jung-dark">Where the body speaks</h2>
            <p className="mt-4 text-sm leading-7 text-jung-secondary">{results.narrative.somaticSignature}</p>
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-jung-border bg-jung-surface p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <p className="text-label">Dominant-inferior tension</p>
              <h2 className="mt-3 text-heading text-3xl text-jung-dark">
                {FUNCTION_LABELS[results.dominant]} to {FUNCTION_LABELS[results.inferior]}
              </h2>
              <p className="mt-4 text-sm leading-7 text-jung-secondary">
                {axisCopy[results.dominant]}
              </p>
            </div>
            <div className="rounded-lg border border-jung-border bg-jung-base p-5">
              <p className="text-sm font-semibold text-jung-dark">Practice for this edge</p>
              <p className="mt-3 text-sm leading-7 text-jung-secondary">{results.narrative.practice}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-3">
          {[
            ['How to read this result', 'The percentages are not fixed traits. They are a map of where this assessment found habitual energy, stress vulnerability, body signal, and attitude direction.'],
            ['Why the inferior matters', 'The inferior function is usually less differentiated, so it often appears through stress, projection, attraction, embarrassment, or body symptoms before it becomes conscious skill.'],
            ['What to do next', 'Use the developmental edge as a practice target, then reassess later. The goal is not to change labels but to see whether energy distribution becomes more flexible.'],
          ].map(([title, body]) => (
            <details key={title} className="rounded-lg border border-jung-border bg-jung-surface p-5">
              <summary className="flex min-h-11 cursor-pointer list-none items-center text-base font-semibold text-jung-dark">{title}</summary>
              <p className="mt-3 text-sm leading-6 text-jung-secondary">{body}</p>
            </details>
          ))}
        </section>
      </div>
      {isAuthenticated && isPremium && chatProfile && <ChatBot userProfile={chatProfile} />}
    </div>
  );
};
