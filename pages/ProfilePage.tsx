import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Save, Trash2, AlertTriangle, History, Eye, Clock, BarChart3, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { useQueryClient } from '@tanstack/react-query';
import { FUNCTION_DESCRIPTIONS } from '../data/questions';

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
  const { user, isLoading, isAuthenticated } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated, fetchHistory]);

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

      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
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
      const response = await fetch(`/api/results/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setHistoryResults(prev => prev.filter(r => r.id !== id));
        setShowDeleteResultConfirm(null);
      }
    } catch (error) {
      console.error('Failed to delete result:', error);
    } finally {
      setDeletingResultId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-jung-primary" />
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
    <div className="min-h-[60vh] py-8 md:py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-jung-primary">Profile Settings</h1>

        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-5 md:p-8">
          {error && (
            <div className="mb-5 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 md:mb-6 p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          <div className="mb-6 md:mb-8 flex flex-col items-center">
            <div className="relative mb-4">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-jung-accent/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-stone-200 flex items-center justify-center border-4 border-jung-accent/20">
                  <User className="w-10 h-10 text-stone-400" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-10 h-10 md:w-8 md:h-8 bg-jung-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-jung-primary/90 transition-colors">
                <Camera className="w-5 h-5 md:w-4 md:h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-stone-500">Tap camera icon to upload (max 500KB)</p>
          </div>

          <div className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 text-base border border-stone-300 rounded-lg bg-stone-50 text-stone-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-stone-400">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-stone-300 rounded-lg focus:ring-2 focus:ring-jung-accent focus:border-transparent outline-none transition-all"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-stone-300 rounded-lg focus:ring-2 focus:ring-jung-accent focus:border-transparent outline-none transition-all"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3 min-h-[48px] bg-jung-primary text-white font-medium rounded-lg hover:bg-jung-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-stone-200">
            <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </h2>
            <p className="text-sm text-stone-600 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full sm:w-auto px-4 py-3 min-h-[48px] border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center sm:justify-start gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete Account
              </button>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 mb-4 font-medium">
                  Are you sure you want to delete your account? This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full sm:w-auto px-4 py-3 min-h-[48px] bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="w-full sm:w-auto px-4 py-3 min-h-[48px] bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-5 md:p-8">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-jung-primary mb-6 flex items-center gap-2">
            <History className="w-6 h-6" />
            Assessment History
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <div className="flex items-center gap-2 text-stone-500 mb-1">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Total Assessments</span>
              </div>
              <p className="text-2xl font-bold text-jung-primary">{totalAssessments}</p>
            </div>

            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <div className="flex items-center gap-2 text-stone-500 mb-1">
                <Eye className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Recent Dominant</span>
              </div>
              <p className="text-lg font-bold text-jung-primary truncate">
                {mostRecentResult ? mostRecentResult.stack.dominant.function : '—'}
              </p>
              {mostRecentResult && (
                <p className="text-xs text-stone-500 truncate">
                  {FUNCTION_DESCRIPTIONS[mostRecentResult.stack.dominant.function]?.title || ''}
                </p>
              )}
            </div>

            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <div className="flex items-center gap-2 text-stone-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Member Since</span>
              </div>
              <p className="text-lg font-bold text-jung-primary">
                {accountCreatedDate || '—'}
              </p>
            </div>
          </div>

          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-jung-primary" />
            </div>
          ) : historyResults.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No assessments yet</p>
              <p className="text-sm mt-1">Take your first assessment to see your results here.</p>
              <button
                onClick={() => navigate('/assessment')}
                className="mt-4 px-6 py-3 min-h-[48px] bg-jung-accent text-white font-medium rounded-lg hover:bg-jung-accent/90 transition-colors"
              >
                Start Assessment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {historyResults.map((result) => (
                <div
                  key={result.id}
                  className="border border-stone-200 rounded-xl p-4 hover:border-jung-accent/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-jung-primary truncate">
                        {getDominantFunctionDisplay(result)}
                      </p>
                      <p className="text-sm text-stone-500">
                        {formatDate(result.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {showDeleteResultConfirm === result.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteResult(result.id)}
                            disabled={deletingResultId === result.id}
                            className="px-3 py-2 min-h-[44px] bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
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
                            className="px-3 py-2 min-h-[44px] bg-stone-200 text-stone-700 text-sm font-medium rounded-lg hover:bg-stone-300 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleViewResult(result)}
                            className="px-4 py-2 min-h-[44px] bg-jung-accent text-white text-sm font-medium rounded-lg hover:bg-jung-accent/90 transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View Results
                          </button>
                          <button
                            onClick={() => setShowDeleteResultConfirm(result.id)}
                            className="p-2 min-w-[44px] min-h-[44px] text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                            title="Delete result"
                          >
                            <Trash2 className="w-5 h-5" />
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
