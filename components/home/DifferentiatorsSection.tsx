import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { DIFFERENTIATORS } from './data';

export const DifferentiatorsSection: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="py-24 lg:py-32 bg-jung-base dark:bg-dark-base border-t border-jung-border dark:border-dark-border">
      <div className="editorial-container">
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
            A Standard of Its Own
          </motion.h2>
          <motion.div
            variants={itemVariants}
            className="w-24 h-1 bg-jung-accent mx-auto rounded-full"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {DIFFERENTIATORS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="group h-full"
              >
                <div className="card-premium h-full p-8 bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border group-hover:border-jung-accent/50 transition-colors">
                  <div className="w-12 h-12 bg-jung-accent/5 dark:bg-dark-surface-elevated rounded-2xl flex items-center justify-center mb-6 border border-jung-accent/10 group-hover:bg-jung-accent group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6 text-jung-accent group-hover:text-white" />
                  </div>
                  <h3 className="text-display text-xl text-jung-dark mb-4 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-jung-secondary dark:text-jung-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
