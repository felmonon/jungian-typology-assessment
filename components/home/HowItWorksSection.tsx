import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { HOW_IT_WORKS_STEPS, AnalyticsEvents } from './data';

interface HowItWorksSectionProps {
  onStartAssessment: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onStartAssessment }) => {
  const handleStart = () => {
    AnalyticsEvents.ctaClicked('start_assessment', 'how_it_works');
    onStartAssessment();
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section className="py-24 lg:py-32 bg-jung-base dark:bg-dark-base relative overflow-hidden">
      {/* Decorative line connecting steps */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-jung-border dark:via-dark-border to-transparent -translate-y-1/2 hidden lg:block z-0" />

      <div className="editorial-container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="text-display text-4xl sm:text-5xl text-jung-dark mb-4 tracking-tight"
          >
            Actual understanding, <span className="italic">simplified.</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-body-lg text-jung-secondary dark:text-jung-muted max-w-2xl mx-auto">
            Not a behavioral quiz. A cognitive diagnostic.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid lg:grid-cols-3 gap-8 lg:gap-12 relative"
        >
          {HOW_IT_WORKS_STEPS.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="card-premium h-full p-8 lg:p-10 bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border flex flex-col">
                <div className="relative mb-8">
                  <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-jung-dark text-white text-xl font-display font-bold relative z-10 shadow-lg group-hover:bg-jung-accent transition-colors duration-300">
                    {item.step}
                  </span>
                  <div className="absolute -top-4 -left-4 w-20 h-20 bg-jung-accent/5 rounded-full blur-xl group-hover:bg-jung-accent/15 transition-colors duration-300" />
                </div>

                <h3 className="text-display text-2xl text-jung-dark mb-4 mt-2">
                  {item.title}
                </h3>

                <p className="text-body text-jung-secondary dark:text-jung-muted leading-relaxed mb-6 flex-grow">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 text-jung-accent font-bold text-sm group-hover:gap-3 transition-all duration-300">
                  <span className="uppercase tracking-widest">Learn More</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
          className="text-center mt-20"
        >
          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-jung-accent/50 via-jung-gold/50 to-jung-accent/50 shadow-xl shadow-jung-accent/10">
            <Button
              size="lg"
              onClick={handleStart}
              variant="accent"
              className="px-10 py-5 text-xl rounded-xl shadow-none hover:shadow-none"
            >
              Begin Your Journey <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <div className="mt-8 flex flex-col items-center gap-2">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-jung-base bg-jung-surface-alt dark:bg-dark-surface-elevated" />
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-jung-base bg-jung-accent flex items-center justify-center text-[10px] text-white font-bold">
                +12k
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-jung-muted">
              Joined by <span className="text-jung-accent">12,847</span> users this month
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
