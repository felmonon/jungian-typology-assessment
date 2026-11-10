import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from './_lib/supabase.js';

const FUNCTION_TITLES: Record<string, string> = {
  Te: "Extraverted Thinking",
  Ti: "Introverted Thinking",
  Fe: "Extraverted Feeling",
  Fi: "Introverted Feeling",
  Se: "Extraverted Sensation",
  Si: "Introverted Sensation",
  Ne: "Extraverted Intuition",
  Ni: "Introverted Intuition",
};

type LeaderboardClient = ReturnType<typeof getSupabaseAdminClient>;

// An exact count computed by Postgres: the request is a HEAD, so no result
// rows (each carries a full saved result) are sent back, and the containment
// filter can use the GIN index on stack.
async function countDominantFunction(supabase: LeaderboardClient, func: string): Promise<number> {
  const { count, error } = await supabase
    .from('assessment_results')
    .select('id', { count: 'exact', head: true })
    .contains('stack', { dominant: { function: func } });

  if (error) throw error;
  if (typeof count !== 'number') throw new Error(`No count returned for ${func}`);
  return count;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!hasSupabaseAdminConfig()) {
      console.error('Missing Supabase admin credentials for leaderboard API');
      return res.status(500).json({ message: 'Leaderboard is not configured' });
    }

    const supabase = getSupabaseAdminClient();

    const counts = await Promise.all(
      Object.entries(FUNCTION_TITLES).map(async ([func, title]) => ({
        function: func,
        count: await countDominantFunction(supabase, func),
        title,
      })),
    );

    const leaderboard = counts
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count);

    const total = leaderboard.reduce((sum, item) => sum + item.count, 0);

    // The same public answer for every visitor, so let the CDN serve it. Only
    // this successful response is cacheable; the fallbacks below are not.
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ leaderboard, total });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(200).json({ leaderboard: [], total: 0 });
  }
}
