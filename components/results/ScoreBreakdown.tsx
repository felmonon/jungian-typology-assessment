import React, { useMemo } from 'react';
import { ValidatedAssessmentResults } from '../../lib/validation';
import { FUNCTION_DESCRIPTIONS } from '../../data/questions';

interface ScoreBreakdownProps {
  results: ValidatedAssessmentResults;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ results }) => {
  const sortedScores = useMemo(() =>
    [...results.scores].sort((a, b) => b.score - a.score),
    [results.scores]
  );

  return (
    <section className="mb-12">
      <h2 className="text-heading text-xl md:text-2xl mb-6 border-b border-jung-border pb-3 font-serif">Your 8-Function Scores</h2>
      <p className="text-body text-sm text-jung-muted mb-6">High scores = conscious habits. Low scores = potential blind spots (unconscious potential).</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sortedScores.map((item) => (
          <div key={item.function} className="card-elevated p-4 flex items-center justify-between hover:-translate-y-px hover:shadow-md transition-all">
            <div className="flex flex-col">
              <span className="text-ui font-semibold text-jung-dark font-serif">{FUNCTION_DESCRIPTIONS[item.function].title}</span>
              <span className="text-xs text-jung-muted">{item.function}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 bg-jung-surface-alt h-2 rounded-full overflow-hidden">
                <div
                  className="bg-jung-accent h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <span className="font-mono font-bold text-jung-accent w-8 text-right">{item.score}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
