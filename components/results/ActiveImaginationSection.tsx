import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Eye, ChevronDown, UserCircle } from 'lucide-react';
import { ACTIVE_IMAGINATION_PROMPTS } from '../../data/questions';

export const ActiveImaginationSection: React.FC = () => (
    <section className="mb-20">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-jung-border dark:border-dark-border">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
                <h2 className="text-display text-3xl text-jung-dark dark:text-white">Active Imagination</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-jung-muted">Dialectic of the Unconscious</p>
            </div>
        </div>

        <div className="card-premium p-8 lg:p-12 bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border mb-12">
            <div className="max-w-3xl space-y-6 mb-12">
                <p className="text-body-lg text-jung-secondary dark:text-jung-muted leading-relaxed font-serif italic">
                    Active Imagination is a meditative technique developed by Jung to bridge the gap between conscious ego and unconscious archetypes. Unlike passive fantasy, it requires active participation and ethical confrontation with inner figures.
                </p>
            </div>

            <div className="space-y-4">
                {ACTIVE_IMAGINATION_PROMPTS.map((exercise, index) => (
                    <details key={index} className="group bg-jung-base dark:bg-dark-base rounded-[2rem] border border-transparent hover:border-jung-accent/20 transition-all overflow-hidden">
                        <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-jung-accent text-white flex items-center justify-center font-display text-lg font-bold">
                                    {index + 1}
                                </div>
                                <h4 className="text-display text-xl text-jung-dark dark:text-white truncate lg:max-w-md">{exercise.title}</h4>
                            </div>
                            <ChevronDown className="w-6 h-6 text-jung-muted group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="px-8 pb-10 pt-4 bg-white/50 dark:bg-black/20 border-t border-jung-border/30 dark:border-dark-border">
                            <div className="flex gap-4">
                                <Brain className="w-5 h-5 text-jung-accent flex-shrink-0 mt-1" />
                                <p className="text-sm text-jung-secondary dark:text-jung-muted leading-relaxed font-serif">
                                    {exercise.prompt}
                                </p>
                            </div>
                        </div>
                    </details>
                ))}
            </div>

            <div className="mt-12 p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
                <UserCircle className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                <p className="text-xs text-jung-secondary dark:text-jung-muted leading-relaxed italic font-serif">
                    <strong>Protocol:</strong> If you encounter overwhelming images or have a history of trauma, please conduct these sessions with a qualified depth therapist. The unconscious is a powerful objective reality.
                </p>
            </div>
        </div>
    </section>
);
