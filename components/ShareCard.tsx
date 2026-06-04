import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { FUNCTION_DESCRIPTIONS } from '../data/questions';
import { TypeJungMark } from './brand/TypeJungMark';

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
        background: 'linear-gradient(135deg, #fafaf8 0%, #f4f4f2 55%, #e8f1ea 100%)',
        fontFamily: '"Source Serif 4", Georgia, serif'
      }}
    >
      <div className="h-full flex">
        {/* Left content area */}
        <div className="flex-1 p-10 flex flex-col justify-between border-r border-[#d4d4d2]">
          <div>
            {/* Logo/Brand */}
            <div className="flex items-center gap-3 mb-8">
              <TypeJungMark size="sm" />
              <span
                className="text-sm font-semibold tracking-[0.2em] uppercase"
                style={{ color: '#555d56', fontFamily: '"Space Grotesk", sans-serif' }}
              >
                TypeJung
              </span>
            </div>

            {/* Main content */}
            <div className="mb-8">
              <p
                className="text-sm uppercase tracking-[0.25em] mb-3"
                style={{ color: '#2d5a3d', fontFamily: '"Space Grotesk", sans-serif' }}
              >
                Dominant Function
              </p>
              <h1
                className="text-5xl font-bold mb-4 leading-tight"
                style={{ color: '#1a1a1a', fontFamily: '"Fraunces", Georgia, serif' }}
              >
                {funcDescription?.title || dominantFunction}
              </h1>
              <p
                className="text-2xl font-bold mb-5"
                style={{ color: '#2d5a3d', fontFamily: '"Space Grotesk", sans-serif' }}
              >
                ({dominantFunction})
              </p>
              <p
                className="text-lg italic leading-relaxed max-w-xl"
                style={{ color: '#555d56' }}
              >
                "{funcDescription?.quote}"
              </p>
            </div>
          </div>

          {/* Function stack */}
          <div
            className="rounded-xl p-5 border"
            style={{ backgroundColor: '#ffffff', borderColor: '#e8e8e6' }}
          >
            <p
              className="text-xs uppercase tracking-[0.2em] mb-4"
              style={{ color: '#666666', fontFamily: '"Space Grotesk", sans-serif' }}
            >
              Function Stack
            </p>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div
                  className="text-xs font-bold mb-1"
                  style={{ color: '#2d5a3d', fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  Dominant
                </div>
                <div className="text-lg font-bold" style={{ color: '#1a1a1a' }}>
                  {stack.dominant.function}
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-xs font-bold mb-1"
                  style={{ color: '#2f6f58', fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  Auxiliary
                </div>
                <div className="text-lg font-bold" style={{ color: '#1a1a1a' }}>
                  {stack.auxiliary.function}
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-xs font-bold mb-1"
                  style={{ color: '#666666', fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  Tertiary
                </div>
                <div className="text-lg font-bold" style={{ color: '#555d56' }}>
                  {stack.tertiary.function}
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-xs font-bold mb-1"
                  style={{ color: '#7fa085', fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  Inferior
                </div>
                <div className="text-lg font-bold" style={{ color: '#666666' }}>
                  {stack.inferior.function}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right chart area */}
        <div
          className="w-[400px] flex items-center justify-center p-6"
          style={{ background: 'linear-gradient(135deg, #121712 0%, #234832 100%)' }}
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
                  stroke="#e8f1ea"
                  strokeWidth={3}
                  fill="#2d5a3d"
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
