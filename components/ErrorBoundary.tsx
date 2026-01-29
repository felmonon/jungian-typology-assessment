import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ error, errorInfo });
    
    // Optional callback for external error tracking (e.g., Sentry)
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;
    
    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      return (
        <DefaultErrorFallback 
          error={error}
          onReset={this.handleReset}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
  onReload: () => void;
  onGoHome: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  onReset,
  onReload,
  onGoHome,
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="min-h-screen bg-jung-surface flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-jung-base rounded-2xl shadow-xl border border-jung-border p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-display text-2xl text-jung-dark mb-3">
          Something went wrong
        </h1>

        {/* Message */}
        <p className="text-body text-jung-secondary mb-6">
          We apologize for the inconvenience. An unexpected error has occurred.
          You can try refreshing the page or go back to the home page.
        </p>

        {/* Error message (if available) */}
        {error?.message && (
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-jung-accent hover:underline"
            >
              {showDetails ? 'Hide' : 'Show'} error details
            </button>
            {showDetails && (
              <div className="mt-3 p-4 bg-red-50 rounded-lg text-left">
                <p className="text-sm text-red-800 font-mono break-all">
                  {error.message}
                </p>
                {error.stack && (
                  <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onReload} variant="accent">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Page
          </Button>
          <Button onClick={onGoHome} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>

        {/* Support info */}
        <p className="mt-6 text-xs text-jung-muted">
          If this problem persists, please contact support with the error details above.
        </p>
      </div>
    </div>
  );
};

/**
 * Specialized error boundary for the assessment flow
 */
export class AssessmentErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AssessmentErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    // Clear potentially corrupted progress
    localStorage.removeItem('jungian_assessment_progress');
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleStartOver = (): void => {
    localStorage.removeItem('jungian_assessment_progress');
    localStorage.removeItem('jungian_assessment_results');
    window.location.href = '/assessment';
  };

  render(): ReactNode {
    const { hasError } = this.state;
    const { fallback, children } = this.props;
    
    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="min-h-screen bg-jung-surface flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-jung-base rounded-2xl shadow-xl border border-jung-border p-8 text-center">
            <div className="w-20 h-20 bg-jung-accent-light rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-jung-accent" />
            </div>

            <h1 className="text-display text-2xl text-jung-dark mb-3">
              Assessment Error
            </h1>

            <p className="text-body text-jung-secondary mb-6">
              We encountered an issue while processing your assessment. 
              Your progress has been saved. You can retry or start fresh.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleRetry} variant="accent">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button onClick={this.handleStartOver} variant="outline">
                Start Over
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Error boundary wrapper for API-related errors
 */
export class APIErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): State {
    // Only catch API-related errors
    if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('API')) {
      return { hasError: true, error, errorInfo: null };
    }
    throw error; // Re-throw if not an API error
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('APIErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    const { hasError } = this.state;
    const { fallback, children } = this.props;
    
    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h3 className="text-heading text-lg text-red-800 mb-2">Connection Error</h3>
          <p className="text-body text-red-600 text-sm mb-4">
            Unable to connect to our servers. Please check your internet connection and try again.
          </p>
          <Button onClick={this.handleRetry} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      );
    }

    return children;
  }
}

// Hook for async error handling
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError(err);
    } else {
      setError(new Error(String(err)));
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}
