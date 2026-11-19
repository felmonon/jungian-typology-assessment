import { execFileSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, relative, resolve } from 'path';

// Build-date stamps that should only move when the page itself changes.
// Without this, every build restamped every page with today's date, so
// dateModified and sitemap lastmod said "changed today" for all 80+ URLs and
// search engines learn to ignore them.
const BUILD_DATE_STAMPS = /("dateModified"\s*:\s*"|# Last Updated: )\d{4}-\d{2}-\d{2}/g;

const withoutBuildDates = (content) => content.replace(BUILD_DATE_STAMPS, '$1<build-date>');
const withoutTrafficScript = (content) => content.replace(/<script data-typejung-traffic-attribution[^>]*><\/script>\n?/g, '');

/**
 * The words a reader sees in the page's own content: the <main> element
 * without the shared header, footer, nav, scripts and styles. A change to the
 * site shell (new footer link, new stylesheet, new analytics) is not an
 * editorial change, so it must not move the page's dateModified. Text files
 * have no shell, so all of their text counts.
 */
export function editorialText(content) {
  const body = content.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1];
  if (body === undefined) return withoutBuildDates(withoutTrafficScript(content));
  const main = body.match(/<main[^>]*>([\s\S]*)<\/main>/i)?.[1] ?? body;
  return main
    .replace(/<(script|style|noscript|header|nav|footer)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\d{4}-\d{2}-\d{2}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const stampDates = (content, dates) => {
  let index = 0;
  return content.replace(BUILD_DATE_STAMPS, (stamp, prefix) => prefix + (dates[index++] || dates[0] || stamp.slice(-10)));
};

const datesIn = (content) => [...content.matchAll(BUILD_DATE_STAMPS)].map((match) => match[0].slice(-10));

let gitState;
function gitRepo(cwd) {
  if (gitState !== undefined) return gitState;
  try {
    const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8' }).trim();
    // A shallow clone (Vercel builds) cuts history off, so the oldest commit it
    // has would look like the day every page was written.
    const shallow = execFileSync('git', ['rev-parse', '--is-shallow-repository'], { cwd, encoding: 'utf8' }).trim() === 'true';
    gitState = shallow ? null : root;
  } catch {
    gitState = null;
  }
  return gitState;
}

/**
 * The date of the commit that last changed this page's editorial text, read
 * from git history. Returns undefined when the content is new (not yet
 * committed), or when there is no full git history to read.
 */
export function editorialDateFromGit(path, content) {
  const root = gitRepo(dirname(resolve(path)));
  if (!root) return undefined;
  const rel = relative(root, resolve(path));
  let log;
  try {
    log = execFileSync('git', ['log', '--format=%H %cs', '--', rel], { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return undefined;
  }
  if (!log) return undefined;
  const target = editorialText(content);
  let date;
  for (const line of log.split('\n')) {
    const [hash, day] = line.split(' ');
    let version;
    try {
      version = execFileSync('git', ['show', `${hash}:${rel}`], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    } catch {
      break;
    }
    if (editorialText(version) !== target) break;
    date = day;
  }
  return date;
}

/** Last commit date touching any of these repo files, or undefined without full git history. */
export function lastCommitDate(paths, cwd = process.cwd()) {
  const root = gitRepo(cwd);
  if (!root) return undefined;
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', ...paths], { cwd: root, encoding: 'utf8' }).trim() || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Write a generated file, but keep the existing file's dates when only the
 * build date or the site shell would change.
 *
 * Set TYPEJUNG_DATES_FROM_GIT=1 to re-derive every page's date from the git
 * history of its editorial text (slow; run it locally after a shell redesign
 * restamped pages, then commit the result).
 */
export function writeGeneratedFile(path, content) {
  const existing = existsSync(path) ? readFileSync(path, 'utf8') : undefined;
  let gitDate = process.env.TYPEJUNG_DATES_FROM_GIT ? editorialDateFromGit(path, content) : undefined;
  // A page cannot be modified before the date it says it was published.
  const published = content.match(/"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})/)?.[1];
  if (gitDate && published && gitDate < published) gitDate = published;
  if (gitDate) {
    content = stampDates(content, [gitDate]);
  } else if (existing !== undefined) {
    if (withoutBuildDates(existing) === withoutBuildDates(content)) return false;
    // Shell, link-target or instrumentation changes still need writing, but do
    // not represent an editorial update to the article or landing page.
    if (editorialText(existing) === editorialText(content)) {
      const dates = datesIn(existing);
      if (dates.length) content = stampDates(content, dates);
    }
  }
  if (existing === content) return false;
  writeFileSync(path, content);
  return true;
}

/** The first schema.org dateModified in a generated HTML page, if any. */
export function readDateModified(path) {
  if (!existsSync(path)) return undefined;
  const match = readFileSync(path, 'utf8').match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})/);
  return match?.[1];
}
