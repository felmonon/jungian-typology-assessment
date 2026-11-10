#!/usr/bin/env node
// Generates the Jung Library (everything under /jung) from the content files in
// scripts/jung/. Run `node scripts/jung/validate.mjs` before committing content.
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeGeneratedFile } from './stable-dates.mjs';
import { PUBLISHER, SITE, absoluteUrl, breadcrumbSchema, escapeHtml, shellDocument, shellHead } from './site-shell.mjs';
import { FAMILIES, INLINE, WORKS } from './jung/registry.mjs';
import { HUB, SECTION_PAGES, bookBySlug, books, conceptBySlug, concepts, libraryPages, paths, practiceBySlug, practices, quotes, timeline } from './jung/pages.mjs';
import { REGION_NOTES, psycheMap } from './jung/psyche-map.mjs';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const buildDate = new Date().toISOString().split('T')[0];
const PUBLISHED = '2026-11-10';
const JUNG = { '@type': 'Person', name: 'Carl Gustav Jung', alternateName: ['Carl Jung', 'C. G. Jung'], sameAs: ['https://en.wikipedia.org/wiki/Carl_Jung', 'https://www.wikidata.org/wiki/Q41532'] };
const section = Object.fromEntries(SECTION_PAGES.map((page) => [page.key, page]));

// ---------- text ----------

