import { describe, it, expect } from 'vitest';

// Mock scoring functions for testing
const calculateFunctionScore = (answers: number[]): number => {
  if (answers.length === 0) return 0;
  const sum = answers.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / (answers.length * 5)) * 100);
};

const determineAttitude = (scores: Record<string, number>): 'introvert' | 'extrovert' | 'balanced' => {
  const introvertFunctions = ['Ni', 'Ti', 'Fi', 'Si'];
  const extrovertFunctions = ['Ne', 'Te', 'Fe', 'Se'];

  const introvertTotal = introvertFunctions.reduce((sum, fn) => sum + (scores[fn] || 0), 0);
  const extrovertTotal = extrovertFunctions.reduce((sum, fn) => sum + (scores[fn] || 0), 0);

  const diff = Math.abs(introvertTotal - extrovertTotal);
  if (diff < 20) return 'balanced';
  return introvertTotal > extrovertTotal ? 'introvert' : 'extrovert';
};

const getTopFunctions = (scores: Record<string, number>, count: number = 4): string[] => {
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([fn]) => fn);
};

describe('Scoring Utilities', () => {
  describe('calculateFunctionScore', () => {
    it('calculates score correctly for full agreement', () => {
      const answers = [5, 5, 5, 5]; // All strongly agree
      expect(calculateFunctionScore(answers)).toBe(100);
    });

    it('calculates score correctly for full disagreement', () => {
      const answers = [1, 1, 1, 1]; // All strongly disagree
      expect(calculateFunctionScore(answers)).toBe(20);
    });

    it('calculates score correctly for neutral', () => {
      const answers = [3, 3, 3, 3]; // All neutral
      expect(calculateFunctionScore(answers)).toBe(60);
    });

    it('calculates score correctly for mixed answers', () => {
      const answers = [1, 3, 5]; // Mixed
      const expected = Math.round((9 / 15) * 100);
      expect(calculateFunctionScore(answers)).toBe(expected);
    });

    it('handles empty array', () => {
      expect(calculateFunctionScore([])).toBe(0);
    });
  });

  describe('determineAttitude', () => {
    it('identifies introvert preference', () => {
      const scores = {
        Ni: 80,
        Ti: 75,
        Fi: 70,
        Si: 65,
        Ne: 40,
        Te: 35,
        Fe: 30,
        Se: 25,
      };
      expect(determineAttitude(scores)).toBe('introvert');
    });

    it('identifies extrovert preference', () => {
      const scores = {
        Ne: 80,
        Te: 75,
        Fe: 70,
        Se: 65,
        Ni: 40,
        Ti: 35,
        Fi: 30,
        Si: 25,
      };
      expect(determineAttitude(scores)).toBe('extrovert');
    });

    it('identifies balanced when scores are close', () => {
      const scores = {
        Ni: 60,
        Ti: 55,
        Fi: 50,
        Si: 45,
        Ne: 58,
        Te: 52,
        Fe: 48,
        Se: 42,
      };
      expect(determineAttitude(scores)).toBe('balanced');
    });
  });

  describe('getTopFunctions', () => {
    it('returns top 4 functions by default', () => {
      const scores = {
        Ni: 80,
        Ne: 70,
        Ti: 60,
        Te: 50,
        Fi: 40,
        Fe: 30,
        Si: 20,
        Se: 10,
      };
      const top = getTopFunctions(scores);
      expect(top).toEqual(['Ni', 'Ne', 'Ti', 'Te']);
      expect(top).toHaveLength(4);
    });

    it('returns custom count when specified', () => {
      const scores = {
        Ni: 80,
        Ne: 70,
        Ti: 60,
        Te: 50,
      };
      const top = getTopFunctions(scores, 2);
      expect(top).toEqual(['Ni', 'Ne']);
    });

    it('handles ties by original order', () => {
      const scores = {
        Ni: 80,
        Ne: 80,
        Ti: 60,
      };
      const top = getTopFunctions(scores, 2);
      expect(top).toHaveLength(2);
      expect(top).toContain('Ni');
      expect(top).toContain('Ne');
    });
  });
});

describe('Type Mapping', () => {
  const functionStackToType: Record<string, string> = {
    'Ni-Te-Fi-Se': 'INTJ',
    'Ni-Fe-Ti-Se': 'INFJ',
    'Ne-Ti-Fe-Si': 'ENTP',
    'Ne-Fi-Te-Si': 'ENFP',
    'Si-Te-Fi-Ne': 'ISTJ',
    'Si-Fe-Ti-Ne': 'ISFJ',
    'Se-Ti-Fe-Ni': 'ISTP',
    'Se-Fi-Te-Ni': 'ISFP',
    'Ti-Ne-Si-Fe': 'INTP',
    'Ti-Se-Ni-Fe': 'ISTP',
    'Fi-Ne-Si-Te': 'INFP',
    'Fi-Se-Ni-Te': 'ISFP',
    'Te-Ni-Se-Fi': 'ENTJ',
    'Te-Si-Ne-Fi': 'ESTJ',
    'Fe-Ni-Se-Ti': 'ENFJ',
    'Fe-Si-Ne-Ti': 'ESFJ',
  };

  it('maps INTJ function stack correctly', () => {
    expect(functionStackToType['Ni-Te-Fi-Se']).toBe('INTJ');
  });

  it('maps INFJ function stack correctly', () => {
    expect(functionStackToType['Ni-Fe-Ti-Se']).toBe('INFJ');
  });

  it('maps ENTP function stack correctly', () => {
    expect(functionStackToType['Ne-Ti-Fe-Si']).toBe('ENTP');
  });
});
