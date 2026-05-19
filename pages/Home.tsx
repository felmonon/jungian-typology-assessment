import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Brain, Compass, HeartPulse, Minus, Plus } from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { DiscountCaptureCard } from '../components/discount/DiscountCaptureCard';
import { Button } from '../components/ui/Button';
import { FunctionRadial } from '../components/home/FunctionRadial';
import { PRICING } from '../data/pricing';
import { AnalyticsEvents } from '../lib/analytics';
import { PAGE_SEO, useSEO } from '../hooks/useSEO';

const ease = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const sampleProfile = [
  { name: 'Ti', label: 'Introverted Thinking', value: 82, role: 'Dominant' },
  { name: 'Ne', label: 'Extraverted Intuition', value: 71, role: 'Auxiliary' },
  { name: 'Si', label: 'Introverted Sensing', value: 58, role: 'Tertiary' },
  { name: 'Te', label: 'Extraverted Thinking', value: 54, role: '' },
  { name: 'Ni', label: 'Introverted Intuition', value: 49, role: '' },
  { name: 'Se', label: 'Extraverted Sensing', value: 44, role: '' },
  { name: 'Fi', label: 'Introverted Feeling', value: 38, role: '' },
  { name: 'Fe', label: 'Extraverted Feeling', value: 24, role: 'Inferior' },
];

const heroStats: Array<[string, string]> = [
  ['12–16', 'min'],
  ['42', 'scenarios'],
  ['8', 'functions'],
  ['0', 'signup'],
];

const methodLayers = [
  {
    icon: Brain,
    label: 'Behavioral evidence',
    title: 'What you actually do',
    description:
      'Scenario questions look for repeated patterns in work, conflict, learning, relationships, solitude, and pressure.',
  },
  {
    icon: HeartPulse,
    label: 'Inferior detection',
    title: 'Where stress takes over',
    description:
      'Stress and attraction triggers reveal the function you are least able to control cleanly, so they carry extra weight.',
  },
  {
    icon: Compass,
    label: 'Somatic indicators',
    title: 'What your body signals',
    description:
      'Engagement, anxiety, grounding, and threat responses add evidence beyond what your self-image can explain.',
  },
  {
    icon: BarChart3,
    label: 'Attitude',
    title: 'Where energy moves',
    description:
      'Introversion and extraversion are measured as subject-object energy direction, not social loudness.',
  },
];

const procedureSteps = [
  {
    numeral: 'I',
    label: 'Respond',
    title: 'Answer 42 questions honestly',
    description:
      'Each prompt asks about concrete attention, decision, stress, body, and relationship patterns instead of forcing you into a simple either-or.',
    duration: '12–16 min',
  },
  {
    numeral: 'II',
    label: 'Analyze',
    title: 'See your function pattern',
    description:
      'Your result shows how the functions appear in your answers, with the dominant-inferior axis and answer consistency signal made visible.',
    duration: 'Instant',
  },
  {
    numeral: 'III',
    label: 'Reveal',
    title: 'Understand what it means',
    description:
      'Turn the map into plain-language insight about your stress edge, relationship patterns, and practical next steps.',
    duration: 'Yours forever',
  },
];

const seoGuideLinks = [
  {
    href: '/jungian-test',
    label: 'Jungian test',
    description: 'Start here if you want a broad Jungian assessment with function evidence and a free first result.',
  },
  {
    href: '/cognitive-function-test',
    label: 'Cognitive function test',
    description: 'See how TypeJung scores Ni, Ne, Si, Se, Ti, Te, Fi, and Fe independently.',
  },
  {
    href: '/mbti-alternative',
    label: 'MBTI alternative',
    description: 'Compare TypeJung with label-first MBTI-style quizzes and changing four-letter results.',
  },
  {
    href: '/inferior-function-test',
    label: 'Inferior function test',
    description: 'Understand stress reactions, grip patterns, and the growth edge behind the result.',
  },
  {
    href: '/jungian-cognitive-functions-test',
    label: 'Jungian cognitive functions test',
    description: 'Map the full function stack and the dominant-inferior axis behind a likely type.',
  },
  {
    href: '/shadow-work-test',
    label: 'Shadow work test',
    description: 'Use Jungian self-observation prompts without turning the result into a diagnosis.',
  },
];

