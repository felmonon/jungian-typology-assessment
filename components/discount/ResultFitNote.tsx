import React, { useEffect, useState } from 'react';

// Aggregate answer to "Did this map name something real?" from the free
// result. The server hides it until enough people have answered, and returns
// only a percentage and a count. Lives beside the email capture card because
// both sit on the path from free map to checkout.

export const RESULT_FIT_STATS_URL = '/api/create-checkout-session?view=result-fit';

type ResultFitStats = { show: true; percentYes: number; total: number } | { show: false };

let cachedRequest: Promise<ResultFitStats> | null = null;

export function resetResultFitRequestCache() {
  cachedRequest = null;
}

export function parseResultFitStats(value: unknown): ResultFitStats {
  if (!value || typeof value !== 'object') return { show: false };
  const input = value as Record<string, unknown>;
  const percentYes = input.percentYes;
  const total = input.total;
  if (
    input.show !== true ||
    typeof percentYes !== 'number' || !Number.isFinite(percentYes) || percentYes < 0 || percentYes > 100 ||
    typeof total !== 'number' || !Number.isInteger(total) || total < 20
  ) {
    return { show: false };
  }
  return { show: true, percentYes: Math.round(percentYes), total };
}

function loadResultFitStats(): Promise<ResultFitStats> {
  if (!cachedRequest) {
    cachedRequest = (async () => {
      try {
        const response = await fetch(RESULT_FIT_STATS_URL, { headers: { Accept: 'application/json' } });
        if (!response?.ok) return { show: false } as const;
        return parseResultFitStats(await response.json());
      } catch {
        return { show: false } as const;
      }
    })();
  }
  return cachedRequest;
}

export const ResultFitNote: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [stats, setStats] = useState<ResultFitStats>({ show: false });

  useEffect(() => {
    let active = true;
    void loadResultFitStats().then((next) => {
      if (active) setStats(next);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!stats.show) return null;

  return (
    <p className={`text-xs leading-5 text-jung-secondary ${className}`}>
      <span className="font-semibold text-jung-dark">{stats.percentYes}%</span> of{' '}
      {stats.total.toLocaleString('en-CA')} people who rated their free map said it named
      something real.
    </p>
  );
};
