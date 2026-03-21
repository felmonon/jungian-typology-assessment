# Jungian Typology Assessment

[![CI/CD Pipeline](https://github.com/FelmonFekadu/jungian-typology-assessment/actions/workflows/ci.yml/badge.svg)](https://github.com/FelmonFekadu/jungian-typology-assessment/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://jungian-typology-assessment.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A comprehensive personality assessment tool based on Carl Jung's cognitive functions theory. Discover your psychological type through an in-depth analysis of your cognitive function stack, stress patterns, and individuation path.

**[Try the Live Demo](https://jungian-typology-assessment.vercel.app)**

## Features

- **Free Assessment** - 40-question assessment measuring all 8 cognitive functions
- **Cognitive Function Analysis** - Detailed breakdown of your dominant, auxiliary, tertiary, and inferior functions
- **The Grip Analysis** - Understanding your stress responses and shadow functions
- **Archetypal Insights** - Explore the Hero, Parent, Child, and Anima/Animus archetypes in your stack
- **AI-Powered Analysis** - Premium tiers offer deeper insights powered by Google Gemini
- **Shareable Results** - Generate and share your personality profile
- **Leaderboard** - See type distribution across all users

## Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS, Recharts
- **Backend**: Express.js, Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Google OAuth 2.0, Email/Password
- **Payments**: Stripe
- **AI**: Google Gemini API
- **CI/CD**: GitHub Actions, Vercel

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

## Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Basic assessment, function scores, type result |
| Insight | $19 | + AI analysis, archetype breakdown, The Grip patterns |
| Mastery | $39 | + Individuation guidance, shadow work, career insights |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Carl Jung's work on psychological types
- The MBTI and cognitive functions community
- [Supabase](https://supabase.com) for the database
- [Vercel](https://vercel.com) for hosting