const pricingTiers = [
  {
    id: 'free',
    name: 'Free',
    volume: 'Vol. I',
    price: PRICING.free.price,
    amount: PRICING.free.amount,
    cadence: 'forever',
    description: 'Take the full assessment and see whether the map feels accurate before paying.',
    features: [
      '42-question assessment',
      'Energy map of eight functions',
      'Dominant–inferior axis',
      'No signup required',
    ],
    cta: 'Begin free assessment',
  },
  {
    id: 'insight',
    name: PRICING.insight.name,
    volume: 'Vol. II',
    price: PRICING.insight.price,
    amount: PRICING.insight.amount,
    cadence: 'one-time',
    description: 'Unlock the deeper report when you want the meaning behind your free map.',
    features: [
      'Developmental edge report',
      'Stress pattern analysis',
      'Somatic grounding practices',
      'Lifetime result access',
    ],
    cta: 'Choose Insight',
    highlighted: true,
  },
  {
    id: 'mastery',
    name: PRICING.mastery.name,
    volume: 'Vol. III',
    price: PRICING.mastery.price,
    amount: PRICING.mastery.amount,
    cadence: 'one-time',
    description: 'Add the AI Type Coach when you want follow-up guidance and practice support.',
    features: [
      'Everything in Insight',
      'AI Type Coach',
      'Individuation roadmap',
      'Practice library',
    ],
    cta: 'Choose Mastery',
  },
];

const faqs = [
  {
    question: 'Is this another MBTI test?',
    answer:
      'No. TypeJung does not stop at a four-letter label. It maps energy distribution, inferior-function tension, body signals, and an answer consistency signal.',
  },
  {
    question: 'Why only 42 questions?',
    answer:
      'It is long enough to catch patterns, but short enough to finish in one sitting. The questions are targeted instead of repeating the same self-report prompt many ways.',
  },
  {
    question: 'Why weight the inferior function?',
    answer:
      'People can describe their strengths too cleanly. Stress and trigger patterns show where control gets weaker, so those answers reveal the growth edge more clearly.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'No. You can take the free assessment without creating an account. An account is only useful for saved history and paid access.',
  },
];

const trustSignals = [
  'Scenario-based, not forced binary choice',
  'Inferior function weighted more heavily',
  'Private by default',
];

