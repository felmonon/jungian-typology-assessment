import type { VercelRequest, VercelResponse } from '@vercel/node';
import { enforceRateLimit } from './_lib/rate-limit.js';
import {
  normalizeAnalyticsEvent,
  trackNormalizedAnalyticsEvent,
} from './_lib/analytics-event.js';
import { recordFunnelEvent } from './_lib/funnel-events.js';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from './_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (enforceRateLimit(req, res, {
    keyPrefix: 'analytics:event',
    limit: 240,
    windowMs: 5 * 60 * 1000,
    message: 'Too many analytics events. Please wait and try again.',
  })) return;

  const event = normalizeAnalyticsEvent(req.body);
  if (!event) {
    return res.status(400).json({ error: 'Invalid analytics event' });
  }

  try {
    await trackNormalizedAnalyticsEvent(event);
  } catch (error) {
    console.warn('Analytics event tracking failed:', event.eventName, error instanceof Error ? error.message : 'Unknown error');
  }

  if (event.funnelEvent && hasSupabaseAdminConfig()) {
    try {
      await recordFunnelEvent(getSupabaseAdminClient(), event.funnelEvent);
    } catch (error) {
      console.warn('Funnel event recording failed:', event.eventName, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  return res.status(202).json({ ok: true, event: event.eventName });
}
