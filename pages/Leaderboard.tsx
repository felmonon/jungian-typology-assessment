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
  Te: 'bg-blue-500',
  Ti: 'bg-blue-700',
  Fe: 'bg-pink-500',
  Fi: 'bg-pink-700',
  Se: 'bg-green-500',
  Si: 'bg-green-700',
  Ne: 'bg-purple-500',
  Ni: 'bg-purple-700',
};

const FUNCTION_BG_COLORS: Record<string, string> = {
  Te: 'bg-blue-100 text-blue-700',
  Ti: 'bg-blue-100 text-blue-800',
  Fe: 'bg-pink-100 text-pink-700',
  Fi: 'bg-pink-100 text-pink-800',
  Se: 'bg-green-100 text-green-700',
  Si: 'bg-green-100 text-green-800',
  Ne: 'bg-purple-100 text-purple-700',
  Ni: 'bg-purple-100 text-purple-800',
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jung-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const maxCount = data?.leaderboard[0]?.count || 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-block p-3 rounded-full bg-jung-primary/5 mb-4">
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-jung-accent" />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-jung-dark font-medium mb-4">
          Community Leaderboard
        </h1>
        <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto px-2">
          Discover the distribution of dominant cognitive functions across our community of self-explorers.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-3 text-center">
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-jung-primary" />
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-jung-dark">{data?.total || 0}</p>
            <p className="text-xs sm:text-sm text-stone-500">Total Assessments Completed</p>
          </div>
        </div>
      </div>

      {data && data.leaderboard.length > 0 && (
        <div className="bg-gradient-to-br from-jung-primary/5 to-jung-accent/5 rounded-lg border border-jung-primary/20 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <TrendingUp className="w-5 h-5 text-jung-accent" />
            <h2 className="text-base sm:text-lg font-serif font-bold text-jung-dark">Most Common Dominant Functions</h2>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {data.leaderboard.slice(0, 3).map((entry, index) => (
              <div
                key={entry.function}
                className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-stone-200"
              >
                <span className="text-lg font-bold text-jung-accent">#{index + 1}</span>
                <span className={`px-2 py-1 rounded text-sm font-bold ${FUNCTION_BG_COLORS[entry.function] || 'bg-stone-100 text-stone-700'}`}>
                  {entry.function}
                </span>
                <span className="text-stone-600 text-sm">{entry.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-jung-primary" />
          <h2 className="text-lg font-serif font-bold text-jung-dark">Function Distribution</h2>
        </div>
        
        {!data || data.leaderboard.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-jung-primary/10 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-jung-primary/50" />
            </div>
            <h3 className="text-lg font-semibold text-jung-dark mb-2">Building Our Community</h3>
            <p className="text-stone-500 mb-6 max-w-md mx-auto">
              Be among the first to complete the assessment and help establish the community baseline for cognitive function distribution.
            </p>
            <a
              href="/assessment"
              className="inline-flex items-center gap-2 px-6 py-3 bg-jung-accent text-white font-medium rounded-lg hover:bg-jung-accent/90 transition-colors"
            >
              Take the Assessment
            </a>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {data.leaderboard.map((entry, index) => {
              const percentage = (entry.count / (data.total || 1)) * 100;
              const barWidth = (entry.count / maxCount) * 100;
              
              return (
                <div key={entry.function} className="px-6 py-4 hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-600">
                      {index + 1}
                    </div>
                    
                    <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${FUNCTION_BG_COLORS[entry.function] || 'bg-stone-100 text-stone-700'}`}>
                      {entry.function}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-jung-dark truncate">{entry.title}</p>
                      <div className="mt-2 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${FUNCTION_COLORS[entry.function] || 'bg-stone-400'}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-jung-dark">{entry.count}</p>
                      <p className="text-xs text-stone-500">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-sm text-stone-500">
        <p>Data updates in real-time as new assessments are completed.</p>
      </div>
    </div>
  );
};
