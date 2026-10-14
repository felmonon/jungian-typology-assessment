import { describe, expect, it } from 'vitest';
import { depthQuestions } from '../../data/depthAssessment';
import {
  decodeResultCode,
  encodeResultCode,
  resultCodeFromHash,
  resultFromCode,
} from '../../lib/result-link';
import { calculateDepthResults } from '../../utils/depthScoring';

const fullAnswers = Object.fromEntries(
  depthQuestions.map((question, index) => [
    question.id,
    question.options[index % question.options.length].id,
  ]),
);

describe('result link code', () => {
  it('round-trips every answer and rebuilds the same map', () => {
    const original = calculateDepthResults(fullAnswers);
    const code = encodeResultCode(original);

    expect(code).toMatch(/^1[0-9a-z]+$/);
    expect(code!.length).toBe(depthQuestions.length + 1);
    expect(decodeResultCode(code)).toEqual(fullAnswers);

    const rebuilt = resultFromCode(code)!;
    expect(rebuilt.dominant).toBe(original.dominant);
    expect(rebuilt.inferior).toBe(original.inferior);
    expect(rebuilt.hierarchy).toEqual(original.hierarchy);
  });

  it('keeps unanswered questions unanswered', () => {
    const { [depthQuestions[0].id]: _skipped, ...partial } = fullAnswers;
    const code = encodeResultCode({ answers: partial });

    expect(code![1]).toBe('-');
    expect(decodeResultCode(code)).toEqual(partial);
  });

  it('rejects malformed or tampered codes', () => {
    expect(decodeResultCode(null)).toBeNull();
    expect(decodeResultCode('1abc')).toBeNull();
    expect(decodeResultCode(`2${'0'.repeat(depthQuestions.length)}`)).toBeNull();
    expect(decodeResultCode(`1${'z'.repeat(depthQuestions.length)}`)).toBeNull();
    expect(decodeResultCode(`1${'-'.repeat(depthQuestions.length)}`)).toBeNull();
    expect(encodeResultCode({ answers: {} })).toBeNull();
  });

  it('reads the code from a URL fragment', () => {
    expect(resultCodeFromHash('#map=1abc')).toBe('1abc');
    expect(resultCodeFromHash('#other=1')).toBeNull();
    expect(resultCodeFromHash('')).toBeNull();
  });
});
