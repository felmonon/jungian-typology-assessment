import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { questions } from '../data/questions';
import { calculateResults } from '../utils/scoring';
import { Button } from '../components/ui/Button';
import { ArrowLeft, ArrowRight, CheckCircle2, Keyboard, Sparkles, Brain, Info } from 'lucide-react';
import { useSEO, PAGE_SEO } from '../hooks/useSEO';
import { useAssessmentTracking } from '../hooks/useAnalytics';
import { useAssessmentProgress } from '../hooks/useAssessmentStorage';
import { assessmentResultsSchema } from '../lib/validation';
import { useToast } from '../components/ui/Toast';

const QUESTIONS_PER_PAGE = 4;

export const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [focusedQuestion, setFocusedQuestion] = useState<number | null>(null);
  const assessmentTracking = useAssessmentTracking();
  const { progress, saveProgress, isLoaded } = useAssessmentProgress();
  const { success, info, ToastContainer } = useToast();
  const lastSavedRef = useRef<number>(0);

  useSEO(PAGE_SEO.assessment);

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const currentQuestions = questions.slice(currentIdx * QUESTIONS_PER_PAGE, (currentIdx + 1) * QUESTIONS_PER_PAGE);

  useEffect(() => {
    if (isLoaded && progress) {
      setAnswers(progress.answers);
      setCurrentIdx(progress.currentStep);
    }
  }, [isLoaded, progress]);

  const isPageComplete = currentQuestions.every(q => answers[q.id] !== undefined);
  const progressPercent = ((currentIdx) / totalPages) * 100;
  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const overallProgress = (totalAnswered / totalQuestions) * 100;

  const handleAnswer = useCallback((qid: string, value: number) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [qid]: value };
      const now = Date.now();
      if (now - lastSavedRef.current > 5000) {
        lastSavedRef.current = now;
      }
      saveProgress(newAnswers, currentIdx);
      return newAnswers;
    });
  }, [currentIdx, saveProgress]);

  const handleNext = useCallback(() => {
    if (currentIdx < totalPages - 1) {
      setCurrentIdx(p => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowCelebration(true);
      setTimeout(() => {
        const results = calculateResults(answers);
        const validatedResults = assessmentResultsSchema.safeParse(results);
        localStorage.setItem(
          'jungian_assessment_results',
          JSON.stringify(validatedResults.success ? validatedResults.data : results)
        );
        localStorage.removeItem('jungian_assessment_progress');
        navigate('/results');
      }, 2500);
    }
  }, [currentIdx, totalPages, answers, navigate]);

  const handleBack = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx(p => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentIdx]);

  return (
    <div className="min-h-screen bg-jung-base dark:bg-dark-base transition-colors duration-500">
      <ToastContainer />

      {/* Completion Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-jung-dark/95 backdrop-blur-xl"
          >
            <div className="text-center text-white px-6">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-jung-accent rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-jung-accent/40"
              >
                <Brain className="w-12 h-12" />
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-display text-4xl mb-4"
              >
                Assessment Complete
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-jung-subtle text-xl font-serif italic"
              >
                Synthesizing your cognitive architecture...
              </motion.p>
              <div className="mt-12 flex justify-center gap-3">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-3 h-3 bg-jung-accent rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Progress Header */}
      <header className="sticky top-0 z-50 glass-morphism border-b border-jung-border/30 dark:border-dark-border py-4">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-jung-accent/10 dark:bg-jung-accent/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-jung-accent" />
              </div>
              <div>
                <h1 className="text-display text-xl text-jung-dark dark:text-white leading-tight">Depth Diagnostic</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-jung-muted">Section {currentIdx + 1} of {totalPages}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-display font-bold text-jung-accent">{Math.round(overallProgress)}%</div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-jung-muted">{totalAnswered} / {totalQuestions} answered</p>
            </div>
          </div>
          <div className="h-1.5 bg-jung-border/30 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-jung-accent"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </header>

      <main className="py-12 lg:py-20">
        <div className="max-w-3xl mx-auto px-6">
          {/* Section Indicator */}
          <div className="flex justify-center gap-2 mb-16">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIdx
                    ? 'w-12 bg-jung-accent'
                    : idx < currentIdx
                      ? 'w-4 bg-jung-accent/40'
                      : 'w-4 bg-jung-border dark:bg-white/10'
                  }`}
              />
            ))}
          </div>

          {/* Questions Grid */}
          <div className="space-y-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                {currentQuestions.map((q, qIndex) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const qNum = currentIdx * QUESTIONS_PER_PAGE + qIndex + 1;

                  return (
                    <div
                      key={q.id}
                      className={`card-premium p-8 lg:p-10 bg-white dark:bg-dark-surface border-2 transition-all duration-300 ${isAnswered
                          ? 'border-jung-accent/20 dark:border-jung-accent/10 shadow-lg'
                          : 'border-transparent shadow-sm'
                        }`}
                    >
                      <div className="flex gap-6 items-start mb-8">
                        <span className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-display text-lg font-bold transition-colors ${isAnswered ? 'bg-jung-accent text-white' : 'bg-jung-base dark:bg-dark-base text-jung-muted'
                          }`}>
                          {isAnswered ? <CheckCircle2 className="w-6 h-6" /> : qNum}
                        </span>
                        <h3 className="text-xl lg:text-2xl text-jung-dark dark:text-white leading-relaxed font-serif">
                          {q.text}
                        </h3>
                      </div>

                      <div className="grid grid-cols-5 gap-3 lg:gap-6">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const isActive = answers[q.id] === val;
                          const labels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

                          return (
                            <button
                              key={val}
                              onClick={() => handleAnswer(q.id, val)}
                              className={`group relative flex flex-col items-center gap-3 py-4 rounded-2xl transition-all duration-300 ${isActive
                                  ? 'bg-jung-accent text-white shadow-xl shadow-jung-accent/20 scale-105'
                                  : 'bg-jung-base dark:bg-dark-base text-jung-muted hover:bg-jung-accent/5'
                                }`}
                            >
                              <span className="text-xl font-display font-bold">{val}</span>
                              <span className={`text-[8px] uppercase tracking-tighter font-bold text-center px-1 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block ${isActive ? 'opacity-100 text-white' : 'text-jung-muted'
                                }`}>
                                {labels[val - 1]}
                              </span>
                              {isActive && (
                                <motion.div
                                  layoutId={`active-${q.id}`}
                                  className="absolute -inset-1 rounded-2xl border-2 border-jung-accent -z-10"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              disabled={currentIdx === 0}
              className="w-full sm:w-auto px-8 gap-3"
            >
              <ArrowLeft className="w-5 h-5" /> Previous Section
            </Button>

            <div className="flex-1 flex justify-center">
              {!isPageComplete && (
                <div className="flex items-center gap-2 text-jung-accent font-bold text-sm uppercase tracking-widest animate-pulse">
                  <Info className="w-4 h-4" />
                  Answer all to continue
                </div>
              )}
            </div>

            <Button
              variant={isPageComplete ? 'accent' : 'primary'}
              size="lg"
              onClick={handleNext}
              disabled={!isPageComplete}
              className="w-full sm:w-auto px-10 gap-3 shadow-xl shadow-jung-accent/20"
            >
              {currentIdx === totalPages - 1 ? 'Complete Assessment' : 'Next Section'}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>

      {/* Instructional Footer */}
      <footer className="py-12 border-t border-jung-border/30 dark:border-dark-border bg-jung-surface-alt dark:bg-dark-surface-elevated/50 transition-colors">
        <div className="max-w-3xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 gap-10">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-jung-dark dark:text-white">Pro Tip</h4>
              <p className="text-sm text-jung-secondary dark:text-jung-muted leading-relaxed italic font-serif">
                "Don't over-analyze the questions. Your first instinctive reaction usually reflects your primary cognitive mode more accurately than a reasoned response."
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-jung-dark dark:text-white">Keyboard Navigation</h4>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-black/20 border border-jung-border/30 dark:border-dark-border rounded text-[10px] font-bold">
                  <kbd className="opacity-60">1-5</kbd> RATE
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-black/20 border border-jung-border/30 dark:border-dark-border rounded text-[10px] font-bold">
                  <kbd className="opacity-60">ESC</kbd> BACK
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
