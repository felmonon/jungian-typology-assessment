import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { getSessionUser } from './_lib/auth';

function generateShareSlug(): string {
  return crypto.randomBytes(8).toString('base64url');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await getSessionUser(req.headers.cookie);
    // Use service role key for server-side operations (bypasses RLS)
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
    );

    if (req.method === 'POST') {
      if (!user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { scores, stack, attitudeScore, isUndifferentiated } = req.body;

      if (!scores || !stack || attitudeScore === undefined || isUndifferentiated === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const shareSlug = generateShareSlug();

      const { data: result, error } = await supabase
        .from('assessment_results')
        .insert({
          userId: user.id,
          scores: scores,
          stack: stack,
          attitudeScore: String(attitudeScore),
          isUndifferentiated: String(isUndifferentiated),
          shareSlug: shareSlug
        })
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        return res.status(500).json({ message: 'Failed to save results' });
      }

      return res.status(201).json(result);
    }

    if (req.method === 'GET') {
      if (!user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { data: results, error } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Fetch error:', error);
        return res.status(500).json({ message: 'Failed to fetch results' });
      }

      return res.status(200).json(results);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error with results:', error);
    return res.status(500).json({ message: 'Failed to process request' });
  }
}
