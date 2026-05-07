import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Clock, LogIn, LogOut, Menu, Sparkles, Trophy, User, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import { usePageTracking } from '../../hooks/useAnalytics';

const navigation = [
  { to: '/', label: 'Home' },
  { to: '/learn', label: 'Learn' },
  { to: '/leaderboard', label: 'Data' },
  { to: '/pricing', label: 'Pricing' },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, isLoading, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  usePageTracking();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-jung-accent-light text-jung-accent'
        : 'text-jung-secondary hover:bg-jung-surface-alt hover:text-jung-dark'
    }`;

  const accountAction = isAuthenticated ? (
    <div className="hidden lg:flex items-center gap-2">
      <Link
        to="/profile"
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-jung-border bg-jung-surface px-3 text-sm font-medium text-jung-dark transition-colors hover:border-jung-accent-muted hover:bg-jung-accent-light"
      >
        {user?.profileImageUrl ? (
          <img src={user.profileImageUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
        ) : (
          <User className="h-4 w-4" />
        )}
        <span className="max-w-24 truncate">{user?.firstName || 'Profile'}</span>
      </Link>
      <button
        type="button"
        onClick={() => logout()}
        disabled={isLoggingOut}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-jung-muted transition-colors hover:bg-jung-surface-alt hover:text-jung-dark disabled:opacity-50"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  ) : (
    <Link
      to="/auth"
      className="hidden h-10 items-center gap-2 rounded-lg border border-jung-border bg-jung-surface px-4 text-sm font-semibold text-jung-dark transition-colors hover:border-jung-accent-muted hover:bg-jung-accent-light lg:inline-flex"
    >
      <LogIn className="h-4 w-4" />
      Sign in
    </Link>
  );

  return (
    <div className="min-h-screen bg-jung-base text-jung-dark">
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'glass border-jung-border py-3 shadow-sm'
            : 'border-transparent bg-jung-base/90 py-5'
        }`}
      >
        <div className="lab-container flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3" aria-label="TypeJung home">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-jung-accent text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="flex flex-col">
              <span className="font-display text-2xl leading-none text-jung-dark">TypeJung</span>
              <span className="text-xs font-medium text-jung-muted">Energy map assessment</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-lg border border-jung-border bg-jung-surface/80 p-1 lg:flex">
            {navigation.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="hidden h-10 w-24 animate-pulse rounded-lg bg-jung-surface-alt lg:block" />
            ) : (
              accountAction
            )}
            <Link
              to="/assessment"
              className="hidden h-10 items-center justify-center rounded-lg bg-jung-accent px-4 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-jung-accent-hover hover:shadow-md sm:inline-flex"
            >
              Start free
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-jung-border bg-jung-surface text-jung-dark transition-colors hover:bg-jung-surface-alt lg:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="lg:hidden"
            >
              <div className="lab-container pb-4 pt-3">
                <div className="rounded-lg border border-jung-border bg-jung-surface p-2 shadow-lg">
                  {navigation.map((item) => (
                    <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navLinkClass}>
                      {item.label}
                    </NavLink>
                  ))}
                  {isAuthenticated && (
                    <>
                      <NavLink to="/history" className={navLinkClass}>
                        <span className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          History
                        </span>
                      </NavLink>
                      <NavLink to="/leaderboard" className={navLinkClass}>
                        <span className="inline-flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          Results data
                        </span>
                      </NavLink>
                    </>
                  )}
                  <div className="mt-2 grid gap-2 border-t border-jung-border pt-2">
                    <Link
                      to="/assessment"
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-jung-accent px-4 text-sm font-semibold text-white"
                    >
                      Start free assessment
                    </Link>
                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() => logout()}
                        disabled={isLoggingOut}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-jung-border px-4 text-sm font-semibold text-jung-dark disabled:opacity-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    ) : (
                      <Link
                        to="/auth"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-jung-border px-4 text-sm font-semibold text-jung-dark"
                      >
                        <LogIn className="h-4 w-4" />
                        Sign in
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>{children}</main>

      <footer className="border-t border-jung-border bg-jung-surface/70 py-12">
        <div className="lab-container grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Link to="/" className="mb-4 inline-flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-jung-accent-light text-jung-accent">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-display text-2xl text-jung-dark">TypeJung</span>
            </Link>
            <p className="max-w-sm text-sm leading-6 text-jung-secondary">
              A depth-based Jungian assessment for mapping where psychic energy flows and where it gets stuck.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-jung-dark">Explore</h4>
            <div className="grid gap-3 text-sm text-jung-secondary">
              <Link to="/assessment" className="hover:text-jung-accent">Assessment</Link>
              <Link to="/learn" className="hover:text-jung-accent">Learn the theory</Link>
              <Link to="/pricing" className="hover:text-jung-accent">Pricing</Link>
              <Link to="/about" className="hover:text-jung-accent">About</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-jung-dark">Account</h4>
            <div className="grid gap-3 text-sm text-jung-secondary">
              <Link to="/auth" className="hover:text-jung-accent">Sign in</Link>
              <Link to="/history" className="hover:text-jung-accent">History</Link>
              <Link to="/privacy" className="hover:text-jung-accent">Privacy</Link>
              <Link to="/terms" className="hover:text-jung-accent">Terms</Link>
            </div>
          </div>
        </div>
        <div className="lab-container mt-10 flex flex-col gap-3 border-t border-jung-border pt-6 text-xs text-jung-muted sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} TypeJung</span>
          <span className="inline-flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" />
            Not a four-letter label
          </span>
        </div>
      </footer>
    </div>
  );
};
