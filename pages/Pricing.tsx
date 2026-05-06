import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Check, X, ChevronDown, ChevronUp, Loader2, Sparkles, Star, Crown, ArrowRight, Shield, Clock, Zap, Target, BookOpen, Brain, ZapIcon } from 'lucide-react';
import { useSEO, PAGE_SEO } from '../hooks/useSEO';

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    tagline: 'Initial Diagnostic',
    features: [
      'Full 132-question assessment',
      'Functional Radar Mapping',
      'Basic Archetypal Insight',
      'Shareable Private Link',
    ],
    buttonText: 'Begin Assessment',
    buttonLink: '/assessment',
    tier: 'free',
  },
  {
    name: 'Insight',
    price: '$19',
    tagline: 'Deep Architecture',
    badge: 'Standard Protocol',
    includesPrefix: 'Everything in Free, plus:',
    features: [
      '25-Page Analytical Dossier (PDF)',
      'Complete 8-Function Synthesis',
      'Archetypal Stack Dynamics',
      'Stress & Shadow Profiles',
      'Interpersonal Vocation Map',
      'Lifetime Diagnostic Archive',
    ],
    buttonText: 'Unlock Insight — $19',
    note: 'One-time payment. Eternal access.',
    tier: 'insight',
    highlighted: true,
  },
  {
    name: 'Mastery',
    price: '$39',
    tagline: 'Psychic Integration',
    badge: 'Peak Individualisation',
    includesPrefix: 'Everything in Insight, plus:',
    features: [
      { text: 'AI Type Coach (Unlimited)', subtext: 'Direct dialectic with your results' },
      'Personalized Individuation Path',
      'Active Imagination Protocols',
      'Dream Journaling Framework',
      'Shadow Work Repository',
      'Priority Priority Support',
    ],
    buttonText: 'Unlock Mastery — $39',
    note: 'One-time payment. Complete evolution.',
    tier: 'mastery',
    bestValue: true,
  },
];

const COMPARISON_FEATURES = [
  { name: '132-Question Diagnostic', free: true, insight: true, mastery: true },
  { name: 'Radar Spectrum Mapping', free: true, insight: true, mastery: true },
  { name: 'Shareable Profile', free: true, insight: true, mastery: true },
  { name: '25-Page Analytical Dossier', free: false, insight: true, mastery: true },
  { name: 'Full 8-Function Dynamics', free: false, insight: true, mastery: true },
  { name: 'Career Vocation Engine', free: false, insight: true, mastery: true },
  { name: 'AI Type Coach Dialectic', free: false, insight: false, mastery: true },
  { name: 'Individuation Roadmap', free: false, insight: false, mastery: true },
  { name: 'Shadow Work Repository', free: false, insight: false, mastery: true },
];

const FAQ_ITEMS = [
  {
    question: "How is this different from standard typology?",
    answer: "We employ the Singer-Loomis methodology, which avoids the forced-choice dichotomy of standard MBTI. This allows for a more accurate measurable profile of all 8 functions independently.",
  },
  {
    question: "Is this a recurring subscription?",
    answer: "No. TypeJung is built on a 'Pay Once, Evolve Forever' model. Your insights are private and eternally yours.",
  },
  {
    question: "Can I upgrade my tier later?",
    answer: "Absolutely. You can migrate from Insight to Mastery at any time for the remaining differential.",
  },
];

