import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  Check,
  ChevronDown,
  Compass,
  FileText,
  Lock,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { DiscountCaptureCard } from '../components/discount/DiscountCaptureCard';
import { Button } from '../components/ui/Button';
import { FunctionRadial } from '../components/home/FunctionRadial';
import { PRICING } from '../data/pricing';
import { discountedPriceLabel, EMAIL_CAPTURE_OFFER } from '../data/discount';
import { AnalyticsEvents, trackEvent } from '../lib/analytics';
import { pathWithSource } from '../lib/acquisition-source';
import { PAGE_SEO, useSEO } from '../hooks/useSEO';

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
  '42 prompts, usually 12-16 minutes',
  'Free all-8-function map first',
  'Paid depth only after the result',
];

const valueCards = [
  {
    icon: Compass,
    title: 'Stop collecting labels',
    description:
      'Built for people comparing INFJ vs INFP, INTJ vs INTP, Sakinorva alternatives, and changing MBTI results.',
  },
  {
    icon: Brain,
    title: 'Read the pattern',
    description:
      'See all eight cognitive functions, likely stack shape, reliability, and dominant-inferior tension before paying.',
  },
  {
    icon: MessageCircle,
    title: 'Work with the stress edge',
    description:
      'Use paid depth only when the free map explains something real and you want practical interpretation behind it.',
  },
];

const proofSignals = [
  {
    label: 'Likely stack',
    value: 'Ti-Ne',
    note: 'Shown as a working hypothesis, not a final identity claim.',
  },
  {
    label: 'Stress edge',
    value: 'Ti to Fe',
    note: 'The dominant-inferior tension stays visible.',
  },
  {
    label: 'Before checkout',
    value: 'Free',
    note: 'You inspect the map before choosing paid interpretation.',
  },
];

const steps = [
  ['01', 'Answer the assessment', 'Move through 42 prompts about attention, stress, decisions, and relationships.'],
  ['02', 'Read the free function-stack map', 'Get your full function pattern, dominant-inferior axis, and a plain-language summary.'],
  ['03', 'Upgrade for depth', 'Unlock guided interpretation, growth practices, and the AI Type Guide when useful.'],
];

const reportQuestions = [
  'Which function is leading my attention, and which one creates pressure?',
  'Why do I repeat the same stress pattern in work or relationships?',
  'What does my result mean beyond a four-letter personality label?',
  'What should I practice this week so the insight becomes useful?',
];

const pricingTiers = [
  {
    id: 'free',
    name: 'Free',
    price: PRICING.free.price,
    description: 'Take the full assessment and decide from the function-stack map.',
    features: ['42 questions', 'Eight-function map', 'Dominant-inferior axis', 'No card required'],
    cta: 'Start free',
  },
  {
    id: 'insight',
    name: PRICING.insight.name,
    price: discountedPriceLabel(PRICING.insight.amount),
    originalPrice: PRICING.insight.price,
    priceNote: `${EMAIL_CAPTURE_OFFER.code} auto-applies on Stripe`,
    description: 'Turn your result into a practical interpretation.',
    features: ['Developmental edge', 'Stress-pattern map', 'Relationship pattern', 'Practice prompts'],
    cta: `View Insight - ${discountedPriceLabel(PRICING.insight.amount)}`,
    highlighted: true,
  },
  {
    id: 'mastery',
    name: PRICING.mastery.name,
    price: discountedPriceLabel(PRICING.mastery.amount),
    originalPrice: PRICING.mastery.price,
    priceNote: `${EMAIL_CAPTURE_OFFER.code} auto-applies on Stripe`,
    description: 'Use the report with guided follow-up support.',
    features: ['Everything in Insight', 'AI Type Guide', 'Growth exercises', 'Individuation roadmap'],
    cta: `View Mastery - ${discountedPriceLabel(PRICING.mastery.amount)}`,
  },
];

