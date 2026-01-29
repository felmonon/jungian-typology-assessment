import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { HOW_IT_WORKS_STEPS, AnalyticsEvents } from './data';

interface HowItWorksSectionProps {
  onStartAssessment: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onStartAssessment }) => {
  const handleStart = () => {
    AnalyticsEvents.ctaClicked('start_assessment', 'how_it_works');
    onStartAssessment();
  };

  return (
    <section className="py-20 lg:py-28">
      <div className="editorial-container">
        <div className="text-center mb-16">
          <h2 className="text-display text-3xl sm:text-4xl text-jung-dark mb-4">
            Three steps to actual self-understanding
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {HOW_IT_WORKS_STEPS.map((item, index) => (
            <div key={index} className="card-elevated p-8 relative transition-transform duration-200 hover:-translate-y-px">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-jung-accent text-white text-lg font-serif font-bold mb-4">
                {item.step}
              </span>
              <h3 className="text-heading text-xl text-jung-dark mt-4 mb-3">{item.title}</h3>
              <p className="text-body text-jung-secondary">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button size="lg" onClick={handleStart}>
            Take the Assessment — It's Free <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <p className="text-sm font-serif text-jung-muted mt-4">
            <span className="text-jung-accent font-medium">12,847 people</span> discovered their type this month
          </p>
        </div>
      </div>
    </section>
  );
};
