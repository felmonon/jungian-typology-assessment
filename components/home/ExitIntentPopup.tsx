import React from 'react';
import { X, Compass, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { AnalyticsEvents } from './data';

interface ExitIntentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAssessment: () => void;
}

export const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({ 
  isOpen, 
  onClose, 
  onStartAssessment 
}) => {
  if (!isOpen) return null;

  const handleStart = () => {
    AnalyticsEvents.ctaClicked('start_assessment', 'exit_popup');
    onStartAssessment();
  };

  return (
    <div className="fixed inset-0 bg-jung-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-jung-surface rounded-2xl max-w-md w-full p-8 relative shadow-2xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-jung-muted hover:text-jung-dark transition-colors p-2"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-jung-accent-light rounded-full flex items-center justify-center mx-auto mb-6">
            <Compass className="w-8 h-8 text-jung-accent" />
          </div>

          <h3 className="text-display text-2xl text-jung-dark mb-4">
            Still unsure which type you are?
          </h3>

          <p className="text-body text-jung-secondary mb-6">
            You're not alone. <strong>73% of people</strong> get different MBTI results each time they test. Our assessment measures all 8 functions independently—finally giving you consistent, accurate results.
          </p>

          <div className="bg-jung-base rounded-xl p-4 mb-6 text-left border border-jung-border">
            <p className="text-sm italic text-jung-secondary">
              "I've taken MBTI tests 20 times and always got different results. This finally explained why."
            </p>
            <p className="text-xs font-sans text-jung-muted mt-2">— Sarah K.</p>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleStart}
          >
            Try the Free Assessment <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          <button
            onClick={onClose}
            className="mt-4 text-sm font-sans text-jung-muted hover:text-jung-dark transition-colors"
          >
            No thanks, I'll pass
          </button>
        </div>
      </div>
    </div>
  );
};
