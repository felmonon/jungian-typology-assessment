// The list of Jung Library pages, derived from the content files. The page
// generator, the sitemap and the AI index all read this one list.
import { CONCEPTS, FAMILIES } from './registry.mjs';
import structure from './concepts-structure.mjs';
import dynamics from './concepts-dynamics.mjs';
import typesAndFigures from './concepts-types-figures.mjs';
import { books, paths, timeline } from './books.mjs';
import { practices, quotes } from './quotes-practices.mjs';

export const concepts = [...structure, ...dynamics, ...typesAndFigures].map((entry) => ({
  ...entry,
  title: CONCEPTS[entry.slug].title,
  family: CONCEPTS[entry.slug].family,
  familyLabel: FAMILIES[CONCEPTS[entry.slug].family].label,
  path: `/jung/${entry.slug}`,
}));

export const conceptBySlug = Object.fromEntries(concepts.map((entry) => [entry.slug, entry]));
export const bookBySlug = Object.fromEntries(books.map((book) => [book.slug, book]));
export const practiceBySlug = Object.fromEntries(practices.map((practice) => [practice.slug, practice]));

export { books, paths, practices, quotes, timeline };

const verifiedQuoteCount = quotes.filter((quote) => quote.status === 'verified').length;

export const HUB = {
  path: '/jung',
  title: 'The Jung Library: Carl Jung\'s Ideas, Explained | TypeJung',
  description: `Carl Jung's ideas in plain words and in his own, with sources. ${concepts.length} concepts, ${verifiedQuoteCount} checked quotations, reading guides to ${books.length} books, and careful practices.`,
};

export const SECTION_PAGES = [
  { key: 'glossary', path: '/jung/glossary', title: 'Jungian Psychology Glossary: Terms Defined | TypeJung', description: `A plain-language glossary of ${concepts.length} terms from Carl Jung's psychology, from active imagination to the wounded healer, each linked to a sourced explanation.`, label: 'Glossary', blurb: 'Every term, defined in a sentence.' },
  { key: 'quotes', path: '/jung/quotes', title: 'Carl Jung Quotes, With Sources and the Fakes | TypeJung', description: `${verifiedQuoteCount} Carl Jung quotes checked against published sources and cited to the work, plus the popular lines he never wrote and what he actually said.`, label: 'Quotes, with sources', blurb: 'What he wrote, where, and what he never said.' },
  { key: 'books', path: '/jung/books', title: 'Carl Jung Books: Reading Guides to His Works | TypeJung', description: `Reading guides to ${books.length} books by Carl Jung: what each one contains, who it is for, which chapters to read first, and what to read next.`, label: 'Book guides', blurb: 'What is in each book and how to read it.' },
  { key: 'start', path: '/jung/where-to-start', title: 'Where to Start With Carl Jung: Reading Order | TypeJung', description: `Where to start reading Carl Jung, depending on what brought you here. ${paths.length} short reading paths through his books, with the reason for each step.`, label: 'Where to start', blurb: 'A reading order for where you are.' },
  { key: 'life', path: '/jung/life', title: 'Carl Jung\'s Life: A Timeline, 1875 to 1961 | TypeJung', description: `A timeline of Carl Jung's life and work in ${timeline.length} dated events, from his birth in 1875 to the publication of The Red Book, linked to the ideas each produced.`, label: 'Jung\'s life', blurb: 'A dated timeline of the life behind the ideas.' },
  { key: 'standards', path: '/jung/editorial-standards', title: 'Editorial Standards for the Jung Library | TypeJung', description: 'How the TypeJung Jung Library is written and checked: sourcing rules for quotations, what we do not claim, how AI assistance is used, and how to report an error.', label: 'Editorial standards', blurb: 'How the library is written and checked.' },
];

/** Every library page: { path, file, kind, title, description, priority }. */
export const libraryPages = [
  { ...HUB, kind: 'hub', priority: 0.9 },
  ...SECTION_PAGES.map((page) => ({ path: page.path, kind: page.key, title: page.title, description: page.description, priority: page.key === 'standards' ? 0.4 : 0.8 })),
  ...concepts.map((entry) => ({ path: entry.path, kind: 'concept', title: entry.seo.title, description: entry.seo.description, priority: 0.8 })),
  ...books.map((book) => ({ path: `/jung/books/${book.slug}`, kind: 'book', title: book.seo.title, description: book.seo.description, priority: 0.7 })),
  ...practices.map((practice) => ({ path: `/jung/practice/${practice.slug}`, kind: 'practice', title: practice.seo.title, description: practice.seo.description, priority: 0.8 })),
].map((page) => ({ ...page, file: `${page.path.slice(1)}/index.html` }));
