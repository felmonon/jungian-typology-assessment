import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle, FileText, Layers, AlertTriangle, Heart, Briefcase, Compass, RefreshCcw, Download, Shield } from 'lucide-react';
import { TypeJungMark } from '../components/brand/TypeJungMark';
import { Button } from '../components/ui/Button';
import { PRICING } from '../data/pricing';
import { FUNCTION_DESCRIPTIONS } from '../data/questions';
import { FUNCTION_LABELS } from '../data/depthAssessment';
import { AnalyticsEvents } from '../lib/analytics';
import { STORAGE_KEYS } from '../lib/validation';
import { extractDepthResult } from '../utils/depthCompatibility';
import { useAuth } from '../hooks/use-auth';

const UNLOCKED_FEATURES = [
  { icon: Layers, text: 'Full 8-function personal ranking' },
  { icon: FileText, text: 'Detailed TypeJung depth report' },
  { icon: Shield, text: 'Confidence and reliability interpretation' },
  { icon: AlertTriangle, text: 'Stress and complex vulnerability patterns' },
  { icon: Heart, text: 'Relationship trigger interpretation' },
  { icon: Briefcase, text: 'Work and decision-making guidance' },
  { icon: Compass, text: 'Individuation roadmap with practices' },
  { icon: Download, text: 'Downloadable result archive' },
  { icon: RefreshCcw, text: 'Lifetime access to future updates' },
];

type VerifySessionResponse = {
  paid?: boolean;
  tier?: string;
  metadata?: {
    tier?: string;
  };
  transactionId?: string;
  customerEmail?: string;
};

function purchaseTrackingKey(transactionId: string): string {
  return `jungian_assessment_purchase_tracked_${transactionId}`;
}

