import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CreditCard, Shield, Users, BarChart3, FileText, Settings, Filter, ChevronDown, ChevronUp, DollarSign, TrendingUp, PieChart, Activity } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { questions, FUNCTION_DESCRIPTIONS, STACK_POSITIONS } from '../data/questions';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { FunctionAttitude } from '../types';

interface AdminStats {
  userCount: number;
  assessmentCount: number;
  purchaseCount?: number;
  uniquePayingCustomers?: number;
  payingCustomerGoal?: number;
  payingCustomerRemaining?: number;
  payingCustomerProgress?: number;
  revenueCad?: number;
  purchasesLast7Days?: number;
  insightPurchaseCount?: number;
  masteryPurchaseCount?: number;
  discountLeadCount?: number;
  rawDiscountLeadCount?: number;
  duplicateDiscountLeadCount?: number;
  recoverableLeadCount?: number;
  followupSentCount?: number;
  secondFollowupSentCount?: number;
  skippedPurchasedCount?: number;
  skippedInvalidEmailCount?: number;
  awaitingFollowupCount?: number;
  awaitingSecondFollowupCount?: number;
  unrecoverableLeadCount?: number;
  leadRecoveryCoverage?: number;
  followupCoverage?: number;
  secondFollowupCoverage?: number;
  leadsLast7Days?: number;
  checkoutIntentCount?: number;
  checkoutSessionsCreatedCount?: number;
  checkoutCompletedIntentCount?: number;
  checkoutExpiredIntentCount?: number;
  checkoutAbandonedIntentCount?: number;
  checkoutRecoverableAbandonedIntentCount?: number;
  checkoutUnrecoverableAbandonedIntentCount?: number;
  checkoutStripeFailureCount?: number;
  checkoutIntentsLast7Days?: number;
  checkoutEmailKnownIntentCount?: number;
  checkoutRecoveryConsentedIntentCount?: number;
  checkoutRecoveryConsentRate?: number;
  checkoutAbandonedRecoveryCoverage?: number;
  checkoutIntentCompletionRate?: number;
  checkoutIntentFailureRate?: number;
  topPurchaseSources?: { source: string; count: number; revenueCad: number }[];
  topPurchaseChains?: { sourceChain: string; count: number; revenueCad: number }[];
  topLeadSources?: { source: string; count: number; recoverableCount: number; awaitingFollowupCount: number; awaitingSecondFollowupCount: number; followupSentCount: number; secondFollowupSentCount: number; skippedPurchasedCount: number; skippedInvalidEmailCount: number }[];
  topCheckoutIntentSources?: { source: string; intentCount: number; stripeCreatedCount: number; completedCount: number; expiredCount: number; failedCount: number; recoverableAbandonedCount: number; unrecoverableAbandonedCount: number }[];
  topCheckoutIntentChains?: { sourceChain: string; intentCount: number; stripeCreatedCount: number; completedCount: number; expiredCount: number; failedCount: number; recoverableAbandonedCount: number; unrecoverableAbandonedCount: number }[];
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

const cadFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
});

