import { createTrafficAttributionApi, sanitizeTrafficAttribution } from '../shared/traffic-attribution-core.js';
import type { TrafficAttributionParams } from '../shared/traffic-attribution';

declare global {
  interface Window {
    __typejungTrafficAttribution?: { capture(): Partial<TrafficAttributionParams> };
  }
}

/** Capture once per visit and carry the external entry through the free/paid funnel. */
export function trafficAttributionParams(): Partial<TrafficAttributionParams> {
  if (typeof window === 'undefined') return {};
  window.__typejungTrafficAttribution ||= createTrafficAttributionApi(window, sanitizeTrafficAttribution);
  return window.__typejungTrafficAttribution.capture();
}
