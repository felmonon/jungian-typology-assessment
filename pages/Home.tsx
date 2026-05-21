import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  Check,
  ChevronDown,
  Compass,
  Lock,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { DiscountCaptureCard } from '../components/discount/DiscountCaptureCard';
import { Button } from '../components/ui/Button';
import { FunctionRadial } from '../components/home/FunctionRadial';
import { PRICING } from '../data/pricing';
import { AnalyticsEvents } from '../lib/analytics';
import { PAGE_SEO, useSEO } from '../hooks/useSEO';

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

const stagger: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const sampleProfile = [
  { name: 'Ti', label: 'Thinking inward', value: 82, role: 'Dominant' },
  { name: 'Ne', label: 'Possibility scanning', value: 71, role: 'Auxiliary' },
  { name: 'Si', label: 'Memory and pattern recall', value: 58, role: 'Support' },
  { name: 'Te', label: 'External structure', value: 54, role: 'Available' },
  { name: 'Ni', label: 'Long-range synthesis', value: 49, role: 'Available' },
  { name: 'Se', label: 'Present contact', value: 44, role: 'Pressure' },
  { name: 'Fi', label: 'Personal value signal', value: 38, role: 'Quiet' },
  { name: 'Fe', label: 'Interpersonal attunement', value: 24, role: 'Inferior' },
];

const trustPoints = [
  'No account required for the free map',
  '42 scenario-based questions',
  'Paid upgrade only after your result',
];

const valueCards = [
  {
    icon: Compass,
    title: 'A readable map, not a vague label',
    description:
      'See all eight cognitive functions at once, including which functions lead, which support, and which create stress.',
  },
  {
    icon: Brain,
    title: 'Built around actual patterns',
    description:
      'Questions focus on attention, stress, conflict, body signals, decisions, and relationships instead of simple identity claims.',
  },
  {
    icon: MessageCircle,
    title: 'Depth only when you want it',
    description:
      'Start free. Upgrade to Insight or Mastery only if the map earns your trust and you want deeper interpretation.',
  },
];

const steps = [
  ['01', 'Answer the assessment', 'Move through 42 prompts about attention, stress, decisions, and relationships.'],
  ['02', 'Read the free map', 'Get your function pattern, dominant-inferior axis, and a plain-language summary.'],
  ['03', 'Upgrade for depth', 'Unlock guided interpretation, growth practices, and the AI Type Coach when useful.'],
];

const pricingTiers = [
  {
    id: 'free',
    name: 'Free',
    price: PRICING.free.price,
    amount: PRICING.free.amount,
    description: 'Take the full assessment and see the core map.',
    features: ['42 questions', 'Function map', 'Dominant-inferior axis', 'No signup required'],
    cta: 'Start free',
  },
  {
    id: 'insight',
    name: PRICING.insight.name,
    price: PRICING.insight.price,
    amount: PRICING.insight.amount,
    description: 'Understand the meaning behind your map.',
    features: ['Deeper written report', 'Stress pattern analysis', 'Relationship triggers', 'Grounding practices'],
    cta: 'View Insight',
    highlighted: true,
  },
  {
    id: 'mastery',
    name: PRICING.mastery.name,
    price: PRICING.mastery.price,
    amount: PRICING.mastery.amount,
    description: 'Use your map with guided follow-up support.',
    features: ['Everything in Insight', 'AI Type Coach', 'Growth exercises', 'Practice roadmap'],
    cta: 'View Mastery',
  },
];

const faqs = [
  {
    question: 'Is this just another MBTI test?',
    answer:
      'No. TypeJung does not stop at a four-letter label. It maps all eight functions and shows the tension between dominant strengths and inferior-function pressure.',
  },
  {
    question: 'Do I need to pay first?',
    answer:
      'No. The full assessment starts free. Paid reports are optional upgrades after you have seen whether the free map feels useful.',
  },
  {
    question: 'Is this clinical or diagnostic?',
    answer:
      'No. TypeJung is an educational self-reflection tool. It is meant to help you observe patterns, not diagnose a condition.',
  },
  {
    question: 'How long does it take?',
    answer:
      'Most people finish in about 12 to 16 minutes. The best results come from answering quickly and honestly instead of trying to optimize the outcome.',
  },
];

