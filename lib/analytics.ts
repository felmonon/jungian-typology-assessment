// Google Analytics 4 integration with validation
import { z } from 'zod';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Validation schemas for analytics events
const EventParamsSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean()])
);

const PageViewSchema = z.object({
  page_path: z.string().min(1).max(500),
  page_title: z.string().min(1).max(200),
});

const AssessmentEventSchema = z.object({
  time_spent_seconds: z.number().min(0).max(7200).optional(), // Max 2 hours
  question_number: z.number().min(1).max(200).optional(),
  progress_percent: z.number().min(0).max(100).optional(),
});

const ResultsEventSchema = z.object({
  dominant_function: z.enum(['Te', 'Ti', 'Fe', 'Fi', 'Se', 'Si', 'Ne', 'Ni']).optional(),
  share_method: z.enum(['link', 'twitter', 'facebook', 'linkedin']).optional(),
});

const PurchaseEventSchema = z.object({
  plan: z.string().min(1).max(50),
  value: z.number().min(0).max(10000),
  currency: z.string().length(3).default('USD'),
});

const CTAEventSchema = z.object({
  cta_name: z.string().min(1).max(100),
  location: z.string().min(1).max(100),
});

// Safe tracking helper with validation
function safeTrackEvent(
  eventName: string,
  params?: Record<string, any>,
  schema?: z.ZodSchema<any>
): boolean {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) {
    return false;
  }

  try {
    // Validate params if schema provided
    if (schema && params) {
      const result = schema.safeParse(params);
      if (!result.success) {
        console.warn(`Analytics: Invalid params for event "${eventName}":`, result.error.format());
        // Still track the event, but without invalid params
        window.gtag('event', eventName, {});
        return true;
      }
    }

    window.gtag('event', eventName, params || {});
    return true;
  } catch (error) {
    console.error(`Analytics: Failed to track event "${eventName}":`, error);
    return false;
  }
}

// Initialize Google Analytics
export function initAnalytics(): boolean {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') {
    console.warn('Analytics: GA_MEASUREMENT_ID not configured');
    return false;
  }

  try {
    // Check if already initialized
    if (window.gtag && window.dataLayer) {
      return true;
    }

    // Add gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false, // We'll handle page views manually for SPA
      cookie_flags: 'SameSite=None;Secure',
      allow_google_signals: false, // Privacy focused
      allow_ad_personalization_signals: false, // Privacy focused
    });

    return true;
  } catch (error) {
    console.error('Analytics: Failed to initialize:', error);
    return false;
  }
}

// Track page views (call on route change)
export function trackPageView(path: string, title?: string): boolean {
  const params = {
    page_path: path,
    page_title: title || document.title,
  };

  const validation = PageViewSchema.safeParse(params);
  if (!validation.success) {
    console.warn('Analytics: Invalid page view params:', validation.error.format());
    return false;
  }

  return safeTrackEvent('page_view', params);
}

// Track custom events
export function trackEvent(
  eventName: string,
  params?: Record<string, any>
): boolean {
  // Validate event name
  if (!eventName || typeof eventName !== 'string' || eventName.length > 100) {
    console.warn('Analytics: Invalid event name');
    return false;
  }

  // Sanitize event name (GA4 requirements)
  const sanitizedName = eventName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .substring(0, 40);

  return safeTrackEvent(sanitizedName, params);
}

