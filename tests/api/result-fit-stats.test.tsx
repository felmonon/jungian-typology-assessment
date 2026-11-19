import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../../api/create-checkout-session';
import {
  RESULT_FIT_MIN_REACTIONS,
  resetResultFitStatsCache,
  summarizeResultReactions,
} from '../../api/_lib/result-fit-stats';
import {
  parseResultFitStats,
  resetResultFitRequestCache,
  RESULT_FIT_STATS_URL,
  ResultFitNote,
} from '../../components/discount/ResultFitNote';

const { rows } = vi.hoisted(() => ({ rows: { value: [] as unknown[] } }));

vi.mock('../../api/_lib/supabase', () => {
  const builder: any = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => Promise.resolve({ data: rows.value, error: null }),
  };
  return {
    hasSupabaseAdminConfig: () => true,
    getSupabaseAdminClient: () => ({ from: () => builder }),
  };
});

const reactions = (yes: number, other: number) => [
  ...Array.from({ length: yes }, (_, i) => ({ anonymous_id: `yes_${i}`, properties: { reaction: 'yes' } })),
  ...Array.from({ length: other }, (_, i) => ({ anonymous_id: `other_${i}`, properties: { reaction: i % 2 ? 'somewhat' : 'not_yet' } })),
];

const response = () => {
  const res: any = { statusCode: 200, body: null, headers: {} as Record<string, string> };
  res.status = (status: number) => { res.statusCode = status; return res; };
  res.json = (body: unknown) => { res.body = body; return res; };
  res.setHeader = (key: string, value: string) => { res.headers[key] = value; };
  return res;
};

describe('result fit aggregate', () => {
  beforeEach(() => {
    resetResultFitStatsCache();
    resetResultFitRequestCache();
  });

  it('stays hidden below the minimum number of reactions', () => {
    expect(RESULT_FIT_MIN_REACTIONS).toBe(20);
    expect(summarizeResultReactions(reactions(19, 0))).toEqual({ show: false });
    expect(summarizeResultReactions(reactions(15, 5))).toEqual({ show: true, percentYes: 75, total: 20 });
  });

  it('counts each browser once, keeps its latest answer and drops research traffic', () => {
    const stats = summarizeResultReactions([
      { anonymous_id: 'repeat', properties: { reaction: 'yes' } },
      { anonymous_id: 'repeat', properties: { reaction: 'not_yet' } },
      { anonymous_id: 'research_observation_v1_lab', properties: { reaction: 'yes' } },
      { anonymous_id: null, properties: { reaction: 'not_yet' } },
      { anonymous_id: 'bad', properties: { reaction: 'maybe' } },
      ...reactions(17, 1),
    ]);
    expect(stats).toEqual({ show: true, percentYes: 90, total: 20 });
  });

  it('serves only the aggregate, cached, from the existing checkout function', async () => {
    rows.value = [
      ...reactions(16, 4).map((row) => ({ ...row, occurred_at: '2026-11-01T00:00:00Z' })),
    ];
    const res = response();
    await handler({ method: 'GET', query: { view: 'result-fit' }, headers: {} } as any, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ show: true, percentYes: 80, total: 20 });
    expect(Object.keys(res.body).sort()).toEqual(['percentYes', 'show', 'total']);
    expect(res.headers['Cache-Control']).toMatch(/s-maxage=\d+/);
  });

  it('keeps POST-only behaviour for other GET requests', async () => {
    const res = response();
    await handler({ method: 'GET', query: {}, headers: {} } as any, res);
    expect(res.statusCode).toBe(405);
  });

  it('rejects malformed client payloads', () => {
    expect(parseResultFitStats({ show: true, percentYes: 80, total: 5 })).toEqual({ show: false });
    expect(parseResultFitStats({ show: true, percentYes: 180, total: 50 })).toEqual({ show: false });
    expect(parseResultFitStats(null)).toEqual({ show: false });
    expect(parseResultFitStats({ show: true, percentYes: 79.6, total: 50 })).toEqual({ show: true, percentYes: 80, total: 50 });
  });

  it('renders the share when shown and nothing when hidden', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({ show: true, percentYes: 82, total: 140 }) } as Response);
    const { container, unmount } = render(<ResultFitNote />);
    await waitFor(() => expect(screen.getByText('82%')).toBeInTheDocument());
    expect(container.textContent).toContain('of 140 people who rated their free map said it named something real');
    expect(fetch).toHaveBeenCalledWith(RESULT_FIT_STATS_URL, expect.anything());
    unmount();

    resetResultFitRequestCache();
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({ show: false }) } as Response);
    const hidden = render(<ResultFitNote />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(hidden.container).toBeEmptyDOMElement();
  });
});
