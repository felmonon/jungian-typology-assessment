import { depthQuestions } from '../data/depthAssessment';

export const ASSESSMENT_PROGRESS_STORAGE_KEY = 'jungian_depth_assessment_progress';
export const ASSESSMENT_RESULTS_STORAGE_KEY = 'jungian_assessment_results';
export const ASSESSMENT_PROGRESS_DISMISSED_KEY = 'typejung_assessment_resume_dismissed';

export type SavedAssessmentProgress = {
  answers: Record<string, string>;
  currentPage: number;
  startedAt?: string;
  updatedAt?: string;
};

export type ResumableAssessmentProgress = SavedAssessmentProgress & {
  answeredCount: number;
  totalQuestions: number;
  progressPercent: number;
};

export const countAssessmentAnswers = (answers: Record<string, string>) =>
  Object.keys(answers).filter((key) => answers[key]).length;

const parseSavedProgress = (raw: string | null): SavedAssessmentProgress | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    return {
      answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
      currentPage: Number.isFinite(parsed.currentPage) ? parsed.currentPage : 0,
      startedAt: typeof parsed.startedAt === 'string' ? parsed.startedAt : undefined,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : undefined,
    };
  } catch {
    return null;
  }
};

export const readAssessmentProgress = (): SavedAssessmentProgress | null => {
  if (typeof window === 'undefined') return null;
  return parseSavedProgress(localStorage.getItem(ASSESSMENT_PROGRESS_STORAGE_KEY));
};

export const writeAssessmentProgress = (answers: Record<string, string>, currentPage: number) => {
  if (typeof window === 'undefined') return;

  const now = new Date().toISOString();
  const previous = readAssessmentProgress();

  localStorage.setItem(ASSESSMENT_PROGRESS_STORAGE_KEY, JSON.stringify({
    answers,
    currentPage,
    startedAt: previous?.startedAt || now,
    updatedAt: now,
  }));

  try {
    sessionStorage.removeItem(ASSESSMENT_PROGRESS_DISMISSED_KEY);
  } catch {
    // Non-critical UI hint.
  }
};

export const readResumableAssessmentProgress = (): ResumableAssessmentProgress | null => {
  if (typeof window === 'undefined') return null;

  try {
    if (localStorage.getItem(ASSESSMENT_RESULTS_STORAGE_KEY)) return null;
    if (sessionStorage.getItem(ASSESSMENT_PROGRESS_DISMISSED_KEY) === 'true') return null;
  } catch {
    // Continue with progress parsing if storage access is partly available.
  }

  const progress = readAssessmentProgress();
  if (!progress) return null;

  const answeredCount = countAssessmentAnswers(progress.answers);
  const totalQuestions = depthQuestions.length;

  if (answeredCount <= 0 || answeredCount >= totalQuestions) return null;

  return {
    ...progress,
    answeredCount,
    totalQuestions,
    progressPercent: Math.round((answeredCount / totalQuestions) * 100),
  };
};

export const dismissAssessmentResumePrompt = () => {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(ASSESSMENT_PROGRESS_DISMISSED_KEY, 'true');
  } catch {
    // Non-critical UI hint.
  }
};
