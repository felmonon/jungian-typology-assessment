import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, LogIn, UserPlus, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/use-auth';
import { Button } from '../components/ui/Button';

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
    } catch (error) {
      setFormError((error as Error).message);
    }
  };

  const displayError = formError ||
    (activeTab === 'login' && loginError?.message) ||
    (activeTab === 'signup' && signupError?.message);

  return (
    <div className="min-h-screen bg-jung-base dark:bg-dark-base flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-jung-accent/5 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-jung-secondary/5 rounded-full blur-[120px] -ml-64 -mb-64" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-3xl bg-jung-accent flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-jung-accent/20">
            <span className="text-white text-3xl font-serif">&psi;</span>
          </div>
          <h1 className="text-display text-4xl text-jung-dark dark:text-white mb-3">
            {activeTab === 'login' ? 'Welcome Back.' : 'Create Profile.'}
          </h1>
          <p className="text-sm text-jung-muted uppercase tracking-[0.2em] font-bold">
            Cognitive Diagnostics & Archive
          </p>
        </div>

        <div className="card-premium overflow-hidden bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border shadow-2xl">
          {/* Custom Tab Switcher */}
          <div className="flex p-2 gap-2 bg-jung-base dark:bg-dark-base/50">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'login'
                ? 'bg-jung-accent text-white shadow-lg'
                : 'text-jung-muted hover:text-jung-dark dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                }`}
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'signup'
                ? 'bg-jung-accent text-white shadow-lg'
                : 'text-jung-muted hover:text-jung-dark dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                }`}
            >
              <UserPlus className="w-4 h-4" /> Join Inner Circle
            </button>
          </div>

          <div className="p-8 lg:p-12">
            <AnimatePresence mode="wait">
              {displayError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 p-4 bg-error/5 border border-error/10 rounded-2xl text-error text-xs font-serif italic"
                >
                  {displayError}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-jung-muted px-1">Access Token (Email)</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-jung-muted" />
                        <input
                          type="email"
                          required
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className="w-full pl-14 pr-6 py-4 bg-jung-base dark:bg-dark-base border border-transparent focus:border-jung-accent/30 rounded-2xl outline-none transition-all text-sm font-serif"
                          placeholder="vocation@jung.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-jung-muted px-1">Cyber-Key (Password)</label>
                      <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-jung-muted" />
                        <input
                          type="password"
                          required
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="w-full pl-14 pr-6 py-4 bg-jung-base dark:bg-dark-base border border-transparent focus:border-jung-accent/30 rounded-2xl outline-none transition-all text-sm font-serif"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full py-6 text-xs uppercase tracking-[0.3em] font-bold shadow-xl shadow-jung-accent/20"
                    >
                      {isLoggingIn ? 'Verifying Identity...' : 'Initiate Session'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-jung-muted px-1">First Name</label>
                        <input
                          type="text"
                          required
                          value={signupForm.firstName}
                          onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                          className="w-full px-6 py-4 bg-jung-base dark:bg-dark-base border border-transparent focus:border-jung-accent/30 rounded-2xl outline-none transition-all text-sm font-serif"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-jung-muted px-1">Last Name</label>
                        <input
                          type="text"
                          required
                          value={signupForm.lastName}
                          onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                          className="w-full px-6 py-4 bg-jung-base dark:bg-dark-base border border-transparent focus:border-jung-accent/30 rounded-2xl outline-none transition-all text-sm font-serif"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-jung-muted px-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        className="w-full px-6 py-4 bg-jung-base dark:bg-dark-base border border-transparent focus:border-jung-accent/30 rounded-2xl outline-none transition-all text-sm font-serif"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-jung-muted px-1">Security Key</label>
                        <input
                          type="password"
                          required
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                          className="w-full px-6 py-4 bg-jung-base dark:bg-dark-base border border-transparent focus:border-jung-accent/30 rounded-2xl outline-none transition-all text-sm font-serif"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-jung-muted px-1">Confirm</label>
                        <input
                          type="password"
                          required
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                          className="w-full px-6 py-4 bg-jung-base dark:bg-dark-base border border-transparent focus:border-jung-accent/30 rounded-2xl outline-none transition-all text-sm font-serif"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSigningUp}
                      className="w-full py-6 text-xs uppercase tracking-[0.3em] font-bold shadow-xl shadow-jung-accent/20"
                    >
                      {isSigningUp ? 'Forging Profile...' : 'Establish Profile'}
                    </Button>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-jung-border dark:border-dark-border"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-6 bg-white dark:bg-dark-surface text-[10px] font-bold uppercase tracking-[0.2em] text-jung-muted">
                  Or Secure Auth
                </span>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/api/auth/google'}
              className="w-full py-4 flex items-center justify-center gap-4 bg-jung-base dark:bg-dark-base hover:bg-jung-accent/5 dark:hover:bg-jung-accent/10 border border-transparent hover:border-jung-accent/20 rounded-2xl transition-all group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-jung-dark dark:text-white">Cognitive Sign-in with Google</span>
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 text-jung-muted">
          <ShieldCheck className="w-5 h-5 text-jung-accent/50" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
            End-to-End Encrypted Personal Archives
          </p>
        </div>
      </motion.div>
    </div>
  );
};
