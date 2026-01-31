import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, LogOut, User, Menu, X, Trophy, BookOpen, Shield, History, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import { usePageTracking } from '../../hooks/useAnalytics';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  usePageTracking();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative text-sm font-serif font-medium transition-colors duration-200 py-2 ${
      isActive ? 'text-jung-accent' : 'text-jung-muted hover:text-jung-dark'
    }`;

  const navLinkWithUnderline = ({ isActive }: { isActive: boolean }) =>
    `${navLinkClass({ isActive })} group`;

  return (
    <div className="min-h-screen flex flex-col font-serif text-jung-dark bg-jung-base">
      {/* Header - solid bg on scroll, no blur */}
      <header
        className={`sticky top-0 z-50 bg-jung-base transition-[border-color,box-shadow] duration-200 ${
          scrolled
            ? 'border-b border-jung-border shadow-sm'
            : 'border-b border-transparent'
        }`}
      >
        <div className="editorial-container">
          <div className="flex justify-between h-16 lg:h-20 items-center">
            {/* Typographic Logo - no icon */}
            <Link to="/" className="flex-shrink-0 group">
              <span className="text-display text-xl text-jung-dark">
                Type<span className="text-jung-accent">Jung</span>
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
              <div className="flex items-center gap-3 pl-6 border-l border-jung-border">
                {isLoading ? (
                  <span className="text-sm text-jung-muted">Loading...</span>
                ) : isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-jung-surface-alt transition-colors"
                    >
                      {user?.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="" className="w-9 h-9 rounded-lg border border-jung-border" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-jung-accent-light flex items-center justify-center border border-jung-accent/20">
                          <User className="w-4 h-4 text-jung-accent" />
                        </div>
                      )}
                    </Link>
                    <button
                      onClick={() => logout()}
                      disabled={isLoggingOut}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-serif text-jung-muted hover:text-jung-dark hover:bg-jung-surface-alt rounded-lg transition-all disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />
                      {isLoggingOut ? '...' : 'Logout'}
                    </button>
                  </div>
                ) : (
                  <NavLink
                    to="/auth"
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-serif font-semibold bg-jung-accent text-white rounded-lg shadow-sm hover:bg-jung-accent-hover hover:-translate-y-px transition-all"
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
              className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-jung-dark hover:bg-jung-surface-alt rounded-lg transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 top-16 bg-jung-dark/20 z-40"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className={`lg:hidden overflow-hidden z-50 transition-[max-height,opacity] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileMenuOpen ? 'max-h-[80vh] opacity-100 duration-400' : 'max-h-0 opacity-0 duration-200'
          }`}
        >
          <div className="bg-jung-base border-t border-jung-border overflow-y-auto max-h-[80vh]">
            <div className="editorial-container py-6 space-y-1">
              <NavLink to="/" onClick={closeMobileMenu}
                className={({ isActive }) => `flex items-center justify-between min-h-[44px] py-3 px-4 text-base font-serif font-medium rounded-lg transition-all ${isActive ? 'bg-jung-accent-light text-jung-accent' : 'text-jung-secondary hover:bg-jung-surface-alt active:bg-jung-surface-alt'}`}>
                Assessment
                <ChevronRight className="w-5 h-5 opacity-50" />
              </NavLink>
              <NavLink to="/learn" onClick={closeMobileMenu}
                className={({ isActive }) => `flex items-center justify-between min-h-[44px] py-3 px-4 text-base font-serif font-medium rounded-lg transition-all ${isActive ? 'bg-jung-accent-light text-jung-accent' : 'text-jung-secondary hover:bg-jung-surface-alt active:bg-jung-surface-alt'}`}>
                <span className="flex items-center gap-2"><BookOpen className="w-5 h-5" />Learn the Theory</span>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </NavLink>
              <NavLink to="/about" onClick={closeMobileMenu}
                className={({ isActive }) => `flex items-center justify-between min-h-[44px] py-3 px-4 text-base font-serif font-medium rounded-lg transition-all ${isActive ? 'bg-jung-accent-light text-jung-accent' : 'text-jung-secondary hover:bg-jung-surface-alt active:bg-jung-surface-alt'}`}>
                About
                <ChevronRight className="w-5 h-5 opacity-50" />
              </NavLink>
              <NavLink to="/leaderboard" onClick={closeMobileMenu}
                className={({ isActive }) => `flex items-center justify-between min-h-[44px] py-3 px-4 text-base font-serif font-medium rounded-lg transition-all ${isActive ? 'bg-jung-accent-light text-jung-accent' : 'text-jung-secondary hover:bg-jung-surface-alt active:bg-jung-surface-alt'}`}>
                <span className="flex items-center gap-2"><Trophy className="w-5 h-5" />Leaderboard</span>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </NavLink>
              {user?.isAdmin && (
                <NavLink to="/admin" onClick={closeMobileMenu}
                  className={({ isActive }) => `flex items-center justify-between min-h-[44px] py-3 px-4 text-base font-serif font-medium rounded-lg transition-all ${isActive ? 'bg-jung-accent-light text-jung-accent' : 'text-jung-secondary hover:bg-jung-surface-alt active:bg-jung-surface-alt'}`}>
                  <span className="flex items-center gap-2"><Shield className="w-5 h-5" />Admin</span>
                  <ChevronRight className="w-5 h-5 opacity-50" />
                </NavLink>
              )}
              {isAuthenticated && (
                <NavLink to="/history" onClick={closeMobileMenu}
                  className={({ isActive }) => `flex items-center justify-between min-h-[44px] py-3 px-4 text-base font-serif font-medium rounded-lg transition-all ${isActive ? 'bg-jung-accent-light text-jung-accent' : 'text-jung-secondary hover:bg-jung-surface-alt active:bg-jung-surface-alt'}`}>
                  <span className="flex items-center gap-2"><History className="w-5 h-5" />History</span>
                  <ChevronRight className="w-5 h-5 opacity-50" />
                </NavLink>
              )}

              {/* Mobile Auth */}
              <div className="pt-4 mt-4 border-t border-jung-border">
                {isLoading ? (
                  <span className="block py-3 px-4 text-sm text-jung-muted">Loading...</span>
                ) : isAuthenticated ? (
                  <div className="space-y-3">
                    <Link to="/profile" onClick={closeMobileMenu}
                      className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-jung-surface-alt transition-colors">
                      {user?.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="" className="w-12 h-12 rounded-lg border border-jung-border" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-jung-accent-light flex items-center justify-center border border-jung-accent/20">
                          <User className="w-6 h-6 text-jung-accent" />
                        </div>
                      )}
                      <div>
                        <span className="block text-base font-serif font-medium text-jung-dark">{user?.firstName || 'User'}</span>
                        <span className="block text-sm text-jung-muted">{user?.email}</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => { logout(); closeMobileMenu(); }}
                      disabled={isLoggingOut}
                      className="w-full flex items-center justify-center gap-2 min-h-[44px] py-3.5 px-4 text-base font-serif font-medium bg-jung-surface-alt hover:bg-jung-border active:bg-jung-border text-jung-secondary rounded-lg transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-5 h-5" />
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                ) : (
                  <NavLink to="/auth" onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 w-full min-h-[44px] py-4 px-4 text-base font-serif font-semibold bg-jung-accent text-white rounded-lg shadow-sm active:bg-jung-accent-hover">
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

      {/* Footer - Deep indigo */}
      <footer className="relative bg-jung-dark text-jung-subtle overflow-hidden">
        <div className="editorial-container relative py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <span className="text-display text-xl text-white">
                  Type<span className="text-jung-accent-hover">Jung</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed text-jung-subtle mb-6">
                Discover your true cognitive nature through Jungian depth psychology.
                Not a label—but a mirror for self-reflection.
              </p>
            </div>

            <div>
              <h3 className="text-white font-serif font-semibold text-sm uppercase tracking-wider mb-5">Explore</h3>
              <ul className="space-y-3">
                {['Take Assessment', 'Learn the Theory', 'Pricing', 'Leaderboard'].map((item) => (
                  <li key={item}>
                    <Link
                      to={item === 'Take Assessment' ? '/assessment' : item === 'Learn the Theory' ? '/learn' : `/${item.toLowerCase()}`}
                      className="text-sm text-jung-subtle hover:text-jung-accent-hover transition-colors"
                    >{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-serif font-semibold text-sm uppercase tracking-wider mb-5">Key Concepts</h3>
              <ul className="space-y-3 text-sm text-jung-subtle">
                {['Individuation', 'Differentiation', 'Dominant-Inferior Axis', 'The 8 Function-Attitudes'].map((item) => (
                  <li key={item} className="hover:text-jung-accent-muted transition-colors cursor-default">{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-serif font-semibold text-sm uppercase tracking-wider mb-5">Legal</h3>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="text-sm text-jung-subtle hover:text-jung-accent-hover transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-jung-subtle hover:text-jung-accent-hover transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-jung-muted">
              <p>&copy; {new Date().getFullYear()} TypeJung. All rights reserved.</p>
              <p className="text-center md:text-right max-w-md">
                Based on the typological work of Carl Gustav Jung. Results reflect current configuration, not fixed identity.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
