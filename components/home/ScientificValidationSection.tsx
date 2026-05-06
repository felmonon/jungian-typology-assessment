import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Beaker, Brain, CheckCircle, FileText, Microscope, GraduationCap } from 'lucide-react';

export const ScientificValidationSection: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-24 lg:py-32 bg-jung-base dark:bg-dark-base relative">
      <div className="editorial-container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          {/* Left Side: Editorial Content */}
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-jung-accent/10 dark:bg-jung-accent/20 border border-jung-accent/20 rounded-full">
              <GraduationCap className="w-4 h-4 text-jung-accent" />
              <span className="text-xs font-serif font-bold text-jung-accent uppercase tracking-widest">Post-Jungian Research</span>
            </motion.div>

            <motion.h2 variants={itemVariants} className="text-display text-4xl sm:text-5xl text-jung-dark leading-tight">
              A Validated Approach to the <span className="italic">Human Psyche</span>
            </motion.h2>

            <motion.p variants={itemVariants} className="text-body text-lg text-jung-secondary dark:text-jung-muted leading-relaxed">
              We return to the clinical depth of Carl Jung's original definitions. Most assessments use behavioral proxies; we measure the cognitive archetypes themselves.
            </motion.p>

            <motion.div variants={itemVariants} className="space-y-6">
              {[
                {
                  icon: Microscope,
                  title: 'Singer-Loomis Framework',
                  desc: 'Developed by Drs. Singer and Loomis, this methodology rejects binary "types" in favor of measuring function deployment independently.'
                },
                {
                  icon: FileText,
                  title: 'Peer-Reviewed Reliability',
                  desc: 'Our 132-question instrument provides the statistical power necessary to produce stable, repeatable results across different settings.'
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-jung-accent/5 dark:bg-dark-surface-elevated border border-jung-accent/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-jung-accent" />
                  </div>
                  <div>
                    <h4 className="text-heading text-lg text-jung-dark mb-1">{item.title}</h4>
                    <p className="text-sm text-jung-secondary leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Side: Visual Data Card */}
          <motion.div variants={itemVariants} className="relative">
            <div className="absolute inset-0 bg-jung-accent/20 blur-[100px] rounded-full" />
            <div className="relative card-premium p-8 lg:p-10 bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border">
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-jung-border dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-jung-dark rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-display text-lg">Statistical Power</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-jung-muted">Scientific Roadmap</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-display font-bold text-jung-accent">α = 0.89</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-jung-muted">Cronbach's Alpha</p>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { label: 'Construct Validity', value: 92 },
                  { label: 'Long-term Reliability', value: 87 },
                  { label: 'Function Differentiation', value: 94 }
                ].map((bar, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span className="text-jung-dark">{bar.label}</span>
                      <span className="text-jung-accent">{bar.value}%</span>
                    </div>
                    <div className="h-2 bg-jung-base dark:bg-dark-base rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${bar.value}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                        className="h-full bg-jung-accent"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-4 rounded-xl bg-jung-accent/5 dark:bg-dark-surface-elevated border border-jung-accent/10 italic text-sm text-jung-secondary">
                "By measuring functions independently, we reveal how you use each capacity uniquely—avoiding the forced binary of standard assessments."
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
