import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Info, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { DepthLayer, depthLayerMeta, depthQuestions } from '../data/depthAssessment';
import { PAGE_SEO, useSEO } from '../hooks/useSEO';
import { useAssessmentTracking } from '../hooks/useAnalytics';
import { calculateDepthResults } from '../utils/depthScoring';

const QUESTIONS_PER_PAGE = 3;
const PROGRESS_KEY = 'jungian_depth_assessment_progress';
const HISTORY_KEY = 'jungian_depth_results_history';
const RESULTS_KEY = 'jungian_assessment_results';

type SavedProgress = {
  answers: Record<string, string>;
  currentPage: number;
};

const layerOrder: DepthLayer[] = ['behavioral', 'inferior', 'somatic', 'attitude'];

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
    };
  } catch {
    return null;
  }
};

const writeProgress = (answers: Record<string, string>, currentPage: number) => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify({ answers, currentPage }));
};

export const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showCompletion, setShowCompletion] = useState(false);
  const hasLoadedProgressRef = useRef(false);
  const hasTrackedStartRef = useRef(false);
  const { trackStart, trackProgress, trackComplete } = useAssessmentTracking();

  useSEO(PAGE_SEO.assessment);

  const totalPages = Math.ceil(depthQuestions.length / QUESTIONS_PER_PAGE);
  const currentQuestions = depthQuestions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE,
  );

  const totalAnswered = Object.keys(answers).filter((key) => answers[key]).length;
  const overallProgress = Math.round((totalAnswered / depthQuestions.length) * 100);
  const isPageComplete = currentQuestions.every((question) => answers[question.id]);
  const currentLayer = currentQuestions[0]?.layer ?? 'behavioral';
  const currentLayerMeta = depthLayerMeta[currentLayer];
  const currentLayerProgress = useMemo(() => layerProgress(answers), [answers]);

  const pageRange = useMemo(() => {
    const start = currentPage * QUESTIONS_PER_PAGE + 1;
    const end = Math.min((currentPage + 1) * QUESTIONS_PER_PAGE, depthQuestions.length);
    return `${start}-${end}`;
  }, [currentPage]);

  useEffect(() => {
    if (hasLoadedProgressRef.current) return;
    const saved = readProgress();
    if (saved) {
      setAnswers(saved.answers);
      setCurrentPage(Math.max(0, Math.min(saved.currentPage, totalPages - 1)));
    }
    hasLoadedProgressRef.current = true;
  }, [totalPages]);

  useEffect(() => {
    if (!hasTrackedStartRef.current) {
      trackStart();
      hasTrackedStartRef.current = true;
    }
  }, [trackStart]);

  const persist = useCallback((nextAnswers: Record<string, string>, nextPage = currentPage) => {
    writeProgress(nextAnswers, nextPage);
  }, [currentPage]);

  const handleAnswer = useCallback((questionId: string, answerId: string, questionNumber: number) => {
    setAnswers((prev) => {
      const nextAnswers = { ...prev, [questionId]: answerId };
      persist(nextAnswers);
      return nextAnswers;
    });
    trackProgress(questionNumber, depthQuestions.length);
  }, [persist, trackProgress]);

  const completeAssessment = useCallback(() => {
    setShowCompletion(true);
    trackComplete();

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
    if (currentPage < totalPages - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      persist(answers, nextPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    completeAssessment();
  }, [answers, completeAssessment, currentPage, persist, totalPages]);

  const handleBack = useCallback(() => {
    if (currentPage > 0) {
      const nextPage = currentPage - 1;
      setCurrentPage(nextPage);
      persist(answers, nextPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [answers, currentPage, persist]);

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
              <h2 className="mt-6 text-heading text-3xl text-jung-dark">Mapping your energy</h2>
              <p className="mt-3 text-sm leading-6 text-jung-secondary">
                Behavioral, inferior, somatic, and attitude signals are being combined now.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-[73px] z-40 border-b border-jung-border bg-jung-base/92 py-4 backdrop-blur lg:top-[81px]">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-jung-accent">Questions {pageRange} of {depthQuestions.length}</p>
              <h1 className="mt-1 text-heading text-2xl text-jung-dark sm:text-3xl">{currentLayerMeta.label}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-jung-secondary">{currentLayerMeta.description}</p>
            </div>
            <div className="min-w-[10rem] text-left lg:text-right">
              <p className="text-3xl font-semibold text-jung-dark">{overallProgress}%</p>
              <p className="text-sm text-jung-muted">{totalAnswered} of {depthQuestions.length} answered</p>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-jung-border-light">
            <motion.div
              className="h-full rounded-full bg-jung-accent"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {currentLayerProgress.map((item) => {
              const meta = depthLayerMeta[item.layer];
              const active = item.layer === currentLayer;

              return (
                <div
                  key={item.layer}
                  className={`rounded-lg border px-3 py-2 text-xs ${
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

      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-8 rounded-lg border border-jung-border bg-jung-surface p-4">
          <div className="flex items-start gap-3 text-sm text-jung-secondary">
            <Info className="mt-0.5 h-4 w-4 flex-none text-jung-accent" />
            <p>
              Answer from the first pattern that actually happens, not the version you think you should have. The "none" option is valid when the question misses you.
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
                        {question.options.map((option) => {
                          const isActive = selectedAnswer === option.id;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleAnswer(question.id, option.id, questionNumber)}
                              className={`group flex min-h-14 w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
                                isActive
                                  ? 'border-jung-accent bg-jung-accent text-white shadow-md'
                                  : 'border-jung-border bg-jung-surface hover:border-jung-accent-muted hover:bg-jung-accent-light'
                              }`}
                            >
                              <span className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full ${
                                isActive ? 'text-white' : 'text-jung-muted group-hover:text-jung-accent'
                              }`}>
                                {isActive ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-4 w-4" />}
                              </span>
                              <span className={`text-sm leading-6 sm:text-base ${isActive ? 'text-white' : 'text-jung-dark'}`}>
                                {option.label}
                              </span>
                            </button>
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

        <div className="mt-10 grid gap-4 border-t border-jung-border pt-6 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={currentPage === 0}
            leftIcon={<ArrowLeft className="h-5 w-5" />}
            className="w-full sm:w-auto"
          >
            Back
          </Button>

          <div className="text-center text-sm text-jung-muted">
            {!isPageComplete ? 'Answer these three questions to continue.' : `Section ${currentPage + 1} of ${totalPages} complete.`}
          </div>

          <Button
            variant={isPageComplete ? 'accent' : 'secondary'}
            size="lg"
            onClick={handleNext}
            disabled={!isPageComplete}
            rightIcon={<ArrowRight className="h-5 w-5" />}
            className="w-full sm:w-auto"
          >
            {currentPage === totalPages - 1 ? 'See energy map' : 'Continue'}
          </Button>
        </div>
      </main>
    </div>
  );
};
