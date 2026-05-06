import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials for share API');
      return res.status(500).json({ message: 'Share API is not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

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
