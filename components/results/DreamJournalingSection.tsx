import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Star, Book, HelpCircle, Lightbulb } from 'lucide-react';
import { DREAM_JOURNALING_TEMPLATE } from '../../data/questions';

export const DreamJournalingSection: React.FC = () => (
    <section className="mb-20">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-jung-border dark:border-dark-border">
            <div className="w-12 h-12 rounded-2xl bg-indigo-900/10 flex items-center justify-center">
                <Moon className="w-6 h-6 text-indigo-900" />
            </div>
            <div>
                <h2 className="text-display text-3xl text-jung-dark dark:text-white">Dream Archelogy</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-jung-muted">The Royal Road to the Unconscious</p>
            </div>
        </div>

        <div className="card-premium p-8 lg:p-12 bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -mr-48 -mt-48" />

            <p className="text-body-lg text-jung-secondary dark:text-jung-muted mb-12 leading-relaxed font-serif italic max-w-3xl">
                {DREAM_JOURNALING_TEMPLATE.intro}
            </p>

            <div className="grid md:grid-cols-2 gap-10 mb-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 text-jung-dark dark:text-white">
                        <HelpCircle className="w-5 h-5 text-jung-accent" />
                        <h4 className="text-display text-xl">The Inquiry Protocol</h4>
                    </div>
                    <div className="space-y-4">
                        {DREAM_JOURNALING_TEMPLATE.questions.map((q, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex gap-4 p-4 rounded-2xl bg-jung-base dark:bg-dark-base/50"
                            >
                                <span className="text-display text-lg text-jung-accent/40 font-bold tabular-nums">0{i + 1}</span>
                                <p className="text-sm text-jung-secondary dark:text-jung-muted font-serif">{q}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3 text-jung-dark dark:text-white">
                        <Star className="w-5 h-5 text-jung-gold" />
                        <h4 className="text-display text-xl">Symbols to Track</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {DREAM_JOURNALING_TEMPLATE.symbolsToNotice.map((symbol, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="p-5 rounded-2xl border border-jung-border dark:border-dark-border text-center group hover:border-jung-accent transition-colors"
                            >
                                <span className="text-xs font-bold uppercase tracking-widest text-jung-muted group-hover:text-jung-accent transition-colors">
                                    {symbol}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-jung-dark text-white relative overflow-hidden mt-8">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-jung-accent/10 rounded-full blur-3xl -mr-16 -mb-16" />
                        <div className="flex items-center gap-3 mb-4">
                            <Lightbulb className="w-5 h-5 text-jung-accent-muted" />
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-jung-subtle">Analytic Key</h4>
                        </div>
                        <p className="text-sm text-jung-subtle leading-relaxed font-serif italic">
                            {DREAM_JOURNALING_TEMPLATE.jungianTip}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
);
