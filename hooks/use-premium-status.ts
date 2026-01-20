import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

export type PremiumTier = 'free' | 'insight' | 'mastery';

export function usePremiumStatus() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [tier, setTier] = useState<PremiumTier>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      const userId = user?.id;
      
      const localTier = localStorage.getItem('jungian_assessment_tier') as PremiumTier | null;
      const localUnlocked = localStorage.getItem('jungian_assessment_unlocked') === 'true';
      const localUnlockUserId = localStorage.getItem('jungian_assessment_unlock_user_id');
      const unlockDate = localStorage.getItem('jungian_assessment_unlock_date');
      
      const isLocalUnlockForCurrentUser = (localTier || localUnlocked) && localUnlockUserId === userId;

      if (isAuthenticated && userId) {
        try {
          const response = await fetch('/api/premium-status', { credentials: 'include' });
          const data = await response.json();
          if (data.tier && data.tier !== 'free') {
            setTier(data.tier as PremiumTier);
            localStorage.setItem('jungian_assessment_tier', data.tier);
            localStorage.setItem('jungian_assessment_unlocked', 'true');
            localStorage.setItem('jungian_assessment_unlock_user_id', userId);
          } else if (data.isPremium) {
            const resolvedTier = localTier || 'insight';
            setTier(resolvedTier);
            localStorage.setItem('jungian_assessment_tier', resolvedTier);
            localStorage.setItem('jungian_assessment_unlocked', 'true');
            localStorage.setItem('jungian_assessment_unlock_user_id', userId);
          } else {
            if (unlockDate && isLocalUnlockForCurrentUser) {
              const hoursSinceUnlock = (Date.now() - new Date(unlockDate).getTime()) / (1000 * 60 * 60);
              if (hoursSinceUnlock < 24) {
                const resolvedTier = localTier || 'insight';
                setTier(resolvedTier);
              } else {
                setTier('free');
                localStorage.removeItem('jungian_assessment_tier');
                localStorage.removeItem('jungian_assessment_unlocked');
                localStorage.removeItem('jungian_assessment_unlock_user_id');
                localStorage.removeItem('jungian_assessment_unlock_date');
              }
            } else {
              setTier('free');
            }
          }
        } catch (error) {
          console.error('Failed to check premium status:', error);
          if (isLocalUnlockForCurrentUser) {
            const resolvedTier = localTier || 'insight';
            setTier(resolvedTier);
          }
        }
      } else if (!isAuthenticated) {
        if (localUnlocked && !localUnlockUserId) {
          const resolvedTier = localTier || 'insight';
          setTier(resolvedTier);
        } else {
          setTier('free');
        }
      }
      setIsLoading(false);
    }

    if (!authLoading) {
      checkStatus();
    }
  }, [isAuthenticated, authLoading, user?.id]);

  const isPremium = tier !== 'free';

  return { tier, isPremium, isLoading };
}
