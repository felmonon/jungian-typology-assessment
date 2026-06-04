import React from 'react';
import { FUNCTION_DESCRIPTIONS } from '../data/questions';
import { TypeJungMark } from './brand/TypeJungMark';

interface InstagramStoryCardProps {
  dominantFunction: string;
  scores: Array<{ function: string; score: number }>;
  stack: {
    dominant: { function: string; score: number };
    auxiliary: { function: string; score: number };
    tertiary: { function: string; score: number };
    inferior: { function: string; score: number };
  };
}

export const InstagramStoryCard: React.FC<InstagramStoryCardProps> = ({
  dominantFunction,
  scores,
  stack
}) => {
  const funcDescription = FUNCTION_DESCRIPTIONS[dominantFunction];
  const sortedScores = [...scores].sort((a, b) => b.score - a.score).slice(0, 4);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: '1080px',
        height: '1920px',
        background: 'linear-gradient(165deg, #121712 0%, #192019 45%, #234832 100%)',
        fontFamily: '"Space Grotesk", sans-serif'
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-jung-accent via-jung-gold to-jung-accent" />

      {/* Subtle energy-map linework */}
      <div className="absolute inset-x-16 top-32 h-px bg-white/10" />
      <div className="absolute inset-y-24 left-16 w-px bg-white/10" />
      <div className="absolute inset-y-24 right-16 w-px bg-white/10" />

      {/* Psi symbol watermark */}
      <div
        className="absolute top-64 right-16 text-9xl font-bold select-none"
        style={{ color: 'rgba(232, 241, 234, 0.08)', fontFamily: '"Fraunces", Georgia, serif' }}
      >
        ψ
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col px-16 py-20">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-0.5 bg-gradient-to-r from-jung-accent-light to-transparent" />
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white">
              <TypeJungMark size="sm" />
            </div>
            <span
              className="text-lg tracking-[0.3em] uppercase font-medium"
              style={{ color: '#e8f1ea' }}
            >
              TypeJung Profile
            </span>
          </div>
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col justify-center -mt-20">
          <div className="mb-4">
            <span
              className="text-2xl tracking-[0.2em] uppercase font-light"
              style={{ color: 'rgba(232, 241, 234, 0.8)' }}
            >
              Dominant Function
            </span>
          </div>

          <h1
            className="leading-none mb-6"
            style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: '120px',
              fontWeight: 700,
              color: '#FAF9F7',
              textShadow: '0 4px 30px rgba(45, 90, 61, 0.42)'
            }}
          >
            {funcDescription?.title || dominantFunction}
          </h1>

          <div className="inline-flex items-center gap-4 mb-16">
            <span
              className="text-6xl font-bold"
              style={{ color: '#e8f1ea' }}
            >
              {dominantFunction}
            </span>
            <div className="w-16 h-0.5" style={{ backgroundColor: 'rgba(232, 241, 234, 0.5)' }} />
            <span style={{ color: '#b9c4ba', fontSize: '24px' }}>
              Score: {stack.dominant.score}
            </span>
          </div>

          <div
            className="text-3xl italic leading-relaxed max-w-3xl mb-20"
            style={{ fontFamily: '"Source Serif 4", Georgia, serif', color: '#f4f1ea' }}
          >
            "{funcDescription?.quote}"
          </div>

          {/* Function Stack Card */}
          <div
            className="p-10 rounded-lg mb-16"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(127, 160, 133, 0.3)'
            }}
          >
            <h3
              className="text-xl tracking-[0.2em] uppercase mb-8 font-medium"
              style={{ color: '#e8f1ea' }}
            >
              Function Stack
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Dominant', func: stack.dominant, color: '#2d5a3d' },
                { label: 'Auxiliary', func: stack.auxiliary, color: '#2f6f58' },
                { label: 'Tertiary', func: stack.tertiary, color: '#7fa085' },
                { label: 'Inferior', func: stack.inferior, color: '#a17932' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6">
                  <span
                    className="text-lg w-32 uppercase tracking-wider"
                    style={{ color: '#b9c4ba' }}
                  >
                    {item.label}
                  </span>
                  <div
                    className="flex-1 h-12 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <div
                      className="h-full rounded-full flex items-center justify-between px-6 transition-all"
                      style={{
                        width: `${Math.max(item.func.score, 20)}%`,
                        background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}80 100%)`
                      }}
                    >
                      <span className="text-white font-bold text-xl">
                        {item.func.function}
                      </span>
                      <span className="text-white/80 text-lg font-medium">
                        {item.func.score}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top functions badges */}
          <div className="flex items-center gap-8 mb-6">
            {sortedScores.map((score, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2"
                  style={{
                    background: i === 0 ? '#2d5a3d' : i === 1 ? '#2f6f58' : 'rgba(255,255,255,0.1)',
                    border: i > 1 ? '2px solid rgba(127, 160, 133, 0.35)' : 'none'
                  }}
                >
                  {score.function}
                </div>
                <span style={{ color: '#b9c4ba', fontSize: '18px' }}>{score.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-10">
          <div className="border-t pt-10" style={{ borderColor: 'rgba(139, 115, 85, 0.3)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div
                  className="text-2xl font-medium mb-2"
                  style={{ fontFamily: '"Fraunces", Georgia, serif', color: '#FAF9F7' }}
                >
                  Map Your Energy
                </div>
                <div className="text-xl tracking-wider" style={{ color: '#e8f1ea' }}>
                  typejung.com
                </div>
              </div>
              <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-white">
                <TypeJungMark size="lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-jung-accent via-jung-gold to-jung-accent" />
    </div>
  );
};
