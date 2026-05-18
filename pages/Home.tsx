import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Brain, Check, Clock, Compass, HeartPulse, Lock } from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { TypeJungMark } from '../components/brand/TypeJungMark';
import { DiscountCaptureCard } from '../components/discount/DiscountCaptureCard';
import { Button } from '../components/ui/Button';
import { PRICING } from '../data/pricing';
import { AnalyticsEvents } from '../lib/analytics';
import { PAGE_SEO, useSEO } from '../hooks/useSEO';

const sampleEnergy = [
  ['Thinking', 70],
  ['Intuition', 16],
  ['Sensation', 9],
  ['Feeling', 5],
] as const;

const methodLayers = [
  {
    icon: Brain,
    label: 'Behavioral evidence',
    title: 'What you actually do',
    description: 'Scenario questions look for repeated patterns in work, conflict, learning, relationships, solitude, and pressure.',
  },
  {
    icon: HeartPulse,
    label: 'Inferior detection',
    title: 'Where stress takes over',
    description: 'Stress and attraction triggers reveal the function you are least able to control cleanly, so they carry extra weight.',
  },
  {
    icon: Compass,
    label: 'Somatic indicators',
    title: 'What your body signals',
    description: 'Engagement, anxiety, grounding, and threat responses add evidence beyond what your self-image can explain.',
  },
  {
    icon: BarChart3,
    label: 'Attitude',
    title: 'Where energy moves',
    description: 'Introversion and extraversion are measured as subject-object energy direction, not social loudness.',
  },
];

