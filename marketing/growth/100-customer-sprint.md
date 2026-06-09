# TypeJung 100-Customer Sprint

## Goal

Get TypeJung to 100 paying customers without weakening the free-first promise.

Current working baseline from `.agents/product-marketing.md`: 1 unique non-zero paying customer, 63 checkout sessions, 36 checkout starts in the last 7 days, 33 expired checkout sessions in the last 7 days, and 15 users. The biggest near-term leak is not awareness alone; it is assessment-to-checkout recovery and checkout completion.

## Growth Math

Use these as operating targets, not claims.

| Lever | Weekly target | Why it matters |
| --- | ---: | --- |
| Free assessment starts from referral/share sources | 250 | The results page now pushes a 3-person compare invite with `friend_compare` attribution. |
| Assessment completions | 125 | The free result is the trust-building event. |
| Checkout starts | 35 | This roughly matches the existing 7-day start volume, but with cleaner attribution. |
| Paid conversions | 8-12 | This gets the product to 100 paid customers in 9-13 weeks. |
| Recovered expired checkouts | 4-6 | Existing checkout-start volume makes recovery the fastest revenue lever. |

## Product-Led Loop

Every completed result should now push one measurable behavior: invite 3 people to compare maps.

Events to watch:

- `result_referral_prompt_viewed`
- `result_compare_link_created`
- `assessment_invite_shared`
- `result_summary_shared`
- `shared_result_cta_clicked`
- `inbound_shared_result_prompt_viewed`
- `inbound_shared_result_reply_copied`
- `post_purchase_referral_prompt_viewed`
- `post_purchase_referral_copied`
- `checkout_recovery_email_required`
- `sample_report_result_context_viewed`
- `sample_report_context_checkout_clicked`
- `pricing_result_checkout_clicked`
- `checkout_result_axis_context_viewed`
- `checkout_recovery_email_opted_in` with `has_result_axis`, `dominant_channel`, `inferior_channel`, and `utm_source`
- `server_checkout_session_created` with `utm_source`, `utm_campaign`, `site_recovery_email_consent`, and `discount_auto_applied`
- `discount_lead_submit` and `discount_lead_captured` with `has_axis_context`
- `assessment_entry_context_viewed` with `context_category` for high-intent SEO/blog assessment entrants
- `result_upgrade_context_viewed` with `context_category` and `intended_tier` for source-aware result-page upgrade copy
- Assessment starts where `source` is `result_compare_banner`, `result_compare_card`, `result_summary_share`, or `shared_result_cta`
- Checkout starts where source includes the referral source
- Stripe checkout metadata fields: `acquisition_source`, `utm_campaign`, `shared_result`, and `parent_source`

Pass/fail threshold:

- If fewer than 15% of result viewers share or copy an invite, rewrite the prompt and button labels.
- If referral visitors start the assessment below 30%, route more traffic to `/share/:slug` first because the shared map gives context before the ask.
- If referral visitors complete but do not start checkout, test a result-page upgrade prompt that references comparing stress edges and relationship patterns.

## Distribution Cadence

Daily until 100 customers:

- Send 20 creator or newsletter outreach messages.
- Post in 1-2 allowed community threads only after checking rules.
- Publish 2 short clips from the same hook family.
- Ask 10 existing users/friends to share their compare link with 3 people.
- Review yesterday's sources, checkout starts, expired checkouts, and recovered checkouts.

Weekly:

- Ship one SEO page for a high-intent mistyping query.
- Add 25 qualified outreach targets to `marketing/launch/creator-outreach.csv`.
- Update Product Hunt, Indie Hackers, and Reddit copy from the strongest observed user language.
- Kill any channel that cannot create assessment starts after 3 focused attempts.

Latest distribution queue:

