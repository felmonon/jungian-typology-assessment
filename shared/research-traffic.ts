/** Explicit study markers only. Unknown or missing acquisition is customer traffic. */
export const RESEARCH_SOURCE = 'typejung_research';
export const RESEARCH_CAMPAIGN = 'offer_observation_2026_10';
export const RESEARCH_BROWSER_ID_PREFIX = 'research_observation_v1_';

export type ResearchTrafficEvent = {
  anonymous_id?: unknown;
  anonymousId?: unknown;
  properties?: unknown;
};

const browserId = (event: ResearchTrafficEvent): string | undefined => {
  const value = event.anonymous_id ?? event.anonymousId;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

export function isResearchBrowserId(value: unknown): boolean {
  return typeof value === 'string' && value.length <= 160
    && /^research_observation_v1_[a-zA-Z0-9_-]+$/.test(value);
}

export function isResearchTrafficEvent(event: ResearchTrafficEvent): boolean {
  if (isResearchBrowserId(browserId(event))) return true;
  if (!event.properties || typeof event.properties !== 'object' || Array.isArray(event.properties)) return false;
  const properties = event.properties as Record<string, unknown>;
  const versionedCampaign = properties.traffic_attribution_version === '1'
    && properties.traffic_source_kind === 'utm'
    && properties.traffic_source === RESEARCH_SOURCE
    && properties.traffic_campaign === RESEARCH_CAMPAIGN;
  const legacyCampaign = properties.utm_source === RESEARCH_SOURCE
    && properties.utm_campaign === RESEARCH_CAMPAIGN;
  return versionedCampaign || legacyCampaign;
}

/**
 * Separate entire explicitly marked browser journeys, including untagged later
 * events. Callers bound the reporting window first. Stored data is never changed.
 */
export function filterResearchTrafficEvents<T extends ResearchTrafficEvent>(rows: T[]): {
  events: T[];
  excludedBrowserCount: number;
  excludedEventCount: number;
} {
  const researchBrowsers = new Set(rows.filter(isResearchTrafficEvent).map(browserId).filter((id): id is string => Boolean(id)));
  const events = rows.filter((event) => !researchBrowsers.has(browserId(event) || '') && !isResearchTrafficEvent(event));
  return {
    events,
    excludedBrowserCount: researchBrowsers.size,
    excludedEventCount: rows.length - events.length,
  };
}
