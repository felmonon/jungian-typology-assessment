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
    const sessionId = searchParams.get('session_id');
    
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 text-jung-primary animate-spin mb-4" />
        <h1 className="text-2xl font-serif font-bold text-jung-dark mb-2">
          Verifying your payment...
        </h1>
        <p className="text-stone-600">Please wait a moment.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-red-50 rounded-full p-4 mb-6">
          <XCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-jung-dark mb-2">
          Something went wrong
        </h1>
        <p className="text-stone-600 mb-6">{error || 'Unable to verify payment'}</p>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/results')}>
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
    <div className="min-h-[60vh] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full mb-6 shadow-lg">
            <span className="text-4xl font-serif text-emerald-600">ψ</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-jung-dark mb-3">
            Welcome to Your Complete Jungian Analysis!
          </h1>

          {dominantFunction && funcTitle && (
            <p className="text-lg text-jung-primary font-medium mb-2">
              Based on your <span className="font-bold">{funcTitle}</span> profile...
            </p>
          )}

          <div className="flex items-center justify-center gap-2 text-emerald-600 mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Premium Unlocked Successfully</span>
            <Sparkles className="w-5 h-5" />
          </div>

          <p className="text-sm text-stone-500 italic">
            Equivalent to a 2-hour Jungian consultation ($150+ value)
          </p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-serif font-bold text-jung-dark mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            What You've Unlocked
          </h2>

          <div className="space-y-3">
            {UNLOCKED_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-stone-700">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={() => navigate('/results')}
            className="flex-1 py-4 text-lg font-bold bg-jung-primary hover:bg-jung-primary/90"
          >
            <Compass className="mr-2 h-5 w-5" />
            View Your Complete Analysis
          </Button>
        </div>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-stone-500">
            <Shield className="w-4 h-4" />
            <span className="text-sm">30-Day Money-Back Guarantee</span>
          </div>
          <p className="text-xs text-stone-400">
            Not insightful? Contact us within 30 days for a full refund.
          </p>
        </div>
      </div>
    </div>
  );
};
