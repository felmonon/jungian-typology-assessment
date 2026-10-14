import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Target, MapPin, AlertCircle, Sparkles } from 'lucide-react';
import { CAREER_GUIDANCE } from '../../data/questions';

interface CareerSectionProps {
    dominantFunc: string;
}

export const CareerSection: React.FC<CareerSectionProps> = ({ dominantFunc }) => {
    const guidance = CAREER_GUIDANCE[dominantFunc as keyof typeof CAREER_GUIDANCE];

    if (!guidance) return null;

    return (
        <section className="mb-20">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-jung-border dark:border-dark-border">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h2 className="text-display text-3xl text-jung-dark dark:text-white">Career Alignment</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-jung-muted">Professional Vocation & Flow</p>
                </div>
            </div>

            <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="card-premium p-8 bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Target className="w-5 h-5 text-jung-accent" />
                            <h3 className="text-display text-xl text-jung-dark dark:text-white">Natural Mastery</h3>
                        </div>
                        <p className="text-sm text-jung-secondary dark:text-jung-muted leading-relaxed font-serif italic">
                            {guidance.naturalStrengths}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="card-premium p-8 bg-jung-base dark:bg-dark-surface-elevated border-transparent"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <MapPin className="w-5 h-5 text-jung-secondary" />
                            <h3 className="text-display text-xl text-jung-dark dark:text-white">Optimal Ecosystems</h3>
                        </div>
                        <p className="text-sm text-jung-secondary dark:text-jung-muted leading-relaxed font-serif italic">
                            {guidance.idealEnvironments}
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="card-premium p-10 bg-jung-dark text-white relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-jung-accent/10 rounded-full blur-3xl -mr-32 -mt-32" />

                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                        <div className="flex-grow">
                            <h4 className="text-display text-2xl mb-8 flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-jung-accent-muted" />
                                Vocation Roadmap
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                {guidance.roles.map((role: string, idx: number) => (
                                    <span key={idx} className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-jung-accent-muted hover:bg-white/10 transition-colors">
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="w-full lg:w-80 lg:pl-12 lg:border-l border-white/10">
                            <div className="flex items-center gap-3 mb-4 text-error">
                                <AlertCircle className="w-5 h-5" />
                                <h4 className="text-xs font-bold uppercase tracking-[0.2em]">Burnout Risk</h4>
                            </div>
                            <p className="text-xs text-jung-subtle leading-relaxed font-serif">
                                {guidance.watchOutFor}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
