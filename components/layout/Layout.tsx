import {
  ArrowRight,
  Clock,
  LogOut,
  Menu,
  Trophy,
  User,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import { usePageTracking } from '../../hooks/useAnalytics';
import { trackEvent } from '../../lib/analytics';
import {
  dismissAssessmentResumePrompt,
  hasSavedAssessmentResult,
  readResumableAssessmentProgress,
  type ResumableAssessmentProgress,
} from '../../lib/assessment-progress';
import {
  clearPendingCheckout,
  pendingCheckoutName,
  pendingCheckoutPriceLabel,
  pendingCheckoutRestartPath,
  readPendingCheckout,
  type PendingCheckout,
} from '../../lib/pending-checkout';
import { ReflectionGlyph, TypeJungLogo, Wordmark } from '../brand/TypeJungMark';

const navigation = [
  { to: '/methodology', label: 'How it works' },
  { to: '/sample-report', label: 'Sample report' },
  { to: '/pricing', label: 'Pricing' },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isFocusedJourney =
    location.pathname === '/assessment' ||
    location.pathname.startsWith('/checkout') ||
    location.pathname === '/success';
  const { user, isLoading, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pendingCheckout, setPendingCheckout] =
    useState<PendingCheckout | null>(null);
  const [assessmentProgress, setAssessmentProgress] =
    useState<ResumableAssessmentProgress | null>(null);
  const [hasResult, setHasResult] = useState(false);

  usePageTracking();

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMobileMenuOpen(false);
      document.getElementById('site-menu-toggle')?.focus();
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const refreshRecoveryPrompts = () => {
    setPendingCheckout(readPendingCheckout());
    setAssessmentProgress(readResumableAssessmentProgress());
    setHasResult(hasSavedAssessmentResult());
  };

  useEffect(() => {
    setMobileMenuOpen(false);
    refreshRecoveryPrompts();
  }, [location.pathname]);

  useEffect(() => {
    refreshRecoveryPrompts();

    const refreshOnReturn = () => refreshRecoveryPrompts();

    window.addEventListener('focus', refreshOnReturn);
    window.addEventListener('pageshow', refreshOnReturn);
    window.addEventListener('storage', refreshOnReturn);
    window.addEventListener(
      'typejung:pending-checkout-changed',
      refreshOnReturn,
    );

    return () => {
      window.removeEventListener('focus', refreshOnReturn);
      window.removeEventListener('pageshow', refreshOnReturn);
      window.removeEventListener('storage', refreshOnReturn);
      window.removeEventListener(
        'typejung:pending-checkout-changed',
        refreshOnReturn,
      );
    };
  }, []);

  const shouldShowPendingCheckout = Boolean(
    pendingCheckout &&
      !isFocusedJourney &&
      !location.pathname.startsWith('/checkout') &&
      location.pathname !== '/success',
  );
  const shouldShowAssessmentResume = Boolean(
    assessmentProgress &&
      !shouldShowPendingCheckout &&
      !location.pathname.startsWith('/assessment') &&
      !location.pathname.startsWith('/checkout') &&
      location.pathname !== '/results' &&
      location.pathname !== '/success',
  );
  const pendingCheckoutViewKey = useMemo(() => {
    if (!pendingCheckout || !shouldShowPendingCheckout) return null;
    return [
      'typejung_pending_checkout_banner_viewed',
      pendingCheckout.tier,
      pendingCheckout.status,
      pendingCheckout.sessionId || pendingCheckout.createdAt,
    ].join('_');
  }, [pendingCheckout, shouldShowPendingCheckout]);
  const pendingCheckoutEventParams = useMemo(() => {
    if (!pendingCheckout) return null;

    return {
      tier: pendingCheckout.tier,
      status: pendingCheckout.status,
      source: 'global_recovery_banner',
      original_checkout_source: pendingCheckout.source,
      ...(pendingCheckout.utmCampaign
        ? { utm_campaign: pendingCheckout.utmCampaign }
        : {}),
      ...(pendingCheckout.utmSource
        ? { utm_source: pendingCheckout.utmSource }
        : {}),
      ...(pendingCheckout.sharedResult
        ? { shared_result: pendingCheckout.sharedResult }
        : {}),
      parent_source: pendingCheckout.parentSource || pendingCheckout.source,
    };
  }, [pendingCheckout]);

  useEffect(() => {
    if (
      !pendingCheckout ||
      !shouldShowPendingCheckout ||
      !pendingCheckoutViewKey
    )
      return;

    try {
      if (sessionStorage.getItem(pendingCheckoutViewKey)) return;
      sessionStorage.setItem(pendingCheckoutViewKey, 'true');
    } catch {
      // If sessionStorage is unavailable, still send the first visible render.
    }

    trackEvent('pending_checkout_banner_viewed', {
      ...(pendingCheckoutEventParams || {}),
    });
  }, [
    pendingCheckout,
    pendingCheckoutEventParams,
    pendingCheckoutViewKey,
    shouldShowPendingCheckout,
  ]);

  const resumePendingCheckout = () => {
    if (!pendingCheckout) return;

    if (pendingCheckout.status === 'expired') {
      trackEvent('pending_checkout_restart_clicked', {
        ...(pendingCheckoutEventParams || {}),
      });
      const restartPath = pendingCheckoutRestartPath(pendingCheckout);
      clearPendingCheckout();
      setPendingCheckout(null);
      navigate(restartPath);
      return;
    }

    trackEvent('pending_checkout_resume_clicked', {
      ...(pendingCheckoutEventParams || {}),
    });
    window.location.href = pendingCheckout.url;
  };

  const dismissPendingCheckout = () => {
    if (pendingCheckout) {
      trackEvent('pending_checkout_dismissed', {
        ...(pendingCheckoutEventParams || {}),
      });
    }
    clearPendingCheckout();
    setPendingCheckout(null);
  };

  const resumeAssessment = () => {
    if (!assessmentProgress) return;

    trackEvent('assessment_resume_clicked', {
      source: 'global_resume_banner',
      progress_percent: assessmentProgress.progressPercent,
      answered_count: assessmentProgress.answeredCount,
    });
    navigate('/assessment?source=global_resume_banner');
  };

  const dismissAssessmentResume = () => {
    if (assessmentProgress) {
      trackEvent('assessment_resume_dismissed', {
        source: 'global_resume_banner',
        progress_percent: assessmentProgress.progressPercent,
        answered_count: assessmentProgress.answeredCount,
      });
    }
    dismissAssessmentResumePrompt();
    setAssessmentProgress(null);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `site-nav-link${isActive ? ' is-active' : ''}`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `site-menu-link${isActive ? ' is-active' : ''}`;

  const primaryTo = hasResult ? '/results' : '/assessment';

  const accountAction = isAuthenticated ? (
    <div className="hidden items-center gap-1 lg:flex">
      <Link to="/profile" className="site-account">
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <User className="h-4 w-4" aria-hidden="true" />
        )}
        <span className="max-w-24 truncate">
          {user?.firstName || 'Profile'}
        </span>
      </Link>
      <button
        type="button"
        onClick={() => logout()}
        disabled={isLoggingOut}
        className="site-icon-button"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  ) : (
    <Link to="/auth" className="site-nav-link hidden lg:inline-flex">
      Sign in
    </Link>
  );

  if (isFocusedJourney) {
    return (
      <div className="min-h-screen bg-jung-base text-jung-dark">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <header className="site-header is-focused">
          <div className="wrap site-header-row">
            <Link to="/" aria-label="TypeJung home" className="site-logo">
              <TypeJungLogo />
            </Link>
            <Link
              to={location.pathname !== '/assessment' && hasResult ? '/results' : '/'}
              className="site-exit"
            >
              {location.pathname === '/assessment'
                ? 'Save & exit'
                : hasResult
                  ? 'Back to my map'
                  : 'Back to home'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </header>
        <main id="main-content">{children}</main>
        <footer className="wrap site-footer-slim">
          <span>TypeJung · Educational self-reflection, not diagnosis</span>
          <div>
            <Link to="/privacy">Privacy</Link>
            <a href="mailto:support@typejung.com">Support</a>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-jung-base text-jung-dark">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="wrap site-header-row">
          <Link to="/" className="site-logo" aria-label="TypeJung home">
            <TypeJungLogo />
          </Link>

          <nav className="site-nav" aria-label="Main">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-actions">
            {isLoading ? (
              <span className="hidden h-10 w-20 lg:block" aria-hidden="true" />
            ) : (
              accountAction
            )}
            {location.pathname !== '/results' && (
              <Link to={primaryTo} className="site-cta">
                {hasResult ? 'My map' : 'Start free'}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="site-icon-button lg:hidden"
              aria-expanded={mobileMenuOpen}
              id="site-menu-toggle"
              aria-controls="site-mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div id="site-mobile-menu" className="site-menu lg:hidden">
            <nav className="wrap" aria-label="Menu">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={mobileNavLinkClass}
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink to="/learn" className={mobileNavLinkClass}>
                Learn the theory
              </NavLink>
              {isAuthenticated && (
                <>
                  <NavLink to="/profile" className={mobileNavLinkClass}>
                    <User className="h-4 w-4" aria-hidden="true" />
                    Profile settings
                  </NavLink>
                  <NavLink to="/history" className={mobileNavLinkClass}>
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    History
                  </NavLink>
                  <NavLink to="/leaderboard" className={mobileNavLinkClass}>
                    <Trophy className="h-4 w-4" aria-hidden="true" />
                    Results data
                  </NavLink>
                </>
              )}
              <div className="site-menu-actions">
                <Link to={primaryTo} className="site-menu-primary">
                  {hasResult ? 'Open my map' : 'Start free assessment'}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                    className="site-menu-secondary"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign out
                  </button>
                ) : (
                  <Link to="/auth" className="site-menu-secondary">
                    Sign in
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {shouldShowPendingCheckout && pendingCheckout && (
        <section className="site-notice" aria-label="Open checkout">
          <div className="wrap site-notice-row">
            <div className="min-w-0">
              <p className="site-notice-title">
                {pendingCheckout.status === 'expired'
                  ? `Your ${pendingCheckoutName(pendingCheckout.tier)} checkout expired.`
                  : `Your ${pendingCheckoutName(pendingCheckout.tier)} checkout is still open.`}
              </p>
              <p className="site-notice-body">
                {pendingCheckout.status === 'expired'
                  ? `Start a fresh secure Stripe step for ${pendingCheckoutPriceLabel(pendingCheckout.tier)}. No subscription.`
                  : `Resume the secure Stripe step for ${pendingCheckoutPriceLabel(pendingCheckout.tier)}. No subscription.`}
              </p>
            </div>
            <div className="site-notice-actions">
              <button
                type="button"
                onClick={resumePendingCheckout}
                className="site-notice-primary"
              >
                {pendingCheckout.status === 'expired'
                  ? 'Restart checkout'
                  : 'Resume payment'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={dismissPendingCheckout}
                className="site-icon-button"
                aria-label="Dismiss pending checkout"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      )}

      {shouldShowAssessmentResume && assessmentProgress && (
        <section className="site-notice" aria-label="Unfinished assessment">
          <div className="wrap site-notice-row">
            <div className="min-w-0">
              <p className="site-notice-title">
                Your free assessment is {assessmentProgress.progressPercent}%
                complete.
              </p>
              <p className="site-notice-body">
                Resume from {assessmentProgress.answeredCount} of{' '}
                {assessmentProgress.totalQuestions} answered questions and
                finish the map before deciding on any upgrade.
              </p>
            </div>
            <div className="site-notice-actions">
              <button
                type="button"
                onClick={resumeAssessment}
                className="site-notice-primary"
              >
                Resume assessment
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={dismissAssessmentResume}
                className="site-icon-button"
                aria-label="Dismiss assessment reminder"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      )}

      <main id="main-content">{children}</main>

      <footer className="site-footer">
        <div className="wrap">
          <div className="site-footer-grid">
            <div className="site-footer-brand">
              <p className="site-footer-line">
                The pattern beneath your type, free before you buy anything.
              </p>
              <p className="site-footer-small">
                TypeJung is a tool for educational self-reflection. It is not a
                clinical assessment and does not diagnose anything.
              </p>
              <a href="mailto:support@typejung.com" className="site-footer-mail">
                support@typejung.com
              </a>
            </div>
            <nav aria-label="Explore TypeJung" className="site-footer-links">
              {[
                ['/assessment', 'Free assessment'],
                ['/sample-report', 'Sample report'],
                ['/pricing', 'Pricing'],
                ['/methodology', 'How it works'],
                ['/learn', 'Learn the theory'],
                ['/debrief', 'Personal debrief'],
              ].map(([to, label]) => (
                <Link key={to} to={to}>
                  {label}
                </Link>
              ))}
            </nav>
            <nav aria-label="Help and resources" className="site-footer-links">
              {[
                ['/about', 'About TypeJung'],
                ['/auth', 'Account'],
                ['/privacy', 'Privacy'],
                ['/terms', 'Terms'],
              ].map(([to, label]) => (
                <Link key={to} to={to}>
                  {label}
                </Link>
              ))}
              <a href="/guides">All guides</a>
              <a
                href="https://github.com/felmonon/jungian-typology-assessment"
                target="_blank"
                rel="noopener noreferrer"
              >
                View source
              </a>
            </nav>
          </div>
        </div>
        <div className="site-footer-mark" aria-hidden="true">
          <div className="wrap site-footer-mark-row">
            <ReflectionGlyph tone="dark" className="site-footer-glyph" />
            <Wordmark className="site-footer-word" />
          </div>
        </div>
        <div className="wrap site-footer-legal">
          <span>© {new Date().getFullYear()} TypeJung</span>
          <span>Made for curiosity and reflection.</span>
        </div>
      </footer>
    </div>
  );
};
