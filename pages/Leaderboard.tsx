import React, { useEffect, useState } from 'react';
import { Trophy, Users, BarChart3, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  function: string;
  count: number;
  title: string;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  total: number;
}

const FUNCTION_COLORS: Record<string, string> = {
  Te: 'bg-jung-accent',
  Ti: 'bg-jung-dark',
  Fe: 'bg-jung-accent/80',
  Fi: 'bg-jung-secondary',
  Se: 'bg-jung-accent/60',
  Si: 'bg-jung-muted',
  Ne: 'bg-jung-accent/70',
  Ni: 'bg-jung-dark/80',
};

const FUNCTION_BG_COLORS: Record<string, string> = {
  Te: 'bg-jung-accent/10 text-jung-accent',
  Ti: 'bg-jung-dark/10 text-jung-dark',
  Fe: 'bg-jung-accent/10 text-jung-accent',
  Fi: 'bg-jung-secondary/10 text-jung-secondary',
  Se: 'bg-jung-accent/10 text-jung-accent',
  Si: 'bg-jung-muted/20 text-jung-muted',
  Ne: 'bg-jung-accent/10 text-jung-accent',
  Ni: 'bg-jung-dark/10 text-jung-dark',
};

export const Leaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="editorial-container py-12">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jung-accent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="editorial-container py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const maxCount = data?.leaderboard[0]?.count || 1;

  return (
    <div className="editorial-container py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-block p-3 rounded-full bg-jung-accent/10 mb-4">
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-jung-accent" />
        </div>
        <h1 className="text-display text-jung-dark mb-4">
          Community Leaderboard
        </h1>
        <p className="text-base sm:text-lg text-jung-secondary max-w-2xl mx-auto px-2 font-body">
          Discover the distribution of dominant cognitive functions across our community of self-explorers.
        </p>
      </div>

      <div className="card-elevated rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-3 text-center">
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-jung-accent" />
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-jung-dark font-serif">{data?.total || 0}</p>
            <p className="text-xs sm:text-sm text-jung-muted font-sans">Total Assessments Completed</p>
          </div>
        </div>
      </div>

      {data && data.leaderboard.length > 0 && (
        <div className="bg-jung-accent/5 rounded-2xl border border-jung-accent/20 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <TrendingUp className="w-5 h-5 text-jung-accent" />
            <h2 className="text-base sm:text-lg font-serif font-bold text-jung-dark">Most Common Dominant Functions</h2>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {data.leaderboard.slice(0, 3).map((entry, index) => (
              <div
                key={entry.function}
                className="flex items-center gap-2 bg-jung-surface rounded-full px-4 py-2 shadow-sm border border-jung-border"
              >
                <span className="text-lg font-bold text-jung-accent font-serif">#{index + 1}</span>
                <span className={`px-2 py-1 rounded-lg text-sm font-bold font-sans ${FUNCTION_BG_COLORS[entry.function] || 'bg-jung-surface text-jung-muted'}`}>
                  {entry.function}
                </span>
                <span className="text-jung-secondary text-sm font-body">{entry.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-elevated rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-jung-border flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-jung-accent" />
          <h2 className="text-lg font-serif font-bold text-jung-dark">Function Distribution</h2>
        </div>

        {!data || data.leaderboard.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-jung-accent/10 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-jung-accent/50" />
            </div>
            <h3 className="text-lg font-semibold text-jung-dark mb-2 font-serif">Building Our Community</h3>
            <p className="text-jung-muted mb-6 max-w-md mx-auto font-body">
              Be among the first to complete the assessment and help establish the community baseline for cognitive function distribution.
            </p>
            <a
              href="/assessment"
              className="inline-flex items-center gap-2 px-6 py-3 bg-jung-accent text-white font-medium rounded-xl hover:bg-jung-accent/90 transition-colors font-sans"
            >
              Take the Assessment
            </a>
          </div>
        ) : (
          <div className="divide-y divide-jung-border">
            {data.leaderboard.map((entry, index) => {
              const percentage = (entry.count / (data.total || 1)) * 100;
              const barWidth = (entry.count / maxCount) * 100;

              return (
                <div key={entry.function} className="px-6 py-4 hover:bg-jung-surface transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-jung-surface flex items-center justify-center font-bold text-jung-muted font-sans">
                      {index + 1}
                    </div>

                    <div className={`px-3 py-1.5 rounded-lg font-bold text-sm font-sans ${FUNCTION_BG_COLORS[entry.function] || 'bg-jung-surface text-jung-muted'}`}>
                      {entry.function}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-jung-dark truncate font-body">{entry.title}</p>
                      <div className="mt-2 h-2 bg-jung-surface rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${FUNCTION_COLORS[entry.function] || 'bg-jung-muted'}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-jung-dark font-serif">{entry.count}</p>
                      <p className="text-xs text-jung-muted font-sans">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-sm text-jung-muted font-body">
        <p>Data updates in real-time as new assessments are completed.</p>
      </div>
    </div>
  );
};