/** Typographic quotation marks and apostrophes for our own prose and for quotations. */
const typo = (text) =>
  String(text)
    .replace(/(^|[\s(\[{\u2014\u2013])"/g, '$1\u201c')
    .replace(/"/g, '\u201d')
    .replace(/(^|[\s(\[{\u201c\u2014\u2013])'/g, '$1\u2018')
    .replace(/'/g, '\u2019');

const emphasis = (html) => html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
const plain = (text) => String(text).replace(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_, target, label) => label || INLINE[target.trim()] || target).replace(/\*+/g, '');
const text = (value) => escapeHtml(typo(value));
const slugify = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const sourceTag = (...parts) => parts.map((part) => String(part).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')).join('_').slice(0, 80);

/** Our inline markup: [[concept]], [[concept|label]], [[/path|label]], *italic*, **bold**. */
function inline(raw) {
  const source = typo(raw);
  const pattern = /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;
  let html = '';
  let cursor = 0;
  let match;
  while ((match = pattern.exec(source))) {
    const before = source.slice(0, match.index);
    html += emphasis(escapeHtml(source.slice(cursor, match.index)));
    const target = match[1].trim();
    let label = match[2];
    let href = target;
    if (!target.startsWith('/')) {
      if (!conceptBySlug[target]) throw new Error(`Unknown concept link [[${target}]]`);
      href = `/jung/${target}`;
      if (!label) {
        label = INLINE[target];
        if (/(^|[.!?][\u201d)]?\s+)$/.test(before)) label = label[0].toUpperCase() + label.slice(1);
      }
    }
    html += `<a href="${escapeHtml(href)}">${emphasis(escapeHtml(label || target))}</a>`;
    cursor = pattern.lastIndex;
  }
  return html + emphasis(escapeHtml(source.slice(cursor)));
}

const paragraphs = (list) => (list || []).map((item) => `<p>${inline(item)}</p>`).join('\n');

function sectionsHtml(sections) {
  return sections
    .map((part) => {
      const bullets = part.bullets?.length ? `\n<ul>${part.bullets.map((item) => `<li>${inline(item)}</li>`).join('')}</ul>` : '';
      return `<h2 id="${slugify(part.h)}">${text(part.h)}</h2>\n${paragraphs(part.p)}${bullets}`;
    })
    .join('\n');
}

// ---------- citations ----------

const workBook = Object.fromEntries(books.filter((book) => book.work && book.work !== 'cw8').map((book) => [book.work, book.slug]));

function citationText(quote) {
  const parts = [];
  if (quote.essay) parts.push(/["\u201c]|^Letter |^BBC /.test(quote.essay) ? typo(quote.essay) : `\u201c${typo(quote.essay)}\u201d`);
  const work = quote.work === 'other' ? quote.cite : WORKS[quote.work]?.cite;
  if (work && work !== quote.essay) parts.push(typo(work));
  if (quote.locator) parts.push(quote.locator);
  return parts.join(', ');
}

const citeHtml = (quote) => `<span class="cite">C. G. Jung, ${escapeHtml(citationText(quote))}</span>`;

function quoteFigure(quote) {
  return `<figure class="jung-quote">
  <blockquote>${text(quote.text)}</blockquote>
  <figcaption>${citeHtml(quote)}</figcaption>
</figure>`;
}

// ---------- shared blocks ----------

const breadcrumb = (items) =>
  `<nav class="breadcrumb" aria-label="Breadcrumb">${items
    .map((item, index) => (index === items.length - 1 ? `<span aria-current="page">${text(item.name)}</span>` : `<a href="${item.path}">${text(item.name)}</a><span aria-hidden="true">/</span>`))
    .join(' ')}</nav>`;

const chips = (slugs) =>
  `<ul class="chips">${slugs.map((slug) => `<li><a href="/jung/${slug}">${text(conceptBySlug[slug].title)}</a></li>`).join('')}</ul>`;

const faqHtml = (faq) =>
  faq.map((item) => `<div class="faq-item"><h3>${text(item.q)}</h3><p>${inline(item.a)}</p></div>`).join('\n');

const faqSchema = (faq) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: plain(item.a) } })),
});

function mapButton(source, { className = 'btn', label = 'Get my free map' } = {}) {
  return `<a class="${className}" href="/assessment?source=${source}" data-map-cta data-source="${source}" data-label-map="Open my map" data-label-resume="Resume my map">${label}</a>`;
}

function nextStep(cta, slug) {
  if (cta.kind === 'practice') {
    const practice = practiceBySlug[cta.practice];
    return `<section class="next-step" aria-labelledby="next-step-title">
  <p class="eyebrow">A practice</p>
  <h2 id="next-step-title">${text(practice.title)}</h2>
  <p>${inline(cta.text)}</p>
  <a class="btn" href="/jung/practice/${practice.slug}">Read the practice</a>
</section>`;
  }
  if (cta.kind === 'read') {
    const book = bookBySlug[cta.book];
    return `<section class="next-step" aria-labelledby="next-step-title">
  <p class="eyebrow">Read Jung</p>
  <h2 id="next-step-title"><em>${text(book.title)}</em></h2>
  <p>${inline(cta.text)}</p>
  <a class="btn" href="/jung/books/${book.slug}">Open the reading guide</a>
</section>`;
  }
  return `<section class="next-step" aria-labelledby="next-step-title">
  <p class="eyebrow">Free · 42 questions · 20 to 25 minutes</p>
  <h2 id="next-step-title">See where this sits in your own pattern</h2>
  <p>${inline(cta.text)}</p>
  ${mapButton(sourceTag('jung', slug, 'next'))}
  <small>The free map comes first. No account or payment is needed to see your result.</small>
</section>`;
}

const mapAside = (slug) => `<div class="aside-card">
  <h2>Your own map</h2>
  <p>TypeJung\u2019s free map reads 42 answers as a pattern across Jung\u2019s eight function-attitudes and names your likely dominant and inferior functions.</p>
  <p class="aside-small">It is a tool for reflection. It does not measure the shadow, archetypes or complexes.</p>
  ${mapButton(sourceTag('jung', slug, 'aside'), { className: 'btn btn-sm' })}
</div>`;

const sourcesNote = (extra = '') => `<section class="sources" aria-labelledby="sources-title">
  <h2 id="sources-title">Sources and method</h2>
  <p>Quotations on this page were checked against published sources and are cited to the work, and to the paragraph (\u00a7) of the Collected Works where that could be confirmed. The summaries are ours. ${extra}This page is educational. It is not psychological advice or treatment.</p>
  <p><a href="${section.standards.path}">How the library is written and checked</a>. Found an error? Write to <a href="mailto:${SITE.supportEmail}">${SITE.supportEmail}</a>.</p>
</section>`;

const articleSchema = ({ path, headline, description, type = 'Article', extra = {} }) => ({
  '@context': 'https://schema.org',
  '@type': type,
  '@id': `${absoluteUrl(path)}#article`,
  headline,
  description,
  url: absoluteUrl(path),
  mainEntityOfPage: absoluteUrl(path),
  inLanguage: 'en',
  datePublished: PUBLISHED,
  dateModified: buildDate,
  author: PUBLISHER,
  publisher: PUBLISHER,
  isPartOf: { '@type': 'CollectionPage', name: 'The Jung Library', url: absoluteUrl(HUB.path) },
  ...extra,
});

const headline = (title) => title.replace(/\s*\|\s*TypeJung$/, '');

function write(path, html) {
  const file = join(publicDir, path.slice(1), 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeGeneratedFile(file, html);
}

function page({ path, title, description, keywords, main, schemas, scripts, mainClass }) {
  write(
    path,
    shellDocument({
      head: shellHead({ title, description, path, keywords }),
      main,
      active: 'library',
      schemas,
      scripts,
      mainClass,
    }),
  );
}

// ---------- concept pages ----------

function conceptPage(entry) {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Jung Library', path: HUB.path }, { name: entry.title, path: entry.path }];
  const [firstQuote, ...moreQuotes] = entry.jung;
  const sectionParts = entry.sections.map((part) => {
    const bullets = part.bullets?.length ? `\n<ul>${part.bullets.map((item) => `<li>${inline(item)}</li>`).join('')}</ul>` : '';
    return `<h2 id="${slugify(part.h)}">${text(part.h)}</h2>\n${paragraphs(part.p)}${bullets}`;
  });
  // Later quotations sit between sections so the page does not open with a wall of them.
  moreQuotes.forEach((quote, index) => {
    const position = Math.min(sectionParts.length - 1, index * 2 + 1);
    sectionParts[position] += `\n${quoteFigure(quote)}`;
  });
  const aka = entry.aka?.length ? `<p class="aka">Also searched as: ${entry.aka.map((name) => text(name)).join(', ')}</p>` : '';
  const readList = entry.read
    .map((item) => {
      if (item.work === 'other') return `<li>${inline(item.where)}</li>`;
      const label = text(WORKS[item.work].cite);
      const linked = workBook[item.work] ? `<a href="/jung/books/${workBook[item.work]}">${label}</a>` : label;
      return `<li><b>${linked}</b>${inline(item.where)}</li>`;
    })
    .join('\n');

  const main = `<div class="entry">
<article class="entry-main">
${breadcrumb(crumbs)}
<p class="eyebrow">${text(entry.familyLabel)}</p>
<h1>${text(entry.title)}</h1>
<p class="lede">${text(entry.oneLine)}</p>
${aka}
<div class="answer"><p class="eyebrow">In short</p><p>${inline(entry.answer)}</p></div>
${quoteFigure(firstQuote)}
${sectionParts.join('\n')}
<h2 id="common-misreadings">Common misreadings</h2>
<ul class="misread">
${entry.misread.map((item) => `<li>${inline(item)}</li>`).join('\n')}
</ul>
<h2 id="where-to-read-it-in-jung">Where to read it in Jung</h2>
<ul class="read-list">
${readList}
</ul>
${nextStep(entry.cta, entry.slug)}
<h2 id="questions-people-ask">Questions people ask</h2>
${faqHtml(entry.faq)}
<h2 id="related-ideas">Related ideas</h2>
${chips(entry.related)}
${sourcesNote()}
</article>
<aside class="entry-aside" aria-label="About this entry">
<figure class="aside-card psyche-card psyche-map">
${psycheMap(entry.region, escapeHtml(entry.title))}
<figcaption><strong>Where this sits.</strong> ${text(REGION_NOTES[entry.region])} A drawing aid of ours, based on Jung\u2019s descriptions.</figcaption>
</figure>
${mapAside(entry.slug)}
</aside>
</div>`;

  const url = absoluteUrl(entry.path);
  const cited = [...new Set(entry.jung.map((quote) => (quote.work === 'other' ? quote.cite : WORKS[quote.work].cite)).filter(Boolean))];
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          '@id': `${url}#article`,
          headline: headline(entry.seo.title),
          description: entry.seo.description,
          url,
          mainEntityOfPage: url,
          inLanguage: 'en',
          datePublished: PUBLISHED,
          dateModified: buildDate,
          author: PUBLISHER,
          publisher: PUBLISHER,
          about: [JUNG, { '@id': `${url}#term` }],
          isPartOf: { '@type': 'CollectionPage', name: 'The Jung Library', url: absoluteUrl(HUB.path) },
          citation: cited.map((name) => ({ '@type': 'CreativeWork', name, author: { '@type': 'Person', name: 'C. G. Jung' } })),
        },
        {
          '@type': 'DefinedTerm',
          '@id': `${url}#term`,
          name: entry.title,
          ...(entry.aka?.length ? { alternateName: entry.aka } : {}),
          description: plain(entry.answer),
          url,
          inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'TypeJung glossary of Jungian psychology', url: absoluteUrl(section.glossary.path) },
        },
      ],
    },
    breadcrumbSchema(crumbs),
    faqSchema(entry.faq),
  ];
  page({ path: entry.path, title: entry.seo.title, description: entry.seo.description, keywords: [entry.title, ...(entry.aka || []), 'Carl Jung', 'Jungian psychology'], main, schemas });
}

// ---------- hub ----------

const conceptCard = (entry, { tag = false } = {}) => `<a class="concept-card" href="${entry.path}" data-search="${escapeHtml([entry.title, ...(entry.aka || []), entry.oneLine].join(' ').toLowerCase())}">
  <strong>${text(entry.title)}</strong>
  <span>${text(entry.oneLine)}</span>${tag ? `\n  <span class="tag tag-${entry.family}">${text(FAMILIES[entry.family].label)}</span>` : ''}
</a>`;

const levelLabel = { start: 'Start here', core: 'Core works', deep: 'Deep water' };

const bookCard = (book) => `<a class="book-card" href="/jung/books/${book.slug}">
  <span class="tag level level-${book.level}">${levelLabel[book.level]} · ${escapeHtml(book.year)}</span>
  <strong>${text(book.title)}</strong>
  <span>${text(plain(book.whoFor))}</span>
</a>`;

const searchScript = `<script>
(() => {
  const input = document.querySelector('[data-lib-search]');
  if (!input) return;
  const cards = Array.from(document.querySelectorAll('[data-search]'));
  const groups = Array.from(document.querySelectorAll('[data-search-group]'));
  const empty = document.querySelector('[data-search-empty]');
  const apply = () => {
    const query = input.value.trim().toLowerCase();
    let shown = 0;
    cards.forEach((card) => {
      const hit = !query || card.getAttribute('data-search').includes(query);
      card.hidden = !hit;
      if (hit) shown += 1;
    });
    groups.forEach((group) => { group.hidden = !group.querySelector('[data-search]:not([hidden])'); });
    if (empty) empty.hidden = shown > 0;
  };
  input.addEventListener('input', apply);
  if (input.value) apply();
})();
</script>`;

function hubPage() {
  const featured = ['shadow', 'archetypes', 'individuation', 'collective-unconscious', 'anima', 'synchronicity'];
  const flagged = quotes.filter((quote) => ['unconscious-fate', 'thinking-is-difficult', 'what-happened-to-me'].includes(quote.id));
  const verifiedCount = quotes.filter((quote) => quote.status === 'verified').length;
  const families = Object.entries(FAMILIES)
    .map(([key, family]) => {
      const members = concepts.filter((entry) => entry.family === key);
      return `<section data-search-group aria-labelledby="family-${key}">
<div class="lib-section-head"><h2 id="family-${key}">${text(family.label)}</h2><p>${text(family.blurb)}</p></div>
<div class="concept-grid">
${members.map((entry) => conceptCard(entry)).join('\n')}
</div>
</section>`;
    })
    .join('\n');

  const main = `<div class="wrap">
<section class="lib-hero" aria-labelledby="hub-title">
  <p class="eyebrow">The Jung Library</p>
  <h1 id="hub-title">Jung, in plain words and <em>in his own.</em></h1>
  <p class="lede">What Carl Jung actually meant by the shadow, archetypes, individuation and the rest. Each entry gives a plain answer, his own words with an exact source, the common misreadings, and one grounded next step.</p>
  <ul class="proof-strip" aria-label="What is in the library">
    <li>${concepts.length} concepts</li>
    <li>${verifiedCount} quotations checked to source</li>
    <li>${books.length} reading guides</li>
    <li>${practices.length} careful practices</li>
  </ul>
  <label class="lib-search"><span class="sr-only">Search the library</span>
    <input type="search" placeholder="Search a concept: shadow, anima, synchronicity\u2026" autocomplete="off" data-lib-search>
  </label>
</section>

<nav class="lib-doors" aria-label="Ways in">
  <a class="lib-door" href="${section.start.path}"><strong>New to Jung</strong><span>A reading order for where you are. Start with one book, not twenty.</span></a>
  <a class="lib-door" href="${section.glossary.path}"><strong>Look up a term</strong><span>Every concept defined in a sentence, A to Z.</span></a>
  <a class="lib-door" href="${section.quotes.path}"><strong>Check a quote</strong><span>What he wrote, where he wrote it, and the lines he never said.</span></a>
  <a class="lib-door" href="/assessment?source=jung_hub_door" data-map-cta data-source="jung_hub_door" data-label-map="Open my map" data-label-resume="Resume my map"><strong>Map your own pattern</strong><span>The free function-stack map, built on Jung\u2019s typology.</span></a>
</nav>

<p class="lib-empty" data-search-empty hidden>Nothing matches that yet. Try the <a href="${section.glossary.path}">glossary</a>, or tell us what is missing: <a href="mailto:${SITE.supportEmail}">${SITE.supportEmail}</a>.</p>

<section data-search-group aria-labelledby="start-with">
<div class="lib-section-head"><h2 id="start-with">Start with these</h2><p>The six ideas people most often arrive looking for.</p></div>
<div class="concept-grid">
${featured.map((slug) => conceptCard(conceptBySlug[slug], { tag: true })).join('\n')}
</div>
</section>

${families}

<section aria-labelledby="hub-books">
<div class="lib-section-head"><h2 id="hub-books">Read Jung himself</h2><p>Short guides to his books: what is in each, who it is for, and where to begin. <a href="${section.books.path}">All ${books.length} guides</a></p></div>
<div class="book-grid">
${books.filter((book) => book.level === 'start').map(bookCard).join('\n')}
</div>
</section>

<section aria-labelledby="hub-practice">
<div class="lib-section-head"><h2 id="hub-practice">Put it to work</h2><p>Three practices drawn from what Jung described. Each says what it is not and when to stop.</p></div>
<div class="concept-grid">
${practices.map((practice) => `<a class="concept-card" href="/jung/practice/${practice.slug}"><strong>${text(practice.title)}</strong><span>${text(plain(practice.answer).split('. ').slice(0, 2).join('. ') + '.')}</span><span class="tag tag-process">Practice</span></a>`).join('\n')}
</div>
</section>

<section aria-labelledby="hub-quotes">
<div class="lib-section-head"><h2 id="hub-quotes">Did Jung really say that?</h2><p>Some of the most shared lines are paraphrases or belong to someone else. <a href="${section.quotes.path}">See all ${quotes.length} entries</a></p></div>
<div class="quote-list">
${flagged.map((quote) => `<a class="quote-card is-problem quote-link" href="${section.quotes.path}#q-${quote.id}"><span class="status status-${quote.status}">${statusLabel[quote.status]}</span><blockquote>${text(quote.text)}</blockquote></a>`).join('\n')}
</div>
</section>

<section class="next-step hub-band" aria-labelledby="hub-map-title">
  <p class="eyebrow">Free · 42 questions · 20 to 25 minutes</p>
  <h2 id="hub-map-title">The library explains the theory. The map applies one part of it to you.</h2>
  <p>TypeJung\u2019s free assessment uses Jung\u2019s typology to map your pattern across the eight function-attitudes, with the likely dominant and inferior functions named. It is the part of his psychology that can be turned into a careful self-report. The rest is on these pages to read.</p>
  ${mapButton('jung_hub_band')}
  <small>The free map comes first. No account or payment is needed to see your result.</small>
</section>

<section class="lib-note" aria-labelledby="hub-standards">
  <h2 id="hub-standards">How this library is made</h2>
  <p>Every quotation was checked against a published source and carries its citation. We separate what Jung wrote from what later writers added, say plainly where his ideas are contested or dated, and do not present his theories as established science. TypeJung is independent and is not affiliated with the Jung family or any Jungian institute. <a href="${section.standards.path}">Read the editorial standards</a>, or follow <a href="${section.life.path}">the timeline of his life</a>.</p>
</section>
</div>`;

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${absoluteUrl(HUB.path)}#collection`,
      name: 'The Jung Library',
      description: HUB.description,
      url: absoluteUrl(HUB.path),
      inLanguage: 'en',
      datePublished: PUBLISHED,
      dateModified: buildDate,
      about: JUNG,
      publisher: PUBLISHER,
      hasPart: concepts.map((entry) => ({ '@type': 'Article', name: entry.title, url: absoluteUrl(entry.path) })),
    },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Jung Library', path: HUB.path }]),
  ];
  page({ path: HUB.path, title: HUB.title, description: HUB.description, keywords: ['Carl Jung', 'Jungian psychology', 'Jung concepts', 'analytical psychology'], main, schemas, scripts: searchScript });
}

