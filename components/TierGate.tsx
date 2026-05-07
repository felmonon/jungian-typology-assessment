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
    gradient: 'from-jung-accent to-jung-accent/80',
    bgLight: 'bg-jung-accent/10',
    textColor: 'text-jung-accent',
    features: ['Depth report', 'Energy hierarchy', 'Developmental edge', 'Stress patterns', 'Relationships', 'Career', 'Somatic practices']
  },
  mastery: {
    name: 'Mastery',
    price: '$39',
    priceId: import.meta.env.VITE_STRIPE_MASTERY_PRICE_ID,
    icon: Crown,
    gradient: 'from-jung-dark to-jung-secondary',
    bgLight: 'bg-jung-dark/10',
    textColor: 'text-jung-dark',
    features: ['AI Type Coach', 'Individuation roadmap', 'Reassessment tracking', 'Practice library', 'Shadow work exercises']
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
      {/* Blurred content behind */}
      <div className="blur-sm opacity-50 pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>

      {/* Overlay with gate content */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-jung-surface/60 to-jung-surface/95">
        <div className="bg-jung-surface rounded-2xl shadow-xl border border-jung-border p-8 max-w-md mx-4 text-center">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-5 ${tierInfo.bgLight}`}>
            {isUpgrade ? (
              <Crown className={`w-7 h-7 ${tierInfo.textColor}`} />
            ) : (
              <Lock className="w-7 h-7 text-jung-accent" />
            )}
          </div>

          {/* Heading */}
          <h3 className="text-xl font-serif font-bold text-jung-dark mb-3">
            {isUpgrade ? `Upgrade to ${tierInfo.name}` : `Unlock with ${tierInfo.name}`}
          </h3>

          {/* Feature description */}
          {featureDescription && (
            <p className="text-jung-secondary text-sm mb-3 leading-relaxed">{featureDescription}</p>
          )}

          {/* Subtitle */}
          <p className="text-jung-muted text-sm mb-5 leading-relaxed">
            {isUpgrade
              ? 'Access advanced features for deeper self-discovery'
              : 'Unlock premium insights for comprehensive type analysis'
            }
          </p>

          {/* Feature tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {tierInfo.features.slice(0, 3).map((feature, i) => (
              <span
                key={i}
                className={`text-xs px-3 py-1.5 rounded-full font-medium ${tierInfo.bgLight} ${tierInfo.textColor}`}
              >
                {feature}
              </span>
            ))}
            {tierInfo.features.length > 3 && (
              <span className="text-xs px-3 py-1.5 rounded-full bg-jung-surface text-jung-muted font-medium">
                +{tierInfo.features.length - 3} more
              </span>
            )}
          </div>

          {/* CTA Button */}
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
                <TierIcon className="mr-2 h-5 w-5" />
                {isUpgrade ? `Upgrade to ${tierInfo.name}` : `Unlock ${tierInfo.name}`} ({tierInfo.price})
              </>
            )}
          </Button>

          {/* Error message */}
          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}

          {/* Trust indicator */}
          <p className="mt-4 text-xs text-jung-muted">One-time payment • Secure checkout via Stripe</p>
        </div>
      </div>
    </div>
  );
};
