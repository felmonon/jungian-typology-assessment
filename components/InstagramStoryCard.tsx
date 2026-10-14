import React from 'react';
import { FUNCTION_DESCRIPTIONS } from '../data/questions';

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
        background: 'linear-gradient(165deg, #3D2914 0%, #4A3520 30%, #5C4033 60%, #6B4D3B 100%)',
        fontFamily: '"DM Sans", sans-serif'
      }}
    >
      {/* Decorative background elements */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, #B87333 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, #3D2914 0%, transparent 40%),
                            radial-gradient(circle at 50% 50%, #B87333 0%, transparent 60%)`
        }}
      />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-jung-accent via-[#C48542] to-jung-accent" />

      {/* Decorative circles */}
      <div className="absolute top-20 left-12 w-32 h-32 border border-[#B87333]/20 rounded-full" />
      <div className="absolute top-32 left-20 w-16 h-16 border border-[#B87333]/15 rounded-full" />
      <div className="absolute bottom-40 right-12 w-24 h-24 border border-[#B87333]/20 rounded-full" />
      <div className="absolute bottom-52 right-20 w-12 h-12 border border-[#B87333]/15 rounded-full" />

      {/* Psi symbol watermark */}
      <div
        className="absolute top-64 right-16 text-9xl font-bold select-none"
        style={{ color: 'rgba(184, 115, 51, 0.08)', fontFamily: '"Playfair Display", serif' }}
      >
        ψ
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col px-16 py-20">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-0.5 bg-gradient-to-r from-[#B87333] to-transparent" />
            <span
              className="text-lg tracking-[0.3em] uppercase font-medium"
              style={{ color: '#B87333' }}
            >
              Jungian Profile
            </span>
          </div>
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col justify-center -mt-20">
          <div className="mb-4">
            <span
              className="text-2xl tracking-[0.2em] uppercase font-light"
              style={{ color: 'rgba(184, 115, 51, 0.8)' }}
            >
              Dominant Function
            </span>
          </div>

          <h1
            className="leading-none mb-6"
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: '120px',
              fontWeight: 700,
              color: '#FAF9F7',
              textShadow: '0 4px 30px rgba(184, 115, 51, 0.3)'
            }}
          >
            {funcDescription?.title || dominantFunction}
          </h1>

          <div className="inline-flex items-center gap-4 mb-16">
            <span
              className="text-6xl font-bold"
              style={{ color: '#B87333' }}
            >
              {dominantFunction}
            </span>
            <div className="w-16 h-0.5" style={{ backgroundColor: 'rgba(184, 115, 51, 0.5)' }} />
            <span style={{ color: '#A39585', fontSize: '24px' }}>
              Score: {stack.dominant.score}
            </span>
          </div>

          <div
            className="text-3xl italic leading-relaxed max-w-3xl mb-20"
            style={{ fontFamily: '"Playfair Display", serif', color: '#E8E4DE' }}
          >
            "{funcDescription?.quote}"
          </div>

          {/* Function Stack Card */}
          <div
            className="p-10 rounded-3xl mb-16"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(184, 115, 51, 0.2)'
            }}
          >
            <h3
              className="text-xl tracking-[0.2em] uppercase mb-8 font-medium"
              style={{ color: '#B87333' }}
            >
              Function Stack
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Dominant', func: stack.dominant, color: '#B87333' },
                { label: 'Auxiliary', func: stack.auxiliary, color: '#C48542' },
                { label: 'Tertiary', func: stack.tertiary, color: '#8B7355' },
                { label: 'Inferior', func: stack.inferior, color: '#6B5B50' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6">
                  <span
                    className="text-lg w-32 uppercase tracking-wider"
                    style={{ color: '#8B7355' }}
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
                    background: i === 0 ? '#B87333' : i === 1 ? '#C48542' : 'rgba(255,255,255,0.1)',
                    border: i > 1 ? '2px solid rgba(184, 115, 51, 0.3)' : 'none'
                  }}
                >
                  {score.function}
                </div>
                <span style={{ color: '#8B7355', fontSize: '18px' }}>{score.score}</span>
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
                  style={{ fontFamily: '"Playfair Display", serif', color: '#FAF9F7' }}
                >
                  Discover Your Type
                </div>
                <div className="text-xl tracking-wider" style={{ color: '#B87333' }}>
                  jungiandevelopment.com
                </div>
              </div>
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #B87333 0%, #3D2914 100%)'
                }}
              >
                <span
                  className="text-white text-4xl"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  ψ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-jung-accent via-[#C48542] to-jung-accent" />
    </div>
  );
};
