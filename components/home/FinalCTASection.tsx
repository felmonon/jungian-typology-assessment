import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { AnalyticsEvents } from './data';

interface FinalCTASectionProps {
  onStartAssessment: () => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({ onStartAssessment }) => {
  const handleStart = () => {
    AnalyticsEvents.ctaClicked('start_assessment', 'final_cta');
    onStartAssessment();
  };

  return (
    <section className="py-20 lg:py-28 bg-jung-dark">
      <div className="editorial-container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-display text-3xl sm:text-4xl text-white mb-6">
            You're 15 minutes away from finally understanding yourself
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto leading-relaxed">
            Join 12,847 others who stopped guessing and started knowing. No signup. No payment. Just answers.
          </p>
          <Button
            variant="inverted"
            size="lg"
            onClick={handleStart}
            className="group"
          >
            Start My Free Assessment Now
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <p className="text-white/50 text-sm font-serif mt-6">
            Takes 15 minutes · Results are instant · 100% free
          </p>
        </div>
      </div>
    </section>
  );
};