const seoGuideLinks = [
  ['Jungian test', '/jungian-test'],
  ['Cognitive function test', '/cognitive-function-test'],
  ['MBTI alternative', '/mbti-alternative'],
  ['Inferior function test', '/inferior-function-test'],
  ['Shadow work test', '/shadow-work-test'],
  ['Why MBTI changes', '/mbti-keeps-changing'],
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useSEO(PAGE_SEO.home);

  const startAssessment = (location: string) => {
    AnalyticsEvents.ctaClicked('start_assessment', location);
    navigate('/assessment');
  };

  const goPricing = (tier: string, amount: number) => {
    AnalyticsEvents.ctaClicked(`view_${tier.toLowerCase()}_pricing`, 'pricing_section');
    AnalyticsEvents.purchaseStarted(tier, amount);
    navigate('/pricing');
  };

  return (
    <ErrorBoundary>
      <div className="relative overflow-hidden">
        <section className="relative border-b border-jung-border-light bg-[linear-gradient(180deg,#fbfaf6_0%,#f3efe5_100%)]">
          <div className="lab-container grid gap-12 py-14 md:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-24">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="mb-7 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-jung-border bg-white px-3 py-1 text-xs font-semibold text-jung-secondary shadow-sm">
                  Free Jungian cognitive function assessment
                </span>
                <span className="rounded-full bg-jung-accent-light px-3 py-1 text-xs font-semibold text-jung-accent">
                  12-16 minutes
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="max-w-4xl text-balance font-display text-[44px] font-semibold leading-[0.98] text-jung-dark sm:text-6xl lg:text-[74px]"
              >
                See the pattern behind your personality.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-7 max-w-2xl text-lg leading-8 text-jung-secondary md:text-xl"
              >
                TypeJung maps your cognitive functions, stress edge, and dominant-inferior
                tension without forcing you into a shallow four-letter result.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => startAssessment('home_hero')}
                  variant="accent"
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="rounded-full"
                >
                  Start free assessment
                </Button>
                <Button
                  onClick={() => navigate('/learn')}
                  variant="inverted"
                  size="lg"
                  className="rounded-full border border-jung-border"
                >
                  See how it works
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-9 grid gap-3 sm:grid-cols-3">
                {trustPoints.map((point) => (
                  <div key={point} className="flex items-start gap-2 text-sm text-jung-secondary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-jung-accent" />
                    <span>{point}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease }}
              className="relative"
            >
              <div className="rounded-[28px] border border-jung-border bg-white p-4 shadow-xl shadow-jung-dark/10 md:p-5">
                <div className="rounded-3xl border border-jung-border-light bg-jung-base p-5 md:p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-jung-muted">
                        Sample result
                      </p>
                      <h2 className="mt-1 font-display text-3xl font-semibold text-jung-dark">
                        Ti-Ne profile
                      </h2>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-jung-accent shadow-sm">
                      Free map
                    </div>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
                    <div className="mx-auto w-full max-w-[260px]">
                      <FunctionRadial
                        data={sampleProfile.map(({ name, label, value }) => ({ name, label, value }))}
                        size={300}
                      />
                    </div>

                    <div className="space-y-3">
                      {sampleProfile.slice(0, 5).map((fn) => (
                        <div key={fn.name} className="rounded-2xl bg-white p-3 shadow-sm">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-jung-accent-light font-display text-lg italic text-jung-accent">
                                {fn.name}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-jung-dark">{fn.label}</p>
                                <p className="text-xs text-jung-muted">{fn.role}</p>
                              </div>
                            </div>
                            <span className="font-mono text-sm text-jung-dark">{fn.value}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-jung-surface-alt">
                            <div className="h-full rounded-full bg-jung-accent" style={{ width: `${fn.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-jung-border-light bg-white p-4">
                    <p className="text-sm font-semibold text-jung-dark">What the report explains</p>
                    <p className="mt-1 text-sm leading-6 text-jung-secondary">
                      Why the Ti-Ne pattern seeks precision first, explores possibilities second,
                      and may experience Fe as social pressure under stress.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-b border-jung-border-light bg-white">
          <div className="lab-container grid gap-px bg-jung-border-light md:grid-cols-3">
            {valueCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="bg-white px-6 py-8 md:px-8">
                  <Icon className="h-6 w-6 text-jung-accent" />
                  <h3 className="mt-5 font-display text-2xl font-semibold text-jung-dark">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-jung-secondary">{card.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-jung-base py-20 lg:py-28">
          <div className="lab-container">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase text-jung-muted">
                  How it works
                </p>
                <h2 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-tight text-jung-dark md:text-5xl">
                  A clearer path from curiosity to usable insight.
                </h2>
              </div>
              <div className="grid gap-4">
                {steps.map(([number, title, description]) => (
                  <div key={number} className="rounded-3xl border border-jung-border bg-white p-6 shadow-sm">
                    <div className="flex gap-5">
                      <span className="font-mono text-xs font-semibold text-jung-accent">{number}</span>
                      <div>
                        <h3 className="font-display text-2xl font-semibold text-jung-dark">{title}</h3>
                        <p className="mt-2 text-sm leading-7 text-jung-secondary">{description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="border-y border-jung-border-light bg-white py-20 lg:py-28">
          <div className="lab-container">
            <div className="mb-12 max-w-2xl">
              <p className="text-xs font-semibold uppercase text-jung-muted">
                Pricing
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-jung-dark md:text-5xl">
                Start free. Upgrade only when the map is useful.
              </h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {pricingTiers.map((tier) => {
                const highlighted = tier.highlighted;
                return (
                  <div
                    key={tier.id}
                    className={`relative flex flex-col rounded-3xl border p-6 shadow-sm ${
                      highlighted
                        ? 'border-jung-accent bg-jung-accent text-white shadow-jung-accent/20'
                        : 'border-jung-border bg-jung-base text-jung-dark'
                    }`}
                  >
                    {highlighted && (
                      <span className="absolute right-5 top-5 rounded-full bg-white/14 px-3 py-1 text-xs font-semibold">
                        Recommended
                      </span>
                    )}
                    <h3 className="font-display text-3xl font-semibold">{tier.name}</h3>
                    <p className={`mt-2 text-sm ${highlighted ? 'text-white/76' : 'text-jung-secondary'}`}>
                      {tier.description}
                    </p>
                    <div className="mt-7 flex items-end gap-2">
                      <span className="font-display text-5xl font-semibold">{tier.price}</span>
                      <span className={`mb-2 text-xs font-semibold ${highlighted ? 'text-white/60' : 'text-jung-muted'}`}>
                        {tier.id === 'free' ? 'to start' : 'one-time'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        tier.id === 'free'
                          ? startAssessment('home_pricing_free')
                          : goPricing(tier.name, tier.amount)
                      }
                      className={`mt-7 inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold transition-all ${
                        highlighted
                          ? 'bg-white text-jung-accent hover:bg-white/92'
                          : 'bg-jung-dark text-white hover:bg-jung-accent'
                      }`}
                    >
                      {tier.cta}
                    </button>
                    <ul className={`mt-7 space-y-3 border-t pt-6 ${highlighted ? 'border-white/16' : 'border-jung-border'}`}>
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <Check className={`mt-0.5 h-4 w-4 shrink-0 ${highlighted ? 'text-white' : 'text-jung-accent'}`} />
                          <span className={highlighted ? 'text-white/90' : 'text-jung-secondary'}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <DiscountCaptureCard source="home_pricing_section" compact className="mx-auto mt-10 max-w-3xl" />
          </div>
        </section>

        <section className="bg-jung-base py-20 lg:py-28">
          <div className="lab-container grid gap-10 lg:grid-cols-[0.88fr_1.12fr]">
            <div>
              <p className="text-xs font-semibold uppercase text-jung-muted">
                Before you start
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-jung-dark md:text-5xl">
                Straight answers, no personality-test hype.
              </h2>
            </div>
            <div className="divide-y divide-jung-border overflow-hidden rounded-3xl border border-jung-border bg-white">
              {faqs.map((faq, index) => {
                const open = openFaq === index;
                return (
                  <div key={faq.question}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : index)}
                      className="flex w-full items-start justify-between gap-5 px-6 py-5 text-left transition-colors hover:bg-jung-surface-alt"
                      aria-expanded={open}
                    >
                      <span className="font-display text-xl font-semibold text-jung-dark">{faq.question}</span>
                      <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-jung-muted transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && (
                      <div className="px-6 pb-6">
                        <p className="max-w-2xl text-sm leading-7 text-jung-secondary">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-jung-border-light bg-white py-16">
          <div className="lab-container">
            <div className="mb-7 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-jung-accent" />
              <h2 className="font-display text-2xl font-semibold text-jung-dark">Useful guides</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {seoGuideLinks.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="rounded-full border border-jung-border bg-jung-base px-4 py-2 text-sm font-semibold text-jung-secondary transition-colors hover:border-jung-accent hover:text-jung-accent"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-jung-accent px-4 py-16 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[32px] border border-white/15 bg-white/8 p-8 md:p-12">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold">
                  <Lock className="h-3.5 w-3.5" />
                  Private by default
                </div>
                <h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight md:text-5xl">
                  Take the assessment before you decide anything.
                </h2>
                <p className="mt-4 max-w-xl text-white/74">
                  You will know quickly whether the map gives you something more precise than a normal type quiz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => startAssessment('home_final_cta')}
                className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-jung-accent transition-transform hover:-translate-y-0.5"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
};
