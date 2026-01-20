import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { FUNCTION_DESCRIPTIONS } from '../data/questions';
import { Brain } from 'lucide-react';

interface ShareCardProps {
  dominantFunction: string;
  scores: Array<{ function: string; score: number }>;
  stack: {
    dominant: { function: string; score: number };
    auxiliary: { function: string; score: number };
    tertiary: { function: string; score: number };
    inferior: { function: string; score: number };
  };
}

export const ShareCard: React.FC<ShareCardProps> = ({ dominantFunction, scores, stack }) => {
  const chartData = scores.map(s => ({
    subject: s.function,
    A: s.score,
    fullMark: 100,
  }));

  const funcDescription = FUNCTION_DESCRIPTIONS[dominantFunction];

  return (
    <div 
      className="bg-gradient-to-br from-stone-50 to-stone-100 border-2 border-stone-200 rounded-xl overflow-hidden shadow-xl"
      style={{ width: '1200px', height: '630px' }}
    >
      <div className="h-full flex">
        <div className="flex-1 p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-8 h-8 text-jung-primary" />
              <span className="text-sm font-bold tracking-widest uppercase text-jung-secondary">
                Jungian Typology Assessment
              </span>
            </div>
            
            <div className="mb-6">
              <p className="text-sm uppercase tracking-widest text-jung-accent mb-2">Dominant Function</p>
              <h1 className="text-5xl font-serif font-bold text-jung-dark mb-3">
                {funcDescription?.title || dominantFunction}
              </h1>
              <p className="text-2xl font-mono font-bold text-jung-primary mb-4">({dominantFunction})</p>
              <p className="text-lg text-stone-600 italic leading-relaxed max-w-xl">
                "{funcDescription?.quote}"
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-stone-200">
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-3">Function Stack</p>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xs text-jung-primary font-bold mb-1">Dominant</div>
                <div className="text-lg font-bold text-jung-dark">{stack.dominant.function}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-jung-accent font-bold mb-1">Auxiliary</div>
                <div className="text-lg font-bold text-jung-dark">{stack.auxiliary.function}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-stone-500 font-bold mb-1">Tertiary</div>
                <div className="text-lg font-bold text-stone-600">{stack.tertiary.function}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-stone-400 font-bold mb-1">Inferior</div>
                <div className="text-lg font-bold text-stone-500">{stack.inferior.function}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[400px] bg-gradient-to-br from-jung-primary to-jung-accent flex items-center justify-center p-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 w-full h-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="rgba(255,255,255,0.3)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#ffffff', fontSize: 14, fontWeight: 'bold' }} 
                />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#ffffff"
                  strokeWidth={3}
                  fill="#ffffff"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