const resultModules = [
  {
    title: 'Your energy map',
    description: 'See how attention and effort distribute across thinking, feeling, sensation, and intuition.',
  },
  {
    title: 'Your developmental edge',
    description: 'Turn the inferior function from a vague weakness into a concrete growth pattern you can notice.',
  },
  {
    title: 'Your stress pattern map',
    description: 'Name the situations most likely to distort attention, body signals, and interpretation.',
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

const pricing = [
  {
    name: 'Free',
    price: PRICING.free.price,
    description: 'Take the full assessment and see whether the map feels accurate before paying.',
    features: ['42-question assessment', 'Basic energy map', 'Dominant-inferior axis', 'No signup required'],
  },
  {
    name: PRICING.insight.name,
    price: PRICING.insight.price,
    description: 'Unlock the deeper report when you want the meaning behind your free map.',
    features: ['Developmental edge report', 'Stress pattern analysis', 'Somatic grounding practices', 'Lifetime result access'],
    highlighted: true,
  },
  {
    name: PRICING.mastery.name,
    price: PRICING.mastery.price,
    description: 'Add the AI Type Coach when you want follow-up guidance and practice support.',
    features: ['Everything in Insight', 'AI Type Coach', 'Individuation roadmap', 'Practice library'],
  },
];

const faqs = [
  {
    question: 'Is this another MBTI test?',
    answer: 'No. TypeJung does not stop at a four-letter label. It maps energy distribution, inferior-function tension, body signals, and an answer consistency signal.',
  },
  {
    question: 'Why only 42 questions?',
    answer: 'It is long enough to catch patterns, but short enough to finish in one sitting. The questions are targeted instead of repeating the same self-report prompt many ways.',
  },
  {
    question: 'Why weight the inferior function?',
    answer: 'People can describe their strengths too cleanly. Stress and trigger patterns show where control gets weaker, so those answers reveal the growth edge more clearly.',
  },
  {
    question: 'Do I need an account?',
    answer: 'No. You can take the free assessment without creating an account. An account is only useful for saved history and paid access.',
  },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();

  useSEO(PAGE_SEO.home);

  const startAssessment = (location: string) => {
    AnalyticsEvents.ctaClicked('start_assessment', location);
    navigate('/assessment');
  };

  return (
    <ErrorBoundary>
      <div className="overflow-hidden">
        <section className="lab-container grid items-center gap-10 py-12 lg:min-h-[calc(100vh-4.75rem)] lg:grid-cols-[0.92fr_1.08fr] lg:py-14">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-jung-border bg-jung-surface px-3 py-2 text-sm font-semibold text-jung-secondary shadow-sm">
              <TypeJungMark size="xs" />
              Depth-based Jungian typology assessment
            </div>

            <h1 className="max-w-[21rem] text-display text-5xl text-jung-dark sm:max-w-none sm:text-7xl lg:text-8xl">
              TypeJung
            </h1>

            <p className="mt-5 max-w-[21rem] break-words text-heading text-2xl leading-tight text-jung-dark sm:mt-6 sm:max-w-xl sm:text-4xl">
              Find the pattern beneath your personality type.
            </p>

            <p className="mt-5 max-w-[21rem] text-body-lg text-jung-secondary sm:max-w-xl">
              Take a free 42-question Jungian assessment that maps where your energy flows, where stress distorts it, and what your next growth edge looks like.
            </p>

            <div className="mt-7 flex max-w-[21rem] flex-col gap-3 sm:max-w-xl sm:flex-row">
              <Button variant="accent" size="lg" onClick={() => startAssessment('home_hero')} rightIcon={<ArrowRight className="h-5 w-5" />}>
                Start free assessment
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  AnalyticsEvents.ctaClicked('learn_method', 'home_hero');
                  navigate('/learn');
                }}
              >
                Learn the method
              </Button>
            </div>

            <div className="mt-7 grid max-w-[21rem] gap-3 sm:max-w-xl sm:grid-cols-3">
              {[
                ['12-16 min', 'one sitting'],
                ['42 questions', 'four evidence layers'],
                ['Pay later', 'see value first'],
              ].map(([value, label]) => (
                <div key={value} className="rounded-lg border border-jung-border bg-jung-surface p-4 shadow-sm">
                  <p className="text-lg font-semibold text-jung-dark">{value}</p>
                  <p className="mt-1 text-sm text-jung-muted">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="card-premium p-3 sm:p-4">
              <div className="rounded-lg border border-jung-border bg-jung-base p-5 sm:p-7">
                <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row">
                  <div>
                    <p className="text-label">Sample result</p>
                    <h2 className="mt-2 text-heading text-3xl text-jung-dark">Energy map</h2>
                    <p className="mt-2 text-sm leading-6 text-jung-secondary">
                      A readable map of the pattern behind your result.
                    </p>
                  </div>
                  <div className="rounded-lg bg-jung-accent-light px-3 py-2 text-sm font-semibold text-jung-accent shadow-sm">
                    87% consistency
                  </div>
                </div>

                <div className="space-y-5">
                  {sampleEnergy.map(([label, value]) => (
                    <div key={label}>
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <span className="font-semibold text-jung-dark">{label}</span>
                        <span className="font-mono text-sm font-semibold text-jung-muted">{value}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-jung-border-light">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full bg-jung-accent"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-jung-border bg-jung-surface p-4">
                    <p className="text-sm font-semibold text-jung-dark">Dominant channel</p>
                    <p className="mt-1 text-sm text-jung-secondary">Introverted thinking builds the internal frame.</p>
                  </div>
                  <div className="rounded-lg border border-jung-border bg-jung-surface p-4">
                    <p className="text-sm font-semibold text-jung-dark">Inferior channel</p>
                    <p className="mt-1 text-sm text-jung-secondary">Feeling is where value, shame, and growth gather.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="section-rule py-5">
          <div className="lab-container flex flex-col gap-3 text-sm text-jung-secondary sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-jung-accent" />
              Scenario-based, not forced binary choice
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-jung-accent" />
              Inferior function weighted more heavily
            </span>
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4 text-jung-accent" />
              Private by default
            </span>
          </div>
        </section>

        <section className="lab-container py-20">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1fr] lg:items-start">
            <div>
              <p className="text-label">What this is not</p>
              <h2 className="mt-3 text-heading text-4xl text-jung-dark sm:text-5xl">
                Not another four-letter label.
              </h2>
              <p className="mt-5 text-body text-jung-secondary">
                Most personality tests ask you to label yourself. TypeJung looks for repeatable evidence: what you notice first, how you decide, what takes over under stress, and where your body registers engagement or threat.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {resultModules.map((module) => (
                <div key={module.title} className="card-premium p-6">
                  <h3 className="text-xl font-semibold text-jung-dark">{module.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-jung-secondary">{module.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-rule bg-jung-surface/70 py-20">
          <div className="lab-container">
            <div className="mb-10 max-w-3xl">
              <p className="text-label">Popular guides</p>
              <h2 className="mt-3 text-heading text-4xl text-jung-dark sm:text-5xl">
                Compare the test before you take it.
              </h2>
              <p className="mt-4 text-body text-jung-secondary">
                These crawlable guides answer the searches people usually make before choosing a Jungian or cognitive-function test. They also help Google understand TypeJung as a connected topic cluster, not a single isolated quiz page.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {seoGuideLinks.map((guide) => (
                <a
                  key={guide.href}
                  href={guide.href}
                  className="card-premium group block p-6 no-underline"
                >
                  <span className="text-sm font-semibold text-jung-accent">{guide.label}</span>
                  <p className="mt-3 text-sm leading-6 text-jung-secondary">{guide.description}</p>
                  <span className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-jung-dark transition-colors group-hover:text-jung-accent">
                    Read guide <ArrowRight className="h-4 w-4" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="method" className="bg-jung-surface py-20">
          <div className="lab-container">
            <div className="mb-10 max-w-2xl">
              <p className="text-label">Assessment architecture</p>
              <h2 className="mt-3 text-heading text-4xl text-jung-dark sm:text-5xl">
                Four evidence layers. One practical result.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {methodLayers.map((layer) => (
                <div key={layer.title} className="rounded-lg border border-jung-border bg-jung-surface-elevated p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-jung-accent-light text-jung-accent">
                      <layer.icon className="h-5 w-5" />
                    </span>
                    <span className="text-label">{layer.label}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-jung-dark">{layer.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-jung-secondary">{layer.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lab-container py-20">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-label">Pricing</p>
              <h2 className="mt-3 text-heading text-4xl text-jung-dark">Start free. Upgrade only after the result earns it.</h2>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                AnalyticsEvents.ctaClicked('view_pricing', 'home_pricing_section');
                navigate('/pricing');
              }}
            >
              View details
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {pricing.map((tier) => (
              <div key={tier.name} className={`card-premium p-6 ${tier.highlighted ? 'border-jung-accent-muted bg-jung-accent-light/60' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-jung-muted">{tier.name}</p>
                    <p className="mt-2 text-4xl font-semibold text-jung-dark">{tier.price}</p>
                  </div>
                  {tier.highlighted && (
                    <span className="rounded-lg bg-jung-accent px-3 py-1.5 text-xs font-semibold text-white">
                      Standard
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm leading-6 text-jung-secondary">{tier.description}</p>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm text-jung-secondary">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-jung-accent" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <DiscountCaptureCard source="home_pricing_section" compact className="mx-auto mt-6 max-w-3xl" />
        </section>

        <section className="bg-jung-surface py-20">
          <div className="lab-container grid gap-12 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <p className="text-label">Questions</p>
              <h2 className="mt-3 text-heading text-4xl text-jung-dark">Straight answers before you start.</h2>
            </div>
            <div className="grid gap-3">
              {faqs.map((item) => (
                <details key={item.question} className="group rounded-lg border border-jung-border bg-jung-surface-elevated p-5">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center text-base font-semibold text-jung-dark">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-jung-secondary">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="lab-container py-20">
          <div className="rounded-lg border border-jung-border bg-jung-dark p-8 text-white shadow-xl sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold text-white/60">Ready when you are</p>
                <h2 className="mt-3 text-heading text-4xl text-white">Take the assessment before you pay for anything.</h2>
                <p className="mt-4 max-w-2xl text-white/70">
                  Your free result shows the core map first. Paid upgrades only add deeper interpretation, practice guidance, and coaching tools.
                </p>
              </div>
              <Button variant="inverted" size="lg" onClick={() => startAssessment('home_final_cta')} rightIcon={<ArrowRight className="h-5 w-5" />}>
                Start free
              </Button>
            </div>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
};
