import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Activity, LogIn, LogOut, User, Menu, X, Trophy, BookOpen, Shield, History } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-800 bg-jung-base selection:bg-jung-accent selection:text-white">
      <header className="sticky top-0 z-50 bg-jung-base/95 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
               <Activity className="h-6 w-6 text-jung-primary" />
               <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-jung-primary">JungianTypology</span>
            </Link>
            <nav className="hidden md:flex space-x-8 items-center">
              <NavLink to="/" className={({isActive}) => `text-sm font-medium hover:text-jung-accent transition-colors ${isActive ? 'text-jung-primary font-bold' : 'text-stone-600'}`}>Assessment</NavLink>
              <NavLink to="/learn" className={({isActive}) => `text-sm font-medium hover:text-jung-accent transition-colors flex items-center gap-1 ${isActive ? 'text-jung-primary font-bold' : 'text-stone-600'}`}><BookOpen className="w-4 h-4" />Learn</NavLink>
              <NavLink to="/about" className={({isActive}) => `text-sm font-medium hover:text-jung-accent transition-colors ${isActive ? 'text-jung-primary font-bold' : 'text-stone-600'}`}>About</NavLink>
              <NavLink to="/leaderboard" className={({isActive}) => `text-sm font-medium hover:text-jung-accent transition-colors flex items-center gap-1 ${isActive ? 'text-jung-primary font-bold' : 'text-stone-600'}`}><Trophy className="w-4 h-4" />Leaderboard</NavLink>
              {user?.isAdmin && (
                <NavLink to="/admin" className={({isActive}) => `text-sm font-medium hover:text-jung-accent transition-colors flex items-center gap-1 ${isActive ? 'text-jung-primary font-bold' : 'text-stone-600'}`}><Shield className="w-4 h-4" />Admin</NavLink>
              )}
              {isAuthenticated && (
                <NavLink to="/history" className={({isActive}) => `text-sm font-medium hover:text-jung-accent transition-colors flex items-center gap-1 ${isActive ? 'text-jung-primary font-bold' : 'text-stone-600'}`}><History className="w-4 h-4" />History</NavLink>
              )}
              
              {isLoading ? (
                <span className="text-sm text-stone-400">Loading...</span>
              ) : isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <User className="w-5 h-5 text-stone-500" />
                    )}
                    <span className="text-sm text-stone-600">{user?.firstName || user?.email || 'User'}</span>
                  </Link>
                  <button
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-stone-200 hover:bg-stone-300 rounded-md transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              ) : (
                <NavLink
                  to="/auth"
                  className="flex items-center gap-1 px-4 py-2 text-sm bg-jung-primary text-white hover:bg-jung-primary/90 rounded-md transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </NavLink>
              )}
            </nav>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-jung-primary hover:bg-stone-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-jung-base">
            <div className="px-4 py-4 space-y-3">
              <NavLink 
                to="/" 
                onClick={closeMobileMenu}
                className={({isActive}) => `block py-3 px-4 text-base font-medium rounded-lg transition-colors ${isActive ? 'bg-jung-primary/10 text-jung-primary font-bold' : 'text-stone-600 hover:bg-stone-100'}`}
              >
                Assessment
              </NavLink>
              <NavLink 
                to="/learn" 
                onClick={closeMobileMenu}
                className={({isActive}) => `flex items-center gap-2 py-3 px-4 text-base font-medium rounded-lg transition-colors ${isActive ? 'bg-jung-primary/10 text-jung-primary font-bold' : 'text-stone-600 hover:bg-stone-100'}`}
              >
                <BookOpen className="w-5 h-5" />
                Learn
              </NavLink>
              <NavLink 
                to="/about" 
                onClick={closeMobileMenu}
                className={({isActive}) => `block py-3 px-4 text-base font-medium rounded-lg transition-colors ${isActive ? 'bg-jung-primary/10 text-jung-primary font-bold' : 'text-stone-600 hover:bg-stone-100'}`}
              >
                About
              </NavLink>
              <NavLink 
                to="/leaderboard" 
                onClick={closeMobileMenu}
                className={({isActive}) => `flex items-center gap-2 py-3 px-4 text-base font-medium rounded-lg transition-colors ${isActive ? 'bg-jung-primary/10 text-jung-primary font-bold' : 'text-stone-600 hover:bg-stone-100'}`}
              >
                <Trophy className="w-5 h-5" />
                Leaderboard
              </NavLink>
              {user?.isAdmin && (
                <NavLink 
                  to="/admin" 
                  onClick={closeMobileMenu}
                  className={({isActive}) => `flex items-center gap-2 py-3 px-4 text-base font-medium rounded-lg transition-colors ${isActive ? 'bg-jung-primary/10 text-jung-primary font-bold' : 'text-stone-600 hover:bg-stone-100'}`}
                >
                  <Shield className="w-5 h-5" />
                  Admin
                </NavLink>
              )}
              {isAuthenticated && (
                <NavLink 
                  to="/history" 
                  onClick={closeMobileMenu}
                  className={({isActive}) => `flex items-center gap-2 py-3 px-4 text-base font-medium rounded-lg transition-colors ${isActive ? 'bg-jung-primary/10 text-jung-primary font-bold' : 'text-stone-600 hover:bg-stone-100'}`}
                >
                  <History className="w-5 h-5" />
                  History
                </NavLink>
              )}
              
              <div className="pt-3 border-t border-stone-200">
                {isLoading ? (
                  <span className="block py-3 px-4 text-sm text-stone-400">Loading...</span>
                ) : isAuthenticated ? (
                  <div className="space-y-3">
                    <Link 
                      to="/profile" 
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-stone-100 transition-colors"
                    >
                      {user?.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-stone-500" />
                        </div>
                      )}
                      <div>
                        <span className="block text-base font-medium text-stone-800">{user?.firstName || 'User'}</span>
                        <span className="block text-sm text-stone-500">{user?.email}</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => { logout(); closeMobileMenu(); }}
                      disabled={isLoggingOut}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 text-base font-medium bg-stone-200 hover:bg-stone-300 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-5 h-5" />
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                ) : (
                  <NavLink
                    to="/auth"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 text-base font-medium bg-jung-primary text-white hover:bg-jung-primary/90 rounded-lg transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    Login / Sign Up
                  </NavLink>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-jung-dark text-stone-400 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div>
            <h3 className="text-stone-100 font-serif text-lg mb-3 md:mb-4">Jungian Typology</h3>
            <p className="text-sm leading-relaxed">
              A tool for self-exploration based on Carl Jung's <i>Psychological Types</i> (1921). 
              Not a diagnostic instrument, but a mirror for reflection.
            </p>
          </div>
          <div>
            <h3 className="text-stone-100 font-serif text-lg mb-3 md:mb-4">Key Concepts</h3>
            <ul className="space-y-2 text-sm">
              <li>Individuation</li>
              <li>Differentiation</li>
              <li>Dominant-Inferior Axis</li>
              <li>The 8 Function-Attitudes</li>
            </ul>
          </div>
          <div>
            <h3 className="text-stone-100 font-serif text-lg mb-3 md:mb-4">Disclaimer</h3>
            <p className="text-xs leading-relaxed">
              This assessment relies on self-reporting and cannot access the unconscious directly. 
              Results should be viewed as a "current configuration" rather than a fixed identity.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-stone-800 text-center text-xs">
          <div className="flex justify-center gap-4 mb-4">
            <Link to="/privacy" className="hover:text-stone-200 transition-colors">Privacy Policy</Link>
            <span className="text-stone-600">|</span>
            <Link to="/terms" className="hover:text-stone-200 transition-colors">Terms of Service</Link>
          </div>
          &copy; {new Date().getFullYear()} Jungian Typology Assessment.
        </div>
      </footer>
    </div>
  );
};