// ---------- glossary ----------

function glossaryPage() {
  const meta = section.glossary;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Jung Library', path: HUB.path }, { name: 'Glossary', path: meta.path }];
  const sortKey = (label) => label.toLowerCase().replace(/^(the|a|an) /, '');
  const rows = concepts.map((entry) => ({ key: sortKey(INLINE[entry.slug]), label: entry.title, entry }));
  const taken = new Set(rows.map((row) => row.key));
  concepts.forEach((entry) => {
    (entry.aka || []).forEach((name) => {
      const key = sortKey(name);
      if (taken.has(key)) return;
      taken.add(key);
      rows.push({ key, label: name[0].toUpperCase() + name.slice(1), see: entry });
    });
  });
  rows.sort((a, b) => a.key.localeCompare(b.key));
  const letters = [...new Set(rows.map((row) => row.key[0].toUpperCase()))];
  const body = letters
    .map((letter) => {
      const group = rows.filter((row) => row.key[0].toUpperCase() === letter);
      return `<h2 class="glossary-letter" id="letter-${letter.toLowerCase()}">${letter}</h2>
${group
  .map((row) =>
    row.see
      ? `<div class="glossary-row"><span class="glossary-see">${text(row.label)}</span><p>See <a href="${row.see.path}">${text(row.see.title)}</a>.</p></div>`
      : `<div class="glossary-row" id="${row.entry.slug}"><a href="${row.entry.path}">${text(row.label)}</a><p>${inline(row.entry.answer)}</p></div>`,
  )
  .join('\n')}`;
    })
    .join('\n');

  const main = `<div class="page">
${breadcrumb(crumbs)}
<p class="eyebrow">The Jung Library</p>
<h1>A glossary of Jung\u2019s terms</h1>
<p class="lede">${concepts.length} terms from Carl Jung\u2019s psychology, each defined in a few plain sentences. Follow a term for his own words, the sources, and the common misreadings.</p>
<nav class="glossary-index" aria-label="Jump to letter">${letters.map((letter) => `<a href="#letter-${letter.toLowerCase()}">${letter}</a>`).join('')}</nav>
${body}
${sourcesNote('Definitions here are summaries of the full entries. ')}
</div>`;

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'DefinedTermSet',
      '@id': `${absoluteUrl(meta.path)}#glossary`,
      name: 'TypeJung glossary of Jungian psychology',
      description: meta.description,
      url: absoluteUrl(meta.path),
      inLanguage: 'en',
      dateModified: buildDate,
      publisher: PUBLISHER,
      hasDefinedTerm: concepts.map((entry) => ({ '@type': 'DefinedTerm', name: entry.title, description: plain(entry.answer), url: absoluteUrl(entry.path) })),
    },
    breadcrumbSchema(crumbs),
  ];
  page({ path: meta.path, title: meta.title, description: meta.description, keywords: ['Jungian glossary', 'Jung terms', 'Jungian psychology definitions'], main, schemas });
}

