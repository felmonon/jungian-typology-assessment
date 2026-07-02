# Outreach Execution Log - 2026-07-01

Execution of the June 29 acquisition plan's launch actions. Site-side fixes deployed earlier today (commits `34b01f9`, `94bb8ff`).

## 1. Test checkout — VERIFIED on production

Full loop confirmed on typejung.com (no payment completed):

1. Completed the 42-question assessment → results page rendered (Ni-Te-Fi-Se test profile).
2. Results → Checkout (Insight): recovery email step appeared, opt-in checked by default.
3. Entered founder email → "Save result path, then Stripe" → **"Result path saved before Stripe"** confirmed. Recovery email should be in felmonon@gmail.com inbox — verify it renders correctly.
4. Stripe live checkout loaded with **TYPEJUNG30 pre-applied: CA$10.00 − CA$3.00 (30%) = CA$7.00**.
5. Abandoned Stripe → returned to site → **"Your Insight checkout is still open" banner with Resume payment** rendered.

Metrics to confirm in analytics: `checkout_recovery_path_saved`, `pending_checkout_banner_viewed`.

## 2. Creator outreach — 4 of 11 Priority A SENT

Sent via contact forms (Priority A copy from the send pack, founder name + felmonon@gmail.com):

| Target | Result |
|---|---|
| Psychology Junkie | Sent — "Thanks for contacting us" confirmation |
| Our Human Minds | Sent — Jetpack `contact-form-sent` confirmation |
| Dear Kristin | Sent — redirected to /contact/success |
| Type in Mind | Sent — "Thank you!" confirmation |

Needs manual send (5–10 min total; copy is ready in `marketing/launch/priority-a-outreach-send-pack.md`):

| Target | Route | Why manual |
|---|---|---|
| Personality Hacker | https://personalityhacker.com/pages/contact-us | Visible hCaptcha on submit |
| Ennpey | https://ennpey.com/contact/ | Visible reCAPTCHA on submit |
| Practical Typing | https://practicaltyping.com/contact-the-authors/ | Form rejects scripted input |
| Geek Psychology | Email: sherman@geekpsychology.com | No contact form |
| Joyce Meng | Email: hello@joycemengcoaching.com | Contact = Calendly only |

Note: the Geek Psychology draft greets "Matt" but the site shows sherman@ — verify the recipient's name before sending. Joyce Meng draft contains the `{mastery_access_link}` placeholder — remove that sentence.

Follow-up window: 2026-07-06 to 2026-07-08 for the four sent (template at the bottom of the send pack).

## 3. Reddit — BLOCKED from automation, kit ready

Reddit blocks this automation environment at the network level (posting was never attempted). Manual steps, ~5 minutes:

1. Open r/mbti, find the pinned **Monthly Self-Promotion and Advertisement Megathread** (July 2026 edition).
2. Paste the "r/mbti Monthly Self-Promotion" draft from `marketing/launch/priority-a-outreach-send-pack.md` (bottom section) as a comment.
3. Open r/infj, find the pinned **Monthly Self-Promotion Thread**, paste the "r/infj Monthly Self-Promotion" draft.
4. Re-check each thread's rules before posting; comment from the account you want associated with the brand.
5. After posting, update the two Reddit rows in `marketing/launch/creator-outreach.csv` to `posted`.

## Metrics to watch this week

- `home_public_stats_loaded` (proof strip)
- `creator-preview` visits by `utm_source` (joyce_meng, psychology_junkie, our_human_minds, dear_kristin, type_in_mind)
- `checkout_recovery_path_saved` / `checkoutAbandonedRecoveryCoverage`
- Referral traffic from reddit.com after the megathread comments go up
