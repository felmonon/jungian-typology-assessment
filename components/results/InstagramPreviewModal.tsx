import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Sparkles, Smartphone, Download, Share2 } from 'lucide-react';
import { ValidatedAssessmentResults } from '../../lib/validation';

const InstagramStoryCard = React.lazy(() => import('../InstagramStoryCard').then(m => ({ default: m.InstagramStoryCard })));

interface InstagramPreviewModalProps {
    onClose: () => void;
    onShare: () => void;
    isGenerating: boolean;
    instagramCardRef: React.RefObject<HTMLDivElement>;
    results: ValidatedAssessmentResults;
}

export const InstagramPreviewModal: React.FC<InstagramPreviewModalProps> = ({
    onClose,
    onShare,
    isGenerating,
    instagramCardRef,
    results
}) => (
    <AnimatePresence>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8"
        >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-5xl bg-jung-dark rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row"
            >
                {/* Preview Area */}
                <div className="flex-[1.5] bg-black/40 p-10 flex flex-col items-center justify-center overflow-auto border-b lg:border-b-0 lg:border-r border-white/10">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-br from-jung-accent to-jung-gold opacity-20 blur-2xl rounded-[3rem] group-hover:opacity-40 transition-opacity" />

                        {/* Story Card Container */}
                        <div className="relative w-[270px] h-[480px] bg-jung-base rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-white/5">
                            <div
                                ref={instagramCardRef}
                                style={{
                                    transform: 'scale(0.25)',
                                    transformOrigin: 'top left',
                                    width: '1080px',
                                    height: '1920px'
                                }}
                            >
                                <Suspense fallback={
                                    <div className="w-[1080px] h-[1920px] bg-jung-dark flex items-center justify-center">
                                        <Loader2 className="w-20 h-20 animate-spin text-jung-accent" />
                                    </div>
                                }>
                                    <InstagramStoryCard
                                        dominantFunction={results.stack.dominant.function}
                                        scores={results.scores}
                                        stack={results.stack}
                                    />
                                </Suspense>
                            </div>
                        </div>

                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-jung-subtle">
                            <Smartphone className="w-3 h-3" /> 1080 x 1920 Render
                        </div>
                    </div>
                </div>

                {/* Action Area */}
                <div className="flex-1 p-10 lg:p-14 flex flex-col justify-center gap-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-jung-accent/20 rounded-full text-jung-accent text-[8px] font-bold uppercase tracking-widest mb-4">
                            Premium Export
                        </div>
                        <h3 className="text-display text-3xl text-white mb-4">Social Asset <br /><span className="text-jung-accent-muted italic">Generator.</span></h3>
                        <p className="text-sm text-jung-subtle leading-relaxed font-serif">
                            We've synthesized your functional hierarchy into a cinematically rendered Instagram Story asset. Ready for immediate social dissemination.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={onShare}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-center gap-4 py-5 bg-jung-accent text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-jung-accent/20 hover:bg-jung-accent-hover hover:-translate-y-1 transition-all disabled:opacity-50"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Rendering Matrix...
                                </>
                            ) : (
                                <>
                                    <Share2 className="w-5 h-5" />
                                    Share to Story
                                </>
                            )}
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-5 bg-white/5 text-jung-subtle rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-all border border-white/5"
                        >
                            Back to Analysis
                        </button>
                    </div>

                    <div className="flex items-center gap-4 pt-10 border-t border-white/5">
                        <div className="p-3 bg-jung-gold/10 rounded-xl">
                            <Sparkles className="w-5 h-5 text-jung-gold" />
                        </div>
                        <p className="text-[10px] text-jung-muted leading-relaxed uppercase tracking-widest">
                            Loomis protocol compliant high-resolution export.
                        </p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-3 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/10"
                >
                    <X className="w-6 h-6" />
                </button>
            </motion.div>
        </motion.div>
    </AnimatePresence>
);
