import React from 'react';
import { Star } from 'lucide-react';

export const SocialProofBar: React.FC = () => {
  return (
    <section className="bg-jung-dark py-5">
      <div className="editorial-container">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-white/90 text-sm font-sans">
          <span className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <span>4.9/5 from 847 reviews</span>
          </span>
          <span className="hidden sm:inline text-white/30">|</span>
          <span><span className="font-semibold">132</span> questions · 8 functions measured</span>
          <span className="hidden sm:inline text-white/30">|</span>
          <span>Singer-Loomis validated</span>
        </div>
      </div>
    </section>
  );
};
