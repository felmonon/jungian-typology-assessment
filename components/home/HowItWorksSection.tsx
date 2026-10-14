import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Button } from '../ui/Button';
import { HOW_IT_WORKS_STEPS, AnalyticsEvents } from './data';

interface HowItWorksSectionProps {
  onStartAssessment: () => void;
}

const numerals = ['I', 'II', 'III', 'IV', 'V'];
const ease = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onStartAssessment }) => {
  const handleStart = () => {
    AnalyticsEvents.ctaClicked('start_assessment', 'how_it_works');
    onStartAssessment();
  };

  return (
    <section id="method" className="relative py-24 lg:py-32 bg-jung-surface-alt border-y border-jung-border">
      <div className="lab-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={container}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6"
        >
          <motion.div variants={item}>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-10 bg-jung-border-light" />
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted">
                Procedure
              </span>
            </div>
            <h2 className="text-display text-4xl md:text-5xl leading-[1.02] tracking-tight text-jung-dark max-w-2xl">
              Three steps from <span className="italic text-jung-accent">curiosity</span> to clarity.
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
          {HOW_IT_WORKS_STEPS.map((s, i) => (
            <motion.li
              key={s.step}
              variants={item}
              className="group bg-jung-base p-8 md:p-10 hover:bg-jung-surface transition-colors"
            >
              <div className="flex items-baseline justify-between mb-8">
                <span className="text-display text-6xl italic text-jung-accent leading-none">
                  {numerals[i]}
                </span>
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted">
                  Step {i + 1} / {HOW_IT_WORKS_STEPS.length}
                </span>
              </div>
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted mb-3">
                {s.step}
              </p>
              <h3 className="text-display text-2xl text-jung-dark mb-3 leading-tight">
                {s.title}
              </h3>
              <p className="text-jung-secondary text-sm leading-relaxed font-light">
                {s.description}
              </p>
            </motion.li>
          ))}
        </motion.ol>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={item}
          className="mt-12 flex justify-center"
        >
          <Button onClick={handleStart} className="btn-premium">
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase">
              Begin assessment
            </span>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
