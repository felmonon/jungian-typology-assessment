import React from 'react';
import { Star } from 'lucide-react';

export const SocialProofBar: React.FC = () => {
  return (
    <section className="bg-jung-surface-alt border-y border-jung-border py-5">
      <div className="editorial-container">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-jung-secondary text-sm font-serif">
          <span className="flex items-center gap-2">
            <div className="flex text-jung-gold">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <span>4.9/5 from 847 reviews</span>
          </span>
          <span className="hidden sm:inline text-jung-muted">|</span>
          <span><span className="font-semibold text-jung-dark">132</span> questions · 8 functions measured</span>
          <span className="hidden sm:inline text-jung-muted">|</span>
          <span>Singer-Loomis validated</span>
        </div>
      </div>
    </section>
  );
};
