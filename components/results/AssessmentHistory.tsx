import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronDown, ChevronUp, Loader2, Eye, Trash2, Calendar, Brain } from 'lucide-react';
import { FUNCTION_DESCRIPTIONS } from '../../data/questions';

interface SavedResult {
    id: string;
    scores: any[];
    stack: any;
    attitudeScore: string;
    isUndifferentiated: string;
    shareSlug: string | null;
    createdAt: string;
}

interface AssessmentHistoryProps {
    historyResults: SavedResult[];
    isLoading: boolean;
    showHistory: boolean;
    viewingHistoricalResult: string | null;
    deletingResultId: string | null;
    onToggle: () => void;
    onLoad: (result: SavedResult) => void;
    onDelete: (id: string) => void;
}

export const AssessmentHistory: React.FC<AssessmentHistoryProps> = ({
    historyResults,
    isLoading,
    showHistory,
    viewingHistoricalResult,
    deletingResultId,
    onToggle,
    onLoad,
    onDelete
}) => (
    <div className="mt-20">
        <button
            onClick={onToggle}
            className={`group flex items-center justify-between w-full p-8 rounded-[2rem] border transition-all duration-500 ${showHistory
                    ? 'bg-jung-dark text-white border-transparent'
                    : 'bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border hover:border-jung-accent'
                }`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${showHistory ? 'bg-white/10' : 'bg-jung-base dark:bg-dark-base'
                    }`}>
                    <History className={`w-6 h-6 ${showHistory ? 'text-jung-accent-muted' : 'text-jung-muted group-hover:text-jung-accent'}`} />
                </div>
                <div className="text-left">
                    <h3 className="text-display text-xl font-bold">Evolution History</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${showHistory ? 'text-jung-subtle' : 'text-jung-muted'}`}>
                        {historyResults.length} Previous Diagnostics
                    </p>
                </div>
            </div>
            {showHistory ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </button>

        <AnimatePresence>
            {showHistory && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                >
                    <div className="pt-8 space-y-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-jung-base dark:bg-dark-base/50 rounded-[2rem]">
                                <Loader2 className="w-8 h-8 animate-spin text-jung-accent mb-4" />
                                <span className="text-xs font-bold uppercase tracking-widest text-jung-muted">Accessing Archive...</span>
                            </div>
                        ) : historyResults.length === 0 ? (
                            <div className="text-center py-16 bg-jung-base dark:bg-dark-base rounded-[2rem] border border-dashed border-jung-border dark:border-dark-border">
                                <Brain className="w-12 h-12 text-jung-muted/30 mx-auto mb-4" />
                                <p className="text-sm text-jung-secondary font-serif italic">Your psychological snapshots will appear here.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {historyResults.map((result) => {
                                    const dominantFunc = result.stack?.dominant?.function || 'N/A';
                                    const funcTitle = FUNCTION_DESCRIPTIONS[dominantFunc as keyof typeof FUNCTION_DESCRIPTIONS]?.title || dominantFunc;
                                    const dateStr = new Date(result.createdAt).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric'
                                    });
                                    const isViewing = viewingHistoricalResult === result.id;

                                    return (
                                        <motion.div
                                            key={result.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`card-premium p-6 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all border ${isViewing
                                                    ? 'border-jung-accent bg-jung-accent/5 shadow-lg'
                                                    : 'border-jung-border dark:border-dark-border bg-white dark:bg-dark-surface hover:border-jung-accent/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${isViewing ? 'bg-jung-accent text-white' : 'bg-jung-base dark:bg-dark-base text-jung-dark dark:text-white'
                                                    }`}>
                                                    <span className="text-xs font-bold font-display">{dominantFunc}</span>
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="text-display text-lg text-jung-dark dark:text-white leading-none">{funcTitle}</h4>
                                                        {isViewing && (
                                                            <span className="px-2 py-0.5 bg-jung-accent text-[8px] font-bold text-white uppercase tracking-widest rounded">Active</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-jung-muted uppercase tracking-widest">
                                                        <Calendar className="w-3 h-3" />
                                                        {dateStr}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                <button
                                                    onClick={() => onLoad(result)}
                                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-jung-accent/10 text-jung-accent hover:bg-jung-accent hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> Restore
                                                </button>
                                                <button
                                                    onClick={() => onDelete(result.id)}
                                                    disabled={deletingResultId === result.id}
                                                    className="flex-shrink-0 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                                                    aria-label="Delete result"
                                                >
                                                    {deletingResultId === result.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);
