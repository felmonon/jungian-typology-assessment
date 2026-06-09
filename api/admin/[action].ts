import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSessionUserFromCookie } from '../_lib/auth-utils.js';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from '../_lib/supabase.js';
import {
  dailyAssessmentCounts,
  summarizeCheckoutIntents,
  popularTypes,
  summarizeDiscountLeads,
  summarizePurchases,
  type AssessmentMetricRow,
  type CheckoutIntentMetricRow,
  type DiscountLeadMetricRow,
  type PurchaseMetricRow,
} from '../_lib/growth-metrics.js';

async function requireAdmin(req: VercelRequest, res: VercelResponse) {
  if (!hasSupabaseAdminConfig()) {
    res.status(500).json({ message: 'Database not configured' });
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const user = await getSessionUserFromCookie(req.headers.cookie, supabase);

  if (!user) {
    res.status(401).json({ message: 'Authentication required' });
    return null;
  }

  if (!user.isAdmin) {
    res.status(403).json({ message: 'Admin access required' });
    return null;
  }

  return { supabase, user };
}

async function countRows(supabase: ReturnType<typeof getSupabaseAdminClient>, table: string) {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true });

  if (error) throw error;
  return count || 0;
}

function isSchemaDriftError(error: any): boolean {
  const code = typeof error?.code === 'string' ? error.code : '';
  const message = typeof error?.message === 'string' ? error.message : '';

  return (
    code === '42703'
    || code === '42P01'
    || code === 'PGRST200'
    || code === 'PGRST204'
    || code === 'PGRST205'
    || /column .* does not exist|schema cache|could not find the table/i.test(message)
  );
}

async function selectWithColumnFallback<T>(
  table: string,
  selectors: string[],
  run: (selector: string) => Promise<{ data: unknown; error: any }>,
): Promise<T[]> {
  for (const selector of selectors) {
    const { data, error } = await run(selector);

    if (!error) return (data || []) as T[];

    if (!isSchemaDriftError(error)) {
      throw error;
    }

    console.warn(`${table} metrics selector unavailable; trying fallback:`, error.message);
  }

  return [];
}

async function completedPurchases(supabase: ReturnType<typeof getSupabaseAdminClient>) {
  return selectWithColumnFallback<PurchaseMetricRow>('purchases', [
    'id, user_id, customer_email, amount, tier, source, acquisition_source, utm_source, utm_campaign, parent_source, source_chain, created_at',
    'id, user_id, customer_email, amount, tier, created_at',
    'id, user_id, amount, tier, created_at',
  ], async (selector) => {
    return supabase
      .from('purchases')
      .select(selector)
      .eq('status', 'completed')
      .gt('amount', 0)
      .order('created_at', { ascending: false })
      .limit(5000);
  });
}

async function discountLeads(supabase: ReturnType<typeof getSupabaseAdminClient>) {
  return selectWithColumnFallback<DiscountLeadMetricRow>('discount_leads', [
    'id, email, source, tier_intent, email_sent, followup_email_sent, followup_email_sent_id, followup_email_error, second_followup_email_sent, second_followup_email_sent_id, second_followup_email_error, utm_source, utm_campaign, parent_source, source_chain, created_at',
    'id, email, source, tier_intent, email_sent, followup_email_sent, followup_email_error, second_followup_email_sent, second_followup_email_error, utm_source, utm_campaign, parent_source, source_chain, created_at',
    'id, email, source, tier_intent, email_sent, followup_email_sent, utm_source, utm_campaign, parent_source, source_chain, created_at',
    'id, email, source, tier_intent, email_sent, followup_email_sent, utm_source, utm_campaign, parent_source, created_at',
    'id, email, source, tier_intent, email_sent, followup_email_sent, created_at',
    'id, email, source, email_sent, created_at',
  ], async (selector) => {
    return supabase
      .from('discount_leads')
      .select(selector)
      .order('created_at', { ascending: false })
      .limit(5000);
  });
}

async function checkoutIntents(supabase: ReturnType<typeof getSupabaseAdminClient>) {
  return selectWithColumnFallback<CheckoutIntentMetricRow>('checkout_intents', [
    'id, stripe_session_id, status, amount, tier, source, acquisition_source, utm_source, utm_campaign, parent_source, source_chain, checkout_email_source, has_customer_email, recovery_email_consent, created_at, expires_at, completed_at, expired_at',
    'id, stripe_session_id, status, amount, tier, source, acquisition_source, created_at, expires_at, completed_at, expired_at',
    'id, stripe_session_id, status, amount, tier, source, created_at, expires_at, completed_at, expired_at',
  ], async (selector) => {
    return supabase
      .from('checkout_intents')
      .select(selector)
      .order('created_at', { ascending: false })
      .limit(5000);
  });
}

async function assessmentRows(supabase: ReturnType<typeof getSupabaseAdminClient>) {
  const { data, error } = await supabase
    .from('assessment_results')
    .select('stack, created_at')
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) throw error;
  return (data || []) as AssessmentMetricRow[];
}

async function handleStats(req: VercelRequest, res: VercelResponse) {
  const auth = await requireAdmin(req, res);
  if (!auth) return;

  try {
    const [userCount, assessmentCount, purchases, leads, intents] = await Promise.all([
      countRows(auth.supabase, 'users'),
      countRows(auth.supabase, 'assessment_results'),
      completedPurchases(auth.supabase),
      discountLeads(auth.supabase),
      checkoutIntents(auth.supabase),
    ]);

    return res.status(200).json({
      userCount,
      assessmentCount,
      ...summarizePurchases(purchases),
      ...summarizeDiscountLeads(leads),
      ...summarizeCheckoutIntents(intents),
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ message: 'Failed to fetch statistics' });
  }
}

async function handleAnalytics(req: VercelRequest, res: VercelResponse) {
  const auth = await requireAdmin(req, res);
  if (!auth) return;

  try {
    const rows = await assessmentRows(auth.supabase);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setUTCHours(0, 0, 0, 0);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7);
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const totalThisWeek = rows.filter((row) => row.created_at && Date.parse(row.created_at) >= weekStart.getTime()).length;
    const totalLastWeek = rows.filter((row) => {
      const parsed = row.created_at ? Date.parse(row.created_at) : NaN;
      return Number.isFinite(parsed) && parsed >= lastWeekStart.getTime() && parsed < weekStart.getTime();
    }).length;
    const totalThisMonth = rows.filter((row) => row.created_at && Date.parse(row.created_at) >= monthStart.getTime()).length;

    return res.status(200).json({
      popularTypes: popularTypes(rows),
      dailyAssessments: dailyAssessmentCounts(rows, now, 7),
      totalThisWeek,
      totalLastWeek,
      totalThisMonth,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ message: 'Failed to fetch analytics' });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const action = Array.isArray(req.query.action) ? req.query.action[0] : req.query.action;

  if (action === 'stats') {
    return handleStats(req, res);
  }

  if (action === 'analytics') {
    return handleAnalytics(req, res);
  }

  return res.status(404).json({ message: 'Unknown admin action' });
}
