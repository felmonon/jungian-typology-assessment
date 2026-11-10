// Validates Jung Library content files. Usage:
//   node scripts/jung/validate.mjs                 (everything that exists)
//   node scripts/jung/validate.mjs concepts-structure.mjs   (one file)
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { BOOKS, CONCEPTS, FAMILIES, PRACTICES, REGIONS, RESERVED_SLUGS, SITE_PATHS, WORKS } from './registry.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const errors = [];
const warnings = [];
const err = (where, message) => errors.push(`${where}: ${message}`);
const warn = (where, message) => warnings.push(`${where}: ${message}`);
const words = (text) => String(text || '').replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, '$2 $1').split(/\s+/).filter(Boolean).length;
const BANNED = [/clinically/i, /diagnos/i, /scientifically proven/i, /\bguarantee/i, /\bunlock\b/i, /true self/i, /\bheal(s|ed|ing)? your\b/i, /\bcure[sd]?\b/i, /manifest(ing|ation)? your/i];

function checkText(where, text, { allowDash = false, quoted = false } = {}) {
  if (typeof text !== 'string' || !text.trim()) return err(where, 'missing text');
  if (!allowDash && /\u2014/.test(text)) err(where, 'contains an em dash; use a comma, colon or period');
  if (/\s{2,}/.test(text.trim())) warn(where, 'double spaces');
  if (!quoted) for (const pattern of BANNED) if (pattern.test(text)) warn(where, `uses a restricted phrase (${pattern})`);
  for (const match of text.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) {
    const target = match[1].trim();
    if (target.startsWith('/')) { if (!SITE_PATHS.includes(target)) err(where, `links to unknown path ${target}`); }
    else if (!CONCEPTS[target]) err(where, `links to unknown concept [[${target}]]`);
  }
}

