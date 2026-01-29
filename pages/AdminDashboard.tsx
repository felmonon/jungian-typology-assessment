import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, BarChart3, FileText, Settings, Filter, ChevronDown, ChevronUp, DollarSign, TrendingUp, PieChart, Activity } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { questions, FUNCTION_DESCRIPTIONS, STACK_POSITIONS } from '../data/questions';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { FunctionAttitude } from '../types';

interface AdminStats {
  userCount: number;
  assessmentCount: number;
}

interface AnalyticsData {
  popularTypes: { type: string; count: number }[];
  dailyAssessments: { date: string; count: number }[];
  totalThisWeek: number;
  totalLastWeek: number;
  totalThisMonth: number;
}

const FUNCTION_COLORS: Record<string, string> = {
  Te: '#3b82f6',
  Ti: '#06b6d4',
  Fe: '#ec4899',
  Fi: '#f43f5e',
  Se: '#f97316',
  Si: '#eab308',
  Ne: '#84cc16',
  Ni: '#8b5cf6',
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [functionFilter, setFunctionFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedFunction, setExpandedFunction] = useState<string | null>(null);
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchStats();
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesFunction = functionFilter === 'all' || q.target === functionFilter;
    const matchesCategory = categoryFilter === 'all' || q.category === categoryFilter;
    return matchesFunction && matchesCategory;
  });

  const functions: (FunctionAttitude | 'E' | 'I')[] = ['Te', 'Ti', 'Fe', 'Fi', 'Se', 'Si', 'Ne', 'Ni', 'E', 'I'];
  const categories = ['A', 'B', 'C'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-jung-muted">Loading...</div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-jung-primary" />
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-jung-primary">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-jung-border p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <h3 className="text-xs sm:text-sm font-medium text-jung-muted">Total Users</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-jung-dark">
            {statsLoading ? '...' : stats?.userCount ?? 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-jung-border p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <h3 className="text-xs sm:text-sm font-medium text-jung-muted">Total Assessments</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-jung-dark">
            {statsLoading ? '...' : stats?.assessmentCount ?? 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-jung-border p-4 sm:p-6 sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            <h3 className="text-xs sm:text-sm font-medium text-jung-muted">Revenue (Mock)</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-jung-dark">$1,234</p>
          <p className="text-xs text-jung-muted mt-1">Coming soon</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-jung-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-jung-primary" />
            <h2 className="text-xl font-serif font-semibold text-jung-dark">Popular Types</h2>
          </div>
          {analyticsLoading ? (
            <div className="animate-pulse text-jung-muted">Loading...</div>
          ) : analytics?.popularTypes && analytics.popularTypes.length > 0 ? (
            <div className="space-y-3">
              {analytics.popularTypes.slice(0, 8).map((item, index) => {
                const total = analytics.popularTypes.reduce((sum, t) => sum + t.count, 0);
                const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                const color = FUNCTION_COLORS[item.type] || '#6b7280';
                return (
                  <div key={item.type} className="flex items-center gap-3">
                    <span className="w-8 text-sm font-medium text-jung-muted">#{index + 1}</span>
                    <span 
                      className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white min-w-[36px] text-center"
                      style={{ backgroundColor: color }}
                    >
                      {item.type}
                    </span>
                    <div className="flex-1 bg-jung-surface-alt rounded-lg h-4 overflow-hidden">
                      <div
                        className="h-full rounded-lg transition-all duration-300"
                        style={{ width: `${percentage}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="text-sm text-jung-secondary min-w-[60px] text-right">
                      {item.count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-jung-muted">No data available</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-jung-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-jung-primary" />
            <h2 className="text-xl font-serif font-semibold text-jung-dark">Engagement Metrics</h2>
          </div>
          {analyticsLoading ? (
            <div className="animate-pulse text-jung-muted">Loading...</div>
          ) : analytics ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-jung-surface rounded-lg p-4">
                  <p className="text-sm text-jung-muted mb-1">This Week</p>
                  <p className="text-2xl font-bold text-jung-dark">{analytics.totalThisWeek}</p>
                  {analytics.totalLastWeek > 0 && (
                    <p className={`text-xs mt-1 ${
                      analytics.totalThisWeek >= analytics.totalLastWeek ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {analytics.totalThisWeek >= analytics.totalLastWeek ? '↑' : '↓'}{' '}
                      {Math.abs(((analytics.totalThisWeek - analytics.totalLastWeek) / analytics.totalLastWeek) * 100).toFixed(0)}% vs last week
                    </p>
                  )}
                </div>
                <div className="bg-jung-surface rounded-lg p-4">
                  <p className="text-sm text-jung-muted mb-1">This Month</p>
                  <p className="text-2xl font-bold text-jung-dark">{analytics.totalThisMonth}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-jung-muted" />
                  <p className="text-sm font-medium text-jung-secondary">Daily Trend (Last 7 Days)</p>
                </div>
                {analytics.dailyAssessments.length > 0 ? (
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.dailyAssessments}>
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          formatter={(value: number) => [value, 'Assessments']}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-jung-muted">No recent data</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-jung-muted">No data available</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-jung-border p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-jung-primary" />
            <h2 className="text-lg sm:text-xl font-serif font-semibold text-jung-dark">Questions Management</h2>
            <span className="text-xs sm:text-sm text-jung-muted">({filteredQuestions.length})</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-jung-muted" />
              <select
                value={functionFilter}
                onChange={(e) => setFunctionFilter(e.target.value)}
                className="text-sm border border-jung-border rounded-md px-2 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-jung-primary"
              >
                <option value="all">All Functions</option>
                {functions.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm border border-jung-border rounded-md px-2 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-jung-primary"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>Category {c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile: Card layout */}
        <div className="block sm:hidden space-y-3">
          {filteredQuestions.slice(0, 20).map(q => (
            <div key={q.id} className="p-3 border border-jung-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  q.category === 'A' ? 'bg-green-100 text-green-700' :
                  q.category === 'B' ? 'bg-jung-accent-light text-jung-accent' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {q.category}
                </span>
                <span className="inline-block px-2 py-0.5 rounded bg-jung-primary/10 text-jung-primary text-xs font-medium">
                  {q.target}
                </span>
                <span className="text-xs text-jung-muted font-mono">{q.id}</span>
              </div>
              <p className="text-sm text-jung-dark">{q.text}</p>
            </div>
          ))}
          {filteredQuestions.length > 20 && (
            <p className="text-center text-sm text-jung-muted py-2">
              Showing 20 of {filteredQuestions.length} questions
            </p>
          )}
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[600px] sm:min-w-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-jung-border">
                  <th className="text-left py-3 px-2 font-medium text-jung-secondary">ID</th>
                  <th className="text-left py-3 px-2 font-medium text-jung-secondary">Category</th>
                  <th className="text-left py-3 px-2 font-medium text-jung-secondary">Target</th>
                  <th className="text-left py-3 px-2 font-medium text-jung-secondary">Question Text</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map(q => (
                  <tr key={q.id} className="border-b border-jung-border hover:bg-jung-surface">
                    <td className="py-3 px-2 font-mono text-xs text-jung-muted">{q.id}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        q.category === 'A' ? 'bg-green-100 text-green-700' :
                        q.category === 'B' ? 'bg-jung-accent-light text-jung-accent' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {q.category}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-block px-2 py-0.5 rounded bg-jung-primary/10 text-jung-primary text-xs font-medium">
                        {q.target}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-jung-dark max-w-md truncate">{q.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-jung-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-jung-primary" />
            <h2 className="text-xl font-serif font-semibold text-jung-dark">Function Descriptions</h2>
          </div>
          <div className="space-y-2">
            {Object.entries(FUNCTION_DESCRIPTIONS).map(([key, desc]) => (
              <div key={key} className="border border-jung-border rounded-lg">
                <button
                  onClick={() => setExpandedFunction(expandedFunction === key ? null : key)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-jung-surface"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2 py-0.5 rounded bg-jung-primary/10 text-jung-primary text-xs font-medium">
                      {key}
                    </span>
                    <span className="font-medium text-jung-dark">{desc.title}</span>
                  </div>
                  {expandedFunction === key ? (
                    <ChevronUp className="w-4 h-4 text-jung-muted" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-jung-muted" />
                  )}
                </button>
                {expandedFunction === key && (
                  <div className="px-3 pb-3 text-sm text-jung-secondary space-y-2">
                    <p><strong>Description:</strong> {desc.desc}</p>
                    <p><strong>Quote:</strong> <em>"{desc.quote}"</em></p>
                    <p><strong>Positive:</strong> {desc.positive}</p>
                    <p><strong>Negative:</strong> {desc.negative}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-jung-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-jung-primary" />
            <h2 className="text-xl font-serif font-semibold text-jung-dark">Stack Positions</h2>
          </div>
          <div className="space-y-2">
            {Object.entries(STACK_POSITIONS).map(([key, pos]) => (
              <div key={key} className="border border-jung-border rounded-lg">
                <button
                  onClick={() => setExpandedPosition(expandedPosition === key ? null : key)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-jung-surface"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-medium capitalize">
                      {key}
                    </span>
                    <span className="font-medium text-jung-dark">{pos.name} - {pos.archetype}</span>
                  </div>
                  {expandedPosition === key ? (
                    <ChevronUp className="w-4 h-4 text-jung-muted" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-jung-muted" />
                  )}
                </button>
                {expandedPosition === key && (
                  <div className="px-3 pb-3 text-sm text-jung-secondary space-y-2">
                    <p><strong>Description:</strong> {pos.description}</p>
                    <p><strong>Development:</strong> {pos.development}</p>
                    <p><strong>Shadow:</strong> {pos.shadow}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
