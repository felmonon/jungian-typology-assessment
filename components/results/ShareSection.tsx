import React, { useState, useCallback } from 'react';
import { Share2, Link2, Check, Camera } from 'lucide-react';
import { ValidatedAssessmentResults } from '../../lib/validation';
import { FUNCTION_DESCRIPTIONS } from '../../data/questions';

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
    return `${window.location.origin}/#/share/${shareSlug}`;
  }, [shareSlug]);

  const shareOnTwitter = useCallback(() => {
    const dominantFunc = results.stack.dominant.function;
    const funcTitle = FUNCTION_DESCRIPTIONS[dominantFunc]?.title || dominantFunc;
    const text = `I just discovered my dominant cognitive function is ${funcTitle} (${dominantFunc})! Take the Jungian Typology Assessment to discover yours.`;
    const url = getShareUrl();
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    );
  }, [results, getShareUrl]);

  const shareOnFacebook = useCallback(() => {
    const url = getShareUrl();
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    );
  }, [getShareUrl]);

  const shareOnLinkedIn = useCallback(() => {
    const url = getShareUrl();
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    );
  }, [getShareUrl]);

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
    <div className="mt-8">
      <div className="flex items-center justify-center gap-2 mb-5">
        <Share2 className="w-5 h-5 text-jung-accent" />
        <span className="text-ui text-sm font-medium text-jung-muted font-serif">Share Your Results</span>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={shareOnTwitter}
          className="flex items-center gap-2 px-5 py-3 bg-jung-dark text-white rounded-lg hover:-translate-y-px hover:shadow-md transition-all text-sm font-medium min-h-[48px]"
          aria-label="Share on Twitter"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Twitter/X
        </button>
        <button
          onClick={shareOnFacebook}
          className="flex items-center gap-2 px-5 py-3 bg-[#1877F2] text-white rounded-lg hover:-translate-y-px hover:shadow-md transition-all text-sm font-medium min-h-[48px]"
          aria-label="Share on Facebook"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>
        <button
          onClick={shareOnLinkedIn}
          className="flex items-center gap-2 px-5 py-3 bg-[#0A66C2] text-white rounded-lg hover:-translate-y-px hover:shadow-md transition-all text-sm font-medium min-h-[48px]"
          aria-label="Share on LinkedIn"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </button>
        <button
          onClick={copyLink}
          className="flex items-center gap-2 px-5 py-3 bg-jung-surface text-jung-dark rounded-lg hover:-translate-y-px hover:shadow-md transition-all text-sm font-medium border border-jung-border min-h-[48px]"
          aria-label={linkCopied ? 'Link copied' : 'Copy link'}
        >
          {linkCopied ? (
            <>
              <Check className="w-4 h-4 text-jung-accent" />
              <span className="text-jung-accent">Copied!</span>
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" />
              Copy Link
            </>
          )}
        </button>
        <button
          onClick={onInstagramClick}
          className="flex items-center gap-2 px-5 py-3 bg-jung-accent text-white rounded-lg hover:bg-jung-accent-hover hover:-translate-y-px hover:shadow-md transition-all text-sm font-medium min-h-[48px]"
          aria-label="Share to Instagram Story"
        >
          <Camera className="w-4 h-4" />
          Share to Story
        </button>
      </div>
    </div>
  );
};
