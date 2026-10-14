import { mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { typeSEO, functionSEO } from '../../data/seo-config';
import { PAGE_SEO } from '../../hooks/useSEO';
import { seoLandingPages } from '../../scripts/seo-data.mjs';
import { readDateModified, writeGeneratedFile } from '../../scripts/stable-dates.mjs';

// Google cuts titles off around 60 characters (by pixel width, so a few over
// is fine) and descriptions around 160.
const MAX_TITLE = 65;
const MAX_DESCRIPTION = 160;

const allMetadata = [
  ...seoLandingPages.map((page) => [`/${page.slug}`, page.title, page.description] as const),
  ...Object.entries(typeSEO).map(([type, seo]) => [`/types/${type}`, seo.title, seo.description] as const),
  ...Object.entries(functionSEO).map(([fn, seo]) => [`/functions/${fn}`, seo.title, seo.description] as const),
  ...Object.entries(PAGE_SEO).map(([key, seo]) => [key, seo.title, seo.description] as const),
];

describe('search snippet metadata', () => {
  it.each(allMetadata)('%s keeps its title and description inside the search snippet', (_path, title, description) => {
    expect(title.length).toBeLessThanOrEqual(MAX_TITLE);
    expect(description.length).toBeLessThanOrEqual(MAX_DESCRIPTION);
  });
});

describe('generated page build dates', () => {
  const page = (date: string, body: string) =>
    `<script type="application/ld+json">{ "dateModified": "${date}" }</script><p>${body}</p>`;

  it('keeps the older date when only the build date would change', () => {
    const file = join(mkdtempSync(join(tmpdir(), 'seo-')), 'index.html');
    writeFileSync(file, page('2026-09-05', 'same'));

    expect(writeGeneratedFile(file, page('2026-10-14', 'same'))).toBe(false);
    expect(readDateModified(file)).toBe('2026-09-05');
  });

  it('takes the new date when the page content changes', () => {
    const file = join(mkdtempSync(join(tmpdir(), 'seo-')), 'index.html');
    writeFileSync(file, page('2026-09-05', 'old'));

    expect(writeGeneratedFile(file, page('2026-10-14', 'new'))).toBe(true);
    expect(readFileSync(file, 'utf8')).toContain('new');
    expect(readDateModified(file)).toBe('2026-10-14');
  });
});
