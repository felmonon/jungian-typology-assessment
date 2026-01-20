import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Check, X, ChevronDown, ChevronUp, Loader2, Sparkles, Star, Crown, ArrowRight } from 'lucide-react';

const TIERS = [
  {
    name: 'FREE',
    price: 'Free',
    tagline: 'See Your Profile',
    features: [
      'Full 132-question assessment',
      'Radar chart of all 8 functions',
      'Basic AI-generated insight',
      'Shareable results',
    ],
    buttonText: 'Take Free Assessment',
    buttonLink: '/assessment',
    tier: 'free',
  },
  {
    name: 'INSIGHT',
    price: '$19',
    tagline: 'Understand What It Means',
    badge: 'Most Popular',
    includesPrefix: 'Everything in Free, plus:',
    features: [
      '25-page downloadable PDF report',
      'Complete 8-function analysis',
      'Archetypal stack dynamics',
      'Stress & shadow patterns',
      'Relationship insights',
      'Career alignment guide',
      'Lifetime access & retakes',
    ],
    buttonText: 'Get Full Insight — $19',
    note: 'One-time payment. No subscription.',
    tier: 'insight',
    highlighted: true,
  },
  {
    name: 'MASTERY',
    price: '$39',
    tagline: 'Transform With Guidance',
    badge: 'Best Value',
    includesPrefix: 'Everything in Insight, plus:',
    features: [
      { text: 'AI Type Coach (unlimited)', subtext: 'Ask anything about your type' },
      'Individuation roadmap',
      'Active imagination prompts',
      'Dream journaling guide',
      'Shadow work exercises',
      'Monthly growth prompts',
      'Priority support',
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
    answer: "Insight gives you a complete analysis of your type — the 25-page PDF covers everything about your cognitive functions, relationships, and career alignment. Mastery adds the AI Type Coach, so you can ask unlimited questions about your results and get personalized guidance on growth.",
  },
  {
    question: "Is this a subscription?",
    answer: "No. Both Insight and Mastery are one-time payments with lifetime access. Pay once, keep forever.",
  },
  {
    question: "Can I upgrade from Insight to Mastery later?",
    answer: "Yes. If you purchase Insight and later want the AI Coach, you can upgrade for the difference ($20).",
  },
  {
    question: "What if I'm not satisfied?",
    answer: "Email us within 30 days for a full refund. No questions asked.",
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
    <div className="flex flex-col items-center">
      <section className="w-full bg-stone-100 py-12 sm:py-16 md:py-20 px-4 border-b border-stone-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-jung-dark mb-4">
              Choose Your Path to Self-Understanding
            </h1>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Start free, go deeper when you're ready. No subscriptions, no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative bg-white rounded-2xl p-6 sm:p-8 border-2 transition-all ${
                  tier.highlighted
                    ? 'border-jung-primary shadow-xl md:-translate-y-2 md:scale-105'
                    : tier.bestValue
                    ? 'border-jung-accent shadow-lg'
                    : 'border-stone-200 shadow-sm'
                }`}
              >
                {tier.badge && (
                  <div
                    className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 ${
                      tier.highlighted
                        ? 'bg-jung-primary text-white'
                        : 'bg-jung-accent text-white'
                    }`}
                  >
                    {tier.highlighted ? (
                      <Star className="w-4 h-4" />
                    ) : (
                      <Crown className="w-4 h-4" />
                    )}
                    {tier.badge}
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-serif font-bold text-jung-dark mb-2">
                    {tier.name}
                  </h3>
                  <div className="text-4xl font-bold text-jung-dark mb-2">
                    {tier.price}
                  </div>
                  <p className="text-stone-600">{tier.tagline}</p>
                </div>

                {tier.includesPrefix && (
                  <p className="text-sm text-stone-500 mb-4 font-medium">
                    {tier.includesPrefix}
                  </p>
                )}

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => {
                    const text = typeof feature === 'string' ? feature : feature.text;
                    const subtext = typeof feature === 'object' ? feature.subtext : null;
                    return (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-stone-700">{text}</span>
                          {subtext && (
                            <span className="block text-sm text-stone-500 mt-0.5">
                              {subtext}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <Button
                  onClick={() =>
                    tier.buttonLink
                      ? navigate(tier.buttonLink)
                      : handleCheckout(tier.tier)
                  }
                  disabled={loadingTier === tier.tier}
                  variant={tier.highlighted || tier.bestValue ? 'primary' : 'outline'}
                  className={`w-full py-4 font-semibold ${
                    tier.highlighted
                      ? 'bg-jung-primary hover:bg-jung-primary/90'
                      : tier.bestValue
                      ? 'bg-jung-accent hover:bg-jung-accent/90'
                      : ''
                  }`}
                >
                  {loadingTier === tier.tier ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : tier.tier === 'free' ? (
                    <>
                      {tier.buttonText}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  ) : (
                    tier.buttonText
                  )}
                </Button>

                {tier.note && (
                  <p className="text-center text-sm text-stone-500 mt-4">
                    {tier.note}
                  </p>
                )}
              </div>
            ))}
          </div>

          {error && (
            <p className="text-center text-red-600 mt-6">{error}</p>
          )}
        </div>
      </section>

      <section className="w-full bg-white py-12 sm:py-16 md:py-20 px-4 border-b border-stone-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-jung-dark text-center mb-10">
            Feature Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-stone-200">
              <thead>
                <tr className="bg-jung-primary text-white">
                  <th className="px-4 py-4 text-left font-medium">Feature</th>
                  <th className="px-4 py-4 text-center font-medium">Free</th>
                  <th className="px-4 py-4 text-center font-medium bg-jung-primary/90">
                    Insight ($19)
                  </th>
                  <th className="px-4 py-4 text-center font-medium">
                    Mastery ($39)
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {COMPARISON_FEATURES.map((feature, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50'}
                  >
                    <td className="px-4 py-3 font-medium text-jung-dark">
                      {feature.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {feature.free ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-stone-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center bg-jung-primary/5">
                      {feature.insight ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-stone-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {feature.mastery ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-stone-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="w-full bg-stone-50 py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-jung-dark text-center mb-10">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-stone-50 transition-colors"
                >
                  <span className="font-medium text-jung-dark pr-4">
                    {item.question}
                  </span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-stone-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5">
                    <p className="text-stone-600 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-jung-primary py-12 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <Sparkles className="w-8 h-8 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4">
            Ready to discover who you really are?
          </h2>
          <p className="text-white/80 mb-6">
            Start with the free assessment. Upgrade anytime.
          </p>
          <Button
            onClick={() => navigate('/assessment')}
            className="bg-white hover:bg-stone-100 px-8 py-4 text-lg font-semibold"
            style={{ color: '#5D4E37' }}
          >
            Take Free Assessment
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};
