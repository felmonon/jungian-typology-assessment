import type { RequestHandler } from 'express';
import fs from 'fs';
import path from 'path';

const isSafeStaticCandidate = (publicDir: string, candidate: string) => {
  const publicRoot = path.resolve(publicDir);
  const resolvedCandidate = path.resolve(candidate);
  return resolvedCandidate === publicRoot || resolvedCandidate.startsWith(`${publicRoot}${path.sep}`);
};

export const serveGeneratedStaticPages = (publicDir: string): RequestHandler => {
  const publicRoot = path.resolve(publicDir);

  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api')) return next();
    if (path.extname(req.path)) return next();

    let decodedPath: string;
    try {
      decodedPath = decodeURIComponent(req.path);
    } catch {
      return next();
    }

    const routePath = decodedPath.replace(/^\/+|\/+$/g, '');
    if (!routePath) return next();

    const candidates = [
      path.join(publicRoot, routePath, 'index.html'),
      path.join(publicRoot, `${routePath}.html`),
    ];

    const staticPage = candidates.find((candidate) =>
      isSafeStaticCandidate(publicRoot, candidate) && fs.existsSync(candidate)
    );

    if (!staticPage) return next();

    return res.sendFile(staticPage);
  };
};
