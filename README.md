# TypeJung - Free Jungian Function-Stack Map

[![CI/CD Pipeline](https://github.com/felmonon/jungian-typology-assessment/actions/workflows/ci.yml/badge.svg)](https://github.com/felmonon/jungian-typology-assessment/actions/workflows/ci.yml)
[![Live App](https://img.shields.io/badge/live-typejung.com-brightgreen)](https://typejung.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

TypeJung is the free Jungian function-stack map for people whose MBTI result keeps changing.

A production full-stack SaaS that applies Jungian cognitive-function theory to how people notice patterns, make decisions, handle stress, and relate to others. It combines a free assessment, saved profiles, share links, Stripe-backed one-time paid reports, Supabase persistence, and AI-assisted interpretation.

**[Try the Live App](https://typejung.com)**

[![TypeJung — live product preview](preview.jpg)](https://typejung.com)


![TypeJung social preview](public/og-image.png)

## What Is Live Today

- 42-question assessment flow for all 8 cognitive functions
- saved result history and shareable result links via [`api/results.ts`](api/results.ts) and [`api/share`](api/share)
- free interpretation and paid AI-assisted features via [`api/ai/[action].ts`](api/ai/[action].ts)
- paid checkout tiers and webhook handling via [`api/create-checkout-session.ts`](api/create-checkout-session.ts) and [`api/webhook.ts`](api/webhook.ts)
- Google auth, session verification, and premium status checks via [`api/auth`](api/auth), [`api/verify-session.ts`](api/verify-session.ts), and [`api/premium-status.ts`](api/premium-status.ts)
- leaderboard and public ranking data via [`api/leaderboard.ts`](api/leaderboard.ts)
- tested and deployed through [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

## Product Flow

1. A user completes the assessment in the React app.
2. Scores and stack data are saved through Vercel API routes backed by Supabase.
3. The app can generate a free AI explanation or unlock paid tiers through Stripe checkout.
4. Completed results can be revisited, shared, and ranked on the leaderboard.

## Architecture

```mermaid
flowchart LR
  A[React 19 app] --> B[Vercel API routes]
  B --> C[(Supabase / Postgres)]
  B --> D[Google auth]
  B --> E[Stripe checkout + webhook]
  B --> F[AI analysis: OpenRouter or Gemini]
  G[GitHub Actions CI/CD] --> A
  G --> B
```

---

## Why This Exists

Consumer personality quizzes like 16personalities sort you into a four-letter label and stop there. That can be fine for entertainment, but it is thin when you want to understand why two capable people keep misreading each other, or why your usual strengths become unreliable under pressure.

This project goes deeper. It maps self-reported patterns across all **8 Jungian cognitive functions** (Ti, Te, Fi, Fe, Ni, Ne, Si, Se), shows a likely function stack, and surfaces patterns that matter in real self-understanding:

- **How you reason** - Do you follow a precise internal model (Ti) or organize around visible outcomes (Te)?
- **How you notice information** - Do you converge on a single pattern (Ni), explore possibilities (Ne), trust experience (Si), or respond to the present moment (Se)?
- **How you handle stress** - The Grip analysis explains what can happen when your inferior function takes over.
- **How you relate** - Archetypal stack analysis (Hero, Parent, Child, Anima/Animus) explains blind spots, friction, and growth edges.

The underlying model is Carl Jung's original typology — not the simplified MBTI dichotomies. Every assessment result includes function scores, not just a type label.

---

## Features

- **Free Assessment** - 42-question assessment measuring all 8 cognitive functions
- **Cognitive Function Stack** - Dominant, auxiliary, tertiary, inferior, and shadow-function breakdowns
- **Saved Results** - Persisted assessment history for signed-in users
- **Shareable Profiles** - Public result sharing through generated slugs
- **Stress And Grip Analysis** - Patterns for how decision-making changes under pressure
- **Free Interpretation** - Short explanation based on assessment output
- **Premium Tiers** - Stripe-backed one-time CAD paid tiers for deeper analysis
- **Leaderboard** - Type distribution and public ranking view
- **Results Breakdown** - Charts, score views, and results components in [`components/results`](components/results)

---

## Built With

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, TailwindCSS, Recharts |
| **Backend** | Vercel Serverless Functions in [`api/`](api) |
| **Database** | Supabase (PostgreSQL, real-time subscriptions) |
| **Auth** | Google OAuth 2.0, Email/Password |
| **Payments** | Stripe (3-tier: Free / Insight CA$10 / Mastery CA$29) |
| **AI** | OpenRouter or Google Gemini, selected with `REPORT_AI_PROVIDER` |
| **CI/CD** | GitHub Actions, Vercel |
| **Testing** | Vitest, E2E suite |

---

## Pricing Tiers

| Tier | Price | What You Get |
|------|-------|-------------|
| **Free** | $0 | 42-question assessment, basic function-stack map, dominant-inferior axis |
| **Insight** | CA$10 one-time | + deeper report, stress-pattern map, relationship-pattern reflection, practice prompts |
| **Mastery** | CA$29 one-time | + AI Type Guide, individuation roadmap, practice library, reassessment tracking |

---

## Testing And CI

The repo includes:

- unit tests in [`tests`](tests)
- API tests such as [`tests/api/auth.test.ts`](tests/api/auth.test.ts)
- component tests such as [`tests/components/Button.test.tsx`](tests/components/Button.test.tsx)
- scoring utility coverage in [`tests/utils/scoring.test.ts`](tests/utils/scoring.test.ts)
- CI, build, deploy, and health-check jobs in [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account
- Stripe account (for payments)
- Google Cloud Console project (for OAuth)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/felmonon/jungian-typology-assessment.git
   cd jungian-typology-assessment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with required variables:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SESSION_SECRET=your_session_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   APPLE_CLIENT_ID=your_apple_services_id
   APPLE_TEAM_ID=your_apple_team_id
   APPLE_KEY_ID=your_apple_key_id
   APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_INSIGHT_PRICE_ID=price_your_insight_price_id
   STRIPE_MASTERY_PRICE_ID=price_your_mastery_price_id
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   REPORT_AI_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key
   OPENROUTER_API_KEY=only_needed_when_REPORT_AI_PROVIDER_is_openrouter
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL="TypeJung <results@your-domain.com>"
   CRON_SECRET=your_cron_secret
   ```

   [`.env.example`](.env.example) lists every variable with notes on which ones are optional.

   Stripe should send checkout events to `/api/stripe/webhook`, which is rewritten to [`api/webhook.ts`](api/webhook.ts) in Vercel.

4. Run the development server:
   ```bash
   npm run dev
   ```

   This starts Vite with hot reload and answers `/api/*` with the same handlers in [`api/`](api) that Vercel deploys, including the `/api` rewrites from [`vercel.json`](vercel.json). There is no separate backend process to start. The adapter lives in [`scripts/dev-api.ts`](scripts/dev-api.ts); it reads `.env` and `.env.local` for the handlers.

5. Open [http://127.0.0.1:5000](http://127.0.0.1:5000)

   The server listens on `127.0.0.1` only. On macOS, AirPlay Receiver also listens on port 5000 and answers `http://localhost:5000` with a 403, so use the `127.0.0.1` address, or turn AirPlay Receiver off, or pick another port with `PORT=5173 npm run dev`. Set `HOST=0.0.0.0` to reach the dev server from another device.

### Running Tests

```bash
npm test
npm run test:watch
npm run test:e2e
npm run test:coverage
```

---

## Project Structure

```
├── api/                  # Vercel serverless functions (the only backend)
│   ├── _lib/            # Helpers shared by the functions (not routable)
│   ├── auth/            # Authentication endpoints
│   ├── ai/              # AI analysis endpoints
│   └── ...
├── server/              # Checkout, email and env helpers imported by api/
├── components/          # React components
├── pages/               # Page components
├── shared/              # Shared types and schemas
├── scripts/             # Build generators, ops scripts and the dev API adapter
├── tests/               # Test files
│   ├── api/            # API tests
│   ├── components/     # Component tests
│   ├── e2e/            # End-to-end tests
│   └── utils/          # Utility tests
└── vercel.json          # Routes, rewrites, headers and cron jobs
```

---

## Notes

- This repo uses external services for auth, payments, storage, and AI generation, so a local run needs valid environment variables.
- The README only claims flows that are visible in the codebase today.
- The next improvement for hiring signal is adding more screenshots of the assessment, results, and pricing flows.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Carl Jung's work on psychological types
- The MBTI and cognitive functions community
- [Supabase](https://supabase.com) for the database
- [Vercel](https://vercel.com) for hosting
