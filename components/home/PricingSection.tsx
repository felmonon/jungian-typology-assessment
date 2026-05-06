import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Hexagon, Crown, Check, ArrowUpRight, ShieldCheck, Terminal } from 'lucide-react';
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
    <section className="py-32 bg-jung-base relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[size:30px_30px] [background-image:linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)]" />

      <div className="lab-container relative z-10">
        <div className="text-center mb-24 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 text-jung-accent/80 font-mono text-[10px] uppercase tracking-[0.3em]">
            <Terminal className="w-3 h-3" />
            <span>Clearance Levels</span>
          </div>

          <h2 className="text-display text-5xl md:text-6xl text-jung-dark mb-6">
            Access the <span className="text-jung-accent">Dossier.</span>
          </h2>
          <p className="text-jung-secondary font-light text-lg">
            Select your required depth of analysis. All data is encrypted and permanently archived for your personal access.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto items-stretch">
          {PRICING_TIERS.map((tier, index) => {
            const isPopular = tier.popular;
            const isMastery = tier.name === 'MASTERY';
            const Icon = tier.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <div
                  className={`
                    relative h-full flex flex-col p-1
                    ${isPopular ? 'bg-gradient-to-b from-jung-accent to-jung-accent/10' : 'bg-jung-border/30'}
                    ${isMastery ? 'bg-gradient-to-b from-jung-dark to-jung-base border-jung-border' : ''}
                  `}
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}
                >
                  <div className="bg-jung-surface h-full w-full p-8 relative overflow-hidden flex flex-col" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 19px), calc(100% - 19px) 100%, 0 100%)' }}>

                    {/* Header */}
                    <div className="border-b border-jung-border/50 pb-8 mb-8">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 border border-jung-border/50 ${isPopular ? 'text-jung-accent' : 'text-jung-muted'}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        {isPopular && (
                          <div className="bg-jung-accent text-black px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                            Standard
                          </div>
                        )}
                        {isMastery && (
                          <div className="bg-jung-dark text-white border border-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                            Complete
                          </div>
                        )}
                      </div>

                      <h3 className="text-display text-2xl text-jung-dark mb-2">{tier.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-mono font-bold text-jung-dark">{tier.price}</span>
                        <span className="text-[10px] uppercase text-jung-muted tracking-widest">/ One-time</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-4 mb-10 flex-grow">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex gap-4 items-start text-sm text-jung-secondary">
                          <div className="w-1 h-1 bg-jung-accent mt-2 flex-shrink-0" />
                          <span className={isMastery ? 'text-white' : ''}>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handlePricingClick(tier.name, tier.price)}
                      className={`w-full py-6 text-xs uppercase tracking-[0.2em] font-bold border ${isPopular
                          ? 'bg-jung-accent text-black hover:bg-jung-accent-hover border-transparent'
                          : 'bg-transparent text-jung-accent border-jung-accent/50 hover:bg-jung-accent/10'
                        }`}
                    >
                      {tier.cta}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Security Footer */}
        <div className="mt-20 flex justify-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 border border-success/30 bg-success/5 rounded text-success text-xs font-mono uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted Vault Storage</span>
          </div>
        </div>
      </div>
    </section>
  );
};
