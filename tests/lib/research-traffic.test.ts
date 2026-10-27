import { describe, expect, it } from 'vitest';
import { filterResearchTrafficEvents, isResearchBrowserId, isResearchTrafficEvent, RESEARCH_CAMPAIGN, RESEARCH_SOURCE } from '../../shared/research-traffic';

const campaign = {
  traffic_attribution_version: '1', traffic_source_kind: 'utm',
  traffic_source: RESEARCH_SOURCE, traffic_campaign: RESEARCH_CAMPAIGN,
};

describe('research traffic separation', () => {
  it('recognizes the dedicated browser marker without attribution fields', () => {
    expect(isResearchBrowserId('research_observation_v1_a-valid-uuid')).toBe(true);
    expect(isResearchTrafficEvent({ anonymousId: 'research_observation_v1_a-valid-uuid', properties: {} })).toBe(true);
    expect(isResearchBrowserId('research_observation_v1_')).toBe(false);
    expect(isResearchBrowserId('some_research_observation_v1_id')).toBe(false);
    expect(isResearchBrowserId(null)).toBe(false);
  });

  it.each([
    campaign,
    { utm_source: RESEARCH_SOURCE, utm_campaign: RESEARCH_CAMPAIGN },
  ])('recognizes explicit versioned or legacy campaign evidence', properties => {
    expect(isResearchTrafficEvent({ anonymous_id: 'ordinary-format-id', properties })).toBe(true);
  });

  it.each([
    undefined, null, {}, [],
    { utm_source: null, utm_campaign: null },
    { utm_source: RESEARCH_SOURCE },
    { utm_campaign: RESEARCH_CAMPAIGN },
    { utm_source: 'newsletter', utm_campaign: RESEARCH_CAMPAIGN },
    { utm_source: RESEARCH_SOURCE, utm_campaign: 'another_campaign' },
    { ...campaign, traffic_attribution_version: 'other' },
    { ...campaign, traffic_source_kind: 'referrer' },
  ])('does not invent research classification for incomplete or different evidence', properties => {
    expect(isResearchTrafficEvent({ anonymous_id: 'normal-customer', properties })).toBe(false);
  });

  it('separates complete marked journeys without deleting or mutating input rows', () => {
    const rows = [
      { anonymous_id: 'study-browser', properties: {} },
      { anonymous_id: 'study-browser', properties: campaign },
      { anonymous_id: 'study-browser', properties: null },
      { anonymous_id: 'research_observation_v1_private', properties: {} },
      { anonymous_id: 'ordinary', properties: { utm_source: null } },
      { anonymous_id: 'legacy', properties: undefined },
    ];
    const before = JSON.stringify(rows);
    expect(filterResearchTrafficEvents(rows)).toEqual({
      events: rows.slice(4), excludedBrowserCount: 2, excludedEventCount: 4,
    });
    expect(JSON.stringify(rows)).toBe(before);
  });
});
