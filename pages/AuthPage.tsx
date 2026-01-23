import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';

type AuthTab = 'login' | 'signup';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    loginAsync,
    signupAsync,
    isLoggingIn,
    isSigningUp,
    loginError,
    signupError
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
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
      setFormError('Please fill in all fields');
      return;
    }

    try {
      await loginAsync({ email: loginForm.email, password: loginForm.password });
      navigate('/');
    } catch (error) {
      setFormError((error as Error).message);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!signupForm.firstName || !signupForm.lastName || !signupForm.email || !signupForm.password) {
      setFormError('Please fill in all fields');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (signupForm.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    try {
      await signupAsync({
        email: signupForm.email,
        password: signupForm.password,
        firstName: signupForm.firstName,
        lastName: signupForm.lastName,
      });
      navigate('/');
    } catch (error) {
      setFormError((error as Error).message);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = '/api/auth/google';
  };

  const displayError = formError ||
    (activeTab === 'login' && loginError?.message) ||
    (activeTab === 'signup' && signupError?.message);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 md:py-16 bg-jung-surface">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-jung-accent/10 mb-4">
            <span className="text-jung-accent font-serif text-3xl">ψ</span>
          </div>
          <h1 className="text-display text-2xl sm:text-3xl mb-2">
            {activeTab === 'login' ? 'Welcome Back' : 'Begin Your Journey'}
          </h1>
          <p className="text-body text-jung-muted">
            {activeTab === 'login'
              ? 'Sign in to continue your exploration'
              : 'Create an account to save your results'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="card-elevated rounded-2xl overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex border-b border-jung-border">
            <button
              onClick={() => { setActiveTab('login'); setFormError(null); }}
              className={`
                flex-1 py-4 px-6 text-ui font-medium transition-all duration-200 min-h-[56px]
                flex items-center justify-center gap-2
                ${activeTab === 'login'
                  ? 'bg-jung-accent text-white'
                  : 'text-jung-muted hover:bg-jung-surface hover:text-jung-text'}
              `}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setFormError(null); }}
              className={`
                flex-1 py-4 px-6 text-ui font-medium transition-all duration-200 min-h-[56px]
                flex items-center justify-center gap-2
                ${activeTab === 'signup'
                  ? 'bg-jung-accent text-white'
                  : 'text-jung-muted hover:bg-jung-surface hover:text-jung-text'}
              `}
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 md:p-8">
            {/* Error Message */}
            {displayError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {displayError}
              </div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-ui text-sm font-medium text-jung-text mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-jung-muted" />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="
                        w-full pl-12 pr-4 py-3.5 text-body text-jung-text
                        bg-jung-surface border border-jung-border rounded-lg
                        focus:ring-2 focus:ring-jung-accent focus:border-transparent
                        outline-none transition-all duration-200
                        placeholder:text-jung-muted/60
                      "
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-ui text-sm font-medium text-jung-text mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-jung-muted" />
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="
                        w-full pl-12 pr-4 py-3.5 text-body text-jung-text
                        bg-jung-surface border border-jung-border rounded-lg
                        focus:ring-2 focus:ring-jung-accent focus:border-transparent
                        outline-none transition-all duration-200
                        placeholder:text-jung-muted/60
                      "
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="
                    w-full py-4 min-h-[56px]
                    bg-jung-accent text-white text-ui font-semibold
                    rounded-lg shadow-md shadow-jung-accent/20
                    hover:bg-jung-accent-hover hover:-translate-y-0.5
                    active:translate-y-0
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                  "
                >
                  {isLoggingIn ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-ui text-sm font-medium text-jung-text mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-jung-muted" />
                      <input
                        type="text"
                        value={signupForm.firstName}
                        onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                        className="
                          w-full pl-12 pr-4 py-3.5 text-body text-jung-text
                          bg-jung-surface border border-jung-border rounded-lg
                          focus:ring-2 focus:ring-jung-accent focus:border-transparent
                          outline-none transition-all duration-200
                          placeholder:text-jung-muted/60
                        "
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-ui text-sm font-medium text-jung-text mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={signupForm.lastName}
                      onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                      className="
                        w-full px-4 py-3.5 text-body text-jung-text
                        bg-jung-surface border border-jung-border rounded-lg
                        focus:ring-2 focus:ring-jung-accent focus:border-transparent
                        outline-none transition-all duration-200
                        placeholder:text-jung-muted/60
                      "
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-ui text-sm font-medium text-jung-text mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-jung-muted" />
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      className="
                        w-full pl-12 pr-4 py-3.5 text-body text-jung-text
                        bg-jung-surface border border-jung-border rounded-lg
                        focus:ring-2 focus:ring-jung-accent focus:border-transparent
                        outline-none transition-all duration-200
                        placeholder:text-jung-muted/60
                      "
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-ui text-sm font-medium text-jung-text mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-jung-muted" />
                    <input
                      type="password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      className="
                        w-full pl-12 pr-4 py-3.5 text-body text-jung-text
                        bg-jung-surface border border-jung-border rounded-lg
                        focus:ring-2 focus:ring-jung-accent focus:border-transparent
                        outline-none transition-all duration-200
                        placeholder:text-jung-muted/60
                      "
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-jung-muted">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-ui text-sm font-medium text-jung-text mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-jung-muted" />
                    <input
                      type="password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      className="
                        w-full pl-12 pr-4 py-3.5 text-body text-jung-text
                        bg-jung-surface border border-jung-border rounded-lg
                        focus:ring-2 focus:ring-jung-accent focus:border-transparent
                        outline-none transition-all duration-200
                        placeholder:text-jung-muted/60
                      "
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSigningUp}
                  className="
                    w-full py-4 min-h-[56px]
                    bg-jung-accent text-white text-ui font-semibold
                    rounded-lg shadow-md shadow-jung-accent/20
                    hover:bg-jung-accent-hover hover:-translate-y-0.5
                    active:translate-y-0
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                  "
                >
                  {isSigningUp ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-jung-border"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-jung-card text-jung-muted text-sm">or continue with</span>
              </div>
            </div>

            {/* Google Auth */}
            <button
              onClick={handleGoogleAuth}
              className="
                w-full flex items-center justify-center gap-3
                py-3.5 min-h-[56px]
                bg-jung-surface border border-jung-border rounded-lg
                text-jung-text text-ui font-medium
                hover:bg-jung-card hover:border-jung-accent/30
                transition-all duration-200
              "
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-jung-muted text-xs mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};
