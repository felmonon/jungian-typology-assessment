import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BarChart3, CheckCircle2, Compass, Info, Keyboard, Loader2, ShieldCheck, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { DepthLayer, depthLayerMeta, depthQuestions } from '../data/depthAssessment';
import { PAGE_SEO, useSEO } from '../hooks/useSEO';
import { useAssessmentTracking } from '../hooks/useAnalytics';
import { useAuth } from '../hooks/use-auth';
import { AnalyticsEvents } from '../lib/analytics';
import { calculateDepthResults } from '../utils/depthScoring';

const QUESTIONS_PER_PAGE = 1;
const QUESTIONS_PER_MINUTE_ESTIMATE = 7;
const PROGRESS_KEY = 'jungian_depth_assessment_progress';
const HISTORY_KEY = 'jungian_depth_results_history';
const RESULTS_KEY = 'jungian_assessment_results';
const LIFECYCLE_EMAIL_ENDPOINT = '/api/lifecycle-email';
const ABANDONED_EMAIL_DELAY_MS = 30 * 60 * 1000;
const ABANDONED_EMAIL_ATTEMPT_PREFIX = 'typejung_lifecycle_email_abandoned_';

type SavedProgress = {
  answers: Record<string, string>;
  currentPage: number;
  startedAt?: string;
  updatedAt?: string;
};

const layerOrder: DepthLayer[] = ['behavioral', 'inferior', 'somatic', 'attitude'];

type LayerPayoff = {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  body: string;
};

const layerPayoffs: Record<DepthLayer, LayerPayoff> = {
  behavioral: {
    icon: Compass,
    eyebrow: 'Section payoff',
    title: 'This block builds the base map.',
    body: 'These scenarios identify what your attention reaches for first when there is no obvious right answer.',
  },
  inferior: {
    icon: Target,
    eyebrow: 'Section payoff',
    title: 'This block finds the charged edge.',
    body: 'Stress and relationship patterns make the inferior function easier to detect than ordinary preference questions.',
  },
  somatic: {
    icon: ShieldCheck,
    eyebrow: 'Section payoff',
    title: 'This block checks the body signal.',
    body: 'Somatic cues help separate a real pattern from an answer style, especially when two functions look close.',
  },
  attitude: {
    icon: BarChart3,
    eyebrow: 'Final section',
    title: 'This block sets the direction.',
    body: 'The last answers separate Jungian introversion and extraversion from social stereotypes before the free map is generated.',
  },
};

const layerProgress = (answers: Record<string, string>) => layerOrder.map((layer) => {
  const layerQuestions = depthQuestions.filter((question) => question.layer === layer);
  const answered = layerQuestions.filter((question) => answers[question.id]).length;
  return {
    layer,
    answered,
    total: layerQuestions.length,
    complete: answered === layerQuestions.length,
  };
});

const readProgress = (): SavedProgress | null => {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
      currentPage: Number.isFinite(parsed.currentPage) ? parsed.currentPage : 0,
      startedAt: typeof parsed.startedAt === 'string' ? parsed.startedAt : undefined,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : undefined,
    };
  } catch {
    return null;
  }
};

const writeProgress = (answers: Record<string, string>, currentPage: number) => {
  const now = new Date().toISOString();
  const previous = readProgress();
  localStorage.setItem(PROGRESS_KEY, JSON.stringify({
    answers,
    currentPage,
    startedAt: previous?.startedAt || now,
    updatedAt: now,
  }));
};

const countAnswered = (answers: Record<string, string>) => Object.keys(answers).filter((key) => answers[key]).length;

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || ['input', 'textarea', 'select'].includes(tagName);
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

