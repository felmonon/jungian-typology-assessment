import { sanitizeTrafficAttribution } from './traffic-attribution-core.js';

export type TrafficAttributionParams = {
  traffic_attribution_version: '1';
  traffic_source_kind: 'utm' | 'referrer' | 'direct_or_unknown';
  traffic_source: string;
  traffic_landing_path: string;
  traffic_captured_at: string;
  traffic_referrer_host?: string;
  traffic_medium?: string;
  traffic_campaign?: string;
};

/** Strict boundary for browser events, checkout requests and payment metadata. */
export function sanitizeTrafficAttributionParams(raw: unknown): Partial<TrafficAttributionParams> {
  return sanitizeTrafficAttribution(raw) as Partial<TrafficAttributionParams>;
}
