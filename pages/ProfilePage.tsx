import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Camera,
  Clock,
  Download,
  Eye,
  History,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { useQueryClient } from '@tanstack/react-query';
import { FUNCTION_DESCRIPTIONS } from '../data/questions';
import { clearAuthScopedClientState } from '../lib/auth-client-state';

interface SavedResult {
  id: string;
  scores: any[];
  stack: {
    dominant: { function: string };
    auxiliary: { function: string };
    tertiary: { function: string };
    inferior: { function: string };
  };
  attitudeScore: string;
  isUndifferentiated: string;
  shareSlug: string | null;
  createdAt: string;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isLoading, isAuthenticated, logout, isLoggingOut } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [providers, setProviders] = useState({ google: false, apple: false });

  const [historyResults, setHistoryResults] = useState<SavedResult[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [deletingResultId, setDeletingResultId] = useState<string | null>(null);
  const [showDeleteResultConfirm, setShowDeleteResultConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setProfileImageUrl(user.profileImageUrl || '');
    }
  }, [user]);

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/results', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setHistoryResults(data);
      }
    } catch (_err) {
      // Silently handle fetch failure - user will see empty history
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated, fetchHistory]);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/auth/providers')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!cancelled && data) {
          setProviders({
            google: Boolean(data.google),
            apple: Boolean(data.apple),
          });
        }
      })
      .catch(() => {
        if (!cancelled) setProviders({ google: false, apple: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setError('Image must be less than 500KB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setProfileImageUrl(result);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ firstName, lastName, profileImageUrl }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Failed to update profile' }));
        throw new Error(data.message);
      }

      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Failed to delete account' }));
        throw new Error(data.message);
      }

      clearAuthScopedClientState();
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.clear();
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateValue: string | Date) => {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDominantFunctionDisplay = (result: SavedResult) => {
    const funcKey = result.stack.dominant.function;
    const funcInfo = FUNCTION_DESCRIPTIONS[funcKey];
    return funcInfo ? `${funcKey} - ${funcInfo.title}` : funcKey;
  };

  const handleClearLocalData = () => {
    clearAuthScopedClientState();
    setSuccess('Local TypeJung data has been cleared from this browser. Your saved account history is still available.');
    setError(null);
  };

  const handleDownloadProfileData = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      account: {
        id: user?.id,
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        createdAt: user?.createdAt,
      },
      assessmentHistory: historyResults,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `typejung-account-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleViewResult = (result: SavedResult) => {
    localStorage.setItem('jungian_assessment_results', JSON.stringify({
      scores: result.scores,
      stack: result.stack,
      dominant: result.stack.dominant,
      inferior: result.stack.inferior,
      attitudeScore: parseFloat(result.attitudeScore),
      isUndifferentiated: result.isUndifferentiated === 'true',
      differentiation: 0,
    }));
    localStorage.setItem('jungian_assessment_share_slug', result.shareSlug || '');
    navigate('/results');
  };

  const handleDeleteResult = async (id: string) => {
    setDeletingResultId(id);
    try {
      const response = await fetch(`/api/results?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setHistoryResults(prev => prev.filter(r => r.id !== id));
        setShowDeleteResultConfirm(null);
      }
    } catch (_err) {
      // Silently handle delete failure
    } finally {
      setDeletingResultId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-jung-base">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-jung-accent" />
          <p className="text-body text-jung-muted">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalAssessments = historyResults.length;
  const mostRecentResult = historyResults[0];
  const accountCreatedDate = user?.createdAt ? formatDate(user.createdAt) : null;

  return (
    <div className="min-h-[60vh] py-10 md:py-16 px-4 bg-jung-base">
      <div className="editorial-container space-y-6 md:space-y-8">
        {/* Page Header */}
        <div className="mx-auto max-w-3xl text-center mb-6 md:mb-8">
          <h1 className="text-display text-2xl sm:text-3xl md:text-4xl mb-2">Profile Settings</h1>
          <p className="text-body text-jung-muted text-sm sm:text-base">
            Manage sign-in, saved history, local device data, and account deletion from one place.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-error/20 bg-error-light p-4 text-sm text-error flex items-start gap-2" role="alert">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-success/20 bg-success-light p-4 text-sm text-success" role="status">
            {success}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="card-elevated p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-jung-accent-light text-jung-accent">
              <Mail className="h-5 w-5" />
            </div>
            <p className="text-label">Signed in as</p>
            <p className="mt-2 truncate text-sm font-semibold text-jung-dark">{user?.email}</p>
          </div>
          <div className="card-elevated p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-jung-accent-light text-jung-accent">
              <BarChart3 className="h-5 w-5" />
            </div>
            <p className="text-label">Saved results</p>
            <p className="mt-2 text-2xl font-semibold text-jung-dark">{totalAssessments}</p>
          </div>
          <div className="card-elevated p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-jung-accent-light text-jung-accent">
              <Clock className="h-5 w-5" />
            </div>
            <p className="text-label">Member since</p>
            <p className="mt-2 text-sm font-semibold text-jung-dark">{accountCreatedDate || '—'}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1fr]">
          <section className="card-elevated p-5 sm:p-6 md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-label">Authentication</p>
                <h2 className="mt-2 text-heading text-2xl">Login and session</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-jung-accent-light text-jung-accent">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-jung-border bg-jung-base p-4">
                <div className="flex items-center gap-3">
                  <KeyRound className="h-4 w-4 text-jung-accent" />
                  <div>
                    <p className="text-sm font-semibold text-jung-dark">Email and password</p>
                    <p className="text-xs text-jung-muted">Available for every account</p>
                  </div>
                </div>
                <span className="rounded-full bg-jung-accent-light px-3 py-1 text-xs font-semibold text-jung-accent">Active</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-jung-border bg-jung-base p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-4 w-4 items-center justify-center text-xs font-bold text-jung-accent">G</span>
                  <div>
                    <p className="text-sm font-semibold text-jung-dark">Google sign-in</p>
                    <p className="text-xs text-jung-muted">Uses Google OAuth when configured</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${providers.google ? 'bg-jung-accent-light text-jung-accent' : 'bg-jung-surface-alt text-jung-secondary'}`}>
                  {providers.google ? 'Enabled' : 'Unavailable'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-jung-border bg-jung-base p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-jung-accent text-[10px] font-bold text-jung-accent">A</span>
                  <div>
                    <p className="text-sm font-semibold text-jung-dark">Apple sign-in</p>
                    <p className="text-xs text-jung-muted">Appears on login once enabled for production</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${providers.apple ? 'bg-jung-accent-light text-jung-accent' : 'bg-jung-surface-alt text-jung-secondary'}`}>
                  {providers.apple ? 'Enabled' : 'Optional'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-jung-border bg-jung-surface px-4 text-sm font-semibold text-jung-dark transition-colors hover:bg-jung-surface-alt disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? 'Signing out' : 'Sign out and clear this browser'}
            </button>
          </section>

          <section className="card-elevated p-5 sm:p-6 md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-label">Privacy</p>
                <h2 className="mt-2 text-heading text-2xl">Data retention</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-jung-accent-light text-jung-accent">
                <RotateCcw className="h-5 w-5" />
              </div>
            </div>

            <div className="grid gap-3 text-sm">
              <div className="rounded-lg border border-jung-border bg-jung-base p-4">
                <p className="font-semibold text-jung-dark">Saved assessment history</p>
                <p className="mt-1 leading-6 text-jung-muted">Kept in your account until you delete individual results or delete the account.</p>
              </div>
              <div className="rounded-lg border border-jung-border bg-jung-base p-4">
                <p className="font-semibold text-jung-dark">Local browser data</p>
                <p className="mt-1 leading-6 text-jung-muted">Current result, premium cache, lifecycle and discount email markers, and progress are cleared on logout.</p>
              </div>
              <div className="rounded-lg border border-jung-border bg-jung-base p-4">
                <p className="font-semibold text-jung-dark">Session retention</p>
                <p className="mt-1 leading-6 text-jung-muted">Secure sessions expire after 30 days or immediately when you sign out.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleDownloadProfileData}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-jung-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-jung-accent-hover"
              >
                <Download className="h-4 w-4" />
                Download data
              </button>
              <button
                type="button"
                onClick={handleClearLocalData}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-jung-border px-4 text-sm font-semibold text-jung-dark transition-colors hover:bg-jung-surface-alt"
              >
                <RotateCcw className="h-4 w-4" />
                Clear local data
              </button>
            </div>
          </section>
        </div>

        {/* Profile Card */}
        <div className="card-elevated p-5 sm:p-6 md:p-8">
          <div className="mb-8">
            <p className="text-label">Profile</p>
            <h2 className="mt-2 text-heading text-2xl">Account details</h2>
          </div>

          {/* Profile Image */}
          <div className="mb-8 flex flex-col items-center">
            <div className="relative mb-4">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-jung-accent/20 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-jung-surface-alt flex items-center justify-center border-4 border-jung-accent/20 shadow-lg">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-jung-muted" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-9 h-9 sm:w-10 sm:h-10 bg-jung-accent rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-jung-accent-hover hover:scale-105 transition-all duration-200">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-jung-muted">Tap camera icon to upload (max 500KB)</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-ui text-sm font-medium text-jung-dark mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 text-body bg-jung-surface-alt border border-jung-border rounded-lg text-jung-muted cursor-not-allowed"
              />
              <p className="mt-1.5 text-xs text-jung-muted">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-ui text-sm font-medium text-jung-dark mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 text-body text-jung-dark bg-jung-surface border border-jung-border rounded-lg focus:ring-2 focus:ring-jung-accent focus:border-transparent outline-none transition-all duration-200 placeholder:text-jung-muted/60"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-ui text-sm font-medium text-jung-dark mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 text-body text-jung-dark bg-jung-surface border border-jung-border rounded-lg focus:ring-2 focus:ring-jung-accent focus:border-transparent outline-none transition-all duration-200 placeholder:text-jung-muted/60"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3.5 min-h-[48px] bg-jung-accent text-white text-ui font-semibold rounded-lg shadow-md shadow-jung-accent/20 hover:bg-jung-accent-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Danger Zone */}
          <div className="mt-10 pt-6 border-t border-jung-border">
            <h2 className="text-heading text-base font-semibold text-error mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </h2>
            <p className="text-body text-sm text-jung-muted mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] border border-error/30 text-error rounded-lg hover:bg-error-light transition-colors flex items-center justify-center sm:justify-start gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            ) : (
              <div className="p-4 bg-error-light border border-error/20 rounded-lg">
                <p className="text-sm text-error mb-4 font-medium">
                  Are you sure you want to delete your account? This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] bg-error text-white rounded-lg hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] bg-jung-surface text-jung-dark rounded-lg border border-jung-border hover:bg-jung-surface-alt transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assessment History Card */}
        <div className="card-elevated p-5 sm:p-6 md:p-8">
          <h2 className="text-heading text-lg sm:text-xl md:text-2xl mb-5 md:mb-6 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-jung-accent/10 flex items-center justify-center shrink-0">
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-jung-accent" />
            </div>
            Assessment History
          </h2>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 md:mb-8">
            <div className="bg-jung-surface-alt rounded-lg p-4 border border-jung-border-light">
              <div className="flex items-center gap-2 text-jung-muted mb-1.5">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Total Assessments</span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-jung-accent">{totalAssessments}</p>
            </div>

            <div className="bg-jung-surface-alt rounded-lg p-4 border border-jung-border-light">
              <div className="flex items-center gap-2 text-jung-muted mb-1.5">
                <Eye className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Recent Dominant</span>
              </div>
              <p className="text-lg sm:text-xl font-serif font-bold text-jung-accent truncate">
                {mostRecentResult ? mostRecentResult.stack.dominant.function : '—'}
              </p>
              {mostRecentResult && (
                <p className="text-xs text-jung-muted truncate mt-1">
                  {FUNCTION_DESCRIPTIONS[mostRecentResult.stack.dominant.function]?.title || ''}
                </p>
              )}
            </div>

            <div className="bg-jung-surface-alt rounded-lg p-4 border border-jung-border-light">
              <div className="flex items-center gap-2 text-jung-muted mb-1.5">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Member Since</span>
              </div>
              <p className="text-lg sm:text-xl font-serif font-bold text-jung-accent">
                {accountCreatedDate || '—'}
              </p>
            </div>
          </div>

          {/* Results List */}
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-12 sm:py-16">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-jung-accent" />
                <p className="text-body text-jung-muted">Loading history...</p>
              </div>
            </div>
          ) : historyResults.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-jung-surface-alt flex items-center justify-center mx-auto mb-4">
                <History className="w-7 h-7 sm:w-8 sm:h-8 text-jung-muted/50" />
              </div>
              <p className="text-body font-medium text-jung-dark mb-2">No assessments yet</p>
              <p className="text-sm text-jung-muted mb-6">Take your first assessment to see your results here.</p>
              <button
                onClick={() => navigate('/assessment')}
                className="px-6 py-3 min-h-[44px] bg-jung-accent text-white text-ui font-semibold rounded-lg shadow-md shadow-jung-accent/20 hover:bg-jung-accent-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                Start Assessment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {historyResults.map((result) => (
                <div
                  key={result.id}
                  className="border border-jung-border rounded-lg p-4 bg-jung-surface hover:border-jung-accent/30 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-ui font-semibold text-jung-dark truncate text-sm sm:text-base">
                        {getDominantFunctionDisplay(result)}
                      </p>
                      <p className="text-xs sm:text-sm text-jung-muted mt-1">
                        {formatDate(result.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {showDeleteResultConfirm === result.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteResult(result.id)}
                            disabled={deletingResultId === result.id}
                            className="px-3 sm:px-4 py-2 min-h-[40px] bg-error text-white text-sm font-medium rounded-lg hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {deletingResultId === result.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                Confirm
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setShowDeleteResultConfirm(null)}
                            disabled={deletingResultId === result.id}
                            className="px-3 sm:px-4 py-2 min-h-[40px] bg-jung-surface text-jung-dark text-sm font-medium rounded-lg border border-jung-border hover:bg-jung-surface-alt transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleViewResult(result)}
                            className="px-3 sm:px-4 py-2 min-h-[40px] bg-jung-accent text-white text-sm font-medium rounded-lg hover:bg-jung-accent-hover hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-1.5"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">View Results</span>
                            <span className="sm:hidden">View</span>
                          </button>
                          <button
                            onClick={() => setShowDeleteResultConfirm(result.id)}
                            className="p-2 min-w-[40px] min-h-[40px] text-jung-muted hover:text-error hover:bg-error-light rounded-lg transition-colors flex items-center justify-center"
                            title="Delete result"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
