import { useCallback, useState, useEffect } from 'react';
import {
  assessmentProgressSchema,
  assessmentResultsSchema,
  safeParseLocalStorage,
  safeSetLocalStorage,
  safeRemoveLocalStorage,
  STORAGE_KEYS,
  ValidatedAssessmentProgress,
  ValidatedAssessmentResults,
} from '../lib/validation';

interface UseAssessmentProgressReturn {
  progress: ValidatedAssessmentProgress | null;
  saveProgress: (answers: Record<string, number>, currentStep: number) => boolean;
  clearProgress: () => boolean;
  isLoaded: boolean;
}

export function useAssessmentProgress(): UseAssessmentProgressReturn {
  const [progress, setProgress] = useState<ValidatedAssessmentProgress | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = safeParseLocalStorage(
      STORAGE_KEYS.PROGRESS,
      assessmentProgressSchema,
      null
    );
    setProgress(saved);
    setIsLoaded(true);
  }, []);

  const saveProgress = useCallback((answers: Record<string, number>, currentStep: number): boolean => {
    const data: ValidatedAssessmentProgress = { answers, currentStep };
    const success = safeSetLocalStorage(STORAGE_KEYS.PROGRESS, data);
    if (success) {
      setProgress(data);
    }
    return success;
  }, []);

  const clearProgress = useCallback((): boolean => {
    const success = safeRemoveLocalStorage(STORAGE_KEYS.PROGRESS);
    if (success) {
      setProgress(null);
    }
    return success;
  }, []);

  return {
    progress,
    saveProgress,
    clearProgress,
    isLoaded,
  };
}

interface UseAssessmentResultsReturn {
  results: ValidatedAssessmentResults | null;
  saveResults: (results: ValidatedAssessmentResults) => boolean;
  clearResults: () => boolean;
  isLoaded: boolean;
}

export function useAssessmentResults(): UseAssessmentResultsReturn {
  const [results, setResults] = useState<ValidatedAssessmentResults | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = safeParseLocalStorage(
      STORAGE_KEYS.RESULTS,
      assessmentResultsSchema,
      null
    );
    setResults(saved);
    setIsLoaded(true);
  }, []);

  const saveResults = useCallback((data: ValidatedAssessmentResults): boolean => {
    const success = safeSetLocalStorage(STORAGE_KEYS.RESULTS, data);
    if (success) {
      setResults(data);
    }
    return success;
  }, []);

  const clearResults = useCallback((): boolean => {
    const success = safeRemoveLocalStorage(STORAGE_KEYS.RESULTS);
    if (success) {
      setResults(null);
    }
    return success;
  }, []);

  return {
    results,
    saveResults,
    clearResults,
    isLoaded,
  };
}

// Hook for share slug
export function useShareSlug(): {
  slug: string | null;
  saveSlug: (slug: string) => boolean;
  clearSlug: () => boolean;
} {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHARE_SLUG);
    if (saved) {
      // Basic validation - should be a UUID-like string or slug format
      const slugRegex = /^[a-zA-Z0-9_-]+$/;
      if (slugRegex.test(saved) && saved.length <= 100) {
        setSlug(saved);
      }
    }
  }, []);

  const saveSlug = useCallback((newSlug: string): boolean => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHARE_SLUG, newSlug);
      setSlug(newSlug);
      return true;
    } catch {
      return false;
    }
  }, []);

  const clearSlug = useCallback((): boolean => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SHARE_SLUG);
      setSlug(null);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { slug, saveSlug, clearSlug };
}