- `marketing/launch/creator-outreach.csv` now contains 27 source-checked targets dated 2026-05-24: 13 priority A targets, 12 priority B targets, and 2 priority C targets.
- The queue replaces placeholder rows with target pages, public contact routes, pitch pages, fit angles, CTAs, UTM sources, campaign names, priorities, next actions, statuses, and source-check dates.
- Priority A creator rows now route through `/creator-preview`, a dedicated review page that explains the free-first promise, safe mention language, sample-report path, and creator feedback ask before any public promotion.
- `marketing/launch/priority-a-outreach-send-pack.md` contains approval-ready copy for the priority A creator messages, two allowed-community drafts, and a 5-7 day follow-up template.
- Priority A should be used first for the daily 20-message outreach block. Do not actually send messages, publish posts, or use community threads until the founder approves the exact copy and account context.
- The three community rows stay `not_posted` until rules are rechecked immediately before posting. Use `community_allowed_2026_05` only for posts that remain inside the approved self-promotion or feedback thread.

Outreach attribution preservation:

- Static SEO pages, function/type pages, and growth blog pages now preserve inbound `utm_source`, `utm_campaign`, `ref`, `shared_result`, and `parent_source` parameters when visitors click internal links toward `/assessment`, `/sample-report`, `/pricing`, or another TypeJung page.
- Save-link forms on static SEO and blog pages now include `utmSource`, `utmCampaign`, and `parentSource` in the `/api/auth/discount-lead` payload.
- `discount_leads` has a follow-up migration for `utm_source`, `utm_campaign`, and `parent_source`, so recoverable email captures from creator outreach can be attributed even if the user pauses before the assessment.
- `assessment_started`, `assessment_completed`, and `assessment_abandoned` now include both `utm_campaign` and `utm_source` when captured. For direct assessment links that only have UTM values, the acquisition source prefers `utm_source` over the broader campaign name.
- Checkout review, checkout result-axis context, server checkout creation, and checkout recovery opt-in events now also include `utm_source`.
- Pending-checkout storage now keeps the checkout attribution chain, and the global restart banner preserves that chain when an expired Stripe session is restarted from TypeJung.
- Discount-code emails and daily discount follow-up emails preserve the original `utm_source`, `utm_campaign`, and `parent_source` on their return links instead of replacing creator attribution with only `discount_recovery`.
- React CTAs that set a new conversion source, such as result-page upgrade buttons or pricing-page checkout buttons, now preserve the stored creator/search attribution chain instead of overwriting it with only the new button source.
- Completed purchase rows now persist checkout attribution fields (`source`, `acquisition_source`, `acquisition_ref`, `utm_source`, `utm_campaign`, `shared_result`, `parent_source`, `discount_code`, and `recovery_email_consent`) so paid-customer counts can be audited by channel from the `purchases` table, not only event analytics.
- The Vercel admin API now serves `/api/admin/stats` and `/api/admin/analytics`; `/admin` shows the 100-customer sprint progress, real CAD revenue, completed purchase counts, recovery pipeline counts, and top paid-customer sources.
- Metrics to watch after outreach begins: `assessment_started.utm_source`, `assessment_completed.utm_source`, `checkout_review_viewed.utm_source`, `server_checkout_session_created.utm_source`, `checkout_recovery_email_opted_in.utm_source`, `pending_checkout_restart_clicked.utm_source`, `discount_leads.utm_source`, and completed `purchases.utm_source` for the values in `creator-outreach.csv`.

Latest shipped SEO acquisition page:

