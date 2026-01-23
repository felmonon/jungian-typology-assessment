import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { FUNCTION_DESCRIPTIONS } from '../data/questions';

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
      className="overflow-hidden"
      style={{
        width: '1200px',
        height: '630px',
        background: 'linear-gradient(135deg, #FAF9F7 0%, #F5F3F0 50%, #EBE8E3 100%)',
        fontFamily: '"Source Serif 4", Georgia, serif'
      }}
    >
      <div className="h-full flex">
        {/* Left content area */}
        <div className="flex-1 p-10 flex flex-col justify-between border-r border-[#E8E4DE]">
          <div>
            {/* Logo/Brand */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #B87333 0%, #9A6229 100%)' }}
              >
                <span className="text-white text-xl" style={{ fontFamily: '"Playfair Display", serif' }}>ψ</span>
              </div>
              <span
                className="text-sm font-semibold tracking-[0.2em] uppercase"
                style={{ color: '#5C4033', fontFamily: '"DM Sans", sans-serif' }}
              >
                Jungian Typology Assessment
              </span>
            </div>

            {/* Main content */}
            <div className="mb-8">
              <p
                className="text-sm uppercase tracking-[0.25em] mb-3"
                style={{ color: '#B87333', fontFamily: '"DM Sans", sans-serif' }}
              >
                Dominant Function
              </p>
              <h1
                className="text-5xl font-bold mb-4 leading-tight"
                style={{ color: '#3D2914', fontFamily: '"Playfair Display", serif' }}
              >
                {funcDescription?.title || dominantFunction}
              </h1>
              <p
                className="text-2xl font-bold mb-5"
                style={{ color: '#B87333', fontFamily: '"DM Sans", sans-serif' }}
              >
                ({dominantFunction})
              </p>
              <p
                className="text-lg italic leading-relaxed max-w-xl"
                style={{ color: '#5C4033' }}
              >
                "{funcDescription?.quote}"
              </p>
            </div>
          </div>

          {/* Function stack */}
          <div
            className="rounded-xl p-5 border"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DE' }}
          >
            <p
              className="text-xs uppercase tracking-[0.2em] mb-4"
              style={{ color: '#8B7355', fontFamily: '"DM Sans", sans-serif' }}
            >
              Function Stack
            </p>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div
                  className="text-xs font-bold mb-1"
                  style={{ color: '#B87333', fontFamily: '"DM Sans", sans-serif' }}
                >
                  Dominant
                </div>
                <div className="text-lg font-bold" style={{ color: '#3D2914' }}>
                  {stack.dominant.function}
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-xs font-bold mb-1"
                  style={{ color: '#C48542', fontFamily: '"DM Sans", sans-serif' }}
                >
                  Auxiliary
                </div>
                <div className="text-lg font-bold" style={{ color: '#3D2914' }}>
                  {stack.auxiliary.function}
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-xs font-bold mb-1"
                  style={{ color: '#8B7355', fontFamily: '"DM Sans", sans-serif' }}
                >
                  Tertiary
                </div>
                <div className="text-lg font-bold" style={{ color: '#5C4033' }}>
                  {stack.tertiary.function}
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-xs font-bold mb-1"
                  style={{ color: '#A39585', fontFamily: '"DM Sans", sans-serif' }}
                >
                  Inferior
                </div>
                <div className="text-lg font-bold" style={{ color: '#8B7355' }}>
                  {stack.inferior.function}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right chart area */}
        <div
          className="w-[400px] flex items-center justify-center p-6"
          style={{ background: 'linear-gradient(135deg, #3D2914 0%, #5C4033 100%)' }}
        >
          <div
            className="rounded-xl p-4 w-full h-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}
                />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#B87333"
                  strokeWidth={3}
                  fill="#B87333"
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
