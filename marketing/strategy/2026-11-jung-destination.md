# TypeJung strategy, November 2026: the place to understand Jung

Owner goal: make TypeJung the site people go to for Jung on the internet.
This document is the controlling strategy. `marketing/brand-os.md` keeps the
voice rules and the assessment wedge; where the two disagree, this one wins.

## 1. Where we are

- **Reach is narrow.** Search traffic is almost entirely one intent: people looking
  for a cognitive functions test, a type comparison quiz, or a competitor by name.
  TypeJung has no presence for the ideas people associate with Jung first: shadow,
  archetypes, individuation, the collective unconscious, his books, his quotes.
- **The funnel leaks in three places.** The assessment takes 20 to 25 minutes and
  many people do not finish. Of those who reach a result, very few start checkout.
  There is no reason to come back after the result.
- **The brand was four brands.** The app, the landing pages, the blog and the theory
  page each had their own colors, fonts and navigation. The pages where most new
  visitors arrive did not show the logo.
- **Trust rests on restraint, not proof.** There are no customer quotes yet. What we
  have is a free result before payment, a visible sample, a refund policy, open
  source code, and honest claims.

## 2. What "the go-to for Jung" means

People come to Jung with five jobs. A site that does all five well, and connects
them, is the go-to.

| Job | What they type | What we give them |
| --- | --- | --- |
| Understand an idea | "what is the shadow", "individuation meaning" | A sourced library entry: plain answer, Jung's words, misreadings, next step |
| Check a quote | "did Jung say…", "Jung quote source" | A quote page that separates verified, paraphrased and misattributed lines |
| Start reading | "where to start with Jung", "best Jung books" | Reading paths and honest book guides |
| See themselves | "cognitive functions test", "INFJ or INFP" | The free function-stack map |
| Do something with it | "shadow work", "inferior function" | Grounded practice guides, then the paid report |

## 3. Positioning

**Controlling idea:** TypeJung is where you go to understand Jung and apply him
to your own life: a sourced library of his ideas, a free map of your cognitive
functions, and practices for working with what you find.

**Line:** Jung, made usable.

**The wedge stays.** "The free function-stack map for people whose MBTI result keeps
changing" remains the promise of the assessment and of every test-intent page.

**Enemies:** label-first personality tests, and quote-card Jung: unsourced lines,
"shadow work" hacks, and mysticism with his name on it.

**Promise in three verbs:** Go to the source. Read the pattern. Work with what you find.

**What we never claim:** diagnosis, therapy, a final true type, scientific validation
of the assessment, affiliation with the Jung family, the IAAP or any institute,
testimonials we do not have.

## 4. Who it is for: five storyboards

Each storyboard is one person, six frames. The frames define which page they land
on, what they must see there, and the single next step we offer.

### A. Maya, the mistyped (the wedge, highest intent)
1. Gets INFJ on one test and INFP on the next. Searches "infj or infp test".
2. Lands on a comparison page. Sees the logo, a one-line promise, 42 questions, free.
3. Takes the assessment on her phone. Progress saves. Time left is visible.
4. Reads her free map: stack, eight functions, a reflection from her own answers.
5. Sees what the ten-section report covers for her stack, the price, the terms. Buys or emails herself the link.
6. Comes back from the email, reads the report, shares a compare link with a friend.

### B. Dev, the shadow-curious (the largest new audience)
1. Hears "shadow work" in a video. Searches "what is the shadow Jung".
2. Lands on `/jung/shadow`. The first paragraph answers the question in plain words.
3. Reads Jung's own sentence with its source. Trusts the page.
4. Reads "often misread as" and recognizes the video version.
5. Follows one link: the shadow-work practice, or "see where your stress edge sits" to the free map.
6. Takes the map a day later. Now on storyboard A at frame 4.

### C. Ines, the student or writer (the authority engine)
1. Needs a definition of individuation and a citable source for an essay.
2. Lands on the entry. Finds the Collected Works reference next to the quotation.
3. Checks a quote she planned to use on the quotes page. It is a paraphrase; the real passage is there.
4. Cites the page. Links to it from a post or a syllabus.
5. Returns for the next term. Uses the glossary as a starting index.
6. Recommends it. Links like hers are how the library earns its ranking.

### D. Sam, the reader (the long relationship)
1. Wants to read Jung, does not know where to begin.
2. Lands on "Where to start with Jung". Picks the path that fits.
3. Reads the guide to the first book: what is in it, how to approach it.
4. Meets an unfamiliar term in the book, looks it up in the library.
5. Takes the map out of curiosity about psychological types.
6. Uses the library as a companion for a year.

### E. Returning map-holder (retention and referral)
1. Finished the map weeks ago. Gets the follow-up email.
2. Reopens the result. The site recognizes the saved map and says "My map".
3. Reads the practice for their inferior function.
4. Buys the report, or retakes and compares.
5. Shares a compare link.
6. A friend starts storyboard A.

