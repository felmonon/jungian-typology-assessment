import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSEO, PAGE_SEO } from '../hooks/useSEO';
import { ErrorBoundary } from '../components/ErrorBoundary';
import {
  HeroSection,
  SocialProofBar,
  ProblemSection,
  ScientificValidationSection,
  HowItWorksSection,
  AITypeCoachSection,
  DifferentiatorsSection,
  ComparisonTableSection,
  PricingSection,
  TestimonialsSection,
  FAQSection,
  FinalCTASection,
  ExitIntentPopup,
} from '../components/home';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);

  // SEO meta tags
  useSEO(PAGE_SEO.home);

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShownPopup) {
        setShowExitPopup(true);
        setHasShownPopup(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShownPopup]);

  const handleStartAssessment = () => {
    navigate('/assessment');
  };

  const handleLearnMore = () => {
    navigate('/learn');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col">
        <HeroSection 
          onStartAssessment={handleStartAssessment} 
          onLearnMore={handleLearnMore} 
        />
        <SocialProofBar />
        <ProblemSection />
        <ScientificValidationSection />
        <HowItWorksSection onStartAssessment={handleStartAssessment} />
        <AITypeCoachSection />
        <DifferentiatorsSection />
        <ComparisonTableSection />
        <PricingSection onNavigate={handleNavigate} />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection onStartAssessment={handleStartAssessment} />
        
        <ExitIntentPopup
          isOpen={showExitPopup}
          onClose={() => setShowExitPopup(false)}
          onStartAssessment={handleStartAssessment}
        />
      </div>
    </ErrorBoundary>
  );
};
