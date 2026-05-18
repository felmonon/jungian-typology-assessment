import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/use-auth';
import { AnalyticsEvents } from '../lib/analytics';

type AuthTab = 'login' | 'signup';

const AUTH_BENEFITS = [
  'Saved assessment history',
  'Paid report access',
  'Private account controls',
];

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    loginAsync,
    signupAsync,
    isLoggingIn,
    isSigningUp,
    loginError,
    signupError,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!loginForm.email || !loginForm.password) {
      setFormError('Enter your email and password to continue.');
      return;
    }

    try {
      await loginAsync({ email: loginForm.email, password: loginForm.password });
    } catch (error) {
      setFormError((error as Error).message);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!signupForm.firstName || !signupForm.lastName || !signupForm.email || !signupForm.password) {
      setFormError('Fill in every required field to create your account.');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (signupForm.password.length < 6) {
      setFormError('Use at least 6 characters for your password.');
      return;
    }

    try {
      AnalyticsEvents.signupStarted('email', 'auth_page');
      await signupAsync({
        email: signupForm.email,
        password: signupForm.password,
        firstName: signupForm.firstName,
        lastName: signupForm.lastName,
      });
      AnalyticsEvents.signupCompleted('email', 'auth_page');
    } catch (error) {
      setFormError((error as Error).message);
    }
  };

  const displayError =
    formError ||
    (activeTab === 'login' && loginError?.message) ||
    (activeTab === 'signup' && signupError?.message);

  return (
    <div className="min-h-screen bg-jung-base px-4 py-10 sm:px-6 lg:py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="editorial-container grid gap-6 lg:grid-cols-[0.78fr_1fr] lg:items-start"
      >
        <aside className="rounded-lg border border-jung-border bg-jung-dark p-7 text-white shadow-xl sm:p-9 lg:sticky lg:top-28">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-white/15">
            <span className="font-display text-3xl">&psi;</span>
          </div>
          <p className="text-sm font-semibold text-white/55">TypeJung account</p>
          <h1 className="mt-4 text-heading text-4xl text-white sm:text-5xl">
            {activeTab === 'login' ? 'Sign in to TypeJung' : 'Create your account'}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/72">
            Save your assessment history, access paid reports, and return to your results anytime.
          </p>

          <div className="mt-8 grid gap-3">
            {AUTH_BENEFITS.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                <CheckCircle2 className="h-4 w-4 flex-none text-jung-accent-muted" />
                {benefit}
              </div>
            ))}
          </div>
        </aside>

        <div>
          <div className="card-premium overflow-hidden bg-jung-surface">
          <div className="grid grid-cols-2 gap-2 border-b border-jung-border bg-jung-base p-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setFormError(null);
              }}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${
                activeTab === 'login'
                  ? 'bg-jung-accent text-white shadow-sm'
                  : 'text-jung-secondary hover:bg-jung-surface hover:text-jung-dark'
              }`}
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setFormError(null);
              }}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${
                activeTab === 'signup'
                  ? 'bg-jung-accent text-white shadow-sm'
                  : 'text-jung-secondary hover:bg-jung-surface hover:text-jung-dark'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Create account
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {displayError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-6 rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error"
                  role="alert"
                >
                  {displayError}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="login-email" className="text-sm font-semibold text-jung-dark">
                        Email
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="input-premium"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="login-password" className="text-sm font-semibold text-jung-dark">
                        Password
                      </label>
                      <input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="input-premium"
                        placeholder="Your password"
                      />
                    </div>

                    <Button type="submit" variant="accent" disabled={isLoggingIn} isLoading={isLoggingIn} className="w-full">
                      {isLoggingIn ? 'Signing in' : 'Sign in'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="first-name" className="text-sm font-semibold text-jung-dark">
                          First name
                        </label>
                        <input
                          id="first-name"
                          type="text"
                          autoComplete="given-name"
                          required
                          value={signupForm.firstName}
                          onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                          className="input-premium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="last-name" className="text-sm font-semibold text-jung-dark">
                          Last name
                        </label>
                        <input
                          id="last-name"
                          type="text"
                          autoComplete="family-name"
                          required
                          value={signupForm.lastName}
                          onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                          className="input-premium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="signup-email" className="text-sm font-semibold text-jung-dark">
                        Email
                      </label>
                      <input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        className="input-premium"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="signup-password" className="text-sm font-semibold text-jung-dark">
                          Password
                        </label>
                        <input
                          id="signup-password"
                          type="password"
                          autoComplete="new-password"
                          required
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                          className="input-premium"
                          aria-describedby="password-help"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="confirm-password" className="text-sm font-semibold text-jung-dark">
                          Confirm password
                        </label>
                        <input
                          id="confirm-password"
                          type="password"
                          autoComplete="new-password"
                          required
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                          className="input-premium"
                        />
                      </div>
                    </div>
                    <p id="password-help" className="text-xs leading-5 text-jung-muted">
                      Use at least 6 characters.
                    </p>

                    <Button type="submit" variant="accent" disabled={isSigningUp} isLoading={isSigningUp} className="w-full">
                      {isSigningUp ? 'Creating account' : 'Create account'}
                    </Button>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-jung-border" />
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-jung-muted">or</span>
              <div className="h-px flex-1 bg-jung-border" />
            </div>

            <button
              type="button"
              onClick={() => {
                AnalyticsEvents.signupStarted('google', 'auth_page');
                window.location.href = '/api/auth/google';
              }}
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-jung-border bg-jung-base px-4 text-sm font-semibold text-jung-dark transition-colors hover:border-jung-accent-muted hover:bg-jung-accent-light"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>
          </div>

          <div className="mt-4 flex items-start justify-center gap-3 rounded-lg border border-jung-border bg-jung-surface p-4 text-jung-secondary shadow-sm">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-jung-accent" />
            <p className="text-sm leading-6">
              Your account is used for saved history and paid access. The free assessment can still be taken without signing in.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
