import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

const MIN_DISPLAY_COUNT = 20;

export const SocialProofBar: React.FC = () => {
  const [mapCount, setMapCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/leaderboard')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!cancelled && typeof data?.total === 'number') {
          setMapCount(Math.max(data.total, MIN_DISPLAY_COUNT));
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="bg-jung-surface-alt border-y border-jung-border py-5">
      <div className="editorial-container">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-jung-secondary text-sm font-serif">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-jung-accent" />
            <span>Free map before payment</span>
          </span>
          <span className="hidden sm:inline text-jung-muted">|</span>
          {mapCount !== null ? (
            <span><span className="font-semibold text-jung-dark">{mapCount}+</span> function maps generated</span>
          ) : (
            <span><span className="font-semibold text-jung-dark">42</span> questions · 8 functions mapped</span>
          )}
          <span className="hidden sm:inline text-jung-muted">|</span>
          <span>One-time CAD upgrades</span>
        </div>
      </div>
    </section>
  );
};