## 5. Site architecture

```
/                      Home: two doors (map, library) and proof of method
/assessment            The free map (42 questions)
/results               Map, report offer, save and share
/pricing /sample-report /methodology /about /debrief
/jung                  The Jung Library hub
/jung/<concept>        One entry per idea (36 at launch)
/jung/glossary         A to Z
/jung/quotes           Did Jung really say that?
/jung/books            Book guides      /jung/books/<slug>
/jung/where-to-start   Reading paths
/jung/life             Timeline
/jung/practice/<slug>  Shadow work, dream journal, inferior function
/jung/editorial-standards
/functions/<fn> /types/<type>      Typology reference
/<test-intent pages>   53 landing pages, unchanged URLs
/blog /guides
```

One header, one footer, one stylesheet on every page.

## 6. Conversion system

1. **One primary action per page.** Test-intent pages: start the free map. Library
   entries: the next step named in the entry (map, practice or book). Result page:
   the report.
2. **The header always knows where you are.** No saved map: "Get my free map".
   Assessment in progress: "Resume". Saved map: "My map".
3. **Honest bridges.** A library call to action may only promise what the map shows:
   a function stack and the likely dominant and inferior functions.
4. **Free first, and say so near every price.**
5. **Proof is earned, never written.** Collect reactions and consented quotes from
   real readers; show them only after review.
6. **The report offer is specific.** It lists what each section covers for the
   reader's own stack.

## 7. Content system

- Entries follow `scripts/jung/README.md`: plain answer, verified quotation, body,
  misreadings, related ideas, reading pointers, one next step, FAQ.
- Every quotation is checked against a source and carries where it was checked.
- AI assistance is disclosed on the editorial standards page. Corrections are
  invited and logged.
- Expansion queue after launch: complexes in depth (mother, father, power),
  anima and animus stages, night sea journey, nigredo and the alchemical stages,
  the child archetype, persona and work, Jung and Freud, Jung and religion,
  Jung on the East, typology misconceptions, twenty more sourced quotes.

## 8. Brand system

- **One identity.** Folded compass mark, indigo accent, ink on cool paper.
- **Typography carries meaning.** Schibsted Grotesk is TypeJung explaining.
  Fraunces italic is the source speaking: Jung's words are always set in it,
  always with a citation. Spline Sans Mono is for labels and citations.
- **The psyche map.** One diagram of the psyche appears on every concept entry
  with the relevant region lit. It is the library's signature image.
- **Function colors** stay as they are in the app and carry over to the library.
- **Tone:** calm, exact, plain. See the voice rules in `scripts/jung/README.md`
  and `marketing/brand-os.md`.

## 9. Measurement

Track weekly, compare month over month. These are goals to steer by, not forecasts.

| Stage | Signal | Direction |
| --- | --- | --- |
| Reach | Search impressions and clicks to `/jung/*`; number of queries with a library page in the top 20 | Up from zero |
| Trust | Entries cited or linked from outside; corrections received | Any |
| Bridge | Library page to assessment start rate | Establish baseline, then improve |
| Finish | Assessment completion rate | Up |
| Offer | Result view to buy click (offer version `direct-unlock-v1`) | Up |
| Money | Paid reports per week | Up |

## 10. Roadmap

**Shipped with this strategy (November 2026):** one header, footer, palette and
typeface across every page, including the static guides and the blog; the Jung
Library (36 concepts, glossary, sourced quotes, 15 book guides, reading paths,
timeline, 3 practices, editorial standards); a Jung Library link in the navigation
and library, trust and independence sections on the home page, with the hero left
as it was; the direct report offer on the result page; a single backend (the Vercel
functions, also used in local development) and a smaller dependency tree.

**Decided against for now:** an email field inside the assessment ("send me a link
to finish later"). Progress is stored in the browser, so a link would only work on
the same device, and collecting an email mid-assessment changes what the privacy
policy has to say. It needs the owner's decision before any build.

**Next 30 days:** submit the new sitemap; watch the first library queries; fix
errata; add twenty entries from the expansion queue; add a "pick up where you left
off" email for unfinished assessments, if the owner approves the email collection
it needs; start collecting consented reader quotes.

**Next 90 days:** show real reader proof; test the report price once proof exists;
add retake and compare; decide on a weekly note ("one Jung idea a week") only if
there is capacity to write it; begin outreach to students and Jung communities.

## 11. Guardrails

- No post, comment, message or outreach under Felmon's identity without his approval
  of the exact text, the destination and the action.
- No invented testimonials, user counts or credentials.
- No clinical or diagnostic language. Practices carry a caution and a pointer to
  professional support.
- Short quotations only. Jung's works are in copyright.
