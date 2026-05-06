import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Minus, HelpCircle } from 'lucide-react';
import { FAQ_ITEMS } from './data';

export const FAQSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <section className="py-24 lg:py-32 bg-jung-base dark:bg-dark-base relative overflow-hidden">
      <div className="editorial-container">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center mb-20"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-jung-accent/5 rounded-full mb-6">
              <HelpCircle className="w-4 h-4 text-jung-accent" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-jung-accent">Curiosity & Clarity</span>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-display text-4xl sm:text-5xl text-jung-dark mb-4 tracking-tight"
            >
              The Science of the <span className="italic">Details</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="space-y-4"
          >
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`group transition-all duration-500 rounded-3xl border ${isOpen
                      ? 'bg-white dark:bg-dark-surface border-jung-accent shadow-2xl'
                      : 'bg-white/50 dark:bg-white/5 border-jung-border dark:border-dark-border hover:border-jung-accent/30'
                    }`}
                >
                  <button
                    id={`faq-button-${index}`}
                    className="w-full px-8 py-7 flex items-center justify-between text-left focus:outline-none"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                  >
                    <span className={`text-display text-xl transition-colors duration-300 ${isOpen ? 'text-jung-accent' : 'text-jung-dark'
                      }`}>
                      {item.question}
                    </span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-jung-accent text-white rotate-180' : 'bg-jung-base dark:bg-dark-base text-jung-muted'
                      }`}>
                      {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${index}`}
                        role="region"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-8 pt-0">
                          <div className="w-12 h-0.5 bg-jung-accent/20 mb-6 rounded-full" />
                          <p className="text-body text-jung-secondary dark:text-jung-muted leading-relaxed text-lg font-serif italic">
                            {item.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
