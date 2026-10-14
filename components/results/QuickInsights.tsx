import React from 'react';
import { motion } from 'framer-motion';
import { ValidatedAssessmentResults } from '../../lib/validation';
import { FUNCTION_DESCRIPTIONS, THE_GRIP } from '../../data/questions';
import { Compass, AlertTriangle, Sparkles, Zap, ShieldAlert, Footprints } from 'lucide-react';

interface QuickInsightsProps {
  results: ValidatedAssessmentResults;
}

export const QuickInsights: React.FC<QuickInsightsProps> = ({ results }) => {
  const dominantFunc = results.stack.dominant.function;
  const dominantDesc = FUNCTION_DESCRIPTIONS[dominantFunc];
  const auxiliaryDesc = FUNCTION_DESCRIPTIONS[results.stack.auxiliary.function];
  const inferiorDesc = FUNCTION_DESCRIPTIONS[results.stack.inferior.function];
  const grip = THE_GRIP[dominantFunc as keyof typeof THE_GRIP];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="mb-20"
    >
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-jung-accent flex items-center justify-center shadow-lg shadow-jung-accent/20">
          <Compass className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-display text-3xl text-jung-dark dark:text-white">Quick Insights</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-jung-muted">Archetypal Archeology</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <motion.div variants={itemVariants} className="card-premium p-8 bg-jung-accent/5 dark:bg-jung-accent/10 border-jung-accent/20">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-5 h-5 text-jung-accent" />
            <h3 className="text-display text-xl text-jung-dark dark:text-white">The Heroic Flow</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-jung-accent mt-2 flex-shrink-0" />
              <p className="text-sm text-jung-secondary dark:text-white/80 leading-relaxed font-serif italic">
                You lead with <span className="text-jung-accent font-bold">{dominantDesc.title.toLowerCase()}</span>—your natural "Hero" mode.
              </p>
            </li>
            <li className="flex gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-jung-accent mt-2 flex-shrink-0" />
              <p className="text-sm text-jung-secondary dark:text-white/80 leading-relaxed font-serif italic">
                Supported by {auxiliaryDesc.title.toLowerCase()} for cognitive balance.
              </p>
            </li>
          </ul>
        </motion.div>

        <motion.div variants={itemVariants} className="card-premium p-8 bg-jung-surface-alt dark:bg-dark-surface-elevated border-jung-border dark:border-dark-border">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="w-5 h-5 text-jung-muted" />
            <h3 className="text-display text-xl text-jung-dark dark:text-white">Blind Spots</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-jung-muted mt-2 flex-shrink-0" />
              <p className="text-sm text-jung-secondary dark:text-jung-muted leading-relaxed font-serif italic">
                Potential neglect of <span className="text-jung-dark dark:text-white font-bold">{inferiorDesc.title.toLowerCase()}</span> (unconscious gateway).
              </p>
            </li>
            <li className="flex gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-jung-muted mt-2 flex-shrink-0" />
              <p className="text-sm text-jung-secondary dark:text-jung-muted leading-relaxed font-serif italic">
                Risk of psychic one-sidedness due to over-identification with {dominantFunc}.
              </p>
            </li>
          </ul>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div variants={itemVariants} className="card-premium p-8 border-jung-border dark:border-dark-border bg-white dark:bg-dark-surface">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-jung-muted" />
            <h3 className="text-display text-xl text-jung-dark dark:text-white">The Stress Reaction</h3>
          </div>
          <p className="text-sm text-jung-secondary dark:text-jung-muted mb-4 font-serif">
            When overwhelmed, your inferior <span className="text-jung-accent font-bold">{grip.inferiorFunction}</span> can erupt in what Jung called "The Grip":
          </p>
          <div className="p-4 rounded-2xl bg-jung-base dark:bg-dark-base border border-dashed border-jung-border dark:border-dark-border italic text-xs text-jung-secondary">
            "{grip.gripDescription.split('.')[0]}."
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card-premium p-8 bg-jung-dark text-white shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Footprints className="w-5 h-5 text-jung-accent-muted" />
            <h3 className="text-display text-xl">The Individuation Edge</h3>
          </div>
          <p className="text-sm text-jung-subtle leading-relaxed font-serif italic mb-6">
            Jung believed type was just the starting line. Your growth lies in integrating the unconscious potency of your lower scores.
          </p>
          <div className="flex items-center gap-2 text-jung-accent-muted">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Target: {results.stack.inferior.function} Integration</span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
