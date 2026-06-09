import type { Express } from 'express';
import {
  normalizeAnalyticsEvent,
  trackNormalizedAnalyticsEvent,
} from '../../api/_lib/analytics-event';

export function registerAnalyticsRoutes(app: Express) {
  app.post('/api/analytics', async (req, res) => {
    const event = normalizeAnalyticsEvent(req.body);
    if (!event) {
      return res.status(400).json({ error: 'Invalid analytics event' });
    }

    try {
      await trackNormalizedAnalyticsEvent(event);
    } catch (error) {
      console.warn('Analytics event tracking failed:', event.eventName, error instanceof Error ? error.message : 'Unknown error');
    }

    return res.status(202).json({ ok: true, event: event.eventName });
  });
}
