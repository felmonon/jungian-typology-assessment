import { beforeEach, describe, expect, it } from 'vitest';
import {
  ASSESSMENT_PROGRESS_DISMISSED_KEY,
  ASSESSMENT_PROGRESS_STORAGE_KEY,
  ASSESSMENT_RESULTS_STORAGE_KEY,
  countAssessmentAnswers,
  dismissAssessmentResumePrompt,
  readResumableAssessmentProgress,
  writeAssessmentProgress,
} from '../../lib/assessment-progress';

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

describe('assessment progress storage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    });
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      value: createMemoryStorage(),
    });
  });

  it('counts answered questions and exposes resumable progress', () => {
    writeAssessmentProgress({ q1: 'a', q2: 'b', q3: '' }, 1);

    const progress = readResumableAssessmentProgress();
    expect(countAssessmentAnswers({ q1: 'a', q2: 'b', q3: '' })).toBe(2);
    expect(progress).toMatchObject({
      answeredCount: 2,
      currentPage: 1,
      totalQuestions: 42,
      progressPercent: 5,
    });
  });

  it('does not prompt after a result exists', () => {
    writeAssessmentProgress({ q1: 'a', q2: 'b' }, 1);
    localStorage.setItem(ASSESSMENT_RESULTS_STORAGE_KEY, '{"version":"depth-energy-map"}');

    expect(readResumableAssessmentProgress()).toBeNull();
  });

  it('dismisses the resume prompt without deleting answers', () => {
    writeAssessmentProgress({ q1: 'a', q2: 'b' }, 1);
    dismissAssessmentResumePrompt();

    expect(readResumableAssessmentProgress()).toBeNull();
    expect(sessionStorage.getItem(ASSESSMENT_PROGRESS_DISMISSED_KEY)).toBe('true');
    expect(localStorage.getItem(ASSESSMENT_PROGRESS_STORAGE_KEY)).toContain('"q1":"a"');
  });

  it('writing new progress clears a dismissed prompt for the session', () => {
    writeAssessmentProgress({ q1: 'a' }, 0);
    dismissAssessmentResumePrompt();
    writeAssessmentProgress({ q1: 'a', q2: 'b' }, 1);

    expect(sessionStorage.getItem(ASSESSMENT_PROGRESS_DISMISSED_KEY)).toBeNull();
    expect(readResumableAssessmentProgress()?.answeredCount).toBe(2);
  });
});