export const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useSEO(PAGE_SEO.pricing);

  const handleCheckout = async (tier: string) => {
    if (tier === 'free') {
      navigate('/assessment');
      return;
    }
    setLoadingTier(tier);
    setError(null);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: import.meta.env.VITE_STRIPE_PRICE_ID, tier: tier }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session');
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-jung-base dark:bg-dark-base transition-colors duration-500">
      {/* Header */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
          <div className="absolute top-0 right-0 w-96 h-96 bg-jung-accent/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="absolute top-40 left-0 w-80 h-80 bg-jung-gold/5 rounded-full blur-[100px] -ml-32" />
        </div>

        <div className="editorial-container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-jung-accent mb-6">Access Tiers</p>
            <h1 className="text-display text-5xl lg:text-7xl text-jung-dark dark:text-white mb-8">
              Invest in your <br /><span className="italic text-jung-secondary">Psychic Evolution.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-body-lg text-jung-muted font-serif italic mb-12">
              Start free, go deeper when you're ready. One-time payments for lifetime insights. No subscriptions, just genuine growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="editorial-container pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`
                relative flex flex-col p-10 lg:p-14 rounded-[3rem] transition-all duration-500 group
                ${tier.highlighted
                  ? 'bg-jung-dark text-white shadow-2xl scale-105 z-10'
                  : tier.bestValue
                    ? 'bg-white dark:bg-dark-surface border-2 border-jung-dark dark:border-white/10 shadow-xl'
                    : 'bg-white/50 dark:bg-dark-surface/50 border border-jung-border dark:border-dark-border hover:bg-white dark:hover:bg-dark-surface'
                }
              `}
            >
              {tier.badge && (
                <div className={`absolute -top-4 left-10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${tier.highlighted ? 'bg-jung-accent text-white' : 'bg-jung-dark text-white'}`}>
                  {tier.highlighted ? <Star className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                  {tier.badge}
                </div>
              )}

              <div className="mb-10">
                <h3 className={`text-display text-2xl mb-2 ${tier.highlighted ? 'text-white' : 'text-jung-dark dark:text-white'}`}>
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className={`text-5xl font-display font-bold ${tier.highlighted ? 'text-jung-accent-muted' : 'text-jung-dark dark:text-white'}`}>
                    {tier.price}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">One-Time</span>
                </div>
                <p className={`text-sm font-serif italic ${tier.highlighted ? 'text-jung-subtle' : 'text-jung-muted'}`}>
                  {tier.tagline}
                </p>
              </div>

              <div className="space-y-6 mb-12 flex-grow">
                {tier.includesPrefix && (
                  <p className={`text-[10px] font-bold uppercase tracking-widest pt-6 border-t ${tier.highlighted ? 'border-white/10 text-jung-accent-muted' : 'border-jung-border dark:border-dark-border text-jung-accent'}`}>
                    {tier.includesPrefix}
                  </p>
                )}
                <ul className="space-y-4">
                  {tier.features.map((f, idx) => {
                    const text = typeof f === 'string' ? f : f.text;
                    return (
                      <li key={idx} className="flex gap-4 items-start">
                        <Check className={`w-4 h-4 mt-1 flex-shrink-0 ${tier.highlighted ? 'text-jung-accent-muted' : 'text-jung-accent'}`} />
                        <span className={`text-sm font-serif ${tier.highlighted ? 'text-jung-subtle' : 'text-jung-secondary dark:text-jung-muted'}`}>
                          {text}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <Button
                onClick={() => tier.buttonLink ? navigate(tier.buttonLink) : handleCheckout(tier.tier)}
                disabled={loadingTier === tier.tier}
                className={`w-full py-6 text-[10px] font-bold uppercase tracking-[0.3em] rounded-2xl ${tier.highlighted
                    ? 'bg-jung-accent text-white hover:bg-jung-accent-hover'
                    : 'bg-jung-dark text-white hover:bg-black dark:bg-white dark:text-jung-dark dark:hover:bg-jung-subtle'
                  }`}
              >
                {loadingTier === tier.tier ? <Loader2 className="w-4 h-4 animate-spin" /> : tier.buttonText}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="editorial-container pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-display text-4xl text-jung-dark dark:text-white mb-4">Deep Comparison</h2>
            <p className="text-sm font-bold uppercase tracking-widest text-jung-muted">Feature Matrix Analysis</p>
          </div>

          <div className="card-premium overflow-hidden bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border">
            <table className="w-full">
              <thead>
                <tr className="bg-jung-base dark:bg-dark-base/50">
                  <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-widest text-jung-muted">Capabilities</th>
                  <th className="px-6 py-6 text-center text-[10px] font-bold uppercase tracking-widest text-jung-muted">Free</th>
                  <th className="px-6 py-6 text-center text-[10px] font-bold uppercase tracking-widest text-jung-accent">Insight</th>
                  <th className="px-6 py-6 text-center text-[10px] font-bold uppercase tracking-widest text-jung-muted">Mastery</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((f, i) => (
                  <tr key={i} className="border-t border-jung-border dark:border-dark-border">
                    <td className="px-8 py-5 text-sm font-serif text-jung-dark dark:text-white">{f.name}</td>
                    <td className="px-6 py-5">
                      {f.free ? <Zap className="w-4 h-4 mx-auto text-jung-accent" /> : <X className="w-4 h-4 mx-auto text-jung-muted opacity-30" />}
                    </td>
                    <td className="px-6 py-5 bg-jung-accent/5">
                      {f.insight ? <Zap className="w-4 h-4 mx-auto text-jung-accent" /> : <X className="w-4 h-4 mx-auto text-jung-muted opacity-30" />}
                    </td>
                    <td className="px-6 py-5">
                      {f.mastery ? <Zap className="w-4 h-4 mx-auto text-jung-accent" /> : <X className="w-4 h-4 mx-auto text-jung-muted opacity-30" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-jung-dark py-24 border-y border-white/5">
        <div className="editorial-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              { icon: Shield, title: '30-Day Protocol', desc: 'Sovereign refund guarantee' },
              { icon: Clock, title: 'Lifetime Access', desc: 'Snapshot preserved eternally' },
              { icon: Brain, title: 'Deep Synthesis', desc: 'Instant analytical delivery' },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto mb-6 group-hover:bg-jung-accent transition-colors">
                  <item.icon className="w-6 h-6 text-jung-accent group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white mb-2">{item.title}</h4>
                <p className="text-xs text-jung-subtle font-serif italic">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="editorial-container py-32">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-display text-4xl text-jung-dark dark:text-white mb-4">Inquiry & Clarity</h2>
            <p className="text-sm font-bold uppercase tracking-widest text-jung-muted">Knowledge Base</p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="group card-premium p-0 overflow-hidden bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border">
                <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                  <span className="text-display text-lg text-jung-dark dark:text-white pr-6">{item.question}</span>
                  <ChevronDown className="w-5 h-5 text-jung-muted group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-8 pb-8 pt-0 opacity-70">
                  <p className="text-sm text-jung-secondary dark:text-jung-muted font-serif leading-relaxed italic">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-jung-dark" />
        <div className="absolute inset-0 bg-gradient-to-t from-jung-accent/10 to-transparent" />

        <div className="editorial-container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <Sparkles className="w-12 h-12 text-jung-accent mx-auto mb-10" />
            <h2 className="text-display text-5xl text-white mb-8">Ready for the Deep Scan?</h2>
            <p className="max-w-xl mx-auto text-jung-subtle font-serif italic mb-12">
              The journey of a thousand miles begins with a single diagnostic. Choose your depth and begin.
            </p>
            <Button
              onClick={() => navigate('/assessment')}
              className="bg-white text-jung-dark hover:bg-jung-accent hover:text-white px-12 py-6 rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] transition-all"
            >
              Start Free Assessment
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
