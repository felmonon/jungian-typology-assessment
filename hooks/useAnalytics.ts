import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/analytics';

/**
 * Hook to track page views on route changes
 * Add this to your App component or Layout
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Track page view when route changes
    trackPageView(location.pathname + location.hash);
  }, [location]);
}

/**
 * Hook to track assessment progress
 */
export function useAssessmentTracking() {
  const startTime = Date.now();

  return {
    trackStart: () => {
      import('../lib/analytics').then(({ AnalyticsEvents }) => {
        AnalyticsEvents.assessmentStarted();
      });
    },
    trackProgress: (questionNumber: number, totalQuestions: number) => {
      import('../lib/analytics').then(({ AnalyticsEvents }) => {
        AnalyticsEvents.questionAnswered(questionNumber, totalQuestions);
      });
    },
    trackComplete: () => {
      const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
      import('../lib/analytics').then(({ AnalyticsEvents }) => {
        AnalyticsEvents.assessmentCompleted(timeSpentSeconds);
      });
    },
    trackAbandon: (questionNumber: number) => {
      import('../lib/analytics').then(({ AnalyticsEvents }) => {
        AnalyticsEvents.assessmentAbandoned(questionNumber);
      });
    },
  };
}
