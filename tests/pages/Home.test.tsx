import { describe, expect, it } from 'vitest';
import { depthQuestions } from '../../data/depthAssessment';
import { PRICING } from '../../data/pricing';
import { assessmentEntryContextFromSource } from '../../lib/assessment-entry-context';

// Facts the homepage copy states. If the assessment changes, this fails
// before the homepage starts making claims the product no longer backs.
describe('homepage copy matches the assessment', () => {
  it('has 42 questions in four layers of 20, 10, 6 and 6', () => {
    expect(depthQuestions).toHaveLength(42);
    const count = (layer: string) => depthQuestions.filter((q) => q.layer === layer).length;
    expect([count('behavioral'), count('inferior'), count('somatic'), count('attitude')]).toEqual([20, 10, 6, 6]);
  });

  it('weights inferior-function answers at 1.35x', () => {
    const inferior = depthQuestions.filter((q) => q.layer === 'inferior');
    for (const q of inferior) {
      for (const option of q.options.filter((o) => o.inferior)) expect(option.weight).toBe(1.35);
    }
  });

  it('uses a real question with four function answers and a none option for the demo', () => {
    const demo = depthQuestions.find((q) => q.id === 'inferior_01');
    expect(demo?.options.filter((o) => o.inferior)).toHaveLength(4);
    expect(demo?.options.some((o) => o.id === 'none')).toBe(true);
  });

  it('states list prices', () => {
    expect(PRICING.insight.price).toBe('CA$7');
    expect(PRICING.mastery.price).toBe('CA$19');
  });

  it('gives demo starters their own assessment intro', () => {
    expect(assessmentEntryContextFromSource('home_demo')?.category).toBe('stress_edge');
    expect(assessmentEntryContextFromSource('home_hero')).toBeNull();
  });
});
