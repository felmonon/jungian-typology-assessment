# Cognitive Function Analysis for Engineering Teams

[![CI/CD Pipeline](https://github.com/FelmonFekadu/jungian-typology-assessment/actions/workflows/ci.yml/badge.svg)](https://github.com/FelmonFekadu/jungian-typology-assessment/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://jungian-typology-assessment.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A production full-stack SaaS that applies Jungian cognitive function theory to understand how engineers think, debug, review code, and collaborate. Three-tier Stripe monetization ($0 / $19 / $39), Supabase real-time, React 19, and AI-powered analysis — deployed with live users.

**[Try the Live Demo](https://jungian-typology-assessment.vercel.app)**

---

## Why This Exists

Consumer personality quizzes like 16personalities sort you into a four-letter label and stop there. That is fine for entertainment — but useless when you need to understand why two senior engineers keep clashing in code review, or why your best architect freezes under on-call pressure.

This project goes deeper. It measures all **8 Jungian cognitive functions** (Ti, Te, Fi, Fe, Ni, Ne, Si, Se), maps your full function stack, and surfaces patterns that actually matter in engineering contexts:

- **How you debug** — Do you follow a deductive model (Ti-dominant) or scan for pattern anomalies (Ne-dominant)?
- **How you review code** — Do you optimize for correctness (Te) or maintainability and team norms (Fe/Fi)?
- **How you handle production incidents** — The Grip analysis reveals what happens to your decision-making under stress, based on your inferior function.
- **How you collaborate** — Archetypal stack analysis (Hero, Parent, Child, Anima/Animus) explains mentoring dynamics, blind spots, and team friction.

The underlying model is Carl Jung's original typology — not the simplified MBTI dichotomies. Every assessment result includes function scores, not just a type label.

---

## Features

- **Free Assessment** — 40-question assessment measuring all 8 cognitive functions
- **Cognitive Function Stack** — Detailed breakdown of your dominant, auxiliary, tertiary, and inferior functions
- **The Grip Analysis** — Understanding your stress responses and shadow functions under pressure
- **Archetypal Insights** — Explore the Hero, Parent, Child, and Anima/Animus archetypes in your stack
- **AI-Powered Deep Analysis** — Premium tiers offer deeper insights powered by Google Gemini
- **Shareable Results** — Generate and share your personality profile
- **Leaderboard** — See type distribution across all users

---

## Built With

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, TailwindCSS, Recharts |
| **Backend** | Express.js, Vercel Serverless Functions |
| **Database** | Supabase (PostgreSQL, real-time subscriptions) |
| **Auth** | Google OAuth 2.0, Email/Password |
| **Payments** | Stripe (3-tier: Free / Insight $19 / Mastery $39) |
| **AI** | Google Gemini API |
| **CI/CD** | GitHub Actions, Vercel |
| **Testing** | Vitest, E2E suite |

---

## Pricing Tiers

| Tier | Price | What You Get |
|------|-------|-------------|
| **Free** | $0 | 40-question assessment, function scores, type result |
| **Insight** | $19 | + AI analysis, archetype breakdown, The Grip stress patterns |
| **Mastery** | $39 | + Individuation guidance, shadow work, career path insights |

---

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
   git clone https://github.com/FelmonFekadu/jungian-typology-assessment.git
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
   DATABASE_URL=your_database_url
   SESSION_SECRET=your_session_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLIC_KEY=your_stripe_public_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5000](http://localhost:5000)

### Running Tests

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

---

## Project Structure

```
├── api/                  # Vercel serverless functions
│   ├── auth/            # Authentication endpoints
│   ├── ai/              # AI analysis endpoints
│   └── ...
├── components/          # React components
├── pages/               # Page components
├── shared/              # Shared types and schemas
├── tests/               # Test files
│   ├── api/            # API tests
│   ├── components/     # Component tests
│   ├── e2e/            # End-to-end tests
│   └── utils/          # Utility tests
└── server.ts            # Express development server
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Carl Jung's work on psychological types
- The MBTI and cognitive functions community
- [Supabase](https://supabase.com) for the database
- [Vercel](https://vercel.com) for hosting
