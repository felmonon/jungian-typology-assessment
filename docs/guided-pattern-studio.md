# TypeJung — Pattern Studio

Full journey redesign, prepared September 8, 2026. Branch: `design/guided-pattern-studio`, based on production commit `d0e3deec0cdb05fbfa564e594cade5bc8260a530`.

The working preview is [localhost:5004](http://127.0.0.1:5004/). The [interactive before/after review](http://127.0.0.1:5004/docs/design-review.html) embeds the previous implementation on port 5003 and the new implementation on port 5004 at identical desktop or phone viewport sizes. Both apps can be explored independently. The new implementation has not been deployed to production.

## Direction and references

Three directions were considered before implementation:

1. **Pattern Studio — selected.** Bold sans-serif typography, a pale canvas, indigo actions, expressive function symbols, and distinct steps through the product. The goal is to make the assessment approachable and the result easy to explore without needing to understand the theory first.
2. **Illustrated Field Journal.** A warmer editorial composition built around observation and reflection. This would continue some of the existing site's book-like qualities, but would do less to simplify the reading journey.
3. **Function Observatory.** A precise dashboard focused on comparisons and scores. This would expose the data efficiently but risk making derived values look more definitive than the methodology supports.

Reference observations were translated into TypeJung's own structure and visual language:

- [Dimensional](https://www.dimensional.me/): confident typography and an expressive product identity. TypeJung uses its own function symbols and an interactive map, with no borrowed graphics or page layout.
- [16Personalities](https://www.16personalities.com/free-personality-test): clear expectations about the test, result, and next step. The new TypeJung homepage explains those three stages, and the assessment identifies its four chapters.
- [TraitLab Plus](https://www.traitlab.com/plus): show the substance of the product alongside the purchase decision. TypeJung keeps a labeled illustrative report sample near its actual offer.
- [Truity TypeFinder](https://www.truity.com/test/type-finder-personality-test-new): distinguish the initial result from optional additional interpretation. The result navigation makes the complete free map and optional report separate, accessible choices.

These are qualitative design references, not evidence of conversion uplift. No external layouts, templates, design agents, design plugins, or optional skills were used. Technical assistance was limited to accessibility hooks, navigation behavior, tests, and contract review.

## What changed

- **Homepage:** a shorter, direct introduction; visible free/no-account/no-card expectations; a meaningful interactive example; three concrete steps; illustrative report content with the real price; retained educational links and methodology disclosures.
- **Shared system:** self-hosted Schibsted Grotesk headings, light surfaces, consistent indigo actions, restrained borders, and original function emblems. Removed the paper texture, green wash, offset button shadows, and card movement. Main navigation keeps a visible mobile start action and an accessible menu.
- **Assessment:** one question per screen, four chapter indicators, clear selected states, saved-progress recovery, fixed Back/Next controls on phones, and optional 1–5/Enter shortcuts. Shortcuts pause during question transitions and preserve native radio controls and focus behavior.
- **Free result:** four keyboard-accessible views—Overview, Function map, Go deeper, Save & share. The overview introduces the actual leading pattern and a function explorer. The function view shows all eight existing derived values immediately, with scoring and consistency details available on demand.
- **Report offer:** a visible optional price, useful illustrative sample, concise purchase summary, and an expandable explanation of how it relates to the free map. Existing availability checks, Stripe handling, and recovery paths remain intact.
- **Save/share:** account saving and the optional return email come first; sharing and data export remain available. Public sharing still explains that it creates a public result link.
- **Pricing:** new visitors see the free option first; visitors with a saved result see Insight first. Mastery remains a secondary option. Prices and discount rules are unchanged.
- **Report reading:** readable sections with active desktop contents navigation and a compact phone chapter selector. The public sample reaches the first excerpt sooner on phones. All original illustrative excerpts and the ten paid report section keys are preserved.
- **Supporting flows:** checkout uses the same design system, with a clear summary, actual discounted total, and return-to-map route. Auth, account, learning, and policy pages inherit shared typography, colors, controls, and navigation.

## Refinement after the first render

The first desktop and phone render exposed three weak choices:

1. The phone hero took too long to reach the example. The body copy was shortened, double container spacing removed, and the primary and secondary actions made to fit on one row.
2. The function map looked more decorative than interactive. A visible selection instruction, persistent labels, selected state, and changing plain-language explanation make the interaction explicit.
3. The report sample retained old green styling and too much nesting. Its toolbar, tabs, paper, practice prompt, and disclosure were brought into the new system; the outer result offer was simplified.

The second pass also made result navigation sticky, removed its phone scrollbar, moved all eight values above technical details, shortened the purchase summary, and fixed an inherited CSS rule that exposed the desktop report contents list on phones.

Comparable before and after homepage screenshots were inspected at 1280×900 and 390×844 in the browser. The review page provides those same-sized, live comparisons; it requires both local preview servers to remain running.

## Verification

- Full 42-question journey completed through the actual interface using synthetic answers.
- Back retained the previous choice; reloading restored eleven saved answers at the correct next question.
- Number-key selection, Enter continuation, native tab navigation, and active result panes checked.
- Homepage inspected at 1280×900, 768×1024, and 390×844; no horizontal document overflow at those widths.
- Phone assessment, free result, function map, optional offer, save/share, sample report, pricing, and checkout inspected.
- Result tab anchors, paid report section anchors after asynchronous content arrival, focus handoff, and hidden-offer impression behavior covered by integration tests.
- Local checkout failure showed a recoverable error without losing the free result or opening a payment.
- A clearly labeled development fixture exercises the ten-chapter report reader with repeated illustrative text. It does not represent a generated or purchased report.
- `npm test`: 212 passing tests across 37 files.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed, including the existing static, AI index, SPA route, and sitemap generators. Date-only generated output was verified and restored; no substantive static content changes were introduced.
- Final Vite production compilation and `git diff --check`: passed.

Question data, option rotation, scoring, saved-answer/completion behavior, auth APIs, billing APIs, price constants, direct checkout logic, AI generation contracts, and report section data mappings were reviewed against the production base. Those contracts are unchanged.

## Preview boundaries

The ignored `.codex/preview.mjs` harness uses an empty environment directory and local API fixtures. Production credentials are not loaded. AI free interpretation is clearly labeled as local preview content. Purchases, account services, and emails are disconnected. The actual production checkout/generation code was preserved, but no real charge, outgoing email, account login, or newly generated paid report was exercised during this redesign.

The implementation is ready for review and a subsequent production deployment request. Conversion performance should be assessed from real funnel data after release; this redesign does not establish a sales result.

## Logo refinement

The previous fine-line orbit mark was replaced after review with a folded compass: four paired shapes, eight indigo facets, and an open center. Three original vector studies were compared at 16, 24, 32, and 40 pixels; the folded compass retained the clearest silhouette. The symbol is decorative brand identity, not a chart of assessment scores.

`public/logo.svg` is the canonical transparent vector, reused by the React mark and existing share/learning pages. Matching favicon, Apple touch icon, maskable app icon, and social image assets use the same geometry. The wordmark treatment is consistent across the main header, focused journey header, and footer. The social image now matches the Pattern Studio homepage rather than the previous serif identity.
