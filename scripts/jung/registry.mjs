// Shared registry for the Jung Library. Content files reference these keys so
// citations, links and the psyche map stay consistent across every page.

export const FAMILIES = {
  structure: { label: 'Structure of the psyche', blurb: 'The parts Jung distinguished, and how they relate.' },
  dynamics: { label: 'How the psyche moves', blurb: 'The processes that carry energy between conscious and unconscious.' },
  process: { label: 'Growth and method', blurb: 'Individuation, and the methods Jung used to support it.' },
  typology: { label: 'Psychological types', blurb: 'Attitudes, functions, and the idea behind every type system since.' },
  figures: { label: 'Archetypal figures', blurb: 'Recurring characters in myth, dream and fantasy.' },
  symbolism: { label: 'Symbols and sources', blurb: 'The images and traditions Jung read as maps of the psyche.' },
};

// Regions of the psyche map (see scripts/jung/psyche-map.mjs). Each concept highlights one.
export const REGIONS = [
  'whole', 'consciousness', 'ego', 'persona', 'personal-unconscious', 'shadow', 'complexes',
  'collective-unconscious', 'anima-animus', 'archetypes', 'self', 'threshold', 'axis', 'outer', 'types',
];

// Primary works. `cite` is how a work is named in a citation line.
export const WORKS = {
  cw4: { title: 'Freud and Psychoanalysis', cite: 'Freud and Psychoanalysis (CW 4)', year: '1906-1930' },
  cw5: { title: 'Symbols of Transformation', cite: 'Symbols of Transformation (CW 5)', year: '1912/1952' },
  cw6: { title: 'Psychological Types', cite: 'Psychological Types (CW 6)', year: '1921' },
  cw7: { title: 'Two Essays on Analytical Psychology', cite: 'Two Essays on Analytical Psychology (CW 7)', year: '1917/1928' },
  cw8: { title: 'The Structure and Dynamics of the Psyche', cite: 'The Structure and Dynamics of the Psyche (CW 8)', year: '1916-1952' },
  cw9i: { title: 'The Archetypes and the Collective Unconscious', cite: 'The Archetypes and the Collective Unconscious (CW 9i)', year: '1934-1954' },
  cw9ii: { title: 'Aion', cite: 'Aion (CW 9ii)', year: '1951' },
  cw10: { title: 'Civilization in Transition', cite: 'Civilization in Transition (CW 10)', year: '1918-1959' },
  cw11: { title: 'Psychology and Religion: West and East', cite: 'Psychology and Religion: West and East (CW 11)', year: '1938-1954' },
  cw12: { title: 'Psychology and Alchemy', cite: 'Psychology and Alchemy (CW 12)', year: '1944' },
  cw13: { title: 'Alchemical Studies', cite: 'Alchemical Studies (CW 13)', year: '1929-1954' },
  cw14: { title: 'Mysterium Coniunctionis', cite: 'Mysterium Coniunctionis (CW 14)', year: '1955-56' },
  cw15: { title: 'The Spirit in Man, Art, and Literature', cite: 'The Spirit in Man, Art, and Literature (CW 15)', year: '1922-1941' },
  cw16: { title: 'The Practice of Psychotherapy', cite: 'The Practice of Psychotherapy (CW 16)', year: '1921-1951' },
  cw17: { title: 'The Development of Personality', cite: 'The Development of Personality (CW 17)', year: '1910-1943' },
  cw18: { title: 'The Symbolic Life', cite: 'The Symbolic Life (CW 18)', year: '1901-1961' },
  mdr: { title: 'Memories, Dreams, Reflections', cite: 'Memories, Dreams, Reflections', year: '1962' },
  mhs: { title: 'Man and His Symbols', cite: 'Man and His Symbols', year: '1964' },
  mmss: { title: 'Modern Man in Search of a Soul', cite: 'Modern Man in Search of a Soul', year: '1933' },
  redbook: { title: 'The Red Book: Liber Novus', cite: 'The Red Book: Liber Novus', year: '2009' },
  letters1: { title: 'Letters, Volume 1: 1906-1950', cite: 'C. G. Jung Letters, vol. 1', year: '1973' },
  letters2: { title: 'Letters, Volume 2: 1951-1961', cite: 'C. G. Jung Letters, vol. 2', year: '1975' },
  speaking: { title: 'C. G. Jung Speaking: Interviews and Encounters', cite: 'C. G. Jung Speaking', year: '1977' },
  undiscovered: { title: 'The Undiscovered Self', cite: 'The Undiscovered Self (in CW 10)', year: '1957' },
  job: { title: 'Answer to Job', cite: 'Answer to Job (in CW 11)', year: '1952' },
  visions: { title: 'Visions: Notes of the Seminar Given in 1930-1934', cite: 'Visions Seminar', year: '1997' },
  zarathustra: { title: "Nietzsche's Zarathustra: Notes of the Seminar Given in 1934-1939", cite: 'Zarathustra Seminar', year: '1988' },
  other: { title: 'Other source', cite: '', year: '' },
};