const faqs = [
  {
    question: 'Is this just another MBTI test?',
    answer:
      'No. TypeJung does not stop at a four-letter label. It maps all eight functions and shows the dominant-inferior tension behind the result.',
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

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useSEO(PAGE_SEO.home);

  useEffect(() => {
    trackEvent('home_wedge_viewed', {
      source: 'home',
      promise: 'mbti_alternative_function_stack',
      version: '2026_06_remake',
    });
  }, []);

  const startAssessment = (location: string) => {
    const destination = pathWithSource('/assessment', location);
    trackEvent('assessment_start_intent', {
      source: location,
      promise: 'mbti_alternative_function_stack',
    });
    AnalyticsEvents.ctaClicked('start_assessment', location, {
      buttonText: 'Get my free map',
      destination,
    });
    navigate(destination);
  };

  const goPricing = (tier: string) => {
    const normalizedTier = tier.toLowerCase();
    const destination = pathWithSource(`/pricing?tier=${normalizedTier}`, `home_pricing_${normalizedTier}`);
    AnalyticsEvents.ctaClicked(`view_${normalizedTier}_pricing`, 'pricing_section', {
      buttonText: `View ${tier}`,
      destination,
    });
    navigate(destination);
  };

  const viewSampleReport = (location: string) => {
    const destination = pathWithSource('/sample-report', location);
    AnalyticsEvents.ctaClicked('view_sample_report', location, {
      buttonText: 'View sample report',
      destination,
    });
    navigate(destination);
  };

  return (
    <ErrorBoundary>
      <div className="relative overflow-hidden">
        <section className="relative border-b border-jung-border-light bg-[linear-gradient(180deg,#fbfaf6_0%,#f3efe5_100%)]">
          <div className="lab-container grid gap-10 py-10 md:py-14 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:py-16">
            <div>
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-jung-border bg-white px-3 py-1 text-xs font-semibold text-jung-secondary shadow-sm">
                  Free Jungian function-stack map
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-jung-accent-light px-3 py-1 text-xs font-semibold text-jung-accent">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Free before checkout
                </span>
              </div>

              <h1 className="max-w-4xl text-balance font-display text-[38px] font-semibold leading-[1.02] text-jung-dark sm:text-5xl lg:text-[64px]">
                When your MBTI result keeps changing, map the pattern underneath.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-jung-secondary md:text-lg">
                TypeJung shows the function-stack pattern behind nearby type labels: all eight
                functions, the dominant-inferior tension, and the stress edge behind your result.
                Start with the free map. Upgrade only if it explains something real.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => startAssessment('home_hero')}
                  variant="accent"
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="rounded-full"
                >
                  Get my free map
                </Button>
                <Button
                  onClick={() => viewSampleReport('home_hero')}
                  variant="inverted"
                  size="lg"
                  className="rounded-full border border-jung-border"
                >
                  View sample report
                </Button>
              </div>
              <p className="mt-3 text-sm leading-6 text-jung-muted">
                Answer the free assessment, read your map, then decide whether deeper interpretation is worth it.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {trustPoints.map((point) => (
                  <div key={point} className="flex items-start gap-2 text-sm text-jung-secondary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-jung-accent" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-jung-border bg-white p-4 shadow-xl shadow-jung-dark/10 md:p-5">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-jung-muted">Sample free result</p>
                  <h2 className="mt-1 font-display text-3xl font-semibold text-jung-dark">Function-stack map</h2>
                </div>
                <span className="rounded-full bg-jung-accent-light px-3 py-1 text-xs font-semibold text-jung-accent">
                  Free map
                </span>
              </div>

              <div className="mb-5 grid gap-2 sm:grid-cols-3">
                {proofSignals.map((signal) => (
                  <div key={signal.label} className="rounded-lg border border-jung-border-light bg-jung-base px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-jung-muted">
                      {signal.label}
                    </p>
                    <p className="mt-1 font-display text-xl font-semibold text-jung-dark">{signal.value}</p>
                    <p className="mt-1 text-xs leading-5 text-jung-secondary">{signal.note}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div className="mx-auto w-full max-w-[250px]">
                  <FunctionRadial
                    data={sampleProfile.map(({ name, label, value }) => ({ name, label, value }))}
                    size={292}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-jung-muted">
                    Top signals
                  </p>
                  {sampleProfile.slice(0, 4).map((fn) => (
                    <div key={fn.name} className="rounded-lg bg-jung-base p-2.5">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white font-display text-base italic text-jung-accent shadow-sm">
                            {fn.name}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-jung-dark">{fn.label}</p>
                            <p className="text-xs text-jung-muted">{fn.role}</p>
                          </div>
                        </div>
                        <span className="font-mono text-sm text-jung-dark">{fn.value}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-jung-border-light">
                        <div className="h-full rounded-full bg-jung-accent" style={{ width: `${fn.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-jung-border-light pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-jung-muted">
                  All 8 functions remain visible
                </p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 lg:grid-cols-4 xl:grid-cols-8">
                  {sampleProfile.map((fn) => (
                    <div key={fn.name} className="rounded-lg bg-jung-base px-2 py-2 text-center">
                      <p className="font-display text-base font-semibold italic text-jung-accent">{fn.name}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-jung-muted">{fn.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>


        <section className="border-b border-jung-border-light bg-white py-12 lg:py-14">
          <div className="lab-container grid gap-4 md:grid-cols-3">
            {valueCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-lg border border-jung-border bg-jung-base p-5">
                  <Icon className="h-5 w-5 text-jung-accent" />
                  <h3 className="mt-4 font-display text-2xl font-semibold text-jung-dark">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-jung-secondary">{card.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-jung-base py-12 lg:py-20">
          <div className="lab-container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase text-jung-muted">How it works</p>
              <h2 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-tight text-jung-dark md:text-5xl">
                A clear path from curiosity to usable insight.
              </h2>
            </div>
            <div className="grid gap-4">
              {steps.map(([number, title, description]) => (
                <div key={number} className="rounded-lg border border-jung-border bg-white p-5 shadow-sm">
                  <div className="flex gap-4">
                    <span className="mt-1 font-mono text-xs font-semibold text-jung-accent">{number}</span>
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-jung-dark">{title}</h3>
                      <p className="mt-2 text-sm leading-7 text-jung-secondary">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-jung-border-light bg-white py-6">
          <div className="lab-container">
            <div className="grid gap-4 rounded-lg border border-jung-border bg-jung-base p-5 md:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)] md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-jung-muted">
                  Save the path
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-jung-dark">
                  Not ready for a 12-minute assessment right now?
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-jung-secondary">
                  Email yourself the free test link and the paid-report code. The result still stays free to view first.
                </p>
              </div>
              <DiscountCaptureCard
                source="home_post_hero_save_path"
                compact
                minimal
                minimalTitle="Email me the test"
                minimalDescription={`Get the free assessment link, sample report, and ${EMAIL_CAPTURE_OFFER.code} code in one private email.`}
                minimalSubmitLabel="Send the link"
                minimalFootnote="One email with the next step. No subscription."
                minimalSentMessage="Path sent. The email links back to the free assessment and keeps the upgrade code ready."
                preferredTier="insight"
                showCheckoutButtons={false}
              />
            </div>
          </div>
        </section>

        <section className="border-y border-jung-border-light bg-white py-12 lg:py-20">
          <div className="lab-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-jung-accent-light text-jung-accent">
                <FileText className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase text-jung-muted">Paid report preview</p>
              <h2 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-tight text-jung-dark md:text-5xl">
                The upgrade has to earn its place.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-jung-secondary">
                Insight and Mastery are not a second test. They explain the result you already saw:
                the edge, stress pattern, relationship reflection, and next practice.
              </p>
              <Button
                onClick={() => viewSampleReport('home_paid_preview')}
                variant="secondary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="mt-7"
              >
                View sample report
              </Button>
            </div>

            <div className="grid gap-3">
              {reportQuestions.map((question) => (
                <div key={question} className="flex items-start gap-4 rounded-lg border border-jung-border bg-jung-base p-5">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-jung-accent" />
                  <p className="text-sm font-semibold leading-7 text-jung-dark">{question}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="border-b border-jung-border-light bg-white py-12 lg:py-20">
          <div className="lab-container">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-semibold uppercase text-jung-muted">Pricing</p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-jung-dark md:text-5xl">
                Buy the interpretation only if the free map makes sense.
              </h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {pricingTiers.map((tier) => {
                const highlighted = tier.highlighted;
                return (
                  <div
                    key={tier.id}
                    className={`relative flex flex-col rounded-lg border p-6 shadow-sm ${
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
                      <span className="font-display text-4xl font-semibold sm:text-5xl">{tier.price}</span>
                      <span className={`mb-2 text-xs font-semibold ${highlighted ? 'text-white/60' : 'text-jung-muted'}`}>
                        {tier.id === 'free' ? 'to start' : 'one-time'}
                      </span>
                    </div>
                    {tier.originalPrice && (
                      <p className={`mt-2 text-xs leading-5 ${highlighted ? 'text-white/70' : 'text-jung-muted'}`}>
                        <span className="line-through">{tier.originalPrice}</span> before code. {tier.priceNote}.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        tier.id === 'free'
                          ? startAssessment('home_pricing_free')
                          : goPricing(tier.name)
                      }
                      className={`mt-7 inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold transition-all ${
                        highlighted
                          ? 'bg-white text-jung-accent hover:bg-white/92'
                          : 'bg-jung-dark text-white hover:bg-jung-accent'
                      }`}
                    >
                      {tier.id === 'free' ? 'Get my free map' : tier.cta}
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

            <DiscountCaptureCard source="home_pricing_section" compact className="mx-auto mt-8 max-w-3xl" />
          </div>
        </section>


        <section className="bg-jung-base py-12 lg:py-20">
          <div className="lab-container grid gap-10 lg:grid-cols-[0.88fr_1.12fr]">
            <div>
              <p className="text-xs font-semibold uppercase text-jung-muted">Before you start</p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-jung-dark md:text-5xl">
                Straight answers, no personality-test hype.
              </h2>
            </div>
            <div className="divide-y divide-jung-border overflow-hidden rounded-lg border border-jung-border bg-white">
              {faqs.map((faq, index) => {
                const open = openFaq === index;
                return (
                  <div key={faq.question}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : index)}
                      className="flex w-full items-start justify-between gap-5 px-5 py-5 text-left transition-colors hover:bg-jung-surface-alt"
                      aria-expanded={open}
                    >
                      <span className="font-display text-xl font-semibold text-jung-dark">{faq.question}</span>
                      <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-jung-muted transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && (
                      <div className="px-5 pb-6">
                        <p className="max-w-2xl text-sm leading-7 text-jung-secondary">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-jung-accent py-12 text-white lg:py-16">
          <div className="lab-container flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold">
                <Lock className="h-3.5 w-3.5" />
                Private by default
              </div>
              <h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight md:text-5xl">
                Take the assessment before you decide anything.
              </h2>
              <p className="mt-4 max-w-xl text-white/74">
                You will know quickly whether the function-stack map gives you something more precise
                than another type label.
              </p>
            </div>
            <button
              type="button"
              onClick={() => startAssessment('home_final_cta')}
              className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-jung-accent transition-transform hover:-translate-y-0.5"
            >
              Get my free map
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
};
