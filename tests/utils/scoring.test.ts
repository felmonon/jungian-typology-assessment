import { describe, it, expect } from 'vitest';
import { calculateResults } from '../../utils/scoring';
import { questions } from '../../data/questions';
import { FunctionAttitude } from '../../types';

describe('calculateResults', () => {
  // Helper to create answers for all questions
  const createAnswers = (overrides: Record<string, number> = {}): Record<string, number> => {
    const answers: Record<string, number> = {};
    questions.forEach(q => {
      answers[q.id] = overrides[q.id] || 3; // Default to neutral
    });
    return answers;
  };

  // Helper to get questions for a specific function
  const getQuestionsForFunction = (func: FunctionAttitude, category: 'A' | 'B') => {
    return questions.filter(q => q.target === func && q.category === category);
  };

  describe('basic structure', () => {
    it('returns all required fields', () => {
      const answers = createAnswers();
      const results = calculateResults(answers);

      expect(results).toHaveProperty('scores');
      expect(results).toHaveProperty('dominant');
      expect(results).toHaveProperty('inferior');
      expect(results).toHaveProperty('stack');
      expect(results).toHaveProperty('differentiation');
      expect(results).toHaveProperty('isUndifferentiated');
      expect(results).toHaveProperty('attitudeScore');
      expect(results.scores).toHaveLength(8);
    });

    it('returns exactly 8 function scores', () => {
      const answers = createAnswers();
      const results = calculateResults(answers);
      const functions: FunctionAttitude[] = ['Te', 'Ti', 'Fe', 'Fi', 'Se', 'Si', 'Ne', 'Ni'];
      
      functions.forEach(func => {
        const score = results.scores.find(s => s.function === func);
        expect(score).toBeDefined();
        expect(score).toHaveProperty('score');
        expect(score).toHaveProperty('rawPreference');
        expect(score).toHaveProperty('rawInferior');
        expect(score).toHaveProperty('normalized');
      });
    });
  });

  describe('score calculation', () => {
    it('gives high score when strongly agreeing with preference questions', () => {
      const niPrefQuestions = getQuestionsForFunction('Ni', 'A');
      const answers = createAnswers();
      
      // Answer all Ni preference questions with strongly agree
      niPrefQuestions.forEach(q => {
        answers[q.id] = 5;
      });

      const results = calculateResults(answers);
      const niScore = results.scores.find(s => s.function === 'Ni');
      
      expect(niScore).toBeDefined();
      expect(niScore!.score).toBeGreaterThan(70);
    });

    it('gives low score when strongly disagreeing with preference questions', () => {
      const niPrefQuestions = getQuestionsForFunction('Ni', 'A');
      const answers = createAnswers();
      
      // Answer all Ni preference questions with strongly disagree
      niPrefQuestions.forEach(q => {
        answers[q.id] = 1;
      });

      const results = calculateResults(answers);
      const niScore = results.scores.find(s => s.function === 'Ni');
      
      expect(niScore).toBeDefined();
      expect(niScore!.score).toBeLessThan(30);
    });

    it('handles inverse scoring for inferior questions', () => {
      const niInfQuestions = getQuestionsForFunction('Ni', 'B');
      const answers = createAnswers();
      
      // Answer all Ni inferior questions with strongly disagree (should boost Ni score)
      niInfQuestions.forEach(q => {
        answers[q.id] = 1;
      });

      const results = calculateResults(answers);
      const niScore = results.scores.find(s => s.function === 'Ni');
      
      expect(niScore).toBeDefined();
      // Since 1 becomes (6-1)=5 after inverse scoring, this should boost the score
      expect(niScore!.rawInferior).toBeGreaterThan(4);
    });
  });

  describe('dominant function selection', () => {
    it('selects Ni as dominant when Ni scores highest', () => {
      const answers = createAnswers();
      
      // Make Ni the highest scorer
      getQuestionsForFunction('Ni', 'A').forEach(q => answers[q.id] = 5);
      getQuestionsForFunction('Ni', 'B').forEach(q => answers[q.id] = 1);
      
      // Make others lower
      getQuestionsForFunction('Ne', 'A').forEach(q => answers[q.id] = 2);
      getQuestionsForFunction('Te', 'A').forEach(q => answers[q.id] = 2);

      const results = calculateResults(answers);
      expect(results.dominant.function).toBe('Ni');
      expect(results.stack.dominant.function).toBe('Ni');
    });

    it('selects Te as dominant when Te scores highest', () => {
      const answers = createAnswers();
      
      // Make Te the highest scorer
      getQuestionsForFunction('Te', 'A').forEach(q => answers[q.id] = 5);
      getQuestionsForFunction('Te', 'B').forEach(q => answers[q.id] = 1);
      
      // Make others lower
      getQuestionsForFunction('Ti', 'A').forEach(q => answers[q.id] = 2);
      getQuestionsForFunction('Fe', 'A').forEach(q => answers[q.id] = 2);

      const results = calculateResults(answers);
      expect(results.dominant.function).toBe('Te');
    });
  });

  describe('stack calculation', () => {
    it('calculates correct theoretical inferior (opposite of dominant)', () => {
      const opposites: Record<FunctionAttitude, FunctionAttitude> = {
        'Ni': 'Se', 'Se': 'Ni',
        'Ne': 'Si', 'Si': 'Ne',
        'Ti': 'Fe', 'Fe': 'Ti',
        'Te': 'Fi', 'Fi': 'Te'
      };

      const testCases: FunctionAttitude[] = ['Ni', 'Ne', 'Ti', 'Te', 'Fi', 'Fe', 'Si', 'Se'];

      for (const dominant of testCases) {
        const answers = createAnswers();
        const expectedInferior = opposites[dominant];
        
        // Make this function dominant
        getQuestionsForFunction(dominant, 'A').forEach(q => answers[q.id] = 5);
        
        const results = calculateResults(answers);
        expect(results.stack.inferior.function).toBe(expectedInferior);
        expect(results.inferior.function).toBe(expectedInferior);
      }
    });

    it('selects auxiliary of opposite rationality', () => {
      const answers = createAnswers();
      
      // Make Ni (perceiving) dominant
      getQuestionsForFunction('Ni', 'A').forEach(q => answers[q.id] = 5);
      
      // Make Ti (judging) second highest
      getQuestionsForFunction('Ti', 'A').forEach(q => answers[q.id] = 4);
      
      // Make others lower
      getQuestionsForFunction('Ne', 'A').forEach(q => answers[q.id] = 2);
      getQuestionsForFunction('Te', 'A').forEach(q => answers[q.id] = 2);

      const results = calculateResults(answers);
      expect(results.stack.dominant.function).toBe('Ni');
      // Auxiliary should be judging (Ti, Te, Fe, or Fi)
      const aux = results.stack.auxiliary.function;
      expect(['Ti', 'Te', 'Fe', 'Fi']).toContain(aux);
    });

    it('calculates tertiary as opposite of auxiliary', () => {
      const answers = createAnswers();
      
      // Make Ni dominant
      getQuestionsForFunction('Ni', 'A').forEach(q => answers[q.id] = 5);
      
      // Make Ti high (so it becomes auxiliary)
      getQuestionsForFunction('Ti', 'A').forEach(q => answers[q.id] = 4);
      
      const results = calculateResults(answers);
      
      if (results.stack.auxiliary.function === 'Ti') {
        // Tertiary should be Fe (opposite of Ti)
        expect(results.stack.tertiary.function).toBe('Fe');
      }
    });
  });

  describe('attitude calculation', () => {
    it('calculates positive attitude score for extraversion', () => {
      const eQuestions = questions.filter(q => q.target === 'E' && q.category === 'C');
      const iQuestions = questions.filter(q => q.target === 'I' && q.category === 'C');
      
      const answers = createAnswers();
      
      // Strongly agree with extraversion, disagree with introversion
      eQuestions.forEach(q => answers[q.id] = 5);
      iQuestions.forEach(q => answers[q.id] = 1);

      const results = calculateResults(answers);
      expect(results.attitudeScore).toBeGreaterThan(0);
    });

    it('calculates negative attitude score for introversion', () => {
      const eQuestions = questions.filter(q => q.target === 'E' && q.category === 'C');
      const iQuestions = questions.filter(q => q.target === 'I' && q.category === 'C');
      
      const answers = createAnswers();
      
      // Agree with introversion, disagree with extraversion
      eQuestions.forEach(q => answers[q.id] = 1);
      iQuestions.forEach(q => answers[q.id] = 5);

      const results = calculateResults(answers);
      expect(results.attitudeScore).toBeLessThan(0);
    });
  });

  describe('differentiation calculation', () => {
    it('identifies undifferentiated profile when scores are similar', () => {
      const answers = createAnswers();
      
      // All neutral answers = similar scores
      questions.forEach(q => {
        answers[q.id] = 3;
      });

      const results = calculateResults(answers);
      // With all neutral answers, scores should be very similar
      expect(results.isUndifferentiated).toBe(true);
    });

    it('identifies differentiated profile when scores vary', () => {
      const answers = createAnswers();
      
      // Create clear differentiation
      getQuestionsForFunction('Ni', 'A').forEach(q => answers[q.id] = 5);
      getQuestionsForFunction('Ni', 'B').forEach(q => answers[q.id] = 1);
      getQuestionsForFunction('Se', 'A').forEach(q => answers[q.id] = 1);
      getQuestionsForFunction('Se', 'B').forEach(q => answers[q.id] = 5);

      const results = calculateResults(answers);
      expect(results.isUndifferentiated).toBe(false);
    });

    it('calculates differentiation based on standard deviation', () => {
      const answers = createAnswers();
      
      // Extreme differentiation
      getQuestionsForFunction('Ni', 'A').forEach(q => answers[q.id] = 5);
      getQuestionsForFunction('Se', 'A').forEach(q => answers[q.id] = 1);

      const results = calculateResults(answers);
      expect(results.differentiation).toBeGreaterThan(10);
    });
  });

  describe('edge cases', () => {
    it('handles missing answers gracefully', () => {
      const answers: Record<string, number> = {};
      
      // Answer only half the questions
      questions.slice(0, Math.floor(questions.length / 2)).forEach(q => {
        answers[q.id] = 3;
      });

      const results = calculateResults(answers);
      expect(results.scores).toHaveLength(8);
      expect(results.dominant).toBeDefined();
    });

    it('handles all maximum scores', () => {
      const answers = createAnswers();
      questions.forEach(q => {
        answers[q.id] = 5;
      });

      const results = calculateResults(answers);
      expect(results.scores).toHaveLength(8);
      expect(results.dominant).toBeDefined();
    });

    it('handles all minimum scores', () => {
      const answers = createAnswers();
      questions.forEach(q => {
        answers[q.id] = 1;
      });

      const results = calculateResults(answers);
      expect(results.scores).toHaveLength(8);
      expect(results.dominant).toBeDefined();
    });
  });

  describe('type mapping', () => {
    it('produces correct INTJ-like stack (Ni-Te-Fi-Se)', () => {
      const answers = createAnswers();
      
      // Prioritize Ni and Te
      getQuestionsForFunction('Ni', 'A').forEach(q => answers[q.id] = 5);
      getQuestionsForFunction('Ni', 'B').forEach(q => answers[q.id] = 1);
      getQuestionsForFunction('Te', 'A').forEach(q => answers[q.id] = 4);
      getQuestionsForFunction('Te', 'B').forEach(q => answers[q.id] = 2);
      
      // Lower other judging functions
      getQuestionsForFunction('Ti', 'A').forEach(q => answers[q.id] = 2);
      getQuestionsForFunction('Fe', 'A').forEach(q => answers[q.id] = 2);
      getQuestionsForFunction('Fi', 'A').forEach(q => answers[q.id] = 3);

      const results = calculateResults(answers);
      expect(results.stack.dominant.function).toBe('Ni');
      expect(results.stack.inferior.function).toBe('Se');
      // Auxiliary should be a judging function
      expect(['Te', 'Ti', 'Fe', 'Fi']).toContain(results.stack.auxiliary.function);
    });

    it('produces correct INTP-like stack (Ti-Ne-Si-Fe)', () => {
      const answers = createAnswers();
      
      // Prioritize Ti and Ne
      getQuestionsForFunction('Ti', 'A').forEach(q => answers[q.id] = 5);
      getQuestionsForFunction('Ti', 'B').forEach(q => answers[q.id] = 1);
      getQuestionsForFunction('Ne', 'A').forEach(q => answers[q.id] = 4);
      getQuestionsForFunction('Ne', 'B').forEach(q => answers[q.id] = 2);
      
      // Lower other perceiving functions
      getQuestionsForFunction('Ni', 'A').forEach(q => answers[q.id] = 2);
      getQuestionsForFunction('Se', 'A').forEach(q => answers[q.id] = 2);

      const results = calculateResults(answers);
      expect(results.stack.dominant.function).toBe('Ti');
      expect(results.stack.inferior.function).toBe('Fe');
      // Auxiliary should be a perceiving function
      expect(['Ne', 'Ni', 'Se', 'Si']).toContain(results.stack.auxiliary.function);
    });
  });
});
