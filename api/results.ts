import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getSessionUser } from './_lib/auth.js';
import { getSupabaseAdminClient } from './_lib/supabase.js';

function generateShareSlug(): string {
  return crypto.randomBytes(8).toString('base64url');
}

function cleanResultId(value: string | string[] | undefined): string | null {
  const id = Array.isArray(value) ? value[0] : value;
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) return null;
  return id;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await getSessionUser(req.headers.cookie);
    const supabase = getSupabaseAdminClient();

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
          user_id: user.id,
          scores,
          stack,
          attitude_score: String(attitudeScore),
          is_undifferentiated: String(isUndifferentiated),
          share_slug: shareSlug
        })
        .select(`
          id,
          userId:user_id,
          scores,
          stack,
          attitudeScore:attitude_score,
          isUndifferentiated:is_undifferentiated,
          shareSlug:share_slug,
          createdAt:created_at
        `)
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

      const resultId = cleanResultId(req.query.id);
      if (resultId) {
        const { data: result, error } = await supabase
          .from('assessment_results')
          .select(`
            id,
            userId:user_id,
            scores,
            stack,
            attitudeScore:attitude_score,
            isUndifferentiated:is_undifferentiated,
            shareSlug:share_slug,
            createdAt:created_at
          `)
          .eq('id', resultId)
          .eq('user_id', user.id)
          .single();

        if (error || !result) {
          return res.status(404).json({ message: 'Result not found' });
        }

        return res.status(200).json(result);
      }

      const { data: results, error } = await supabase
        .from('assessment_results')
        .select(`
          id,
          userId:user_id,
          scores,
          stack,
          attitudeScore:attitude_score,
          isUndifferentiated:is_undifferentiated,
          shareSlug:share_slug,
          createdAt:created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch error:', error);
        return res.status(500).json({ message: 'Failed to fetch results' });
      }

      return res.status(200).json(results);
    }

    if (req.method === 'DELETE') {
      if (!user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const resultId = cleanResultId(req.query.id);
      if (!resultId) {
        return res.status(400).json({ message: 'Invalid result id' });
      }

      const { error } = await supabase
        .from('assessment_results')
        .delete()
        .eq('id', resultId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Delete error:', error);
        return res.status(500).json({ message: 'Failed to delete result' });
      }

      return res.status(200).json({ message: 'Result deleted successfully' });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error with results:', error);
    return res.status(500).json({ message: 'Failed to process request' });
  }
}
