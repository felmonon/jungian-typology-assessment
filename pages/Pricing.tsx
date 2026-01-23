import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Check, X, ChevronDown, ChevronUp, Loader2, Sparkles, Star, Crown, ArrowRight, Shield, Clock, Zap } from 'lucide-react';

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    tagline: 'Discover Your Profile',
    features: [
      'Full 132-question assessment',
      'Radar chart visualization',
      'Basic AI-generated insight',
      'Shareable results link',
    ],
    buttonText: 'Start Free Assessment',
    buttonLink: '/assessment',
    tier: 'free',
  },
  {
    name: 'Insight',
    price: '$19',
    tagline: 'Understand Your Type',
    badge: 'Most Popular',
    includesPrefix: 'Everything in Free, plus:',
    features: [
      '25-page downloadable PDF report',
      'Complete 8-function analysis',
      'Archetypal stack dynamics',
      'Stress & shadow patterns',
      'Relationship insights',
      'Career alignment guide',
      'Lifetime access & unlimited retakes',
    ],
    buttonText: 'Unlock Full Insight — $19',
    note: 'One-time payment. No subscription.',
    tier: 'insight',
    highlighted: true,
  },
  {
    name: 'Mastery',
    price: '$39',
    tagline: 'Transform With Guidance',
    badge: 'Best Value',
    includesPrefix: 'Everything in Insight, plus:',
    features: [
      { text: 'AI Type Coach (unlimited)', subtext: 'Ask anything about your type' },
      'Personalized individuation roadmap',
      'Active imagination prompts',
      'Dream journaling guide',
      'Shadow work exercises',
      'Monthly growth prompts',
      'Priority email support',
    ],
    buttonText: 'Unlock Mastery — $39',
    note: 'One-time payment. Lifetime access.',
    tier: 'mastery',
    bestValue: true,
  },
];

const COMPARISON_FEATURES = [
  { name: '132-Question Assessment', free: true, insight: true, mastery: true },
  { name: 'Radar Chart Visualization', free: true, insight: true, mastery: true },
  { name: 'Basic AI Insight (200 words)', free: true, insight: true, mastery: true },
  { name: 'Shareable Results', free: true, insight: true, mastery: true },
  { name: 'Educational Content', free: true, insight: true, mastery: true },
  { name: '25-Page PDF Report', free: false, insight: true, mastery: true },
  { name: 'Complete 8-Function Analysis', free: false, insight: true, mastery: true },
  { name: 'Archetypal Stack Dynamics', free: false, insight: true, mastery: true },
  { name: 'Grip/Stress Analysis', free: false, insight: true, mastery: true },
  { name: 'Relationship Insights', free: false, insight: true, mastery: true },
  { name: 'Career Alignment', free: false, insight: true, mastery: true },
  { name: 'Shadow Function Analysis', free: false, insight: true, mastery: true },
  { name: 'Results History & Retakes', free: false, insight: true, mastery: true },
  { name: 'AI Type Coach (Unlimited)', free: false, insight: false, mastery: true },
  { name: 'Individuation Roadmap', free: false, insight: false, mastery: true },
  { name: 'Active Imagination Prompts', free: false, insight: false, mastery: true },
  { name: 'Dream Journaling Guide', free: false, insight: false, mastery: true },
  { name: 'Shadow Work Exercises', free: false, insight: false, mastery: true },
  { name: 'Monthly Growth Prompts', free: false, insight: false, mastery: true },
  { name: 'Priority Support', free: false, insight: false, mastery: true },
];

const FAQ_ITEMS = [
  {
    question: "What's the difference between Insight and Mastery?",
    answer: "Insight provides a complete analysis of your type — the 25-page PDF covers everything about your cognitive functions, relationships, and career alignment. Mastery adds the AI Type Coach, so you can ask unlimited questions about your results and receive personalized guidance on psychological growth.",
  },
  {
    question: "Is this a subscription?",
    answer: "No. Both Insight and Mastery are one-time payments with lifetime access. Pay once, keep forever. No recurring charges.",
  },
  {
    question: "Can I upgrade from Insight to Mastery later?",
    answer: "Yes. If you purchase Insight and later want the AI Type Coach and advanced tools, you can upgrade for the difference ($20).",
  },
  {
    question: "What if I'm not satisfied?",
    answer: "We offer a 30-day money-back guarantee. Email us within 30 days for a full refund, no questions asked.",
  },
  {
    question: "How is this different from MBTI?",
    answer: "Our assessment uses the Singer-Loomis method, measuring all 8 cognitive functions independently rather than forcing opposites. This creates a nuanced profile that reflects how you actually think, not a simplified 4-letter code.",
  },
];

