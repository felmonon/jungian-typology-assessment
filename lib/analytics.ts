// Google Analytics 4 integration

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export function initAnalytics() {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;

  // Add gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll handle page views manually for SPA
  });
}

// Track page views (call on route change)
export function trackPageView(path: string, title?: string) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });
}

// Track custom events
export function trackEvent(
  eventName: string,
  params?: Record<string, any>
) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, params);
}

// Predefined events for the assessment
export const AnalyticsEvents = {
  // Assessment funnel
  assessmentStarted: () => trackEvent('assessment_started'),
  assessmentCompleted: (timeSpentSeconds: number) =>
    trackEvent('assessment_completed', { time_spent_seconds: timeSpentSeconds }),
  assessmentAbandoned: (questionNumber: number) =>
    trackEvent('assessment_abandoned', { question_number: questionNumber }),

  // Question progress
  questionAnswered: (questionNumber: number, totalQuestions: number) =>
    trackEvent('question_answered', {
      question_number: questionNumber,
      progress_percent: Math.round((questionNumber / totalQuestions) * 100),
    }),

  // Results
  resultsViewed: (dominantFunction: string) =>
    trackEvent('results_viewed', { dominant_function: dominantFunction }),
  resultsShared: (method: 'link' | 'twitter' | 'facebook') =>
    trackEvent('results_shared', { share_method: method }),
  resultsSaved: () => trackEvent('results_saved'),

  // Conversions
  signupStarted: () => trackEvent('signup_started'),
  signupCompleted: () => trackEvent('signup_completed'),
  purchaseStarted: (plan: string, price: number) =>
    trackEvent('begin_checkout', { plan, value: price, currency: 'USD' }),
  purchaseCompleted: (plan: string, price: number) =>
    trackEvent('purchase', { plan, value: price, currency: 'USD' }),

  // Engagement
  theoryPageViewed: () => trackEvent('theory_page_viewed'),
  aboutPageViewed: () => trackEvent('about_page_viewed'),
  ctaClicked: (ctaName: string, location: string) =>
    trackEvent('cta_clicked', { cta_name: ctaName, location }),
};
