# Project Rules

## Product Context

TypeJung is a consumer Jungian cognitive-functions assessment at `typejung.com`. The core promise is a free all-8-function map before any optional paid report. Use `.agents/product-marketing.md` and `marketing/brand-os.md` before changing positioning, landing-page copy, pricing copy, SEO pages, checkout language, or launch assets.

## Stack And Commands

- Frontend: React 19, TypeScript, Vite, TailwindCSS, Framer Motion, Recharts.
- Backend: Express/Vercel API routes with Supabase, Stripe, Google auth, and Gemini.
- Run `npm test` for unit coverage.
- Run `npm run build` when changing routes, SEO/static generation, Vite config, or production behavior.
- Run `npm run dev` for local testing. The app is expected at `http://localhost:5000`.

## Product And Copy Constraints

- Keep claims educational and self-reflective. Do not imply clinical diagnosis, therapy, guaranteed typing, or proven health outcomes.
- Preserve the free-first purchase path: users see a core map before optional one-time Insight or Mastery upgrades.
- Use the language of cognitive functions, function stacks, dominant-inferior tension, stress edge, and MBTI alternatives.
- Avoid generic AI/product language unless the specific Gemini-powered feature is being described.

## Done Means

- Relevant tests pass or the reason they were not run is stated.
- No secrets from `.env*` files are copied into docs, code, logs, or fixtures.
- Generated static/SEO files are updated through the existing scripts when source data changes.
- Existing user changes in the dirty worktree are preserved.