// ---------- quotes ----------

const statusLabel = { verified: 'Verified', paraphrase: 'Paraphrase', misattributed: 'Misattributed', unsourced: 'No source found' };

const QUOTE_THEMES = [
  { title: 'On the shadow and self-knowledge', first: 'darkness-conscious' },
  { title: 'On individuation and the Self', first: 'who-looks-inside' },
  { title: 'On dreams and the unconscious', first: 'dream-hidden-door' },
  { title: 'On conflict, feeling and consciousness', first: 'love-and-power' },
  { title: 'On relationships and how to live', first: 'two-personalities' },
  { title: 'On psychological types', first: 'four-functions-compass' },
  { title: 'On society, religion and his own work', first: 'bigger-the-crowd' },
];

function quoteCard(quote) {
  const topics = (quote.topics || []).map((slug) => `<li><a href="/jung/${slug}">${text(conceptBySlug[slug].title)}</a></li>`).join('');
  const topicList = topics ? `<ul class="chips chips-sm" aria-label="Related concepts">${topics}</ul>` : '';
  const anchor = `${absoluteUrl(section.quotes.path)}#q-${quote.id}`;
  if (quote.status === 'verified') {
    const copy = `\u201c${typo(quote.text)}\u201d \u2014 C. G. Jung, ${citationText(quote)}. Source checked: ${anchor}`;
    return `<article class="quote-card" id="q-${quote.id}" data-status="verified">
  <span class="status status-verified">Verified${quote.year ? ` · ${escapeHtml(quote.year)}` : ''}</span>
  <blockquote>${text(quote.text)}</blockquote>
  ${citeHtml(quote)}
  <p>${inline(quote.note)}</p>
  ${topicList}
  <button class="copy-btn" type="button" data-copy="${escapeHtml(copy)}">Copy with source</button>
</article>`;
  }
  const actual = quote.actual
    ? `<div class="actual"><p class="eyebrow">What Jung wrote</p><blockquote>${text(quote.actual.text)}</blockquote>${citeHtml(quote.actual)}</div>`
    : '';
  return `<article class="quote-card is-problem" id="q-${quote.id}" data-status="${quote.status}">
  <span class="status status-${quote.status}">${statusLabel[quote.status]}</span>
  <blockquote>${text(quote.text)}</blockquote>
  ${actual}
  <p>${inline(quote.note)}</p>
  ${topicList}
</article>`;
}

