# Free result → optional report

Implemented locally on October 27, 2026, from production commit `5a0930c` on branch `improve/result-upgrade`. Offer identifier: `stress-reflection-v1`. Not published by this change.

## Hypothesis and change

The value gap is a hypothesis, not a measured diagnosis of lost sales. The first change focuses on understanding a stress pattern and choosing a practical next step. Pricing, scoring, paid access, and payment behavior are unchanged.

The overview and optional report tab show a free reflection selected from a real stress-situation answer, quote that answer, and explain its relationship to the existing map. The preview uses an existing built-in practice where the evidence agrees. Conflicting evidence is acknowledged; missing or neutral answers never produce fabricated personal proof. This is an answer-based reflection, explicitly separate from the generated paid report. The illustrative sample remains accessible.

The purchase card distinguishes what stays free from ten paid AI-generated interpretation sections, stress and growth reflections, relationship/work context, and the existing PDF. No fixed exercise count or guaranteed outcome is promised. Mastery intent and its existing tools remain supported. Phones have a price-and-inclusions anchor before the reflection.

## Measurement

The admin dashboard now reads first-party funnel events over the last 30 days:

Visited → started → completed → viewed offer → checkout ready → paid.

Each stage counts distinct anonymous browser IDs in chronological order. Checkout ready means a session was created, not that the Stripe page loaded. Checkout and paid events must match private checkout-intent/purchase records; zero-value and non-completed purchases are excluded. Public analytics cannot submit canonical purchase events or overwrite server event IDs. Mirrored browser events are persisted without a second Vercel send.

The primary displayed ratio is **paying completing browsers / completing browsers**, allowing completion cohorts whose earlier visit was not recorded. It is not purchases per individual test, new-customer conversion, or an A/B result. Retakes count once per browser; devices are not linked; blocked analytics and cleared storage can break attribution. Recent completers have had less time to buy. The dashboard aggregates all offer versions in its window; `offer_version` on exposures and unlock clicks supports a separately segmented analysis. New visit tracking needs time to populate. Missing data is labeled unavailable, and truncated reads are labeled partial with rates hidden.

After publication, record the deployment date and compare equal observation windows with comparable traffic sources and time to purchase. Keep price and acquisition strategy steady for the initial comparison. Inspect the stage losses before deciding the next change: starts→completions for assessment friction, completions→offer/checkout for the offer, and checkout→paid for checkout friction. Do not infer a sales lift from a handful of purchases or from this implementation alone.

## Verification and preview

- 392 tests across 44 files pass; TypeScript and full production build pass.
- Personalization tests cover all four channels, exact question/answer provenance, missing/neutral/unknown answers, conflicting signals, and exploratory results.
- Funnel tests cover duplicate browsers, ordering, tied timestamps, window boundaries, invalid/unverified/free/refunded purchases, unavailable data and capped reads.
- Browser checked at 390×844, 768×1024 and 1280×900. No horizontal overflow at the checked mobile/tablet sizes.
- Verified overview→offer, evidence disclosure, mobile price anchor, keyboard tab navigation, and return to the complete free map after the local checkout error.
- Local preview: `http://127.0.0.1:5004/`. Fictional QA result: `http://127.0.0.1:5005/.codex/upgrade-fixture.html`. QA fixtures and services are isolated and ignored by Git; payments, email and AI services are disconnected.
- No production analytics queried, live purchase made, paid AI report generated, or production deployment performed. The admin aggregation is covered with synthetic database rows; live database availability remains unverified.
