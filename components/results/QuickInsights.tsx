import React from 'react';
import { ValidatedAssessmentResults } from '../../lib/validation';
import { FUNCTION_DESCRIPTIONS, THE_GRIP } from '../../data/questions';
import { Compass, AlertTriangle } from 'lucide-react';

interface QuickInsightsProps {
  results: ValidatedAssessmentResults;
}

export const QuickInsights: React.FC<QuickInsightsProps> = ({ results }) => {
  const dominantFunc = results.stack.dominant.function;
  const dominantDesc = FUNCTION_DESCRIPTIONS[dominantFunc];
  const auxiliaryDesc = FUNCTION_DESCRIPTIONS[results.stack.auxiliary.function];
  const inferiorDesc = FUNCTION_DESCRIPTIONS[results.stack.inferior.function];
  const grip = THE_GRIP[dominantFunc as keyof typeof THE_GRIP];

  return (
    <section className="mb-12 card-elevated p-6 md:p-8">
      <h2 className="text-heading text-xl md:text-2xl mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center">
          <Compass className="w-5 h-5 text-jung-accent" />
        </div>
        Quick Insights
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-emerald-50/50 rounded-xl p-6 border border-emerald-200/50">
          <h3 className="font-semibold text-emerald-800 mb-4">Strengths of Your Profile</h3>
          <ul className="space-y-3 text-sm text-emerald-900">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
              <span>Strong in {dominantDesc.title.toLowerCase()}—your natural "Hero" approach.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
              <span>Supported by {auxiliaryDesc.title.toLowerCase()} for balance.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
              <span>{dominantDesc.positive}</span>
            </li>
          </ul>
        </div>

        <div className="bg-amber-50/50 rounded-xl p-6 border border-amber-200/50">
          <h3 className="font-semibold text-amber-800 mb-4">Potential Blind Spots</h3>
          <ul className="space-y-3 text-sm text-amber-900">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
              <span>May underuse {inferiorDesc.title.toLowerCase()} (your inferior function).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
              <span>Risk of over-relying on {dominantFunc}, creating one-sidedness.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
              <span>{dominantDesc.negative}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* The Grip Preview */}
      <div className="bg-jung-surface rounded-xl p-6 mb-8 border border-jung-border">
        <h3 className="font-semibold text-jung-dark mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          The Grip (Stress Response)
        </h3>
        <p className="text-body text-sm text-jung-secondary mb-3">
          Under pressure, your inferior {grip.inferiorFunction} may erupt primitively:
        </p>
        <ul className="text-body text-sm text-jung-secondary space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
            {grip.gripDescription.split('.')[0]}.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
            Feels "not like you"—behaviors seem foreign.
          </li>
        </ul>
      </div>

      {/* Growth Edge */}
      <div className="bg-jung-accent/5 rounded-xl p-6 border-l-4 border-jung-accent">
        <h3 className="font-semibold text-jung-dark mb-3">Your Growth Edge (Individuation Path)</h3>
        <p className="text-body text-sm text-jung-secondary mb-3">
          Jung saw type as starting point—not destiny. Your lower scores (especially {results.stack.inferior.function})
          are unconscious potential: the "treasure hard to attain" (von Franz).
        </p>
        <p className="text-body text-sm text-jung-muted italic">
          <strong>Analogy:</strong> Like a skilled {dominantDesc.title.split(' ')[1]?.toLowerCase() || 'practitioner'} with
          a hidden {inferiorDesc.title.split(' ')[1]?.toLowerCase() || 'analytical'} side—embrace both for fuller self.
        </p>
      </div>

      <div className="mt-8 text-center">
        <p className="text-body text-jung-muted italic text-sm">
          Does this resonate? Reflect on recent stress—did your inferior function suddenly overwhelm you?
        </p>
      </div>
    </section>
  );
};
