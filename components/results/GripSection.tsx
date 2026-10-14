import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Zap, RefreshCw } from 'lucide-react';

interface GripSectionProps {
    grip: any;
}

export const GripSection: React.FC<GripSectionProps> = ({ grip }) => (
    <section className="mb-20">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-jung-border dark:border-dark-border">
            <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-error" />
            </div>
            <div>
                <h2 className="text-display text-3xl text-jung-dark dark:text-white">The Grip</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-jung-muted">Inferior Eruption Analysis</p>
            </div>
        </div>

        <div className="card-premium p-8 lg:p-12 bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border mb-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-error/5 rounded-full blur-3xl -mr-32 -mt-32" />

            <div className="max-w-3xl">
                <p className="text-body-lg text-jung-secondary dark:text-jung-muted mb-8 leading-relaxed font-serif italic">
                    Under extreme stress or exhaustion, your conscious ego can fail, allowing the primitive, undifferentiated energy of your inferior function (<span className="text-error font-bold">{grip.inferiorFunction}</span>) to seize control.
                </p>

                <div className="p-8 rounded-[2rem] bg-error/5 border border-error/10 space-y-4">
                    <h4 className="text-display text-xl text-error flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5" />
                        Behavioral Phenotype
                    </h4>
                    <p className="text-sm text-jung-secondary dark:text-jung-muted leading-relaxed">
                        {grip.gripDescription}
                    </p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { title: 'Normal State', content: grip.normalState, icon: Zap, color: 'text-jung-accent' },
                { title: 'Common Triggers', content: grip.triggers, icon: AlertTriangle, color: 'text-error' },
                { title: 'Path to Recovery', content: grip.recovery, icon: RefreshCw, color: 'text-jung-secondary' },
            ].map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="card-premium p-6 bg-jung-base dark:bg-dark-surface-elevated border-transparent"
                >
                    <item.icon className={`w-5 h-5 ${item.color} mb-4`} />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-jung-muted mb-3">{item.title}</h4>
                    <p className="text-xs text-jung-secondary dark:text-jung-muted leading-relaxed line-clamp-4">
                        {item.content}
                    </p>
                </motion.div>
            ))}
        </div>
    </section>
);
