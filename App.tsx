import React, { lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';

const AuthPage = lazy(() => import('./pages/AuthPage').then(({ AuthPage }) => ({ default: AuthPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(({ ProfilePage }) => ({ default: ProfilePage })));
const Assessment = lazy(() => import('./pages/Assessment').then(({ Assessment }) => ({ default: Assessment })));
const Results = lazy(() => import('./pages/Results').then(({ Results }) => ({ default: Results })));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess').then(({ CheckoutSuccess }) => ({ default: CheckoutSuccess })));
const Checkout = lazy(() => import('./pages/Checkout').then(({ Checkout }) => ({ default: Checkout })));
const LearnTheory = lazy(() => import('./pages/LearnTheory').then(({ LearnTheory }) => ({ default: LearnTheory })));
const About = lazy(() => import('./pages/About').then(({ About }) => ({ default: About })));
const SharePage = lazy(() => import('./pages/SharePage').then(({ SharePage }) => ({ default: SharePage })));
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(({ Leaderboard }) => ({ default: Leaderboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(({ AdminDashboard }) => ({ default: AdminDashboard })));
const History = lazy(() => import('./pages/History').then(({ History }) => ({ default: History })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(({ PrivacyPolicy }) => ({ default: PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(({ TermsOfService }) => ({ default: TermsOfService })));
const Pricing = lazy(() => import('./pages/Pricing').then(({ Pricing }) => ({ default: Pricing })));
const SampleReport = lazy(() => import('./pages/SampleReport').then(({ SampleReport }) => ({ default: SampleReport })));
const AIRunStore = lazy(() => import('./pages/AIRunStore').then(({ AIRunStore }) => ({ default: AIRunStore })));

const RouteFallback: React.FC = () => (
  <div className="lab-container flex min-h-[calc(100svh-5rem)] items-center justify-center py-16" aria-live="polite" aria-busy="true">
    <div className="inline-flex items-center gap-3 rounded-lg border border-jung-border bg-jung-surface px-4 py-3 text-sm font-semibold text-jung-secondary shadow-sm">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-jung-accent" />
      Loading page
    </div>
  </div>
);

const VercelAnalyticsRouter: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  return <Analytics route={location.pathname} path={path} />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<ProfilePage />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/results" element={<Results />} />
            <Route path="/checkout/:tier" element={<Checkout />} />
            <Route path="/success" element={<CheckoutSuccess />} />
            <Route path="/learn" element={<LearnTheory />} />
            <Route path="/about" element={<About />} />
            <Route path="/share/:slug" element={<SharePage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/sample-report" element={<SampleReport />} />
            <Route path="/ai-run-store" element={<AIRunStore />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
      <VercelAnalyticsRouter />
      <SpeedInsights />
    </BrowserRouter>
  );
};

export default App;
