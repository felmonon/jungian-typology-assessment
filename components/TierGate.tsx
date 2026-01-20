import React, { useState } from 'react';
import { Lock, Loader2, Sparkles, Crown } from 'lucide-react';
import { Button } from './ui/Button';
import { PremiumTier } from '../hooks/use-premium-status';

interface TierGateProps {
  requiredTier: 'insight' | 'mastery';
  currentTier: PremiumTier;
  children: React.ReactNode;
  featureDescription?: string;
}

const TIER_INFO = {
  insight: {
    name: 'Insight',
    price: '$19',
    priceId: import.meta.env.VITE_STRIPE_INSIGHT_PRICE_ID || import.meta.env.VITE_STRIPE_PRICE_ID,
    icon: Sparkles,
    color: 'jung-primary',
    features: ['PDF report', 'Full 8-function analysis', 'Archetypal stack', 'Grip/stress analysis', 'Relationships', 'Career', 'Shadow analysis']
  },
  mastery: {
    name: 'Mastery',
    price: '$39',
    priceId: import.meta.env.VITE_STRIPE_MASTERY_PRICE_ID,
    icon: Crown,
    color: 'purple-600',
    features: ['AI Type Coach chatbot', 'Individuation roadmap', 'Active imagination prompts', 'Dream journaling guide', 'Shadow work exercises']
  }
};

export const TierGate: React.FC<TierGateProps> = ({ 
  requiredTier, 
  currentTier, 
  children,
  featureDescription 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasAccess = () => {
    if (requiredTier === 'insight') return currentTier === 'insight' || currentTier === 'mastery';
    if (requiredTier === 'mastery') return currentTier === 'mastery';
    return false;
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  const tierInfo = TIER_INFO[requiredTier];
  const TierIcon = tierInfo.icon;
  const isUpgrade = currentTier === 'insight' && requiredTier === 'mastery';

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
          priceId: tierInfo.priceId,
          tier: requiredTier,
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
    <div className="relative">
      <div className="blur-sm opacity-50 pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/60 to-white/90">
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-6 max-w-md mx-4 text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${requiredTier === 'mastery' ? 'bg-purple-100' : 'bg-jung-primary/10'}`}>
            {isUpgrade ? (
              <Crown className={`w-6 h-6 ${requiredTier === 'mastery' ? 'text-purple-600' : 'text-jung-primary'}`} />
            ) : (
              <Lock className="w-6 h-6 text-jung-primary" />
            )}
          </div>
          
          <h3 className="text-lg font-bold text-jung-dark mb-2">
            {isUpgrade ? `Upgrade to ${tierInfo.name}` : `Unlock with ${tierInfo.name}`}
          </h3>
          
          {featureDescription && (
            <p className="text-stone-600 text-sm mb-3">{featureDescription}</p>
          )}
          
          <p className="text-stone-500 text-sm mb-4">
            {isUpgrade 
              ? 'Get access to advanced features for deeper self-discovery'
              : 'Unlock premium insights for comprehensive type analysis'
            }
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {tierInfo.features.slice(0, 3).map((feature, i) => (
              <span key={i} className={`text-xs px-2 py-1 rounded-full ${requiredTier === 'mastery' ? 'bg-purple-50 text-purple-700' : 'bg-jung-primary/10 text-jung-primary'}`}>
                {feature}
              </span>
            ))}
            {tierInfo.features.length > 3 && (
              <span className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-500">
                +{tierInfo.features.length - 3} more
              </span>
            )}
          </div>

          <Button
            onClick={handleUnlock}
            disabled={isLoading}
            className={`w-full py-3 font-bold ${requiredTier === 'mastery' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-jung-primary hover:bg-jung-primary/90'}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <TierIcon className="mr-2 h-4 w-4" />
                {isUpgrade ? `Upgrade to ${tierInfo.name}` : `Unlock ${tierInfo.name}`} ({tierInfo.price})
              </>
            )}
          </Button>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
          
          <p className="mt-3 text-xs text-stone-400">One-time payment • Secure checkout</p>
        </div>
      </div>
    </div>
  );
};
