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
              <span className="text-xs font-serif font-bold text-jung-accent uppercase tracking-widest">Research-informed method</span>
            </motion.div>

            <motion.h2 variants={itemVariants} className="text-display text-4xl sm:text-5xl text-jung-dark leading-tight">
              A deeper way to read <span className="italic">your pattern</span>
            </motion.h2>

            <motion.p variants={itemVariants} className="text-body text-lg text-jung-secondary dark:text-jung-muted leading-relaxed">
              TypeJung returns to Jung's core problem: how attention, judgment, stress, and one-sidedness form a repeatable pattern in daily life.
            </motion.p>

            <motion.div variants={itemVariants} className="space-y-6">
              {[
                {
                  icon: Microscope,
                  title: 'Function-first structure',
                  desc: 'The assessment looks at cognitive functions directly instead of reducing everything to a single four-letter label.'
                },
                {
                  icon: FileText,
                  title: 'Multiple evidence layers',
                  desc: 'Behavior, stress, body signals, and attitude direction are compared so the result is easier to test against lived experience.'
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
                    <h3 className="text-display text-lg">Method Layers</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-jung-muted">Assessment design</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-display font-bold text-jung-accent">42</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-jung-muted">Questions</p>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { label: 'Behavioral scenarios', value: 'Layer 1' },
                  { label: 'Stress indicators', value: 'Layer 2' },
                  { label: 'Body and attitude signals', value: 'Layer 3' }
                ].map((bar, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span className="text-jung-dark">{bar.label}</span>
                      <span className="text-jung-accent">{bar.value}</span>
                    </div>
                    <div className="h-2 bg-jung-base dark:bg-dark-base rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                        className="h-full bg-jung-accent"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-4 rounded-xl bg-jung-accent/5 dark:bg-dark-surface-elevated border border-jung-accent/10 italic text-sm text-jung-secondary">
                "The point is not to prove a fixed identity. The point is to give you a pattern clear enough to observe, question, and practice with."
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
