import { useAssessmentKeyboard } from '../hooks/useAssessmentKeyboard';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  type DepthAnswerOption,
  type DepthLayer,
  depthLayerMeta,
  depthQuestions,
} from '../data/depthAssessment';
import { isPaidTierId } from '../data/pricing';
import { useAuth } from '../hooks/use-auth';
import { useAssessmentTracking } from '../hooks/useAnalytics';
import { PAGE_SEO, useSEO } from '../hooks/useSEO';
import {
  readAcquisitionSource,
  sourceFromSearch,
} from '../lib/acquisition-source';
import { trackEvent } from '../lib/analytics';
import { assessmentEntryContextFromSource } from '../lib/assessment-entry-context';
import {
  ASSESSMENT_PROGRESS_STORAGE_KEY,
  countAssessmentAnswers,
  readAssessmentProgress,
  writeAssessmentProgress,
} from '../lib/assessment-progress';
import { writeUpgradeIntent } from '../lib/upgrade-intent';
import { calculateDepthResults } from '../utils/depthScoring';

const QUESTIONS_PER_PAGE = 1;
const HISTORY_KEY = 'jungian_depth_results_history';
const RESULTS_KEY = 'jungian_assessment_results';
const LIFECYCLE_EMAIL_ENDPOINT = '/api/lifecycle-email';
const ABANDONED_EMAIL_DELAY_MS = 30 * 60 * 1000;
const ABANDONED_EMAIL_ATTEMPT_PREFIX = 'typejung_lifecycle_email_abandoned_';

const layerOrder: DepthLayer[] = [
  'behavioral',
  'inferior',
  'somatic',
  'attitude',
];

