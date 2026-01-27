import React from 'react';
import { ValidatedAssessmentResults } from '../../lib/validation';
import { FUNCTION_DESCRIPTIONS } from '../../data/questions';

interface ResultsHeaderProps {
  results: ValidatedAssessmentResults;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({ results }) => {
  const dominantFunc = results.stack.dominant.function;
  const dominantDesc = FUNCTION_DESCRIPTIONS[dominantFunc];

  return (
    <>
      {/* Header */}
      <div className="text-center mb-12 md:mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-jung-accent/10 mb-6">
          <span className="text-jung-accent font-serif text-3xl">ψ</span>
        </div>
        <h1 className="text-display text-3xl sm:text-4xl md:text-5xl mb-4">Your Jungian Profile</h1>
        <p className="text-body text-jung-muted max-w-2xl mx-auto">
          An in-depth analysis of your conscious preferences and unconscious tendencies, based on Carl Jung's theory of psychological types.
        </p>
        <p className="text-xs text-jung-muted/70 mt-3 italic font-serif">
          "Every individual is an exception to the rule." — C.G. Jung
        </p>
      </div>

      {/* Type Summary Banner */}
      <div className="bg-gradient-to-r from-jung-accent to-jung-accent-hover text-white p-6 md:p-8 rounded-2xl mb-12 shadow-lg shadow-jung-accent/20">
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest opacity-80 mb-3">Your Dominant Function</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-3">
            {dominantDesc.title} ({dominantFunc})
          </h2>
          <p className="text-lg opacity-90 italic font-serif">"{dominantDesc.quote}"</p>
        </div>
      </div>
    </>
  );
};
