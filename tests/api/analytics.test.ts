import { describe, expect, it, vi } from 'vitest';
import { track } from '@vercel/analytics/server';
import handler from '../../api/analytics';
import { normalizeAnalyticsEvent } from '../../api/_lib/analytics-event';

vi.mock('@vercel/analytics/server', () => ({
  track: vi.fn(() => Promise.resolve()),
}));

function createResponse() {
  const response: any = {
    headers: {},
    statusCode: 200,
    body: undefined,
    setHeader: vi.fn((key: string, value: string) => {
      response.headers[key] = value;
      return response;
    }),
    status: vi.fn((statusCode: number) => {
      response.statusCode = statusCode;
      return response;
    }),
    json: vi.fn((body: unknown) => {
      response.body = body;
      return response;
    }),
  };

  return response;
}

describe('analytics event normalization', () => {
  it('keeps creator safe-mention attribution and drops arbitrary fields', () => {
    const normalized = normalizeAnalyticsEvent({
      event: 'creator_safe_mention_copied',
      copyId: 'creator-preview-copy-1',
      snippetLabel: 'Short social post',
      publicPath: '/mbti-mistype-test',
      pagePath: '/creator-preview',
      utmSource: 'Joyce Meng / YouTube',
      utmCampaign: 'creator_outreach_2026_05',
      parentSource: 'creator_review_invite',
      sourceChain: 'creator_review_invite>creator_safe_mention',
      email: 'private@example.com',
    });

    expect(normalized).toEqual({
      eventName: 'creator_safe_mention_copied',
      properties: {
        source: 'creator_share_kit',
        copy_id: 'creator-preview-copy-1',
        snippet_label: 'Short social post',
        public_path: '/mbti-mistype-test',
        page_path: '/creator-preview',
        utm_source: 'Joyce_Meng_YouTube',
        utm_campaign: 'creator_outreach_2026_05',
        parent_source: 'creator_review_invite',
        source_chain: 'creator_review_invite>creator_safe_mention',
      },
    });
    expect(normalized?.properties).not.toHaveProperty('email');
  });

  it('normalizes existing web-vitals beacon payloads', () => {
    expect(normalizeAnalyticsEvent({
      name: 'LCP',
      value: 1234.56,
      delta: 100,
      rating: 'good',
      id: 'lcp-123',
    })).toEqual({
      eventName: 'web_vital_reported',
      properties: {
        metric_name: 'LCP',
        metric_value: 1234.56,
        metric_delta: 100,
        metric_rating: 'good',
        metric_id: 'lcp-123',
      },
    });
  });

  it('rejects unknown analytics events', () => {
    expect(normalizeAnalyticsEvent({
      event: 'newsletter_signup',
      email: 'private@example.com',
    })).toBeNull();
  });
});

describe('analytics API handler', () => {
  it('tracks a sanitized creator safe-mention event', async () => {
    const response = createResponse();

    await handler({
      method: 'POST',
      body: {
        event: 'creator_safe_mention_copied',
        copyId: 'creator-preview-copy-2',
        utmSource: 'joyce_meng',
        utmCampaign: 'creator_outreach_2026_05',
        parentSource: 'creator_review_invite',
        sourceChain: 'creator_review_invite>creator_safe_mention',
      },
      headers: {
        'x-forwarded-for': '203.0.113.10',
      },
      socket: {},
    } as any, response);

    expect(response.statusCode).toBe(202);
    expect(response.body).toEqual({ ok: true, event: 'creator_safe_mention_copied' });
    expect(track).toHaveBeenCalledWith('creator_safe_mention_copied', expect.objectContaining({
      copy_id: 'creator-preview-copy-2',
      utm_source: 'joyce_meng',
      utm_campaign: 'creator_outreach_2026_05',
      parent_source: 'creator_review_invite',
      source_chain: 'creator_review_invite>creator_safe_mention',
    }));
  });

  it('rejects invalid events', async () => {
    const response = createResponse();

    await handler({
      method: 'POST',
      body: { event: 'unsupported', email: 'private@example.com' },
      headers: {
        'x-forwarded-for': '203.0.113.11',
      },
      socket: {},
    } as any, response);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid analytics event' });
  });
});
