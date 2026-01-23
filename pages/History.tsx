import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { FunctionScore, Stack } from '../types';
import { FUNCTION_DESCRIPTIONS } from '../data/questions';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/use-auth';
import {
  History as HistoryIcon,
  Loader2,
  Trash2,
  GitCompare,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  CheckSquare,
  Square,
  ArrowRight,
  Eye
} from 'lucide-react';

interface SavedResult {
  id: string;
  scores: FunctionScore[];
  stack: Stack;
  attitudeScore: string;
  isUndifferentiated: string;
  shareSlug: string | null;
  createdAt: string;
}

export const History: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [historyResults, setHistoryResults] = useState<SavedResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/results', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setHistoryResults(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated, fetchHistory]);

  const deleteResult = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/results/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setHistoryResults(prev => prev.filter(r => r.id !== id));
        setSelectedResults(prev => prev.filter(sid => sid !== id));
      }
    } catch (error) {
      console.error('Failed to delete result:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedResults(prev => {
      if (prev.includes(id)) {
        return prev.filter(sid => sid !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const clearComparison = () => {
    setCompareMode(false);
    setSelectedResults([]);
  };

  const viewResult = (result: SavedResult) => {
    const resultsData = {
      scores: result.scores,
      stack: result.stack,
      attitudeScore: result.attitudeScore,
      isUndifferentiated: result.isUndifferentiated
    };
    localStorage.setItem('jungian_assessment_result', JSON.stringify(resultsData));
    navigate('/results');
  };

  const getSelectedResultObjects = () => {
    return selectedResults
      .map(id => historyResults.find(r => r.id === id))
      .filter((r): r is SavedResult => r !== undefined);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jung-surface">
        <Loader2 className="w-8 h-8 animate-spin text-jung-accent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const selectedResultObjects = getSelectedResultObjects();
  const showComparison = compareMode && selectedResultObjects.length === 2;

  return (
    <div className="editorial-container py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-jung-accent/10 mb-5">
          <HistoryIcon className="w-8 h-8 text-jung-accent" />
        </div>
        <h1 className="text-display text-3xl sm:text-4xl mb-4">
          Assessment History
        </h1>
        <p className="text-jung-secondary max-w-xl mx-auto leading-relaxed">
          View your past assessment results and track how your cognitive function profile has evolved over time.
        </p>
      </div>

      {/* Comparison View */}
      {showComparison && (
        <ComparisonView
          results={selectedResultObjects}
          onClear={clearComparison}
          formatDate={formatDate}
        />
      )}

      {/* Results table */}
      <div className="card-elevated rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-jung-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-serif font-bold text-jung-text">Your Results</h2>
          <div className="flex gap-3 flex-wrap">
            {selectedResults.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearComparison}
              >
                <X className="w-4 h-4 mr-1" />
                Clear Selection
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              disabled={selectedResults.length !== 2}
              onClick={() => setCompareMode(true)}
            >
              <GitCompare className="w-4 h-4 mr-1" />
              Compare Selected ({selectedResults.length}/2)
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-jung-accent mx-auto" />
            <p className="text-jung-muted mt-3">Loading your history...</p>
          </div>
        ) : historyResults.length === 0 ? (
          <div className="p-12 text-center">
            <HistoryIcon className="w-12 h-12 text-jung-border mx-auto mb-4" />
            <p className="text-jung-muted mb-4">No assessment results yet.</p>
            <Button onClick={() => navigate('/assessment')}>
              Take Your First Assessment
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-jung-border/50">
            {historyResults.map((result) => {
              const isSelected = selectedResults.includes(result.id);
              const dominantFunc = result.stack.dominant.function;
              const funcTitle = FUNCTION_DESCRIPTIONS[dominantFunc]?.title || dominantFunc;

              return (
                <div
                  key={result.id}
                  className={`p-5 flex items-center gap-4 transition-colors ${
                    isSelected ? 'bg-jung-accent/5' : 'hover:bg-jung-surface'
                  }`}
                >
                  <button
                    onClick={() => toggleSelection(result.id)}
                    className="flex-shrink-0 text-jung-accent hover:text-jung-text transition-colors"
                    title={isSelected ? 'Deselect' : 'Select for comparison'}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-6 h-6" />
                    ) : (
                      <Square className="w-6 h-6" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif font-bold text-jung-text">{funcTitle}</span>
                      <span className="text-xs font-sans font-medium bg-jung-accent/10 text-jung-accent px-2 py-0.5 rounded">
                        {dominantFunc}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-jung-muted">
                      <Calendar className="w-4 h-4" />
                      {formatDate(result.createdAt)}
                    </div>
                  </div>

                  <div className="hidden sm:flex gap-2 text-xs">
                    {result.scores.slice(0, 4).map(score => (
                      <span
                        key={score.function}
                        className="bg-jung-surface text-jung-secondary px-2 py-1 rounded font-sans"
                      >
                        {score.function}: {score.score}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => viewResult(result)}
                    className="flex-shrink-0 text-jung-accent hover:text-jung-text transition-colors"
                    title="View full result"
                  >
                    <Eye className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => deleteResult(result.id)}
                    disabled={deletingId === result.id}
                    className="flex-shrink-0 text-jung-muted hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Delete result"
                  >
                    {deletingId === result.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {historyResults.length > 0 && (
        <p className="text-center text-sm text-jung-muted mt-5">
          Click the eye icon to view a result, or select 2 results to compare changes over time.
        </p>
      )}
    </div>
  );
};

interface ComparisonViewProps {
  results: SavedResult[];
  onClear: () => void;
  formatDate: (date: string) => string;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ results, onClear, formatDate }) => {
  const [result1, result2] = results;

  const chartData = result1.scores.map(score1 => {
    const score2 = result2.scores.find(s => s.function === score1.function);
    return {
      subject: score1.function,
      Result1: score1.score,
      Result2: score2?.score || 0,
      fullMark: 100,
    };
  });

  const getScoreChange = (func: string) => {
    const score1 = result1.scores.find(s => s.function === func)?.score || 0;
    const score2 = result2.scores.find(s => s.function === func)?.score || 0;
    return score2 - score1;
  };

  const ChangeIndicator = ({ change }: { change: number }) => {
    if (change > 0) {
      return (
        <span className="flex items-center gap-1 text-emerald-600 font-medium">
          <TrendingUp className="w-4 h-4" />
          +{change}
        </span>
      );
    }
    if (change < 0) {
      return (
        <span className="flex items-center gap-1 text-red-500 font-medium">
          <TrendingDown className="w-4 h-4" />
          {change}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-jung-muted font-medium">
        <Minus className="w-4 h-4" />
        0
      </span>
    );
  };

  const dominant1 = result1.stack.dominant.function;
  const dominant2 = result2.stack.dominant.function;
  const dominantChanged = dominant1 !== dominant2;

  return (
    <div className="card-elevated rounded-2xl mb-8 overflow-hidden">
      <div className="p-5 border-b border-jung-border flex justify-between items-center">
        <h2 className="text-xl font-serif font-bold text-jung-text flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-jung-accent" />
          Comparison Results
        </h2>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="w-4 h-4 mr-1" />
          Clear Comparison
        </Button>
      </div>

      <div className="p-6">
        {/* Result cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-jung-accent/5 rounded-xl p-4 border-l-4 border-jung-accent">
            <p className="text-xs text-jung-muted uppercase tracking-widest mb-1 font-sans">Earlier Result</p>
            <p className="font-serif font-bold text-jung-text">
              {FUNCTION_DESCRIPTIONS[dominant1]?.title || dominant1}
            </p>
            <p className="text-sm text-jung-secondary flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(result1.createdAt)}
            </p>
          </div>
          <div className="bg-jung-text/5 rounded-xl p-4 border-l-4 border-jung-text">
            <p className="text-xs text-jung-muted uppercase tracking-widest mb-1 font-sans">Later Result</p>
            <p className="font-serif font-bold text-jung-text">
              {FUNCTION_DESCRIPTIONS[dominant2]?.title || dominant2}
            </p>
            <p className="text-sm text-jung-secondary flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(result2.createdAt)}
            </p>
          </div>
        </div>

        {/* Dominant change alert */}
        {dominantChanged && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="text-amber-700 font-bold text-sm flex items-center gap-2 flex-wrap">
              Dominant Function Changed:
              <span className="bg-jung-accent/20 text-jung-accent px-2 py-0.5 rounded">{dominant1}</span>
              <ArrowRight className="w-4 h-4" />
              <span className="bg-jung-text/20 text-jung-text px-2 py-0.5 rounded">{dominant2}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar chart */}
          <div className="bg-jung-surface rounded-xl p-4">
            <h3 className="text-center font-sans font-bold text-jung-secondary mb-4 text-sm uppercase tracking-widest">
              Overlaid Radar Comparison
            </h3>
            <div className="h-[300px] sm:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid stroke="#E8E4DE" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#3D2914', fontSize: 12, fontWeight: 'bold' }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Earlier"
                    dataKey="Result1"
                    stroke="#B87333"
                    strokeWidth={2}
                    fill="#B87333"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Later"
                    dataKey="Result2"
                    stroke="#3D2914"
                    strokeWidth={2}
                    fill="#3D2914"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score changes table */}
          <div>
            <h3 className="font-sans font-bold text-jung-secondary mb-4 text-sm uppercase tracking-widest">
              Score Changes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-jung-border">
                    <th className="text-left py-2 px-3 font-bold text-jung-text">Function</th>
                    <th className="text-center py-2 px-3 font-bold text-jung-accent">Earlier</th>
                    <th className="text-center py-2 px-3 font-bold text-jung-text">Later</th>
                    <th className="text-center py-2 px-3 font-bold text-jung-secondary">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {result1.scores.map(score1 => {
                    const score2 = result2.scores.find(s => s.function === score1.function);
                    const change = getScoreChange(score1.function);

                    return (
                      <tr
                        key={score1.function}
                        className="border-b border-jung-border/50 hover:bg-jung-surface"
                      >
                        <td className="py-2 px-3">
                          <span className="font-medium text-jung-text">
                            {FUNCTION_DESCRIPTIONS[score1.function]?.title?.split(' ')[0] || score1.function}
                          </span>
                          <span className="text-jung-muted ml-1 text-xs">({score1.function})</span>
                        </td>
                        <td className="text-center py-2 px-3 font-mono text-jung-accent">
                          {score1.score}
                        </td>
                        <td className="text-center py-2 px-3 font-mono text-jung-text">
                          {score2?.score || 0}
                        </td>
                        <td className="text-center py-2 px-3">
                          <ChangeIndicator change={change} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 bg-jung-surface rounded-xl text-xs text-jung-secondary">
              <p>
                <strong>Note:</strong> Score changes may reflect natural variation, personal growth,
                or shifts in conscious awareness. Large changes over short periods may indicate
                stress responses or heightened self-awareness.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
