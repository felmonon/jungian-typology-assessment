// @vitest-environment node
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import Stripe from 'stripe';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  buildQuery,
  compileApiRewrites,
  createApiMiddleware,
  createStaticPageMiddleware,
  loadServerEnv,
  parseBody,
  resolveApiRoute,
  rewriteApiPath,
  type ApiModule,
} from '../../scripts/dev-api';

const repoRoot = path.resolve(__dirname, '../..');
const repoApiDir = path.join(repoRoot, 'api');
const vercelConfig = JSON.parse(fs.readFileSync(path.join(repoRoot, 'vercel.json'), 'utf8'));
const repoRewrites = compileApiRewrites(vercelConfig);

const relative = (file: string | undefined) => file && path.relative(repoRoot, file).split(path.sep).join('/');

function resolveLikeProduction(pathname: string) {
  const direct = resolveApiRoute(repoApiDir, pathname);
  if (direct) return direct;
  const rewritten = rewriteApiPath(repoRewrites, pathname);
  return rewritten ? resolveApiRoute(repoApiDir, rewritten) : null;
}

type Middleware = (req: http.IncomingMessage, res: http.ServerResponse, next: (error?: unknown) => void) => void;

async function serve(middlewares: Middleware[]) {
  const server = http.createServer((req, res) => {
    const run = (index: number) => {
      const middleware = middlewares[index];
      if (!middleware) {
        res.statusCode = 299;
        res.end('fell through');
        return;
      }
      middleware(req, res, () => run(index + 1));
    };
    run(0);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as { port: number };

  const request = (
    method: string,
    pathname: string,
    options: { headers?: Record<string, string>; body?: string | Buffer } = {},
  ) => new Promise<{ status: number; headers: http.IncomingHttpHeaders; text: string }>((resolve, reject) => {
    const outgoing = http.request({ host: '127.0.0.1', port, method, path: pathname, headers: options.headers }, (incoming) => {
      const chunks: Buffer[] = [];
      incoming.on('data', (chunk: Buffer) => chunks.push(chunk));
      incoming.on('end', () => resolve({
        status: incoming.statusCode ?? 0,
        headers: incoming.headers,
        text: Buffer.concat(chunks).toString(),
      }));
    });
    outgoing.on('error', reject);
    outgoing.end(options.body);
  });

  return { request, close: () => new Promise<void>((resolve) => server.close(() => resolve())) };
}

describe('API routing for the functions in this repository', () => {
  it.each([
    ['/api/leaderboard', 'api/leaderboard.ts', {}],
    ['/api/premium-status', 'api/premium-status.ts', {}],
    ['/api/results', 'api/results.ts', {}],
    ['/api/chat', 'api/chat.ts', {}],
    ['/api/auth/user', 'api/auth/[action].ts', { action: 'user' }],
    ['/api/ai/free-analysis', 'api/ai/[action].ts', { action: 'free-analysis' }],
    ['/api/admin/stats', 'api/admin/[action].ts', { action: 'stats' }],
    ['/api/share/Ab-9_x', 'api/share/[slug].ts', { slug: 'Ab-9_x' }],
    // Share slugs are base64url, so one can begin with an underscore.
    ['/api/share/_Ab9', 'api/share/[slug].ts', { slug: '_Ab9' }],
  ])('routes %s to %s', (pathname, file, params) => {
    const route = resolveApiRoute(repoApiDir, pathname);
    expect(relative(route?.file)).toBe(file);
    expect(route?.params).toEqual(params);
  });

  it.each(['/api/_lib/supabase', '/api/_lib', '/api/nope', '/api', '/api/ai', '/apiary', '/api/share/a/b'])(
    'has no function for %s',
    (pathname) => {
      expect(resolveApiRoute(repoApiDir, pathname)).toBeNull();
    },
  );

  it.each([
    ['/api/stripe/webhook', 'api/webhook.ts', {}],
    ['/api/lifecycle-email', 'api/auth/[action].ts', { action: 'lifecycle-email' }],
    ['/api/recovery-emails', 'api/auth/[action].ts', { action: 'recovery-emails' }],
    ['/api/unsubscribe', 'api/auth/[action].ts', { action: 'unsubscribe' }],
    ['/api/profile', 'api/auth/[action].ts', { action: 'profile' }],
    ['/api/auth/google/callback', 'api/auth/[action].ts', { action: 'google-callback' }],
  ])('follows the vercel.json rewrite for %s', (pathname, file, params) => {
    const route = resolveLikeProduction(pathname);
    expect(relative(route?.file)).toBe(file);
    expect(route?.params).toEqual(params);
  });

  it('resolves every literal /api rewrite and cron path in vercel.json to a function', () => {
    const rewriteSources: string[] = vercelConfig.rewrites
      .filter((rewrite: { source: string; destination: string }) =>
        rewrite.destination.startsWith('/api/') && rewrite.source !== rewrite.destination && !rewrite.source.includes(':'))
      .map((rewrite: { source: string }) => rewrite.source);
    const cronPaths: string[] = vercelConfig.crons.map((cron: { path: string }) => cron.path);

    expect(rewriteSources.length).toBeGreaterThan(0);
    expect(cronPaths.length).toBeGreaterThan(0);
    for (const pathname of [...rewriteSources, ...cronPaths]) {
      expect(resolveLikeProduction(pathname), pathname).not.toBeNull();
    }
  });

  it('ignores rewrites to static pages and the identity /api rewrite', () => {
    expect(rewriteApiPath(repoRewrites, '/assessment')).toBeNull();
    expect(rewriteApiPath(repoRewrites, '/api/leaderboard')).toBeNull();
  });
});

describe('rewrite patterns', () => {
  const rewrites = compileApiRewrites({
    rewrites: [
      { source: '/api/v1/:name', destination: '/api/items/:name' },
      { source: '/api/files/:path*', destination: '/api/download/:path*' },
      { source: '/api/a.b', destination: '/api/dotted' },
      { source: '/landing', destination: '/landing/index.html' },
      { source: 42, destination: '/api/broken' },
    ],
  });

  it('substitutes named and wildcard parameters', () => {
    expect(rewriteApiPath(rewrites, '/api/v1/abc')).toBe('/api/items/abc');
    expect(rewriteApiPath(rewrites, '/api/v1/abc/def')).toBeNull();
    expect(rewriteApiPath(rewrites, '/api/files/a/b/c')).toBe('/api/download/a/b/c');
  });

  it('treats other characters in the source literally', () => {
    expect(rewriteApiPath(rewrites, '/api/a.b')).toBe('/api/dotted');
    expect(rewriteApiPath(rewrites, '/api/axb')).toBeNull();
  });

  it('tolerates a missing or malformed rewrites list', () => {
    expect(compileApiRewrites(null)).toEqual([]);
    expect(compileApiRewrites({ rewrites: 'nope' })).toEqual([]);
    expect(rewrites).toHaveLength(3);
  });
});

describe('request helpers', () => {
  it('parses a body the way Vercel does for each content type', () => {
    expect(parseBody(Buffer.from('{"a":1}'), 'application/json; charset=utf-8')).toEqual({ a: 1 });
    expect(parseBody(Buffer.alloc(0), 'application/json')).toEqual({});
    expect(parseBody(Buffer.from('a=1&b=2&b=3'), 'application/x-www-form-urlencoded')).toEqual({ a: '1', b: ['2', '3'] });
    expect(parseBody(Buffer.from('hello'), 'text/plain')).toBe('hello');
    expect(parseBody(Buffer.alloc(0), undefined)).toBe('');
    expect(parseBody(Buffer.from([1, 2]), 'application/octet-stream')).toEqual(Buffer.from([1, 2]));
    expect(parseBody(Buffer.from('<a/>'), 'application/xml')).toBeUndefined();
  });

  it('raises a 400 for malformed JSON', () => {
    expect(() => parseBody(Buffer.from('{bad'), 'application/json')).toThrowError(
      expect.objectContaining({ statusCode: 400, message: 'Invalid JSON' }),
    );
  });

  it('collects repeated query keys and lets route parameters win', () => {
    const query = buildQuery(new URLSearchParams('tag=a&tag=b&id=query&__proto__=x'), { id: 'route' });
    expect(query.tag).toEqual(['a', 'b']);
    expect(query.id).toBe('route');
    expect(Object.getPrototypeOf(query)).toBe(Object.prototype);
  });
});

describe('API middleware', () => {
  let root: string;
  let server: Awaited<ReturnType<typeof serve>>;
  const onError = vi.fn();
  const webhookSecret = 'whsec_dev_api_test';

  const modules: Record<string, ApiModule> = {
    'echo.ts': {
      default: (req: any, res: any) => {
        res.setHeader('X-Handler', 'echo');
        return res.status(201).json({ method: req.method, query: req.query, body: req.body, cookies: req.cookies });
      },
    },
    'raw.ts': {
      config: { api: { bodyParser: false } },
      default: async (req: any, res: any) => {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        try {
          const event = new Stripe('sk_test_dev_api').webhooks.constructEvent(
            Buffer.concat(chunks),
            req.headers['stripe-signature'],
            webhookSecret,
          );
          return res.status(200).json({ verified: event.id, parsedBody: req.body === undefined ? 'untouched' : 'parsed' });
        } catch (error: any) {
          return res.status(400).json({ error: error.message });
        }
      },
    },
    'page.ts': {
      default: (_req: any, res: any) => {
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send('<p>ok</p>');
      },
    },
    'redirect.ts': {
      default: (_req: any, res: any) => {
        res.setHeader('Set-Cookie', ['a=1; Path=/', 'b=2; Path=/']);
        return res.redirect(302, '/profile');
      },
    },
    'empty.ts': { default: (_req: any, res: any) => res.status(204).end() },
    'throws.ts': { default: () => { throw new Error('boom'); } },
    'no-default.ts': {},
    'items/[id].ts': { default: (req: any, res: any) => res.json({ route: 'dynamic', id: req.query.id }) },
    'items/special.ts': { default: (_req: any, res: any) => res.json({ route: 'static' }) },
    'nested/index.ts': { default: (_req: any, res: any) => res.json({ route: 'index' }) },
    '_lib/secret.ts': { default: (_req: any, res: any) => res.json({ route: 'private' }) },
  };

  beforeAll(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'typejung-dev-api-'));
    for (const file of Object.keys(modules)) {
      const target = path.join(root, 'api', file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, '');
    }
    fs.writeFileSync(path.join(root, 'vercel.json'), JSON.stringify({
      rewrites: [
        { source: '/api/legacy/echo', destination: '/api/echo' },
        { source: '/api/v1/:name', destination: '/api/items/:name' },
        { source: '/api/:path*', destination: '/api/:path*' },
      ],
    }));

    server = await serve([createApiMiddleware({
      root,
      loadModule: async (file) => modules[path.relative(path.join(root, 'api'), file).split(path.sep).join('/')],
      onError,
    })]);
  });

  afterAll(async () => {
    await server.close();
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('gives handlers a parsed JSON body, merged query, cookies and the response helpers', async () => {
    const response = await server.request('POST', '/api/echo?tag=a&tag=b', {
      headers: { 'content-type': 'application/json', cookie: 'sid=s%3Aabc; theme=dark' },
      body: JSON.stringify({ tier: 'insight', nested: { ok: true } }),
    });

    expect(response.status).toBe(201);
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.headers['x-handler']).toBe('echo');
    expect(JSON.parse(response.text)).toEqual({
      method: 'POST',
      query: { tag: ['a', 'b'] },
      body: { tier: 'insight', nested: { ok: true } },
      cookies: { sid: 's:abc', theme: 'dark' },
    });
  });

  it('parses form posts and leaves a request without a content type unparsed', async () => {
    const form = await server.request('POST', '/api/echo', {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'List-Unsubscribe=One-Click',
    });
    expect(JSON.parse(form.text).body).toEqual({ 'List-Unsubscribe': 'One-Click' });

    const bare = await server.request('GET', '/api/echo');
    expect(JSON.parse(bare.text).body).toBe('');
  });

  it('answers 400 when a handler reads a malformed JSON body and does not handle the error', async () => {
    const response = await server.request('POST', '/api/echo', {
      headers: { 'content-type': 'application/json' },
      body: '{"tier": ',
    });

    expect(response.status).toBe(400);
    expect(JSON.parse(response.text)).toEqual({ error: 'Invalid JSON' });
    expect(onError).not.toHaveBeenCalled();
  });

  it('hands a handler that disables body parsing the exact bytes that were signed', async () => {
    const payload = JSON.stringify({ id: 'evt_dev_api', object: 'event', type: 'payment_intent.succeeded', note: 'é ✓ '.repeat(500) });
    const signature = new Stripe('sk_test_dev_api').webhooks.generateTestHeaderString({ payload, secret: webhookSecret });

    const verified = await server.request('POST', '/api/raw', {
      headers: { 'content-type': 'application/json; charset=utf-8', 'stripe-signature': signature },
      body: payload,
    });
    expect(verified.status).toBe(200);
    expect(JSON.parse(verified.text)).toEqual({ verified: 'evt_dev_api', parsedBody: 'untouched' });

    const tampered = await server.request('POST', '/api/raw', {
      headers: { 'content-type': 'application/json; charset=utf-8', 'stripe-signature': signature },
      body: payload.replace('evt_dev_api', 'evt_forged'),
    });
    expect(tampered.status).toBe(400);
  });

  it('prefers a static file over a dynamic one and passes the dynamic segment as a query parameter', async () => {
    expect(JSON.parse((await server.request('GET', '/api/items/special')).text)).toEqual({ route: 'static' });
    expect(JSON.parse((await server.request('GET', '/api/items/a%20b?id=ignored')).text)).toEqual({ route: 'dynamic', id: 'a b' });
    expect(JSON.parse((await server.request('GET', '/api/nested')).text)).toEqual({ route: 'index' });
  });

  it('applies vercel.json rewrites only when no function file matches', async () => {
    expect(JSON.parse((await server.request('POST', '/api/legacy/echo?x=1')).text).query).toEqual({ x: '1' });
    expect(JSON.parse((await server.request('GET', '/api/v1/42')).text)).toEqual({ route: 'dynamic', id: '42' });
  });

  it('keeps underscore-prefixed files private and reports unknown functions as 404', async () => {
    for (const pathname of ['/api/_lib/secret', '/api/missing', '/api']) {
      const response = await server.request('GET', pathname);
      expect(response.status, pathname).toBe(404);
      expect(JSON.parse(response.text)).toEqual({ error: `No API function matches ${pathname}` });
    }
  });

  it('supports send, redirect and empty responses', async () => {
    const page = await server.request('GET', '/api/page');
    expect(page.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(page.text).toBe('<p>ok</p>');

    const redirect = await server.request('GET', '/api/redirect');
    expect(redirect.status).toBe(302);
    expect(redirect.headers.location).toBe('/profile');
    expect(redirect.headers['set-cookie']).toEqual(['a=1; Path=/', 'b=2; Path=/']);

    const empty = await server.request('OPTIONS', '/api/empty');
    expect(empty.status).toBe(204);
    expect(empty.text).toBe('');
  });

  it('turns a crashing or malformed handler into a logged 500 without leaking the error', async () => {
    const crashed = await server.request('GET', '/api/throws');
    expect(crashed.status).toBe(500);
    expect(JSON.parse(crashed.text)).toEqual({ error: 'Internal Server Error' });
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'boom' }));

    const invalid = await server.request('GET', '/api/no-default');
    expect(invalid.status).toBe(500);
    expect(onError).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'api/no-default.ts does not export a default handler' }));
  });

  it('leaves everything outside /api to the next middleware', async () => {
    expect((await server.request('GET', '/assessment')).status).toBe(299);
    expect((await server.request('GET', '/apiary')).status).toBe(299);
  });
});

