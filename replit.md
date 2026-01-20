# Jungian Typology Assessment

## Overview

A psychological assessment web application based on Carl Jung's original typology framework. The app measures the 8 cognitive function-attitudes (Te, Ti, Fe, Fi, Se, Si, Ne, Ni) independently using a Singer-Loomis methodology, rather than forcing dichotomous choices like traditional MBTI tests. Users complete an assessment, receive detailed results with radar chart visualizations, and can unlock premium content via Stripe payments.

### Premium Content Sections
After payment ($10), users unlock:
- AI Type Coach Chatbot (ask questions about your type and self-improvement)
- Type Phenomenology (focus, behavior, historical parallels)
- Full Attitude Analysis (extraversion/introversion with strengths/shadow)
- Archetypal Stack (all 4 positions with archetype descriptions)
- The Grip (stress patterns, triggers, recovery paths)
- Individuation Path (stages, inferior function work, warnings)
- Relationships & Compatibility (strengths, challenges, ideal partners, growth areas)
- Career Alignment (natural strengths, ideal environments, suggested roles)
- Active Imagination Exercises (5 Jungian prompts)
- Dream Journaling Guide (questions, symbols to notice, Jungian tips)
- PDF Download of full report

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript, using Vite as the build tool
- **Routing**: React Router DOM with HashRouter (enables static hosting compatibility)
- **State Management**: TanStack React Query for server state, localStorage for assessment progress and results persistence
- **Styling**: Tailwind CSS v4 with PostCSS build (not CDN), custom theme in styles/globals.css (jung color palette, Cormorant Garamond/IBM Plex Sans fonts). Fully responsive with mobile-first breakpoints (sm:, md:, lg:)
- **Charts**: Recharts library for radar chart visualization of cognitive function scores
- **PDF Generation**: jsPDF with html2canvas for downloadable reports

### Backend Architecture
- **Runtime**: Express.js server with Vite dev server integration for local development
- **API Design**: REST endpoints under `/api/` prefix
- **Deployment**: Dual deployment support - Vite dev server locally, Vercel serverless functions in production (see `/api/*.ts` files)

### Authentication
- **Provider**: Custom authentication with email/password and Google OAuth
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Implementation**: Passport.js with Local and Google OAuth strategies
- **Password Security**: bcrypt with 10 salt rounds for password hashing
- **User Storage**: Drizzle ORM with users table (passwordHash, googleId fields)
- **Auth Routes**: 
  - `POST /api/auth/signup` - Create account with email/password
  - `POST /api/auth/login` - Login with email/password
  - `POST /api/auth/logout` - Logout and destroy session
  - `GET /api/auth/google` - Initiate Google OAuth
  - `GET /api/auth/google/callback` - Handle Google OAuth callback
  - `GET /api/auth/user` - Get current user (returns 401 if not logged in)
- **Profile Routes**:
  - `GET /api/profile` - Get user profile
  - `PATCH /api/profile` - Update user profile (firstName, lastName, profileImageUrl)
  - `DELETE /api/profile` - Delete user account and logout
- **Results Routes**:
  - `POST /api/results` - Save assessment result (authenticated)
  - `GET /api/results` - Get user's result history (authenticated)
  - `GET /api/results/:id` - Get specific result (authenticated)
  - `DELETE /api/results/:id` - Delete result (authenticated)
  - `GET /api/share/:slug` - Get shared result (public)

### Payment Integration
- **Provider**: Stripe Checkout for subscription payments
- **Flow**: Create checkout session → Redirect to Stripe → Webhook/success page verification → Unlock premium content via localStorage flag
- **Endpoints**: `/api/create-checkout-session`, `/api/verify-session`, `/api/webhook`

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Provider**: Neon serverless PostgreSQL (@neondatabase/serverless)
- **Schema**: Located in `shared/schema.ts`, exports from `shared/models/auth.ts`
- **Tables**: 
  - `users` (id, email, passwordHash, googleId, firstName, lastName, profileImageUrl, timestamps)
  - `sessions` (sid, sess, expire)
  - `assessment_results` (id, userId, scores, stack, attitudeScore, isUndifferentiated, shareSlug, createdAt)
