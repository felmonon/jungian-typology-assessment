import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { AnalyticsEvents } from './data';
import { TypeJungMark } from '../brand/TypeJungMark';

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
    <div className="fixed inset-0 bg-jung-dark/60 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-jung-surface rounded-2xl max-w-md w-full p-8 relative shadow-xl border border-jung-border animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-jung-muted hover:text-jung-dark transition-colors p-2"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-jung-accent-light rounded-full flex items-center justify-center mx-auto mb-6">
            <TypeJungMark size="md" />
          </div>

          <h3 className="text-display text-2xl text-jung-dark mb-4">
            Still unsure which type you are?
          </h3>

          <p className="text-body text-jung-secondary mb-6">
            If four-letter tests keep changing, the issue may be the format. TypeJung maps the function pattern underneath the label so you can compare it with your lived experience.
          </p>

          <div className="bg-jung-base rounded-xl p-4 mb-6 text-left border border-jung-border">
            <p className="text-sm font-serif text-jung-dark mb-2">
              Your free result includes:
            </p>
            <p className="text-sm text-jung-secondary">
              an 8-function energy map, your dominant-inferior axis, and a plain-language starting point for reflection.
            </p>
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
            className="mt-4 text-sm font-serif text-jung-muted hover:text-jung-dark transition-colors"
          >
            No thanks, I'll pass
          </button>
        </div>
      </div>
    </div>
  );
};
