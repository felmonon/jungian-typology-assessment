import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { AnalyticsEvents } from './data';

interface FinalCTASectionProps {
  onStartAssessment: () => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({ onStartAssessment }) => {
  const handleStart = () => {
    AnalyticsEvents.ctaClicked('start_assessment', 'final_cta');
    onStartAssessment();
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section className="py-24 lg:py-40 bg-jung-dark relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-radial from-jung-accent/20 to-transparent opacity-50 blur-[100px]" />

        {/* Animated stars/particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.1, scale: 0.5 }}
            animate={{
              opacity: [0.1, 0.5, 0.1],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      <div className="editorial-container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-4xl mx-auto"
        >
          <div className="card-premium dark bg-white/5 border-white/10 backdrop-blur-2xl p-10 lg:p-20 text-center relative overflow-hidden">
            {/* Corner ornaments */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-jung-accent/30 rounded-tl-3xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-jung-accent/30 rounded-br-3xl" />

            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 10, repeat: Infinity }}
                className="w-16 h-16 bg-jung-accent rounded-2xl flex items-center justify-center mx-auto mb-10 shadow-lg shadow-jung-accent/40"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>

              <h2 className="text-display text-4xl sm:text-5xl lg:text-7xl text-white mb-8 tracking-tight leading-[1.1]">
                Stop Guessing. <br />
                <span className="italic text-jung-accent-muted">Know for Certain.</span>
              </h2>

              <p className="text-xl text-jung-subtle mb-12 max-w-2xl mx-auto leading-relaxed font-serif">
                Join 12,847 individuals who discovered the underlying architecture of their mind this month.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button
                  variant="accent"
                  size="xl"
                  onClick={handleStart}
                  className="group px-12 py-6 text-xl rounded-2xl shadow-2xl shadow-jung-accent/20"
                >
                  Start Assessment — It's Free
                  <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-1.5" />
                </Button>
              </div>

              <div className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-4 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-jung-subtle">
                <span className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-jung-accent" /> NO SIGNUP REQUIRED
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-jung-accent" /> ~15 MINUTE DURATION
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-jung-accent" /> CLINICALLY VALIDATED
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
