import React from 'react';
import { Zap, Star, Crown, Check, Sparkles, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { PRICING_TIERS, AnalyticsEvents } from './data';

interface PricingSectionProps {
  onNavigate: (path: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onNavigate }) => {
  const handlePricingClick = (tier: string, price: string) => {
    AnalyticsEvents.ctaClicked(`view_${tier.toLowerCase()}_pricing`, 'pricing_section');
    AnalyticsEvents.purchaseStarted(tier, parseInt(price.replace('$', '')));
    onNavigate('/pricing');
  };

  return (
    <section className="py-20 lg:py-28">
      <div className="editorial-container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-jung-accent-light rounded-full mb-4">
            <Zap className="w-4 h-4 text-jung-accent" />
            <span className="text-sm font-serif font-medium text-jung-primary">Launch pricing — Save 40% this week</span>
          </div>
          <h2 className="text-display text-3xl sm:text-4xl text-jung-dark mb-4">
            Choose Your Path
          </h2>
          <p className="text-body text-lg text-jung-secondary max-w-2xl mx-auto">
            Start free, go deeper when you're ready. One-time payment, lifetime access.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {PRICING_TIERS.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <div 
                key={index} 
                className={`relative ${tier.popular ? 'md:-translate-y-4' : ''} ${
                  tier.name === 'MASTERY' ? 'bg-jung-accent-light' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -inset-px bg-jung-accent rounded-2xl" />
                )}
                <div className={`relative ${tier.popular ? 'bg-jung-surface' : 'card-elevated'} rounded-2xl p-6 sm:p-8 h-full`}>
                  {/* Badge */}
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-jung-accent text-white text-sm font-serif font-medium rounded-full">
                        <Star className="w-4 h-4" /> Most Popular
                      </span>
                    </div>
                  )}
                  {tier.name === 'MASTERY' && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-jung-dark text-white text-sm font-serif font-medium rounded-full">
                        <Crown className="w-4 h-4" /> Best Value
                      </span>
                    </div>
                  )}
                  
                  <div className={`text-center mb-6 ${tier.popular ? 'pt-4' : ''}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      tier.name === 'FREE' ? 'bg-jung-border' : 
                      tier.name === 'INSIGHT' ? 'bg-jung-accent-light' : 'bg-jung-accent/20'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        tier.name === 'FREE' ? 'text-jung-muted' : 'text-jung-accent'
                      }`} />
                    </div>
                    <h3 className="text-heading text-xl text-jung-dark mb-1">{tier.name}</h3>
                    <div className={`text-display text-4xl ${tier.name === 'INSIGHT' ? 'text-jung-accent' : 'text-jung-dark'} mb-2`}>
                      {tier.price}
                    </div>
                    <p className="text-sm font-serif text-jung-muted">{tier.description}</p>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start gap-3">
                        {tier.name === 'MASTERY' ? (
                          <Sparkles className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                        ) : (
                          <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            tier.name === 'FREE' ? 'text-success' : 'text-jung-accent'
                          }`} />
                        )}
                        <span className={`${tier.name === 'FREE' ? 'text-jung-secondary' : 'text-jung-dark font-medium'} text-sm`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant={tier.variant} 
                    className="w-full"
                    onClick={() => handlePricingClick(tier.name, tier.price)}
                  >
                    {tier.cta}
                  </Button>
                  <p className="text-center text-xs text-jung-muted mt-3">
                    {tier.name === 'FREE' ? '' : 'One-time payment'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => onNavigate('/pricing')}
            className="text-jung-accent hover:text-jung-primary font-serif font-medium inline-flex items-center gap-1 transition-colors"
          >
            See full feature comparison <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Money-Back Guarantee */}
        <div className="mt-12 pt-8 border-t border-jung-border">
          <div className="flex items-center justify-center gap-3 text-jung-secondary">
            <ShieldCheck className="w-6 h-6 text-success" />
            <p className="text-sm font-serif">
              <strong className="text-jung-dark">30-day money-back guarantee.</strong> Not satisfied? Get a full refund, no questions asked.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