export const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
          tier: tier,
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
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-jung-surface">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-jung-primary/5 via-transparent to-jung-accent/5" />
        <div className="editorial-container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-ui text-jung-accent uppercase tracking-widest mb-4">Pricing</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-jung-dark mb-6 leading-tight">
              Choose Your Path to<br />Self-Understanding
            </h1>
            <p className="text-xl text-jung-secondary max-w-2xl mx-auto leading-relaxed">
              Start free, go deeper when you're ready. No subscriptions, no hidden fees—just genuine insight into your cognitive patterns.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="editorial-container pb-20 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`
                relative bg-jung-surface rounded-2xl p-6 sm:p-8 transition-all duration-300
                ${tier.highlighted
                  ? 'border-2 border-jung-accent shadow-xl shadow-jung-accent/10 md:-translate-y-4 md:scale-105'
                  : tier.bestValue
                    ? 'border-2 border-jung-primary shadow-lg'
                    : 'border border-jung-border shadow-sm hover:shadow-md'
                }
              `}
            >
              {/* Badge */}
              {tier.badge && (
                <div
                  className={`
                    absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-semibold
                    flex items-center gap-1.5 whitespace-nowrap
                    ${tier.highlighted
                      ? 'bg-jung-accent text-white'
                      : 'bg-jung-primary text-white'
                    }
                  `}
                >
                  {tier.highlighted ? <Star className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                  {tier.badge}
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6 pt-2">
                <h3 className="text-lg font-serif font-bold text-jung-dark mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-serif font-bold text-jung-dark">{tier.price}</span>
                  {tier.price !== '$0' && <span className="text-jung-muted">one-time</span>}
                </div>
                <p className="text-jung-secondary mt-2">{tier.tagline}</p>
              </div>

              {/* Includes prefix */}
              {tier.includesPrefix && (
                <p className="text-sm text-jung-accent font-medium mb-4 border-t border-jung-border pt-4">
                  {tier.includesPrefix}
                </p>
              )}

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, idx) => {
                  const text = typeof feature === 'string' ? feature : feature.text;
                  const subtext = typeof feature === 'object' ? feature.subtext : null;
                  return (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-jung-dark text-sm">{text}</span>
                        {subtext && (
                          <span className="block text-xs text-jung-muted mt-0.5">
                            {subtext}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* CTA Button */}
              <Button
                onClick={() =>
                  tier.buttonLink
                    ? navigate(tier.buttonLink)
                    : handleCheckout(tier.tier)
                }
                disabled={loadingTier === tier.tier}
                variant={tier.highlighted ? 'accent' : tier.bestValue ? 'primary' : 'outline'}
                className="w-full py-4 font-semibold"
                size="lg"
              >
                {loadingTier === tier.tier ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {tier.buttonText}
                    {tier.tier === 'free' && <ArrowRight className="ml-2 w-4 h-4" />}
                  </>
                )}
              </Button>

              {/* Note */}
              {tier.note && (
                <p className="text-center text-xs text-jung-muted mt-4">
                  {tier.note}
                </p>
              )}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-center text-red-600 mt-6 bg-red-50 p-4 rounded-lg max-w-md mx-auto">
            {error}
          </p>
        )}
      </section>

      {/* Trust Signals */}
      <section className="bg-jung-surface-alt border-y border-jung-border py-12">
        <div className="editorial-container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            {[
              { icon: <Shield className="w-6 h-6" />, title: '30-Day Guarantee', desc: 'Full refund, no questions asked' },
              { icon: <Clock className="w-6 h-6" />, title: 'Lifetime Access', desc: 'Pay once, keep forever' },
              { icon: <Zap className="w-6 h-6" />, title: 'Instant Delivery', desc: 'Access immediately after purchase' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-jung-accent/10 flex items-center justify-center text-jung-accent mb-3">
                  {item.icon}
                </div>
                <h4 className="font-serif font-semibold text-jung-dark mb-1">{item.title}</h4>
                <p className="text-sm text-jung-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="editorial-container py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-display text-jung-dark mb-4">
              Feature Comparison
            </h2>
            <p className="text-body text-jung-secondary">
              See exactly what's included in each tier
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-jung-border">
            <table className="w-full bg-jung-surface">
              <thead>
                <tr className="bg-jung-primary text-white">
                  <th className="px-6 py-4 text-left font-serif font-medium">Feature</th>
                  <th className="px-4 py-4 text-center font-serif font-medium">Free</th>
                  <th className="px-4 py-4 text-center font-serif font-medium bg-jung-accent">
                    Insight
                  </th>
                  <th className="px-4 py-4 text-center font-serif font-medium">
                    Mastery
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {COMPARISON_FEATURES.map((feature, idx) => (
                  <tr
                    key={idx}
                    className={`border-t border-jung-border ${idx % 2 === 0 ? 'bg-jung-surface' : 'bg-jung-surface-alt'}`}
                  >
                    <td className="px-6 py-3 font-medium text-jung-dark">
                      {feature.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {feature.free ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-jung-border mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center bg-jung-accent/5">
                      {feature.insight ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-jung-border mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {feature.mastery ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-jung-border mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-jung-surface-alt py-20 border-t border-jung-border">
        <div className="editorial-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-display text-jung-dark mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-body text-jung-secondary">
                Everything you need to know
              </p>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((item, idx) => (
                <div
                  key={idx}
                  className="card-elevated overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-jung-surface-alt transition-colors"
                  >
                    <span className="font-serif font-medium text-jung-dark pr-4">
                      {item.question}
                    </span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-jung-accent flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-jung-muted flex-shrink-0" />
                    )}
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="px-6 pb-5 border-t border-jung-border">
                      <p className="text-jung-secondary leading-relaxed pt-4">{item.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-jung-primary to-jung-accent opacity-95" />
        <div className="editorial-container relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <Sparkles className="w-10 h-10 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
              Ready to discover who you really are?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Start with the free assessment. Upgrade anytime to unlock deeper insights.
            </p>
            <Button
              onClick={() => navigate('/assessment')}
              variant="secondary"
              size="lg"
              className="bg-white text-jung-primary hover:bg-jung-surface hover:text-jung-primary"
            >
              Take Free Assessment
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
