import { beforeEach, describe, expect, it, vi } from 'vitest';
import aiHandler from '../../api/ai/[action]';
import chatHandler from '../../api/chat';
import { getSessionUser } from '../../api/_lib/auth';
import { generateGeminiText } from '../../api/_lib/gemini';
import { findCompletedPurchaseForUser } from '../../api/_lib/purchases';
import { depthQuestions } from '../../data/depthAssessment';
import { PREMIUM_REPORT_KEYS } from '../../lib/premium-report';
import { depthResultToLegacyAnalysisInput } from '../../utils/depthCompatibility';
import { calculateDepthResults } from '../../utils/depthScoring';

vi.mock('../../api/_lib/gemini', () => ({ generateGeminiText: vi.fn() }));
vi.mock('../../api/_lib/auth', () => ({ getSessionUser: vi.fn() }));
vi.mock('../../api/_lib/purchases', () => ({
  findCompletedPurchaseForUser: vi.fn(),
  isCheckoutSessionRedeemableBy: vi.fn(),
  resolveTierFromCheckoutSession: vi.fn(),
}));
vi.mock('../../api/_lib/supabase', () => ({ getSupabaseAdminClient: vi.fn(() => ({})), hasSupabaseAdminConfig: vi.fn(() => true) }));
vi.mock('../../api/_lib/rate-limit', () => ({ enforceRateLimit: vi.fn(() => false) }));

// The body the results page really sends: the browser's own conversion of a
// scored assessment, after the JSON round trip of a fetch.
function clientPayload(answering: 'decisively' | 'with none fits') {
  const answers = Object.fromEntries(depthQuestions.map((question) => {
    if (answering === 'with none fits') return [question.id, 'none'];
    const option = question.options.find((candidate) => {
      if (question.layer === 'inferior') return candidate.inferior === 'feeling';
      if (question.layer === 'attitude') return candidate.attitude === 'introverted';
      return candidate.channel === 'thinking';
    });
    return [question.id, option?.id ?? 'none'];
  }));
  return JSON.parse(JSON.stringify(depthResultToLegacyAnalysisInput(calculateDepthResults(answers))));
}

function chatPayload(input: ReturnType<typeof clientPayload>) {
  return {
    message: 'How does my type handle stress?',
    history: [
      { role: 'user', content: 'What is my dominant function?' },
      { role: 'assistant', content: 'Your map is led by introverted thinking.' },
    ],
    userProfile: {
      dominantFunction: input.stack.dominant.function,
      auxiliaryFunction: input.stack.auxiliary.function,
      tertiaryFunction: input.stack.tertiary.function,
      inferiorFunction: input.stack.inferior.function,
      scores: input.scores.map((score: { function: string; score: number }) => ({ function: score.function, score: score.score })),
      attitudeScore: input.attitudeScore,
    },
  };
}

const valid = clientPayload('decisively');
const validChat = chatPayload(valid);
// A JSON object can shadow toString, which breaks string conversion.
const unprintable = { toString: 1, valueOf: 1 };
// Vercel parses the body lazily and throws on first read when it is not JSON.
const MALFORMED_JSON = Symbol('malformed JSON');

function request(action: string | null, body: unknown) {
  const req: any = { method: 'POST', headers: {}, query: action ? { action } : {} };
  if (body === MALFORMED_JSON) {
    Object.defineProperty(req, 'body', {
      get() {
        throw Object.assign(new Error('Invalid JSON'), { statusCode: 400 });
      },
    });
  } else {
    req.body = body;
  }
  return req;
}

function response() {
  const res: any = { statusCode: 200, body: null, headers: {} };
  res.status = (status: number) => { res.statusCode = status; return res; };
  res.json = (body: unknown) => { res.body = body; return res; };
  res.setHeader = (key: string, value: string) => { res.headers[key] = value; };
  return res;
}

async function post(handler: (req: any, res: any) => unknown, action: string | null, body: unknown) {
  const res = response();
  await handler(request(action, body), res);
  return res;
}

const usableAnalysis = `${'You tend to organise experience through a precise inner framework before acting on it. '.repeat(8)}That is the pattern to observe.`;
const reportSection = 'You may notice a preference for checking the reasoning behind a decision before committing to it. When that pattern is useful, it gives you a way to separate observations from assumptions. When it becomes rigid, you might keep refining an explanation instead of asking what another person needs from the conversation. Try recording one recent example, the evidence you used, and one detail that could change your interpretation. Treat this as a possibility to observe over a week, rather than a fixed description of your personality.';

