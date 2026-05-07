import {
  ATTITUDE_LABELS,
  AttitudeDirection,
  DepthLayer,
  FUNCTION_LABELS,
  FunctionChannel,
  depthQuestions,
} from '../data/depthAssessment';

export interface FunctionEnergy {
  channel: FunctionChannel;
  label: string;
  score: number;
  raw: number;
}

export interface FunctionPosition {
  position: 'dominant' | 'auxiliary' | 'tertiary' | 'inferior';
  channel: FunctionChannel;
  label: string;
  attitude: AttitudeDirection;
  score: number;
}

export interface DepthAssessmentResult {
  version: 'depth-energy-map';
  completedAt: string;
  totalQuestions: number;
  answeredQuestions: number;
  answers: Record<string, string>;
  energy: FunctionEnergy[];
  hierarchy: FunctionPosition[];
  dominant: FunctionChannel;
  auxiliary: FunctionChannel;
  tertiary: FunctionChannel;
  inferior: FunctionChannel;
  attitude: {
    introverted: number;
    extraverted: number;
    dominant: AttitudeDirection;
    summary: string;
  };
  layerSignals: Record<DepthLayer, FunctionChannel | AttitudeDirection | null>;
  inferiorScores: Record<FunctionChannel, number>;
  reliability: {
    score: number;
    label: 'High' | 'Moderate' | 'Exploratory';
    notes: string[];
  };
  narrative: {
    energyMap: string;
    developmentalEdge: string;
    complexVulnerability: string;
    somaticSignature: string;
    practice: string;
  };
}

const CHANNELS: FunctionChannel[] = ['thinking', 'feeling', 'sensation', 'intuition'];

const LAYER_WEIGHTS: Record<DepthLayer, number> = {
  behavioral: 1,
  inferior: 1.7,
  somatic: 1.25,
  attitude: 1,
};

const oppositeChannel: Record<FunctionChannel, FunctionChannel> = {
  thinking: 'feeling',
  feeling: 'thinking',
  sensation: 'intuition',
  intuition: 'sensation',
};

const axisFor = (channel: FunctionChannel) =>
  channel === 'thinking' || channel === 'feeling' ? 'judging' : 'perceiving';

const oppositeAttitude = (attitude: AttitudeDirection): AttitudeDirection =>
  attitude === 'introverted' ? 'extraverted' : 'introverted';

const emptyScores = (): Record<FunctionChannel, number> => ({
  thinking: 0,
  feeling: 0,
  sensation: 0,
  intuition: 0,
});

const getTopChannel = (scores: Record<FunctionChannel, number>): FunctionChannel | null => {
  const top = CHANNELS.reduce((best, channel) => scores[channel] > scores[best] ? channel : best, CHANNELS[0]);
  return scores[top] > 0 ? top : null;
};

const getLowestChannel = (scores: Record<FunctionChannel, number>): FunctionChannel =>
  CHANNELS.reduce((best, channel) => scores[channel] < scores[best] ? channel : best, CHANNELS[0]);

const normalizeChannelScores = (scores: Record<FunctionChannel, number>): FunctionEnergy[] => {
  const total = CHANNELS.reduce((sum, channel) => sum + scores[channel], 0);

  if (total <= 0) {
    return CHANNELS.map((channel) => ({
      channel,
      label: FUNCTION_LABELS[channel],
      raw: 0,
      score: 25,
    }));
  }

  const normalized = CHANNELS.map((channel) => ({
    channel,
    label: FUNCTION_LABELS[channel],
    raw: Number(scores[channel].toFixed(2)),
    score: Math.round((scores[channel] / total) * 100),
  }));

  const delta = 100 - normalized.reduce((sum, item) => sum + item.score, 0);
  if (delta !== 0) {
    const largest = normalized.reduce((best, item) => item.score > best.score ? item : best, normalized[0]);
    largest.score += delta;
  }

  return normalized.sort((a, b) => b.score - a.score);
};