export const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showCompletion, setShowCompletion] = useState(false);
  const [resumedProgress, setResumedProgress] = useState(false);
  const hasLoadedProgressRef = useRef(false);
  const hasTrackedStartRef = useRef(false);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const { trackStart, trackProgress, trackComplete } = useAssessmentTracking();
  const { user, isLoading: authLoading } = useAuth();

  useSEO(PAGE_SEO.assessment);

  const totalPages = Math.ceil(depthQuestions.length / QUESTIONS_PER_PAGE);
  const currentQuestions = depthQuestions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE,
  );

  const totalAnswered = countAnswered(answers);
  const overallProgress = Math.round((totalAnswered / depthQuestions.length) * 100);
  const isPageComplete = currentQuestions.every((question) => answers[question.id]);
  const currentLayer = currentQuestions[0]?.layer ?? 'behavioral';
  const currentLayerMeta = depthLayerMeta[currentLayer];
  const currentLayerPayoff = layerPayoffs[currentLayer];
  const CurrentLayerIcon = currentLayerPayoff.icon;
  const currentLayerProgress = useMemo(() => layerProgress(answers), [answers]);
  const currentLayerStatus = currentLayerProgress.find((item) => item.layer === currentLayer) ?? {
    layer: currentLayer,
    answered: 0,
    total: currentQuestions.length,
    complete: false,
  };
  const questionsRemaining = Math.max(0, depthQuestions.length - totalAnswered);
  const estimatedMinutesRemaining = Math.max(1, Math.ceil(questionsRemaining / QUESTIONS_PER_MINUTE_ESTIMATE));
  const timeRemainingCopy = questionsRemaining === 0
    ? 'Ready now'
    : questionsRemaining <= 3
      ? 'Under 1 min left'
      : `About ${estimatedMinutesRemaining} min left`;
  const isFinalPage = currentPage === totalPages - 1;
  const nextLayer = depthQuestions[(currentPage + 1) * QUESTIONS_PER_PAGE]?.layer;
  const nextStepCopy = !isPageComplete
    ? 'Choose the answer that fits best. Progress saves on this device.'
    : isFinalPage
      ? 'Ready to generate your free map. The full ranking unlock appears after you see it.'
      : `Saved. ${timeRemainingCopy}. Moving to ${nextLayer ? depthLayerMeta[nextLayer].shortLabel.toLowerCase() : 'the next question'}.`;
  const firstQuestionInLayerIndex = depthQuestions.findIndex((question) => question.layer === currentLayer);
  const isLayerIntroPage = currentPage === firstQuestionInLayerIndex && currentPage > 0;

  const pageRange = useMemo(() => {
    const start = currentPage * QUESTIONS_PER_PAGE + 1;
    const end = Math.min((currentPage + 1) * QUESTIONS_PER_PAGE, depthQuestions.length);
      return start === end ? `${start}` : `${start}-${end}`;
  }, [currentPage]);

  useEffect(() => {
    if (hasLoadedProgressRef.current) return;
    const saved = readProgress();
    if (saved) {
      setAnswers(saved.answers);
      const savedPage = Math.max(0, Math.min(saved.currentPage, totalPages - 1));
      const firstUnansweredPage = depthQuestions.findIndex((question) => !saved.answers[question.id]);
      const resumePage = firstUnansweredPage === -1
        ? totalPages - 1
        : saved.answers[depthQuestions[savedPage]?.id]
          ? firstUnansweredPage
          : savedPage;
      setCurrentPage(Math.max(0, Math.min(resumePage, totalPages - 1)));
      setResumedProgress(countAnswered(saved.answers) > 0);
    }
    hasLoadedProgressRef.current = true;
  }, [totalPages]);

  useEffect(() => () => {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!hasTrackedStartRef.current) {
      trackStart();
      hasTrackedStartRef.current = true;
    }
  }, [trackStart]);

  useEffect(() => {
    if (authLoading || !user?.email || showCompletion || totalAnswered === 0 || totalAnswered >= depthQuestions.length) {
      return;
    }

    const progress = readProgress();
    if (!progress) return;

    const startedAt = progress.startedAt || progress.updatedAt || new Date().toISOString();
    const updatedAt = progress.updatedAt || startedAt;
    const attemptKey = `${ABANDONED_EMAIL_ATTEMPT_PREFIX}${startedAt}`;

    if (localStorage.getItem(attemptKey)) return;

    const updatedAtTime = Date.parse(updatedAt);
    const dueAt = (Number.isFinite(updatedAtTime) ? updatedAtTime : Date.now()) + ABANDONED_EMAIL_DELAY_MS;
    const delay = Math.max(0, dueAt - Date.now());

    const timer = window.setTimeout(() => {
      const latestProgress = readProgress();
      if (!latestProgress) return;

      const answeredCount = countAnswered(latestProgress.answers);
      if (answeredCount === 0 || answeredCount >= depthQuestions.length) return;

      const latestStartedAt = latestProgress.startedAt || startedAt;
      const latestAttemptKey = `${ABANDONED_EMAIL_ATTEMPT_PREFIX}${latestStartedAt}`;
      if (localStorage.getItem(latestAttemptKey)) return;

      void postLifecycleEmail({
        lifecycle: 'abandoned-assessment',
        idempotencyKey: latestAttemptKey,
        progressPercent: Math.round((answeredCount / depthQuestions.length) * 100),
        completedAt: latestProgress.updatedAt,
      }).then((ok) => {
        if (ok) {
          localStorage.setItem(latestAttemptKey, new Date().toISOString());
        }
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [answers, authLoading, showCompletion, totalAnswered, user?.email]);

  const persist = useCallback((nextAnswers: Record<string, string>, nextPage = currentPage) => {
    writeProgress(nextAnswers, nextPage);
  }, [currentPage]);

  const clearAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  const handleAnswer = useCallback((questionId: string, answerId: string, questionNumber: number) => {
    setAnswers((prev) => {
      const nextAnswers = { ...prev, [questionId]: answerId };
      persist(nextAnswers);

      if (currentPage < totalPages - 1) {
        clearAutoAdvanceTimer();
        autoAdvanceTimerRef.current = window.setTimeout(() => {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          persist(nextAnswers, nextPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          autoAdvanceTimerRef.current = null;
        }, 260);
      }

      return nextAnswers;
    });
    trackProgress(questionNumber, depthQuestions.length);
  }, [clearAutoAdvanceTimer, currentPage, persist, totalPages, trackProgress]);

  const completeAssessment = useCallback(() => {
    setShowCompletion(true);
    trackComplete();
    AnalyticsEvents.ctaClicked('generate_free_map', 'assessment_final_page', {
      buttonText: 'Generate free map',
      destination: '/results',
    });

    window.setTimeout(() => {
      const results = calculateDepthResults(answers);
      localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
      localStorage.removeItem(PROGRESS_KEY);

      try {
        const historyRaw = localStorage.getItem(HISTORY_KEY);
        const history = historyRaw ? JSON.parse(historyRaw) : [];
        const nextHistory = Array.isArray(history) ? [results, ...history].slice(0, 12) : [results];
        localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
      } catch {
        localStorage.setItem(HISTORY_KEY, JSON.stringify([results]));
      }

      navigate('/results');
    }, 900);
  }, [answers, navigate, trackComplete]);

  const handleNext = useCallback(() => {
    clearAutoAdvanceTimer();

    if (currentPage < totalPages - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      persist(answers, nextPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    completeAssessment();
  }, [answers, clearAutoAdvanceTimer, completeAssessment, currentPage, persist, totalPages]);

  const handleBack = useCallback(() => {
    clearAutoAdvanceTimer();

    if (currentPage > 0) {
      const nextPage = currentPage - 1;
      setCurrentPage(nextPage);
      persist(answers, nextPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [answers, clearAutoAdvanceTimer, currentPage, persist]);

  const answerCurrentQuestionByIndex = useCallback((optionIndex: number) => {
    const question = currentQuestions[0];
    const option = question?.options[optionIndex];
    if (!question || !option || showCompletion) return;

    handleAnswer(question.id, option.id, currentPage + 1);
  }, [currentPage, currentQuestions, handleAnswer, showCompletion]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return;

      const numericShortcut = Number(event.key);
      if (Number.isInteger(numericShortcut) && numericShortcut >= 1 && numericShortcut <= (currentQuestions[0]?.options.length ?? 0)) {
        event.preventDefault();
        answerCurrentQuestionByIndex(numericShortcut - 1);
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleBack();
        return;
      }

      if ((event.key === 'Enter' || event.key === 'ArrowRight') && isFinalPage && isPageComplete) {
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [answerCurrentQuestionByIndex, currentQuestions, handleBack, handleNext, isFinalPage, isPageComplete]);

  return (
    <div className="min-h-screen bg-jung-base">
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-jung-base/95 px-6 backdrop-blur"
          >
            <div className="max-w-sm rounded-lg border border-jung-border bg-jung-surface p-8 text-center shadow-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-jung-accent-light text-jung-accent">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
              <h2 className="mt-6 text-heading text-3xl text-jung-dark">Generating your free map</h2>
              <p className="mt-3 text-sm leading-6 text-jung-secondary">
                Next you will see the core axis, consistency signal, and the paid full-ranking preview. Payment is optional after the result is visible.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-[69px] z-40 border-b border-jung-border bg-jung-base/94 py-2.5 shadow-sm backdrop-blur sm:py-4 lg:top-[73px]">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-3 sm:grid sm:gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-jung-accent sm:text-sm">Question {pageRange} of {depthQuestions.length}</p>
              <h1 className="mt-0.5 truncate text-heading text-xl text-jung-dark sm:mt-1 sm:text-3xl">{currentLayerMeta.label}</h1>
              <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-jung-secondary sm:block">{currentLayerMeta.description}</p>
              <p className="mt-2 hidden text-xs font-medium text-jung-muted sm:block">
                Free map first. Full ranking and analysis unlock only after you see your result.
                {resumedProgress ? ' Resumed from your saved progress.' : ''}
              </p>
            </div>
            <div className="flex-none text-right">
              <p className="text-xl font-semibold text-jung-dark sm:text-3xl">{overallProgress}%</p>
              <p className="hidden text-sm text-jung-muted sm:block">{totalAnswered} of {depthQuestions.length} answered / {timeRemainingCopy}</p>
              <p className="text-xs text-jung-muted sm:hidden">{timeRemainingCopy}</p>
            </div>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-jung-border-light sm:mt-4 sm:h-2">
            <motion.div
              className="h-full rounded-full bg-jung-accent"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between rounded-lg border border-jung-accent-muted bg-jung-accent-light px-3 py-1.5 text-xs text-jung-accent sm:hidden">
            <span className="font-semibold">{currentLayerMeta.shortLabel}</span>
            <span>{currentLayerStatus.answered}/{currentLayerStatus.total} in this section</span>
          </div>

          <div className="mt-3 hidden grid-cols-4 gap-2 sm:mt-4 sm:grid">
            {currentLayerProgress.map((item) => {
              const meta = depthLayerMeta[item.layer];
              const active = item.layer === currentLayer;

              return (
                <div
                  key={item.layer}
                  className={`rounded-lg border px-3 py-1.5 text-xs sm:py-2 ${
                    active
                      ? 'border-jung-accent-muted bg-jung-accent-light text-jung-accent'
                      : item.complete
                        ? 'border-jung-border bg-jung-surface text-jung-dark'
                        : 'border-jung-border bg-jung-surface/60 text-jung-muted'
                  }`}
                >
                  <span className="font-semibold">{meta.shortLabel}</span>
                  <span className="ml-2">{item.answered}/{item.total}</span>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <main className={`mx-auto w-full max-w-3xl px-4 pt-4 sm:px-6 sm:py-8 lg:py-10 ${isFinalPage ? 'pb-[calc(6.25rem+env(safe-area-inset-bottom))]' : 'pb-[calc(5rem+env(safe-area-inset-bottom))]'}`}>
        {isLayerIntroPage && (
          <section className="mb-5 border-b border-jung-border pb-5">
            <div className="flex gap-4">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-jung-accent-light text-jung-accent">
                <CurrentLayerIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-label">{currentLayerPayoff.eyebrow}</p>
                <h2 className="mt-1 text-heading text-2xl text-jung-dark">{currentLayerPayoff.title}</h2>
                <p className="mt-2 text-sm leading-6 text-jung-secondary">{currentLayerPayoff.body}</p>
              </div>
            </div>
          </section>
        )}

        <div className="mb-5 hidden items-start gap-3 border-b border-jung-border pb-4 text-sm text-jung-secondary sm:flex">
          <Info className="mt-0.5 h-4 w-4 flex-none text-jung-accent" />
          <div className="grid gap-2">
            <p>
              Answer from the first pattern that actually happens. The "none" option is valid when the question misses you. Progress saves automatically.
            </p>
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-jung-muted">
              <Keyboard className="h-3.5 w-3.5 text-jung-accent" />
              Use keys 1-5 to answer, left arrow to go back, and Enter to generate the final map.
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="grid gap-5"
          >
            {currentQuestions.map((question, qIndex) => {
              const questionNumber = currentPage * QUESTIONS_PER_PAGE + qIndex + 1;
              const selectedAnswer = answers[question.id];

              return (
                <section key={question.id} className="card-premium p-5 sm:p-6">
                  <div className="grid gap-5 lg:grid-cols-[3.25rem_1fr]">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-lg text-sm font-semibold ${
                        selectedAnswer
                          ? 'bg-jung-accent text-white'
                          : 'bg-jung-accent-light text-jung-accent'
                      }`}
                    >
                      {selectedAnswer ? <CheckCircle2 className="h-5 w-5" /> : questionNumber}
                    </span>

                    <div className="min-w-0">
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-lg border border-jung-border bg-jung-surface-alt px-2.5 py-1 text-xs font-semibold text-jung-secondary">
                          {depthLayerMeta[question.layer].shortLabel}
                        </span>
                        <span className="text-xs font-medium text-jung-muted">{question.domain}</span>
                      </div>

                      <h2 className="text-xl font-semibold leading-7 text-jung-dark sm:text-2xl">
                        {question.prompt}
                      </h2>
                      {question.context && (
                        <p className="mt-2 text-sm leading-6 text-jung-secondary">{question.context}</p>
                      )}

                      <div className="mt-6 grid gap-2">
                        {question.options.map((option, optionIndex) => {
                          const isActive = selectedAnswer === option.id;
                          const shortcut = optionIndex + 1;

                          return (
                            <motion.button
                              key={option.id}
                              type="button"
                              aria-pressed={isActive}
                              onClick={() => handleAnswer(question.id, option.id, questionNumber)}
                              whileTap={{ scale: 0.985 }}
                              animate={isActive ? { scale: [1, 1.012, 1] } : { scale: 1 }}
                              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                              className={`group flex min-h-14 w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
                                isActive
                                  ? 'border-jung-accent bg-jung-accent text-white shadow-md'
                                  : 'border-jung-border bg-jung-surface shadow-sm hover:-translate-y-px hover:border-jung-accent-muted hover:bg-jung-accent-light hover:shadow-md'
                              }`}
                            >
                              <span className={`mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full border text-xs font-semibold ${
                                isActive
                                  ? 'border-white/60 bg-white/20 text-white'
                                  : 'border-jung-border bg-jung-base text-jung-muted group-hover:border-jung-accent-muted group-hover:text-jung-accent'
                              }`}>
                                {isActive ? <CheckCircle2 className="h-4 w-4" /> : shortcut}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className={`block text-sm leading-6 sm:text-base ${isActive ? 'text-white' : 'text-jung-dark'}`}>
                                  {option.label}
                                </span>
                                <span className={`mt-1 hidden text-xs font-semibold sm:inline-flex ${isActive ? 'text-white/70' : 'text-jung-muted'}`}>
                                  Press {shortcut}
                                </span>
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-jung-border bg-jung-base/96 px-4 pb-[calc(0.55rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-14px_30px_-28px_rgb(29_38_32_/_0.65)] backdrop-blur sm:px-6 sm:pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pt-3 lg:static lg:mt-8 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-4 lg:shadow-none lg:backdrop-blur-0">
          <div className="mx-auto w-full max-w-3xl sm:hidden">
            {!isFinalPage ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleBack}
                  disabled={currentPage === 0}
                  aria-label="Back to previous question"
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                  className="h-11 w-11 flex-none px-0"
                >
                  <span className="sr-only">Back</span>
                </Button>

                <div className="min-w-0 flex-1 rounded-lg border border-jung-border bg-jung-surface-alt px-3 py-2">
                  <div className="flex items-center justify-between gap-2 text-xs leading-5 text-jung-muted" aria-live="polite">
                    <span className="font-semibold text-jung-secondary">Question {pageRange}/{depthQuestions.length}</span>
                    <span className="flex-none">{timeRemainingCopy}</span>
                  </div>
                  <p className="truncate text-sm font-semibold text-jung-dark">
                    {isPageComplete ? 'Saved. Moving...' : 'Tap answer or press 1-5'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs leading-5 text-jung-muted" aria-live="polite">
                  <span className="font-semibold text-jung-secondary">Question {pageRange}/{depthQuestions.length}</span>
                  <span className="text-right">{isPageComplete ? 'Ready' : 'Choose one'}</span>
                </div>
                <div className="grid grid-cols-[0.52fr_1fr] gap-2">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleBack}
                    disabled={currentPage === 0}
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                    className="w-full px-3"
                  >
                    Back
                  </Button>

                  <Button
                    variant={isPageComplete ? 'accent' : 'secondary'}
                    size="md"
                    onClick={handleNext}
                    disabled={!isPageComplete}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    className="w-full px-3"
                  >
                    {isPageComplete ? 'Generate free map' : 'Choose one'}
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="mx-auto hidden w-full max-w-3xl sm:block">
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs leading-5 text-jung-muted sm:mb-2" aria-live="polite">
              <span className="font-semibold text-jung-secondary">Question {pageRange}/{depthQuestions.length}</span>
              <span className="text-right">{nextStepCopy}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-[auto_1fr]">
              <Button
                variant="outline"
                size="md"
                onClick={handleBack}
                disabled={currentPage === 0}
                leftIcon={<ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5" />}
                className="w-full px-3 sm:px-6"
              >
                Back
              </Button>

              <Button
                variant={isPageComplete ? 'accent' : 'secondary'}
                size="md"
                onClick={handleNext}
                disabled={!isPageComplete}
                rightIcon={<ArrowRight className="h-4 w-4 lg:h-5 lg:w-5" />}
                className="w-full px-3 sm:px-8"
              >
                {!isPageComplete ? (
                  <>
                    <span>Choose an answer</span>
                  </>
                ) : isFinalPage ? 'Generate free map' : 'Next question'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
