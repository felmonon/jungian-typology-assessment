import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ValidatedAssessmentResults } from '../../lib/validation';
import { FUNCTION_DESCRIPTIONS, ATTITUDE_DESCRIPTIONS } from '../../data/questions';
import { AlertCircle } from 'lucide-react';

interface FunctionChartProps {
  results: ValidatedAssessmentResults;
}

export const FunctionChart: React.FC<FunctionChartProps> = ({ results }) => {
  const chartData = useMemo(() => 
    results.scores.map(s => ({
      subject: s.function,
      A: s.score,
      fullMark: 100,
    })),
    [results.scores]
  );

  const attitude = results.attitudeScore > 0 ? ATTITUDE_DESCRIPTIONS.E : ATTITUDE_DESCRIPTIONS.I;
  const attitudeType = results.attitudeScore > 0 ? 'Extraversion' : 'Introversion';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-16">
      <div className="card-elevated p-6 md:p-8 flex flex-col items-center">
        <h3 className="text-ui text-sm font-semibold text-jung-muted uppercase tracking-wider mb-6">Function-Attitude Energy</h3>
        <div className="w-full h-[280px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke="#E8E4DE" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#3D2914', fontSize: 11, fontWeight: 'bold' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Score"
                dataKey="A"
                stroke="#B87333"
                strokeWidth={3}
                fill="#B87333"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col justify-center space-y-6">
        <div className="bg-jung-surface p-6 rounded-xl border-l-4 border-jung-accent">
          <h3 className="text-heading text-xl mb-2">
            General Attitude: {attitudeType}
          </h3>
          <p className="text-body text-jung-muted text-sm">
            Your energy naturally flows {results.attitudeScore > 0 ? 'outward toward the external world' : 'inward toward your inner experience'}.
          </p>
        </div>

        {results.isUndifferentiated && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
            <div className="text-sm">
              <strong>Differentiation Note:</strong> Your profile is relatively balanced. The analysis below shows your theoretical function hierarchy.
            </div>
          </div>
        )}

        <div className="card-elevated p-6">
          <h3 className="text-heading text-lg mb-4">Your Function Stack</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-3 border-b border-jung-border">
              <span className="font-medium text-jung-accent">1. Dominant</span>
              <span className="font-bold font-serif">{results.stack.dominant.function}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-jung-border">
              <span className="font-medium text-jung-secondary">2. Auxiliary</span>
              <span className="font-bold font-serif">{results.stack.auxiliary.function}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-jung-border">
              <span className="font-medium text-jung-muted">3. Tertiary</span>
              <span className="font-bold font-serif">{results.stack.tertiary.function}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="font-medium text-jung-muted/70">4. Inferior</span>
              <span className="font-bold font-serif">{results.stack.inferior.function}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
