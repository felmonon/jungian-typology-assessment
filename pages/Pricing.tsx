import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, Clock, FileText, RefreshCcw, ShieldCheck, Sparkles, X, Shield } from 'lucide-react';
import { OfferCodeCallout } from '../components/OfferCodeCallout';
import { Button } from '../components/ui/Button';
import { PRICING } from '../data/pricing';
import type { PaidTierId, PricingTierId } from '../data/pricing';
import { AnalyticsEvents } from '../lib/analytics';
import { PAGE_SEO, useSEO } from '../hooks/useSEO';
import { STORAGE_KEYS } from '../lib/validation';

type Tier = {
  name: string;
  price: string;
  eyebrow: string;
  summary: string;
  bestFor: string;
  features: string[];
  buttonText: string;
  tier: PricingTierId;
  highlighted?: boolean;
};

const TIERS: Tier[] = [
  {
    name: 'Core Map',
    price: PRICING.free.price,
    eyebrow: 'Free map',
    summary: 'Answer 42 scenarios and get your core energy map before deciding anything.',
    bestFor: 'Seeing whether the TypeJung map feels accurate enough to keep.',
    features: [
      '42-scenario assessment',
      'Primary function hierarchy',
      'Consistency signal',
      'Private, no signup required',
    ],
    buttonText: 'Start free assessment',
    tier: 'free',
  },
  {
    name: 'Insight',
    price: PRICING.insight.price,
    eyebrow: 'Recommended report',
    summary: 'Unlock the complete 8-function ranking, stress patterns, relationship triggers, and practical guidance behind your free map.',
    bestFor: 'People whose free map feels accurate and who want the deeper explanation.',
    features: [
      'Full 8-function personal ranking',
      'Stress pattern map',
      'Relationship trigger interpretation',
      'Somatic practice guidance',
      'Instant access after Stripe',
    ],
    buttonText: 'Unlock Insight',
    tier: 'insight',
    highlighted: true,
  },
  {
    name: 'Mastery',
    price: PRICING.mastery.price,
    eyebrow: 'Report plus AI coach',
    summary: 'Get the full report plus AI Type Coach support and practice tools for working with the result over time.',
    bestFor: 'Ongoing questions, reflection prompts, and practice support after the first report.',
    features: [
      'Everything in Insight',
      'AI Type Coach',
      'Practice roadmap',
      'Saved account restore when signed in',
    ],
    buttonText: 'Add AI coach',
    tier: 'mastery',
  },
];

const COMPARISON_FEATURES = [
  { name: '42-question assessment', free: true, insight: true, mastery: true },
  { name: 'Energy map and hierarchy', free: true, insight: true, mastery: true },
  { name: 'Developmental edge report', free: false, insight: true, mastery: true },
  { name: 'Stress pattern map', free: false, insight: true, mastery: true },
  { name: 'Somatic practice guidance', free: false, insight: true, mastery: true },
  { name: 'AI Type Coach', free: false, insight: false, mastery: true },
  { name: 'Reassessment tracking', free: false, insight: false, mastery: true },
];

const FAQ_ITEMS = [
  {
    question: 'Is this a subscription?',
    answer: 'No. Insight and Mastery are one-time payments in Canadian dollars. There is no renewal or hidden subscription.',
  },
  {
    question: 'Which plan should I choose?',
    answer: 'Start free first. Choose Insight if the map feels accurate and you want the deeper report. Choose Mastery if you also want the AI coach and practice tools.',
  },
  {
    question: 'Can I start with Free and upgrade later?',
    answer: 'Yes. Take the assessment first, review the free map, then unlock the paid report only if the result feels worth keeping.',
  },
  {
    question: 'What if the paid report is not useful?',
    answer: 'Contact support within 30 days of purchase. If the paid report does not feel helpful, you can request a refund.',
  },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'CAD pricing', body: 'clear Canadian-dollar prices' },
  { icon: Clock, label: 'One-time payment', body: 'no renewal or subscription' },
  { icon: Sparkles, label: 'Secure checkout', body: 'payment handled by Stripe' },
  { icon: RefreshCcw, label: '30-day refund', body: 'request a refund if the paid report is not useful' },
];