export const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [dominantFunction, setDominantFunction] = useState<string | null>(null);

  useEffect(() => {
    // Try multiple ways to get session_id (hash routing can be tricky)
    let sessionId = searchParams.get('session_id');

    // Fallback: parse from window.location.hash
    if (!sessionId) {
      const hash = window.location.hash;
      const match = hash.match(/session_id=([^&]+)/);
      if (match) {
        sessionId = match[1];
      }
    }

    // Fallback: parse from window.location.search
    if (!sessionId) {
      const urlParams = new URLSearchParams(window.location.search);
      sessionId = urlParams.get('session_id');
    }

    const savedResults = localStorage.getItem('jungian_assessment_results');
    if (savedResults) {
      try {
        const results = JSON.parse(savedResults);
        const depthResult = extractDepthResult(results);
        if (depthResult) {
          setDominantFunction(FUNCTION_LABELS[depthResult.dominant]);
        } else if (results.stack?.dominant?.function) {
          setDominantFunction(results.stack.dominant.function);
        }
      } catch {
        // Failed to parse saved results
      }
    }

    if (!sessionId) {
      setStatus('error');
      setError('No session ID found');
      return;
    }
    const verifiedSessionId = sessionId;

    const verifySession = async () => {
      try {
        const response = await fetch('/api/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: verifiedSessionId })
        });
        const data = await response.json() as VerifySessionResponse;

        if (data.paid) {
          const tier = data.tier || data.metadata?.tier || 'insight';
          const transactionId = data.transactionId || verifiedSessionId;
          localStorage.setItem(STORAGE_KEYS.TIER, tier);
          localStorage.setItem(STORAGE_KEYS.UNLOCKED, 'true');
          localStorage.setItem(STORAGE_KEYS.UNLOCK_DATE, new Date().toISOString());
          localStorage.setItem(STORAGE_KEYS.CHECKOUT_SESSION_ID, verifiedSessionId);
          localStorage.setItem(STORAGE_KEYS.TRANSACTION_ID, transactionId);
          localStorage.setItem(STORAGE_KEYS.SEND_EMAIL, 'true');
          if (user?.id) {
            localStorage.setItem(STORAGE_KEYS.UNLOCK_USER_ID, user.id);
          }
          if (data.customerEmail) {
            localStorage.setItem('jungian_assessment_customer_email', data.customerEmail);
          }
          if (tier === 'insight' || tier === 'mastery') {
            const trackingKey = purchaseTrackingKey(transactionId);
            if (localStorage.getItem(trackingKey) !== 'true') {
              const tracked = AnalyticsEvents.purchaseCompleted(tier, PRICING[tier].amount, transactionId);
              if (tracked) {
                localStorage.setItem(trackingKey, 'true');
              }
            }
          }
          setStatus('success');
        } else {
          setStatus('error');
          setError('Payment not completed');
        }
      } catch {
        setStatus('error');
        setError('Unable to verify payment right now. Please refresh or contact support with your Stripe receipt.');
      }
    };

    verifySession();
  }, [searchParams, navigate, user?.id]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-jung-base px-4">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-jung-accent md:h-16 md:w-16" />
        <h1 className="mb-2 text-center text-heading text-2xl text-jung-dark">
          Verifying your payment...
        </h1>
        <p className="text-sm text-jung-secondary md:text-base">This usually takes a few seconds.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-jung-base px-4">
        <div className="mb-6 rounded-lg bg-error/5 p-4">
          <XCircle className="h-12 w-12 text-error md:h-16 md:w-16" />
        </div>
        <h1 className="mb-2 text-center text-heading text-2xl text-jung-dark">
          We could not verify the payment
        </h1>
        <p className="mb-6 max-w-md text-center text-sm text-jung-secondary md:text-base">{error || 'Unable to verify payment'}</p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button onClick={() => navigate('/results')} variant="primary">
            Back to Results
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const funcTitle = dominantFunction ? FUNCTION_DESCRIPTIONS[dominantFunction]?.title || dominantFunction : null;

  return (
    <div className="min-h-[60vh] bg-jung-base py-12">
      <div className="editorial-container max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-jung-accent-light text-jung-accent shadow-sm">
            <CheckCircle className="h-8 w-8" />
          </div>

          <h1 className="mb-4 text-heading text-4xl text-jung-dark">
            Your full ranking and analysis are unlocked
          </h1>

          {dominantFunction && funcTitle && (
            <p className="mb-3 text-lg font-medium text-jung-accent">
              Based on your <span className="font-bold">{funcTitle}</span> profile...
            </p>
          )}

          <div className="mb-4 flex items-center justify-center gap-2 text-jung-accent">
            <TypeJungMark size="xs" />
            <span className="font-medium">Premium access is active</span>
          </div>

          <p className="text-sm text-jung-muted">
            You can open the complete report from this browser now. Sign in later with the purchase email to restore access across devices.
          </p>
        </div>

        {!user && (
          <div className="mb-8 rounded-lg border border-jung-accent-muted bg-jung-accent-light/70 p-5">
            <h2 className="text-lg font-semibold text-jung-dark">Save the unlock to your account</h2>
            <p className="mt-2 text-sm leading-6 text-jung-secondary">
              This purchase is already active here. Sign in with the same email when you want saved history, cross-device restore, or account-based coach access.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              variant="outline"
              className="mt-4"
            >
              Sign in with purchase email
            </Button>
          </div>
        )}

        <div className="mb-8 rounded-lg border border-jung-border bg-jung-surface p-6 shadow-md">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-jung-dark">
            <CheckCircle className="h-5 w-5 text-jung-accent" />
            What you unlocked
          </h2>

          <div className="space-y-4">
            {UNLOCKED_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-jung-accent-light">
                    <Icon className="h-4 w-4 text-jung-accent" />
                  </div>
                  <span className="text-jung-secondary leading-relaxed">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <Button
            onClick={() => navigate('/results')}
            variant="accent"
            size="lg"
            className="flex-1"
          >
            <Compass className="mr-2 h-5 w-5" />
            View Full Ranking and Analysis
          </Button>
        </div>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-jung-muted">
            <Shield className="h-4 w-4 text-jung-accent" />
            <span className="text-sm">30-Day Money-Back Guarantee</span>
          </div>
          <p className="text-xs text-jung-muted">
            Not insightful? Contact us within 30 days for a full refund.
          </p>
        </div>
      </div>
    </div>
  );
};