const quotesScript = `<script>
(() => {
  const buttons = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-status]'));
  const groups = Array.from(document.querySelectorAll('[data-quote-group]'));
  buttons.forEach((button) => button.addEventListener('click', () => {
    const filter = button.getAttribute('data-filter');
    buttons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
    cards.forEach((card) => {
      const status = card.getAttribute('data-status');
      card.hidden = !(filter === 'all' || status === filter || (filter === 'flagged' && status !== 'verified'));
    });
    groups.forEach((group) => { group.hidden = !group.querySelector('[data-status]:not([hidden])'); });
  }));
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    try {
      await navigator.clipboard.writeText(button.getAttribute('data-copy'));
      const label = button.textContent;
      button.textContent = 'Copied';
      setTimeout(() => { button.textContent = label; }, 1600);
    } catch {
      button.textContent = 'Copy not available';
    }
  });
})();
</script>`;

function quotesPage() {
  const meta = section.quotes;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Jung Library', path: HUB.path }, { name: 'Quotes', path: meta.path }];
  const verified = quotes.filter((quote) => quote.status === 'verified');
  const flagged = quotes.filter((quote) => quote.status !== 'verified');
  const starts = QUOTE_THEMES.map((theme) => verified.findIndex((quote) => quote.id === theme.first));
  if (starts.some((index) => index < 0)) throw new Error('A quote theme points at a missing quote id');
  const themed = QUOTE_THEMES.map((theme, index) => ({ ...theme, items: verified.slice(starts[index], starts[index + 1] ?? verified.length) }));
  const flaggedGroups = [
    { title: 'Paraphrases: the idea is his, the wording is not', status: 'paraphrase' },
    { title: 'Misattributed: someone else said it', status: 'misattributed' },
    { title: 'No source found', status: 'unsourced' },
  ];

  const main = `<div class="page">
${breadcrumb(crumbs)}
<p class="eyebrow">The Jung Library</p>
<h1>Carl Jung quotes, with sources</h1>
<p class="lede">${verified.length} quotations checked against published sources, each cited to the work it comes from. Below them, ${flagged.length} popular lines that are paraphrased, misattributed or have no source, with what he actually wrote.</p>
<div class="quote-filters" role="group" aria-label="Filter quotations">
  <button type="button" data-filter="all" aria-pressed="true">All ${quotes.length}</button>
  <button type="button" data-filter="verified" aria-pressed="false">Verified ${verified.length}</button>
  <button type="button" data-filter="flagged" aria-pressed="false">Not what he wrote ${flagged.length}</button>
</div>
${themed
  .map(
    (theme) => `<section data-quote-group aria-labelledby="${slugify(theme.title)}">
<h2 id="${slugify(theme.title)}">${text(theme.title)}</h2>
<div class="quote-list">
${theme.items.map(quoteCard).join('\n')}
</div>
</section>`,
  )
  .join('\n')}
<section data-quote-group aria-labelledby="did-jung-say-it">
<h2 id="did-jung-say-it">Did Jung really say that?</h2>
<p>Jung is one of the most misquoted writers on the internet. A line counts as verified here only when the wording and the source have been seen in print. The entries below did not pass that test.</p>
${flaggedGroups
  .map((group) => {
    const items = flagged.filter((quote) => quote.status === group.status);
    return `<h3 id="${slugify(group.title)}">${text(group.title)}</h3>
<div class="quote-list">
${items.map(quoteCard).join('\n')}
</div>`;
  })
  .join('\n')}
</section>
<section class="cta-box" aria-labelledby="quotes-next">
  <h2 id="quotes-next">Want the idea behind a line?</h2>
  <p>Each quotation links to the concept it belongs to, with the passage in context and the common misreadings.</p>
  <div class="cta-actions"><a class="btn" href="${HUB.path}">Browse the concepts</a><a class="secondary-btn" href="${section.start.path}">Where to start reading Jung</a></div>
</section>
<section class="sources" aria-labelledby="sources-title">
  <h2 id="sources-title">How these were checked</h2>
  <p>Wording and citations were checked against Daryl Sharp\u2019s <em>Jung Lexicon</em>, the Psychology Club Zurich\u2019s published list of terms, the sourced section of Wikiquote, Jung\u2019s published letters and memoir, and Quote Investigator. Collected Works references give the volume and, where confirmed, the paragraph (\u00a7). Page numbers refer to the editions the sources cite. Quotations are short and are reproduced for commentary.</p>
  <p><a href="${section.standards.path}">Editorial standards</a>. Know a source we missed, or see a mistake? Write to <a href="mailto:${SITE.supportEmail}">${SITE.supportEmail}</a>.</p>
</section>
</div>`;

  const schemas = [
    articleSchema({
      path: meta.path,
      headline: headline(meta.title),
      description: meta.description,
      extra: {
        about: JUNG,
        hasPart: verified.map((quote) => ({
          '@type': 'Quotation',
          '@id': `${absoluteUrl(meta.path)}#q-${quote.id}`,
          text: quote.text,
          creator: { '@type': 'Person', name: 'Carl Gustav Jung' },
          citation: citationText(quote),
        })),
      },
    }),
    breadcrumbSchema(crumbs),
    faqSchema([
      { q: 'Did Jung say "Until you make the unconscious conscious, it will direct your life and you will call it fate"?', a: 'Not in those words. It is a paraphrase of a sentence in Aion (CW 9ii, paragraph 126): "The psychological rule says that when an inner situation is not made conscious, it happens outside, as fate."' },
      { q: 'What is Carl Jung\'s most famous quote?', a: 'Among verified lines, "One does not become enlightened by imagining figures of light, but by making the darkness conscious" (The Philosophical Tree, CW 13, paragraph 335) and "Who looks outside dreams; who looks inside awakes" (letter of 22 October 1916) are the most widely quoted.' },
      { q: 'How can I tell if a Jung quote is real?', a: 'Look for a citation to a specific work, ideally a Collected Works volume and paragraph number, or a dated letter. Lines that circulate with only his name attached are often paraphrases or belong to other writers.' },
    ]),
  ];
  page({ path: meta.path, title: meta.title, description: meta.description, keywords: ['Carl Jung quotes', 'Jung quotes with sources', 'misattributed Jung quotes', 'Jung shadow quotes'], main, schemas, scripts: quotesScript });
}

