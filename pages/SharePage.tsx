import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { FUNCTION_DESCRIPTIONS } from '../data/questions';
import { Button } from '../components/ui/Button';
import { ArrowRight, Loader2 } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-jung-surface px-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-jung-accent mx-auto mb-4" />
          <p className="text-jung-secondary text-sm md:text-base">Loading shared result...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jung-surface px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-jung-accent/10 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl font-serif text-jung-accent">ψ</span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-jung-dark mb-3">Result Not Found</h1>
          <p className="text-jung-secondary mb-6 text-sm md:text-base">{error || 'This shared result could not be found.'}</p>
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
    <div className="editorial-container py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/logo.svg" alt="Jungian Typology" className="w-10 h-10" />
          <span className="text-xs md:text-sm font-data font-bold tracking-widest uppercase text-jung-secondary">
            Jungian Typology Assessment
          </span>
        </div>
        <p className="text-jung-muted text-sm md:text-base">Someone shared their psychological type profile with you</p>
      </div>

      {/* Hero card */}
      <div className="bg-jung-dark text-white p-6 md:p-10 rounded-2xl mb-8 shadow-xl">
        <div className="text-center">
          <p className="text-xs md:text-sm uppercase tracking-widest opacity-70 mb-3 font-data">Dominant Function</p>
          <h1 className="text-2xl md:text-4xl font-serif font-bold mb-3">
            {funcDescription?.title || dominantFunc} ({dominantFunc})
          </h1>
          <p className="text-base md:text-xl opacity-90 italic max-w-2xl mx-auto font-serif">
            "{funcDescription?.quote}"
          </p>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Radar chart */}
        <div className="card-elevated p-6 rounded-2xl">
          <h3 className="text-sm md:text-base font-data font-bold text-jung-secondary mb-4 tracking-widest uppercase text-center">
            Function-Attitude Energy
          </h3>
          <div className="w-full h-[280px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#D8D5CE" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#1B1B3A', fontSize: 11, fontWeight: 'bold' }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#1F7A67"
                  strokeWidth={2}
                  fill="#1F7A67"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Function stack */}
        <div className="flex flex-col justify-center">
          <div className="card-elevated p-6 rounded-2xl mb-5">
            <h3 className="text-base md:text-lg font-serif font-bold text-jung-dark mb-4">Function Stack</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-jung-border">
                <span className="font-medium text-jung-accent text-sm md:text-base font-serif">1. Dominant</span>
                <span className="font-serif font-bold text-base md:text-lg">{result.stack.dominant.function}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-jung-border">
                <span className="font-medium text-jung-secondary text-sm md:text-base font-serif">2. Auxiliary</span>
                <span className="font-serif font-bold text-base md:text-lg">{result.stack.auxiliary.function}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-jung-border">
                <span className="font-medium text-jung-muted text-sm md:text-base font-serif">3. Tertiary</span>
                <span className="font-serif font-bold text-base md:text-lg">{result.stack.tertiary.function}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="font-medium text-jung-muted/70 text-sm md:text-base font-serif">4. Inferior</span>
                <span className="font-serif font-bold text-base md:text-lg text-jung-muted">{result.stack.inferior.function}</span>
              </div>
            </div>
          </div>

          <p className="text-xs md:text-sm text-jung-muted italic text-center font-serif">
            {funcDescription?.desc?.slice(0, 200)}...
          </p>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-jung-surface rounded-2xl p-6 md:p-10 text-center border border-jung-border">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-jung-dark mb-3">
          Discover Your Own Psychological Type
        </h2>
        <p className="text-jung-secondary mb-6 max-w-xl mx-auto text-sm md:text-base">
          Take the Jungian Typology Assessment to uncover your dominant cognitive functions and receive a personalized analysis based on Carl Jung's theory of psychological types.
        </p>
        <Link to="/assessment">
          <Button variant="accent" size="lg" className="w-full sm:w-auto min-h-[48px]">
            Take Your Own Assessment <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-jung-muted mt-8 pt-6 border-t border-jung-border">
        <p>Based on the typological work of Carl Gustav Jung (Psychological Types, CW Vol. 6)</p>
      </div>
    </div>
  );
};
