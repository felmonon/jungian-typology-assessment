import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Button } from '../ui/Button';
import { PRICING_TIERS, AnalyticsEvents } from './data';

interface PricingSectionProps {
  onNavigate: (path: string) => void;
}

const volumes = ['Vol. I', 'Vol. II', 'Vol. III'];
const ease = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export const PricingSection: React.FC<PricingSectionProps> = ({ onNavigate }) => {
  const handlePricingClick = (tier: string, amount: number) => {
    const normalizedTier = tier.toLowerCase();
    const destination = amount === 0 ? '/assessment' : `/pricing?tier=${normalizedTier}`;
    AnalyticsEvents.ctaClicked(
      amount === 0 ? 'start_assessment' : `view_${normalizedTier}_pricing`,
      'pricing_section',
      { buttonText: tier, destination },
    );
    onNavigate(destination);
  };

  return (
    <section id="pricing" className="relative py-24 lg:py-32 bg-jung-base">
      <div className="lab-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={container}
          className="max-w-2xl mb-16"
        >
          <motion.div variants={item} className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-jung-border-light" />
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted">
              Editions
            </span>
          </motion.div>
          <motion.h2
            variants={item}
            className="text-display text-4xl md:text-5xl leading-[1.02] tracking-tight text-jung-dark mb-4"
          >
            One assessment.{' '}
            <span className="italic text-jung-accent">Three&nbsp;depths</span> of insight.
          </motion.h2>
          <motion.p variants={item} className="text-jung-secondary font-light">
            Start free. Upgrade only when you want more. No subscriptions.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={container}
          className="grid md:grid-cols-3 gap-5"
        >
          {PRICING_TIERS.map((p, idx) => {
            const highlighted = p.popular;
            const displayPrice = p.discountedPrice ?? p.price;
            return (
              <motion.div
                key={p.name}
                variants={item}
                className={`relative flex flex-col rounded-2xl p-8 transition-all ${
                  highlighted
                    ? 'bg-jung-accent text-jung-base border border-jung-accent shadow-glow'
                    : 'bg-jung-surface border border-jung-border hover:border-jung-accent/40 shadow-sm'
                }`}
              >
                {highlighted && (
                  <div className="absolute -top-3 left-8 px-3 py-1 bg-jung-gold text-jung-base rounded-full">
                    <span className="font-mono text-[10px] tracking-[0.22em] uppercase">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="flex items-baseline justify-between mb-6">
                  <h3
                    className={`text-display italic text-2xl ${
                      highlighted ? 'text-jung-base' : 'text-jung-dark'
                    }`}
                  >
                    {p.name.charAt(0) + p.name.slice(1).toLowerCase()}
                  </h3>
                  <span
                    className={`font-mono text-[10px] tracking-[0.22em] uppercase ${
                      highlighted ? 'text-jung-base/60' : 'text-jung-muted'
                    }`}
                  >
                    {volumes[idx] ?? `Vol. ${idx + 1}`}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mb-3">
                  <span
                    className={`text-display text-6xl leading-none ${
                      highlighted ? 'text-jung-base' : 'text-jung-dark'
                    }`}
                  >
                    {displayPrice}
                  </span>
                  <span
                    className={`font-mono text-[10px] tracking-[0.22em] uppercase ml-2 ${
                      highlighted ? 'text-jung-base/60' : 'text-jung-muted'
                    }`}
                  >
                    {p.amount === 0 ? 'forever' : 'one-time'}
                  </span>
                </div>
                {p.discountedPrice && (
                  <p
                    className={`mb-4 text-xs leading-5 ${
                      highlighted ? 'text-jung-base/70' : 'text-jung-muted'
                    }`}
                  >
                    <span className="line-through">{p.price}</span> before code. {p.priceNote}.
                  </p>
                )}

                <p
                  className={`text-sm leading-relaxed mb-8 font-light ${
                    highlighted ? 'text-jung-base/80' : 'text-jung-secondary'
                  }`}
                >
                  {p.description}
                </p>

                <button
                  onClick={() => handlePricingClick(p.name, p.amount)}
                  className={`w-full py-3 rounded-full mb-8 transition-all ${
                    highlighted
                      ? 'bg-jung-base text-jung-accent hover:bg-jung-base/95'
                      : 'bg-jung-dark text-jung-base hover:bg-jung-dark/90'
                  }`}
                >
                  <span className="font-mono text-[11px] tracking-[0.18em] uppercase">
                    {p.cta}
                  </span>
                </button>

                <ul
                  className={`space-y-3 pt-6 border-t ${
                    highlighted ? 'border-jung-base/15' : 'border-jung-border'
                  }`}
                >
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span
                        className={`font-mono text-[10px] tabular-nums mt-1 ${
                          highlighted ? 'text-jung-base/55' : 'text-jung-muted'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className={highlighted ? 'text-jung-base' : 'text-jung-dark'}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
