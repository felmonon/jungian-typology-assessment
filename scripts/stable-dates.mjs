import { existsSync, readFileSync, writeFileSync } from 'fs';

// Build-date stamps that should only move when the page itself changes.
// Without this, every build restamped every page with today's date, so
// dateModified and sitemap lastmod said "changed today" for all 80+ URLs and
// search engines learn to ignore them.
const BUILD_DATE_STAMPS = /("dateModified"\s*:\s*"|# Last Updated: )\d{4}-\d{2}-\d{2}/g;

const withoutBuildDates = (content) => content.replace(BUILD_DATE_STAMPS, '$1<build-date>');
const withoutTrafficScript = (content) => content.replace(/<script data-typejung-traffic-attribution[^>]*><\/script>\n?/g, '');

/**
 * Write a generated file, but keep the existing file (and its older build date)
 * when nothing other than the build date stamp would change.
 */
export function writeGeneratedFile(path, content) {
  if (existsSync(path)) {
    const existing = readFileSync(path, 'utf8');
    if (withoutBuildDates(existing) === withoutBuildDates(content)) return false;
    // Instrumentation changes still need writing, but do not represent an
    // editorial update to the article or landing page.
    if (withoutBuildDates(withoutTrafficScript(existing)) === withoutBuildDates(withoutTrafficScript(content))) {
      const dates = [...existing.matchAll(BUILD_DATE_STAMPS)].map((match) => match[0].slice(-10));
      let index = 0;
      content = content.replace(BUILD_DATE_STAMPS, (stamp, prefix) => prefix + (dates[index++] || stamp.slice(-10)));
    }
  }
  writeFileSync(path, content);
  return true;
}

/** The first schema.org dateModified in a generated HTML page, if any. */
export function readDateModified(path) {
  if (!existsSync(path)) return undefined;
  const match = readFileSync(path, 'utf8').match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})/);
  return match?.[1];
}
