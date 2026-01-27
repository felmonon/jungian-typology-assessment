import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, LogOut, User, Menu, X, Trophy, BookOpen, Shield, History, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import { usePageTracking } from '../../hooks/useAnalytics';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track page views for analytics
  usePageTracking();

  // Track scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative text-sm font-sans font-medium transition-colors duration-300 py-2 ${
      isActive
        ? 'text-amber-700'
        : 'text-jung-secondary hover:text-jung-dark'
    }`;

  const navLinkWithUnderline = ({ isActive }: { isActive: boolean }) =>
    `${navLinkClass({ isActive })} group`;

  return (
    <div className="min-h-screen flex flex-col font-serif text-jung-dark bg-jung-base">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-stone-900/5 border-b border-stone-200/50'
            : 'bg-transparent'
        }`}
      >
        <div className="editorial-container">
          <div className="flex justify-between h-16 lg:h-20 items-center">
            {/* Logo */}
            <Link
              to="/"
              className="flex-shrink-0 flex items-center gap-3 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-shadow duration-300">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-display text-xl text-jung-dark">
                Type<span className="gradient-text">Jung</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <NavLink to="/" className={navLinkWithUnderline}>
                {({ isActive }) => (
                  <>
                    Assessment
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </>
                )}
              </NavLink>
              <NavLink to="/learn" className={navLinkWithUnderline}>
                {({ isActive }) => (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    Learn
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </span>
                )}
              </NavLink>
              <NavLink to="/about" className={navLinkWithUnderline}>
                {({ isActive }) => (
                  <>
                    About
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </>
                )}
              </NavLink>
              <NavLink to="/leaderboard" className={navLinkWithUnderline}>
                {({ isActive }) => (
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" />
                    Leaderboard
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </span>
                )}
              </NavLink>
              {user?.isAdmin && (
                <NavLink to="/admin" className={navLinkWithUnderline}>
                  {({ isActive }) => (
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4" />
                      Admin
                      <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                    </span>
                  )}
                </NavLink>
              )}
              {isAuthenticated && (
                <NavLink to="/history" className={navLinkWithUnderline}>
                  {({ isActive }) => (
                    <span className="flex items-center gap-1.5">
                      <History className="w-4 h-4" />
                      History
                      <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                    </span>
                  )}
                </NavLink>
              )}

              {/* Auth Section */}
              <div className="flex items-center gap-3 pl-6 border-l border-stone-200">
                {isLoading ? (
                  <span className="text-sm text-jung-muted">Loading...</span>
                ) : isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
                    >
                      {user?.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt=""
                          className="w-9 h-9 rounded-full ring-2 ring-stone-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center ring-2 ring-amber-200">
                          <User className="w-4 h-4 text-amber-700" />
                        </div>
                      )}
                    </Link>
                    <button
                      onClick={() => logout()}
                      disabled={isLoggingOut}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-sans text-jung-muted hover:text-jung-dark hover:bg-stone-100 rounded-full transition-all disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />
                      {isLoggingOut ? '...' : 'Logout'}
                    </button>
                  </div>
                ) : (
                  <NavLink
                    to="/auth"
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-sans font-semibold bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-full shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/30 transition-all hover:-translate-y-0.5"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </NavLink>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-jung-dark hover:bg-stone-100 rounded-xl transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ${
            mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white/95 backdrop-blur-xl border-t border-stone-200/50">
            <div className="editorial-container py-6 space-y-1">
              <NavLink
                to="/"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center justify-between py-3 px-4 text-base font-sans font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-700'
                      : 'text-jung-secondary hover:bg-stone-100'
                  }`
                }
              >
                Assessment
                <ChevronRight className="w-5 h-5 opacity-50" />
              </NavLink>
              <NavLink
                to="/learn"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center justify-between py-3 px-4 text-base font-sans font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-700'
                      : 'text-jung-secondary hover:bg-stone-100'
                  }`
                }
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Learn the Theory
                </span>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </NavLink>
              <NavLink
                to="/about"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center justify-between py-3 px-4 text-base font-sans font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-700'
                      : 'text-jung-secondary hover:bg-stone-100'
                  }`
                }
              >
                About
                <ChevronRight className="w-5 h-5 opacity-50" />
              </NavLink>
              <NavLink
                to="/leaderboard"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center justify-between py-3 px-4 text-base font-sans font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-700'
                      : 'text-jung-secondary hover:bg-stone-100'
                  }`
                }
              >
                <span className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Leaderboard
                </span>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </NavLink>
              {user?.isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center justify-between py-3 px-4 text-base font-sans font-medium rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-700'
                        : 'text-jung-secondary hover:bg-stone-100'
                    }`
                  }
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Admin
                  </span>
                  <ChevronRight className="w-5 h-5 opacity-50" />
                </NavLink>
              )}
              {isAuthenticated && (
                <NavLink
                  to="/history"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center justify-between py-3 px-4 text-base font-sans font-medium rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-700'
                        : 'text-jung-secondary hover:bg-stone-100'
                    }`
                  }
                >
                  <span className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    History
                  </span>
                  <ChevronRight className="w-5 h-5 opacity-50" />
                </NavLink>
              )}

              {/* Mobile Auth */}
              <div className="pt-4 mt-4 border-t border-stone-200">
                {isLoading ? (
                  <span className="block py-3 px-4 text-sm text-jung-muted">
                    Loading...
                  </span>
                ) : isAuthenticated ? (
                  <div className="space-y-3">
                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-stone-100 transition-colors"
                    >
                      {user?.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt=""
                          className="w-12 h-12 rounded-full ring-2 ring-stone-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center ring-2 ring-amber-200">
                          <User className="w-6 h-6 text-amber-700" />
                        </div>
                      )}
                      <div>
                        <span className="block text-base font-sans font-medium text-jung-dark">
                          {user?.firstName || 'User'}
                        </span>
                        <span className="block text-sm text-jung-muted">
                          {user?.email}
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      disabled={isLoggingOut}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 text-base font-sans font-medium bg-stone-100 hover:bg-stone-200 text-jung-secondary rounded-xl transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-5 h-5" />
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                ) : (
                  <NavLink
                    to="/auth"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 w-full py-4 px-4 text-base font-sans font-semibold bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl shadow-lg shadow-amber-600/25"
                  >
                    <LogIn className="w-5 h-5" />
                    Sign In / Create Account
                  </NavLink>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Premium Footer */}
      <footer className="relative bg-gradient-to-br from-jung-dark via-stone-900 to-jung-dark text-stone-300 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="editorial-container relative py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-display text-xl text-white">
                  Type<span className="text-amber-500">Jung</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed text-stone-400 mb-6">
                Discover your true cognitive nature through Jungian depth psychology. 
                Not a label—but a mirror for self-reflection.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-white font-sans font-semibold text-sm uppercase tracking-wider mb-5">
                Explore
              </h3>
              <ul className="space-y-3">
                {['Take Assessment', 'Learn the Theory', 'Pricing', 'Leaderboard'].map((item) => (
                  <li key={item}>
                    <Link
                      to={item === 'Take Assessment' ? '/assessment' : item === 'Learn the Theory' ? '/learn' : `/${item.toLowerCase()}`}
                      className="text-sm text-stone-400 hover:text-amber-500 transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Concepts */}
            <div>
              <h3 className="text-white font-sans font-semibold text-sm uppercase tracking-wider mb-5">
                Key Concepts
              </h3>
              <ul className="space-y-3 text-sm text-stone-400">
                {['Individuation', 'Differentiation', 'Dominant-Inferior Axis', 'The 8 Function-Attitudes'].map((item) => (
                  <li key={item} className="hover:text-stone-300 transition-colors cursor-default">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-sans font-semibold text-sm uppercase tracking-wider mb-5">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/privacy" className="text-sm text-stone-400 hover:text-amber-500 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-stone-400 hover:text-amber-500 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500">
              <p>&copy; {new Date().getFullYear()} TypeJung. All rights reserved.</p>
              <p className="text-center md:text-right max-w-md">
                Based on the typological work of Carl Gustav Jung. Results reflect 
                current configuration, not fixed identity.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
