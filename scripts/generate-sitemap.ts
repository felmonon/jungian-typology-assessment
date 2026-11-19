#!/usr/bin/env node
/**
 * Sitemap generator for TypeJung.
 * The URL list and lastmod rules live in scripts/sitemap-entries.ts.
 */

import { existsSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { buildSitemapEntries, renderSitemap } from './sitemap-entries.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

const entries = buildSitemapEntries();
const sitemap = renderSitemap(entries);

const outputPath = join(__dirname, '..', 'public', 'sitemap.xml');
writeFileSync(outputPath, sitemap);

const distOutputPath = join(__dirname, '..', 'dist', 'public', 'sitemap.xml');
if (existsSync(dirname(distOutputPath))) {
  writeFileSync(distOutputPath, sitemap);
}

const dated = entries.filter((entry) => entry.lastmod);
console.log('✅ Sitemap generated successfully!');
console.log(`📄 Location: ${outputPath}`);
console.log(`🔗 Total URLs: ${entries.length} (${dated.length} with lastmod, ${new Set(dated.map((entry) => entry.lastmod)).size} distinct dates)`);
