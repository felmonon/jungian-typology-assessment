// Plain-language readings for the eight function-attitudes. Educational
// shorthand, not a measurement: each line describes a tendency to compare
// with the reader's own experience.

export type FunctionCode = 'Ti' | 'Te' | 'Fi' | 'Fe' | 'Si' | 'Se' | 'Ni' | 'Ne';

export const FUNCTION_CODES: FunctionCode[] = ['Ti', 'Te', 'Fi', 'Fe', 'Si', 'Se', 'Ni', 'Ne'];

export const FUNCTION_READINGS: Record<FunctionCode, {
  name: string;
  verb: string;
  description: string;
  /** How this function can show up when it is the least developed one. */
  belowTheLine: string;
}> = {
  Ti: {
    name: 'Introverted Thinking',
    verb: 'Find the logic',
    description: 'Look for an explanation that holds together. Compare this tendency with how you actually make decisions.',
    belowTheLine: 'Under strain it can surface as cold, nit-picking criticism that feels unlike you.',
  },
  Te: {
    name: 'Extraverted Thinking',
    verb: 'Make it work',
    description: 'Organize what is outside you into an effective plan. Notice when a clear outcome helps you move forward.',
    belowTheLine: 'Under strain it can surface as sudden, blunt judgments about who is competent.',
  },
  Fi: {
    name: 'Introverted Feeling',
    verb: 'Know what matters',
    description: 'Check a choice against your own values. Reflect on what feels personally important and why.',
    belowTheLine: 'Under strain it can surface as hurt feelings that seem to arrive from nowhere.',
  },
  Fe: {
    name: 'Extraverted Feeling',
    verb: 'Find connection',
    description: 'Attend to the emotional space between people. Notice how you respond to shared needs and expectations.',
    belowTheLine: 'Under strain it can surface as sharp sensitivity to how others see you.',
  },
  Si: {
    name: 'Introverted Sensation',
    verb: 'Draw on experience',
    description: 'Compare the present with an inner sense of what is familiar. Notice how experience shapes your expectations.',
    belowTheLine: 'Under strain it can surface as worry about the body and small details.',
  },
  Se: {
    name: 'Extraverted Sensation',
    verb: 'Meet the moment',
    description: 'Engage with what is happening around you. Notice the concrete details that invite a response.',
    belowTheLine: 'Under strain it can surface as overindulgence or fixation on sensory detail.',
  },
  Ni: {
    name: 'Introverted Intuition',
    verb: 'See the thread',
    description: 'Follow the underlying meaning in what you notice. Check your interpretation against new information.',
    belowTheLine: 'Under strain it can surface as dark hunches about what things secretly mean.',
  },
  Ne: {
    name: 'Extraverted Intuition',
    verb: 'Open possibilities',
    description: 'Connect ideas and explore what else could be. Notice which possibilities deserve a closer look.',
    belowTheLine: 'Under strain it can surface as a rush of worst-case possibilities.',
  },
};

const OPPOSITE_CHANNEL: Record<string, string> = { T: 'F', F: 'T', S: 'N', N: 'S' };

/** The function that sits opposite a dominant in the classic four-function stack. */
export const inferiorOf = (code: FunctionCode): FunctionCode =>
  `${OPPOSITE_CHANNEL[code[0]]}${code[1] === 'i' ? 'e' : 'i'}` as FunctionCode;

export const isFunctionCode = (value: string): value is FunctionCode =>
  (FUNCTION_CODES as string[]).includes(value);
