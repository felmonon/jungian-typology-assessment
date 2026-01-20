import React, { useState } from 'react';
import { Lock, Check, Loader2, Sparkles, FileText, Layers, AlertTriangle, Heart, Briefcase, Compass, PenTool, BookOpen, RefreshCcw, Shield, Unlock, MessageCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface PaywallGateProps {
  onUnlock?: () => void;
}

const PREMIUM_FEATURES = [
  { icon: MessageCircle, text: 'AI Type Coach: Ask anything about your type and growth', highlight: true },
  { icon: FileText, text: '25+ page personalized PDF report' },
  { icon: Layers, text: 'Complete 8-function in-depth analysis' },
  { icon: Sparkles, text: 'Archetypal stack dynamics (Hero, Parent, Child, Anima/Animus)' },
  { icon: AlertTriangle, text: 'The Grip: Detailed stress patterns' },
  { icon: Heart, text: 'Relationships & compatibility insights' },
  { icon: Briefcase, text: 'Career alignment guidance' },
  { icon: Compass, text: 'Your Individuation Path with exercises' },
  { icon: PenTool, text: 'Active imagination prompts' },
  { icon: BookOpen, text: 'Dream journaling templates' },
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
      <div className="absolute -top-20 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-stone-100 pointer-events-none" />

      <div className="bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl p-5 sm:p-8 md:p-12 border border-stone-300 shadow-lg">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-jung-primary/10 rounded-full mb-4">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-jung-primary" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-jung-dark mb-3">
            Unlock Your Complete Analysis
          </h2>

          <p className="text-stone-600 max-w-xl mx-auto">
            You've seen the basics. Dive deeper into your psychological type with a comprehensive analysis that reveals your archetypal patterns, stress responses, and path to individuation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="space-y-2 sm:space-y-3 order-2 md:order-1">
            <h3 className="font-bold text-jung-dark mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-jung-primary" />
              Premium Includes:
            </h3>
            {PREMIUM_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              const isHighlight = 'highlight' in feature && feature.highlight;
              return (
                <div key={i} className={`flex items-start gap-2 sm:gap-3 ${isHighlight ? 'bg-purple-50 p-2 rounded-lg border border-purple-200' : ''}`}>
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${isHighlight ? 'bg-purple-100' : 'bg-emerald-100'}`}>
                    <Icon className={`w-3 h-3 ${isHighlight ? 'text-purple-600' : 'text-emerald-600'}`} />
                  </div>
                  <span className={`text-xs sm:text-sm ${isHighlight ? 'text-purple-800 font-medium' : 'text-stone-700'}`}>{feature.text}</span>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-stone-200 order-1 md:order-2">
            <div className="text-center">
              <p className="text-sm text-stone-500 uppercase tracking-wide mb-2">One-Time Payment</p>
              
              <div className="mb-2">
                <span className="text-stone-400 line-through text-lg">$150 value</span>
              </div>
              
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl sm:text-5xl font-bold text-jung-dark">$10</span>
                <span className="text-stone-500 ml-1">CAD</span>
              </div>

              <p className="text-sm text-jung-primary font-medium mb-4">
                Equivalent to a 2-hour Jungian consultation
              </p>

              <p className="text-sm text-stone-500 mb-6">
                Lifetime access to this assessment
              </p>

              <Button
                onClick={handleUnlock}
                disabled={isLoading}
                className="w-full py-4 sm:py-5 text-base sm:text-lg font-bold bg-jung-primary hover:bg-jung-primary/90 shadow-md hover:shadow-lg transition-all min-h-[52px]"
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

              <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">30-Day Money-Back Guarantee</span>
              </div>

              <p className="mt-3 text-xs text-stone-400">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-xs text-stone-500 border-t border-stone-300 pt-6">
          <span className="flex items-center gap-1">
            <Check className="w-4 h-4 text-emerald-500" /> Instant Access
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-4 h-4 text-emerald-500" /> No Subscription
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-4 h-4 text-emerald-500" /> Secure Checkout
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-emerald-500" /> 30-Day Guarantee
          </span>
        </div>
      </div>
    </div>
  );
};
