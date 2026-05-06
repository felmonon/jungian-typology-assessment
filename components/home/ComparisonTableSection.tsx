import React from 'react';
import { motion } from 'framer-motion';
import { COMPARISON_ROWS } from './data';
import { Check, X, FlaskConical, BarChart3, Binary, Scale } from 'lucide-react';

export const ComparisonTableSection: React.FC = () => {
  const renderValue = (val: string, isPremium: boolean) => {
    if (val === 'Yes' || val === 'High') {
      return isPremium
        ? <Check className="w-5 h-5 text-jung-accent mx-auto animate-pulse" />
        : <Check className="w-4 h-4 text-jung-muted mx-auto opacity-50" />;
    }
    if (val === 'No' || val === 'Low') {
      return <X className="w-4 h-4 text-error/50 mx-auto" />;
    }
    return <span className={`text-[10px] font-mono uppercase ${isPremium ? 'text-jung-accent font-bold' : 'text-jung-secondary'}`}>{val}</span>;
  };

  return (
    <section className="py-24 bg-jung-base border-t border-jung-border/30">
      <div className="lab-container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 text-jung-muted font-mono text-[10px] uppercase tracking-[0.2em]">
            <Scale className="w-3 h-3" />
            <span>Market Benchmark Analysis</span>
          </div>
          <h2 className="text-display text-4xl text-jung-dark">Methodology <span className="text-jung-accent">Comparison</span></h2>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px] font-mono text-xs">
            {/* Header */}
            <div className="grid grid-cols-5 border-b-2 border-jung-border p-4 bg-jung-surface-elevated text-jung-muted uppercase tracking-wider font-bold">
              <div className="col-span-1 pl-4">Metric</div>
              <div className="col-span-1 text-center flex items-center justify-center gap-2"><Binary className="w-3 h-3" /> 16Personalities</div>
              <div className="col-span-1 text-center flex items-center justify-center gap-2"><FlaskConical className="w-3 h-3" /> Enneagram</div>
              <div className="col-span-1 text-center flex items-center justify-center gap-2"><BarChart3 className="w-3 h-3" /> Big Five</div>
              <div className="col-span-1 text-center text-jung-accent border-b-2 border-jung-accent -mb-4 bg-jung-accent/5 pb-4">TypeJung (v2.0)</div>
            </div>

            {/* Rows */}
            {COMPARISON_ROWS.map((row, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="grid grid-cols-5 border-b border-jung-border/30 hover:bg-jung-surface transition-colors items-center group"
              >
                <div className="col-span-1 p-4 pl-8 font-bold text-jung-secondary group-hover:text-jung-dark">
                  {row.label}
                </div>
                {row.values.map((val, vidx) => (
                  <div
                    key={vidx}
                    className={`col-span-1 p-4 text-center border-l border-jung-border/10 ${vidx === 3 ? 'bg-jung-accent/5' : ''
                      }`}
                  >
                    {renderValue(val, vidx === 3)}
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
