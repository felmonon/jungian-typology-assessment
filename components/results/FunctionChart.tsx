import React, { useMemo, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ValidatedAssessmentResults } from '../../lib/validation';
import { FUNCTION_DESCRIPTIONS, ATTITUDE_DESCRIPTIONS } from '../../data/questions';
import { AlertCircle, Info, TrendingUp } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface FunctionChartProps {
  results: ValidatedAssessmentResults;
}

// Custom tooltip for the radar chart
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    const funcData = FUNCTION_DESCRIPTIONS[label as keyof typeof FUNCTION_DESCRIPTIONS];
    const intensity = score >= 70 ? 'Strong' : score >= 50 ? 'Moderate' : score >= 30 ? 'Developing' : 'Emerging';
    
    return (
      <div className="bg-jung-surface border border-jung-border rounded-xl p-4 shadow-lg max-w-[280px]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-bold text-jung-accent">{label}</span>
          <span className="text-xs px-2 py-0.5 bg-jung-accent/10 text-jung-accent rounded-full">
            {intensity}
          </span>
        </div>
        <p className="text-lg font-bold text-jung-dark mb-1">{score}%</p>
        <p className="text-sm text-jung-muted mb-2">{funcData?.title}</p>
        <p className="text-xs text-jung-secondary leading-relaxed">{funcData?.desc}</p>
      </div>
    );
  }
  return null;
};

