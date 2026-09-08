# Report preview journey — September 8, 2026

Implemented on `design/report-preview-journey`, based on production commit `64befa3`. This branch has not been deployed.

## Design and funnel

- An original eight-symbol function alphabet, forest green / cream with moss, sand and clay accents. Symbols repeat in the homepage example, personal stack, hierarchy, share preview, public shared map, and report samples. Symbols and colors do not encode scores. Actual results always supply their own function codes.
- Readable Stress / Relationships / Work preview tabs on the homepage, pricing page and results offer. Excerpts reuse the existing fictional Ti–Fe sample; the Work tab uses its function-dynamics and decision-making excerpt. Every panel explicitly distinguishes sample content from a personal AI report.
- A result-specific growth edge connects the complete free map to the optional report. The one-time price and refund terms stay beside the offer. On mobile an early price link jumps to the purchase area.
- The full sample has a contents list, visible price and contextual next step. The unlocked report has a readable single-column body and section navigation.
- The existing share action now has a preview of the actual function stack and an explanation that the resulting link is public.

Inspiration was adapted from [Dimensional](https://www.dimensional.me/), [TraitLab](https://www.traitlab.com/plus), [16Personalities](https://www.16personalities.com/premium/career-suite/advocate), and [Truity](https://www.truity.com/test/type-finder-personality-test-new). No competitor artwork, customer claims, layouts, or paid features were copied.

## Measurement

Offer impressions require real viewport intersection and a foreground document. They are deduplicated by result completion time, tier and acquisition context. The event means that the offer section entered view; it does not prove the lower purchase button was seen on a phone.

`result_report_sample_explored` records topic changes. `results_direct_checkout_failed` now reaches first-party funnel storage, using a fixed failure reason rather than raw error text. The existing checkout-created and purchase events complete the funnel. Localhost and development analytics are disabled; the known billing QA identifier is excluded from the business snapshot's browser funnel counts.

This is a conversion experiment. No conversion lift has been established.

## Verification

- `npx tsc --noEmit`: passed.
- `npm test`: 167 tests across 32 files passed, including preview keyboard behavior, offer pricing/callback/error behavior, visibility tracking and telemetry persistence.
- `npm run build`: passed. Only timestamp noise from generated public pages was restored.
- Browser review at desktop 1280px, tablet 768px and phone 390px. Checked homepage, sample/report preview, pricing, personal result and full reader. No horizontal page overflow in the measured views.
- Completed all 42 questions using synthetic local answers, reloaded at question 28 to verify resuming, and reached a free result without signup.
- Verified report-topic arrow-key navigation, sample contents links, and local checkout failure/retry availability.
- The full paid-reader layout was reviewed using an explicitly labeled fictional fixture. Live payment, new AI report delivery, account login and email delivery were not exercised in this design pass.

Scoring, questions, question order/answer persistence, authentication, entitlement checks, current prices, Stripe contracts, AI generation settings and refund policy are unchanged.

## Local review

Run `node .codex/preview.mjs` from this worktree, then open `http://127.0.0.1:5003/`. The ignored local harness uses an empty environment directory, disconnected API responses and a disabled checkout. Its results reflect local test answers and its introductory text is labeled “Local preview”. It sends no production analytics.

The optional ignored `.codex/reader-review.html` fixture exercises the full report layout. It is not part of the production build.
