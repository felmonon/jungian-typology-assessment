# The Jung Library: content guide

The library lives at `/jung`. Every page is generated from the data files in this
folder by `scripts/generate-jung-library.mjs`. This guide is the editorial contract.
Run `node scripts/jung/validate.mjs` before committing content.

## What the library is for

A reader arrives with one question: *what did Jung actually mean by this, and what
does it have to do with me?* Each entry answers in plain words first, lets Jung speak
in his own words with an exact source, names the common misreadings, and offers one
grounded next step. The library is the reason TypeJung can claim to be a place to
understand Jung, and it is the main way new readers find the free map.

## Voice

- Calm, exact, plain. Short sentences. No hype, no mysticism, no academic fog.
- Explain like a well-read friend, not a guru and not a textbook.
- Attribute. Write "Jung held", "Jung described", "in Jung's account". Do not state
  his theories as established science.
- Separate Jung from what came later. Say so when an idea is from von Franz, Hillman,
  Myers and Briggs, or popular usage rather than from Jung.
- Educational only. No diagnosis, no treatment advice, no promises of healing or
  transformation. Where a practice can stir up distress, say so and point to
  professional support.
- American spelling in our own prose. Keep the translator's spelling inside quotations.
- No em dashes in our own prose. Use a comma, a colon or a period.
- Avoid: "unlock", "true self", "journey" as filler, "delve", "tapestry", "powerful",
  "transform your life", "clinically", "diagnose", "cure", "manifest".

## Sourcing rules (non-negotiable)