// ---------- books ----------

function booksIndexPage() {
  const meta = section.books;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Jung Library', path: HUB.path }, { name: 'Book guides', path: meta.path }];
  const levels = [
    { key: 'start', title: 'Start here', blurb: 'Written for general readers, or short enough to read in a weekend.' },
    { key: 'core', title: 'Core works', blurb: 'The books where the theory is stated. Read after an introduction.' },
    { key: 'deep', title: 'Deep water', blurb: 'Long, late or difficult. Best read in parts, with a guide.' },
  ];
  const main = `<div class="page">
${breadcrumb(crumbs)}
<p class="eyebrow">The Jung Library</p>
<h1>Reading guides to Jung\u2019s books</h1>
<p class="lede">${books.length} short guides. Each says what the book is, who it is for, which parts to read first and what to read next. If you are not sure where to begin, use <a href="${section.start.path}">the reading paths</a>.</p>
${levels
  .map(
    (level) => `<section aria-labelledby="level-${level.key}">
<div class="lib-section-head"><h2 id="level-${level.key}">${level.title}</h2><p>${level.blurb}</p></div>
<div class="book-grid">
${books.filter((book) => book.level === level.key).map(bookCard).join('\n')}
</div>
</section>`,
  )
  .join('\n')}
${sourcesNote('Publication facts were checked against library and reference sources. ')}
</div>`;
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: headline(meta.title),
      description: meta.description,
      url: absoluteUrl(meta.path),
      inLanguage: 'en',
      dateModified: buildDate,
      publisher: PUBLISHER,
      mainEntity: { '@type': 'ItemList', itemListElement: books.map((book, index) => ({ '@type': 'ListItem', position: index + 1, name: book.title, url: absoluteUrl(`/jung/books/${book.slug}`) })) },
    },
    breadcrumbSchema(crumbs),
  ];
  page({ path: meta.path, title: meta.title, description: meta.description, keywords: ['Carl Jung books', 'Jung reading guide', 'best Jung books'], main, schemas });
}

function bookPage(book) {
  const path = `/jung/books/${book.slug}`;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Jung Library', path: HUB.path }, { name: 'Book guides', path: section.books.path }, { name: book.title, path }];
  const inPaths = paths.filter((route) => route.steps.some((step) => step.book === book.slug));
  const main = `<div class="entry">
<article class="entry-main">
${breadcrumb(crumbs)}
<p class="eyebrow">Reading guide · ${levelLabel[book.level]} · ${escapeHtml(book.year)}</p>
<h1><em class="book-title">${text(book.title)}</em></h1>
<div class="answer"><p class="eyebrow">What it is</p><p>${inline(book.answer)}</p></div>
<p class="lede"><strong>Who it is for.</strong> ${inline(book.whoFor)}</p>
${sectionsHtml(book.sections)}
<h2 id="key-ideas">Key ideas in this book</h2>
${chips(book.keyIdeas)}
${book.next?.length ? `<h2 id="read-next">What to read next</h2>\n<div class="book-grid">\n${book.next.map((slug) => bookCard(bookBySlug[slug])).join('\n')}\n</div>` : ''}
<h2 id="questions-people-ask">Questions people ask</h2>
${faqHtml(book.faq)}
${sourcesNote('Publication facts were checked against library and reference sources. ')}
</article>
<aside class="entry-aside" aria-label="About this guide">
${inPaths.length ? `<div class="aside-card"><h2>Reading paths with this book</h2><ul class="aside-list">${inPaths.map((route) => `<li><a href="${section.start.path}#${route.slug}">${text(route.title)}</a></li>`).join('')}</ul></div>` : ''}
<div class="aside-card"><h2>More guides</h2><p>Guides to ${books.length} of Jung\u2019s books, sorted by difficulty.</p><a class="btn btn-sm secondary-btn" href="${section.books.path}">All book guides</a></div>
${mapAside(`book_${book.slug}`)}
</aside>
</div>`;
  const schemas = [
    articleSchema({
      path,
      headline: headline(book.seo.title),
      description: book.seo.description,
      extra: {
        about: {
          '@type': 'Book',
          name: book.title,
          author: { '@type': 'Person', name: 'Carl Gustav Jung' },
          datePublished: String(book.year).match(/\d{4}/)?.[0],
          inLanguage: 'en',
        },
      },
    }),
    breadcrumbSchema(crumbs),
    faqSchema(book.faq),
  ];
  page({ path, title: book.seo.title, description: book.seo.description, keywords: [book.title, 'Carl Jung', 'reading guide'], main, schemas });
}

// ---------- where to start ----------

function whereToStartPage() {
  const meta = section.start;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Jung Library', path: HUB.path }, { name: 'Where to start', path: meta.path }];
  const faq = [
    { q: 'What Carl Jung book should I read first?', a: 'For most people, Man and His Symbols. It is the one book Jung planned for general readers, it is illustrated, and it covers his main ideas. Memories, Dreams, Reflections is the best second book.' },
    { q: 'In what order should I read Jung\'s Collected Works?', a: 'Start with volume 7, Two Essays on Analytical Psychology. Then read selected essays from volume 9i, the first four chapters of volume 9ii (Aion), and Chapter X of volume 6 (Psychological Types). Leave the alchemical volumes for last.' },
    { q: 'Should I start with The Red Book?', a: 'No. The Red Book is the private record of Jung\'s inner experiment and assumes you already know why he undertook it. Read his memoir and one introductory work first.' },
  ];
  const main = `<div class="page page-narrow">
${breadcrumb(crumbs)}
<p class="eyebrow">The Jung Library</p>
<h1>Where to start with Jung</h1>
<p class="lede">Jung wrote some twenty volumes, and most of them are a bad place to begin. Pick the path that matches why you are here. Each step links to a short guide.</p>
<div class="answer"><p class="eyebrow">The short answer</p><p>Read <a href="/jung/books/man-and-his-symbols"><em>Man and His Symbols</em></a> first, then <a href="/jung/books/memories-dreams-reflections"><em>Memories, Dreams, Reflections</em></a>. If you want the theory in his own words after that, read <a href="/jung/books/two-essays-on-analytical-psychology"><em>Two Essays on Analytical Psychology</em></a>.</p></div>
${paths
  .map(
    (route) => `<section class="path" id="${route.slug}" aria-labelledby="${route.slug}-title">
<h2 id="${route.slug}-title">${text(route.title)}</h2>
<p>${inline(route.who)}</p>
<ol>
${route.steps.map((step) => `<li><a href="/jung/books/${step.book}">${text(bookBySlug[step.book].title)}</a><span>${inline(step.why)}</span></li>`).join('\n')}
</ol>
</section>`,
  )
  .join('\n')}
<h2 id="before-any-book">Before any book</h2>
<p>If a book feels like too much today, the <a href="${HUB.path}">concept pages</a> are built to be read in five minutes each. Six of them cover most of what people come looking for: ${['shadow', 'archetypes', 'collective-unconscious', 'individuation', 'anima', 'psychological-types'].map((slug) => `<a href="/jung/${slug}">${text(INLINE[slug])}</a>`).join(', ')}.</p>
<h2 id="questions-people-ask">Questions people ask</h2>
${faqHtml(faq)}
<section class="cta-box" aria-labelledby="start-map">
  <h2 id="start-map">Came here from a personality test?</h2>
  <p>Jung\u2019s typology is one chapter of a larger psychology. TypeJung\u2019s free map applies that chapter to your own answers and names your likely dominant and inferior functions, which is a concrete place to begin reading from.</p>
  <div class="cta-actions">${mapButton('jung_start_cta')}<a class="secondary-btn" href="/jung/psychological-types">What Jung meant by types</a></div>
</section>
${sourcesNote()}
</div>`;
  const schemas = [
    articleSchema({ path: meta.path, headline: headline(meta.title), description: meta.description, extra: { about: JUNG } }),
    breadcrumbSchema(crumbs),
    faqSchema(faq),
  ];
  page({ path: meta.path, title: meta.title, description: meta.description, keywords: ['where to start with Jung', 'Jung reading order', 'Carl Jung books in order'], main, schemas });
}

