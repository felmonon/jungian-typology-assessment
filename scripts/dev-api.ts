// Local stand-in for the Vercel function runtime.
//
// `npm run dev` serves the SPA through Vite and answers /api/* with the same
// handlers in api/ that production deploys, so there is one backend to keep
// correct. Routing follows Vercel's filesystem rules plus the /api rewrites in
// vercel.json, and every request gets the req/res helpers the handlers use.
import fs from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { parse as parseFormBody } from 'node:querystring';
import { config as loadDotenvFile } from 'dotenv';
import type { Connect, Plugin } from 'vite';

const API_PREFIX = '/api';
const HANDLER_EXTENSIONS = ['.ts', '.js', '.mjs'];
// Vercel rejects larger request bodies before a function runs.
const MAX_BODY_BYTES = 4.5 * 1024 * 1024;

export type ApiQuery = Record<string, string | string[]>;
export type ApiRoute = { file: string; params: Record<string, string> };
export type ApiRewrite = { source: RegExp; destination: string };
export type ApiModule = {
  default?: unknown;
  config?: { api?: { bodyParser?: boolean } };
};

type HttpError = Error & { statusCode: number };

type ApiMiddlewareOptions = {
  root: string;
  loadModule: (file: string) => Promise<ApiModule>;
  onResponse?: (entry: { method: string; path: string; status: number; ms: number }) => void;
  onError?: (error: unknown) => void;
};

function isFile(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function httpError(statusCode: number, message: string): HttpError {
  return Object.assign(new Error(message), { statusCode });
}

function isApiPath(pathname: string): boolean {
  return pathname === API_PREFIX || pathname.startsWith(`${API_PREFIX}/`);
}

// Vercel never routes to files or folders that start with "_" or ".", which is
// what keeps api/_lib private.
function isPrivateName(name: string): boolean {
  return name.startsWith('_') || name.startsWith('.');
}

function dynamicParam(name: string): string | null {
  return /^\[([^\]]+)\]$/.exec(name)?.[1] ?? null;
}

function readRouteEntries(dir: string) {
  const files = new Map<string, string>();
  const dirs: string[] = [];
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    // A missing directory simply has no routes.
  }

  for (const entry of entries) {
    if (isPrivateName(entry.name)) continue;
    if (entry.isDirectory()) {
      dirs.push(entry.name);
      continue;
    }
    const extension = path.extname(entry.name);
    if (!entry.isFile() || !HANDLER_EXTENSIONS.includes(extension) || entry.name.endsWith('.d.ts')) continue;
    const routeName = entry.name.slice(0, -extension.length);
    if (!files.has(routeName)) files.set(routeName, entry.name);
  }

  return { files, dirs };
}

function matchSegments(dir: string, segments: string[], params: Record<string, string>): ApiRoute | null {
  const [segment, ...rest] = segments;
  const { files, dirs } = readRouteEntries(dir);
  // A static name wins over a dynamic [param] at the same level.
  const ordered = (names: Iterable<string>) => {
    const all = [...names];
    return [...all.filter((name) => name === segment), ...all.filter((name) => dynamicParam(name) !== null)];
  };
  const withParam = (name: string) => {
    const param = dynamicParam(name);
    return param ? { ...params, [param]: segment } : params;
  };

  if (rest.length === 0) {
    const fileRoute = ordered(files.keys())[0];
    if (fileRoute !== undefined) {
      return { file: path.join(dir, files.get(fileRoute)!), params: withParam(fileRoute) };
    }
    for (const name of ordered(dirs)) {
      const indexFile = readRouteEntries(path.join(dir, name)).files.get('index');
      if (indexFile) return { file: path.join(dir, name, indexFile), params: withParam(name) };
    }
    return null;
  }

  for (const name of ordered(dirs)) {
    const route = matchSegments(path.join(dir, name), rest, withParam(name));
    if (route) return route;
  }
  return null;
}