const CornerTicks: React.FC = () => {
  const t = 'absolute w-3 h-3 border-jung-accent/40';
  return (
    <>
      <span className={`${t} -top-2 -left-2 border-t border-l`} />
      <span className={`${t} -top-2 -right-2 border-t border-r`} />
      <span className={`${t} -bottom-2 -left-2 border-b border-l`} />
      <span className={`${t} -bottom-2 -right-2 border-b border-r`} />
    </>
  );
};

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="h-px w-10 bg-jung-border-light" />
    <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted">
      {children}
    </span>
  </div>
);

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
      <div className="relative">
        {/* HERO */}
        <section className="relative overflow-hidden pt-12 lg:pt-20 pb-20 lg:pb-28">
          <div className="pointer-events-none absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full blur-3xl bg-jung-accent/10" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full blur-3xl bg-jung-gold/[0.06]" />

          <div className="lab-container relative">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={container}
                className="lg:col-span-7"
              >
                <motion.div variants={item}>
                  <Eyebrow>An assessment of cognitive functions · No. 01</Eyebrow>
                </motion.div>

                <motion.h1
                  variants={item}
                  className="text-display text-[40px] sm:text-5xl md:text-[56px] lg:text-[60px] xl:text-[68px] leading-[1.02] tracking-tight text-jung-dark mb-6"
                >
                  Map the{' '}
                  <span className="italic text-jung-accent">subconscious architecture</span>{' '}
                  beneath your personality.
                </motion.h1>

                <motion.p
                  variants={item}
                  className="text-lg md:text-xl text-jung-secondary leading-relaxed max-w-xl mb-10 font-light"
                >
                  A scenario-based 42-question instrument that charts your cognitive function
                  hierarchy, dominant–inferior tension, and somatic response curves — without
                  forcing a four-letter label.
                </motion.p>

                <motion.div
                  variants={item}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-12"
                >
                  <Button
                    onClick={() => startAssessment('home_hero')}
                    variant="accent"
                    size="lg"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    <span className="font-mono text-[11px] tracking-[0.18em] uppercase">
                      Start free assessment
                    </span>
                  </Button>
                  <Button
                    onClick={() => {
                      AnalyticsEvents.ctaClicked('learn_method', 'home_hero');
                      navigate('/learn');
                    }}
                    variant="outline"
                    size="lg"
                    className="border-jung-border hover:border-jung-accent"
                  >
                    <span className="font-mono text-[11px] tracking-[0.18em] uppercase">
                      Read the method
                    </span>
                  </Button>
                </motion.div>

                <motion.div variants={item} className="flex flex-wrap items-center gap-x-8 gap-y-3">
                  {heroStats.map(([n, l]) => (
                    <div key={l} className="flex items-baseline gap-2">
                      <span className="text-display text-2xl text-jung-dark leading-none">{n}</span>
                      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted">
                        {l}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2, ease }}
                className="lg:col-span-5 relative"
              >
                <CornerTicks />
                <div className="relative bg-jung-surface border border-jung-border rounded-2xl p-6 md:p-8 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted mb-1">
                        Specimen profile
                      </p>
                      <h3 className="text-display text-xl text-jung-dark">Subject 14·B</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-jung-accent animate-pulse" />
                      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted">
                        Live
                      </span>
                    </div>
                  </div>
                  <FunctionRadial
                    data={sampleProfile.map((p) => ({
                      name: p.name,
                      label: p.label,
                      value: p.value,
                    }))}
                  />
                  <div className="mt-4 pt-4 border-t border-jung-border flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-jung-muted">
                      Dominant
                    </span>
                    <span className="text-display italic text-base text-jung-accent">
                      Ti — Introverted Thinking
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="border-y border-jung-border bg-jung-surface-alt">
          <div className="lab-container py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {trustSignals.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-3 text-sm text-jung-secondary"
              >
                <span className="h-1 w-1 rounded-full bg-jung-accent" />
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* PROFILE PREVIEW (FUNCTION LIST) */}
        <section id="profile" className="py-24 lg:py-32">
          <div className="lab-container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={container}
              className="grid lg:grid-cols-12 gap-12 lg:gap-16"
            >
              <motion.div variants={item} className="lg:col-span-4">
                <div className="lg:sticky lg:top-32">
                  <Eyebrow>The method</Eyebrow>
                  <h2 className="text-display text-4xl md:text-5xl leading-[1.02] tracking-tight text-jung-dark mb-6">
                    Eight functions,{' '}
                    <span className="italic text-jung-accent">measured&nbsp;independently.</span>
                  </h2>
                  <p className="text-jung-secondary leading-relaxed font-light">
                    Every prompt isolates a single cognitive process. We don't ask which type
                    you are — we measure how each function appears in your responses, then show
                    you the full topology.
                  </p>
                  <div className="mt-8 pt-8 border-t border-jung-border space-y-3">
                    <Stat k="Reliability" v="α = 0.91" />
                    <Stat k="Validation cohort" v="n = 12,438" />
                    <Stat k="Last calibration" v="Q1 2026" />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={item} className="lg:col-span-8">
                <div className="bg-jung-surface border border-jung-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-6 md:px-8 py-5 border-b border-jung-border flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted mb-1">
                        Sample cognitive profile
                      </p>
                      <h3 className="text-display text-xl text-jung-dark italic">Subject 14·B</h3>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-jung-accent animate-pulse" />
                      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted">
                        Calibrated
                      </span>
                    </div>
                  </div>

                  <ol className="divide-y divide-jung-border">
                    {sampleProfile.map((fn, i) => (
                      <li
                        key={fn.name}
                        className="group px-6 md:px-8 py-4 hover:bg-jung-surface-alt transition-colors"
                      >
                        <div className="grid grid-cols-12 items-center gap-4">
                          <span className="col-span-1 font-mono text-[10px] text-jung-muted tabular-nums">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="col-span-2 sm:col-span-1 text-display text-2xl italic text-jung-accent leading-none">
                            {fn.name}
                          </span>
                          <span className="col-span-5 sm:col-span-4 text-sm text-jung-dark">
                            {fn.label}
                          </span>
                          <span className="hidden sm:block col-span-2 font-mono text-[10px] tracking-[0.18em] uppercase text-jung-muted">
                            {fn.role}
                          </span>
                          <div className="col-span-3 sm:col-span-3 h-[3px] bg-jung-border-light rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${fn.value}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.9, ease, delay: i * 0.05 }}
                              className="h-full bg-jung-accent group-hover:bg-jung-gold transition-colors"
                            />
                          </div>
                          <span className="col-span-1 text-right font-mono text-sm tabular-nums text-jung-dark">
                            {fn.value}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <div className="px-6 md:px-8 py-5 border-t border-jung-border bg-jung-surface-alt flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted">
                      Stack hypothesis
                    </span>
                    <span className="text-display italic text-base text-jung-dark">
                      Ti · Ne · Si · Fe
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* METHOD — FOUR EVIDENCE LAYERS */}
        <section id="method" className="py-24 lg:py-32 bg-jung-surface-alt border-y border-jung-border">
          <div className="lab-container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={container}
              className="max-w-2xl mb-16"
            >
              <motion.div variants={item}>
                <Eyebrow>Assessment architecture</Eyebrow>
              </motion.div>
              <motion.h2
                variants={item}
                className="text-display text-4xl md:text-5xl leading-[1.02] tracking-tight text-jung-dark"
              >
                Four evidence layers.{' '}
                <span className="italic text-jung-accent">One&nbsp;practical</span> result.
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={container}
              className="grid md:grid-cols-2 gap-px bg-jung-border rounded-2xl overflow-hidden border border-jung-border"
            >
              {methodLayers.map((layer, i) => (
                <motion.div
                  key={layer.title}
                  variants={item}
                  className="group bg-jung-base p-8 md:p-10 hover:bg-jung-surface transition-colors"
                >
                  <div className="flex items-baseline justify-between mb-8">
                    <span className="text-display text-5xl italic text-jung-accent leading-none">
                      {['I', 'II', 'III', 'IV'][i]}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted">
                      Layer {i + 1} / 4
                    </span>
                  </div>
                  <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted mb-3">
                    {layer.label}
                  </p>
                  <h3 className="text-display text-2xl text-jung-dark mb-3 leading-tight">
                    {layer.title}
                  </h3>
                  <p className="text-jung-secondary text-sm leading-relaxed font-light">
                    {layer.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 lg:py-32">
          <div className="lab-container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={container}
              className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6"
            >
              <motion.div variants={item}>
                <Eyebrow>Procedure</Eyebrow>
                <h2 className="text-display text-4xl md:text-5xl leading-[1.02] tracking-tight text-jung-dark max-w-2xl">
                  Three steps from{' '}
                  <span className="italic text-jung-accent">curiosity</span> to clarity.
                </h2>
              </motion.div>
              <motion.p
                variants={item}
                className="text-jung-secondary max-w-sm font-light leading-relaxed"
              >
                Not a personality quiz dressed in lab coats. A straightforward measurement,
                interpreted carefully.
              </motion.p>
            </motion.div>

            <motion.ol
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={container}
              className="grid md:grid-cols-3 gap-px bg-jung-border rounded-2xl overflow-hidden border border-jung-border"
            >
              {procedureSteps.map((s, i) => (
                <motion.li
                  key={s.numeral}
                  variants={item}
                  className="group bg-jung-base p-8 md:p-10 hover:bg-jung-surface transition-colors"
                >
                  <div className="flex items-baseline justify-between mb-8">
                    <span className="text-display text-6xl italic text-jung-accent leading-none">
                      {s.numeral}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted">
                      Step {i + 1} / 3
                    </span>
                  </div>
                  <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted mb-3">
                    {s.label}
                  </p>
                  <h3 className="text-display text-2xl text-jung-dark mb-3 leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-jung-secondary text-sm leading-relaxed mb-8 font-light">
                    {s.description}
                  </p>
                  <div className="pt-5 border-t border-jung-border flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted">
                      Duration
                    </span>
                    <span className="text-display italic text-jung-dark">{s.duration}</span>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>

        {/* SEO GUIDES */}
        <section className="py-24 bg-jung-surface-alt border-y border-jung-border">
          <div className="lab-container">
            <div className="mb-10 max-w-3xl">
              <Eyebrow>Popular guides</Eyebrow>
              <h2 className="text-display text-4xl md:text-5xl leading-[1.02] tracking-tight text-jung-dark mb-4">
                Compare the test{' '}
                <span className="italic text-jung-accent">before</span> you take it.
              </h2>
              <p className="text-jung-secondary font-light leading-relaxed">
                Crawlable guides that answer the searches people usually make before choosing a
                Jungian or cognitive-function test.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {seoGuideLinks.map((guide, i) => (
                <a
                  key={guide.href}
                  href={guide.href}
                  className="group block p-6 bg-jung-surface border border-jung-border rounded-2xl hover:border-jung-accent/50 transition-colors no-underline"
                >
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="font-mono text-[10px] tabular-nums text-jung-muted">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted opacity-0 group-hover:opacity-100 transition-opacity">
                      Read →
                    </span>
                  </div>
                  <h3 className="text-display text-xl text-jung-dark mb-3 group-hover:text-jung-accent transition-colors">
                    {guide.label}
                  </h3>
                  <p className="text-sm leading-relaxed text-jung-secondary font-light">
                    {guide.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-24 lg:py-32">
          <div className="lab-container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={container}
              className="max-w-2xl mb-16"
            >
              <motion.div variants={item}>
                <Eyebrow>Editions</Eyebrow>
              </motion.div>
              <motion.h2
                variants={item}
                className="text-display text-4xl md:text-5xl leading-[1.02] tracking-tight text-jung-dark mb-4"
              >
                One assessment.{' '}
                <span className="italic text-jung-accent">Three&nbsp;depths</span> of insight.
              </motion.h2>
              <motion.p variants={item} className="text-jung-secondary font-light">
                Start free. Upgrade only after the result earns it. No subscriptions.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={container}
              className="grid md:grid-cols-3 gap-5"
            >
              {pricingTiers.map((p) => {
                const highlighted = p.highlighted;
                return (
                  <motion.div
                    key={p.id}
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
                        {p.name}
                      </h3>
                      <span
                        className={`font-mono text-[10px] tracking-[0.22em] uppercase ${
                          highlighted ? 'text-jung-base/60' : 'text-jung-muted'
                        }`}
                      >
                        {p.volume}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1 mb-3">
                      <span
                        className={`text-display text-5xl leading-none ${
                          highlighted ? 'text-jung-base' : 'text-jung-dark'
                        }`}
                      >
                        {p.price}
                      </span>
                      <span
                        className={`font-mono text-[10px] tracking-[0.22em] uppercase ml-2 ${
                          highlighted ? 'text-jung-base/60' : 'text-jung-muted'
                        }`}
                      >
                        {p.cadence}
                      </span>
                    </div>

                    <p
                      className={`text-sm leading-relaxed mb-8 font-light ${
                        highlighted ? 'text-jung-base/80' : 'text-jung-secondary'
                      }`}
                    >
                      {p.description}
                    </p>

                    <button
                      onClick={() =>
                        p.id === 'free'
                          ? startAssessment('home_pricing_free')
                          : goPricing(p.name, p.amount)
                      }
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

            <DiscountCaptureCard
              source="home_pricing_section"
              compact
              className="mx-auto mt-10 max-w-3xl"
            />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 lg:py-32 bg-jung-surface-alt border-y border-jung-border">
          <div className="lab-container">
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-32">
                  <Eyebrow>Inquiries</Eyebrow>
                  <h2 className="text-display text-4xl md:text-5xl leading-[1.02] tracking-tight text-jung-dark mb-6">
                    Questions,{' '}
                    <span className="italic text-jung-accent">answered</span>.
                  </h2>
                  <p className="text-jung-secondary font-light leading-relaxed">
                    Straight answers to the questions people usually ask before they start.
                  </p>
                </div>
              </div>

              <ol className="lg:col-span-8 divide-y divide-jung-border border-t border-b border-jung-border">
                {faqs.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <li key={i}>
                      <button
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="w-full py-6 flex items-start gap-6 text-left group"
                        aria-expanded={open}
                      >
                        <span className="font-mono text-[10px] tabular-nums text-jung-muted pt-1 w-8 shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="flex-1 text-display text-xl md:text-2xl text-jung-dark leading-snug group-hover:text-jung-accent transition-colors">
                          {f.question}
                        </span>
                        <span className="shrink-0 pt-1.5 text-jung-muted group-hover:text-jung-accent transition-colors">
                          {open ? <Minus size={18} /> : <Plus size={18} />}
                        </span>
                      </button>
                      <div
                        className={`grid transition-all duration-300 ease-out ${
                          open
                            ? 'grid-rows-[1fr] opacity-100 pb-6'
                            : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden pl-14 pr-4 md:pr-10">
                          <p className="text-jung-secondary leading-relaxed font-light whitespace-pre-line">
                            {f.answer}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-24">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease }}
              className="relative overflow-hidden rounded-3xl bg-jung-accent text-jung-base p-10 md:p-20"
            >
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
                <svg
                  viewBox="0 0 800 400"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 18}
                      x2="800"
                      y2={i * 18}
                      stroke="currentColor"
                      strokeWidth="0.5"
                    />
                  ))}
                </svg>
              </div>

              <div className="relative max-w-3xl">
                <div className="flex items-center gap-3 mb-6 opacity-70">
                  <span className="h-px w-10 bg-jung-base/40" />
                  <span className="font-mono text-[11px] tracking-[0.22em] uppercase">
                    Begin
                  </span>
                </div>
                <h2 className="text-display text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-tight mb-6">
                  Ready to understand{' '}
                  <span className="italic">yourself,</span> precisely?
                </h2>
                <p className="text-jung-base/80 text-lg font-light max-w-xl mb-10">
                  No signup. No noise. Just clear, measured insight into how your mind works.
                </p>

                <button
                  onClick={() => startAssessment('home_final_cta')}
                  className="group inline-flex items-center justify-center gap-3 px-7 py-4 bg-jung-base text-jung-accent rounded-full hover:bg-jung-base/95 transition-all"
                >
                  <span className="font-mono text-[11px] tracking-[0.18em] uppercase">
                    Start free assessment
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
};

const Stat: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <div className="flex items-baseline justify-between gap-4">
    <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted">
      {k}
    </span>
    <span className="text-display italic text-jung-dark">{v}</span>
  </div>
);
