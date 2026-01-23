import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';
import { calculateResults } from '../utils/scoring';
import { Button } from '../components/ui/Button';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { useSEO, PAGE_SEO } from '../hooks/useSEO';
import { useAssessmentTracking } from '../hooks/useAnalytics';

export const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const assessmentTracking = useAssessmentTracking();

  // SEO meta tags
  useSEO(PAGE_SEO.assessment);

  const QUESTIONS_PER_PAGE = 4;
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const currentQuestions = questions.slice(currentIdx * QUESTIONS_PER_PAGE, (currentIdx + 1) * QUESTIONS_PER_PAGE);

  useEffect(() => {
    const saved = localStorage.getItem('jungian_assessment_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnswers(parsed.answers || {});
        setCurrentIdx(parsed.currentStep || 0);
      } catch (e) {
        console.error("Failed to load progress", e);
      }
    }
  }, []);

  const handleAnswer = (qid: string, value: number) => {
    const newAnswers = { ...answers, [qid]: value };
    setAnswers(newAnswers);
    localStorage.setItem('jungian_assessment_progress', JSON.stringify({
      answers: newAnswers,
      currentStep: currentIdx
    }));
  };

  const handleNext = () => {
    if (currentIdx < totalPages - 1) {
      setCurrentIdx(p => p + 1);
      window.scrollTo(0, 0);
    } else {
      finishAssessment();
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(p => p - 1);
      window.scrollTo(0, 0);
    }
  };

  const finishAssessment = () => {
    const results = calculateResults(answers);
    localStorage.setItem('jungian_assessment_results', JSON.stringify(results));
    localStorage.removeItem('jungian_assessment_progress');
    navigate('/results');
  };

  const isPageComplete = currentQuestions.every(q => answers[q.id] !== undefined);
  const progress = ((currentIdx) / totalPages) * 100;
  const answeredCount = Object.keys(answers).length;

  const scaleLabels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

  return (
    <div className="min-h-screen bg-jung-surface">
      {/* Progress Header */}
      <div className="sticky top-0 z-40 bg-jung-surface/95 backdrop-blur-sm border-b border-jung-border">
        <div className="editorial-container py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-ui text-jung-muted uppercase tracking-widest">
                Section {currentIdx + 1} of {totalPages}
              </p>
              <h1 className="text-heading text-jung-dark font-serif">
                Cognitive Functions Assessment
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-jung-muted">{answeredCount} of {questions.length}</p>
                <p className="text-xs text-jung-muted">questions answered</p>
              </div>
              <div className="w-16 h-16 relative">
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
                    stroke="var(--color-jung-accent)"
                    strokeWidth="2"
                    strokeDasharray={`${(answeredCount / questions.length) * 100}, 100`}
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-jung-accent">
                  {Math.round((answeredCount / questions.length) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-jung-border h-1 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-jung-accent to-jung-accent-hover h-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="editorial-container py-12">
        <div className="max-w-3xl mx-auto">
          {/* Section Progress Dots */}
          <div className="flex justify-center gap-2 mb-12">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIdx(idx);
                  window.scrollTo(0, 0);
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
                  className={`
                    card-elevated p-6 sm:p-8
                    animate-in fade-in slide-in-from-bottom-4
                    transition-all duration-300
                    ${isAnswered ? 'ring-2 ring-jung-accent/20' : ''}
                  `}
                  style={{ animationDelay: `${qIndex * 100}ms` }}
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
                              ? 'bg-jung-accent text-white scale-105 shadow-lg shadow-jung-accent/25'
                              : 'bg-jung-surface-alt text-jung-muted hover:bg-jung-border hover:text-jung-dark'
                            }
                          `}
                          aria-label={`Rate ${val} out of 5: ${scaleLabels[val - 1]}`}
                        >
                          {val}
                          {answers[q.id] === val && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-jung-accent" />
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
            </Button>
            <Button
              variant={isPageComplete ? 'accent' : 'primary'}
              onClick={handleNext}
              disabled={!isPageComplete}
              className="w-full sm:w-auto"
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
            </Button>
          </div>

          {/* Encouragement Message */}
          {!isPageComplete && (
            <p className="text-center text-sm text-jung-muted mt-6 animate-pulse">
              Answer all questions in this section to continue
            </p>
          )}
        </div>
      </div>

      {/* Tips Footer */}
      <div className="border-t border-jung-border bg-jung-surface-alt">
        <div className="editorial-container py-8">
          <div className="max-w-3xl mx-auto">
            <h4 className="text-ui text-jung-muted uppercase tracking-widest mb-4">Assessment Tips</h4>
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
                <p className="font-serif text-jung-dark mb-1">No Right Answers</p>
                <p>There are no good or bad responses—only your honest self-reflection.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