// Maps a request path to the function file Vercel would run for it. Request
// segments are only ever compared with directory entries or passed on as
// parameter values; they are never joined into a filesystem path.
export function resolveApiRoute(apiDir: string, pathname: string): ApiRoute | null {
  if (!isApiPath(pathname)) return null;

  let segments: string[];
  try {
    segments = pathname.slice(API_PREFIX.length).split('/').filter(Boolean).map(decodeURIComponent);
  } catch {
    return null;
  }

  return matchSegments(apiDir, segments.length > 0 ? segments : ['index'], {});
}

function sourceToRegExp(source: string): RegExp {
  const pattern = source.replace(
    /:([A-Za-z_]\w*)(\*)?|[.*+?^${}()|[\]\\]/g,
    (match, name: string | undefined, wildcard: string | undefined) => {
      if (!name) return `\\${match}`;
      return wildcard ? `(?<${name}>.*)` : `(?<${name}>[^/]+)`;
    },
  );
  return new RegExp(`^${pattern}$`);
}

// Keeps only the vercel.json rewrites that send a request to a function.
// Rewrites to static pages are covered by createStaticPageMiddleware.
export function compileApiRewrites(vercelConfig: unknown): ApiRewrite[] {
  const rewrites = (vercelConfig as { rewrites?: unknown } | null)?.rewrites;
  if (!Array.isArray(rewrites)) return [];

  return rewrites.flatMap((rewrite) => {
    const source: unknown = rewrite?.source;
    const destination: unknown = rewrite?.destination;
    if (typeof source !== 'string' || typeof destination !== 'string') return [];
    if (!isApiPath(destination) || source === destination) return [];
    try {
      return [{ source: sourceToRegExp(source), destination }];
    } catch {
      return [];
    }
  });
}

export function rewriteApiPath(rewrites: ApiRewrite[], pathname: string): string | null {
  for (const rewrite of rewrites) {
    const match = rewrite.source.exec(pathname);
    if (!match) continue;
    return rewrite.destination.replace(/:([A-Za-z_]\w*)\*?/g, (_param, name: string) => match.groups?.[name] ?? '');
  }
  return null;
}

function readApiRewrites(root: string): () => ApiRewrite[] {
  const file = path.join(root, 'vercel.json');
  let cached: { mtimeMs: number; rewrites: ApiRewrite[] } | null = null;

  return () => {
    const stat = fs.statSync(file, { throwIfNoEntry: false });
    if (!stat) return [];
    if (cached?.mtimeMs !== stat.mtimeMs) {
      let rewrites: ApiRewrite[] = [];
      try {
        rewrites = compileApiRewrites(JSON.parse(fs.readFileSync(file, 'utf8')));
      } catch {
        // An unreadable vercel.json contributes no rewrites.
      }
      cached = { mtimeMs: stat.mtimeMs, rewrites };
    }
    return cached.rewrites;
  };
}

export function buildQuery(search: URLSearchParams, params: Record<string, string>): ApiQuery {
  const query: ApiQuery = Object.create(null);
  for (const [key, value] of search) {
    const existing = query[key];
    if (existing === undefined) query[key] = value;
    else query[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
  }
  return { ...query, ...params };
}

// Same content-type handling as Vercel's helpers, including the 400 that a
// malformed JSON body raises the first time a handler reads req.body.
export function parseBody(raw: Buffer, contentType: string | undefined): unknown {
  const type = (contentType ?? 'text/plain').split(';')[0].trim().toLowerCase();

  if (type === 'application/json') {
    const text = raw.toString();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      throw httpError(400, 'Invalid JSON');
    }
  }
  if (type === 'application/octet-stream') return raw;
  if (type === 'application/x-www-form-urlencoded') return parseFormBody(raw.toString());
  if (type === 'text/plain') return raw.toString();
  return undefined;
}

function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const pair of (header ?? '').split(';')) {
    const index = pair.indexOf('=');
    if (index === -1) continue;
    const name = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    if (!name) continue;
    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
  }
  return cookies;
}

