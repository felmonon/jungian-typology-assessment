import React, { useState, useCallback } from 'react';
import { Share2, Link2, Check, Camera, Send } from 'lucide-react';
import { ValidatedAssessmentResults } from '../../lib/validation';
import { FUNCTION_DESCRIPTIONS } from '../../data/questions';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareSectionProps {
  results: ValidatedAssessmentResults;
  shareSlug: string | null;
  onInstagramClick: () => void;
}

export const ShareSection: React.FC<ShareSectionProps> = ({
  results,
  shareSlug,
  onInstagramClick
}) => {
  const [linkCopied, setLinkCopied] = useState(false);

  const getShareUrl = useCallback(() => {
    if (!shareSlug) return '';
    return `${window.location.origin}/share/${shareSlug}`;
  }, [shareSlug]);

  const copyLink = useCallback(async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }, [getShareUrl]);

  if (!shareSlug) return null;

  return (
    <div className="mt-16 pt-16 border-t border-jung-border dark:border-dark-border">
      <div className="max-w-xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <Share2 className="w-4 h-4 text-jung-accent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-jung-muted">Extend the Inquiry</span>
        </div>

        <h3 className="text-display text-2xl text-jung-dark dark:text-white mb-8">Share Your Profile</h3>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={onInstagramClick}
            className="group flex flex-col items-center gap-4 p-8 rounded-3xl bg-jung-dark text-white hover:bg-black transition-all shadow-xl shadow-black/20"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-jung-accent transition-colors">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">Instagram Story</span>
          </button>

          <button
            onClick={copyLink}
            className="group flex flex-col items-center gap-4 p-8 rounded-3xl bg-white dark:bg-dark-surface border border-jung-border dark:border-dark-border hover:border-jung-accent transition-all shadow-xl"
          >
            <AnimatePresence mode="wait">
              {linkCopied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-12 h-12 rounded-full bg-jung-accent/10 flex items-center justify-center"
                >
                  <Check className="w-6 h-6 text-jung-accent" />
                </motion.div>
              ) : (
                <motion.div
                  key="link"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-12 h-12 rounded-full bg-jung-base dark:bg-dark-base flex items-center justify-center group-hover:bg-jung-accent/10 transition-colors"
                >
                  <Link2 className="w-6 h-6 text-jung-muted group-hover:text-jung-accent" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className={`text-xs font-bold uppercase tracking-widest ${linkCopied ? 'text-jung-accent' : 'text-jung-muted'}`}>
              {linkCopied ? 'Link Copied!' : 'Copy Private Link'}
            </span>
          </button>
        </div>

        <div className="flex justify-center gap-6">
          <button className="text-jung-muted hover:text-jung-accent transition-colors p-2" aria-label="Share on X">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </button>
          <button className="text-jung-muted hover:text-jung-accent transition-colors p-2" aria-label="Share on LinkedIn">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" /></svg>
          </button>
          <button className="text-jung-muted hover:text-jung-accent transition-colors p-2" aria-label="Send via Email">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
