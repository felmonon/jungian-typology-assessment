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
        background: 'linear-gradient(165deg, #1c1917 0%, #292524 30%, #44403c 60%, #57534e 100%)',
        fontFamily: '"IBM Plex Sans", sans-serif'
      }}
    >
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, #b45309 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, #451a03 0%, transparent 40%),
                            radial-gradient(circle at 50% 50%, #b45309 0%, transparent 60%)`
        }}
      />
      
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700" />
      
      <div className="absolute top-20 left-12 w-32 h-32 border border-amber-700/20 rounded-full" />
      <div className="absolute top-32 left-20 w-16 h-16 border border-amber-600/15 rounded-full" />
      <div className="absolute bottom-40 right-12 w-24 h-24 border border-amber-700/20 rounded-full" />
      <div className="absolute bottom-52 right-20 w-12 h-12 border border-amber-600/15 rounded-full" />
      
      <div className="absolute top-64 right-16 text-amber-700/10 text-9xl font-serif font-bold select-none">
        ψ
      </div>
      
      <div className="relative z-10 h-full flex flex-col px-16 py-20">
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-0.5 bg-gradient-to-r from-amber-600 to-transparent" />
            <span 
              className="text-amber-500 text-lg tracking-[0.3em] uppercase font-medium"
              style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
            >
              Jungian Profile
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center -mt-20">
          <div className="mb-4">
            <span 
              className="text-amber-500/80 text-2xl tracking-[0.2em] uppercase font-light"
            >
              Dominant Function
            </span>
          </div>
          
          <h1 
            className="text-white leading-none mb-6"
            style={{ 
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: '120px',
              fontWeight: 700,
              textShadow: '0 4px 30px rgba(180, 83, 9, 0.3)'
            }}
          >
            {funcDescription?.title || dominantFunction}
          </h1>
          
          <div 
            className="inline-flex items-center gap-4 mb-16"
          >
            <span 
              className="text-6xl font-bold text-amber-500"
              style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
            >
              {dominantFunction}
            </span>
            <div className="w-16 h-0.5 bg-amber-600/50" />
            <span className="text-stone-400 text-2xl">
              Score: {stack.dominant.score}
            </span>
          </div>

          <div 
            className="text-stone-300 text-3xl italic leading-relaxed max-w-3xl mb-20"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            "{funcDescription?.quote}"
          </div>

          <div 
            className="p-10 rounded-3xl mb-16"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(180, 83, 9, 0.2)'
            }}
          >
            <h3 className="text-amber-500 text-xl tracking-[0.2em] uppercase mb-8 font-medium">
              Function Stack
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Dominant', func: stack.dominant, color: '#b45309' },
                { label: 'Auxiliary', func: stack.auxiliary, color: '#d97706' },
                { label: 'Tertiary', func: stack.tertiary, color: '#78716c' },
                { label: 'Inferior', func: stack.inferior, color: '#57534e' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6">
                  <span className="text-stone-500 text-lg w-32 uppercase tracking-wider">
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

          <div className="flex items-center gap-8 mb-6">
            {sortedScores.map((score, i) => (
              <div key={i} className="flex flex-col items-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2"
                  style={{
                    background: i === 0 ? '#b45309' : i === 1 ? '#d97706' : 'rgba(255,255,255,0.1)',
                    border: i > 1 ? '2px solid rgba(180, 83, 9, 0.3)' : 'none'
                  }}
                >
                  {score.function}
                </div>
                <span className="text-stone-500 text-lg">{score.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-10">
          <div className="border-t border-stone-700/50 pt-10">
            <div className="flex items-center justify-between">
              <div>
                <div 
                  className="text-white text-2xl font-medium mb-2"
                  style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                  Discover Your Type
                </div>
                <div className="text-amber-500 text-xl tracking-wider">
                  jungiandevelopment.com
                </div>
              </div>
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #b45309 0%, #451a03 100%)'
                }}
              >
                <span 
                  className="text-white text-4xl"
                  style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                  ψ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700" />
    </div>
  );
};
