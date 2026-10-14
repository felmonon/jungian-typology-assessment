# TypeJung redesign directions (prototypes only)

Three visual directions for two screens: the homepage opening section and a
representative results screen. These are static HTML files, separate from the
app. They change nothing in production, routes, scoring, auth, payments or
prices.

Open `index.html` through any static server, for example
`python3 -m http.server 5010` from this folder.

## Shared content

`content.js` holds every word and number used by all three directions, so the
comparison is about design only.

- Product facts (42 questions, 20–25 minutes, free map, no signup, Insight
  report CA$7 one time, 7-day refund, ten AI-generated sections, the
  "Not ready to decide?" email option) come from the live app.
- The sample result (Ni, Fe, Ti, Se) was produced by running the real scoring
  code on scripted illustrative answers. It is labelled as a sample on every
  results screen.
- The home headline and subline are new plain-language copy written for this
  comparison, so a visitor does not need to know function terminology. The
  "four letters" MBTI line is kept as a secondary line.
- The CA$10 struck-through reference price is left out on purpose; that
  decision is still open.

## Directions

- **A · Field Guide** (`a-field-guide/`): editorial, one reading column, serif
  headlines (Newsreader) with Public Sans, a single green accent. The result
  reads like a short written explanation, with a ranked list and a dot plot.
- **B · Profile** (`b-profile/`): card-based dashboard, Bricolage Grotesque with
  Inter, one colour per function family (intuition, feeling, thinking,
  sensation) used consistently in every chart and chip.
- **C · Chapters** (`c-chapters/`): full-bleed colour fields, Archivo at wide
  widths, one idea per screen. The result is told in four numbered chapters and
  ends with all eight functions on Jung's compass (thinking opposite feeling,
  sensation opposite intuition).

Fonts are self-hosted in `fonts/` (all SIL Open Font License, from Google
Fonts).
