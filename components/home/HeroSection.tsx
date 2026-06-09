import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { FunctionRadial } from './FunctionRadial';

interface HeroSectionProps {
  onStartAssessment: () => void;
  onLearnMore: () => void;
}

const sample = [
  { name: 'Ni', label: 'Introverted Intuition', value: 82 },
  { name: 'Ne', label: 'Extraverted Intuition', value: 45 },
  { name: 'Si', label: 'Introverted Sensing', value: 38 },
  { name: 'Se', label: 'Extraverted Sensing', value: 51 },
  { name: 'Ti', label: 'Introverted Thinking', value: 76 },
  { name: 'Te', label: 'Extraverted Thinking', value: 63 },
  { name: 'Fi', label: 'Introverted Feeling', value: 55 },
  { name: 'Fe', label: 'Extraverted Feeling', value: 42 },
];

const stats: Array<[string, string]> = [
  ['15–20', 'min'],
  ['42', 'prompts'],
  ['8', 'functions'],
  ['0', 'signup'],
];

const ease = [0.22, 1, 0.36, 1] as const;

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartAssessment, onLearnMore }) => {
  return (
    <section className="relative pt-24 lg:pt-32 pb-20 lg:pb-32 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full blur-3xl bg-jung-accent/10" />

      <div className="lab-container relative">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="h-px w-10 bg-jung-border-light" />
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted">
                A cognitive assessment · No. 01
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease }}
              className="text-display text-[44px] sm:text-6xl md:text-7xl lg:text-[80px] leading-[0.98] tracking-tight text-jung-dark mb-6"
            >
              Understand your{' '}
              <span className="italic text-jung-accent">cognitive&nbsp;functions</span>{' '}
              without the noise.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease }}
              className="text-lg md:text-xl text-jung-secondary leading-relaxed max-w-xl mb-10 font-light"
            >
              TypeJung maps self-reported patterns across all eight Jungian cognitive functions —
              no forced types, no MBTI stereotypes. A clearer self-reflection map for
              how your attention, decisions, and stress patterns show up.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-12"
            >
              <Button onClick={onStartAssessment} className="btn-premium group">
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase">
                  Start free assessment
                </span>
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                  ↗
                </span>
              </Button>
              <Button
                onClick={onLearnMore}
                variant="outline"
                className="border-jung-border text-jung-secondary hover:text-jung-dark hover:border-jung-accent"
              >
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase">
                  Read the method
                </span>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease }}
              className="flex flex-wrap items-center gap-x-8 gap-y-3"
            >
              {stats.map(([n, l]) => (
                <div key={l} className="flex items-baseline gap-2">
                  <span className="text-display text-2xl text-jung-dark leading-none">{n}</span>
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-jung-muted">
                    {l}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

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
              <FunctionRadial data={sample} />
              <div className="mt-4 pt-4 border-t border-jung-border flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-jung-muted">
                  Dominant
                </span>
                <span className="text-display italic text-base text-jung-accent">
                  Ni — Introverted Intuition
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const CornerTicks: React.FC = () => {
  const tick = 'absolute w-3 h-3 border-jung-accent/40';
  return (
    <>
      <span className={`${tick} -top-2 -left-2 border-t border-l`} />
      <span className={`${tick} -top-2 -right-2 border-t border-r`} />
      <span className={`${tick} -bottom-2 -left-2 border-b border-l`} />
      <span className={`${tick} -bottom-2 -right-2 border-b border-r`} />
    </>
  );
};
