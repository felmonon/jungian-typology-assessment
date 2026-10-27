# Offer measurement: visibility-v1 and traffic attribution v1

This release changes measurement only. The offer remains `stress-reflection-v1`; pricing, copy, layout, scoring and the free result are unchanged.

| Event | Meaning | Does not establish |
|---|---|---|
| `result_upgrade_prompt_viewed` | Overview's paid next-step button intersected the visible viewport | Attention, understanding, or visibility of every upgrade entry |
| `result_upgrade_entry_clicked` | Navigation, overview next-step, or reflection action selected the report | Viewport exposure; keyboard tab activation also counts |
| `result_report_opened` | Free user's report pane opened in a foreground document, including a direct link | The purchase card was seen or read |
| `results_premium_preview_viewed` | Existing report-offer section intersected the viewport | Every part of the long offer, including its price card, was read |

New diagnostics carry `measurement_version: visibility-v1`. The original offer-view event keeps its definition. View/open deduplication is per result/component mount; use unique browsers within a dated completion cohort when calculating conversion, not raw event totals. A browser ID is not a person or an individual test. Missing events do not prove abandonment: consent choices, storage restrictions, blocked requests, offline use, and older loaded clients can affect coverage.

The UI event limiter previously counted activity until a full idle minute and could suppress a closely spaced funnel event after 100 events. It now uses a real minute window and exempts first-party funnel stages. This proves a possible missing-event path, not how many historical browsers were affected. Do not backfill historical offer views from this finding.

## External traffic versus internal navigation

`traffic_attribution_version: 1` identifies the new snapshot. `traffic_source_kind` distinguishes explicit UTM evidence, an external referrer hostname, and `direct_or_unknown`. The latter includes suppressed or absent referrers; it is not proof of a direct visit. Missing version means **not measured**, not direct.

Capture runs on standalone SEO/blog entry pages and the React app. The first external arrival is preserved across internal CTA navigation, reloads and the static-to-app transition within the visit. Thirty minutes of inactivity starts a new visit. A new external arrival or different explicit campaign in a new document with no referrer starts fresh attribution; internal links do not. Known checkout/authentication return routes preserve a recent prior snapshot. Stripe stores the original checkout snapshot so payment attribution does not depend on the return page.

Only safe campaign labels, referrer hostname, a known public landing route and capture time are retained. No referrer query, arbitrary landing query, share identifier or assessment answers are added. The capture respects DNT/GPC and falls back to memory when session storage is denied; that fallback cannot survive a full document navigation. Existing internal `source`, `parent_source`, and `source_chain` remain separate.

The existing first-party visit event still comes from the React app; standalone-page capture by itself is not an added first-party visit. Do not interpret that visit count as all website arrivals.

## Analysis

Keep the offer-release date separate from this measurement-release date. Compare buyers per completing browser with equal follow-up windows. Anchor traffic source at the completion (or explicit cohort entry), rather than taking a later internal CTA or checkout label. Report version-1 UTM, referrer and direct/unknown groups separately; historical missing sources cannot be reconstructed. Device attribution is not added by this change.

Exclude consented research sessions and synthetic verification traffic. Do not create fake events or purchases to make a dashboard look active. Tests cover local event generation, ingestion validation, and mocked Stripe metadata propagation; real payment persistence must be verified from a subsequent genuine payment.

## Volunteer-study exclusion

The exact entry campaign `utm_source=typejung_research&utm_campaign=offer_observation_2026_10` starts a separate, tab-scoped browser identity prefixed `research_observation_v1_`. The existing customer's persistent anonymous ID is not overwritten. The study identity survives same-tab navigation and reloads through session storage, or same-document navigation in memory when storage is denied. Use a fresh private browser window and close it after the session. A full reload with blocked storage and no remaining study query requires manual verification/exclusion; do not ask participants to disable privacy protections.

Customer funnel calculations exclude in-window research browser journeys recognized by the dedicated ID or the exact new/legacy campaign pair. Unknown acquisition remains included. Checkout creation also tags research intents when the dedicated ID is present without campaign fields, so separate checkout metrics exclude those attempts. The dashboard reports the excluded research browser and checkout-attempt counts. Stored events, purchases and actual accounting totals remain unchanged; raw event exports and third-party analytics require their own study filtering. The private monitoring helpers use the shared exclusion predicate as well.