// Predefined events for the assessment with validation
export const AnalyticsEvents = {
  // Assessment funnel
  assessmentStarted: () => {
    return safeTrackEvent('assessment_started');
  },
  
  assessmentCompleted: (timeSpentSeconds: number) => {
    const params = { time_spent_seconds: Math.round(timeSpentSeconds) };
    const validation = AssessmentEventSchema.safeParse(params);
    if (!validation.success) {
      console.warn('Analytics: Invalid completion params:', validation.error.format());
    }
    return safeTrackEvent('assessment_completed', params, AssessmentEventSchema);
  },
  
  assessmentAbandoned: (questionNumber: number) => {
    const params = { question_number: Math.round(questionNumber) };
    return safeTrackEvent('assessment_abandoned', params, AssessmentEventSchema);
  },

  // Question progress
  questionAnswered: (questionNumber: number, totalQuestions: number) => {
    const progressPercent = totalQuestions > 0 
      ? Math.round((questionNumber / totalQuestions) * 100)
      : 0;
    
    const params = {
      question_number: Math.round(questionNumber),
      progress_percent: Math.min(100, Math.max(0, progressPercent)),
    };
    return safeTrackEvent('question_answered', params, AssessmentEventSchema);
  },

  // Results
  resultsViewed: (dominantFunction: string) => {
    const validFunctions = ['Te', 'Ti', 'Fe', 'Fi', 'Se', 'Si', 'Ne', 'Ni'];
    const func = validFunctions.includes(dominantFunction) ? dominantFunction : 'unknown';
    const params = { dominant_function: func };
    return safeTrackEvent('results_viewed', params, ResultsEventSchema);
  },
  
  resultsShared: (method: 'link' | 'twitter' | 'facebook' | 'linkedin') => {
    const validMethods = ['link', 'twitter', 'facebook', 'linkedin'];
    const shareMethod = validMethods.includes(method) ? method : 'unknown';
    const params = { share_method: shareMethod };
    return safeTrackEvent('results_shared', params, ResultsEventSchema);
  },
  
  resultsSaved: () => {
    return safeTrackEvent('results_saved');
  },

  // Conversions
  signupStarted: () => {
    return safeTrackEvent('signup_started');
  },
  
  signupCompleted: () => {
    return safeTrackEvent('signup_completed');
  },
  
  purchaseStarted: (plan: string, price: number) => {
    const params = {
      plan: String(plan).substring(0, 50),
      value: Math.max(0, Number(price)),
      currency: 'USD',
    };
    return safeTrackEvent('begin_checkout', params, PurchaseEventSchema);
  },
  
  purchaseCompleted: (plan: string, price: number) => {
    const params = {
      plan: String(plan).substring(0, 50),
      value: Math.max(0, Number(price)),
      currency: 'USD',
    };
    return safeTrackEvent('purchase', params, PurchaseEventSchema);
  },

  // Engagement
  theoryPageViewed: () => {
    return safeTrackEvent('theory_page_viewed');
  },
  
  aboutPageViewed: () => {
    return safeTrackEvent('about_page_viewed');
  },
  
  ctaClicked: (ctaName: string, location: string) => {
    const params = {
      cta_name: String(ctaName).substring(0, 100),
      location: String(location).substring(0, 100),
    };
    return safeTrackEvent('cta_clicked', params, CTAEventSchema);
  },

  // Error tracking
  errorOccurred: (errorType: string, errorMessage?: string) => {
    const params = {
      error_type: String(errorType).substring(0, 50),
      error_message: errorMessage ? String(errorMessage).substring(0, 150) : undefined,
    };
    return safeTrackEvent('error_occurred', params);
  },

  // Performance tracking
  pageLoadTime: (loadTimeMs: number) => {
    const params = {
      load_time_ms: Math.round(loadTimeMs),
    };
    return safeTrackEvent('page_load_time', params);
  },

  // Feature usage
  featureUsed: (featureName: string) => {
    const params = {
      feature_name: String(featureName).substring(0, 50),
    };
    return safeTrackEvent('feature_used', params);
  },
};

// Analytics state tracking
interface AnalyticsState {
  isInitialized: boolean;
  lastEventTime: number;
  eventCount: number;
  errors: string[];
}

const analyticsState: AnalyticsState = {
  isInitialized: false,
  lastEventTime: 0,
  eventCount: 0,
  errors: [],
};

// Rate limiting helper
export function canTrackEvent(): boolean {
  const now = Date.now();
  const timeSinceLastEvent = now - analyticsState.lastEventTime;
  
  // Limit to 100 events per minute
  if (timeSinceLastEvent < 600 && analyticsState.eventCount > 100) {
    return false;
  }
  
  // Reset counter after a minute
  if (timeSinceLastEvent > 60000) {
    analyticsState.eventCount = 0;
  }
  
  return true;
}

// Get analytics status (for debugging)
export function getAnalyticsStatus(): AnalyticsState {
  return { ...analyticsState };
}

// Enable/disable analytics
let analyticsEnabled = true;

export function setAnalyticsEnabled(enabled: boolean): void {
  analyticsEnabled = enabled;
  if (!enabled && typeof window !== 'undefined') {
    // Clear any pending events
    window.dataLayer = [];
  }
}

export function isAnalyticsEnabled(): boolean {
  return analyticsEnabled;
}