1. **Every quotation is checked.** A quotation may be used only after you have seen
   the wording and the source at a URL, and that URL goes in `verifiedAt`. Good places
   to check: Daryl Sharp's *Jung Lexicon* (https://jungpage.org/learn/jung-lexicon),
   the Psychology Club Zurich terms page (https://www.psychologyclub.ch/en/cg-jung/work/jungian-terms),
   Wikiquote's sourced section (https://en.wikiquote.org/wiki/Carl_Jung), publisher pages,
   and scholarly articles. A quote-card site or Goodreads is not verification.
2. **Paragraph numbers only when verified.** Cite the Collected Works as
   `work: 'cw9ii', essay: 'The Shadow', locator: '§14'`. If you could confirm the work and
   essay but not the paragraph, leave `locator` out. Never guess a paragraph number.
3. **If you cannot verify a quotation, paraphrase it** in our own words without quotation
   marks, and attribute the idea to the work it comes from.
4. **Keep quotations short.** 60 words or fewer, at most three per entry. Jung's works
   are in copyright; we quote briefly for commentary.
5. **Facts need a source too.** Dates, titles and events must match a reliable source.
   Timeline events carry their own `verifiedAt`.
6. **Flag doubt.** If a claim is contested among Jung scholars, say that it is.

## Inline markup

- `[[shadow]]` links to a concept using its title; `[[shadow|his shadow]]` sets the label.
- `[[/functions/ni|introverted intuition]]` links to an existing TypeJung page.
  Allowed paths are listed in `SITE_PATHS` in `registry.mjs`.
- `*italic*` for titles and emphasis, `**bold**` sparingly.

## Concept entries (`concepts-*.mjs`, default export: array)

```js
{
  slug: 'shadow',                       // must exist in CONCEPTS in registry.mjs
  region: 'shadow',                     // psyche-map highlight; one of REGIONS
  aka: ['shadow self', 'shadow side'],  // optional: other names people search for
  oneLine: 'Everything about you that your conscious self-image leaves out, for better and for worse.', // <= 120 chars
  answer: '35 to 70 words. A complete plain-language definition that stands alone.',
  jung: [                               // 1 to 3 verified quotations
    { text: '...', work: 'cw9ii', essay: 'The Shadow', locator: '§14', verifiedAt: 'https://...' },
  ],
  sections: [                           // 3 to 5 sections, 300 to 520 words in total
    { h: 'What Jung meant', p: ['...', '...'] },
    { h: 'How it shows up', p: ['...'] },
    { h: 'Why it matters', p: ['...'] },
    { h: 'Working with it', p: ['...'] },      // `bullets: [...]` is also allowed
  ],
  misread: ['2 to 4 items. Each names a common misreading in quotes, then corrects it.'],
  related: ['projection', 'persona', 'ego'],   // 3 to 6 concept slugs
  read: [{ work: 'cw9ii', where: 'Chapter II, "The Shadow". A few pages, and the best place to start.' }],
  cta: { kind: 'map', text: 'One or two sentences linking this idea to the free map.' },
  //   or { kind: 'practice', practice: 'shadow-work', text: '...' }
  //   or { kind: 'read', book: 'man-and-his-symbols', text: '...' }
  faq: [{ q: '...', a: '75 words or fewer.' }], // 2 or 3 real questions people ask
  seo: { title: '<= 62 chars, ends with " | TypeJung"', description: '120 to 165 chars' },
}
```

Suggested section headings: "What Jung meant", "How it shows up", "Why it matters",
"Working with it", "Where the idea came from", "Jung versus later use". Use the ones
that fit. The `cta.kind: 'map'` text must be honest about what the free map shows:
a function-stack map built from 42 answers, with the likely dominant and inferior
functions. It does not measure the shadow, archetypes or complexes.

### Gold-standard example

```js
{
  slug: 'shadow',
  region: 'shadow',
  aka: ['shadow self', 'shadow side'],
  oneLine: 'Everything about you that your conscious self-image leaves out, for better and for worse.',
  answer: 'The shadow is Jung\'s name for the parts of your personality that you do not identify with: traits, wishes and capacities that were pushed out of awareness because they did not fit the person you needed to be. It is not evil by definition. It holds what is unlived, including strengths.',
  jung: [
    { text: 'The shadow is a moral problem that challenges the whole ego-personality, for no one can become conscious of the shadow without considerable moral effort.', work: 'cw9ii', essay: 'The Shadow', locator: '§14', verifiedAt: 'https://www.psychologyclub.ch/en/cg-jung/work/jungian-terms' },
    { text: 'The shadow [is] that hidden, repressed, for the most part inferior and guilt-laden personality whose ultimate ramifications reach back into the realm of our animal ancestors and so comprise the whole historical aspect of the unconscious.', work: 'cw9ii', essay: 'Conclusion', locator: '§422', verifiedAt: 'https://www.psychologyclub.ch/en/cg-jung/work/jungian-terms' },
  ],
  sections: [
    { h: 'What Jung meant', p: [
      'Jung used the word shadow for the part of the personality that the [[ego]] has not accepted as its own. Much of it forms early. A child learns which reactions bring approval and which bring trouble, and the second group goes underground. What is hidden does not disappear. It stays active in the [[personal-unconscious]] and keeps its energy.',
      'He treated the shadow first as a personal problem and only second as an archetypal one. The personal shadow can be known with honest effort, because it is made of your own history. Behind it stands a collective layer, the human capacity for destructiveness, which no individual fully takes in.',
    ] },
    { h: 'How it shows up', p: [
      'The clearest sign is [[projection]]: a quality you cannot see in yourself becomes glaring in someone else. Strong, repeated irritation at one kind of person is the classic clue. The shadow also appears in slips, in what you do when tired or under pressure, in humor that goes too far, and in dreams, where Jung observed that it usually takes the form of a figure of the dreamer\'s own sex.',
      'In typology the [[inferior-function]] is closely tied to the shadow. The least developed function is the easiest door for unconscious contents, which is why a careful thinker can be flooded by raw feeling, or an intuitive can be thrown by a physical detail.',
    ] },
    { h: 'Why it matters', p: [
      'Jung\'s point was practical. A shadow that stays unconscious does not stay quiet. It is lived out indirectly, through blame, moral certainty and sudden reversals, and on a large scale through scapegoating. A shadow that is recognized becomes something you can take responsibility for. He also insisted that it contains value: instinct, spontaneity, anger that protects, ambition that was shamed. Meeting it is the first stage of [[individuation]], and in his account it comes before the encounter with the [[anima]] or [[animus]].',
    ] },
    { h: 'Working with it', p: [
      'Jung did not offer a technique that removes the shadow. He described an attitude: notice the reaction, withdraw the projection, admit the trait without acting it out, and carry the tension that follows. Integration means the ego becomes wider and less brittle. It does not mean the shadow becomes pleasant, or that every impulse deserves expression.',
    ] },
  ],
  misread: [
    '"The shadow is your dark or evil side." Jung described it as mostly inferior, primitive and unadapted rather than wicked, and said it also holds good qualities that were never lived.',
    '"Shadow work is a set of journal prompts that clears it out." For Jung the shadow is never finished. It is a moral problem you return to, and prompts are only a way to start noticing.',
    '"Integrating the shadow means acting on it." He meant becoming conscious of it and owning it. Acting it out is the opposite of integration.',
    '"The shadow is the same as the unconscious." It is one part. The unconscious also holds complexes, the anima or animus, and archetypal material that was never personal.',
  ],
  related: ['projection', 'persona', 'ego', 'personal-unconscious', 'inferior-function', 'individuation'],
  read: [
    { work: 'cw9ii', where: 'Chapter II, "The Shadow". A few pages, and the best place to start.' },
    { work: 'cw11', where: '"Psychology and Religion", on what happens when the shadow is denied.' },
    { work: 'mhs', where: 'Part 3, "The Process of Individuation" by Marie-Louise von Franz, on meeting the shadow in dreams.' },
  ],
  cta: { kind: 'map', text: 'In Jung\'s typology the shadow most often speaks through your least developed function. The free map shows which function that is likely to be for you.' },
  faq: [
    { q: 'Is the shadow the same as the unconscious?', a: 'No. The shadow is the part of the unconscious made of what you have rejected about yourself. Jung also described complexes, the anima and animus, and a collective layer of archetypes that was never personal.' },
    { q: 'Can you get rid of your shadow?', a: 'Jung thought not. Everyone has one, and trying to be rid of it only makes it more unconscious. The aim is to know it and take responsibility for it.' },
    { q: 'How do I recognize my shadow?', a: 'Look at what irritates you out of proportion in other people, what you do under pressure that surprises you, and the same-sex figures who trouble you in dreams. Jung treated these as its usual signs.' },
  ],
  seo: { title: 'The Shadow in Jungian Psychology: What Jung Meant | TypeJung', description: 'What Carl Jung meant by the shadow, in plain words and in his own, with sources. How it shows up, how it is misread, and what working with it involves.' },
}
```

## Books, reading paths and timeline (`books.mjs`, named exports)

```js
export const books = [{
  slug: 'man-and-his-symbols',          // must exist in BOOKS
  title: 'Man and His Symbols', year: '1964', work: 'mhs', // work key from WORKS, or null
  level: 'start',                        // start | core | deep
  answer: '35 to 70 words: what the book is.',
  whoFor: 'One or two sentences: who should read it, and when.',
  sections: [{ h: 'What is in it', p: ['...'] }, { h: 'How to read it', p: ['...'] }, { h: 'What it leads to', p: ['...'] }], // 200 to 420 words
  keyIdeas: ['archetypes', 'dreams', 'individuation'],  // concept slugs, at least 2
  next: ['memories-dreams-reflections'],                // book slugs
  faq: [{ q: '...', a: '...' }], seo: { title: '...', description: '...' },
}];
export const paths = [{ slug: 'first-contact', title: '...', who: '...', steps: [{ book: 'man-and-his-symbols', why: '...' }] }]; // at least 3 paths
export const timeline = [{ year: 1875, date: '26 July 1875', title: '...', text: 'One or two sentences.', related: ['...'], verifiedAt: 'https://...' }]; // at least 24 events
```

## Quotes and practices (`quotes-practices.mjs`, named exports)

```js
export const quotes = [{
  id: 'darkness-conscious',
  status: 'verified',                    // verified | paraphrase | misattributed | unsourced
  text: 'The wording as it appears in the source (verified) or as it circulates (other statuses).',
  work: 'cw13', essay: 'The Philosophical Tree', locator: '§335', year: '1945',  // for verified
  actual: { text: 'What Jung actually wrote.', work: 'cw9ii', locator: '§126' },  // required for paraphrase
  note: 'One or two sentences of context: what the passage is about, or why the popular form is wrong.',
  topics: ['shadow'], verifiedAt: 'https://...',
}];
export const practices = [{
  slug: 'shadow-work',                   // must exist in PRACTICES
  title: '...', answer: '35 to 70 words.',
  caution: 'When to stop and when to get support. Required.',
  steps: [{ h: '...', p: ['...'] }],     // at least 4 concrete steps
  sections: [{ h: '...', p: ['...'] }],  // 220 to 520 words: where it comes from in Jung, what it is not
  jung: [/* verified quotations */], related: ['shadow', 'projection'],
  faq: [{ q: '...', a: '...' }], seo: { title: '...', description: '...' },
}];
```

Statuses: `verified` means the wording and source were confirmed. `paraphrase` means a
popular wording that condenses something Jung did write (give the real passage in
`actual`). `misattributed` means the line belongs to someone else or has no connection
to Jung. `unsourced` means widely attributed but no primary source has been found.