// The launch set. slug -> { title (H1), file }
export const CONCEPTS = {
  // structure (concepts-structure.mjs)
  psyche: { title: 'The psyche', family: 'structure' },
  ego: { title: 'The ego', family: 'structure' },
  persona: { title: 'The persona', family: 'structure' },
  shadow: { title: 'The shadow', family: 'structure' },
  anima: { title: 'The anima', family: 'structure' },
  animus: { title: 'The animus', family: 'structure' },
  self: { title: 'The Self', family: 'structure' },
  'personal-unconscious': { title: 'The personal unconscious', family: 'structure' },
  'collective-unconscious': { title: 'The collective unconscious', family: 'structure' },
  archetypes: { title: 'Archetypes', family: 'structure' },
  complexes: { title: 'Complexes', family: 'structure' },
  'psychic-energy': { title: 'Libido as psychic energy', family: 'dynamics' },
  // dynamics and process (concepts-dynamics.mjs)
  individuation: { title: 'Individuation', family: 'process' },
  projection: { title: 'Projection', family: 'dynamics' },
  compensation: { title: 'Compensation', family: 'dynamics' },
  enantiodromia: { title: 'Enantiodromia', family: 'dynamics' },
  'transcendent-function': { title: 'The transcendent function', family: 'process' },
  'active-imagination': { title: 'Active imagination', family: 'process' },
  dreams: { title: 'Dreams', family: 'process' },
  symbols: { title: 'Symbols', family: 'symbolism' },
  synchronicity: { title: 'Synchronicity', family: 'dynamics' },
  inflation: { title: 'Inflation', family: 'dynamics' },
  opposites: { title: 'The tension of opposites', family: 'dynamics' },
  numinous: { title: 'The numinous', family: 'symbolism' },
  // typology and figures (concepts-types-figures.mjs)
  'psychological-types': { title: 'Psychological types', family: 'typology' },
  'introversion-and-extraversion': { title: 'Introversion and extraversion', family: 'typology' },
  'four-functions': { title: 'The four functions', family: 'typology' },
  'inferior-function': { title: 'The inferior function', family: 'typology' },
  mandala: { title: 'The mandala', family: 'symbolism' },
  alchemy: { title: 'Jung and alchemy', family: 'symbolism' },
  hero: { title: 'The hero', family: 'figures' },
  trickster: { title: 'The trickster', family: 'figures' },
  'great-mother': { title: 'The mother archetype', family: 'figures' },
  'wise-old-man': { title: 'The wise old man', family: 'figures' },
  'puer-aeternus': { title: 'Puer aeternus', family: 'figures' },
  'wounded-healer': { title: 'The wounded healer', family: 'figures' },
};

export const BOOKS = [
  'memories-dreams-reflections', 'man-and-his-symbols', 'modern-man-in-search-of-a-soul', 'the-undiscovered-self',
  'the-portable-jung', 'two-essays-on-analytical-psychology', 'psychological-types',
  'archetypes-and-the-collective-unconscious', 'aion', 'symbols-of-transformation', 'psychology-and-alchemy',
  'answer-to-job', 'synchronicity', 'the-red-book', 'mysterium-coniunctionis',
];

export const PRACTICES = ['shadow-work', 'dream-journal', 'inferior-function-practice'];

// Existing TypeJung pages that library text may link to with [[/path|label]].
export const SITE_PATHS = [
  '/assessment', '/pricing', '/sample-report', '/methodology', '/learn', '/about',
  '/functions/ni', '/functions/ne', '/functions/si', '/functions/se', '/functions/ti', '/functions/te', '/functions/fi', '/functions/fe',
  '/cognitive-functions', '/jungian-typology', '/inferior-function-test', '/mbti-keeps-changing', '/jungian-cognitive-functions-test',
  '/jung', '/jung/glossary', '/jung/quotes', '/jung/books', '/jung/where-to-start', '/jung/life', '/jung/editorial-standards',
  ...BOOKS.map((slug) => `/jung/books/${slug}`),
  ...PRACTICES.map((slug) => `/jung/practice/${slug}`),
];

export const RESERVED_SLUGS = ['glossary', 'books', 'quotes', 'life', 'practice', 'where-to-start', 'editorial-standards', 'index'];

// How a concept is named in the middle of a sentence when linked with [[slug]].
// (Titles carry articles and capitals; running prose does not.)
export const INLINE = {
  psyche: 'psyche', ego: 'ego', persona: 'persona', shadow: 'shadow', anima: 'anima', animus: 'animus', self: 'Self',
  'personal-unconscious': 'personal unconscious', 'collective-unconscious': 'collective unconscious',
  archetypes: 'archetypes', complexes: 'complexes', 'psychic-energy': 'psychic energy',
  individuation: 'individuation', projection: 'projection', compensation: 'compensation', enantiodromia: 'enantiodromia',
  'transcendent-function': 'transcendent function', 'active-imagination': 'active imagination', dreams: 'dreams',
  symbols: 'symbols', synchronicity: 'synchronicity', inflation: 'inflation', opposites: 'opposites', numinous: 'numinous',
  'psychological-types': 'psychological types', 'introversion-and-extraversion': 'introversion and extraversion',
  'four-functions': 'four functions', 'inferior-function': 'inferior function', mandala: 'mandala', alchemy: 'alchemy',
  hero: 'hero', trickster: 'trickster', 'great-mother': 'mother archetype', 'wise-old-man': 'wise old man',
  'puer-aeternus': 'puer aeternus', 'wounded-healer': 'wounded healer',
};