beforeEach(() => {
  vi.mocked(generateGeminiText).mockReset().mockResolvedValue(usableAnalysis);
  vi.mocked(getSessionUser).mockReset().mockResolvedValue({ id: 'reader' });
  vi.mocked(findCompletedPurchaseForUser).mockReset().mockResolvedValue({ tier: 'mastery' } as any);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

const notJsonObjects: [string, unknown][] = [
  ['malformed JSON', MALFORMED_JSON],
  ['a missing body', undefined],
  ['a null body', null],
  ['an empty text body', ''],
  ['a text body', 'scores=1'],
  ['a number', 42],
  ['an array', [valid]],
  ['an empty object', {}],
];

describe('free analysis input', () => {
  const invalid: [string, unknown][] = [
    ...notJsonObjects,
    ['scores that are not a list', { ...valid, scores: 'high' }],
    ['scores as an object', { ...valid, scores: { Ti: 82 } }],
    ['a score entry that is a number', { ...valid, scores: [82, 64] }],
    ['a null score entry', { ...valid, scores: [null] }],
    ['a score entry without a score', { ...valid, scores: [{ function: 'Ti' }] }],
    ['a score given as text', { ...valid, scores: [{ function: 'Ti', score: '82' }] }],
    ['a function code that is not text', { ...valid, scores: [{ function: unprintable, score: 82 }] }],
    ['a missing stack', { ...valid, stack: undefined }],
    ['a stack that is a number', { ...valid, stack: 7 }],
    ['a stack that is a list', { ...valid, stack: [valid.stack.dominant] }],
    ['a stack without an inferior position', { ...valid, stack: { ...valid.stack, inferior: undefined } }],
    ['a stack position with a text score', { ...valid, stack: { ...valid.stack, tertiary: { function: 'Ne', score: 'low' } } }],
    ['an attitude score given as text', { ...valid, attitudeScore: '12' }],
    ['an attitude score given as an object', { ...valid, attitudeScore: {} }],
    ['a depth channel that cannot be printed', { ...valid, depthResult: { ...valid.depthResult, dominant: unprintable } }],
    ['a depth narrative that cannot be printed', { ...valid, depthResult: { ...valid.depthResult, narrative: { developmentalEdge: [unprintable] } } }],
    ['a depth reliability that cannot be printed', { ...valid, depthResult: { ...valid.depthResult, reliability: { score: unprintable } } }],
    ['a stack depth result that cannot be printed', { ...valid, depthResult: undefined, stack: { ...valid.stack, depthResult: { inferior: unprintable } } }],
  ];

  it.each(invalid)('answers 400 for %s', async (_name, body) => {
    const res = await post(aiHandler, 'free-analysis', body);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid assessment data format' });
    expect(generateGeminiText).not.toHaveBeenCalled();
  });

  it('still analyses the body the results page sends', async () => {
    const res = await post(aiHandler, 'free-analysis', valid);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ analysis: usableAnalysis, generationSource: 'gemini' });
    const prompt = vi.mocked(generateGeminiText).mock.calls[0][0];
    expect(prompt).toContain('Dominant: Introverted Thinking (Ti)');
    expect(prompt).toContain('Dominant channel: thinking');
    expect(prompt).toContain('Overall Attitude: Introverted');
  });

  it('still analyses a result where every answer was "none fits"', async () => {
    const res = await post(aiHandler, 'free-analysis', clientPayload('with none fits'));

    expect(res.statusCode).toBe(200);
    expect(res.body.generationSource).toBe('gemini');
  });

  it.each([
    ['only the required fields', { scores: valid.scores, stack: { ...valid.stack, depthResult: undefined, resultVersion: undefined } }],
    ['a null attitude score', { ...valid, attitudeScore: null }],
    ['a depth result that is not an object', { ...valid, depthResult: 'unknown' }],
    ['extra fields', { ...valid, checkoutSessionId: 'cs_test_1', unexpected: { nested: [1, 2, 3] } }],
  ])('accepts %s and falls back to the template when the provider is down', async (_name, body) => {
    vi.mocked(generateGeminiText).mockRejectedValue(new Error('AI service error'));

    const res = await post(aiHandler, 'free-analysis', body);

    expect(res.statusCode).toBe(200);
    expect(res.body.generationSource).toBe('template');
    expect(res.body.analysis).toContain('Your function-stack map is led by');
  });
});