const selectHierarchy = (
  energy: FunctionEnergy[],
  inferredInferior: FunctionChannel,
  dominantAttitude: AttitudeDirection,
): FunctionPosition[] => {
  const scoreFor = (channel: FunctionChannel) => energy.find((item) => item.channel === channel)?.score ?? 0;
  const dominant = energy[0].channel === inferredInferior && energy[1]
    ? energy[1].channel
    : energy[0].channel;

  const auxiliary = energy.find((item) =>
    item.channel !== dominant &&
    item.channel !== inferredInferior &&
    axisFor(item.channel) !== axisFor(dominant)
  )?.channel ?? energy.find((item) => item.channel !== dominant && item.channel !== inferredInferior)?.channel ?? oppositeChannel[dominant];

  const tertiary = CHANNELS.find((channel) =>
    channel !== dominant &&
    channel !== auxiliary &&
    channel !== inferredInferior
  ) ?? oppositeChannel[auxiliary];

  const hierarchy: FunctionPosition[] = [
    {
      position: 'dominant',
      channel: dominant,
      label: FUNCTION_LABELS[dominant],
      attitude: dominantAttitude,
      score: scoreFor(dominant),
    },
    {
      position: 'auxiliary',
      channel: auxiliary,
      label: FUNCTION_LABELS[auxiliary],
      attitude: oppositeAttitude(dominantAttitude),
      score: scoreFor(auxiliary),
    },
    {
      position: 'tertiary',
      channel: tertiary,
      label: FUNCTION_LABELS[tertiary],
      attitude: dominantAttitude,
      score: scoreFor(tertiary),
    },
    {
      position: 'inferior',
      channel: inferredInferior,
      label: FUNCTION_LABELS[inferredInferior],
      attitude: oppositeAttitude(dominantAttitude),
      score: scoreFor(inferredInferior),
    },
  ];

  return hierarchy;
};

const edgeCopy: Record<FunctionChannel, string> = {
  feeling: 'Your challenge is not to think better. It is to feel value directly without needing to analyze it first. The growth edge is the gap between knowing what is true and feeling what matters.',
  thinking: 'Your challenge is not to care more. It is to keep clear thought available when emotion is high, without dismissing the feeling or becoming captured by it.',
  sensation: 'Your challenge is not to see more possibilities. It is to land in the body, finish one concrete thing, and stay with what is present before moving to what could be.',
  intuition: 'Your challenge is not to become more practical. It is to trust meaning, possibility, and pattern before everything can be proven by direct evidence.',
};

const complexCopy: Record<FunctionChannel, string> = {
  feeling: 'Complexes are most likely to capture you around worth, rejection, appreciation, loyalty, and value discrimination. When this channel activates, the usual thinking control can go offline and the situation may feel more personal than expected.',
  thinking: 'Complexes are most likely to capture you around competence, intellectual adequacy, criticism, and the demand to make clean distinctions under pressure. Feeling may flood the field before thought has time to differentiate.',
  sensation: 'Complexes are most likely to capture you through the body: symptoms, appetite, exhaustion, comfort, sensory irritation, and concrete follow-through. The body becomes the doorway where neglected reality asks for attention.',
  intuition: 'Complexes are most likely to capture you through dark possibility: hidden motives, ominous meanings, future dread, and symbolic threat. The task is to separate real pattern from fear-driven projection.',
};

const somaticCopy: Record<FunctionChannel, string> = {
  thinking: 'Your body signals are likely to gather around head, jaw, throat, language, and pressure to make sense. Grounding starts by giving thought a clean container.',
  feeling: 'Your body signals are likely to gather around the chest, heart rhythm, warmth, constriction, and relational tone. Grounding starts by naming the value or wound directly.',
  sensation: 'Your body signals are likely to be concrete and distributed: gut, hands, muscles, breath, appetite, fatigue, and texture. Grounding starts with physical regulation before interpretation.',
  intuition: 'Your body signals may feel diffuse, imaginal, hard to locate, or future-oriented. Grounding starts by translating the image or pattern into one present action.',
};

