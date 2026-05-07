import { AttitudeDirection, FunctionChannel } from '../data/depthAssessment';
import { DepthAssessmentResult, FunctionPosition, isDepthAssessmentResult } from './depthScoring';

export type LegacyFunctionCode = 'Te' | 'Ti' | 'Fe' | 'Fi' | 'Se' | 'Si' | 'Ne' | 'Ni';

export interface LegacyFunctionScore {
  function: LegacyFunctionCode;
  score: number;
  rawPreference: number;
  rawInferior: number;
  normalized: number;
}

export interface LegacyAnalysisInput {
  scores: LegacyFunctionScore[];
  stack: {
    dominant: LegacyFunctionScore;
    auxiliary: LegacyFunctionScore;
    tertiary: LegacyFunctionScore;
    inferior: LegacyFunctionScore;
    resultVersion?: 'depth-energy-map';
    depthResult?: DepthAssessmentResult;
  };
  attitudeScore: number;
  isUndifferentiated: boolean;
  resultVersion?: 'depth-energy-map';
  depthResult?: DepthAssessmentResult;
}

const ALL_FUNCTIONS: LegacyFunctionCode[] = ['Te', 'Ti', 'Fe', 'Fi', 'Se', 'Si', 'Ne', 'Ni'];

export const functionCodeFor = (
  channel: FunctionChannel,
  attitude: AttitudeDirection,
): LegacyFunctionCode => {
  const introverted = attitude === 'introverted';

  if (channel === 'thinking') return introverted ? 'Ti' : 'Te';
  if (channel === 'feeling') return introverted ? 'Fi' : 'Fe';
  if (channel === 'sensation') return introverted ? 'Si' : 'Se';
  return introverted ? 'Ni' : 'Ne';
};

const oppositeAttitude = (attitude: AttitudeDirection): AttitudeDirection =>
  attitude === 'introverted' ? 'extraverted' : 'introverted';

const scoreFor = (code: LegacyFunctionCode, score: number): LegacyFunctionScore => {
  const bounded = Math.max(0, Math.min(100, Math.round(score)));
  const raw = Number((1 + (bounded / 100) * 4).toFixed(2));

  return {
    function: code,
    score: bounded,
    rawPreference: raw,
    rawInferior: Number((5 - (bounded / 100) * 4).toFixed(2)),
    normalized: bounded,
  };
};

const stackScoreFor = (position: FunctionPosition): LegacyFunctionScore =>
  scoreFor(functionCodeFor(position.channel, position.attitude), position.score);

export const depthResultToLegacyAnalysisInput = (result: DepthAssessmentResult): LegacyAnalysisInput => {
  const scoreMap = new Map<LegacyFunctionCode, LegacyFunctionScore>();

  result.energy.forEach((energy) => {
    const position = result.hierarchy.find((item) => item.channel === energy.channel);
    const primaryAttitude = position?.attitude ?? result.attitude.dominant;
    const primaryCode = functionCodeFor(energy.channel, primaryAttitude);
    const secondaryCode = functionCodeFor(energy.channel, oppositeAttitude(primaryAttitude));

    scoreMap.set(primaryCode, scoreFor(primaryCode, energy.score));
    scoreMap.set(secondaryCode, scoreFor(secondaryCode, Math.max(4, Math.round(energy.score * 0.34))));
  });

  ALL_FUNCTIONS.forEach((code) => {
    if (!scoreMap.has(code)) scoreMap.set(code, scoreFor(code, 4));
  });

  const dominant = stackScoreFor(result.hierarchy[0]);
  const auxiliary = stackScoreFor(result.hierarchy[1]);
  const tertiary = stackScoreFor(result.hierarchy[2]);
  const inferior = stackScoreFor(result.hierarchy[3]);

  scoreMap.set(dominant.function, dominant);
  scoreMap.set(auxiliary.function, auxiliary);
  scoreMap.set(tertiary.function, tertiary);
  scoreMap.set(inferior.function, inferior);

  const spread = Math.max(...result.energy.map((item) => item.score)) - Math.min(...result.energy.map((item) => item.score));

  return {
    scores: ALL_FUNCTIONS.map((code) => scoreMap.get(code)!),
    stack: {
      dominant,
      auxiliary,
      tertiary,
      inferior,
      resultVersion: 'depth-energy-map',
      depthResult: result,
    },
    attitudeScore: result.attitude.extraverted - result.attitude.introverted,
    isUndifferentiated: result.reliability.label === 'Exploratory' || spread < 18,
    resultVersion: 'depth-energy-map',
    depthResult: result,
  };
};

export const extractDepthResult = (value: unknown): DepthAssessmentResult | null => {
  if (isDepthAssessmentResult(value)) return value;

  if (!value || typeof value !== 'object') return null;

  const maybeRecord = value as Record<string, any>;
  const candidates = [
    maybeRecord.depthResult,
    maybeRecord.stack?.depthResult,
    maybeRecord.stack?.depth_result,
    maybeRecord.result?.depthResult,
  ];

  for (const candidate of candidates) {
    if (isDepthAssessmentResult(candidate)) return candidate;
  }

  return null;
};
