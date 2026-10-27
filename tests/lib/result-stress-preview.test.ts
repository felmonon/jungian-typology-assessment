import { describe, expect, it } from 'vitest';
import { buildResultStressPreview } from '../../lib/result-stress-preview';
import { calculateDepthResults } from '../../utils/depthScoring';
import { depthQuestions } from '../../data/depthAssessment';

describe('answer-based stress preview', () => {
  it.each(['thinking', 'feeling', 'sensation', 'intuition'] as const)('quotes an actual %s answer and preserves the original practice', channel => {
    const answerId = `inferior-${channel}`;
    const result = calculateDepthResults({ inferior_03: answerId });
    const question = depthQuestions.find(item => item.id === 'inferior_03')!;
    const preview = buildResultStressPreview(result)!;
    expect(preview.question).toBe(question.prompt);
    expect(preview.answer).toBe(question.options.find(item => item.id === answerId)!.label);
    expect(preview.alignsWithMap).toBe(true);
    expect(preview.practice).toBe(result.narrative.practice);
  });

  it('does not invent evidence for missing, neutral, corrupt, or non-stress answers', () => {
    for (const answers of [{}, { inferior_03: 'none' }, { inferior_03: 'unknown' }, { inferior_02: 'inferior-feeling' }]) {
      expect(buildResultStressPreview(calculateDepthResults(answers))).toBeNull();
    }
  });

  it('acknowledges a stress answer that conflicts with the saved map', () => {
    const result = calculateDepthResults({ inferior_03: 'inferior-feeling' });
    result.inferior = 'sensation';
    const preview = buildResultStressPreview(result)!;
    expect(preview.alignsWithMap).toBe(false);
    expect(preview.evidence).toContain('Those signals differ');
    expect(preview.practice).not.toBe(result.narrative.practice);
  });

  it('retains uncertainty when the result is exploratory', () => {
    const result = calculateDepthResults({ inferior_01: 'inferior-intuition' });
    result.reliability.label = 'Exploratory';
    expect(buildResultStressPreview(result)?.caveat).toContain('Your result is exploratory');
  });
});
