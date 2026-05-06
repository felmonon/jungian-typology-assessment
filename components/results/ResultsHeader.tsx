import React from 'react';
import { motion } from 'framer-motion';
import { ValidatedAssessmentResults } from '../../lib/validation';
import { FUNCTION_DESCRIPTIONS } from '../../data/questions';
import { Sparkles, Brain, Award } from 'lucide-react';

interface ResultsHeaderProps {
  results: ValidatedAssessmentResults;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({ results }) => {
  const dominantFunc = results.stack.dominant.function;
  const dominantDesc = FUNCTION_DESCRIPTIONS[dominantFunc];

  return (
    <div className="space-y-12 mb-16">
      {/* Visual Title Section */}
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-3 px-5 py-2.5 bg-jung-accent/10 dark:bg-jung-accent/20 border border-jung-accent/20 rounded-full text-jung-accent"
        >
          <Award className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">Verified Archetypal Analysis</span>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-display text-4xl sm:text-6xl text-jung-dark dark:text-white tracking-tight"
        >
          Your Cognitive <br />
          <span className="italic text-jung-accent">Architecture.</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-body-lg text-jung-secondary dark:text-jung-muted max-w-2xl mx-auto italic font-serif"
        >
          "Who looks outside, dreams; who looks inside, awakes." — C.G. Jung
        </motion.p>
      </div>

      {/* Hero Result Card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-jung-accent via-jung-gold to-jung-accent opacity-20 blur-2xl rounded-[2.5rem]" />

        <div className="relative bg-jung-dark dark:bg-black rounded-[2rem] overflow-hidden p-8 lg:p-14 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-jung-accent/10 rounded-full blur-[100px] -mr-32 -mt-32" />

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-jung-accent-muted flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Core Ego Preference
                </span>
                <h2 className="text-display text-4xl lg:text-7xl leading-none">
                  {dominantDesc.title}
                </h2>
                <p className="text-display text-xl lg:text-3xl text-white/50">{dominantFunc}</p>
              </div>

              <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 italic font-serif text-lg lg:text-xl text-jung-subtle leading-relaxed">
                <span className="absolute -top-4 -left-2 text-6xl text-jung-accent/20 font-display">"</span>
                {dominantDesc.quote}
                <span className="absolute -bottom-10 -right-2 text-6xl text-jung-accent/20 font-display">"</span>
              </div>
            </div>

            <div className="lg:pl-12 lg:border-l border-white/10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-jung-accent/20 flex items-center justify-center border border-jung-accent/30">
                  <Brain className="w-6 h-6 text-jung-accent-muted" />
                </div>
                <h4 className="text-display text-xl">The Hero Archetype</h4>
              </div>
              <p className="text-sm leading-relaxed text-jung-subtle font-serif">
                {dominantDesc.desc.split('.').slice(0, 2).join('.')}... This function marks your primary way of interacting with reality and provides the fundamental orientation of your conscious life.
              </p>
              <div className="flex gap-3">
                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-jung-subtle">
                  Primary Orientation
                </div>
                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-jung-subtle">
                  Loomis Validated
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
