import React, { useState } from 'react';
import { Lock, Check, Loader2, Sparkles, FileText, Layers, AlertTriangle, Heart, Briefcase, Compass, PenTool, BookOpen, RefreshCcw, Shield, Unlock, MessageCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface PaywallGateProps {
  onUnlock?: () => void;
}

const PREMIUM_FEATURES = [
  { icon: MessageCircle, text: 'AI Type Coach: Ask anything about your type and growth', highlight: true },
  { icon: FileText, text: 'Detailed TypeJung depth report' },
  { icon: Layers, text: 'Energy hierarchy and dominant-inferior axis' },
  { icon: Sparkles, text: 'Developmental edge analysis' },
  { icon: AlertTriangle, text: 'Stress and complex vulnerability patterns' },
  { icon: Heart, text: 'Relationship trigger interpretation' },
  { icon: Briefcase, text: 'Work and decision-making guidance' },
  { icon: Compass, text: 'Your individuation path with exercises' },
  { icon: PenTool, text: 'Somatic grounding practices' },
  { icon: BookOpen, text: 'Reassessment tracking over time' },
  { icon: RefreshCcw, text: 'Lifetime access (retake anytime)' },
];

export const PaywallGate: React.FC<PaywallGateProps> = ({ onUnlock }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative my-12">
      {/* Top gradient fade */}
      <div className="absolute -top-20 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-jung-surface pointer-events-none" />

      {/* Main container */}
      <div className="bg-jung-surface rounded-2xl p-6 sm:p-8 md:p-12 border border-jung-border shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-jung-accent/10 rounded-full mb-5">
            <Lock className="w-8 h-8 text-jung-accent" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-jung-dark mb-4">
            Unlock Your Complete Analysis
          </h2>

          <p className="text-jung-secondary max-w-xl mx-auto leading-relaxed">
            You've seen the map. Go deeper into the developmental edge, stress patterns,
            somatic signals, and practical work suggested by your result.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Features list */}
          <div className="space-y-3 order-2 md:order-1">
            <h3 className="font-serif font-bold text-jung-dark mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-jung-accent" />
              Premium Includes:
            </h3>
            {PREMIUM_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              const isHighlight = 'highlight' in feature && feature.highlight;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 ${
                    isHighlight
                      ? 'bg-jung-accent/5 p-3 rounded-xl border border-jung-accent/20'
                      : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                      isHighlight ? 'bg-jung-accent/20' : 'bg-emerald-100'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isHighlight ? 'text-jung-accent' : 'text-emerald-600'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm leading-relaxed ${
                      isHighlight ? 'text-jung-dark font-medium' : 'text-jung-secondary'
                    }`}
                  >
                    {feature.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pricing card */}
          <div className="bg-jung-surface rounded-2xl p-6 sm:p-8 shadow-md border border-jung-border order-1 md:order-2">
            <div className="text-center">
              <p className="text-sm text-jung-muted uppercase tracking-widest mb-3 font-data">
                One-Time Payment
              </p>

              <div className="mb-2">
                <span className="text-jung-muted line-through text-lg">$150 value</span>
              </div>

              <div className="flex items-baseline justify-center gap-1 mb-3">
                <span className="text-5xl font-serif font-bold text-jung-dark">$10</span>
                <span className="text-jung-muted ml-1 font-data">CAD</span>
              </div>

              <p className="text-sm text-jung-accent font-medium mb-4">
                Equivalent to a 2-hour Jungian consultation
              </p>

              <p className="text-sm text-jung-muted mb-6">
                Lifetime access to this assessment
              </p>

              <Button
                onClick={handleUnlock}
                disabled={isLoading}
                variant="accent"
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-5 w-5" />
                    Unlock Premium Analysis
                  </>
                )}
              </Button>

              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}

              <div className="mt-5 flex items-center justify-center gap-2 text-emerald-600">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">30-Day Money-Back Guarantee</span>
              </div>

              <p className="mt-3 text-xs text-jung-muted">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 text-xs text-jung-muted border-t border-jung-border pt-6">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" /> Instant Access
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" /> No Subscription
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" /> Secure Checkout
          </span>
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" /> 30-Day Guarantee
          </span>
        </div>
      </div>
    </div>
  );
};