const rotateOptions = (
  options: DepthAnswerOption[],
  questionId: string,
): DepthAnswerOption[] => {
  const noneOptions = options.filter((option) => option.id === 'none');
  const scoredOptions = options.filter((option) => option.id !== 'none');
  if (scoredOptions.length <= 1) return options;

  const seed = Array.from(questionId).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  const offset = seed % scoredOptions.length;
  return [
    ...scoredOptions.slice(offset),
    ...scoredOptions.slice(0, offset),
    ...noneOptions,
  ];
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

export const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const urlTierIntent = useMemo(() => {
    const tierParam = new URLSearchParams(location.search).get('tier');
    return isPaidTierId(tierParam) ? tierParam : null;
  }, [location.search]);
  const entrySource = useMemo(
    () =>
      sourceFromSearch(location.search) ||
      readAcquisitionSource()?.source ||
      null,
    [location.search],
  );
  const entryAttribution = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const stored = readAcquisitionSource();

    return {
      parentSource: params.get('parent_source') || stored?.parentSource || null,
      utmCampaign: params.get('utm_campaign') || stored?.utmCampaign || null,
      utmSource: params.get('utm_source') || stored?.utmSource || null,
      sourceChain: params.get('source_chain') || stored?.sourceChain || null,
    };
  }, [location.search]);
  const entryContext = useMemo(
    () => assessmentEntryContextFromSource(entrySource, entryAttribution),
    [entryAttribution, entrySource],
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [questionReadyPage, setQuestionReadyPage] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showCompletion, setShowCompletion] = useState(false);
  const [flagUnanswered, setFlagUnanswered] = useState(false);
  const [resumedAnswered, setResumedAnswered] = useState<number | null>(null);
  const [sectionReward, setSectionReward] = useState<{
    completed: DepthLayer;
    next: DepthLayer | null;
  } | null>(null);
  const hasLoadedProgressRef = useRef(false);
  const hasTrackedStartRef = useRef(false);
  const hasTrackedEntryContextRef = useRef(false);
  const sectionRewardTimerRef = useRef<number | null>(null);
  const { trackStart, trackProgress, trackComplete } = useAssessmentTracking();
  const { user, isLoading: authLoading } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const scrollBehavior: ScrollBehavior = prefersReducedMotion
    ? 'auto'
    : 'smooth';

  useSEO(PAGE_SEO.assessment);

  useEffect(() => {
    if (urlTierIntent) {
      writeUpgradeIntent(urlTierIntent, 'assessment_discount_email');
    }
  }, [urlTierIntent]);

  const questionsPerPage = QUESTIONS_PER_PAGE;
  const totalPages = Math.ceil(depthQuestions.length / questionsPerPage);
  const currentQuestions = useMemo(
    () =>
      depthQuestions
        .slice(
          currentPage * questionsPerPage,
          (currentPage + 1) * questionsPerPage,
        )
        .map((question) => ({
          ...question,
          options: rotateOptions(question.options, question.id),
        })),
    [currentPage, questionsPerPage],
  );

  const totalAnswered = countAssessmentAnswers(answers);
  const overallProgress = Math.round(
    (totalAnswered / depthQuestions.length) * 100,
  );
  // Calibrated to the observed production median of roughly 23 minutes for 42 prompts.
  // Only surfaced past the halfway point so it reads as encouragement, not pressure.
  const remainingQuestions = depthQuestions.length - totalAnswered;
  const minutesLeft = Math.max(1, Math.round((remainingQuestions * 33) / 60));
  const showTimeEstimate = overallProgress >= 50 && remainingQuestions > 0;
  const isPageComplete = currentQuestions.every(
    (question) => answers[question.id],
  );
  const currentLayer = currentQuestions[0]?.layer ?? 'behavioral';
  const currentLayerMeta = depthLayerMeta[currentLayer];

  const pageLabel = `Question ${currentPage + 1} of ${depthQuestions.length}`;
  const actionHint = !isPageComplete
    ? 'Choose the answer that fits best.'
    : currentPage === totalPages - 1
      ? 'Your free map is ready to build.'
      : 'You can change your answer before continuing.';

  useEffect(() => {
    setCurrentPage((page) => Math.max(0, Math.min(page, totalPages - 1)));
  }, [totalPages]);

  useEffect(
    () => () => {
      if (sectionRewardTimerRef.current !== null) {
        window.clearTimeout(sectionRewardTimerRef.current);
      }
    },
    [],
  );

  const celebrateSectionIfComplete = useCallback(
    (
      questionLayer: DepthLayer,
      nextAnswers: Record<string, string>,
      prevAnswers: Record<string, string>,
    ) => {
      const layerQuestions = depthQuestions.filter(
        (question) => question.layer === questionLayer,
      );
      const wasComplete = layerQuestions.every(
        (question) => prevAnswers[question.id],
      );
      const nowComplete = layerQuestions.every(
        (question) => nextAnswers[question.id],
      );
      if (wasComplete || !nowComplete) return;

      const layerIndex = layerOrder.indexOf(questionLayer);
      const next =
        layerIndex >= 0 ? (layerOrder[layerIndex + 1] ?? null) : null;
      setSectionReward({ completed: questionLayer, next });
      trackEvent('assessment_section_completed', {
        layer: questionLayer,
        answered: countAssessmentAnswers(nextAnswers),
      });

      if (sectionRewardTimerRef.current !== null) {
        window.clearTimeout(sectionRewardTimerRef.current);
      }
      sectionRewardTimerRef.current = window.setTimeout(() => {
        sectionRewardTimerRef.current = null;
        setSectionReward(null);
      }, 2800);
    },
    [],
  );

  useEffect(() => {
    if (hasLoadedProgressRef.current) return;
    const saved = readAssessmentProgress();
    if (saved) {
      setAnswers(saved.answers);
      // Resume at the first missing answer; old saves used six-question desktop pages.
      const firstMissing = depthQuestions.findIndex(
        (question) => !saved.answers[question.id],
      );
      setCurrentPage(firstMissing < 0 ? totalPages - 1 : firstMissing);

      const savedAnswered = countAssessmentAnswers(saved.answers);
      if (savedAnswered > 0 && savedAnswered < depthQuestions.length) {
        setResumedAnswered(savedAnswered);
        trackEvent('assessment_progress_resumed', {
          answered: savedAnswered,
          progress_percent: Math.round(
            (savedAnswered / depthQuestions.length) * 100,
          ),
          resumed_page:
            Math.max(0, Math.min(saved.currentPage, totalPages - 1)) + 1,
        });
      }
    }
    hasLoadedProgressRef.current = true;
  }, [totalPages]);

  useEffect(() => {
    if (!hasTrackedStartRef.current) {
      trackStart();
      hasTrackedStartRef.current = true;
    }
  }, [trackStart]);

  useEffect(() => {
    if (!entryContext || hasTrackedEntryContextRef.current) return;
    trackEvent('assessment_entry_context_viewed', {
      source: entrySource || 'unknown',
      context_category: entryContext.category,
      ...(entryAttribution.parentSource
        ? { parent_source: entryAttribution.parentSource }
        : {}),
      ...(entryAttribution.utmCampaign
        ? { utm_campaign: entryAttribution.utmCampaign }
        : {}),
      ...(entryAttribution.utmSource
        ? { utm_source: entryAttribution.utmSource }
        : {}),
      ...(entryAttribution.sourceChain
        ? { source_chain: entryAttribution.sourceChain }
        : {}),
    });
    hasTrackedEntryContextRef.current = true;
  }, [entryAttribution, entryContext, entrySource]);

  useEffect(() => {
    if (
      authLoading ||
      !user?.email ||
      showCompletion ||
      totalAnswered === 0 ||
      totalAnswered >= depthQuestions.length
    ) {
      return;
    }

    const progress = readAssessmentProgress();
    if (!progress) return;

    const startedAt =
      progress.startedAt || progress.updatedAt || new Date().toISOString();
    const updatedAt = progress.updatedAt || startedAt;
    const attemptKey = `${ABANDONED_EMAIL_ATTEMPT_PREFIX}${startedAt}`;

    if (localStorage.getItem(attemptKey)) return;

    const updatedAtTime = Date.parse(updatedAt);
    const dueAt =
      (Number.isFinite(updatedAtTime) ? updatedAtTime : Date.now()) +
      ABANDONED_EMAIL_DELAY_MS;
    const delay = Math.max(0, dueAt - Date.now());

    const timer = window.setTimeout(() => {
      const latestProgress = readAssessmentProgress();
      if (!latestProgress) return;

      const answeredCount = countAssessmentAnswers(latestProgress.answers);
      if (answeredCount === 0 || answeredCount >= depthQuestions.length) return;

      const latestStartedAt = latestProgress.startedAt || startedAt;
      const latestAttemptKey = `${ABANDONED_EMAIL_ATTEMPT_PREFIX}${latestStartedAt}`;
      if (localStorage.getItem(latestAttemptKey)) return;

      void postLifecycleEmail({
        lifecycle: 'abandoned-assessment',
        idempotencyKey: latestAttemptKey,
        progressPercent: Math.round(
          (answeredCount / depthQuestions.length) * 100,
        ),
        completedAt: latestProgress.updatedAt,
      }).then((ok) => {
        if (ok) {
          localStorage.setItem(latestAttemptKey, new Date().toISOString());
        }
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [answers, authLoading, showCompletion, totalAnswered, user?.email]);

  useEffect(() => {
    if (isPageComplete) setFlagUnanswered(false);
  }, [isPageComplete]);

  const persist = useCallback(
    (nextAnswers: Record<string, string>, nextPage = currentPage) => {
      writeAssessmentProgress(nextAnswers, nextPage);
    },
    [currentPage],
  );

  const handleAnswer = useCallback(
    (questionId: string, answerId: string, questionNumber: number) => {
      const nextAnswers = { ...answers, [questionId]: answerId };
      const answeredLayer = depthQuestions.find(
        (question) => question.id === questionId,
      )?.layer;

      setAnswers(nextAnswers);
      persist(nextAnswers);
      trackProgress(questionNumber, depthQuestions.length);
      if (answeredLayer) {
        celebrateSectionIfComplete(answeredLayer, nextAnswers, answers);
      }
    },
    [answers, celebrateSectionIfComplete, persist, trackProgress],
  );

  const completeAssessment = useCallback(() => {
    setShowCompletion(true);
    trackComplete();

    window.setTimeout(() => {
      const results = calculateDepthResults(answers);
      localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
      localStorage.removeItem(ASSESSMENT_PROGRESS_STORAGE_KEY);

      try {
        const historyRaw = localStorage.getItem(HISTORY_KEY);
        const history = historyRaw ? JSON.parse(historyRaw) : [];
        const nextHistory = Array.isArray(history)
          ? [results, ...history].slice(0, 12)
          : [results];
        localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
      } catch {
        localStorage.setItem(HISTORY_KEY, JSON.stringify([results]));
      }

      navigate('/results');
    }, 900);
  }, [answers, navigate, trackComplete]);

  const handleNext = useCallback(() => {
    if (questionReadyPage !== currentPage) return;
    if (!isPageComplete) {
      const firstUnanswered = currentQuestions.find(
        (question) => !answers[question.id],
      );
      setFlagUnanswered(true);
      if (firstUnanswered && typeof document !== 'undefined') {
        document
          .getElementById(`assessment-q-${firstUnanswered.id}`)
          ?.scrollIntoView({ behavior: scrollBehavior, block: 'center' });
      }
      trackEvent('assessment_incomplete_advance_blocked', {
        page: currentPage + 1,
        answered_on_page: currentQuestions.filter(
          (question) => answers[question.id],
        ).length,
      });
      return;
    }

    setFlagUnanswered(false);
    setResumedAnswered(null);

    if (currentPage < totalPages - 1) {
      const nextPage = currentPage + 1;
      setQuestionReadyPage(null);
      setCurrentPage(nextPage);
      persist(answers, nextPage);
      window.scrollTo({ top: 0, behavior: scrollBehavior });
      return;
    }

    const firstMissing = depthQuestions.findIndex(
      (question) => !answers[question.id],
    );
    if (firstMissing >= 0) {
      setQuestionReadyPage(null);
      setCurrentPage(firstMissing);
      setFlagUnanswered(true);
      persist(answers, firstMissing);
      return;
    }
    completeAssessment();
  }, [
    answers,
    completeAssessment,
    currentPage,
    currentQuestions,
    isPageComplete,
    persist,
    questionReadyPage,
    scrollBehavior,
    totalPages,
  ]);

  const handleBack = useCallback(() => {
    if (questionReadyPage !== currentPage) return;
    if (currentPage > 0) {
      const nextPage = currentPage - 1;
      setFlagUnanswered(false);
      setQuestionReadyPage(null);
      setCurrentPage(nextPage);
      persist(answers, nextPage);
      window.scrollTo({ top: 0, behavior: scrollBehavior });
    }
  }, [answers, currentPage, persist, questionReadyPage, scrollBehavior]);

  useAssessmentKeyboard({
    enabled: !showCompletion && questionReadyPage === currentPage,
    optionCount: currentQuestions[0]?.options.length ?? 0,
    selectByIndex: index => {
      const question = currentQuestions[0];
      const option = question?.options[index];
      if (question && option) handleAnswer(question.id, option.id, currentPage + 1);
    },
    canContinue: isPageComplete,
    onContinue: handleNext,
    isDialogOpen: showCompletion,
  });

  const chapterLabels: Record<DepthLayer, string> = {
    behavioral: 'Everyday life',
    inferior: 'Under stress',
    somatic: 'Body cues',
    attitude: 'Attention',
  };
  const chapters = layerOrder.map((layer) => {
    const inLayer = depthQuestions.filter((question) => question.layer === layer);
    return {
      layer,
      total: inLayer.length,
      answered: inLayer.filter((question) => answers[question.id]).length,
    };
  });

  return (
    <div className="qz">
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="qz-done"
            role="status"
            aria-live="polite"
          >
            <div className="qz-done-body">
              <span className="qz-done-line" aria-hidden="true" />
              <h2 className="qz-done-title">
                Mapping your energy…
              </h2>
              <p className="qz-done-text">
                Behavioral, inferior, somatic, and attitude signals are being
                combined now.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sectionReward && !showCompletion && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}
            className="qz-toast-wrap"
            role="status"
            aria-live="polite"
          >
            <div className="qz-toast">
              <span className="qz-toast-mark" aria-hidden="true" />
              <span>
                {depthLayerMeta[sectionReward.completed].shortLabel} layer
                complete.
                {sectionReward.next
                  ? ` Next: ${depthLayerMeta[sectionReward.next].label.toLowerCase()}.`
                  : ' Last section — build your map.'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="qz-head">
        <div className="qz-meta">
          <p className="qz-count">
            {pageLabel}
          </p>
          <p className="qz-note">
            {showTimeEstimate
              ? `About ${minutesLeft} min left`
              : totalAnswered > 0
                ? 'Progress saved on this device'
                : '20–25 minutes · Free results'}
          </p>
        </div>
        <div
          className="qz-progress"
          role="progressbar"
          aria-label="Assessment progress"
          aria-valuemin={0}
          aria-valuemax={42}
          aria-valuenow={totalAnswered}
        >
          {chapters.map((chapter) => (
            <span
              key={chapter.layer}
              className="qz-progress-part"
              style={{ flexGrow: chapter.total }}
            >
              <span style={{ width: `${(chapter.answered / Math.max(1, chapter.total)) * 100}%` }} />
            </span>
          ))}
        </div>
        <ol className="qz-chapters" aria-label="Assessment chapters">
          {chapters.map((chapter) => <li
            key={chapter.layer}
            style={{ flexGrow: chapter.total }}
            aria-current={currentLayer === chapter.layer ? 'step' : undefined}
            className={chapter.answered === chapter.total ? 'is-done' : undefined}
          >
            {chapterLabels[chapter.layer]}
          </li>)}
        </ol>
        <h1 className="sr-only">
          {currentLayerMeta.shortLabel}: {pageLabel}
        </h1>
      </header>

      <section
        id="assessment-questions"
        className="qz-body scroll-mt-24"
      >
        {resumedAnswered !== null && !showCompletion && (
          <div
            className="qz-resume"
            role="status"
          >
            <CheckCircle2 className="qz-resume-icon" aria-hidden="true" />
            <p>
              Welcome back. Your {resumedAnswered} answers are saved. Continue
              where you left off.
            </p>
            <button
              type="button"
              onClick={() => setResumedAnswered(null)}
              className="qz-resume-close"
              aria-label="Dismiss resume notice"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {currentPage === 0 && (
          <p className="qz-intro">
            Choose what actually happens in your life. “None” is a valid answer
            when nothing fits.
          </p>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
            onAnimationComplete={(definition) => {
              if (typeof definition !== 'object' || Array.isArray(definition) || definition.opacity !== 1) return;
              setQuestionReadyPage(currentPage);
              if (currentPage > 0)
                document
                  .getElementById(`prompt-${currentQuestions[0]?.id}`)
                  ?.focus({ preventScroll: true });
            }}
            className="qz-questions"
          >
            {currentQuestions.map((question, qIndex) => {
              const questionNumber =
                currentPage * questionsPerPage + qIndex + 1;
              const selectedAnswer = answers[question.id];
              const isFlagged = flagUnanswered && !selectedAnswer;

              return (
                <fieldset
                  key={question.id}
                  id={`assessment-q-${question.id}`}
                  className="qz-question"
                >
                  <legend className="qz-legend">
                    <h2
                      tabIndex={-1}
                      id={`prompt-${question.id}`}
                      className="qz-prompt"
                    >
                      {question.prompt}
                    </h2>
                    {question.context && (
                      <p className="qz-context">
                        {question.context}
                      </p>
                    )}
                  </legend>
                  {isFlagged && (
                    <p
                      className="qz-flag"
                      role="alert"
                    >
                      <AlertCircle className="h-5 w-5 flex-none" aria-hidden="true" />
                      Choose an answer to continue. “None” is fine if nothing
                      fits.
                    </p>
                  )}
                  <div className="qz-options">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={option.id}
                        className="qz-option"
                      >
                        <input
                          type="radio"
                          className="qz-option-input"
                          name={question.id}
                          value={option.id}
                          aria-labelledby={`${question.id}-${option.id}-label`}
                          checked={selectedAnswer === option.id}
                          onChange={() =>
                            handleAnswer(question.id, option.id, questionNumber)
                          }
                        />
                        <span className="qz-option-face">
                          <span className="qz-option-mark" aria-hidden="true" />
                          <span className="qz-option-label" id={`${question.id}-${option.id}-label`}>
                            {option.label}
                          </span>
                          <span className="qz-option-key" data-key={optionIndex + 1} aria-hidden="true" />
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <div
          data-testid="assessment-action-bar"
          className="qz-actions"
        >
          <p className="qz-hint" aria-live="polite">
            {actionHint}
          </p>
          <div className="qz-buttons">
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              disabled={currentPage === 0 || questionReadyPage !== currentPage || showCompletion}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              className={`qz-back${currentPage === 0 ? ' is-first max-md:hidden' : ''}`}
            >
              Back
            </Button>
            <Button
              variant={isPageComplete ? 'accent' : 'secondary'}
              size="lg"
              onClick={handleNext}
              disabled={questionReadyPage !== currentPage || showCompletion}
              aria-disabled={!isPageComplete}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              // Stays clickable (the hint explains what is missing) but reads as waiting.
              className="qz-next aria-disabled:bg-jung-surface aria-disabled:text-jung-muted aria-disabled:hover:bg-jung-surface"
            >
              {currentPage === totalPages - 1
                ? 'See my free map'
                : 'Next question'}
            </Button>
          </div>
        </div>
        <p className="qz-keys">You can also use <kbd>1</kbd>–<kbd>5</kbd> to select · <kbd>Enter</kbd> to continue</p>
      </section>
    </div>
  );
};
