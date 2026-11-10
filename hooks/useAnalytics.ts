import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, AnalyticsEvents, isAnalyticsEnabled } from '../lib/analytics';
import { captureAcquisitionSourceFromLocation } from '../lib/acquisition-source';

const analyticsAttribution = (acquisition: ReturnType<typeof captureAcquisitionSourceFromLocation>) => ({
  utmCampaign: acquisition?.utmCampaign,
  utmSource: acquisition?.utmSource,
  sharedResult: acquisition?.sharedResult,
  parentSource: acquisition?.parentSource,
  sourceChain: acquisition?.sourceChain,
});

/**
 * Hook to track page views on route changes
 * Add this to your App component or Layout
 */
export function usePageTracking() {
  const location = useLocation();
  const trackedPaths = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fullPath = `${location.pathname}${location.search}${location.hash}`;
    const analyticsPath = location.pathname;
    captureAcquisitionSourceFromLocation(location.search, fullPath, document.referrer);

    if (!isAnalyticsEnabled()) return;

    // Avoid duplicate tracking
    if (trackedPaths.current.has(analyticsPath)) return;
    trackedPaths.current.add(analyticsPath);

    // Track page view when route changes
    trackPageView(analyticsPath);
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

      const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const acquisition = captureAcquisitionSourceFromLocation(window.location.search, path, document.referrer);

      AnalyticsEvents.assessmentStarted(acquisition?.source || 'assessment_page', path, analyticsAttribution(acquisition));
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

      const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const acquisition = captureAcquisitionSourceFromLocation(window.location.search, path, document.referrer);

      AnalyticsEvents.assessmentCompleted(
        Math.min(timeSpentSeconds, 7200),
        acquisition?.source || 'assessment_page',
        path,
        analyticsAttribution(acquisition),
      );
      state.current.isTracking = false;
    } catch (error) {
      console.warn('Analytics: Failed to track assessment completion:', error);
    }
  }, []);

  const trackAbandon = useCallback((questionNumber: number) => {
    if (!isAnalyticsEnabled() || !state.current.isTracking) return;

    try {
      const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const acquisition = captureAcquisitionSourceFromLocation(window.location.search, path, document.referrer);

      AnalyticsEvents.assessmentAbandoned(questionNumber, acquisition?.source || 'assessment_page', analyticsAttribution(acquisition));
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
