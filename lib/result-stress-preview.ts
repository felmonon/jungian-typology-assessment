import { depthQuestions, FUNCTION_LABELS, type FunctionChannel } from '../data/depthAssessment';
import type { DepthAssessmentResult } from '../utils/depthScoring';

export const RESULT_OFFER_VERSION = 'stress-reflection-v1';

// Quote a real stress-situation answer, not a desired quality or attraction
// response. This explains existing results; it does not rescore the assessment.
const STRESS_QUESTIONS = ['inferior_03', 'inferior_01', 'inferior_06', 'inferior_09', 'inferior_04'];
const reflections: Record<FunctionChannel, { title: string; body: string }> = {
  thinking: {
    title: 'When a clear explanation becomes a hard verdict.',
    body: 'A useful distinction to notice is the difference between checking the facts and reaching a verdict about someone’s competence. In a tense moment, ask which of those you are doing.',
  },
  feeling: {
    title: 'When feeling valued becomes the question.',
    body: 'A tense exchange may start to feel like a verdict on how much you matter. Notice the difference between what the other person actually said and what you took it to mean about your worth.',
  },
  sensation: {
    title: 'When concrete details take over your attention.',
    body: 'Notice whether a difficult moment pulls your attention toward comfort, physical sensations, or small details. Naming that shift can help you distinguish what needs attention now from what can wait.',
  },
  intuition: {
    title: 'When a possibility starts to feel like a certainty.',
    body: 'Under pressure, a worrying interpretation can start to feel like an established fact. Try separating what happened from the story about what it means or what will happen next.',
  },
};

export function buildResultStressPreview(result: DepthAssessmentResult) {
  const responses = STRESS_QUESTIONS.flatMap(id => {
    const question = depthQuestions.find(item => item.id === id);
    const answer = question?.options.find(item => item.id === result.answers?.[id]);
    return question && answer?.inferior ? [{ question, answer, channel: answer.inferior }] : [];
  });
  // Prefer evidence for the existing map; if none supports it, show the
  // mismatch openly instead of presenting a generic sample as personal proof.
  const response = responses.find(item => item.channel === result.inferior) ?? responses[0];
  if (!response) return null;
  const alignsWithMap = response.channel === result.inferior;
  return {
    ...reflections[response.channel],
    question: response.question.prompt,
    answer: response.answer.label,
    alignsWithMap,
    evidence: alignsWithMap
      ? `This answer is associated with ${FUNCTION_LABELS[response.channel].toLowerCase()} in the assessment, which your full map also places at the growth edge.`
      : `This answer is associated with ${FUNCTION_LABELS[response.channel].toLowerCase()}, while your full map places ${FUNCTION_LABELS[result.inferior].toLowerCase()} at the growth edge. Those signals differ; use this reflection as a question to explore, not a settled conclusion.`,
    practice: alignsWithMap ? result.narrative.practice : 'Recall one tense moment. Write what happened, what you assumed, and one thing you could check before responding.',
    caveat: result.reliability.label === 'Exploratory'
      ? 'Your result is exploratory: the answers do not point to one clear pattern. Keep what fits your experience and question what does not.'
      : 'Selected from your assessment answers for reflection. The full report is generated separately from your result.',
  };
}
