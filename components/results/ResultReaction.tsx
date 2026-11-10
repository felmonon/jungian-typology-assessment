import { Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { trackEvent } from '../../lib/analytics';

// Lightweight reaction prompt seeded as analytics (and a trust signal). Kept as
// its own component so its hooks stay valid regardless of the parent's early
// returns. Stores the answer per-result so it is asked once.
export const ResultReaction: React.FC<{ completedAt: string }> = ({ completedAt }) => {
  const storageKey = `typejung_result_reaction_${completedAt}`;
  const [reaction, setReaction] = useState<string | null>(null);

  useEffect(() => {
    try {
      setReaction(localStorage.getItem(storageKey));
    } catch {
      /* storage unavailable */
    }
  }, [storageKey]);

  const submit = (value: 'yes' | 'somewhat' | 'not_yet') => {
    try {
      localStorage.setItem(storageKey, value);
    } catch {
      /* storage unavailable */
    }
    setReaction(value);
    trackEvent('result_reaction_submitted', { reaction: value });
  };

  const options: Array<{
    value: 'yes' | 'somewhat' | 'not_yet';
    label: string;
  }> = [
      { value: 'yes', label: 'Yes' },
      { value: 'somewhat', label: 'Somewhat' },
      { value: 'not_yet', label: 'Not yet' },
    ];

  return (
    <section className="mb-10 rounded-lg border border-jung-border bg-jung-surface p-5 shadow-sm sm:p-6">
      {reaction ? (
        <div className="flex items-start gap-3">
          <Check className="mt-0.5 h-5 w-5 flex-none text-jung-accent" />
          <div>
            <p className="text-sm font-semibold text-jung-dark">
              Thanks — that helps tune the map.
            </p>
            <p className="mt-1 text-sm leading-6 text-jung-secondary">
              {reaction === 'not_yet'
                ? 'If the map missed you, the dominant–inferior axis and reliability signal below are the best places to inspect why.'
                : 'Glad it named something real. Read the evidence layers below to see why the pattern resolved this way.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-jung-dark">
            Did this map name something real?
          </p>
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => submit(option.value)}
                className="rounded-full border border-jung-border bg-jung-base px-4 py-1.5 text-sm font-medium text-jung-dark transition-colors hover:border-jung-accent hover:text-jung-accent"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