function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size <= MAX_BODY_BYTES) chunks.push(chunk);
    });
    req.on('end', () => {
      if (size > MAX_BODY_BYTES) reject(httpError(413, 'Request body exceeds the 4.5 MB function limit'));
      else resolve(Buffer.concat(chunks));
    });
    req.on('error', reject);
  });
}

function defineLazy(target: object, key: string, compute: () => unknown) {
  const settle = (value: unknown) =>
    Object.defineProperty(target, key, { configurable: true, enumerable: true, writable: true, value });

  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    get: () => {
      const value = compute();
      settle(value);
      return value;
    },
    set: settle,
  });
}

function addResponseHelpers(res: ServerResponse) {
  const response = res as ServerResponse & Record<string, unknown>;

  response.status = (statusCode: number) => {
    res.statusCode = statusCode;
    return response;
  };

  response.json = (body: unknown) => {
    if (!res.hasHeader('content-type')) res.setHeader('content-type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
    return response;
  };

  response.send = (body?: unknown) => {
    if (body === null || body === undefined) {
      res.end();
    } else if (Buffer.isBuffer(body)) {
      if (!res.hasHeader('content-type')) res.setHeader('content-type', 'application/octet-stream');
      res.end(body);
    } else if (typeof body === 'string') {
      const type = res.getHeader('content-type');
      if (typeof type !== 'string') res.setHeader('content-type', 'text/html; charset=utf-8');
      else if (!/charset=/i.test(type)) res.setHeader('content-type', `${type}; charset=utf-8`);
      res.end(body);
    } else {
      (response.json as (value: unknown) => unknown)(body);
    }
    return response;
  };

  response.redirect = (statusOrUrl: number | string, url?: string) => {
    const [statusCode, location] = typeof statusOrUrl === 'string' ? [307, statusOrUrl] : [statusOrUrl, url];
    if (typeof statusCode !== 'number' || typeof location !== 'string') {
      throw new Error('res.redirect expects a URL, or a status code and a URL');
    }
    res.writeHead(statusCode, { Location: location }).end();
    return response;
  };
}

function sendError(res: ServerResponse, statusCode: number, message: string) {
  if (res.headersSent) {
    if (!res.writableEnded) res.end();
    return;
  }
  res.statusCode = statusCode;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: message }));
}

export function createApiMiddleware(options: ApiMiddlewareOptions): Connect.NextHandleFunction {
  const apiDir = path.join(options.root, 'api');
  const getRewrites = readApiRewrites(options.root);

  const handle = async (req: IncomingMessage, res: ServerResponse, url: URL) => {
    // Vercel checks the filesystem first and falls back to rewrites.
    let route = resolveApiRoute(apiDir, url.pathname);
    if (!route) {
      const rewritten = rewriteApiPath(getRewrites(), url.pathname);
      if (rewritten) route = resolveApiRoute(apiDir, rewritten);
    }
    if (!route) {
      sendError(res, 404, `No API function matches ${url.pathname}`);
      return;
    }

    const apiModule = await options.loadModule(route.file);
    const handler = apiModule.default;
    if (typeof handler !== 'function') {
      throw new Error(`${path.relative(options.root, route.file)} does not export a default handler`);
    }

    const request = req as IncomingMessage & { query?: ApiQuery };
    request.query = buildQuery(url.searchParams, route.params);
    defineLazy(request, 'cookies', () => parseCookies(req.headers.cookie));

    // A handler that opts out of body parsing (the Stripe webhook) receives the
    // untouched stream, so the bytes it verifies are the bytes that were sent.
    if (apiModule.config?.api?.bodyParser !== false) {
      const contentType = req.headers['content-type'];
      const hasBody = contentType !== undefined && req.method !== 'GET' && req.method !== 'HEAD';
      const raw = hasBody ? await readRawBody(req) : Buffer.alloc(0);
      defineLazy(request, 'body', () => parseBody(raw, contentType));
    }

    addResponseHelpers(res);
    await handler(request, res);
  };

  return (req, res, next) => {
    let url: URL;
    try {
      url = new URL(req.url ?? '/', 'http://localhost');
    } catch {
      next();
      return;
    }
    if (!isApiPath(url.pathname)) {
      next();
      return;
    }

    const startedAt = Date.now();
    res.on('finish', () => {
      // The query string can carry tokens, so only the path is reported.
      options.onResponse?.({
        method: req.method ?? 'GET',
        path: url.pathname,
        status: res.statusCode,
        ms: Date.now() - startedAt,
      });
    });

    handle(req, res, url).catch((error: unknown) => {
      // Errors that carry a client status (such as the 400 for malformed JSON)
      // are answered with it, the way Vercel does; anything else is a 500.
      const statusCode = (error as Partial<HttpError> | null)?.statusCode;
      if (typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500) {
        sendError(res, statusCode, (error as HttpError).message);
        return;
      }
      options.onError?.(error);
      sendError(res, 500, 'Internal Server Error');
    });
  };
}

