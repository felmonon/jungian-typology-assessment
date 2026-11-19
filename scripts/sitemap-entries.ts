/**
 * Every URL the sitemap lists, with a lastmod that only moves when that page's
 * own content changed.
 *
 * A page is listed when its generated HTML says it is indexable (no noindex)
 * and canonical to itself. Pages that point their canonical at a stronger page
 * (scripts/seo-canonical.mjs) are left out, so the sitemap never contradicts
 * the canonical tags.
 */

import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { seoLandingPages } from './seo-data.mjs';
import { growthBlogArticles } from './growth-blog-data.mjs';
import { libraryPages } from './jung/pages.mjs';
import { lastCommitDate } from './stable-dates.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const BASE_URL = 'https://typejung.com';
const ROOT_DIR = join(__dirname, '..');

export type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq: ChangeFreq;
  priority: number;
}

interface Candidate {
  loc: string;
  /** Generated file, relative to the published root (public/ or dist/public/). */
  file: string;
  changefreq: ChangeFreq;
  priority: number;
  /** A content date known without reading the page (legacy articles). */
  lastmod?: string;
  /** Source files whose last commit dates the page when the HTML carries no date. */
  sources?: string[];
}

export interface PageMeta {
  canonical?: string;
  robots?: string;
  dateModified?: string;
}

export function readPageMeta(html: string): PageMeta {
  return {
    canonical: html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1],
    robots: html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i)?.[1],
    dateModified: html.match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})/)?.[1],
  };
}

const absolute = (loc: string) => `${BASE_URL}${loc}`;

/** True when a page with this metadata belongs in the sitemap at this URL. */
export function isListable(loc: string, meta: PageMeta): boolean {
  if (meta.robots && /noindex/i.test(meta.robots)) return false;
  if (!meta.canonical) return true;
  return meta.canonical.replace(/\/$/, '') === absolute(loc).replace(/\/$/, '');
}

const FUNCTIONS = ['ni', 'ne', 'si', 'se', 'ti', 'te', 'fi', 'fe'];
const TYPES = [
  'intj', 'intp', 'entj', 'entp',
  'infj', 'infp', 'enfj', 'enfp',
  'istj', 'isfj', 'estj', 'esfj',
  'istp', 'isfp', 'estp', 'esfp',
];

function candidates(): Candidate[] {
  const list: Candidate[] = [
    // The app shell pages. The route HTML for these is written into dist by
    // scripts/generate-spa-route-html.mjs during the build.
    { loc: '/', file: 'index.html', changefreq: 'weekly', priority: 1.0, sources: ['index.html', 'pages/Home.tsx'] },
    { loc: '/assessment', file: 'assessment/index.html', changefreq: 'monthly', priority: 0.9 },
    { loc: '/learn', file: 'learn/index.html', changefreq: 'monthly', priority: 0.8 },
    { loc: '/pricing', file: 'pricing/index.html', changefreq: 'monthly', priority: 0.7 },
    { loc: '/sample-report', file: 'sample-report/index.html', changefreq: 'monthly', priority: 0.7 },
    { loc: '/methodology', file: 'methodology/index.html', changefreq: 'monthly', priority: 0.7 },
    { loc: '/debrief', file: 'debrief/index.html', changefreq: 'monthly', priority: 0.7 },
    { loc: '/leaderboard', file: 'leaderboard/index.html', changefreq: 'daily', priority: 0.6 },
    { loc: '/about', file: 'about/index.html', changefreq: 'monthly', priority: 0.5 },
    { loc: '/privacy', file: 'privacy/index.html', changefreq: 'yearly', priority: 0.3 },
    { loc: '/terms', file: 'terms/index.html', changefreq: 'yearly', priority: 0.3 },

    // /content.txt and /llms.txt are plain-text files for AI crawlers, not
    // pages Google should index, so they stay out of the sitemap.

    // Two hand-written articles that predate the blog generator. Their dates
    // are the dates the articles were last revised.
    { loc: '/blog/singer-loomis-vs-mbti', file: 'blog/singer-loomis-vs-mbti.html', lastmod: '2026-01-15', changefreq: 'monthly', priority: 0.7 },
    { loc: '/blog/understanding-the-grip', file: 'blog/understanding-the-grip.html', lastmod: '2026-10-14', changefreq: 'monthly', priority: 0.7 },
  ];

  for (const article of growthBlogArticles) {
    list.push({ loc: `/blog/${article.slug}`, file: `blog/${article.slug}.html`, lastmod: undefined, changefreq: 'monthly', priority: 0.75 });
  }
  for (const page of seoLandingPages) {
    list.push({ loc: `/${page.slug}`, file: `${page.slug}/index.html`, changefreq: 'monthly', priority: 0.85 });
  }
  for (const fn of FUNCTIONS) {
    list.push({ loc: `/functions/${fn}`, file: `functions/${fn}/index.html`, changefreq: 'monthly', priority: 0.8 });
  }
  for (const type of TYPES) {
    list.push({ loc: `/types/${type}`, file: `types/${type}/index.html`, changefreq: 'monthly', priority: 0.8 });
  }
  for (const page of libraryPages) {
    list.push({ loc: page.path, file: page.file, changefreq: 'monthly', priority: page.priority });
  }
  return list;
}

export interface BuildOptions {
  /** Published roots to look in, most specific first. */
  roots?: string[];
  gitDate?: (sources: string[]) => string | undefined;
}

export function buildSitemapEntries(options: BuildOptions = {}): SitemapEntry[] {
  const roots = options.roots ?? [join(ROOT_DIR, 'dist', 'public'), join(ROOT_DIR, 'public')];
  const gitDate = options.gitDate ?? ((sources: string[]) => lastCommitDate(sources, ROOT_DIR));
  const entries: SitemapEntry[] = [];

  for (const candidate of candidates()) {
    const path = roots.map((root) => join(root, candidate.file)).find((file) => existsSync(file));
    const meta = path ? readPageMeta(readFileSync(path, 'utf8')) : {};
    if (!isListable(candidate.loc, meta)) continue;
    const lastmod = candidate.lastmod || meta.dateModified || (candidate.sources && gitDate(candidate.sources));
    entries.push({
      loc: candidate.loc,
      ...(lastmod ? { lastmod } : {}),
      changefreq: candidate.changefreq,
      priority: candidate.priority,
    });
  }

  // The blog index changes when an article does.
  const blogDates = entries.filter((entry) => entry.loc.startsWith('/blog/') && entry.lastmod).map((entry) => entry.lastmod!);
  const blogIndex: SitemapEntry = { loc: '/blog/', changefreq: 'weekly', priority: 0.8 };
  if (blogDates.length) blogIndex.lastmod = blogDates.sort().at(-1);
  const firstBlog = entries.findIndex((entry) => entry.loc.startsWith('/blog/'));
  entries.splice(firstBlog === -1 ? entries.length : firstBlog, 0, blogIndex);

  return entries;
}

export function renderSitemap(entries: SitemapEntry[]): string {
  const urls = entries.map(entry => `  <url>
    <loc>${BASE_URL}${entry.loc}</loc>${entry.lastmod ? `
    <lastmod>${entry.lastmod}</lastmod>` : ''}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<!--
  TypeJung Sitemap
  Total URLs: ${entries.length}
-->
${urls}
</urlset>`;
}