- `/mbti-mistype-test`: broad mistype-intent page for searchers who suspect their MBTI label is wrong, keep getting different labels, or need to compare nearby type hypotheses through function evidence.
- Primary conversion sources to monitor: `seo_mbti_mistype_test_hero`, `seo_mbti_mistype_test_final`, `seo_mbti_mistype_test_nav`, `seo_mbti_mistype_test_hero_sample`, `seo_mbti_mistype_test_final_sample`, and `seo_mbti_mistype_test_email_code`.
- `/cognitive-functions-quiz`: quiz-intent page aimed at searchers who want a lighter entry point than "test" language while preserving the same free-first assessment path.
- Primary conversion sources to monitor: `seo_cognitive_functions_quiz_hero`, `seo_cognitive_functions_quiz_final`, `seo_cognitive_functions_quiz_nav`, `seo_cognitive_functions_quiz_hero_sample`, and `seo_cognitive_functions_quiz_final_sample`.
- `/creator-preview`: creator-review path for typology creators, newsletters, coaches, and community moderators who need to evaluate TypeJung privately before mentioning it.
- Primary conversion sources to monitor: `seo_creator_preview_hero`, `seo_creator_preview_final`, `seo_creator_preview_nav`, `seo_creator_preview_hero_sample`, `seo_creator_preview_final_sample`, and `seo_creator_preview_email_code`; outreach links also set `source=creator_review_invite`, `utm_source=<creator>`, and `utm_campaign=creator_outreach_2026_05`.
- `/creator-preview` now includes a safe mention kit with copyable social, newsletter, video-description, and community-feedback snippets. The kit builds a tracked public `/mbti-mistype-test` link from the creator's `utm_source`, keeps `utm_campaign=creator_outreach_2026_05`, and sets `parent_source=creator_review_invite`.
- Copying a safe mention now posts a non-PII `creator_safe_mention_copied` event to `/api/analytics` with `copy_id`, `snippet_label`, `public_path`, `page_path`, `utm_source`, `utm_campaign`, and `parent_source`.

Static SEO pages now include a save-link capture panel:

- Form event path: static page form posts to `/api/auth/discount-lead` with source `seo_<slug>_email_code` and `tierIntent=insight`.
- Email path: backend routes these sources back to `/assessment` rather than pricing, preserving the free-first promise while keeping the discount code handy.
- Metrics to watch: `discount_leads.source` values ending in `_email_code`; follow-up cron should treat `seo_` sources as assessment-return leads.
- Assessment handoff: visitors arriving from high-intent SEO/blog sources now see a compact context note on `/assessment` that matches their entry intent: mistype, type comparison, dominant function, stress edge, alternative test, or general function map.
- Creator-review handoff: visitors arriving from `/creator-preview` or `source=creator_review_invite` now see creator-specific `/assessment` context, and result-page upgrade copy frames paid reports as a private review layer rather than a public-promotion ask.
- Creator-review metrics to watch: `assessment_entry_context_viewed.context_category=creator_review`, `result_upgrade_context_viewed.context_category=creator_review`, `parent_source=creator_review_invite`, `utm_campaign=creator_outreach_2026_05`, and completed `purchases.utm_source` by creator.
- Safe mention kit metrics: monitor `creator_safe_mention_copied`, then public entry traffic where `source=creator_safe_mention`, `parent_source=creator_review_invite`, and `utm_source` matches a row in `creator-outreach.csv`.

Growth blog pages now include the same save-link capture:

- Form event path: generated blog pages post to `/api/auth/discount-lead` with source `blog_<slug>_email_code` and `tierIntent=insight`.
- Email path: backend routes `blog_*_email_code` sources back to `/assessment`, so article readers are recovered into the free map before any paid report.
- Metrics to watch: `discount_leads.source` values beginning with `blog_`, especially `blog_why_mbti_type_keeps_changing_email_code`.

Result-page save-path follow-ups now preserve upgrade intent:

- Result-page sources beginning with `results_` continue to send the first email toward the selected paid tier after the free map is visible.
- Follow-up routing now treats `results_*` leads with a tier intent as checkout-return leads instead of falling back to the sample report.
- Metrics to watch: `discount_leads.source` values such as `results_upgrade_strip`, `results_paid_report_card`, and `results_hero_axis_save_path`; compare follow-up clicks to recovered checkout starts by tier.
- Result-page upgrade copy now adapts to the acquisition source category, so mistype, type-comparison, dominant-function, stress-edge, alternative-test, and general function-map visitors see paid-report framing that matches the reason they started the assessment.

AI/search discovery is now generated:

