import type { SupabaseClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { readCompletePremiumReport, type PremiumAnalysis } from '../../lib/premium-report.js';
import type { CleanAssessment } from './assessment-input.js';

// Bump when the report prompt changes enough that an old cached report should
// no longer be served for the same result.
export const REPORT_PROMPT_VERSION = 'insight-report-v1';
const TABLE = 'insight_report_cache';

export type CachedReport = { report: PremiumAnalysis; generationSource: string | null };

export type CacheRead =
  | { status: 'hit'; entry: CachedReport }
  | { status: 'miss' }
  | { status: 'unavailable' };

/**
 * One cache row per completed result. The key is derived on the server from
 * the cleaned assessment plus its completion time, so it is stable for the
 * same saved result and a browser cannot point it at another row.
 */
export function reportCacheKey(input: CleanAssessment): string | null {
  const completedAt = input.depth?.completedAt;
  if (!completedAt || !input.stack || input.scores.length === 0) return null;
  const canonical = JSON.stringify([REPORT_PROMPT_VERSION, completedAt, input]);
  return createHash('sha256').update(canonical).digest('hex');
}

// A missing table (migration not applied yet) and any other database failure
// are both treated as "no cache"; callers decide what that means for them.
function describeFailure(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : '';
  if (code === '42P01' || code === 'PGRST205') return 'table_missing';
  return code ? `db_error_${code}` : 'db_error';
}

export async function readCachedReport(supabase: SupabaseClient, key: string): Promise<CacheRead> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('report, generation_source')
      .eq('input_hash', key)
      .eq('prompt_version', REPORT_PROMPT_VERSION)
      .maybeSingle();
    if (error) {
      console.warn('Report cache read unavailable:', describeFailure(error));
      return { status: 'unavailable' };
    }
    if (!data) return { status: 'miss' };
    const report = readCompletePremiumReport(data.report);
    if (!report) return { status: 'miss' };
    return { status: 'hit', entry: { report, generationSource: typeof data.generation_source === 'string' ? data.generation_source : null } };
  } catch (error) {
    console.warn('Report cache read unavailable:', describeFailure(error));
    return { status: 'unavailable' };
  }
}

/**
 * Stores a report unless one already exists for the key, then returns the
 * stored row. When two requests race, both end up serving the first report,
 * so the preview a reader saw is the report they later unlock.
 */
export async function storeCachedReport(
  supabase: SupabaseClient,
  key: string,
  entry: CachedReport,
): Promise<CachedReport | null> {
  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert({
        input_hash: key,
        prompt_version: REPORT_PROMPT_VERSION,
        report: entry.report,
        generation_source: entry.generationSource,
      }, { onConflict: 'input_hash', ignoreDuplicates: true });
    if (error) {
      console.warn('Report cache write unavailable:', describeFailure(error));
      return null;
    }
  } catch (error) {
    console.warn('Report cache write unavailable:', describeFailure(error));
    return null;
  }
  const stored = await readCachedReport(supabase, key);
  return stored.status === 'hit' ? stored.entry : null;
}

export async function markCachedReportUnlocked(supabase: SupabaseClient, key: string): Promise<void> {
  try {
    await supabase.from(TABLE).update({ unlocked_at: new Date().toISOString() }).eq('input_hash', key).is('unlocked_at', null);
  } catch {
    // Bookkeeping only; delivery never depends on it.
  }
}
