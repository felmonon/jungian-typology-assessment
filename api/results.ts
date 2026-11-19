import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getSessionUser } from './_lib/auth.js';
import { enforceSharedRateLimit } from './_lib/rate-limit.js';
import { getSupabaseAdminClient } from './_lib/supabase.js';

function generateShareSlug(): string {
  return crypto.randomBytes(8).toString('base64url');
}

function cleanResultId(value: string | string[] | undefined): string | null {
  const id = Array.isArray(value) ? value[0] : value;
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) return null;
  return id;
}

const FUNCTION_CODES = new Set(['Te', 'Ti', 'Fe', 'Fi', 'Se', 'Si', 'Ne', 'Ni']);
const STACK_POSITIONS = ['dominant', 'auxiliary', 'tertiary', 'inferior'] as const;
// A saved result carries the full depth map inside stack; real ones are a few
// kilobytes. The cap keeps anonymous share links from storing arbitrary blobs.
export const MAX_RESULT_PAYLOAD_BYTES = 32 * 1024;
const MAX_JSON_DEPTH = 12;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFunctionScore(value: unknown): boolean {
  return isPlainObject(value)
    && typeof value.function === 'string'
    && FUNCTION_CODES.has(value.function)
    && typeof value.score === 'number'
    && Number.isFinite(value.score);
}

function jsonDepth(value: unknown, depth = 0): number {
  if (depth > MAX_JSON_DEPTH) return depth;
  if (Array.isArray(value)) return Math.max(depth, ...value.map((item) => jsonDepth(item, depth + 1)));
  if (isPlainObject(value)) return Math.max(depth, ...Object.values(value).map((item) => jsonDepth(item, depth + 1)));
  return depth;
}

export type ResultInput = {
  scores: unknown[];
  stack: Record<string, unknown>;
  attitudeScore: number | null;
  isUndifferentiated: boolean;
};

export function validateResultInput(body: unknown): { ok: true; value: ResultInput } | { ok: false; message: string } {
  if (!isPlainObject(body)) return { ok: false, message: 'Missing required fields' };
  const { scores, stack, attitudeScore, isUndifferentiated } = body;

  if (scores === undefined || stack === undefined || attitudeScore === undefined || isUndifferentiated === undefined) {
    return { ok: false, message: 'Missing required fields' };
  }
  if (!Array.isArray(scores) || scores.length === 0 || scores.length > 16 || !scores.every(isFunctionScore)) {
    return { ok: false, message: 'Invalid scores' };
  }
  if (!isPlainObject(stack) || !STACK_POSITIONS.every((position) => isFunctionScore(stack[position]))) {
    return { ok: false, message: 'Invalid stack' };
  }
  if (attitudeScore !== null && (typeof attitudeScore !== 'number' || !Number.isFinite(attitudeScore))) {
    return { ok: false, message: 'Invalid attitudeScore' };
  }
  if (typeof isUndifferentiated !== 'boolean') {
    return { ok: false, message: 'Invalid isUndifferentiated' };
  }

  const size = Buffer.byteLength(JSON.stringify({ scores, stack }), 'utf8');
  if (size > MAX_RESULT_PAYLOAD_BYTES || jsonDepth({ scores, stack }) > MAX_JSON_DEPTH) {
    return { ok: false, message: 'Result is too large' };
  }

  return { ok: true, value: { scores, stack, attitudeScore: attitudeScore as number | null, isUndifferentiated } };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await getSessionUser(req.headers.cookie);
    const supabase = getSupabaseAdminClient();

    if (req.method === 'POST') {
      const shareOnly = req.body?.shareOnly === true;

      if (!user?.id && !shareOnly) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Anonymous share links are the open door here, so they get the tighter limit.
      if (await enforceSharedRateLimit(req, res, user?.id
        ? { keyPrefix: 'results:save', limit: 60, windowMs: 60 * 60 * 1000, message: 'Too many saved results. Please try again later.' }
        : { keyPrefix: 'results:share', limit: 20, windowMs: 60 * 60 * 1000, message: 'Too many share links. Please try again later.' })) return;

      const validation = validateResultInput(req.body);
      if ('message' in validation) {
        return res.status(400).json({ message: validation.message });
      }
      const { scores, stack, attitudeScore, isUndifferentiated } = validation.value;

      const shareSlug = generateShareSlug();

      const { data: result, error } = await supabase
        .from('assessment_results')
        .insert({
          user_id: user?.id || null,
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
