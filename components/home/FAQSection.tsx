import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { FAQ_ITEMS } from './data';

const ease = [0.22, 1, 0.36, 1] as const;

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 lg:py-32 bg-jung-surface-alt border-y border-jung-border">
      <div className="lab-container">
        <div className="grid lg:grid-cols-12 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease }}
            className="lg:col-span-4"
          >
            <div className="lg:sticky lg:top-32">
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-10 bg-jung-border-light" />
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-jung-muted">
                  Inquiries
                </span>
              </div>
              <h2 className="text-display text-4xl md:text-5xl leading-[1.02] tracking-tight text-jung-dark mb-6">
                Questions, <span className="italic text-jung-accent">answered</span>.
              </h2>
              <p className="text-jung-secondary font-light leading-relaxed">
                Curious about methodology, accuracy, or what makes this different?
                The most common questions are here.
              </p>
            </div>
          </motion.div>

          <motion.ol
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
            className="lg:col-span-8 divide-y divide-jung-border border-t border-b border-jung-border"
          >
            {FAQ_ITEMS.map((f, i) => {
              const open = openIndex === i;
              return (
                <li key={i}>
                  <button
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="w-full py-6 flex items-start gap-6 text-left group"
                    aria-expanded={open}
                  >
                    <span className="font-mono text-[10px] tabular-nums text-jung-muted pt-1 w-8 shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-display text-xl md:text-2xl text-jung-dark leading-snug group-hover:text-jung-accent transition-colors">
                      {f.question}
                    </span>
                    <span className="shrink-0 pt-1.5 text-jung-muted group-hover:text-jung-accent transition-colors">
                      {open ? <Minus size={18} /> : <Plus size={18} />}
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      open ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden pl-14 pr-4 md:pr-10">
                      <p className="text-jung-secondary leading-relaxed font-light whitespace-pre-line">
                        {f.answer}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </motion.ol>
        </div>
      </div>
    </section>
  );
};