function checkQuote(where, quote) {
  if (!quote || typeof quote !== 'object') return err(where, 'quote must be an object');
  checkText(`${where}.text`, quote.text, { allowDash: true, quoted: true });
  if (words(quote.text) > 60) err(where, `quotation is ${words(quote.text)} words; keep it to 60 or fewer`);
  if (!WORKS[quote.work]) err(where, `unknown work key "${quote.work}"`);
  if (quote.work === 'other' && !quote.cite) err(where, 'work "other" needs a cite string');
  if (!quote.verifiedAt || !/^https?:\/\//.test(quote.verifiedAt)) err(where, 'every quotation needs verifiedAt (the URL where the wording and source were checked)');
  if (quote.locator && !/^(§|p\.|pp\.|ch\.|letter|Liber|\d)/i.test(quote.locator)) warn(where, `unusual locator "${quote.locator}"`);
}

function checkSeo(where, seo) {
  if (!seo) return err(where, 'missing seo');
  if (!seo.title || seo.title.length > 62) err(`${where}.title`, `must be 1-62 characters (is ${seo.title?.length ?? 0})`);
  if (!seo.description || seo.description.length < 120 || seo.description.length > 165) err(`${where}.description`, `must be 120-165 characters (is ${seo.description?.length ?? 0})`);
}

function checkFaq(where, faq, min = 2) {
  if (!Array.isArray(faq) || faq.length < min) return err(where, `needs at least ${min} FAQ items`);
  faq.forEach((item, index) => {
    checkText(`${where}[${index}].q`, item.q);
    checkText(`${where}[${index}].a`, item.a);
    if (words(item.a) > 75) err(`${where}[${index}].a`, 'answer over 75 words');
  });
}

function checkSections(where, sections, { minWords, maxWords }) {
  if (!Array.isArray(sections) || sections.length < 3) return err(where, 'needs at least 3 sections');
  let total = 0;
  sections.forEach((section, index) => {
    checkText(`${where}[${index}].h`, section.h);
    const blocks = [...(section.p || []), ...(section.bullets || [])];
    if (blocks.length === 0) err(`${where}[${index}]`, 'section has no paragraphs or bullets');
    blocks.forEach((block, blockIndex) => { checkText(`${where}[${index}] block ${blockIndex}`, block); total += words(block); });
  });
  if (total < minWords || total > maxWords) err(where, `body is ${total} words; target ${minWords}-${maxWords}`);
}

function checkConcepts(file, list) {
  const seen = new Set();
  list.forEach((entry) => {
    const where = `${file}:${entry.slug}`;
    if (!CONCEPTS[entry.slug]) err(where, 'slug is not in the registry');
    if (RESERVED_SLUGS.includes(entry.slug)) err(where, 'slug is reserved');
    if (seen.has(entry.slug)) err(where, 'duplicate slug'); seen.add(entry.slug);
    if (!REGIONS.includes(entry.region)) err(where, `unknown region "${entry.region}"`);
    if (entry.family && !FAMILIES[entry.family]) err(where, `unknown family "${entry.family}"`);
    checkText(`${where}.oneLine`, entry.oneLine);
    if ((entry.oneLine || '').length > 120) err(`${where}.oneLine`, 'over 120 characters');
    checkText(`${where}.answer`, entry.answer);
    const answerWords = words(entry.answer);
    if (answerWords < 35 || answerWords > 70) err(`${where}.answer`, `is ${answerWords} words; target 35-70`);
    if (!Array.isArray(entry.jung) || entry.jung.length < 1 || entry.jung.length > 3) err(`${where}.jung`, 'needs 1-3 quotations');
    (entry.jung || []).forEach((quote, index) => checkQuote(`${where}.jung[${index}]`, quote));
    checkSections(`${where}.sections`, entry.sections, { minWords: 300, maxWords: 520 });
    if (!Array.isArray(entry.misread) || entry.misread.length < 2 || entry.misread.length > 4) err(`${where}.misread`, 'needs 2-4 items');
    (entry.misread || []).forEach((item, index) => checkText(`${where}.misread[${index}]`, item));
    if (!Array.isArray(entry.related) || entry.related.length < 3 || entry.related.length > 6) err(`${where}.related`, 'needs 3-6 related slugs');
    (entry.related || []).forEach((slug) => { if (!CONCEPTS[slug]) err(`${where}.related`, `unknown concept "${slug}"`); if (slug === entry.slug) err(`${where}.related`, 'links to itself'); });
    if (!Array.isArray(entry.read) || entry.read.length < 1) err(`${where}.read`, 'needs at least one reading pointer');
    (entry.read || []).forEach((item) => { if (!WORKS[item.work]) err(`${where}.read`, `unknown work "${item.work}"`); checkText(`${where}.read.where`, item.where); });
    if (!entry.cta || !['map', 'practice', 'read'].includes(entry.cta.kind)) err(`${where}.cta`, 'needs kind map | practice | read');
    else checkText(`${where}.cta.text`, entry.cta.text);
    if (entry.cta?.kind === 'practice' && !PRACTICES.includes(entry.cta.practice)) err(`${where}.cta`, 'practice CTA needs a valid practice slug');
    if (entry.cta?.kind === 'read' && !BOOKS.includes(entry.cta.book)) err(`${where}.cta`, 'read CTA needs a valid book slug');
    checkFaq(`${where}.faq`, entry.faq);
    checkSeo(`${where}.seo`, entry.seo);
  });
}

function checkBooks(file, data) {
  const { books = [], paths = [], timeline = [] } = data;
  books.forEach((book) => {
    const where = `${file}:${book.slug}`;
    if (!BOOKS.includes(book.slug)) err(where, 'slug is not in the registry');
    for (const field of ['title', 'year', 'answer', 'whoFor']) if (!book[field]) err(where, `missing ${field}`);
    if (!['start', 'core', 'deep'].includes(book.level)) err(where, 'level must be start | core | deep');
    checkText(`${where}.answer`, book.answer); checkText(`${where}.whoFor`, book.whoFor);
    checkSections(`${where}.sections`, book.sections, { minWords: 200, maxWords: 420 });
    (book.keyIdeas || []).forEach((slug) => { if (!CONCEPTS[slug]) err(`${where}.keyIdeas`, `unknown concept "${slug}"`); });
    if (!Array.isArray(book.keyIdeas) || book.keyIdeas.length < 2) err(`${where}.keyIdeas`, 'needs at least 2 concept slugs');
    (book.next || []).forEach((slug) => { if (!BOOKS.includes(slug)) err(`${where}.next`, `unknown book "${slug}"`); });
    checkFaq(`${where}.faq`, book.faq); checkSeo(`${where}.seo`, book.seo);
  });
  for (const slug of BOOKS) if (books.length && !books.some((book) => book.slug === slug)) err(file, `missing book "${slug}"`);
  if (paths.length < 3) err(file, 'needs at least 3 reading paths');
  paths.forEach((path) => {
    const where = `${file}:path:${path.slug}`;
    for (const field of ['slug', 'title', 'who']) checkText(`${where}.${field}`, path[field]);
    if (!Array.isArray(path.steps) || path.steps.length < 3) err(where, 'needs at least 3 steps');
    (path.steps || []).forEach((step) => { if (!BOOKS.includes(step.book)) err(where, `unknown book "${step.book}"`); checkText(`${where}.why`, step.why); });
  });
  if (timeline.length < 24) err(file, 'timeline needs at least 24 events');
  timeline.forEach((event) => {
    const where = `${file}:timeline:${event.year}`;
    if (!Number.isInteger(event.year) || event.year < 1875 || event.year > 2026) err(where, 'year out of range');
    checkText(`${where}.title`, event.title); checkText(`${where}.text`, event.text);
    if (!event.verifiedAt) err(where, 'needs verifiedAt');
    (event.related || []).forEach((slug) => { if (!CONCEPTS[slug]) err(where, `unknown concept "${slug}"`); });
  });
}

function checkQuotes(file, data) {
  const { quotes = [], practices = [] } = data;
  const statuses = ['verified', 'paraphrase', 'misattributed', 'unsourced'];
  const ids = new Set();
  quotes.forEach((quote) => {
    const where = `${file}:quote:${quote.id}`;
    if (!quote.id || ids.has(quote.id)) err(where, 'missing or duplicate id'); ids.add(quote.id);
    if (!statuses.includes(quote.status)) err(where, `status must be one of ${statuses.join(', ')}`);
    checkText(`${where}.text`, quote.text, { allowDash: true, quoted: true });
    checkText(`${where}.note`, quote.note);
    if (!quote.verifiedAt || !/^https?:\/\//.test(quote.verifiedAt)) err(where, 'needs verifiedAt');
    if (quote.status === 'verified') { if (!WORKS[quote.work]) err(where, `unknown work "${quote.work}"`); if (words(quote.text) > 70) err(where, 'over 70 words'); }
    if (quote.status === 'paraphrase' && !quote.actual) err(where, 'paraphrase needs `actual` (what Jung wrote) with its own work key');
    (quote.topics || []).forEach((slug) => { if (!CONCEPTS[slug]) err(where, `unknown topic "${slug}"`); });
  });
  if (quotes.filter((quote) => quote.status === 'verified').length < 24) err(file, 'needs at least 24 verified quotes');
  if (quotes.filter((quote) => quote.status !== 'verified').length < 8) err(file, 'needs at least 8 paraphrased, misattributed or unsourced quotes');
  practices.forEach((practice) => {
    const where = `${file}:practice:${practice.slug}`;
    if (!PRACTICES.includes(practice.slug)) err(where, 'slug is not in the registry');
    for (const field of ['title', 'answer', 'caution']) checkText(`${where}.${field}`, practice[field]);
    if (!Array.isArray(practice.steps) || practice.steps.length < 4) err(where, 'needs at least 4 steps');
    (practice.steps || []).forEach((step, index) => { checkText(`${where}.steps[${index}].h`, step.h); (step.p || []).forEach((p) => checkText(`${where}.steps[${index}]`, p)); });
    checkSections(`${where}.sections`, practice.sections, { minWords: 220, maxWords: 520 });
    (practice.jung || []).forEach((quote, index) => checkQuote(`${where}.jung[${index}]`, quote));
    (practice.related || []).forEach((slug) => { if (!CONCEPTS[slug]) err(where, `unknown concept "${slug}"`); });
    checkFaq(`${where}.faq`, practice.faq); checkSeo(`${where}.seo`, practice.seo);
  });
  for (const slug of PRACTICES) if (practices.length && !practices.some((practice) => practice.slug === slug)) err(file, `missing practice "${slug}"`);
}

const FILES = {
  'concepts-structure.mjs': (file, mod) => checkConcepts(file, mod.default),
  'concepts-dynamics.mjs': (file, mod) => checkConcepts(file, mod.default),
  'concepts-types-figures.mjs': (file, mod) => checkConcepts(file, mod.default),
  'books.mjs': (file, mod) => checkBooks(file, mod),
  'quotes-practices.mjs': (file, mod) => checkQuotes(file, mod),
};

const only = process.argv[2];
let checked = 0;
for (const [file, check] of Object.entries(FILES)) {
  if (only && only !== file) continue;
  const path = join(here, file);
  if (!existsSync(path)) { if (only) err(file, 'file does not exist'); continue; }
  const mod = await import(pathToFileURL(path).href);
  check(file, mod); checked += 1;
}
if (!only) {
  const present = new Set();
  for (const file of Object.keys(FILES).filter((name) => name.startsWith('concepts-'))) {
    const path = join(here, file);
    if (existsSync(path)) (await import(pathToFileURL(path).href)).default.forEach((entry) => present.add(entry.slug));
  }
  if (present.size) for (const slug of Object.keys(CONCEPTS)) if (!present.has(slug)) err('concepts', `missing entry for "${slug}"`);
}
for (const message of warnings) console.log(`warn  ${message}`);
for (const message of errors) console.log(`ERROR ${message}`);
console.log(`\n${checked} file(s) checked, ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
