import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Loader2, AlertTriangle, Sparkles, ChevronRight } from 'lucide-react';
import { FormattedText } from '../FormattedText';

interface AiDeepAnalysisProps {
    isLoading: boolean;
    error: Error | string | null;
    analysis: any;
}

export const AiDeepAnalysis: React.FC<AiDeepAnalysisProps> = ({ isLoading, error, analysis }) => (
    <section className="mb-20">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-jung-border dark:border-dark-border">
            <div className="w-12 h-12 rounded-2xl bg-jung-accent/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-jung-accent" />
            </div>
            <div>
                <h2 className="text-display text-3xl text-jung-dark dark:text-white">AI Synthetic Synthesis</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-jung-muted">Large Language Model Pattern Extraction</p>
            </div>
        </div>

        <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-32 card-premium bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border"
                >
                    <div className="relative mb-8">
                        <Loader2 className="w-16 h-16 animate-spin text-jung-accent" />
                        <Sparkles className="absolute inset-0 w-8 h-8 m-auto text-jung-accent-muted animate-pulse" />
                    </div>
                    <span className="text-display text-xl text-jung-dark dark:text-white mb-2">Architecting Your Profile</span>
                    <p className="text-sm text-jung-muted font-serif italic">Synthesizing archetype vectors and cognitive patterns...</p>
                </motion.div>
            ) : error ? (
                <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-6 p-8 bg-error/5 border border-error/10 rounded-[2rem] text-error"
                >
                    <AlertTriangle className="w-10 h-10 flex-shrink-0" />
                    <div>
                        <p className="text-display text-xl mb-1">Synthesis Failure</p>
                        <p className="text-sm opacity-80 font-serif">Unable to connect to the cognitive processing engine. Please try again.</p>
                    </div>
                </motion.div>
            ) : analysis ? (
                <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-10"
                >
                    {Object.entries(analysis).map(([key, value], idx) => (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="card-premium p-8 lg:p-12 bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 px-6 py-2 bg-jung-accent/10 dark:bg-jung-accent/20 text-jung-accent text-[10px] font-bold uppercase tracking-widest rounded-bl-3xl">
                                Synthetic Logic
                            </div>

                            <h3 className="text-display text-2xl mb-8 capitalize text-jung-dark dark:text-white flex items-center gap-3">
                                <ChevronRight className="w-6 h-6 text-jung-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h3>

                            <div className="prose-editorial dark:prose-invert">
                                <FormattedText text={value as string} />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            ) : null}
        </AnimatePresence>
    </section>
);
