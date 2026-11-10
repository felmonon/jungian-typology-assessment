import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../../api/leaderboard';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from '../../api/_lib/supabase';

vi.mock('../../api/_lib/supabase', () => ({
  getSupabaseAdminClient: vi.fn(),
  hasSupabaseAdminConfig: vi.fn(() => true),
}));

type CountResult = { count: number | null; error: { message: string } | null };

// Stands in for the Supabase client and records each query the handler builds.
function useDatabase(countFor: (func: string) => CountResult) {
  const queries: { table: string; columns: string; options: unknown; column: string; value: any }[] = [];
  vi.mocked(getSupabaseAdminClient).mockReturnValue({
    from: (table: string) => ({
      select: (columns: string, options: unknown) => ({
        contains: async (column: string, value: any) => {
          queries.push({ table, columns, options, column, value });
          return countFor(value.dominant.function);
        },
      }),
    }),
  } as any);
  return queries;
}

const counted = (counts: Record<string, number>) => (func: string): CountResult => ({ count: counts[func] ?? 0, error: null });

function response() {
  const res: any = { statusCode: 200, body: null, headers: {} };
  res.status = (status: number) => { res.statusCode = status; return res; };
  res.json = (body: unknown) => { res.body = body; return res; };
  res.setHeader = (key: string, value: string) => { res.headers[key] = value; };
  return res;
}

async function get(method = 'GET') {
  const res = response();
  await handler({ method, headers: {}, query: {} } as any, res);
  return res;
}

const CDN_CACHE = 'public, s-maxage=300, stale-while-revalidate=600';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('leaderboard', () => {
  it('ranks dominant functions by count with the same response shape as before', async () => {
    useDatabase(counted({ Ni: 5, Te: 3, Fi: 2, Se: 9 }));

    const res = await get();

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      leaderboard: [
        { function: 'Se', count: 9, title: 'Extraverted Sensation' },
        { function: 'Ni', count: 5, title: 'Introverted Intuition' },
        { function: 'Te', count: 3, title: 'Extraverted Thinking' },
        { function: 'Fi', count: 2, title: 'Introverted Feeling' },
      ],
      total: 19,
    });
    expect(Object.keys(res.body.leaderboard[0])).toEqual(['function', 'count', 'title']);
  });

  it('asks the database for one exact count per function and never loads result rows', async () => {
    const queries = useDatabase(counted({ Ni: 1 }));

    await get();

    expect(queries.map((query) => query.value.dominant.function).sort())
      .toEqual(['Fe', 'Fi', 'Ne', 'Ni', 'Se', 'Si', 'Te', 'Ti']);
    for (const query of queries) {
      expect(query).toMatchObject({
        table: 'assessment_results',
        columns: 'id',
        options: { count: 'exact', head: true },
        column: 'stack',
        value: { dominant: { function: expect.any(String) } },
      });
    }
  });

  it('lets the CDN cache a successful answer, including an empty one', async () => {
    useDatabase(counted({ Ti: 4 }));
    expect((await get()).headers['Cache-Control']).toBe(CDN_CACHE);

    useDatabase(counted({}));
    const empty = await get();
    expect(empty.body).toEqual({ leaderboard: [], total: 0 });
    expect(empty.headers['Cache-Control']).toBe(CDN_CACHE);
  });

  it('keeps functions with equal counts in a stable order', async () => {
    useDatabase(counted({ Ni: 2, Ti: 2, Fe: 2 }));

    const res = await get();

    expect(res.body.leaderboard.map((entry: { function: string }) => entry.function)).toEqual(['Ti', 'Fe', 'Ni']);
  });

  it.each([
    ['a failed count', (func: string): CountResult => (func === 'Fi' ? { count: null, error: { message: 'timeout' } } : { count: 3, error: null })],
    ['a missing count', (func: string): CountResult => (func === 'Se' ? { count: null, error: null } : { count: 3, error: null })],
  ])('answers with an empty, uncached leaderboard after %s', async (_name, countFor) => {
    useDatabase(countFor);

    const res = await get();

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ leaderboard: [], total: 0 });
    expect(res.headers).not.toHaveProperty('Cache-Control');
  });

  it('reports a missing database configuration without caching it', async () => {
    vi.mocked(hasSupabaseAdminConfig).mockReturnValueOnce(false);

    const res = await get();

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: 'Leaderboard is not configured' });
    expect(res.headers).not.toHaveProperty('Cache-Control');
  });

  it('only answers GET', async () => {
    const res = await get('POST');

    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe('GET');
    expect(res.headers).not.toHaveProperty('Cache-Control');
  });
});
