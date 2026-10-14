import React, { useMemo, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ValidatedAssessmentResults } from '../../lib/validation';
import { FUNCTION_DESCRIPTIONS, ATTITUDE_DESCRIPTIONS } from '../../data/questions';
import { AlertCircle, Info, TrendingUp, Sparkles, Activity, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FunctionChartProps {
  results: ValidatedAssessmentResults;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    const funcData = FUNCTION_DESCRIPTIONS[label as keyof typeof FUNCTION_DESCRIPTIONS];
    const intensity = score >= 70 ? 'Refined' : score >= 50 ? 'Strong' : score >= 30 ? 'Developing' : 'Emergent';

    return (
      <div className="glass-morphism dark p-4 border border-white/10 rounded-2xl shadow-2xl max-w-[280px]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-display font-bold text-jung-accent-muted">{label}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-jung-accent/20 text-jung-accent-muted rounded-full uppercase tracking-widest">
            {intensity}
          </span>
        </div>
        <div className="text-3xl font-display font-bold text-white mb-2">{score}%</div>
        <p className="text-xs text-jung-subtle font-serif italic mb-3">"{funcData?.title}"</p>
        <p className="text-[11px] text-white/70 leading-relaxed font-sans">{funcData?.desc}</p>
      </div>
    );
  }
  return null;
};

export const FunctionChart: React.FC<FunctionChartProps> = ({ results }) => {
  const [hoveredFunction, setHoveredFunction] = useState<string | null>(null);

  const chartData = useMemo(() =>
    results.scores.map(s => ({
      subject: s.function,
      A: s.score,
      fullMark: 100,
    })),
    [results.scores]
  );

  const attitudeType = results.attitudeScore > 0 ? 'Extraversion' : 'Introversion';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-20">
      {/* Radar Chart Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="card-premium p-8 lg:p-12 bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border"
      >
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-display text-2xl text-jung-dark dark:text-white">Psychological Map</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-jung-muted">Functional Spectrum Analysis</p>
          </div>
          <div className="w-12 h-12 bg-jung-accent/10 rounded-2xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-jung-accent" />
          </div>
        </div>

        <div className="w-full aspect-square relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="80%"
              data={chartData}
              onMouseMove={(e: any) => e && e.activeLabel && setHoveredFunction(e.activeLabel)}
              onMouseLeave={() => setHoveredFunction(null)}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-jung-accent)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="var(--color-jung-accent)" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <PolarGrid stroke="var(--color-jung-border)" strokeWidth={0.5} opacity={0.5} />
              <PolarAngleAxis
                dataKey="subject"
                tick={(props: any) => {
                  const { x, y, payload } = props;
                  const isHovered = hoveredFunction === payload.value;
                  const isDominant = results.stack.dominant.function === payload.value;

                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className={`text-[11px] font-display transition-all duration-300 ${isHovered ? 'fill-jung-accent scale-110 font-bold' : isDominant ? 'fill-jung-dark dark:fill-white font-bold' : 'fill-jung-muted'
                        }`}
                    >
                      {payload.value}
                    </text>
                  );
                }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Score"
                dataKey="A"
                stroke="var(--color-jung-accent)"
                strokeWidth={3}
                fill="url(#chartGradient)"
                fillOpacity={0.6}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Legend */}
        <div className="flex justify-center gap-8 mt-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-jung-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-jung-muted">Conscious Reach</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-jung-border" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-jung-muted">Potential</span>
          </div>
        </div>
      </motion.div>

      {/* Stats & Stack Card */}
      <div className="space-y-8">
        {/* Preference Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-jung-dark text-white p-8 rounded-3xl relative overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-jung-accent/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
              <TrendingUp className="w-5 h-5 text-jung-accent-muted" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-jung-subtle">Primary Attitude</p>
              <h3 className="text-display text-2xl">{attitudeType}</h3>
            </div>
          </div>
          <p className="text-sm text-jung-subtle leading-relaxed font-serif italic mb-6">
            "Your energy naturally flows {results.attitudeScore > 0 ? 'outward toward shared reality' : 'inward toward the landscape of the soul'}."
          </p>
          <div className="flex items-end gap-2">
            <div className="text-4xl font-display font-bold text-jung-accent-muted">{Math.abs(results.attitudeScore).toFixed(1)}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-jung-subtle mb-2">Intensity Vector</div>
          </div>
        </motion.div>

        {/* Function Stack Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="card-premium p-8 bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border"
        >
          <div className="flex items-center gap-3 mb-8">
            <Layers className="w-5 h-5 text-jung-accent" />
            <h3 className="text-display text-xl">The Hierarchy</h3>
          </div>
          <div className="space-y-4">
            {[
              { key: 'dominant', label: 'Conscious Core', color: 'bg-jung-accent' },
              { key: 'auxiliary', label: 'Balance Point', color: 'bg-jung-secondary' },
              { key: 'tertiary', label: 'Relational Key', color: 'bg-jung-muted font-serif' },
              { key: 'inferior', label: 'The Shadow Door', color: 'bg-jung-dark' },
            ].map(({ key, label, color }, i) => {
              const func = results.stack[key as keyof typeof results.stack];
              return (
                <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-jung-base dark:bg-dark-surface-elevated group hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-full ${color}`} />
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-jung-muted mb-0.5">{label}</p>
                      <p className="text-lg font-display text-jung-dark dark:text-white leading-none">{func.function}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-display font-bold text-jung-accent">{func.score}%</p>
                    <p className="text-[8px] font-bold uppercase tracking-tighter text-jung-muted">Active Potency</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
