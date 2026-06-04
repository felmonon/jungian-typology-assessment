import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { STORAGE_KEYS } from '../lib/validation';

export type PremiumTier = 'free' | 'insight' | 'mastery';

function isPaidTier(value: string | null): value is Exclude<PremiumTier, 'free'> {
  return value === 'insight' || value === 'mastery';
}

function readLocalPaidTier(userId?: string): Exclude<PremiumTier, 'free'> | null {
  const localTier = localStorage.getItem(STORAGE_KEYS.TIER);
  const localUnlocked = localStorage.getItem(STORAGE_KEYS.UNLOCKED) === 'true';
  const localUnlockUserId = localStorage.getItem(STORAGE_KEYS.UNLOCK_USER_ID);
  const checkoutSessionId = localStorage.getItem(STORAGE_KEYS.CHECKOUT_SESSION_ID);

  if (!localUnlocked || !isPaidTier(localTier)) return null;
  if (checkoutSessionId) return localTier;
  if (userId && localUnlockUserId === userId) return localTier;
  return null;
}

export function usePremiumStatus() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [tier, setTier] = useState<PremiumTier>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      const userId = user?.id;
      const localPaidTier = readLocalPaidTier(userId);

      setIsLoading(true);

      if (isAuthenticated && userId) {
        try {
          const response = await fetch('/api/premium-status', { credentials: 'include' });
          const data = await response.json();
          if (data.tier && data.tier !== 'free') {
            setTier(data.tier as PremiumTier);
            localStorage.setItem(STORAGE_KEYS.TIER, data.tier);
            localStorage.setItem(STORAGE_KEYS.UNLOCKED, 'true');
            localStorage.setItem(STORAGE_KEYS.UNLOCK_USER_ID, userId);
          } else if (data.isPremium) {
            const resolvedTier = localPaidTier || 'insight';
            setTier(resolvedTier);
            localStorage.setItem(STORAGE_KEYS.TIER, resolvedTier);
            localStorage.setItem(STORAGE_KEYS.UNLOCKED, 'true');
            localStorage.setItem(STORAGE_KEYS.UNLOCK_USER_ID, userId);
          } else if (localPaidTier) {
            setTier(localPaidTier);
          } else {
            setTier('free');
          }
        } catch (error) {
          console.error('Failed to check premium status:', error);
          setTier(localPaidTier || 'free');
        }
      } else if (!isAuthenticated) {
        setTier(localPaidTier || 'free');
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
