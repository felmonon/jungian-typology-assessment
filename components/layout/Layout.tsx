import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, LogOut, User, Menu, X, Trophy, BookOpen, Clock, Activity, Sun, Moon, Sparkles, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/use-auth';
import { usePageTracking } from '../../hooks/useAnalytics';
import { useDarkMode } from '../../hooks/useDarkMode';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, isAuthenticated, logout, isLoggingOut } = useAuth();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  usePageTracking();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative text-xs uppercase tracking-[0.1em] font-mono transition-all duration-300 py-2 px-1 ${isActive ? 'text-jung-accent' : 'text-jung-secondary hover:text-jung-dark'
    }`;

  return (
    <div className="min-h-screen flex flex-col font-sans text-jung-dark bg-jung-base relative overflow-x-hidden selection:bg-jung-accent selection:text-black">
      {/* Global Effects */}
      <div className="animate-scanline" />
      <div className="fixed inset-0 pointer-events-none bg-jung-dark opacity-[0.015] z-[9998]" />

      {/* Header - Control Deck */}
      <header
        className={`sticky top-0 z-[100] transition-all duration-500 border-b ${scrolled
            ? 'glass border-jung-border/50 py-3'
            : 'bg-transparent border-transparent py-6'
          }`}
      >
        <div className="lab-container">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-4 group">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-jung-accent opacity-10 blur-md rounded-full group-hover:opacity-30 transition-opacity" />
                <Hexagon className="w-10 h-10 text-jung-accent stroke-1" />
                <span className="absolute text-jung-accent font-display text-lg italic">&psi;</span>
              </div>
              <div className="flex flex-col">
                <span className="text-display text-xl leading-none text-jung-dark tracking-wide">
                  Type<span className="text-jung-accent">Jung</span>
                </span>
                <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-jung-muted group-hover:text-jung-accent transition-colors">
                  Psyche /// Protocol
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-12 bg-jung-surface-elevated/50 px-8 py-2 rounded-full border border-jung-border/50 backdrop-blur-md">
              <NavLink to="/" className={navLinkClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-2">
                    <Activity className={`w-3 h-3 ${isActive ? 'animate-pulse' : ''}`} />
                    Diagnostic
                  </span>
                )}
              </NavLink>
              <div className="w-px h-3 bg-jung-border/50" />
              <NavLink to="/learn" className={navLinkClass}>
                <span className="flex items-center gap-2">
                  <BookOpen className="w-3 h-3" /> Theory
                </span>
              </NavLink>
              <div className="w-px h-3 bg-jung-border/50" />
              <NavLink to="/leaderboard" className={navLinkClass}>
                <span className="flex items-center gap-2">
                  <Trophy className="w-3 h-3" /> Data
                </span>
              </NavLink>
            </nav>

            {/* Right Deck */}
            <div className="flex items-center gap-6">
              <button
                onClick={toggleDarkMode}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full border border-jung-border/50 text-jung-muted hover:text-jung-accent hover:border-jung-accent transition-all"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {isLoading ? (
                <div className="w-24 h-8 bg-jung-surface-elevated animate-pulse rounded" />
              ) : isAuthenticated ? (
                <div className="flex items-center gap-4 pl-6 border-l border-jung-border/50">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-jung-surface-elevated border border-transparent hover:border-jung-border transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-jung-accent-light flex items-center justify-center border border-jung-accent/30 group-hover:border-jung-accent transition-colors">
                      {user?.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-jung-accent" />
                      )}
                    </div>
                    <span className="text-xs font-mono text-jung-secondary group-hover:text-jung-dark">
                      {user?.firstName || 'Dossier'}
                    </span>
                  </Link>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="hidden lg:flex btn-premium py-2.5 px-6 text-xs"
                >
                  <LogIn className="w-3 h-3" /> Initiate
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-jung-dark hover:text-jung-accent transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: '100vh' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden fixed inset-0 top-[80px] bg-jung-base/95 backdrop-blur-xl z-50 overflow-y-auto"
            >
              <div className="lab-container py-8 space-y-6">
                {[
                  { to: '/', label: 'Diagnostic', icon: Activity },
                  { to: '/learn', label: 'Theory', icon: BookOpen },
                  { to: '/leaderboard', label: 'Global Data', icon: Trophy },
                  { to: '/history', label: 'Archive', icon: Clock, auth: true },
                ].map((item) => (
                  (!item.auth || isAuthenticated) && (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-4 p-4 rounded bg-jung-surface-elevated border border-jung-border/50
                        ${isActive ? 'border-jung-accent/50 text-jung-accent' : 'text-jung-secondary'}
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-mono text-sm uppercase tracking-widest">{item.label}</span>
                    </NavLink>
                  )
                ))}

                <div className="pt-8 border-t border-jung-border/30">
                  {isAuthenticated ? (
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="w-full py-4 border border-error/30 text-error font-mono text-xs uppercase tracking-widest hover:bg-error/10 transition-colors"
                    >
                      Terminate Session
                    </button>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-premium w-full py-4 text-center justify-center"
                    >
                      Initiate Protocol
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative z-10">{children}</main>

      {/* Footer - Lab Data */}
      <footer className="relative bg-jung-base border-t border-jung-border py-20 mt-20">
        <div className="lab-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-20">
            {/* Column 1: Identity */}
            <div className="space-y-6 col-span-1 md:col-span-2">
              <div className="flex items-center gap-3">
                <Hexagon className="w-8 h-8 text-jung-accent stroke-1" />
                <span className="text-display text-2xl text-jung-dark">
                  Type<span className="text-jung-accent">Jung</span>
                </span>
              </div>
              <p className="text-body text-sm text-jung-secondary max-w-sm">
                A digitally-aided exploration of the Carl Jung's Cognitive Functions.
                Move beyond the 4-letter dichotomy into a full-spectrum analysis of your psychic architecture.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="h-px flex-grow bg-jung-border/50 self-center" />
                <span className="text-[10px] font-mono text-jung-accent uppercase tracking-widest">v2.0.4 [Stable]</span>
              </div>
            </div>

            {/* Column 2: Protocol */}
            <div className="space-y-6">
              <h4 className="text-label">Protocol</h4>
              <ul className="space-y-4">
                {['Diagnostic', 'Theory', 'Methodology', 'Pricing'].map((item) => (
                  <li key={item}>
                    <Link to="/" className="text-sm font-sans text-jung-secondary hover:text-jung-accent transition-colors flex items-center gap-2 group">
                      <span className="w-1 h-1 bg-jung-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div className="space-y-6">
              <h4 className="text-label">Legal parameters</h4>
              <ul className="space-y-4">
                <li><Link to="/privacy" className="text-sm font-sans text-jung-secondary hover:text-jung-dark transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm font-sans text-jung-secondary hover:text-jung-dark transition-colors">Terms of Use</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-jung-border/30 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-mono text-jung-muted uppercase tracking-widest">
              &copy; {new Date().getFullYear()} TypeJung Analysis. All Rights Reserved.
            </p>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-mono text-jung-accent uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
