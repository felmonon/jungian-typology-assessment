import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Brain, Check, Clock, Compass, HeartPulse, Lock, Sparkles } from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Button } from '../components/ui/Button';
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
    description: 'Scenario questions track first-noticed patterns across work, relationships, conflict, learning, leisure, and solitude.',
  },
  {
    icon: HeartPulse,
    label: 'Inferior detection',
    title: 'Where you get captured',
    description: 'Stress and attraction triggers carry extra weight because the inferior function is harder for the ego to perform or fake.',
  },
  {
    icon: Compass,
    label: 'Somatic indicators',
    title: 'Where energy lives in the body',
    description: 'Body signals around engagement, anxiety, grounding, and threat add evidence beyond self-image.',
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
    description: 'A distribution across thinking, feeling, sensation, and intuition with the dominant-inferior axis highlighted.',
  },
  {
    title: 'Your developmental edge',
    description: 'The inferior function is translated into the concrete growth task your psyche keeps circling.',
  },
  {
    title: 'Your complex vulnerability map',
    description: 'The result names the situations where complexes are most likely to capture attention, body, and interpretation.',
  },
];

const pricing = [
  {
    name: 'Free',
    price: '$0',
    description: 'Complete the assessment and receive the basic energy map.',
    features: ['42-question assessment', 'Function hierarchy', 'Reliability score', 'No signup required'],
  },
  {
    name: 'Detailed report',
    price: '$12',
    description: 'Unlock deeper developmental analysis and practice guidance.',
    features: ['Developmental edge report', 'Complex vulnerability map', 'Somatic grounding practices', 'Downloadable report'],
    highlighted: true,
  },
  {
    name: 'Tracking',
    price: '$29',
    description: 'Reassess over time and watch the distribution shift.',
    features: ['Saved history', 'Development curves', 'Comparison across results', 'Ongoing practice library'],
  },
];

const faqs = [
  {
    question: 'Is this another MBTI test?',
    answer: 'No. TypeJung does not stop at a four-letter label. It maps energy distribution, inferior-function tension, somatic signals, and reliability.',
  },
  {
    question: 'Why only 42 questions?',
    answer: 'The assessment is longer than entertainment quizzes but shorter than a test people abandon. It uses targeted layers instead of many repeated self-report prompts.',
  },
  {
    question: 'Why weight the inferior function?',
    answer: 'The dominant function can describe itself too cleanly. Stress and trigger patterns reveal where the ego has less control, so those answers carry more diagnostic value.',
  },
  {
    question: 'Do I need an account?',
    answer: 'No. The free result is local and private. An account is only useful when you want saved history or paid reports.',
  },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();

  useSEO(PAGE_SEO.home);

  const startAssessment = () => navigate('/assessment');

  return (
    <ErrorBoundary>
      <div className="overflow-hidden">
        <section className="lab-container grid items-center gap-12 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-jung-border bg-jung-surface px-3 py-2 text-sm font-medium text-jung-secondary">
              <Sparkles className="h-4 w-4 text-jung-accent" />
              Depth-based Jungian typology assessment
            </div>

            <h1 className="text-display text-6xl text-jung-dark sm:text-7xl lg:text-8xl">
              TypeJung
            </h1>

            <p className="mt-6 max-w-xl text-heading text-3xl leading-tight text-jung-dark sm:text-4xl">
              Not what type you are. Where your energy flows and where it gets stuck.
            </p>

            <p className="mt-6 max-w-xl text-body-lg text-jung-secondary">
              A 42-question assessment that uses behavioral scenarios, inferior-function triggers, somatic indicators, and Jungian attitude to build an energy map instead of a personality label.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="accent" size="lg" onClick={startAssessment} rightIcon={<ArrowRight className="h-5 w-5" />}>
                Start free assessment
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/learn')}>
                Learn the method
              </Button>
            </div>

            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {[
                ['12-16 min', 'one sitting'],
                ['42 questions', 'four evidence layers'],
                ['No signup', 'free energy map'],
              ].map(([value, label]) => (
                <div key={value} className="rounded-lg border border-jung-border bg-jung-surface/75 p-4">
                  <p className="text-lg font-semibold text-jung-dark">{value}</p>
                  <p className="mt-1 text-sm text-jung-muted">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="card-premium p-4 sm:p-5">
              <div className="rounded-lg border border-jung-border bg-jung-base p-5 sm:p-7">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-label">Sample result</p>
                    <h2 className="mt-2 text-heading text-3xl text-jung-dark">Energy map</h2>
                    <p className="mt-2 text-sm leading-6 text-jung-secondary">
                      Distribution across the four Jungian channels.
                    </p>
                  </div>
                  <div className="rounded-lg bg-jung-accent-light px-3 py-2 text-sm font-semibold text-jung-accent">
                    87% reliable
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

        <section className="border-y border-jung-border bg-jung-surface/70 py-5">
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
                Most tests ask the ego to report on itself. TypeJung asks what you notice first, what you do under low pressure, what captures you under stress, and where the body registers engagement or threat.
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

        <section id="method" className="bg-jung-surface py-20">
          <div className="lab-container">
            <div className="mb-10 max-w-2xl">
              <p className="text-label">Assessment architecture</p>
              <h2 className="mt-3 text-heading text-4xl text-jung-dark sm:text-5xl">
                Four evidence layers, one energy map.
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
              <h2 className="mt-3 text-heading text-4xl text-jung-dark">Start free. Go deeper when it is useful.</h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/pricing')}>
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
                      Planned
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
                  <summary className="cursor-pointer list-none text-base font-semibold text-jung-dark">
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
                <h2 className="mt-3 text-heading text-4xl text-white">Take the depth assessment in one quiet sitting.</h2>
                <p className="mt-4 max-w-2xl text-white/70">
                  The free result shows your function hierarchy, inferior-function edge, somatic signal, and reliability score.
                </p>
              </div>
              <Button variant="inverted" size="lg" onClick={startAssessment} rightIcon={<ArrowRight className="h-5 w-5" />}>
                Start free
              </Button>
            </div>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
};
