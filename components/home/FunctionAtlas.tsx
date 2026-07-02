import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

type FunctionEntry = {
  code: string;
  attitude: 'Introverted' | 'Extraverted';
  name: string;
  summary: string;
};

type Axis = {
  key: string;
  label: string;
  tensionPair: string;
  functions: [FunctionEntry, FunctionEntry];
};

// Plain-language distillations of the Jungian definitions already used in
// data/questions.ts FUNCTION_DESCRIPTIONS — no claims beyond that source.
const AXES: Axis[] = [
  {
    key: 'thinking',
    label: 'Thinking',
    tensionPair: 'Ti–Fe · Te–Fi',
    functions: [
      {
        code: 'Ti',
        attitude: 'Introverted',
        name: 'Introverted Thinking',
        summary: 'Builds internal frameworks. Wants the idea precise before it is shared.',
      },
      {
        code: 'Te',
        attitude: 'Extraverted',
        name: 'Extraverted Thinking',
        summary: 'Organizes the outer world through systems, criteria, and measurable results.',
      },
    ],
  },
  {
    key: 'feeling',
    label: 'Feeling',
    tensionPair: 'Fi–Te · Fe–Ti',
    functions: [
      {
        code: 'Fi',
        attitude: 'Introverted',
        name: 'Introverted Feeling',
        summary: 'Checks everything against inner values. Deep conviction that rarely announces itself.',
      },
      {
        code: 'Fe',
        attitude: 'Extraverted',
        name: 'Extraverted Feeling',
        summary: 'Reads and tends the emotional field. Keeps the group in workable harmony.',
      },
    ],
  },
  {
    key: 'sensation',
    label: 'Sensation',
    tensionPair: 'Si–Ne · Se–Ni',
    functions: [
      {
        code: 'Si',
        attitude: 'Introverted',
        name: 'Introverted Sensation',
        summary: 'Compares the present against stored impressions. Stability through precedent.',
      },
      {
        code: 'Se',
        attitude: 'Extraverted',
        name: 'Extraverted Sensation',
        summary: 'Tracks what is actually happening. Full contact with the present moment.',
      },
    ],
  },
  {
    key: 'intuition',
    label: 'Intuition',
    tensionPair: 'Ni–Se · Ne–Si',
    functions: [
      {
        code: 'Ni',
        attitude: 'Introverted',
        name: 'Introverted Intuition',
        summary: 'Converges on the underlying pattern. Sees where things are heading.',
      },
      {
        code: 'Ne',
        attitude: 'Extraverted',
        name: 'Extraverted Intuition',
        summary: 'Diverges into possibilities. Keeps finding another way it could go.',
      },
    ],
  },
];

interface FunctionAtlasProps {
  figure: string;
  onStart: () => void;
  onGuideClick?: () => void;
}

export const FunctionAtlas: React.FC<FunctionAtlasProps> = ({ figure, onStart, onGuideClick }) => (
  <section className="border-y border-jung-border-light bg-jung-surface py-12 lg:py-20">
    <div className="lab-container">
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div>
          <p className="figure-label">{figure} — The eight functions</p>
          <h2 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-tight text-jung-dark md:text-5xl">
            Four axes. Eight functions. One working pattern.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-jung-secondary">
            Jung described thinking, feeling, sensation, and intuition, each turned inward or
            outward. Your result is not one label — it is how strongly each of these eight shows
            up, and which pair sits on your dominant–inferior axis.
          </p>
          <p className="annotation mt-4 max-w-lg">
            The axis marked in red is where stress tends to surface: a dominant function paired
            with its inferior opposite.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={onStart}
              variant="accent"
              size="md"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Map my eight functions
            </Button>
            <a
              href="/cognitive-functions"
              onClick={onGuideClick}
              className="link-ink inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-jung-accent"
            >
              Read the full functions guide
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="grid gap-px overflow-hidden rounded-lg border border-jung-border bg-jung-border sm:grid-cols-2">
          {AXES.map((axis) => (
            <div key={axis.key} className="flex flex-col bg-jung-surface">
              <div className="flex items-center justify-between border-b border-jung-border-light px-5 pb-2.5 pt-3.5">
                <span className="text-label">{axis.label}</span>
                <span className="figure-label !text-[10px]">{axis.tensionPair}</span>
              </div>
              <div className="grid flex-1 grid-cols-1 divide-y divide-jung-border-light">
                {axis.functions.map((fn) => (
                  <div key={fn.code} className="group px-5 py-4 transition-colors hover:bg-jung-accent-light/50">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-2xl font-semibold italic text-jung-dark">
                        {fn.code}
                      </span>
                      <span className="text-mono text-[10px] uppercase tracking-[0.14em] text-jung-subtle">
                        {fn.attitude}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-jung-dark">{fn.name}</p>
                    <p className="mt-1.5 text-sm leading-6 text-jung-secondary">{fn.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
