import React from 'react';
import { Loader2 } from 'lucide-react';

interface ResultsLoadingProps {
  message?: string;
}

export const ResultsLoading: React.FC<ResultsLoadingProps> = ({
  message = 'Loading your results...'
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-jung-base">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-jung-accent" />
        <p className="text-body text-jung-muted font-serif">{message}</p>
      </div>
    </div>
  );
};

export const ResultsError: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-jung-base p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-heading text-xl text-jung-dark mb-2 font-serif">Unable to Load Results</h2>
        <p className="text-body text-jung-secondary mb-6">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-jung-accent text-white rounded-lg hover:bg-jung-accent-hover hover:-translate-y-px hover:shadow-md transition-all"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export const AuthRequired: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-jung-base p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-jung-accent-light flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-jung-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-heading text-xl text-jung-dark mb-2 font-serif">Sign In Required</h2>
        <p className="text-body text-jung-secondary mb-6">
          Please sign in to view your assessment results and access your personalized insights.
        </p>
        <button
          onClick={onLoginClick}
          className="px-6 py-3 bg-jung-accent text-white rounded-lg hover:bg-jung-accent-hover hover:-translate-y-px hover:shadow-md transition-all"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};