// Function detail tooltip component
const FunctionDetailTooltip: React.FC<{
  func: string;
  score: number;
  position: 'dominant' | 'auxiliary' | 'tertiary' | 'inferior' | null;
}> = ({ func, score, position }) => {
  const funcData = FUNCTION_DESCRIPTIONS[func as keyof typeof FUNCTION_DESCRIPTIONS];
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <button 
        className="p-1 rounded-full hover:bg-jung-border/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-jung-accent"
        aria-label={`More info about ${func}`}
      >
        <Info className="w-4 h-4 text-jung-muted" />
      </button>
      
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-jung-surface border border-jung-border rounded-xl shadow-xl animate-scale-in">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-jung-surface border-r border-b border-jung-border" />
          
          <div className="relative">
            <h4 className="font-bold text-jung-dark mb-1">{funcData?.title}</h4>
            <p className="text-xs text-jung-accent mb-2">{func}</p>
            <p className="text-xs text-jung-secondary leading-relaxed mb-3">{funcData?.desc}</p>
            
            <div className="space-y-2">
              <div className="text-xs">
                <span className="font-medium text-emerald-700">+ Positive:</span>{' '}
                <span className="text-jung-secondary">{funcData?.positive}</span>
              </div>
              <div className="text-xs">
                <span className="font-medium text-red-700">− Shadow:</span>{' '}
                <span className="text-jung-secondary">{funcData?.negative}</span>
              </div>
            </div>
            
            {position && (
              <div className="mt-3 pt-3 border-t border-jung-border">
                <p className="text-xs text-jung-muted">
                  <strong>Position:</strong>{' '}
                  {position === 'dominant' && 'Your most conscious, developed function'}
                  {position === 'auxiliary' && 'Supports your dominant function'}
                  {position === 'tertiary' && 'Your creative, playful function'}
                  {position === 'inferior' && 'Your growth edge and doorway to the unconscious'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const FunctionChart: React.FC<FunctionChartProps> = ({ results }) => {
  const reducedMotion = useReducedMotion();
  const [hoveredFunction, setHoveredFunction] = useState<string | null>(null);
  
  const chartData = useMemo(() => 
    results.scores.map(s => ({
      subject: s.function,
      A: s.score,
      fullMark: 100,
      functionData: FUNCTION_DESCRIPTIONS[s.function as keyof typeof FUNCTION_DESCRIPTIONS],
    })),
    [results.scores]
  );

  const attitude = results.attitudeScore > 0 ? ATTITUDE_DESCRIPTIONS.E : ATTITUDE_DESCRIPTIONS.I;
  const attitudeType = results.attitudeScore > 0 ? 'Extraversion' : 'Introversion';
  
  // Calculate average score for comparison
  const averageScore = useMemo(() => 
    Math.round(results.scores.reduce((sum, s) => sum + s.score, 0) / results.scores.length),
    [results.scores]
  );

  // Get function position in stack
  const getFunctionPosition = (func: string): 'dominant' | 'auxiliary' | 'tertiary' | 'inferior' | null => {
    if (results.stack.dominant.function === func) return 'dominant';
    if (results.stack.auxiliary.function === func) return 'auxiliary';
    if (results.stack.tertiary.function === func) return 'tertiary';
    if (results.stack.inferior.function === func) return 'inferior';
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-16">
      <div className="card-elevated p-6 md:p-8 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-ui text-sm font-semibold text-jung-muted uppercase tracking-wider">
            Function-Attitude Energy
          </h3>
          <div className="group relative">
            <Info className="w-4 h-4 text-jung-muted cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-jung-surface border border-jung-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <p className="text-xs text-jung-secondary">
                This radar chart shows your relative strength across all 8 cognitive functions. 
                Hover over any point to see details. The shape reveals your unique psychological fingerprint.
              </p>
            </div>
          </div>
        </div>
        
        <div className="w-full h-[280px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart 
              cx="50%" 
              cy="50%" 
              outerRadius="70%" 
              data={chartData}
              onMouseMove={(e: any) => {
                if (e && e.activeLabel) {
                  setHoveredFunction(e.activeLabel);
                }
              }}
              onMouseLeave={() => setHoveredFunction(null)}
            >
              <PolarGrid stroke="#E8E4DE" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={(props: any) => {
                  const { x, y, payload } = props;
                  const isHovered = hoveredFunction === payload.value;
                  const position = getFunctionPosition(payload.value);
                  const colors = {
                    dominant: '#A65D31',
                    auxiliary: '#4A4540',
                    tertiary: '#7A7570',
                    inferior: '#B5B0A8',
                    null: '#3D2914'
                  };
                  
                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={colors[position || 'null']}
                      fontSize={isHovered ? 13 : 11}
                      fontWeight={position === 'dominant' ? 'bold' : 'normal'}
                      className={reducedMotion ? '' : 'transition-all duration-200'}
                    >
                      {payload.value}
                    </text>
                  );
                }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Your Score"
                dataKey="A"
                stroke="#B87333"
                strokeWidth={hoveredFunction ? 4 : 3}
                fill="#B87333"
                fillOpacity={hoveredFunction ? 0.5 : 0.4}
                className={reducedMotion ? '' : 'transition-all duration-300'}
              />
              {/* Average reference line */}
              <Radar
                name="Average"
                dataKey="fullMark"
                stroke="#E8E4DE"
                strokeWidth={1}
                strokeDasharray="4 4"
                fill="none"
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-jung-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-jung-accent" />
            <span>Dominant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-jung-secondary" />
            <span>Auxiliary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-jung-muted" />
            <span>Tertiary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-jung-subtle" />
            <span>Inferior</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center space-y-6">
        {/* Attitude Card */}
        <div className="bg-jung-surface p-6 rounded-xl border-l-4 border-jung-accent">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-jung-accent" />
            <h3 className="text-heading text-xl">
              General Attitude: {attitudeType}
            </h3>
          </div>
          <p className="text-body text-jung-muted text-sm">
            Your energy naturally flows {results.attitudeScore > 0 ? 'outward toward the external world' : 'inward toward your inner experience'}.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-jung-muted">
            <span>Score: {Math.abs(results.attitudeScore).toFixed(1)}</span>
            <span className="text-jung-border">|</span>
            <span>{Math.abs(results.attitudeScore) > 10 ? 'Clear preference' : 'Moderate preference'}</span>
          </div>
        </div>

        {/* Differentiation Warning */}
        {results.isUndifferentiated && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
            <div className="text-sm">
              <strong>Differentiation Note:</strong> Your profile is relatively balanced. The analysis below shows your theoretical function hierarchy.
            </div>
          </div>
        )}

        {/* Function Stack */}
        <div className="card-elevated p-6">
          <h3 className="text-heading text-lg mb-4">Your Function Stack</h3>
          <div className="space-y-2 text-sm">
            {[
              { key: 'dominant', label: 'Dominant', color: 'text-jung-accent' },
              { key: 'auxiliary', label: 'Auxiliary', color: 'text-jung-secondary' },
              { key: 'tertiary', label: 'Tertiary', color: 'text-jung-muted' },
              { key: 'inferior', label: 'Inferior', color: 'text-jung-muted/70' },
            ].map(({ key, label, color }, index) => {
              const func = results.stack[key as keyof typeof results.stack];
              return (
                <div 
                  key={key}
                  className="flex justify-between items-center py-3 border-b border-jung-border last:border-0 group"
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${color}`}>{index + 1}. {label}</span>
                    <FunctionDetailTooltip 
                      func={func.function} 
                      score={func.score}
                      position={key as any}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold font-serif">{func.function}</span>
                    <span className="text-xs text-jung-muted font-mono">{func.score}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Score Stats */}
        <div className="bg-jung-surface-alt rounded-xl p-4 text-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-jung-muted">Average Function Score</span>
            <span className="font-bold text-jung-dark">{averageScore}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-jung-muted">Differentiation</span>
            <span className="font-bold text-jung-dark">
              {results.differentiation > 30 ? 'High' : results.differentiation > 15 ? 'Moderate' : 'Low'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