- **Migrations**: Drizzle Kit with `npm run db:push`

### Key Design Decisions

1. **Independent Function Measurement**: Unlike MBTI's forced-choice format, each cognitive function is scored independently using Likert scales, allowing users to score high on theoretically "opposite" functions.

2. **Assessment Storage**: Assessment progress is stored in localStorage for anonymous usage. For logged-in users, completed results are also saved to the database with history tracking and shareable links.

3. **Premium Content Gating**: Premium features are gated by a localStorage flag (`jungian_assessment_unlocked`) set after successful Stripe payment verification. This is a simple client-side check suitable for low-stakes content.

4. **HashRouter for Static Hosting**: Using `HashRouter` instead of `BrowserRouter` ensures compatibility with static hosting platforms that don't support server-side routing.

5. **Dual Deployment Architecture**: The app supports both local Express development (`server.ts`) and Vercel serverless deployment (`/api/*.ts` functions), sharing the same logic.

## External Dependencies

### APIs and Services
- **Gemini API**: AI functionality (key stored in `GEMINI_API_KEY` environment variable)
- **Stripe**: Payment processing (requires `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`)
- **Google OAuth**: Social login (requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)

### Database
- **Neon PostgreSQL**: Serverless Postgres database (connection via `DATABASE_URL`)

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `VITE_STRIPE_PRICE_ID` - Stripe price ID for premium subscription
- `SESSION_SECRET` - Express session encryption secret
- `REPL_ID` - Replit environment identifier (auto-set on Replit)

## Recent Changes

### January 2026 (AI Integration Update)
- **AI-Powered Personalized Analysis**: Integrated Gemini AI via Replit AI Integrations for personalized insights
  - **Free Tier**: 150-200 word personalized analysis for all users based on their assessment results
  - **Premium Tier**: 10 comprehensive AI-generated sections (3000+ words total):
    - Comprehensive Profile Overview
    - Detailed Function Analysis
    - Archetypal Patterns
    - Deep Dive: The Grip Experience
    - Personalized Relationship Insights
    - Career Path Analysis
    - Individuation Journey
    - Shadow Integration Work
    - Personal Growth Roadmap
    - Personalized Dreamwork Guide
- **New API Endpoints**:
  - `POST /api/ai/free-analysis` - Generate free personalized insight (rate limited: 10/hour)
  - `POST /api/ai/premium-analysis` - Generate premium AI analysis (requires premium access)
- **New Files**:
  - `server/ai-analysis.ts` - AI analysis service using Gemini
  - `hooks/use-ai-analysis.ts` - React hook for fetching AI analysis
  - `server/replit_integrations/` - Gemini AI integration files

### January 2026 (Production Readiness Update)
- **Server-side Premium Entitlement**: Added purchases table, Stripe webhook to record payments, /api/premium-status endpoint with server-side verification
- **Rate Limiting**: Applied express-rate-limit to all API routes (500/15min global), auth endpoints (10/hour login, 5/hour signup), checkout (20/hour), email (2/day)
- **Production Build**: Configured vite.config.ts to output to dist/public, created server-prod.ts with static file serving, set up autoscale deployment
- **Privacy Policy & Terms of Service**: Added legal pages with content covering data collection, third-party services, payment terms, disclaimers
- **Assessment Enhancements**: Expanded from ~57 to ~132 questions with situational phrasing ("When...", "In situations where..."), stress/grip probes for each function, and more attitude questions
- **Email PDF Delivery**: Integrated Resend for automatic PDF email delivery after purchase (server/resend.ts)
- **History Compare**: Added side-by-side result comparison feature (pages/History.tsx) with overlaid radar charts and score change tables
- **Premium Content**: Added all 10 promised premium sections including Relationships, Career, Active Imagination, Dream Journaling