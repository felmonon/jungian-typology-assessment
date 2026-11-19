import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { describe, expect, it } from 'vitest';
import { seoLandingPages } from '../../scripts/seo-data.mjs';
import { CANONICAL_OVERRIDES } from '../../scripts/seo-canonical.mjs';
import { buildSitemapEntries, isListable, readPageMeta } from '../../scripts/sitemap-entries';

const publicDir = join(__dirname, '..', '..', 'public');

// Reads the committed public/ output only, so the test does not depend on a
// local dist/ build. git dates are stubbed so it also runs without history.
const entries = buildSitemapEntries({ roots: [publicDir], gitDate: () => undefined });
const listed = new Set(entries.map((entry) => entry.loc));

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });
}

const urlPathFor = (file: string) => {
  const rel = relative(publicDir, file).replace(/\\/g, '/');
  if (rel === 'blog/index.html') return '/blog/';
  return `/${rel.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`;
};

describe('sitemap completeness', () => {
  it('lists every indexable, self-canonical page in public/', () => {
    const missing = htmlFiles(publicDir)
      .filter((file) => !/^\/(404|google[\w-]*)$/.test(urlPathFor(file)))
      .filter((file) => {
        const meta = readPageMeta(readFileSync(file, 'utf8'));
        return isListable(urlPathFor(file), meta);
      })
      .map(urlPathFor)
      .filter((loc) => !listed.has(loc));

    expect(missing).toEqual([]);
  });

  it('includes every "X vs Y test" comparison page', () => {
    const comparisons = seoLandingPages.map((page) => page.slug).filter((slug) => /^[a-z]+-vs-[a-z]+-test$/.test(slug));
    expect(comparisons.length).toBeGreaterThanOrEqual(14);
    for (const slug of comparisons) expect(listed).toContain(`/${slug}`);
  });

  it('includes the trust pages', () => {
    for (const loc of ['/', '/pricing', '/sample-report', '/about', '/privacy', '/terms']) expect(listed).toContain(loc);
  });

  it('leaves out pages whose canonical points at another page, and lists the page they point at', () => {
    for (const [duplicate, main] of Object.entries(CANONICAL_OVERRIDES)) {
      expect(listed).not.toContain(duplicate);
      expect(listed).toContain(main);
    }
  });

  it('lists each URL once', () => {
    expect(listed.size).toBe(entries.length);
  });

  it('dates pages by their own content, not one shared build date', () => {
    const dates = entries.map((entry) => entry.lastmod).filter(Boolean);
    expect(dates.length).toBeGreaterThan(entries.length * 0.9);
    expect(new Set(dates).size).toBeGreaterThan(3);
    for (const date of dates) expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('isListable', () => {
  it('drops noindex pages and pages canonical to another URL', () => {
    expect(isListable('/a', { canonical: 'https://typejung.com/a' })).toBe(true);
    expect(isListable('/a', { canonical: 'https://typejung.com/b' })).toBe(false);
    expect(isListable('/a', { canonical: 'https://typejung.com/a', robots: 'noindex, follow' })).toBe(false);
    expect(isListable('/blog/', { canonical: 'https://typejung.com/blog/' })).toBe(true);
  });
});

describe('duplicate clusters', () => {
  it('points each duplicate at a main page that is canonical to itself', () => {
    for (const [duplicate, main] of Object.entries(CANONICAL_OVERRIDES)) {
      const file = (path: string) => path.startsWith('/blog/') ? join(publicDir, `${path}.html`) : join(publicDir, path, 'index.html');
      expect(readPageMeta(readFileSync(file(duplicate), 'utf8')).canonical).toBe(`https://typejung.com${main}`);
      expect(readPageMeta(readFileSync(file(main), 'utf8')).canonical).toBe(`https://typejung.com${main}`);
    }
  });
});
