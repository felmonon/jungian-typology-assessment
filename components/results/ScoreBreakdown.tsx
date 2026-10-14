import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ValidatedAssessmentResults } from '../../lib/validation';
import { FUNCTION_DESCRIPTIONS } from '../../data/questions';

interface ScoreBreakdownProps {
  results: ValidatedAssessmentResults;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ results }) => {
  const sortedScores = useMemo(() =>
    [...results.scores].sort((a, b) => b.score - a.score),
    [results.scores]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <section className="mb-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 pb-6 border-b border-jung-border dark:border-dark-border">
        <div>
          <h2 className="text-display text-3xl text-jung-dark dark:text-white">Full Functional Scan</h2>
          <p className="text-sm text-jung-muted mt-1 uppercase tracking-widest font-bold">Empirical Raw Data (0-100)</p>
        </div>
        <p className="max-w-md text-sm text-jung-secondary dark:text-jung-muted italic font-serif leading-relaxed">
          High scores indicate conscious mastery. Lower scores reveal your growth edge and the potential for unintegrated psychic movement.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2"
      >
        {sortedScores.map((item, idx) => {
          const isHigh = item.score >= 70;
          const isLow = item.score <= 30;

          return (
            <motion.div
              key={item.function}
              variants={itemVariants}
              className="flex items-center group py-4 px-2 hover:bg-jung-base dark:hover:bg-white/5 rounded-2xl transition-all"
            >
              <div className="flex-grow flex items-center gap-6">
                <span className="text-display text-2xl text-white/10 dark:text-white/5 font-bold tabular-nums w-8">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>

                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-display text-lg text-jung-dark dark:text-white truncate">
                      {FUNCTION_DESCRIPTIONS[item.function].title}
                    </span>
                    <span className="text-sm font-display font-bold text-jung-accent tabular-nums">
                      {item.score}%
                    </span>
                  </div>

                  <div className="relative h-1.5 w-full bg-jung-base dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.score}%` }}
                      transition={{ duration: 1, delay: 0.2 + idx * 0.05 }}
                      className={`h-full rounded-full transition-colors duration-500 ${isHigh ? 'bg-jung-accent shadow-[0_0_10px_rgba(31,122,103,0.3)]' : isLow ? 'bg-jung-muted' : 'bg-jung-secondary'
                        }`}
                    />
                  </div>
                </div>

                <div className="hidden lg:block w-12 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-jung-muted">
                    {item.function}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};
