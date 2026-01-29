import React from 'react';
import { Beaker, Brain, CheckCircle } from 'lucide-react';

export const ScientificValidationSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-jung-surface border-y border-jung-border">
      <div className="editorial-container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-jung-accent-light rounded-full mb-6">
            <Beaker className="w-4 h-4 text-jung-accent" />
            <span className="text-sm font-serif font-medium text-jung-accent">Why 132 Questions?</span>
          </div>
          <h2 className="text-display text-3xl sm:text-4xl text-jung-dark mb-4">
            Built on Scientific Methodology
          </h2>
          <p className="text-body text-lg text-jung-secondary max-w-2xl mx-auto">
            This isn't another 10-minute quiz. We use a validated approach that captures the true complexity of your psyche.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Singer-Loomis Card */}
          <div className="card-elevated p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-jung-accent-light rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-jung-accent" />
              </div>
              <div>
                <h3 className="text-heading text-xl text-jung-dark">Singer-Loomis Methodology</h3>
                <p className="text-sm font-serif text-jung-muted mt-1">Peer-reviewed since 1980</p>
              </div>
            </div>
            <p className="text-body text-jung-secondary mb-6">
              Unlike MBTI's forced-choice format that assumes you're either Thinking OR Feeling, we measure each of the 8 cognitive functions <strong>independently</strong>. This reveals your unique profile—not a box you're forced into.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-jung-secondary">
                <CheckCircle className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                <span>Each function scored on its own scale</span>
              </li>
              <li className="flex items-start gap-3 text-jung-secondary">
                <CheckCircle className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                <span>No false dichotomies or forced choices</span>
              </li>
              <li className="flex items-start gap-3 text-jung-secondary">
                <CheckCircle className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                <span>Reveals nuanced function development</span>
              </li>
            </ul>
          </div>

          {/* Scientific Validation Card */}
          <div className="card-elevated p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-jung-accent-light rounded-xl flex items-center justify-center flex-shrink-0">
                <Beaker className="w-6 h-6 text-jung-accent" />
              </div>
              <div>
                <h3 className="text-heading text-xl text-jung-dark">Scientific Validation</h3>
                <p className="text-sm font-serif text-jung-muted mt-1">Grounded in research</p>
              </div>
            </div>
            <p className="text-body text-jung-secondary mb-6">
              132 questions isn't arbitrary. It's the minimum needed to reliably measure 8 distinct cognitive functions with proper statistical validity—something 10-question quizzes simply cannot do.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-jung-secondary">
                <CheckCircle className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                <span>~16 questions per function for reliability</span>
              </li>
              <li className="flex items-start gap-3 text-jung-secondary">
                <CheckCircle className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                <span>Stress/grip probes for accuracy</span>
              </li>
              <li className="flex items-start gap-3 text-jung-secondary">
                <CheckCircle className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                <span>Based on Jung's original clinical work</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
