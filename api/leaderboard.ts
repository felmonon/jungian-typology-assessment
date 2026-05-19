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

    const { data: results, error } = await supabase
      .from('assessment_results')
      .select('stack');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(200).json({ leaderboard: [], total: 0 });
    }

    const functionCounts: Record<string, number> = {};

    for (const result of results || []) {
      const dominantFunction = result.stack?.dominant?.function;
      if (dominantFunction && FUNCTION_TITLES[dominantFunction]) {
        functionCounts[dominantFunction] = (functionCounts[dominantFunction] || 0) + 1;
      }
    }

    const leaderboard = Object.entries(functionCounts)
      .map(([func, count]) => ({
        function: func,
        count,
        title: FUNCTION_TITLES[func] || func,
      }))
      .sort((a, b) => b.count - a.count);

    const total = leaderboard.reduce((sum, item) => sum + item.count, 0);

    return res.status(200).json({ leaderboard, total });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(200).json({ leaderboard: [], total: 0 });
  }
}