// ---------- life ----------

function lifePage() {
  const meta = section.life;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Jung Library', path: HUB.path }, { name: 'Jung\u2019s life', path: meta.path }];
  const events = timeline
    .map((event) => {
      const related = event.related?.length ? `<ul class="chips chips-sm">${event.related.map((slug) => `<li><a href="/jung/${slug}">${text(conceptBySlug[slug].title)}</a></li>`).join('')}</ul>` : '';
      return `<li><time datetime="${event.year}">${escapeHtml(event.date || String(event.year))}</time><strong>${text(event.title)}</strong><p>${inline(event.text)}</p>${related}</li>`;
    })
    .join('\n');
  const main = `<div class="page page-narrow">
${breadcrumb(crumbs)}
<p class="eyebrow">The Jung Library</p>
<h1>Carl Jung\u2019s life, in ${timeline.length} dates</h1>
<p class="lede">Jung said he could only tell his life as a story of inner events. This timeline gives the outer ones: where he was, what he published, and which ideas came out of each period.</p>
<div class="answer"><p class="eyebrow">In short</p><p>Carl Gustav Jung (1875 to 1961) was a Swiss psychiatrist. He worked with Freud from 1907 to 1913, broke with him, and went on to found analytical psychology. His concepts include the collective unconscious, archetypes, the shadow, individuation, and the psychological types that later personality tests were built on.</p></div>
<ol class="timeline">
${events}
</ol>
<h2 id="a-note-on-the-1930s">A note on the 1930s</h2>
<p>Jung\u2019s conduct in the first years of Nazi rule remains disputed. In 1933 he accepted the presidency of a German-based psychotherapy society and edited its journal, and in 1934 he published remarks contrasting \u201cAryan\u201d and \u201cJewish\u201d psychology that have been widely condemned. His defenders point to the help he gave Jewish colleagues and to his later criticism of National Socialism. A fair reading of his work does not require settling the question, but it should not leave it out.</p>
<section class="cta-box" aria-labelledby="life-next">
  <h2 id="life-next">Read the life in his own words</h2>
  <p>His memoir covers the same years from the inside. The guide explains how it was written and which chapters to read first.</p>
  <div class="cta-actions"><a class="btn" href="/jung/books/memories-dreams-reflections">Guide to the memoir</a><a class="secondary-btn" href="${section.start.path}">Where to start reading</a></div>
</section>
${sourcesNote('Dates were checked against reference sources and the works themselves. ')}
</div>`;
  const schemas = [
    articleSchema({
      path: meta.path,
      headline: headline(meta.title),
      description: meta.description,
      extra: {
        about: { ...JUNG, birthDate: '1875-07-26', deathDate: '1961-06-06', birthPlace: { '@type': 'Place', name: 'Kesswil, Switzerland' }, deathPlace: { '@type': 'Place', name: 'K\u00fcsnacht, Switzerland' }, nationality: 'Swiss', jobTitle: 'Psychiatrist' },
      },
    }),
    breadcrumbSchema(crumbs),
  ];
  page({ path: meta.path, title: meta.title, description: meta.description, keywords: ['Carl Jung biography', 'Jung timeline', 'Carl Jung life'], main, schemas });
}

// ---------- practices ----------

function practicePage(practice) {
  const path = `/jung/practice/${practice.slug}`;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Jung Library', path: HUB.path }, { name: practice.title, path }];
  const usesMap = practice.slug !== 'dream-journal';
  const main = `<div class="entry">
<article class="entry-main">
${breadcrumb(crumbs)}
<p class="eyebrow">Practice</p>
<h1>${text(practice.title)}</h1>
<div class="answer"><p class="eyebrow">What it is</p><p>${inline(practice.answer)}</p></div>
<div class="caution" role="note"><p><strong>Before you start.</strong> ${inline(practice.caution)}</p></div>
<h2 id="the-steps">The steps</h2>
<ol class="steps">
${practice.steps.map((step) => `<li><h3>${text(step.h)}</h3>${paragraphs(step.p)}</li>`).join('\n')}
</ol>
${(practice.jung || []).slice(0, 1).map(quoteFigure).join('\n')}
${sectionsHtml(practice.sections)}
${(practice.jung || []).slice(1).map(quoteFigure).join('\n')}
${
  usesMap
    ? `<section class="next-step" aria-labelledby="next-step-title">
  <p class="eyebrow">Free · 42 questions · 20 to 25 minutes</p>
  <h2 id="next-step-title">Find the function this practice points at</h2>
  <p>The practice works best when you know which function you lead with and which you have developed least. The free map names both, from your own answers.</p>
  ${mapButton(sourceTag('jung_practice', practice.slug, 'next'))}
  <small>The free map comes first. No account or payment is needed to see your result.</small>
</section>`
    : `<section class="next-step" aria-labelledby="next-step-title">
  <p class="eyebrow">The idea behind it</p>
  <h2 id="next-step-title">How Jung read dreams</h2>
  <p>The entry on dreams sets out his method in full: why he rejected the idea of disguise, what compensation means, and how he worked with a series.</p>
  <a class="btn" href="/jung/dreams">Read the entry on dreams</a>
</section>`
}
<h2 id="questions-people-ask">Questions people ask</h2>
${faqHtml(practice.faq)}
<h2 id="related-ideas">Related ideas</h2>
${chips(practice.related)}
${sourcesNote()}
</article>
<aside class="entry-aside" aria-label="About this practice">
<div class="aside-card"><h2>Other practices</h2><ul class="aside-list">${practices.filter((other) => other.slug !== practice.slug).map((other) => `<li><a href="/jung/practice/${other.slug}">${text(other.title)}</a></li>`).join('')}</ul></div>
${mapAside(`practice_${practice.slug}`)}
</aside>
</div>`;
  const schemas = [
    articleSchema({ path, headline: headline(practice.seo.title), description: practice.seo.description, extra: { about: JUNG } }),
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: practice.title,
      description: plain(practice.answer),
      step: practice.steps.map((step, index) => ({ '@type': 'HowToStep', position: index + 1, name: step.h, text: step.p.map(plain).join(' ') })),
    },
    breadcrumbSchema(crumbs),
    faqSchema(practice.faq),
  ];
  page({ path, title: practice.seo.title, description: practice.seo.description, keywords: [practice.title, 'Jungian practice', 'Carl Jung'], main, schemas });
}

