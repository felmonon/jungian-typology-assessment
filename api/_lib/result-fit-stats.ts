import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isResearchBrowserId } from '../../shared/research-traffic.js';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from './supabase.js';

// Aggregate answer to "Did this map name something real?" (the
// result_reaction_submitted funnel event). Only counts leave this module: no
// anonymous ids, timestamps or other row data.

export const RESULT_FIT_MIN_REACTIONS = 20;
const RESULT_FIT_ROW_LIMIT = 5000;
const MEMORY_CACHE_MS = 10 * 60 * 1000;

export type ResultFitStats =
  | { show: true; percentYes: number; total: number }
  | { show: false };

type ReactionRow = {
  anonymous_id?: string | null;
  properties?: { reaction?: unknown } | null;
  occurred_at?: string | null;
};

const REACTIONS = new Set(['yes', 'somewhat', 'not_yet']);

// Rows arrive newest first. One vote per browser (its latest answer); rows
// without a browser id count once each. Research browsers are left out.
export function summarizeResultReactions(rows: ReactionRow[]): ResultFitStats {
  const seen = new Set<string>();
  let total = 0;
  let yes = 0;

  for (const row of rows) {
    const reaction = row.properties?.reaction;
    if (typeof reaction !== 'string' || !REACTIONS.has(reaction)) continue;

    const browser = typeof row.anonymous_id === 'string' && row.anonymous_id ? row.anonymous_id : null;
    if (browser) {
      if (isResearchBrowserId(browser) || seen.has(browser)) continue;
      seen.add(browser);
    }

    total += 1;
    if (reaction === 'yes') yes += 1;
  }

  if (total < RESULT_FIT_MIN_REACTIONS) return { show: false };
  return { show: true, percentYes: Math.round((yes / total) * 100), total };
}

export async function loadResultFitStats(supabase: SupabaseClient): Promise<ResultFitStats> {
  const { data, error } = await supabase
    .from('funnel_events')
    .select('anonymous_id, properties, occurred_at')
    .eq('event_name', 'result_reaction_submitted')
    .order('occurred_at', { ascending: false })
    .limit(RESULT_FIT_ROW_LIMIT);

  if (error) throw new Error(error.message);
  return summarizeResultReactions((data || []) as ReactionRow[]);
}

let memoryCache: { at: number; stats: ResultFitStats } | null = null;

export function resetResultFitStatsCache() {
  memoryCache = null;
}

export async function handleResultFitStatsRequest(_req: VercelRequest, res: VercelResponse) {
  const now = Date.now();
  if (memoryCache && now - memoryCache.at < MEMORY_CACHE_MS) {
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(memoryCache.stats);
  }

  if (!hasSupabaseAdminConfig()) {
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    return res.status(200).json({ show: false } satisfies ResultFitStats);
  }

  try {
    const stats = await loadResultFitStats(getSupabaseAdminClient());
    memoryCache = { at: now, stats };
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(stats);
  } catch (error) {
    console.warn('Result fit stats lookup failed:', error instanceof Error ? error.message : 'Unknown error');
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    return res.status(200).json({ show: false } satisfies ResultFitStats);
  }
}
