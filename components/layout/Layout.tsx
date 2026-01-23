import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { Activity, LogIn, LogOut, User, Menu, X, Trophy, BookOpen, Shield, History, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    `relative text-sm font-sans font-medium transition-colors duration-200 py-2 ${
      isActive
        ? 'text-jung-accent'
        : 'text-jung-secondary hover:text-jung-dark'
    }`;

  const navLinkWithUnderline = ({ isActive }: { isActive: boolean }) =>
    `${navLinkClass({ isActive })} group`;

  return (
    <div className="min-h-screen flex flex-col font-serif text-jung-dark bg-jung-base">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-jung-surface/95 backdrop-blur-md shadow-sm border-b border-jung-border'
            : 'bg-transparent'
        }`}
      >
        <div className="editorial-container">
          <div className="flex justify-between h-16 lg:h-20 items-center">
            {/* Logo */}
            <Link
              to="/"
              className="flex-shrink-0 flex items-center gap-2.5 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-jung-accent/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                <img
                  src="/logo.svg"
                  alt="Jungian Typology Logo"
                  className="relative h-8 w-8 lg:h-10 lg:w-10 transition-transform group-hover:scale-110"
                />
              </div>
              <span className="text-display text-lg lg:text-xl text-jung-dark">
                Jungian<span className="text-jung-accent">Typology</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <NavLink to="/" className={navLinkWithUnderline}>
                {({ isActive }) => (
                  <>
                    Assessment
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-jung-accent transition-all duration-200 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </>
                )}
              </NavLink>
              <NavLink to="/learn" className={navLinkWithUnderline}>
                {({ isActive }) => (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    Learn
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-jung-accent transition-all duration-200 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </span>
                )}
              </NavLink>
              <NavLink to="/about" className={navLinkWithUnderline}>
                {({ isActive }) => (
                  <>
                    About
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-jung-accent transition-all duration-200 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </>
                )}
              </NavLink>
              <NavLink to="/leaderboard" className={navLinkWithUnderline}>
                {({ isActive }) => (
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" />
                    Leaderboard
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-jung-accent transition-all duration-200 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </span>
                )}
              </NavLink>
              {user?.isAdmin && (
                <NavLink to="/admin" className={navLinkWithUnderline}>
                  {({ isActive }) => (
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4" />
                      Admin
                      <span className={`absolute bottom-0 left-0 h-0.5 bg-jung-accent transition-all duration-200 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
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
                      <span className={`absolute bottom-0 left-0 h-0.5 bg-jung-accent transition-all duration-200 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                    </span>
                  )}
                </NavLink>
              )}

              {/* Auth Section */}
              <div className="flex items-center gap-3 pl-4 border-l border-jung-border">
                {isLoading ? (
                  <span className="text-sm text-jung-muted">Loading...</span>
                ) : isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      {user?.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt=""
                          className="w-8 h-8 rounded-full ring-2 ring-jung-border"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-jung-accent-light flex items-center justify-center">
                          <User className="w-4 h-4 text-jung-accent" />
                        </div>
                      )}
                      <span className="text-sm font-sans text-jung-secondary">
                        {user?.firstName || 'Profile'}
                      </span>
                    </Link>
                    <button
                      onClick={() => logout()}
                      disabled={isLoggingOut}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-sans text-jung-muted hover:text-jung-dark hover:bg-jung-border/50 rounded-md transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />
                      {isLoggingOut ? '...' : 'Logout'}
                    </button>
                  </div>
                ) : (
                  <NavLink
                    to="/auth"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-sans font-medium bg-jung-primary text-white hover:bg-jung-accent rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5"
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
              className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-jung-dark hover:bg-jung-border/50 rounded-lg transition-colors"
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
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-jung-surface border-t border-jung-border">
            <div className="editorial-container py-6 space-y-1">
              <NavLink
                to="/"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center justify-between py-3 px-4 text-base font-sans font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-jung-accent-light text-jung-accent'
                      : 'text-jung-secondary hover:bg-jung-border/50'
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
                  `flex items-center justify-between py-3 px-4 text-base font-sans font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-jung-accent-light text-jung-accent'
                      : 'text-jung-secondary hover:bg-jung-border/50'
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
                  `flex items-center justify-between py-3 px-4 text-base font-sans font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-jung-accent-light text-jung-accent'
                      : 'text-jung-secondary hover:bg-jung-border/50'
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
                  `flex items-center justify-between py-3 px-4 text-base font-sans font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-jung-accent-light text-jung-accent'
                      : 'text-jung-secondary hover:bg-jung-border/50'
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
                    `flex items-center justify-between py-3 px-4 text-base font-sans font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-jung-accent-light text-jung-accent'
                        : 'text-jung-secondary hover:bg-jung-border/50'
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
                    `flex items-center justify-between py-3 px-4 text-base font-sans font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-jung-accent-light text-jung-accent'
                        : 'text-jung-secondary hover:bg-jung-border/50'
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
              <div className="pt-4 mt-4 border-t border-jung-border">
                {isLoading ? (
                  <span className="block py-3 px-4 text-sm text-jung-muted">
                    Loading...
                  </span>
                ) : isAuthenticated ? (
                  <div className="space-y-3">
                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-jung-border/50 transition-colors"
                    >
                      {user?.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt=""
                          className="w-12 h-12 rounded-full ring-2 ring-jung-border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-jung-accent-light flex items-center justify-center">
                          <User className="w-6 h-6 text-jung-accent" />
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
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 text-base font-sans font-medium bg-jung-border/50 hover:bg-jung-border text-jung-secondary rounded-lg transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-5 h-5" />
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                ) : (
                  <NavLink
                    to="/auth"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 w-full py-3.5 px-4 text-base font-sans font-medium bg-jung-primary text-white hover:bg-jung-accent rounded-lg transition-colors"
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

      {/* Footer */}
      <footer className="bg-jung-dark text-jung-subtle">
        <div className="editorial-container py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <Activity className="h-6 w-6 text-jung-accent" />
                <span className="text-display text-lg text-white">
                  Jungian<span className="text-jung-accent">Typology</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed text-jung-subtle/80">
                A tool for self-exploration based on Carl Jung's{' '}
                <em>Psychological Types</em> (1921). Not a diagnostic
                instrument, but a mirror for reflection.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-white font-sans font-medium text-sm uppercase tracking-wider mb-4">
                Explore
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to="/assessment"
                    className="text-sm hover:text-jung-accent transition-colors"
                  >
                    Take Assessment
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learn"
                    className="text-sm hover:text-jung-accent transition-colors"
                  >
                    Learn the Theory
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pricing"
                    className="text-sm hover:text-jung-accent transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/leaderboard"
                    className="text-sm hover:text-jung-accent transition-colors"
                  >
                    Leaderboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Key Concepts */}
            <div>
              <h3 className="text-white font-sans font-medium text-sm uppercase tracking-wider mb-4">
                Key Concepts
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>Individuation</li>
                <li>Differentiation</li>
                <li>Dominant-Inferior Axis</li>
                <li>The 8 Function-Attitudes</li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-sans font-medium text-sm uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to="/privacy"
                    className="text-sm hover:text-jung-accent transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-sm hover:text-jung-accent transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-jung-subtle/60">
              <p>&copy; {new Date().getFullYear()} Jungian Typology Assessment. All rights reserved.</p>
              <p className="text-center md:text-right max-w-md">
                This assessment relies on self-reporting and cannot access the
                unconscious directly. Results should be viewed as a "current
                configuration" rather than a fixed identity.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