// ---------- editorial standards ----------

function standardsPage() {
  const meta = section.standards;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Jung Library', path: HUB.path }, { name: 'Editorial standards', path: meta.path }];
  const main = `<div class="page page-narrow">
${breadcrumb(crumbs)}
<p class="eyebrow">The Jung Library</p>
<h1>Editorial standards</h1>
<p class="lede">The library exists so that a reader can find out what Jung actually meant, in plain words, and check it. These are the rules it is written to.</p>

<h2 id="quotations">Quotations</h2>
<ul>
  <li><strong>Every quotation is checked.</strong> A line is quoted only after its wording and source have been seen at a published source. Quote-card sites and unsourced lists do not count.</li>
  <li><strong>Citations are specific.</strong> We cite the work and the essay or chapter. Collected Works references give the volume and, where we could confirm it, the paragraph number. \u201cCW 9ii, \u00a714\u201d means volume 9, part ii, paragraph 14. Where a paragraph could not be confirmed, it is left out. We do not guess.</li>
  <li><strong>What cannot be verified is paraphrased.</strong> If we cannot confirm the wording, we describe the idea in our own words, without quotation marks, and say which work it comes from.</li>
  <li><strong>Quotations are short.</strong> Jung\u2019s works are in copyright. We quote briefly, for the purpose of commentary, and point to where the full passage can be read.</li>
  <li><strong>Misquotations are labeled.</strong> The <a href="${section.quotes.path}">quotes page</a> separates verified lines from paraphrases, misattributions and lines with no known source.</li>
</ul>

<h2 id="interpretation">Interpretation</h2>
<ul>
  <li><strong>We attribute.</strong> Entries say \u201cJung held\u201d or \u201cin Jung\u2019s account\u201d. His theories are presented as his theories. They are not presented as established science, and where mainstream psychology disagrees, the entry says so.</li>
  <li><strong>We separate Jung from his successors.</strong> Ideas that come from Marie-Louise von Franz, Erich Neumann, James Hillman, Joseph Campbell, or Briggs and Myers are credited to them.</li>
  <li><strong>We name what has dated.</strong> Parts of Jung\u2019s writing on gender, on race and culture, and on his own role in the 1930s are contested or plainly of their time. The relevant entries say so.</li>
</ul>

<h2 id="what-we-do-not-claim">What we do not claim</h2>
<ul>
  <li>TypeJung is an independent project. It is not affiliated with the Jung family, the Foundation of the Works of C. G. Jung, the C. G. Jung Institute, or any professional association of analysts.</li>
  <li>The library is not written by licensed analysts and is not a substitute for analysis, therapy or medical care. Practice pages say when to stop and when to seek professional support.</li>
  <li>The free map on this site is a self-report tool built on Jung\u2019s typology. It suggests a likely dominant and inferior function. It does not measure the shadow, archetypes, complexes or anything else described in these pages.</li>
</ul>

<h2 id="how-entries-are-written">How entries are written</h2>
<p>Entries are drafted with the help of AI tools. Every quotation is then checked, with its citation, against a published source before it goes live. Dates and publication facts are checked against reference sources. Anything that cannot be confirmed is cut or rewritten as a paraphrase. An automated check runs on every build and rejects any quotation that has no recorded source. We would rather publish a shorter entry than an unverified one.</p>

<h2 id="corrections">Corrections</h2>
<p>We will get things wrong. If you find a misquotation, a wrong citation, a factual error or a reading you think is unfair to Jung, write to <a href="mailto:${SITE.supportEmail}">${SITE.supportEmail}</a> with the page and the source. Confirmed errors are corrected.</p>

<h2 id="sources-we-rely-on">Sources we rely on</h2>
<p>Jung\u2019s <em>Collected Works</em> (Princeton University Press and Routledge), his published letters and <em>Memories, Dreams, Reflections</em>; Daryl Sharp\u2019s <em>Jung Lexicon</em>; the Psychology Club Zurich\u2019s published terms; the sourced sections of Wikiquote; Quote Investigator; and, for dates and publication facts, the editorial notes of the <em>Collected Works</em>, library catalog records and Wikipedia.</p>

<section class="cta-box" aria-labelledby="standards-next">
  <h2 id="standards-next">Back to the library</h2>
  <div class="cta-actions"><a class="btn" href="${HUB.path}">Browse the concepts</a><a class="secondary-btn" href="${section.quotes.path}">Quotes, with sources</a></div>
</section>
</div>`;
  const schemas = [articleSchema({ path: meta.path, headline: headline(meta.title), description: meta.description }), breadcrumbSchema(crumbs)];
  page({ path: meta.path, title: meta.title, description: meta.description, main, schemas });
}

// ---------- run ----------

concepts.forEach(conceptPage);
hubPage();
glossaryPage();
quotesPage();
booksIndexPage();
books.forEach(bookPage);
whereToStartPage();
lifePage();
practices.forEach(practicePage);
standardsPage();

console.log(`Generated the Jung Library: ${libraryPages.length} pages (${concepts.length} concepts, ${books.length} book guides, ${practices.length} practices, ${SECTION_PAGES.length + 1} index pages).`);
