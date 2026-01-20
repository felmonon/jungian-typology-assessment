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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-jung-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const selectedResultObjects = getSelectedResultObjects();
  const showComparison = compareMode && selectedResultObjects.length === 2;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-jung-dark mb-3 flex items-center justify-center gap-3">
          <HistoryIcon className="w-8 h-8 text-jung-primary" />
          Assessment History
        </h1>
        <p className="text-stone-600 max-w-xl mx-auto">
          View your past assessment results and track how your cognitive function profile has evolved over time.
        </p>
      </div>

      {showComparison && (
        <ComparisonView 
          results={selectedResultObjects} 
          onClear={clearComparison}
          formatDate={formatDate}
        />
      )}

      <div className="bg-white rounded-lg border border-stone-200 shadow-sm">
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg font-bold text-jung-dark">Your Results</h2>
          <div className="flex gap-2 flex-wrap">
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
            <Loader2 className="w-8 h-8 animate-spin text-jung-primary mx-auto" />
            <p className="text-stone-500 mt-3">Loading your history...</p>
          </div>
        ) : historyResults.length === 0 ? (
          <div className="p-12 text-center">
            <HistoryIcon className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500 mb-4">No assessment results yet.</p>
            <Button onClick={() => navigate('/assessment')}>
              Take Your First Assessment
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {historyResults.map((result) => {
              const isSelected = selectedResults.includes(result.id);
              const dominantFunc = result.stack.dominant.function;
              const funcTitle = FUNCTION_DESCRIPTIONS[dominantFunc]?.title || dominantFunc;
              
              return (
                <div
                  key={result.id}
                  className={`p-4 flex items-center gap-4 transition-colors ${
                    isSelected ? 'bg-jung-primary/5' : 'hover:bg-stone-50'
                  }`}
                >
                  <button
                    onClick={() => toggleSelection(result.id)}
                    className="flex-shrink-0 text-jung-primary hover:text-jung-accent transition-colors"
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
                      <span className="font-bold text-jung-dark">{funcTitle}</span>
                      <span className="text-xs font-mono bg-jung-primary/10 text-jung-primary px-2 py-0.5 rounded">
                        {dominantFunc}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <Calendar className="w-4 h-4" />
                      {formatDate(result.createdAt)}
                    </div>
                  </div>

                  <div className="hidden sm:flex gap-2 text-xs">
                    {result.scores.slice(0, 4).map(score => (
                      <span 
                        key={score.function}
                        className="bg-stone-100 text-stone-600 px-2 py-1 rounded"
                      >
                        {score.function}: {score.score}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => viewResult(result)}
                    className="flex-shrink-0 text-jung-primary hover:text-jung-accent transition-colors"
                    title="View full result"
                  >
                    <Eye className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => deleteResult(result.id)}
                    disabled={deletingId === result.id}
                    className="flex-shrink-0 text-stone-400 hover:text-red-500 transition-colors disabled:opacity-50"
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
        <p className="text-center text-sm text-stone-500 mt-4">
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
      <span className="flex items-center gap-1 text-stone-400 font-medium">
        <Minus className="w-4 h-4" />
        0
      </span>
    );
  };

  const dominant1 = result1.stack.dominant.function;
  const dominant2 = result2.stack.dominant.function;
  const dominantChanged = dominant1 !== dominant2;

  return (
    <div className="bg-white rounded-lg border border-stone-200 shadow-sm mb-8">
      <div className="p-4 border-b border-stone-200 flex justify-between items-center">
        <h2 className="text-xl font-serif font-bold text-jung-dark flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-jung-primary" />
          Comparison Results
        </h2>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="w-4 h-4 mr-1" />
          Clear Comparison
        </Button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-jung-primary/5 rounded-lg p-4 border-l-4 border-jung-primary">
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Earlier Result</p>
            <p className="font-bold text-jung-dark">
              {FUNCTION_DESCRIPTIONS[dominant1]?.title || dominant1}
            </p>
            <p className="text-sm text-stone-600 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(result1.createdAt)}
            </p>
          </div>
          <div className="bg-jung-accent/5 rounded-lg p-4 border-l-4 border-jung-accent">
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Later Result</p>
            <p className="font-bold text-jung-dark">
              {FUNCTION_DESCRIPTIONS[dominant2]?.title || dominant2}
            </p>
            <p className="text-sm text-stone-600 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(result2.createdAt)}
            </p>
          </div>
        </div>

        {dominantChanged && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <div className="text-amber-600 font-bold text-sm flex items-center gap-2">
              Dominant Function Changed:
              <span className="bg-jung-primary/20 text-jung-primary px-2 py-0.5 rounded">{dominant1}</span>
              <ArrowRight className="w-4 h-4" />
              <span className="bg-jung-accent/20 text-jung-accent px-2 py-0.5 rounded">{dominant2}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-stone-50 rounded-lg p-4">
            <h3 className="text-center font-bold text-jung-secondary mb-4 text-sm uppercase tracking-wider">
              Overlaid Radar Comparison
            </h3>
            <div className="h-[300px] sm:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid stroke="#e7e5e4" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#451a03', fontSize: 12, fontWeight: 'bold' }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Earlier"
                    dataKey="Result1"
                    stroke="#b45309"
                    strokeWidth={2}
                    fill="#b45309"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Later"
                    dataKey="Result2"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fill="#0ea5e9"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-jung-secondary mb-4 text-sm uppercase tracking-wider">
              Score Changes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-2 px-3 font-bold text-stone-700">Function</th>
                    <th className="text-center py-2 px-3 font-bold text-jung-primary">Earlier</th>
                    <th className="text-center py-2 px-3 font-bold text-sky-600">Later</th>
                    <th className="text-center py-2 px-3 font-bold text-stone-700">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {result1.scores.map(score1 => {
                    const score2 = result2.scores.find(s => s.function === score1.function);
                    const change = getScoreChange(score1.function);
                    
                    return (
                      <tr 
                        key={score1.function}
                        className="border-b border-stone-100 hover:bg-stone-50"
                      >
                        <td className="py-2 px-3">
                          <span className="font-medium text-stone-700">
                            {FUNCTION_DESCRIPTIONS[score1.function]?.title?.split(' ')[0] || score1.function}
                          </span>
                          <span className="text-stone-400 ml-1 text-xs">({score1.function})</span>
                        </td>
                        <td className="text-center py-2 px-3 font-mono text-jung-primary">
                          {score1.score}
                        </td>
                        <td className="text-center py-2 px-3 font-mono text-sky-600">
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

            <div className="mt-4 p-3 bg-stone-100 rounded-lg text-xs text-stone-600">
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