const PREVIEW_MODULES = [
  {
    title: 'Developmental edge preview',
    tier: 'Insight',
    body: 'A plain-language read on the inferior function: where stress, projection, avoidance, or fascination may point toward the next growth edge.',
  },
  {
    title: 'Stress pattern map',
    tier: 'Insight',
    body: 'Examples of how your dominant-inferior axis can show up in pressure, conflict, work habits, and relationship triggers.',
  },
  {
    title: 'Practice plan sample',
    tier: 'Mastery',
    body: 'A starting exercise set for grounding, reflection, and follow-up coaching prompts tied to your cognitive stack.',
  },
];

const IncludedIcon: React.FC<{ included: boolean }> = ({ included }) => (
  <span
    className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${
      included ? 'bg-jung-accent-light text-jung-accent' : 'bg-jung-surface-alt text-jung-muted'
    }`}
    aria-label={included ? 'Included' : 'Not included'}
  >
    {included ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
  </span>
);

export const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [showAssessmentPrompt, setShowAssessmentPrompt] = useState(false);

  useSEO(PAGE_SEO.pricing);

  useEffect(() => {
    AnalyticsEvents.pricingViewed('pricing_page', document.referrer || undefined);
  }, []);

  const startAssessment = (location: string) => {
    AnalyticsEvents.ctaClicked('start_assessment', location, {
      buttonText: 'Start free assessment',
      destination: '/assessment',
    });
    navigate('/assessment');
  };

  const handleCheckout = async (tier: PricingTierId) => {
    if (tier === 'free') {
      startAssessment('pricing_free_tier');
      return;
    }

    const hasResults = localStorage.getItem(STORAGE_KEYS.RESULTS);
    if (!hasResults) {
      setShowAssessmentPrompt(true);
      return;
    }

    const paidTier: PaidTierId = tier;
    AnalyticsEvents.ctaClicked(`unlock_${paidTier}`, 'pricing_tier_card', {
      buttonText: PRICING[paidTier].name,
      destination: `/checkout/${paidTier}`,
    });
    AnalyticsEvents.upgradeClicked('pricing_tier_card', paidTier);
    navigate(`/checkout/${paidTier}`);
  };

  return (
    <div className="min-h-screen bg-jung-base">
      <section className="section-rule py-12 lg:py-16">
        <div className="editorial-container grid gap-10 lg:grid-cols-[0.78fr_1fr] lg:items-end">
          <div>
            <p className="text-label">Pricing</p>
            <h1 className="mt-4 text-display text-5xl text-jung-dark sm:text-6xl">
              Take the test first. Pay only if the result is worth keeping.
            </h1>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="accent"
                size="lg"
                onClick={() => startAssessment('pricing_hero')}
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Start with the free assessment
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  AnalyticsEvents.ctaClicked('preview_sample_report', 'pricing_hero', {
                    buttonText: 'Preview sample report',
                    destination: '/sample-report',
                  });
                  navigate('/sample-report');
                }}
              >
                Preview sample report
              </Button>
            </div>
          </div>
          <div className="max-w-2xl lg:justify-self-end">
            <p className="text-body-lg text-jung-secondary">
              The free assessment gives you the core map. Insight and Mastery are optional one-time upgrades for deeper interpretation, practice guidance, and coaching support.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TRUST_ITEMS.map(({ icon: Icon, label, body }) => (
                <div key={label} className="rounded-lg border border-jung-border bg-jung-surface p-4 shadow-sm">
                  <Icon className="mb-3 h-4 w-4 text-jung-accent" />
                  <p className="text-sm font-semibold text-jung-dark">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-jung-muted">{body}</p>
                </div>
              ))}
            </div>
            <OfferCodeCallout location="pricing_hero" compact className="mt-5" />
          </div>
        </div>
      </section>

      <section className="editorial-container py-12 lg:py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {TIERS.map((tier) => {
            return (
              <article
                key={tier.name}
                className={`relative flex min-h-full flex-col rounded-lg border p-5 shadow-sm transition-all sm:p-6 ${
                  tier.highlighted
                    ? 'border-jung-accent-muted bg-jung-dark text-white shadow-xl'
                    : 'border-jung-border bg-jung-surface hover:-translate-y-1 hover:border-jung-accent-muted hover:shadow-md'
                }`}
              >
                {tier.highlighted && (
                  <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-lg bg-jung-accent px-3 py-1.5 text-xs font-semibold text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                    Recommended
                  </span>
                )}

                <p className={`text-sm font-semibold ${tier.highlighted ? 'text-jung-subtle' : 'text-jung-accent'}`}>
                  {tier.eyebrow}
                </p>
                <h2 className={`mt-2 text-heading text-3xl ${tier.highlighted ? 'text-white' : 'text-jung-dark'}`}>
                  {tier.name}
                </h2>
                <div className="mt-5 flex flex-wrap items-end gap-x-2 gap-y-1">
                  <span className={`text-display text-4xl sm:text-5xl ${tier.highlighted ? 'text-white' : 'text-jung-dark'}`}>
                    {tier.price}
                  </span>
                  <span className={`pb-2 text-xs font-semibold uppercase tracking-[0.08em] ${tier.highlighted ? 'text-white/55' : 'text-jung-muted'}`}>
                    one-time
                  </span>
                </div>

                <p className={`mt-5 text-sm leading-6 ${tier.highlighted ? 'text-white/75' : 'text-jung-secondary'}`}>
                  {tier.summary}
                </p>
                <div className={`mt-5 rounded-lg border p-4 ${tier.highlighted ? 'border-white/15 bg-white/10' : 'border-jung-border bg-jung-base'}`}>
                  <p className={`text-xs font-semibold uppercase tracking-[0.08em] ${tier.highlighted ? 'text-jung-subtle' : 'text-jung-muted'}`}>
                    Best for
                  </p>
                  <p className={`mt-2 text-sm leading-6 ${tier.highlighted ? 'text-white/75' : 'text-jung-secondary'}`}>
                    {tier.bestFor}
                  </p>
                </div>

                <ul className="mt-6 grid flex-1 gap-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className={`flex gap-3 text-sm ${tier.highlighted ? 'text-white/78' : 'text-jung-secondary'}`}>
                      <Check className={`mt-0.5 h-4 w-4 flex-none ${tier.highlighted ? 'text-jung-accent-muted' : 'text-jung-accent'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleCheckout(tier.tier)}
                  variant={tier.highlighted ? 'accent' : 'primary'}
                  size="lg"
                  className="mt-8 w-full"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  {tier.buttonText}
                </Button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-jung-border bg-jung-surface py-14">
        <div className="editorial-container">
          <div className="mb-8 max-w-2xl">
            <p className="text-label">Compare</p>
            <h2 className="mt-3 text-heading text-4xl text-jung-dark">What each tier unlocks.</h2>
          </div>

          <div className="overflow-hidden rounded-lg border border-jung-border bg-jung-surface">
            <div className="hidden grid-cols-[1fr_8rem_8rem_8rem] border-b border-jung-border bg-jung-base text-xs font-semibold uppercase tracking-[0.08em] text-jung-muted md:grid">
              <div className="p-4">Feature</div>
              <div className="p-4 text-center">Free</div>
              <div className="p-4 text-center text-jung-accent">Insight</div>
              <div className="p-4 text-center">Mastery</div>
            </div>

            {COMPARISON_FEATURES.map((feature) => (
              <div key={feature.name} className="grid gap-3 border-b border-jung-border p-4 last:border-b-0 md:grid-cols-[1fr_8rem_8rem_8rem] md:items-center">
                <p className="text-sm font-semibold text-jung-dark">{feature.name}</p>
                <div className="grid grid-cols-3 gap-2 md:contents">
                  {[
                    ['Free', feature.free],
                    ['Insight', feature.insight],
                    ['Mastery', feature.mastery],
                  ].map(([label, included]) => (
                    <div key={label as string} className="flex items-center justify-between rounded-lg bg-jung-base px-3 py-2 md:justify-center md:bg-transparent md:px-4">
                      <span className="text-xs font-semibold text-jung-muted md:hidden">{label as string}</span>
                      <IncludedIcon included={Boolean(included)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-container py-14">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-start">
          <div>
            <p className="text-label">Paid preview</p>
            <h2 className="mt-3 text-heading text-4xl text-jung-dark">What the upgrade adds to your free map.</h2>
            <p className="mt-4 text-sm leading-7 text-jung-secondary">
              Free shows the scores and core axis. Paid tiers turn that map into interpretation you can use: what the pattern may mean, where it tends to tighten under pressure, and what to practice next.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {PREVIEW_MODULES.map((module) => (
              <div key={module.title} className="rounded-lg border border-jung-border bg-jung-surface p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-jung-accent">
                  <FileText className="h-4 w-4" />
                  {module.tier}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-jung-dark">{module.title}</h3>
                <p className="mt-3 text-sm leading-6 text-jung-secondary">{module.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-container pb-14">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: 'Private by default', body: 'The free result can stay local. Sign in when you want saved history, share links, or paid access restored across devices.' },
            { icon: Clock, title: 'Lifetime access', body: 'Paid access is a one-time purchase for the unlocked report tier.' },
            { icon: Sparkles, title: 'Upgrade after seeing value', body: 'You can complete the assessment first and decide after the free map is generated.' },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-jung-border bg-jung-surface p-6">
              <item.icon className="h-5 w-5 text-jung-accent" />
              <h3 className="mt-4 text-lg font-semibold text-jung-dark">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-jung-secondary">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="editorial-container pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <p className="text-label">Questions</p>
            <h2 className="mt-3 text-heading text-4xl text-jung-dark">Clear answers before checkout.</h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group rounded-lg border border-jung-border bg-jung-surface">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 p-5">
                  <span className="font-semibold text-jung-dark">{item.question}</span>
                  <ChevronDown className="h-5 w-5 flex-none text-jung-muted transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-5 text-sm leading-6 text-jung-secondary">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-jung-dark py-16">
        <div className="editorial-container grid gap-8 text-white lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-white/60">Ready when you are</p>
            <h2 className="mt-3 text-heading text-4xl text-white">Start with the free map. Decide after you see it.</h2>
          </div>
          <Button variant="inverted" size="lg" onClick={() => startAssessment('pricing_final_cta')} rightIcon={<ArrowRight className="h-5 w-5" />}>
            Start free assessment
          </Button>
        </div>
      </section>

      {/* Free Assessment Needed Modal */}
      <AnimatePresence>
        {showAssessmentPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setShowAssessmentPrompt(false)}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative flex w-full max-w-lg flex-col gap-6 overflow-hidden rounded-lg border border-white/10 bg-jung-dark p-8 shadow-2xl sm:p-10"
            >
              <div className="flex items-start justify-between">
                <div className="inline-flex items-center gap-2 rounded-lg bg-jung-accent/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-jung-accent">
                  <Sparkles className="h-3.5 w-3.5" /> Free map needed
                </div>
                <button
                  onClick={() => setShowAssessmentPrompt(false)}
                  className="rounded-lg p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-left text-display text-2xl leading-snug tracking-tight text-white sm:text-3xl">
                  Start with your free map.
                </h3>
                <p className="text-left text-sm leading-relaxed text-jung-subtle sm:text-base">
                  The paid report is built from your own TypeJung result. Answer the 42 scenarios first, then come back to choose Insight or Mastery.
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    setShowAssessmentPrompt(false);
                    startAssessment('pricing_assessment_required_modal');
                  }}
                  className="flex flex-1 items-center justify-center gap-3 rounded-lg bg-jung-accent py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-jung-accent/25 transition-all hover:-translate-y-0.5 hover:bg-jung-accent-hover"
                >
                  Start free assessment <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowAssessmentPrompt(false)}
                  className="rounded-lg border border-white/5 bg-white/5 px-6 py-4 text-xs font-bold uppercase tracking-widest text-jung-subtle transition-all hover:bg-white/10"
                >
                  Dismiss
                </button>
              </div>

              <div className="flex items-center gap-3 border-t border-white/5 pt-6 text-left text-[10px] uppercase tracking-widest text-jung-muted">
                <Shield className="h-4 w-4 text-jung-accent/70" />
                <span>Private by default • No account required</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
