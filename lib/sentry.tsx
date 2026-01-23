import * as Sentry from '@sentry/react';

export function initSentry() {
  // Only initialize in production
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: 0.1, // Capture 10% of transactions
      // Session Replay
      replaysSessionSampleRate: 0.1, // Capture 10% of sessions
      replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors

      // Set environment
      environment: import.meta.env.MODE,

      // Filter out common non-actionable errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'Non-Error promise rejection captured',
        /Loading chunk \d+ failed/,
      ],
    });
  }
}

// Error boundary fallback component
export const SentryErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen flex items-center justify-center bg-jung-surface px-4">
    <div className="text-center max-w-md">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
        <span className="text-3xl">⚠️</span>
      </div>
      <h1 className="text-xl font-serif font-bold text-jung-dark mb-3">Something went wrong</h1>
      <p className="text-jung-secondary mb-6 text-sm">
        We've been notified and are working to fix this. Please try refreshing the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-jung-accent text-white rounded-lg hover:bg-jung-accent/90 transition-colors"
      >
        Refresh Page
      </button>
      {import.meta.env.DEV && (
        <pre className="mt-4 p-4 bg-gray-100 rounded text-left text-xs overflow-auto max-h-40">
          {error.message}
        </pre>
      )}
    </div>
  </div>
);
