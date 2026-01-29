import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle, Sparkles, FileText, Layers, AlertTriangle, Heart, Briefcase, Compass, RefreshCcw, Download, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { FUNCTION_DESCRIPTIONS } from '../data/questions';
import { useAuth } from '../hooks/use-auth';

const UNLOCKED_FEATURES = [
  { icon: FileText, text: 'Complete 8-function in-depth analysis' },
  { icon: Layers, text: 'Archetypal stack dynamics (Hero, Parent, Child, Anima/Animus)' },
  { icon: AlertTriangle, text: 'The Grip: Your stress response patterns' },
  { icon: Heart, text: 'Relationships & compatibility insights' },
  { icon: Briefcase, text: 'Career alignment guidance' },
  { icon: Compass, text: 'Individuation roadmap with exercises' },
  { icon: Download, text: 'Downloadable PDF report (25+ pages)' },
  { icon: RefreshCcw, text: 'Lifetime access to all future updates' },
];

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

    console.log('Session ID found:', sessionId);

    const savedResults = localStorage.getItem('jungian_assessment_results');
    if (savedResults) {
      try {
        const results = JSON.parse(savedResults);
        if (results.stack?.dominant?.function) {
          setDominantFunction(results.stack.dominant.function);
        }
      } catch (e) {
        console.error('Failed to parse saved results:', e);
      }
    }

    if (!sessionId) {
      setStatus('error');
      setError('No session ID found');
      return;
    }

    const verifySession = async () => {
      try {
        const response = await fetch('/api/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
        const data = await response.json();

        if (data.paid) {
          const tier = data.metadata?.tier || 'insight';
          localStorage.setItem('jungian_assessment_tier', tier);
          localStorage.setItem('jungian_assessment_unlocked', 'true');
          localStorage.setItem('jungian_assessment_unlock_date', new Date().toISOString());
          localStorage.setItem('jungian_assessment_send_email', 'true');
          if (user?.id) {
            localStorage.setItem('jungian_assessment_unlock_user_id', user.id);
          }
          if (data.customerEmail) {
            localStorage.setItem('jungian_assessment_customer_email', data.customerEmail);
          }
          setStatus('success');
        } else {
          setStatus('error');
          setError('Payment not completed');
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        localStorage.setItem('jungian_assessment_tier', 'insight');
        localStorage.setItem('jungian_assessment_unlocked', 'true');
        localStorage.setItem('jungian_assessment_unlock_date', new Date().toISOString());
        localStorage.setItem('jungian_assessment_send_email', 'true');
        if (user?.id) {
          localStorage.setItem('jungian_assessment_unlock_user_id', user.id);
        }
        setStatus('success');
      }
    };

    verifySession();
  }, [searchParams, navigate, user?.id]);

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-jung-surface">
        <Loader2 className="w-16 h-16 text-jung-accent animate-spin mb-4" />
        <h1 className="text-2xl font-serif font-bold text-jung-dark mb-2">
          Verifying your payment...
        </h1>
        <p className="text-jung-secondary">Please wait a moment.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-jung-surface">
        <div className="bg-red-100 rounded-full p-4 mb-6">
          <XCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-jung-dark mb-2">
          Something went wrong
        </h1>
        <p className="text-jung-secondary mb-6">{error || 'Unable to verify payment'}</p>
        <div className="flex gap-4">
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

  const funcTitle = dominantFunction ? FUNCTION_DESCRIPTIONS[dominantFunction]?.title : null;

  return (
    <div className="min-h-[60vh] py-12 px-4 bg-jung-surface">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6 shadow-lg">
            <span className="text-4xl font-serif text-emerald-600">ψ</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-jung-dark mb-4">
            Welcome to Your Complete Jungian Analysis
          </h1>

          {dominantFunction && funcTitle && (
            <p className="text-lg text-jung-accent font-medium mb-3">
              Based on your <span className="font-bold">{funcTitle}</span> profile...
            </p>
          )}

          <div className="flex items-center justify-center gap-2 text-emerald-600 mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium font-serif">Premium Unlocked Successfully</span>
            <Sparkles className="w-5 h-5" />
          </div>

          <p className="text-sm text-jung-muted italic">
            Equivalent to a 2-hour Jungian consultation ($150+ value)
          </p>
        </div>

        {/* Features card */}
        <div className="bg-jung-surface rounded-2xl border border-jung-border shadow-md p-6 mb-8">
          <h2 className="text-lg font-serif font-bold text-jung-dark mb-5 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            What You've Unlocked
          </h2>

          <div className="space-y-4">
            {UNLOCKED_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                    <Icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-jung-secondary leading-relaxed">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={() => navigate('/results')}
            variant="accent"
            size="lg"
            className="flex-1"
          >
            <Compass className="mr-2 h-5 w-5" />
            View Your Complete Analysis
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-jung-muted">
            <Shield className="w-4 h-4 text-emerald-500" />
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
