import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';
import { calculateResults } from '../utils/scoring';
import { Button } from '../components/ui/Button';
import { ArrowLeft, ArrowRight, CheckCircle2, Keyboard, Sparkles } from 'lucide-react';
import { useSEO, PAGE_SEO } from '../hooks/useSEO';
import { useAssessmentTracking } from '../hooks/useAnalytics';
import { useAssessmentProgress } from '../hooks/useAssessmentStorage';
import { assessmentResultsSchema } from '../lib/validation';
import { useToast } from '../components/ui/Toast';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Success celebration component
const CompletionCelebration: React.FC<{ onComplete: () => void; reducedMotion: boolean }> = ({
  onComplete,
  reducedMotion
}) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, reducedMotion ? 500 : 2000);
    return () => clearTimeout(timer);
  }, [onComplete, reducedMotion]);

  if (reducedMotion) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-jung-dark/90">
        <div className="text-center text-white p-8">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-jung-accent" />
          <h2 className="text-2xl font-serif mb-2">Assessment Complete!</h2>
          <p className="text-jung-subtle">Preparing your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-jung-dark/95">
      <div className="relative text-center text-white p-8 animate-scale-in">
        <div className="relative mb-6">
          <Sparkles className="relative w-20 h-20 mx-auto text-jung-accent" />
        </div>
        <h2 className="text-3xl md:text-4xl font-serif mb-3 animate-slide-up">
          Assessment Complete!
        </h2>
        <p className="text-lg text-jung-subtle animate-slide-up stagger-1">
          Discovering your cognitive profile...
        </p>
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-jung-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-jung-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-jung-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

