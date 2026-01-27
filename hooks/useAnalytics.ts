import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, AnalyticsEvents, isAnalyticsEnabled } from '../lib/analytics';

/**
 * Hook to track page views on route changes
 * Add this to your App component or Layout
 */
export function usePageTracking() {
  const location = useLocation();
  const trackedPaths = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isAnalyticsEnabled()) return;

    const path = location.pathname + location.hash;
    
    // Avoid duplicate tracking
    if (trackedPaths.current.has(path)) return;
    trackedPaths.current.add(path);

    // Track page view when route changes
    trackPageView(path);
  }, [location]);
}

interface AssessmentTrackingState {
  startTime: number;
  questionStartTimes: Map<number, number>;
  answeredQuestions: Set<number>;
  isTracking: boolean;
}

/**
 * Hook to track assessment progress with validation and error handling
 */
export function useAssessmentTracking() {
  const state = useRef<AssessmentTrackingState>({
    startTime: Date.now(),
    questionStartTimes: new Map(),
    answeredQuestions: new Set(),
    isTracking: false,
  });

  const trackStart = useCallback(() => {
    if (!isAnalyticsEnabled()) return;

    try {
      state.current.startTime = Date.now();
      state.current.isTracking = true;
      state.current.answeredQuestions.clear();
      state.current.questionStartTimes.clear();
      
      AnalyticsEvents.assessmentStarted();
    } catch (error) {
      console.warn('Analytics: Failed to track assessment start:', error);
    }
  }, []);

  const trackProgress = useCallback((questionNumber: number, totalQuestions: number) => {
    if (!isAnalyticsEnabled() || !state.current.isTracking) return;

    try {
      // Validate inputs
      if (questionNumber < 1 || questionNumber > totalQuestions) {
        console.warn('Analytics: Invalid question number:', questionNumber);
        return;
      }

      // Avoid duplicate tracking for same question
      if (state.current.answeredQuestions.has(questionNumber)) return;
      state.current.answeredQuestions.add(questionNumber);

      // Track time spent on previous question
      const now = Date.now();
      state.current.questionStartTimes.set(questionNumber, now);

      AnalyticsEvents.questionAnswered(questionNumber, totalQuestions);
    } catch (error) {
      console.warn('Analytics: Failed to track question progress:', error);
    }
  }, []);

  const trackComplete = useCallback(() => {
    if (!isAnalyticsEnabled() || !state.current.isTracking) return;

    try {
      const timeSpentSeconds = Math.round((Date.now() - state.current.startTime) / 1000);
      
      // Validate time spent (sanity check)
      if (timeSpentSeconds < 10) {
        console.warn('Analytics: Suspiciously fast completion time:', timeSpentSeconds);
      }
      if (timeSpentSeconds > 7200) {
        console.warn('Analytics: Very long completion time:', timeSpentSeconds);
      }

      AnalyticsEvents.assessmentCompleted(Math.min(timeSpentSeconds, 7200));
      state.current.isTracking = false;
    } catch (error) {
      console.warn('Analytics: Failed to track assessment completion:', error);
    }
  }, []);

  const trackAbandon = useCallback((questionNumber: number) => {
    if (!isAnalyticsEnabled() || !state.current.isTracking) return;

    try {
      AnalyticsEvents.assessmentAbandoned(questionNumber);
      state.current.isTracking = false;
    } catch (error) {
      console.warn('Analytics: Failed to track assessment abandon:', error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // If tracking was active, assume abandonment
      if (state.current.isTracking) {
        const lastQuestion = Math.max(...state.current.answeredQuestions, 0);
        trackAbandon(lastQuestion);
      }
    };
  }, [trackAbandon]);

  return {
    trackStart,
    trackProgress,
    trackComplete,
    trackAbandon,
    getProgress: () => ({
      answeredCount: state.current.answeredQuestions.size,
      timeSpent: Math.round((Date.now() - state.current.startTime) / 1000),
      isTracking: state.current.isTracking,
    }),
  };
}

/**
 * Hook to track results interactions
 */
export function useResultsTracking(dominantFunction: string) {
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (!isAnalyticsEnabled() || hasTrackedView.current) return;
    if (!dominantFunction) return;

    try {
      AnalyticsEvents.resultsViewed(dominantFunction);
      hasTrackedView.current = true;
    } catch (error) {
      console.warn('Analytics: Failed to track results view:', error);
    }
  }, [dominantFunction]);

  const trackShare = useCallback((method: 'link' | 'twitter' | 'facebook' | 'linkedin') => {
    if (!isAnalyticsEnabled()) return;

    try {
      AnalyticsEvents.resultsShared(method);
    } catch (error) {
      console.warn('Analytics: Failed to track share:', error);
    }
  }, []);

  const trackSave = useCallback(() => {
    if (!isAnalyticsEnabled()) return;

    try {
      AnalyticsEvents.resultsSaved();
    } catch (error) {
      console.warn('Analytics: Failed to track save:', error);
    }
  }, []);

  return {
    trackShare,
    trackSave,
  };
}

/**
 * Hook to track CTA clicks
 */
export function useCTATracking() {
  return useCallback((ctaName: string, location: string) => {
    if (!isAnalyticsEnabled()) return;

    try {
      if (!ctaName || !location) {
        console.warn('Analytics: CTA name and location are required');
        return;
      }
      AnalyticsEvents.ctaClicked(ctaName, location);
    } catch (error) {
      console.warn('Analytics: Failed to track CTA:', error);
    }
  }, []);
}

/**
 * Hook to track feature usage
 */
export function useFeatureTracking() {
  const trackedFeatures = useRef<Set<string>>(new Set());

  return useCallback((featureName: string) => {
    if (!isAnalyticsEnabled()) return;

    try {
      if (!featureName) {
        console.warn('Analytics: Feature name is required');
        return;
      }

      // Avoid duplicate tracking in same session
      if (trackedFeatures.current.has(featureName)) return;
      trackedFeatures.current.add(featureName);

      AnalyticsEvents.featureUsed(featureName);
    } catch (error) {
      console.warn('Analytics: Failed to track feature usage:', error);
    }
  }, []);
}

/**
 * Hook to track errors
 */
export function useErrorTracking() {
  return useCallback((errorType: string, errorMessage?: string) => {
    if (!isAnalyticsEnabled()) return;

    try {
      AnalyticsEvents.errorOccurred(errorType, errorMessage);
    } catch (error) {
      // Silent fail for error tracking to avoid loops
      console.warn('Analytics: Failed to track error:', error);
    }
  }, []);
}
