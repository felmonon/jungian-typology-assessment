import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, BookOpen, Crown, AlertTriangle } from 'lucide-react';
import { Stack } from '../../types';
import { INDIVIDUATION_GUIDANCE } from '../../data/questions';

interface IndividuationSectionProps {
    stack: Stack;
}

export const IndividuationSection: React.FC<IndividuationSectionProps> = ({ stack }) => (
    <section className="mb-20">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-jung-border dark:border-dark-border">
            <div className="w-12 h-12 rounded-2xl bg-jung-gold/10 flex items-center justify-center">
                <Compass className="w-6 h-6 text-jung-gold" />
            </div>
            <div>
                <h2 className="text-display text-3xl text-jung-dark dark:text-white">Path of Individuation</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-jung-muted">Integrating the Psychic Whole</p>
            </div>
        </div>

        <div className="card-premium p-8 lg:p-12 bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border mb-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-jung-gold/5 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="max-w-3xl space-y-8">
                <p className="text-body-lg text-jung-secondary dark:text-jung-muted leading-relaxed font-serif italic">
                    {INDIVIDUATION_GUIDANCE.intro}
                </p>

                <div className="p-8 rounded-[2rem] bg-jung-base dark:bg-dark-base/50 border border-jung-border dark:border-dark-border">
                    <h4 className="text-display text-xl text-jung-dark dark:text-white mb-4 flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-jung-gold" />
                        Working with the Inferior ({stack.inferior.function})
                    </h4>
                    <p className="text-sm text-jung-secondary dark:text-jung-muted leading-relaxed">
                        {INDIVIDUATION_GUIDANCE.inferiorFunctionWork}
                    </p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {INDIVIDUATION_GUIDANCE.stages.slice(0, 3).map((stage, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="card-premium p-8 bg-jung-base dark:bg-dark-surface-elevated border-transparent flex flex-col"
                >
                    <div className="w-10 h-10 rounded-full bg-jung-dark text-white flex items-center justify-center text-xs font-bold mb-6">
                        0{i + 1}
                    </div>
                    <h4 className="text-display text-lg text-jung-dark dark:text-white mb-2">{stage.name}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-jung-muted mb-4">{stage.description}</p>
                    <div className="mt-auto pt-6 border-t border-jung-border dark:border-dark-border">
                        <p className="text-xs text-jung-secondary dark:text-jung-muted italic font-serif leading-relaxed">
                            "{stage.task}"
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>

        <div className="p-8 rounded-[2rem] bg-jung-dark text-white shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-error/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-error" />
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-error mb-2">Psychic Safeguard</h4>
                    <p className="text-sm text-jung-subtle leading-relaxed font-serif italic">
                        {INDIVIDUATION_GUIDANCE.warning}
                    </p>
                </div>
            </div>
        </div>
    </section>
);