const percentFormatter = new Intl.NumberFormat('en-CA', {
  style: 'percent',
  maximumFractionDigits: 0,
});

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
            <h3 className="text-xs sm:text-sm font-medium text-jung-muted">Revenue</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-jung-dark">
            {statsLoading ? '...' : cadFormatter.format(stats?.revenueCad ?? 0)}
          </p>
          <p className="text-xs text-jung-muted mt-1">
            {statsLoading ? 'Loading' : `${stats?.purchaseCount ?? 0} completed purchases`}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-jung-border p-6 mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-jung-primary" />
              <h2 className="text-xl font-serif font-semibold text-jung-dark">Checkout Funnel</h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-jung-secondary">
              Durable intent rows show whether buyers are reaching Stripe, failing before Stripe, or abandoning after the handoff.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[36rem]">
            <div className="rounded-lg bg-jung-surface px-4 py-3">
              <p className="text-xs text-jung-muted">Completion rate</p>
              <p className="mt-1 text-2xl font-bold text-jung-dark">
                {statsLoading ? '...' : percentFormatter.format(stats?.checkoutIntentCompletionRate ?? 0)}
              </p>
            </div>
            <div className="rounded-lg bg-jung-surface px-4 py-3">
              <p className="text-xs text-jung-muted">Abandoned recovery</p>
              <p className="mt-1 text-2xl font-bold text-jung-dark">
                {statsLoading ? '...' : percentFormatter.format(stats?.checkoutAbandonedRecoveryCoverage ?? 0)}
              </p>
            </div>
            <div className="rounded-lg bg-jung-surface px-4 py-3">
              <p className="text-xs text-jung-muted">Consent coverage</p>
              <p className="mt-1 text-2xl font-bold text-jung-dark">
                {statsLoading ? '...' : percentFormatter.format(stats?.checkoutRecoveryConsentRate ?? 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-8">
          {[
            { label: 'Buy clicks', value: stats?.checkoutIntentCount ?? 0 },
            { label: 'Stripe sessions', value: stats?.checkoutSessionsCreatedCount ?? 0 },
            { label: 'Paid', value: stats?.checkoutCompletedIntentCount ?? 0 },
            { label: 'Expired', value: stats?.checkoutExpiredIntentCount ?? 0 },
            { label: 'Abandoned', value: stats?.checkoutAbandonedIntentCount ?? 0 },
            { label: 'Recoverable', value: stats?.checkoutRecoverableAbandonedIntentCount ?? 0 },
            { label: 'No recovery path', value: stats?.checkoutUnrecoverableAbandonedIntentCount ?? 0 },
            { label: 'Last 7 days', value: stats?.checkoutIntentsLast7Days ?? 0 },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-jung-border bg-jung-base px-4 py-3">
              <p className="text-xs text-jung-muted">{item.label}</p>
              <p className="mt-1 text-xl font-bold text-jung-dark">{statsLoading ? '...' : item.value}</p>
            </div>
          ))}
        </div>

        {!statsLoading && (stats?.checkoutStripeFailureCount ?? 0) > 0 && (
          <div className="mt-5 flex gap-3 rounded-lg border border-error/20 bg-error/5 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-error" />
            <p className="text-sm leading-6 text-error">
              {stats?.checkoutStripeFailureCount ?? 0} checkout attempt{(stats?.checkoutStripeFailureCount ?? 0) === 1 ? '' : 's'} failed before Stripe returned a session. Check Stripe configuration, promo code setup, and recent deploy logs first.
            </p>
          </div>
        )}

        {!statsLoading && stats?.topCheckoutIntentSources && stats.topCheckoutIntentSources.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-b border-jung-border">
                  <th className="py-3 pr-4 text-left font-medium text-jung-secondary">Intent source</th>
                  <th className="py-3 pr-4 text-left font-medium text-jung-secondary">Buy clicks</th>
                  <th className="py-3 pr-4 text-left font-medium text-jung-secondary">Stripe</th>
                  <th className="py-3 pr-4 text-left font-medium text-jung-secondary">Paid</th>
                  <th className="py-3 pr-4 text-left font-medium text-jung-secondary">Expired</th>
                  <th className="py-3 pr-4 text-left font-medium text-jung-secondary">Recoverable</th>
                  <th className="py-3 pr-4 text-left font-medium text-jung-secondary">No recovery</th>
                  <th className="py-3 text-left font-medium text-jung-secondary">Failed</th>
                </tr>
              </thead>
              <tbody>
                {stats.topCheckoutIntentSources.map((item) => (
                  <tr key={item.source} className="border-b border-jung-border last:border-0">
                    <td className="max-w-[24rem] truncate py-3 pr-4 font-medium text-jung-dark">{item.source}</td>
                    <td className="py-3 pr-4 text-jung-secondary">{item.intentCount}</td>
                    <td className="py-3 pr-4 text-jung-secondary">{item.stripeCreatedCount}</td>
                    <td className="py-3 pr-4 font-semibold text-jung-dark">{item.completedCount}</td>
                    <td className="py-3 pr-4 text-jung-secondary">{item.expiredCount}</td>
                    <td className="py-3 pr-4 font-semibold text-jung-dark">{item.recoverableAbandonedCount}</td>
                    <td className="py-3 pr-4 font-semibold text-jung-dark">{item.unrecoverableAbandonedCount}</td>
                    <td className="py-3 font-semibold text-jung-dark">{item.failedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!statsLoading && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-jung-border bg-jung-base p-4">
              <p className="text-xs text-jung-muted">Stripe email known</p>
              <p className="mt-1 text-2xl font-bold text-jung-dark">{stats?.checkoutEmailKnownIntentCount ?? 0}</p>
            </div>
            <div className="rounded-lg border border-jung-border bg-jung-base p-4">
              <p className="text-xs text-jung-muted">Recovery consented</p>
              <p className="mt-1 text-2xl font-bold text-jung-dark">{stats?.checkoutRecoveryConsentedIntentCount ?? 0}</p>
            </div>
            <div className="rounded-lg border border-jung-border bg-jung-base p-4">
              <p className="text-xs text-jung-muted">Stripe failure rate</p>
              <p className="mt-1 text-2xl font-bold text-jung-dark">
                {percentFormatter.format(stats?.checkoutIntentFailureRate ?? 0)}
              </p>
            </div>
            <div className="rounded-lg border border-jung-accent-muted bg-jung-accent-light/70 p-4">
              <p className="text-xs font-semibold text-jung-accent">Next operator target</p>
              <p className="mt-1 text-sm leading-6 text-jung-secondary">
                Reduce no-recovery abandonment before scaling traffic.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_24rem] gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-jung-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-jung-primary" />
            <h2 className="text-xl font-serif font-semibold text-jung-dark">100-Customer Sprint</h2>
          </div>
          {statsLoading ? (
            <div className="animate-pulse text-jung-muted">Loading...</div>
          ) : (
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-jung-muted">Unique non-zero paying customers</p>
                  <p className="mt-1 text-4xl font-bold text-jung-dark">
                    {stats?.uniquePayingCustomers ?? 0}
                    <span className="text-xl text-jung-muted"> / {stats?.payingCustomerGoal ?? 100}</span>
                  </p>
                </div>
                <div className="rounded-lg bg-jung-accent-light px-3 py-2 text-sm font-semibold text-jung-accent">
                  {stats?.payingCustomerRemaining ?? 100} remaining
                </div>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-jung-surface-alt">
                <div
                  className="h-full rounded-full bg-jung-accent transition-all"
                  style={{ width: `${Math.min(100, Math.round((stats?.payingCustomerProgress ?? 0) * 100))}%` }}
                />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-jung-surface p-4">
                  <p className="text-xs text-jung-muted">Progress</p>
                  <p className="mt-1 text-xl font-bold text-jung-dark">
                    {percentFormatter.format(stats?.payingCustomerProgress ?? 0)}
                  </p>
                </div>
                <div className="rounded-lg bg-jung-surface p-4">
                  <p className="text-xs text-jung-muted">Last 7 days</p>
                  <p className="mt-1 text-xl font-bold text-jung-dark">{stats?.purchasesLast7Days ?? 0}</p>
                </div>
                <div className="rounded-lg bg-jung-surface p-4">
                  <p className="text-xs text-jung-muted">Insight</p>
                  <p className="mt-1 text-xl font-bold text-jung-dark">{stats?.insightPurchaseCount ?? 0}</p>
                </div>
                <div className="rounded-lg bg-jung-surface p-4">
                  <p className="text-xs text-jung-muted">Mastery</p>
                  <p className="mt-1 text-xl font-bold text-jung-dark">{stats?.masteryPurchaseCount ?? 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-jung-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-jung-primary" />
            <h2 className="text-xl font-serif font-semibold text-jung-dark">Recovery Pipeline</h2>
          </div>
          {statsLoading ? (
            <div className="animate-pulse text-jung-muted">Loading...</div>
          ) : (
            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-lg bg-jung-surface px-4 py-3">
                <span className="text-sm text-jung-secondary">Unique discount leads</span>
                <span className="font-bold text-jung-dark">{stats?.discountLeadCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-jung-surface px-4 py-3">
                <span className="text-sm text-jung-secondary">Duplicate captures ignored</span>
                <span className="font-bold text-jung-dark">{stats?.duplicateDiscountLeadCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-jung-surface px-4 py-3">
                <span className="text-sm text-jung-secondary">Recoverable email captures</span>
                <span className="font-bold text-jung-dark">{stats?.recoverableLeadCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-jung-surface px-4 py-3">
                <span className="text-sm text-jung-secondary">Follow-ups sent</span>
                <span className="font-bold text-jung-dark">{stats?.followupSentCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-jung-surface px-4 py-3">
                <span className="text-sm text-jung-secondary">Second follow-ups sent</span>
                <span className="font-bold text-jung-dark">{stats?.secondFollowupSentCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-jung-surface px-4 py-3">
                <span className="text-sm text-jung-secondary">Skipped already purchased</span>
                <span className="font-bold text-jung-dark">{stats?.skippedPurchasedCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-jung-surface px-4 py-3">
                <span className="text-sm text-jung-secondary">Skipped invalid email</span>
                <span className="font-bold text-jung-dark">{stats?.skippedInvalidEmailCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-jung-accent-light px-4 py-3">
                <span className="text-sm font-semibold text-jung-accent">Awaiting follow-up</span>
                <span className="font-bold text-jung-dark">{stats?.awaitingFollowupCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-jung-accent-light px-4 py-3">
                <span className="text-sm font-semibold text-jung-accent">Awaiting second follow-up</span>
                <span className="font-bold text-jung-dark">{stats?.awaitingSecondFollowupCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-jung-surface px-4 py-3">
                <span className="text-sm text-jung-secondary">Leads in last 7 days</span>
                <span className="font-bold text-jung-dark">{stats?.leadsLast7Days ?? 0}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="rounded-lg bg-jung-surface px-3 py-3">
                  <p className="text-xs text-jung-muted">Capture coverage</p>
                  <p className="mt-1 text-lg font-bold text-jung-dark">
                    {percentFormatter.format(stats?.leadRecoveryCoverage ?? 0)}
                  </p>
                </div>
                <div className="rounded-lg bg-jung-surface px-3 py-3">
                  <p className="text-xs text-jung-muted">Follow-up coverage</p>
                  <p className="mt-1 text-lg font-bold text-jung-dark">
                    {percentFormatter.format(stats?.followupCoverage ?? 0)}
                  </p>
                </div>
                <div className="rounded-lg bg-jung-surface px-3 py-3">
                  <p className="text-xs text-jung-muted">Second coverage</p>
                  <p className="mt-1 text-lg font-bold text-jung-dark">
                    {percentFormatter.format(stats?.secondFollowupCoverage ?? 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-jung-border p-6 mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-jung-primary" />
              <h2 className="text-xl font-serif font-semibold text-jung-dark">Revenue Priorities</h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-jung-secondary">
              Focus on recoverable checkout intent before scaling new traffic.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[36rem]">
            <div className="rounded-lg border border-jung-border bg-jung-base p-4">
              <p className="text-xs text-jung-muted">Customer gap</p>
              <p className="mt-1 text-2xl font-bold text-jung-dark">{statsLoading ? '...' : stats?.payingCustomerRemaining ?? 100}</p>
            </div>
            <div className="rounded-lg border border-jung-border bg-jung-base p-4">
              <p className="text-xs text-jung-muted">Leads to recover</p>
              <p className="mt-1 text-2xl font-bold text-jung-dark">{statsLoading ? '...' : stats?.awaitingFollowupCount ?? 0}</p>
            </div>
            <div className="rounded-lg border border-jung-border bg-jung-base p-4">
              <p className="text-xs text-jung-muted">Second reminders</p>
              <p className="mt-1 text-2xl font-bold text-jung-dark">{statsLoading ? '...' : stats?.awaitingSecondFollowupCount ?? 0}</p>
            </div>
            <div className="rounded-lg border border-jung-border bg-jung-base p-4">
              <p className="text-xs text-jung-muted">Unrecoverable captures</p>
              <p className="mt-1 text-2xl font-bold text-jung-dark">{statsLoading ? '...' : stats?.unrecoverableLeadCount ?? 0}</p>
            </div>
          </div>
        </div>
        {!statsLoading && stats?.topLeadSources && stats.topLeadSources.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-b border-jung-border">
                  <th className="py-3 pr-4 text-left font-medium text-jung-secondary">Lead source</th>
                  <th className="py-3 pr-4 text-left font-medium text-jung-secondary">Total</th>
                  <th className="py-3 pr-4 text-left font-medium text-jung-secondary">Recoverable</th>
                  <th className="py-3 pr-4 text-left font-medium text-jung-secondary">Sent</th>
                  <th className="py-3 pr-4 text-left font-medium text-jung-secondary">Second sent</th>
                  <th className="py-3 pr-4 text-left font-medium text-jung-secondary">Skipped</th>
                  <th className="py-3 pr-4 text-left font-medium text-jung-secondary">Awaiting follow-up</th>
                  <th className="py-3 text-left font-medium text-jung-secondary">Awaiting second</th>
                </tr>
              </thead>
              <tbody>
                {stats.topLeadSources.map((item) => (
                  <tr key={item.source} className="border-b border-jung-border last:border-0">
                    <td className="max-w-[26rem] truncate py-3 pr-4 font-medium text-jung-dark">{item.source}</td>
                    <td className="py-3 pr-4 text-jung-secondary">{item.count}</td>
                    <td className="py-3 pr-4 text-jung-secondary">{item.recoverableCount}</td>
                    <td className="py-3 pr-4 text-jung-secondary">{item.followupSentCount}</td>
                    <td className="py-3 pr-4 text-jung-secondary">{item.secondFollowupSentCount}</td>
                    <td className="py-3 pr-4 text-jung-secondary">{item.skippedPurchasedCount + item.skippedInvalidEmailCount}</td>
                    <td className="py-3 pr-4 font-semibold text-jung-dark">{item.awaitingFollowupCount}</td>
                    <td className="py-3 font-semibold text-jung-dark">{item.awaitingSecondFollowupCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-jung-border p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-jung-primary" />
          <h2 className="text-xl font-serif font-semibold text-jung-dark">Paid Customer Sources</h2>
        </div>
        {statsLoading ? (
          <div className="animate-pulse text-jung-muted">Loading...</div>
        ) : stats?.topPurchaseSources && stats.topPurchaseSources.length > 0 ? (
          <div className="divide-y divide-jung-border">
            {stats.topPurchaseSources.map((item) => (
              <div key={item.source} className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_6rem_8rem] sm:items-center">
                <p className="min-w-0 truncate text-sm font-medium text-jung-dark">{item.source}</p>
                <p className="text-sm text-jung-secondary">{item.count} customers</p>
                <p className="text-sm font-semibold text-jung-dark">{cadFormatter.format(item.revenueCad)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-jung-muted">No paid customer attribution yet</p>
        )}
      </div>

      {stats?.topPurchaseChains && stats.topPurchaseChains.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-jung-border p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-jung-primary" />
            <h2 className="text-xl font-serif font-semibold text-jung-dark">Paid Attribution Chains</h2>
          </div>
          <div className="divide-y divide-jung-border">
            {stats.topPurchaseChains.map((item) => (
              <div key={item.sourceChain} className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_6rem_8rem] sm:items-center">
                <p className="min-w-0 truncate text-sm font-medium text-jung-dark">{item.sourceChain}</p>
                <p className="text-sm text-jung-secondary">{item.count} customers</p>
                <p className="text-sm font-semibold text-jung-dark">{cadFormatter.format(item.revenueCad)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