describe('premium report input', () => {
  const invalid: [string, unknown][] = [
    ...notJsonObjects,
    ['scores that are not a list', { ...valid, scores: 'high' }],
    ['scores as an object', { ...valid, scores: { Ti: 82 } }],
    ['a missing stack', { ...valid, stack: undefined }],
    ['a stack that is text', { ...valid, stack: 'Ti-Ne-Si-Fe' }],
    ['a stack that is a list', { ...valid, stack: [valid.stack.dominant] }],
  ];

  it.each(invalid)('answers 400 for %s before any account or payment lookup', async (_name, body) => {
    const res = await post(aiHandler, 'premium-analysis', body);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid assessment data format' });
    expect(getSessionUser).not.toHaveBeenCalled();
    expect(findCompletedPurchaseForUser).not.toHaveBeenCalled();
    expect(generateGeminiText).not.toHaveBeenCalled();
  });

  it('still delivers a report for the body the results page sends', async () => {
    const report = Object.fromEntries(PREMIUM_REPORT_KEYS.map((key) => [key, reportSection]));
    vi.mocked(generateGeminiText).mockResolvedValue(JSON.stringify(report));

    const res = await post(aiHandler, 'premium-analysis', { ...valid, checkoutSessionId: 'cs_test_1' });

    expect(res.statusCode).toBe(200);
    expect(res.body.analysis).toEqual(report);
  });

  it('still checks the purchase for a well-formed request', async () => {
    vi.mocked(findCompletedPurchaseForUser).mockResolvedValue(null);

    const res = await post(aiHandler, 'premium-analysis', { scores: [], stack: {} });

    expect(res.statusCode).toBe(403);
    expect(generateGeminiText).not.toHaveBeenCalled();
  });
});

describe('guide chat input', () => {
  const missing: [string, unknown][] = [
    ...notJsonObjects,
    ['a message that is a number', { ...validChat, message: 5 }],
    ['a message that is a list', { ...validChat, message: ['hello'] }],
    ['a blank message', { ...validChat, message: '   ' }],
    ['a missing profile', { ...validChat, userProfile: null }],
  ];
  const malformed: [string, unknown][] = [
    ['a profile that is text', { ...validChat, userProfile: 'INTP' }],
    ['a profile without scores', { ...validChat, userProfile: { ...validChat.userProfile, scores: undefined } }],
    ['a profile score given as text', { ...validChat, userProfile: { ...validChat.userProfile, scores: [{ function: 'Ti', score: 'high' }] } }],
    ['a null profile score', { ...validChat, userProfile: { ...validChat.userProfile, scores: [null] } }],
    ['a function code that is not text', { ...validChat, userProfile: { ...validChat.userProfile, inferiorFunction: unprintable } }],
    ['a missing function code', { ...validChat, userProfile: { ...validChat.userProfile, dominantFunction: undefined } }],
    ['an attitude score given as text', { ...validChat, userProfile: { ...validChat.userProfile, attitudeScore: 'introverted' } }],
    ['a null history', { ...validChat, history: null }],
    ['a history that is text', { ...validChat, history: 'user: hello' }],
    ['a null history entry', { ...validChat, history: [null] }],
    ['a history entry without content', { ...validChat, history: [{ role: 'user' }] }],
    ['a history entry that cannot be printed', { ...validChat, history: [{ role: 'user', content: unprintable }] }],
  ];

  it.each(missing)('answers 400 for %s', async (_name, body) => {
    const res = await post(chatHandler, null, body);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Message and user profile are required' });
    expect(findCompletedPurchaseForUser).not.toHaveBeenCalled();
    expect(generateGeminiText).not.toHaveBeenCalled();
  });

  it.each(malformed)('answers 400 for %s', async (_name, body) => {
    const res = await post(chatHandler, null, body);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid chat request format' });
    expect(findCompletedPurchaseForUser).not.toHaveBeenCalled();
    expect(generateGeminiText).not.toHaveBeenCalled();
  });

  it('still asks for a sign-in before it reads the body', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    expect((await post(chatHandler, null, MALFORMED_JSON)).statusCode).toBe(401);
    expect((await post(chatHandler, null, validChat)).statusCode).toBe(401);
  });

  it('still answers the message the guide sends', async () => {
    vi.mocked(generateGeminiText).mockResolvedValue('**Stress** tends to pull you toward feeling.');

    const res = await post(chatHandler, null, validChat);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ response: 'Stress tends to pull you toward feeling.' });
    const prompt = vi.mocked(generateGeminiText).mock.calls[0][0];
    expect(prompt).toContain('Dominant: Introverted Thinking (Ti)');
    expect(prompt).toContain('user: What is my dominant function?');
  });

  it.each([
    ['no history', { ...validChat, history: undefined }],
    ['a null attitude score', { ...validChat, userProfile: { ...validChat.userProfile, attitudeScore: null } }],
    ['the profile of an all "none fits" result', chatPayload(clientPayload('with none fits'))],
  ])('accepts %s', async (_name, body) => {
    expect((await post(chatHandler, null, body)).statusCode).toBe(200);
  });

  it('still requires Mastery for a well-formed message', async () => {
    vi.mocked(findCompletedPurchaseForUser).mockResolvedValue({ tier: 'insight' } as any);

    const res = await post(chatHandler, null, validChat);

    expect(res.statusCode).toBe(403);
    expect(generateGeminiText).not.toHaveBeenCalled();
  });
});
