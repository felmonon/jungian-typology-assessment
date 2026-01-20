import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { FUNCTION_DESCRIPTIONS } from '../data/questions';
import { Button } from '../components/ui/Button';
import { Brain, ArrowRight, Loader2 } from 'lucide-react';

interface SharedResult {
  id: string;
  scores: Array<{ function: string; score: number }>;
  stack: {
    dominant: { function: string; score: number };
    auxiliary: { function: string; score: number };
    tertiary: { function: string; score: number };
    inferior: { function: string; score: number };
  };
  attitudeScore: string;
  isUndifferentiated: string;
  createdAt: string;
}

export const SharePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [result, setResult] = useState<SharedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/share/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('This shared result was not found.');
          } else {
            setError('Failed to load the shared result.');
          }
          return;
        }
        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError('Failed to load the shared result.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchResult();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jung-base px-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-jung-primary mx-auto mb-4" />
          <p className="text-stone-600 text-sm md:text-base">Loading shared result...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jung-base px-4">
        <div className="text-center max-w-md mx-auto">
          <Brain className="w-12 h-12 md:w-16 md:h-16 text-stone-300 mx-auto mb-4" />
          <h1 className="text-xl md:text-2xl font-serif font-bold text-jung-dark mb-2">Result Not Found</h1>
          <p className="text-stone-600 mb-6 text-sm md:text-base">{error || 'This shared result could not be found.'}</p>
          <Link to="/">
            <Button className="w-full sm:w-auto min-h-[48px]">Take Your Own Assessment</Button>
          </Link>
        </div>
      </div>
    );
  }

  const dominantFunc = result.stack.dominant.function;
  const funcDescription = FUNCTION_DESCRIPTIONS[dominantFunc];
  const chartData = result.scores.map(s => ({
    subject: s.function,
    A: s.score,
    fullMark: 100,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-6 md:mb-8">
        <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
          <Brain className="w-6 h-6 md:w-8 md:h-8 text-jung-primary" />
          <span className="text-xs md:text-sm font-bold tracking-widest uppercase text-jung-secondary">
            Jungian Typology Assessment
          </span>
        </div>
        <p className="text-stone-500 text-sm md:text-base">Someone shared their psychological type profile with you</p>
      </div>

      <div className="bg-gradient-to-r from-jung-primary to-jung-accent text-white p-5 md:p-8 rounded-lg mb-6 md:mb-8 shadow-lg">
        <div className="text-center">
          <p className="text-xs md:text-sm uppercase tracking-widest opacity-80 mb-2">Dominant Function</p>
          <h1 className="text-2xl md:text-4xl font-serif font-bold mb-2">
            {funcDescription?.title || dominantFunc} ({dominantFunc})
          </h1>
          <p className="text-base md:text-xl opacity-90 italic max-w-2xl mx-auto">
            "{funcDescription?.quote}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-stone-100">
          <h3 className="text-base md:text-lg font-bold text-jung-secondary mb-3 md:mb-4 tracking-wider uppercase text-center">
            Function-Attitude Energy
          </h3>
          <div className="w-full h-[280px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#e7e5e4" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#451a03', fontSize: 11, fontWeight: 'bold' }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#b45309"
                  strokeWidth={2}
                  fill="#b45309"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="bg-white p-4 md:p-6 rounded-lg border border-stone-200 mb-4">
            <h3 className="text-base md:text-lg font-serif font-bold text-jung-dark mb-3 md:mb-4">Function Stack</h3>
            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="font-medium text-jung-primary text-sm md:text-base">1. Dominant</span>
                <span className="font-bold text-base md:text-lg">{result.stack.dominant.function}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="font-medium text-jung-accent text-sm md:text-base">2. Auxiliary</span>
                <span className="font-bold text-base md:text-lg">{result.stack.auxiliary.function}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="font-medium text-stone-500 text-sm md:text-base">3. Tertiary</span>
                <span className="font-bold text-base md:text-lg">{result.stack.tertiary.function}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium text-stone-400 text-sm md:text-base">4. Inferior</span>
                <span className="font-bold text-base md:text-lg">{result.stack.inferior.function}</span>
              </div>
            </div>
          </div>

          <p className="text-xs md:text-sm text-stone-500 italic text-center">
            {funcDescription?.desc?.slice(0, 200)}...
          </p>
        </div>
      </div>

      <div className="bg-stone-100 rounded-xl p-5 md:p-8 text-center">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-jung-dark mb-2 md:mb-3">
          Discover Your Own Psychological Type
        </h2>
        <p className="text-stone-600 mb-5 md:mb-6 max-w-xl mx-auto text-sm md:text-base">
          Take the Jungian Typology Assessment to uncover your dominant cognitive functions and receive a personalized analysis based on Carl Jung's theory of psychological types.
        </p>
        <Link to="/assessment">
          <Button size="lg" className="w-full sm:w-auto min-h-[48px]">
            Take Your Own Assessment <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="text-center text-xs text-stone-400 mt-6 md:mt-8 pt-5 md:pt-6 border-t border-stone-200">
        <p>Based on the typological work of Carl Gustav Jung (Psychological Types, CW Vol. 6)</p>
      </div>
    </div>
  );
};
