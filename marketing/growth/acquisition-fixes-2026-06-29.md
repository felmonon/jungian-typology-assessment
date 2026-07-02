# TypeJung Acquisition Fixes - 2026-06-29

## Scope

Implemented site-side fixes from the June 29 customer-acquisition audit. This file is an execution note, not a published campaign.

## Fixed in code

1. **Early proof on homepage**
   - Added a public aggregate stats API at `/api/public-stats`.
   - Homepage now shows live-safe aggregate proof: maps generated, paying customers, and guarantee.
   - No PII or customer-level data is exposed.

2. **Checkout recovery before Stripe**
   - Checkout email step now frames the email as saving the result path and `TYPEJUNG30` before Stripe.
   - Added explicit `Email my result path + TYPEJUNG30` action.
   - Primary checkout button now uses a three-step flow by default: valid email -> save recovery path -> Stripe.
   - Users can still turn recovery off; Stripe still receives receipt email.

3. **Footer and schema proof links**
   - Footer now includes source/creator proof links in addition to existing TypeJung X link.
   - Organization/schema generation now carries `sameAs` proof links.

4. **Pricing SEO**
   - Pricing title is keyworded around free map + one-time reports instead of the generic `Pricing | TypeJung`.

5. **Blog freshness check**
   - Source blog data is already staggered across dates in the current branch. No fake date edits were added.
   - Build generation should regenerate public blog HTML from source data.

## Not auto-executed

- No Reddit posts were made.
- No creator outreach messages were sent.
- No paid ads or production credentials were changed.

## Next launch actions after approval

1. Deploy the code changes.
2. Verify `/api/public-stats` returns aggregate counts in production.
3. Run one test checkout to confirm: email save event -> Stripe handoff -> pending checkout banner.
4. Post only in approved self-promo/feedback threads using existing drafts.
5. Send Priority A creator outreach only after final sender/account approval.

## Metrics to watch

- `home_public_stats_loaded`
- `checkout_recovery_path_saved`
- `checkout_recovery_lead_captured`
- `checkout_recovery_email_opted_in`
- `server_checkout_session_created`
- `checkoutCompletedIntentCount`
- `checkoutAbandonedRecoveryCoverage`
- `assessment_invite_shared`
- `result_summary_shared`