- `npm run generate:ai-index` writes `public/llms.txt` and `public/content.txt` from the same SEO landing-page and growth-article data used by the static page generators.
- The index explicitly lists high-intent pages, growth articles, function/type pages, free-first pricing, and the `seo_<slug>_email_code` / `blog_<slug>_email_code` recovery patterns.
- `npm run build` runs the AI index generator before Vite copies `public/`, so new landing pages should not be invisible to AI-readable discovery files.

## Compliant Community Targets

- r/mbti monthly self-promotion thread. Current 2026 threads state that promotions belong in the designated megathread and must remain MBTI-related.
- r/infj monthly self-promotion thread when the post is genuinely relevant to mistyping, not a broad ad.
- r/MbtiTypeMe only if the post follows its current posting rules and is framed as a feedback request, not as drive-by promotion.
- Indie Hackers `Show IH` / product feedback style posts with founder story and first-session funnel data.
- Product Hunt after the referral and recovery loops are verified, using TypeJung's maker story and a first comment that explains the free-first promise.

Sources checked May 24, 2026:

- r/mbti May 2026 self-promotion megathread: https://www.reddit.com/r/mbti/comments/1t78tsg/monthly_selfpromotion_and_advertisement_megathread/
- r/infj May 2026 self-promotion thread: https://www.reddit.com/r/infj/comments/1t0p2lg/monthly_selfpromotion_thread_may_2026/
- Product Hunt launch guide: https://www.producthunt.com/launch/
- Product Hunt definitions: https://www.producthunt.com/launch/definitions

## Outreach Scripts

### Creator Or Newsletter Pitch

Subject: Free TypeJung access for your typology audience

```text
Hey {name},

I built TypeJung for people whose MBTI result keeps changing. It maps all 8 cognitive functions, then shows a function-stack map and dominant-inferior tension before asking anyone to pay.

The free result is the product's trust test. Paid reports only add deeper interpretation, stress patterns, practices, and the AI Type Guide.

I can send you Mastery access if you want to test it privately. If the result feels useful for your audience, I would be grateful for a mention or honest feedback.

https://typejung.com
```

### Community Feedback Post

```text
I built TypeJung for people who keep bouncing between types like INFJ/INFP, INTJ/INTP, or ENFP/ENTP.

The assessment is free and maps all 8 cognitive functions before showing a function-stack map. The part I want feedback on is the dominant-inferior axis: it tries to explain the stress edge without turning the result into clinical advice or a fixed identity claim.

If community rules allow feedback posts, I would appreciate blunt reactions on whether the free result feels more specific than a normal four-letter result.

https://typejung.com
```

### Existing User Share Ask

```text
I just mapped my TypeJung function-stack result. If you take the free assessment too, we can compare dominant-inferior axes instead of guessing from four-letter labels.

{share_link}
```

## 7-Day Execution Board

| Day | Shipping work | Distribution work | Metric check |
| --- | --- | --- | --- |
| 1 | Verify referral prompt, compare-link creation, and attribution. | Send 20 creator pitches; ask 10 known users/friends to share. | `assessment_invite_shared`, referral starts. |
| 2 | Tighten checkout recovery subject/body from open/recovery data. | Post in one allowed megathread; comment on 10 relevant typology discussions without links unless invited. | Expired checkout recovery. |
| 3 | Add one mistyping SEO page. | Send 20 newsletter/community pitches. | Organic starts, completion rate. |
| 4 | Improve sample-report CTA based on checkout starts. | Publish 2 short clips using the "your type did not change" hook. | Sample report clicks to checkout. |
| 5 | Add one shared-result CTA test if referral starts are weak. | Send 20 creator pitches and 10 follow-ups. | Shared-result CTA clicks. |
| 6 | Update Product Hunt assets and first comment draft. | Ask for launch feedback from 20 makers. | Waitlist/support list size. |
| 7 | Review funnel and cut weak copy. | Repeat the two highest-signal channels only. | Paying customers, recovered checkouts, source quality. |
