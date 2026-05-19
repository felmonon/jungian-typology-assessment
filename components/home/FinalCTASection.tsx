import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Button } from '../ui/Button';
import { AnalyticsEvents } from './data';

interface FinalCTASectionProps {
  onStartAssessment: () => void;
}

const ease = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({ onStartAssessment }) => {
  const handleStart = () => {
    AnalyticsEvents.ctaClicked('start_assessment', 'final_cta');
    onStartAssessment();
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-24">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={container}
          className="relative overflow-hidden rounded-3xl bg-jung-accent text-jung-base p-10 md:p-20"
        >
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
            <svg viewBox="0 0 800 400" className="w-full h-full" preserveAspectRatio="none">
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

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handleStart}
                className="group inline-flex items-center justify-center gap-3 px-7 py-4 bg-jung-base text-jung-accent rounded-full hover:bg-jung-base/95 transition-all"
              >
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase">
                  Start free assessment
                </span>
                <span className="text-display italic text-lg leading-none translate-y-[-1px] transition-transform group-hover:translate-x-1">
                  ↗
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