const practiceCopy: Record<FunctionChannel, string> = {
  feeling: 'Before solving the next emotional knot, name one value, one need, and one boundary without defending them.',
  thinking: 'Before reacting, write one claim, one piece of evidence, and one limitation. Keep the feeling present while thought differentiates.',
  sensation: 'Do one concrete regulating action: feet on the floor, slower exhale, food or water, then one finishable task under ten minutes.',
  intuition: 'Write three possible meanings, then test the least frightening one against facts. Keep possibility open without letting dread become prophecy.',
};

const energyMapCopy = (
  dominant: FunctionChannel,
  auxiliary: FunctionChannel,
  tertiary: FunctionChannel,
  inferior: FunctionChannel,
  attitude: AttitudeDirection,
) => (
  `Your energy flows most strongly through ${ATTITUDE_LABELS[attitude].toLowerCase()} ${FUNCTION_LABELS[dominant].toLowerCase()}. ` +
  `${FUNCTION_LABELS[auxiliary]} appears as the supporting channel, with ${FUNCTION_LABELS[tertiary].toLowerCase()} available but less central. ` +
  `${FUNCTION_LABELS[inferior]} carries the least conscious energy and marks the developmental edge.`
);

export const calculateDepthResults = (answers: Record<string, string>): DepthAssessmentResult => {
  const energyScores = emptyScores();
  const behaviorScores = emptyScores();
  const somaticScores = emptyScores();
  const inferiorScores = emptyScores();
  const attitudeScores: Record<AttitudeDirection, number> = {
    introverted: 0,
    extraverted: 0,
  };

  let answeredQuestions = 0;
  let noneCount = 0;

  depthQuestions.forEach((question) => {
    const answerId = answers[question.id];
    if (!answerId) return;

    const answer = question.options.find((option) => option.id === answerId);
    if (!answer) return;

    answeredQuestions += 1;
    if (answer.id === 'none') noneCount += 1;

    const answerWeight = answer.weight ?? 1;
    const layerWeight = LAYER_WEIGHTS[question.layer];
    const score = answerWeight * layerWeight;

    if (answer.channel && score > 0) {
      energyScores[answer.channel] += score;
      if (question.layer === 'behavioral') behaviorScores[answer.channel] += score;
      if (question.layer === 'somatic') somaticScores[answer.channel] += score;
    }

    if (answer.inferior && score > 0) {
      inferiorScores[answer.inferior] += score;
    }

    if (answer.attitude && score > 0) {
      attitudeScores[answer.attitude] += score;
    }
  });

  const behaviorTop = getTopChannel(behaviorScores);
  const somaticTop = getTopChannel(somaticScores);
  const triggeredInferior = getTopChannel(inferiorScores);
  const projectedDominant = triggeredInferior ? oppositeChannel[triggeredInferior] : getTopChannel(energyScores) ?? 'thinking';

  const adjustedEnergy = CHANNELS.reduce((acc, channel) => {
    acc[channel] = energyScores[channel] + 0.8;
    return acc;
  }, emptyScores());
  if (triggeredInferior) {
    adjustedEnergy[projectedDominant] += inferiorScores[triggeredInferior] * 0.72;
    adjustedEnergy[triggeredInferior] += inferiorScores[triggeredInferior] * 0.08;
  }

  if (behaviorTop && behaviorTop !== triggeredInferior) {
    adjustedEnergy[behaviorTop] += 0.75;
  }

  const energy = normalizeChannelScores(adjustedEnergy);
  const lowestEnergy = energy[energy.length - 1].channel;
  const energyTop = energy[0].channel;
  let inferredInferior = triggeredInferior ?? lowestEnergy;

  if (triggeredInferior && energyTop === triggeredInferior && behaviorTop === triggeredInferior) {
    inferredInferior = oppositeChannel[energyTop];
  }

  const attitudeTotal = attitudeScores.introverted + attitudeScores.extraverted;
  const introverted = attitudeTotal > 0 ? Math.round((attitudeScores.introverted / attitudeTotal) * 100) : 50;
  const extraverted = 100 - introverted;
  const dominantAttitude: AttitudeDirection = introverted >= extraverted ? 'introverted' : 'extraverted';

  const hierarchy = selectHierarchy(energy, inferredInferior, dominantAttitude);
  const dominant = hierarchy[0].channel;
  const auxiliary = hierarchy[1].channel;
  const tertiary = hierarchy[2].channel;
  const inferior = hierarchy[3].channel;

  let reliabilityScore = 48;
  if (behaviorTop === dominant) reliabilityScore += 16;
  if (somaticTop === dominant || somaticTop === auxiliary) reliabilityScore += 12;
  if (triggeredInferior && (projectedDominant === dominant || projectedDominant === auxiliary)) reliabilityScore += 16;
  if (triggeredInferior && lowestEnergy === inferior) reliabilityScore += 10;
  reliabilityScore += Math.min(8, Math.round((answeredQuestions / depthQuestions.length) * 8));
  reliabilityScore -= Math.min(16, noneCount * 2);
  if (triggeredInferior && triggeredInferior !== inferior) reliabilityScore -= 14;
  reliabilityScore = Math.max(25, Math.min(96, reliabilityScore));

  const reliabilityLabel = reliabilityScore >= 78 ? 'High' : reliabilityScore >= 58 ? 'Moderate' : 'Exploratory';
  const reliabilityNotes: string[] = [];

  if (behaviorTop && behaviorTop !== dominant) {
    reliabilityNotes.push(`Behavioral evidence leaned toward ${FUNCTION_LABELS[behaviorTop]}, while the full pattern resolved around ${FUNCTION_LABELS[dominant]}.`);
  }
  if (somaticTop && somaticTop !== dominant && somaticTop !== auxiliary) {
    reliabilityNotes.push(`Somatic answers emphasized ${FUNCTION_LABELS[somaticTop]}, which may be a secondary regulation channel.`);
  }
  if (triggeredInferior && triggeredInferior !== inferior) {
    reliabilityNotes.push(`Inferior-trigger answers pointed to ${FUNCTION_LABELS[triggeredInferior]}, but behavioral energy also used that channel strongly; the edge is resolved structurally as ${FUNCTION_LABELS[inferior]}.`);
  } else if (lowestEnergy !== inferior) {
    reliabilityNotes.push(`Inferior-function triggers point to ${FUNCTION_LABELS[inferior]}, even though everyday answers do not make it the absolute lowest bar.`);
  }
  if (Math.abs(introverted - extraverted) <= 12) {
    reliabilityNotes.push('Introversion and extraversion signals are close, so attitude should be read as directional rather than fixed.');
  }
  if (noneCount >= 4) {
    reliabilityNotes.push('Several "none fits" answers lower confidence and may mean the current options miss part of your lived pattern.');
  }
  if (reliabilityNotes.length === 0) {
    reliabilityNotes.push('Behavioral, inferior, somatic, and attitude signals were internally consistent.');
  }

  return {
    version: 'depth-energy-map',
    completedAt: new Date().toISOString(),
    totalQuestions: depthQuestions.length,
    answeredQuestions,
    answers,
    energy,
    hierarchy,
    dominant,
    auxiliary,
    tertiary,
    inferior,
    attitude: {
      introverted,
      extraverted,
      dominant: dominantAttitude,
      summary: `${ATTITUDE_LABELS[dominantAttitude]} energy is stronger in this result (${dominantAttitude === 'introverted' ? introverted : extraverted}%).`,
    },
    layerSignals: {
      behavioral: behaviorTop,
      inferior: triggeredInferior ?? inferior,
      somatic: somaticTop,
      attitude: dominantAttitude,
    },
    inferiorScores,
    reliability: {
      score: reliabilityScore,
      label: reliabilityLabel,
      notes: reliabilityNotes,
    },
    narrative: {
      energyMap: energyMapCopy(dominant, auxiliary, tertiary, inferior, dominantAttitude),
      developmentalEdge: edgeCopy[inferior],
      complexVulnerability: complexCopy[inferior],
      somaticSignature: somaticCopy[somaticTop ?? dominant],
      practice: practiceCopy[inferior],
    },
  };
};

export const isDepthAssessmentResult = (value: unknown): value is DepthAssessmentResult => {
  if (!value || typeof value !== 'object') return false;
  return (value as Partial<DepthAssessmentResult>).version === 'depth-energy-map';
};