// The standalone landing pages in public/ are served at their clean URLs in
// production (/jungian-test, /blog/some-post). Vite only serves public files
// by exact path, so resolve the clean URL here before the SPA fallback.
export function createStaticPageMiddleware(publicDir: string): Connect.NextHandleFunction {
  const publicRoot = path.resolve(publicDir);

  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next();
      return;
    }

    let pathname: string;
    try {
      pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    } catch {
      next();
      return;
    }

    const routePath = pathname.replace(/^\/+|\/+$/g, '');
    if (!routePath || isApiPath(pathname) || path.extname(pathname)) {
      next();
      return;
    }

    const page = [path.join(publicRoot, routePath, 'index.html'), path.join(publicRoot, `${routePath}.html`)].find(
      (candidate) => candidate.startsWith(`${publicRoot}${path.sep}`) && isFile(candidate),
    );
    if (!page) {
      next();
      return;
    }

    res.statusCode = 200;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    fs.createReadStream(page).on('error', next).pipe(res);
  };
}

// Handlers read process.env, so the env files Vite would expose to the client
// are loaded for the server side too. Values already set in the shell win, and
// only file names are ever reported.
export function loadServerEnv(root: string, mode: string): string[] {
  const candidates = [`.env.${mode}.local`, '.env.local', `.env.${mode}`, '.env'];
  return candidates.filter((file) => {
    const envPath = path.join(root, file);
    if (!fs.existsSync(envPath)) return false;
    loadDotenvFile({ path: envPath, override: false, quiet: true });
    return true;
  });
}

export function devApiPlugin(): Plugin {
  return {
    name: 'typejung:dev-api',
    apply: 'serve',
    configureServer(server) {
      const { root, mode, logger } = server.config;

      const envFiles = loadServerEnv(root, mode);
      if (envFiles.length > 0) logger.info(`  API env loaded from ${envFiles.join(', ')}`);

      // Registered ahead of Vite's own middlewares so API and static-page
      // requests are answered before the SPA fallback rewrites them.
      server.middlewares.use(createApiMiddleware({
        root,
        // ssrLoadModule compiles the TypeScript handlers and reloads them when
        // a file under api/ (or anything it imports) changes.
        loadModule: (file) => server.ssrLoadModule(`/${path.relative(root, file).split(path.sep).join('/')}`),
        onResponse: ({ method, path: requestPath, status, ms }) => {
          logger.info(`  API ${method} ${requestPath} ${status} ${ms}ms`, { timestamp: true });
        },
        onError: (error) => {
          if (error instanceof Error) server.ssrFixStacktrace(error);
          logger.error(error instanceof Error ? error.stack || error.message : String(error), { timestamp: true });
        },
      }));
      server.middlewares.use(createStaticPageMiddleware(path.join(root, 'public')));
    },
  };
}