describe('static landing pages', () => {
  let root: string;
  let server: Awaited<ReturnType<typeof serve>>;

  beforeAll(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'typejung-dev-static-'));
    const publicDir = path.join(root, 'public');
    fs.mkdirSync(path.join(publicDir, 'landing'), { recursive: true });
    fs.mkdirSync(path.join(publicDir, 'blog'), { recursive: true });
    fs.writeFileSync(path.join(publicDir, 'landing', 'index.html'), '<h1>Landing</h1>');
    fs.writeFileSync(path.join(publicDir, 'blog', 'post.html'), '<h1>Post</h1>');
    fs.writeFileSync(path.join(root, 'secret.html'), '<h1>Outside public</h1>');
    server = await serve([createStaticPageMiddleware(publicDir)]);
  });

  afterAll(async () => {
    await server.close();
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('serves generated pages at their clean URLs', async () => {
    const landing = await server.request('GET', '/landing');
    expect(landing.status).toBe(200);
    expect(landing.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(landing.text).toBe('<h1>Landing</h1>');
    expect((await server.request('GET', '/landing/')).text).toBe('<h1>Landing</h1>');
    expect((await server.request('GET', '/blog/post?utm_source=test')).text).toBe('<h1>Post</h1>');
    expect((await server.request('HEAD', '/landing')).text).toBe('');
  });

  it('falls through for app routes, assets, API paths, writes and paths outside public', async () => {
    for (const [method, pathname] of [
      ['GET', '/'],
      ['GET', '/results'],
      ['GET', '/landing/index.html'],
      ['GET', '/api/landing'],
      ['POST', '/landing'],
      ['GET', '/..%2Fsecret'],
      ['GET', '/landing/..%2F..%2Fsecret'],
      ['GET', '/%E0%A4%A'],
    ]) {
      expect((await server.request(method, pathname)).status, `${method} ${pathname}`).toBe(299);
    }
  });
});

describe('server env loading', () => {
  it('loads env files without overriding the shell, most specific file first', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'typejung-dev-env-'));
    fs.writeFileSync(path.join(root, '.env'), 'TJ_DEV_API_BASE=base\nTJ_DEV_API_SHARED=from-env\nTJ_DEV_API_SHELL=from-env\n');
    fs.writeFileSync(path.join(root, '.env.local'), 'TJ_DEV_API_SHARED=from-local\n');
    process.env.TJ_DEV_API_SHELL = 'from-shell';

    try {
      expect(loadServerEnv(root, 'development')).toEqual(['.env.local', '.env']);
      expect(process.env.TJ_DEV_API_BASE).toBe('base');
      expect(process.env.TJ_DEV_API_SHARED).toBe('from-local');
      expect(process.env.TJ_DEV_API_SHELL).toBe('from-shell');
      expect(loadServerEnv(path.join(root, 'missing'), 'development')).toEqual([]);
    } finally {
      delete process.env.TJ_DEV_API_BASE;
      delete process.env.TJ_DEV_API_SHARED;
      delete process.env.TJ_DEV_API_SHELL;
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