// Keyboard hints component
const KeyboardHints: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 5000);
    const handleKeyPress = () => setIsVisible(false);
    window.addEventListener('keydown', handleKeyPress, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
      <div className="flex items-center gap-3 px-4 py-2 bg-jung-dark text-white rounded-full text-sm shadow-lg">
        <Keyboard className="w-4 h-4" />
        <span>Press <kbd className="px-2 py-0.5 bg-white/20 rounded text-xs mx-1">1-5</kbd> to answer</span>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 text-white/60 hover:text-white"
          aria-label="Dismiss keyboard hint"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [focusedQuestion, setFocusedQuestion] = useState<number | null>(null);
  const assessmentTracking = useAssessmentTracking();
  const { progress, saveProgress, isLoaded } = useAssessmentProgress();
  const { success, info, ToastContainer } = useToast();
  const reducedMotion = useReducedMotion();
  const lastSavedRef = useRef<number>(0);

  // SEO meta tags
  useSEO(PAGE_SEO.assessment);

  const QUESTIONS_PER_PAGE = 4;
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const currentQuestions = questions.slice(currentIdx * QUESTIONS_PER_PAGE, (currentIdx + 1) * QUESTIONS_PER_PAGE);

  // Load saved progress
  useEffect(() => {
    if (isLoaded && progress) {
      setAnswers(progress.answers);
      setCurrentIdx(progress.currentStep);
      info('Restored your previous progress');
    }
  }, [isLoaded, progress, info]);

  // Derived state
  const isPageComplete = currentQuestions.every(q => answers[q.id] !== undefined);
  const progressPercent = ((currentIdx) / totalPages) * 100;
  const answeredCount = Object.keys(answers).length;
  const scaleLabels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

  // Handlers using refs to avoid circular dependencies in keyboard handler
  const handleAnswer = useCallback((qid: string, value: number) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [qid]: value };

      // Debounced save notification
      const now = Date.now();
      if (now - lastSavedRef.current > 2000) {
        success('Progress saved', 1500);
        lastSavedRef.current = now;
      }

      saveProgress(newAnswers, currentIdx);
      return newAnswers;
    });
  }, [currentIdx, saveProgress, success]);

  const handleNext = useCallback(() => {
    if (currentIdx < totalPages - 1) {
      setCurrentIdx(p => p + 1);
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    } else {
      setShowCelebration(true);

      // Delay calculation and navigation for celebration
      setTimeout(() => {
        const results = calculateResults(answers);
        const validatedResults = assessmentResultsSchema.safeParse(results);

        if (validatedResults.success) {
          localStorage.setItem('jungian_assessment_results', JSON.stringify(validatedResults.data));
          localStorage.removeItem('jungian_assessment_progress');
          navigate('/results');
        } else {
          console.error('Results validation failed:', validatedResults.error);
          localStorage.setItem('jungian_assessment_results', JSON.stringify(results));
          localStorage.removeItem('jungian_assessment_progress');
          navigate('/results');
        }
      }, reducedMotion ? 500 : 2000);
    }
  }, [currentIdx, totalPages, answers, navigate, reducedMotion]);

  const handleBack = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx(p => p - 1);
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }, [currentIdx, reducedMotion]);

  // Refs for keyboard handler to access latest state
  const handleAnswerRef = useRef(handleAnswer);
  const handleNextRef = useRef(handleNext);
  const handleBackRef = useRef(handleBack);
  const currentQuestionsRef = useRef(currentQuestions);
  const focusedQuestionRef = useRef(focusedQuestion);
  const answersRef = useRef(answers);

  // Update refs when values change
  useEffect(() => { handleAnswerRef.current = handleAnswer; }, [handleAnswer]);
  useEffect(() => { handleNextRef.current = handleNext; }, [handleNext]);
  useEffect(() => { handleBackRef.current = handleBack; }, [handleBack]);
  useEffect(() => { currentQuestionsRef.current = currentQuestions; }, [currentQuestions]);
  useEffect(() => { focusedQuestionRef.current = focusedQuestion; }, [focusedQuestion]);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Number keys 1-5 for answering
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const focusedEl = document.activeElement;
        const questionCard = focusedEl?.closest('[data-question-index]');

        if (questionCard) {
          const qIndex = parseInt(questionCard.getAttribute('data-question-index') || '0');
          const question = currentQuestionsRef.current[qIndex];
          if (question) {
            handleAnswerRef.current(question.id, parseInt(e.key));

            // Auto-focus next question
            if (qIndex < currentQuestionsRef.current.length - 1) {
              const nextCard = document.querySelector(`[data-question-index="${qIndex + 1}"]`);
              nextCard?.querySelector('button')?.focus();
            }
          }
        } else if (focusedQuestionRef.current !== null) {
          // If a question is focused via state
          const question = currentQuestionsRef.current[focusedQuestionRef.current];
          if (question) {
            handleAnswerRef.current(question.id, parseInt(e.key));
          }
        }
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && e.metaKey === false && e.ctrlKey === false) {
        const focusedEl = document.activeElement;
        if (focusedEl?.tagName !== 'BUTTON') {
          e.preventDefault();
          handleBackRef.current();
        }
      }

      if (e.key === 'ArrowRight' && !e.shiftKey && e.metaKey === false && e.ctrlKey === false) {
        const focusedEl = document.activeElement;
        // Check page completion dynamically
        const pageComplete = currentQuestionsRef.current.every(q => answersRef.current[q.id] !== undefined);
        if (focusedEl?.tagName !== 'BUTTON' && pageComplete) {
          e.preventDefault();
          handleNextRef.current();
        }
      }

      // Escape to go back
      if (e.key === 'Escape') {
        handleBackRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Empty deps - uses refs

  // Calculate if page was just completed for micro-animation
  const [showCompletionPulse, setShowCompletionPulse] = useState(false);
  const wasPageCompleteRef = useRef(false);

  useEffect(() => {
    if (isPageComplete && !wasPageCompleteRef.current && answeredCount > 0) {
      setShowCompletionPulse(true);
      const timer = setTimeout(() => setShowCompletionPulse(false), 500);
      wasPageCompleteRef.current = true;
      return () => clearTimeout(timer);
    } else if (!isPageComplete) {
      wasPageCompleteRef.current = false;
    }
  }, [isPageComplete, answeredCount]);

  return (
    <>
      <ToastContainer />

      {showCelebration && (
        <CompletionCelebration
          onComplete={() => {}}
          reducedMotion={reducedMotion}
        />
      )}

      <KeyboardHints />

      <div className="min-h-screen bg-jung-base">
        {/* Progress line - thin 2px at top */}
        <div className="sticky top-0 z-50 h-0.5 w-full bg-jung-surface-alt">
          <div
            className="bg-jung-accent h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Progress Header */}
        <div className="sticky top-0.5 z-40 bg-jung-surface border-b border-jung-border">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-ui text-jung-muted uppercase tracking-widest font-serif">
                  Section {currentIdx + 1} of {totalPages}
                </p>
                <h1 className="text-heading text-jung-dark font-serif">
                  Cognitive Functions Assessment
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-jung-muted font-mono">{answeredCount} of {questions.length}</p>
                  <p className="text-xs text-jung-muted">questions answered</p>
                </div>
                <div className={`w-16 h-16 relative transition-transform duration-300 ${showCompletionPulse ? 'scale-110' : ''}`}>
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--color-jung-border)"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={isPageComplete ? 'var(--color-success)' : 'var(--color-jung-accent)'}
                      strokeWidth="2"
                      strokeDasharray={`${(answeredCount / questions.length) * 100}, 100`}
                      className="transition-all duration-500 ease-out"
                      style={{
                        filter: showCompletionPulse ? 'drop-shadow(0 0 8px rgba(31, 122, 103, 0.5))' : 'none'
                      }}
                    />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold font-mono transition-colors duration-300 ${isPageComplete ? 'text-success' : 'text-jung-accent'}`}>
                    {Math.round((answeredCount / questions.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="py-12">
          <div className="max-w-2xl mx-auto px-6">
            {/* Section Progress Dots */}
            <div className="flex justify-center gap-2 mb-12">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIdx(idx);
                    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentIdx
                      ? 'w-8 bg-jung-accent'
                      : idx < currentIdx
                        ? 'bg-jung-accent/50'
                        : 'bg-jung-border'
                  }`}
                  aria-label={`Go to section ${idx + 1}`}
                />
              ))}
            </div>

            <div className="space-y-8">
              {currentQuestions.map((q, qIndex) => {
                const isAnswered = answers[q.id] !== undefined;
                const questionNumber = currentIdx * QUESTIONS_PER_PAGE + qIndex + 1;

                return (
                  <div
                    key={q.id}
                    data-question-index={qIndex}
                    tabIndex={0}
                    onFocus={() => setFocusedQuestion(qIndex)}
                    onBlur={() => setFocusedQuestion(null)}
                    className={`
                      card-elevated p-6 sm:p-8
                      ${reducedMotion ? '' : 'animate-in fade-in slide-in-from-bottom-4'}
                      transition-all duration-300
                      ${isAnswered ? 'ring-2 ring-jung-accent/20' : ''}
                      ${focusedQuestion === qIndex ? 'ring-2 ring-jung-accent/40' : ''}
                    `}
                    style={{ animationDelay: reducedMotion ? '0ms' : `${qIndex * 100}ms` }}
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <span className={`
                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        transition-all duration-300
                        ${isAnswered
                          ? 'bg-jung-accent text-white'
                          : 'bg-jung-surface-alt text-jung-muted'
                        }
                      `}>
                        {isAnswered ? <CheckCircle2 className="w-5 h-5" /> : questionNumber}
                      </span>
                      <h3 className="text-body text-jung-dark leading-relaxed font-serif flex-1">
                        {q.text}
                      </h3>
                    </div>

                    {/* Rating Scale */}
                    <div className="space-y-4">
                      {/* Desktop Labels */}
                      <div className="hidden sm:flex justify-between text-xs text-jung-muted px-1">
                        {scaleLabels.map((label, idx) => (
                          <span key={idx} className="w-12 text-center">{label}</span>
                        ))}
                      </div>

                      {/* Rating Buttons */}
                      <div className="flex justify-between gap-2 sm:gap-4">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            onClick={() => handleAnswer(q.id, val)}
                            className={`
                              relative flex-1 sm:flex-none sm:w-12 h-12 sm:h-14 rounded-lg
                              flex items-center justify-center text-lg font-bold
                              transition-all duration-200 ease-out
                              focus:outline-none focus-visible:ring-2 focus-visible:ring-jung-accent focus-visible:ring-offset-2
                              ${answers[q.id] === val
                                ? 'bg-jung-accent text-white shadow-md'
                                : 'bg-jung-surface-alt text-jung-muted hover:bg-jung-border hover:text-jung-dark'
                              }
                              ${reducedMotion ? '' : 'hover:-translate-y-px'}
                            `}
                            aria-label={`Rate ${val} out of 5: ${scaleLabels[val - 1]}`}
                            aria-pressed={answers[q.id] === val}
                          >
                            {val}
                            {answers[q.id] === val && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-jung-accent animate-scale-in" />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Mobile Labels */}
                      <div className="flex justify-between sm:hidden text-xs text-jung-muted">
                        <span>Disagree</span>
                        <span>Agree</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="mt-12 flex flex-col-reverse sm:flex-row justify-between gap-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentIdx === 0}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Section
                <span className="hidden sm:inline ml-2 text-xs text-jung-muted">← or Esc</span>
              </Button>
              <Button
                variant={isPageComplete ? 'accent' : 'primary'}
                onClick={handleNext}
                disabled={!isPageComplete}
                className={`w-full sm:w-auto`}
              >
                {currentIdx === totalPages - 1 ? (
                  <>
                    Complete Assessment
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next Section
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
                {!isPageComplete && <span className="hidden sm:inline ml-2 text-xs opacity-60">(answer all first)</span>}
              </Button>
            </div>

            {/* Encouragement Message */}
            {!isPageComplete && (
              <p className="text-center text-sm text-jung-muted mt-6">
                Answer all questions in this section to continue
              </p>
            )}

            {/* Completion hint */}
            {isPageComplete && currentIdx < totalPages - 1 && (
              <p className="text-center text-sm text-success mt-6">
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                Section complete! Continue to next section →
              </p>
            )}
          </div>
        </div>

        {/* Tips Footer */}
        <div className="border-t border-jung-border bg-jung-surface-alt">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <h4 className="text-ui text-jung-muted uppercase tracking-widest mb-4 font-serif">Assessment Tips</h4>
            <div className="grid sm:grid-cols-3 gap-6 text-sm text-jung-muted">
              <div>
                <p className="font-serif text-jung-dark mb-1">Be Authentic</p>
                <p>Answer based on how you naturally think and act, not how you wish to be.</p>
              </div>
              <div>
                <p className="font-serif text-jung-dark mb-1">First Instinct</p>
                <p>Go with your gut reaction. Over-thinking often leads to less accurate results.</p>
              </div>
              <div>
                <p className="font-serif text-jung-dark mb-1">Keyboard Shortcut</p>
                <p>Press <kbd className="px-1.5 py-0.5 bg-jung-border rounded text-xs">1-5</kbd> to rate, <kbd className="px-1.5 py-0.5 bg-jung-border rounded text-xs">← →</kbd> to navigate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
