import { describe, expect, it } from 'vitest';
import { depthQuestions } from '../../data/depthAssessment';
import { calculateDepthResults } from '../../utils/depthScoring';

describe('calculateDepthResults', () => {
  it('creates a four-channel energy map that sums to 100', () => {
    const answers: Record<string, string> = {};

    depthQuestions.forEach((question) => {
      const option = question.options.find((candidate) => {
        if (question.layer === 'inferior') return candidate.inferior === 'feeling';
        if (question.layer === 'attitude') return candidate.attitude === 'introverted';
        return candidate.channel === 'thinking';
      });
      answers[question.id] = option?.id ?? 'none';
    });

    const result = calculateDepthResults(answers);

    expect(result.version).toBe('depth-energy-map');
    expect(result.energy).toHaveLength(4);
    expect(result.energy.reduce((sum, item) => sum + item.score, 0)).toBe(100);
    expect(result.dominant).toBe('thinking');
    expect(result.inferior).toBe('feeling');
    expect(result.attitude.dominant).toBe('introverted');
  });

  it('uses inferior-function evidence to project the dominant opposite channel', () => {
    const answers: Record<string, string> = {};

    depthQuestions.forEach((question) => {
      const option = question.options.find((candidate) => {
        if (question.layer === 'inferior') return candidate.inferior === 'sensation';
        if (question.layer === 'attitude') return candidate.attitude === 'extraverted';
        return candidate.channel === 'intuition';
      });
      answers[question.id] = option?.id ?? 'none';
    });

    const result = calculateDepthResults(answers);

    expect(result.dominant).toBe('intuition');
    expect(result.inferior).toBe('sensation');
    expect(result.reliability.score).toBeGreaterThanOrEqual(70);
  });

  it('lowers reliability when many questions are answered with none', () => {
    const sparseAnswers = Object.fromEntries(depthQuestions.map((question) => [question.id, 'none']));
    const result = calculateDepthResults(sparseAnswers);

    expect(result.reliability.label).toBe('Exploratory');
    expect(result.reliability.notes.some((note) => note.includes('none fits'))).toBe(true);
  });
});
