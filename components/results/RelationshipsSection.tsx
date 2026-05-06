import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Sparkles, Flame } from 'lucide-react';
import { RELATIONSHIPS_INSIGHTS } from '../../data/questions';

interface RelationshipsSectionProps {
    dominantFunc: string;
}

export const RelationshipsSection: React.FC<RelationshipsSectionProps> = ({ dominantFunc }) => {
    const insights = RELATIONSHIPS_INSIGHTS[dominantFunc as keyof typeof RELATIONSHIPS_INSIGHTS];

    if (!insights) return null;

    return (
        <section className="mb-20">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-jung-border dark:border-dark-border">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                    <h2 className="text-display text-3xl text-jung-dark dark:text-white">Interpersonal Dynamics</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-jung-muted">Relational Intelligence & Compatibility</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="card-premium p-8 bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-jung-accent/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    <h4 className="text-display text-xl text-jung-dark dark:text-white mb-6 flex items-center gap-3">
                        <Users className="w-5 h-5 text-jung-accent" />
                        Core Strengths
                    </h4>
                    <p className="text-sm text-jung-secondary dark:text-jung-muted leading-relaxed font-serif italic">
                        {insights.strengths}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="card-premium p-8 border-jung-border dark:border-dark-border bg-jung-base dark:bg-dark-base/50"
                >
                    <h4 className="text-display text-xl text-jung-dark dark:text-white mb-6 flex items-center gap-3">
                        <Flame className="w-5 h-5 text-error" />
                        Shadow Triggers
                    </h4>
                    <p className="text-sm text-jung-secondary dark:text-jung-muted leading-relaxed font-serif italic">
                        {insights.challenges}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="card-premium p-8 bg-jung-dark text-white md:col-span-2 overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-jung-accent/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h4 className="text-display text-xl mb-4 flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-jung-accent-muted" />
                                Archetypal Resonance
                            </h4>
                            <p className="text-sm text-jung-subtle leading-relaxed font-serif">
                                {insights.idealPartners}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-display text-xl mb-4">Evolution Marker</h4>
                            <p className="text-sm text-jung-subtle leading-relaxed font-serif">
                                {insights.growthInRelationships}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
