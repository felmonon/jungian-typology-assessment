import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from '../_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Missing slug parameter' });
  }

  try {
    if (!hasSupabaseAdminConfig()) {
      console.error('Missing Supabase admin credentials for share API');
      return res.status(500).json({ message: 'Share API is not configured' });
    }

    const supabase = getSupabaseAdminClient();

    const { data: results, error } = await supabase
      .from('assessment_results')
      .select(`
        id,
        scores,
        stack,
        attitudeScore:attitude_score,
        isUndifferentiated:is_undifferentiated,
        shareSlug:share_slug,
        createdAt:created_at
      `)
      .eq('share_slug', slug);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Failed to fetch result' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Result not found' });
    }

    return res.status(200).json(results[0]);
  } catch (error) {
    console.error('Error fetching shared result:', error);
    return res.status(500).json({ message: 'Failed to fetch result' });
  }
}
