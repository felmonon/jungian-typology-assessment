import { depthQuestions } from '../data/depthAssessment';
import {
  calculateDepthResults,
  type DepthAssessmentResult,
  isDepthAssessmentResult,
} from '../utils/depthScoring';
import { STORAGE_KEYS } from './validation';

// A saved map lives only in the browser that took the assessment. Emailed
// checkout links carry this compact answer code in the URL fragment so the
// map can be rebuilt when the link opens in another browser (a phone, or an
// email app's built-in browser). The fragment never reaches the server.

const CODE_VERSION = '1';
const UNANSWERED = '-';
const RESULT_CODE_PATTERN = /^[0-9a-z-]{2,80}$/;
export const RESULT_CODE_HASH_KEY = 'map';

export const encodeResultCode = (
  result: Pick<DepthAssessmentResult, 'answers'>,
): string | null => {
  let answered = 0;
  const chars = depthQuestions.map((question) => {
    const index = question.options.findIndex(
      (option) => option.id === result.answers?.[question.id],
    );
    if (index < 0) return UNANSWERED;
    answered += 1;
    return index.toString(36);
  });

  return answered > 0 ? `${CODE_VERSION}${chars.join('')}` : null;
};

export const decodeResultCode = (
  code: string | null | undefined,
): Record<string, string> | null => {
  if (!code || !RESULT_CODE_PATTERN.test(code)) return null;
  if (code[0] !== CODE_VERSION) return null;

  const chars = code.slice(1);
  if (chars.length !== depthQuestions.length) return null;

  const answers: Record<string, string> = {};
  for (let i = 0; i < depthQuestions.length; i += 1) {
    const char = chars[i];
    if (char === UNANSWERED) continue;
    const option = depthQuestions[i].options[parseInt(char, 36)];
    if (!option) return null;
    answers[depthQuestions[i].id] = option.id;
  }

  return Object.keys(answers).length > 0 ? answers : null;
};

export const resultFromCode = (
  code: string | null | undefined,
): DepthAssessmentResult | null => {
  const answers = decodeResultCode(code);
  return answers ? calculateDepthResults(answers) : null;
};

export const resultCodeFromHash = (hash: string): string | null => {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return params.get(RESULT_CODE_HASH_KEY);
};

export const readSavedResultCode = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.RESULTS) || 'null',
    );
    return isDepthAssessmentResult(saved) ? encodeResultCode(saved) : null;
  } catch {
    return null;
  }
};
