import { motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { ATTITUDE_LABELS, depthLayerMeta, FUNCTION_LABELS, type FunctionChannel } from '../../data/depthAssessment';
import { getFunctionCode, positionLabels } from '../../lib/result-format';
import type { DepthAssessmentResult } from '../../utils/depthScoring';
import { FunctionEmblem } from '../brand/FunctionEmblem';

export const EnergyBars: React.FC<{ results: DepthAssessmentResult }> = ({
  results,
}) => (
  <div className="card-premium p-6 sm:p-8">
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-label">Energy distribution</p>
        <h2 className="mt-2 text-heading text-3xl text-jung-dark">
          Your four function channels
        </h2>
      </div>
      <div className="rounded-lg bg-jung-accent-light px-3 py-2 text-sm font-semibold text-jung-accent">
        {results.reliability.score}% consistency
      </div>
    </div>

    <div className="space-y-5">
      {results.energy.map((item) => {
        const isDominant = item.channel === results.dominant;
        const isInferior = item.channel === results.inferior;

        return (
          <div key={item.channel}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-jung-dark">
                  {item.label}
                </span>
                {isDominant && (
                  <span className="rounded-lg bg-jung-accent px-2 py-1 text-[11px] font-semibold text-white">
                    Dominant
                  </span>
                )}
                {isInferior && (
                  <span className="rounded-lg border border-jung-border px-2 py-1 text-[11px] font-semibold text-jung-muted">
                    Inferior
                  </span>
                )}
              </div>
              <span className="font-mono text-sm font-semibold text-jung-muted">
                {item.score}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-jung-border-light">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.score}%` }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full rounded-full ${isInferior ? 'bg-jung-accent-muted' : 'bg-jung-accent'}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export const Hierarchy: React.FC<{ results: DepthAssessmentResult }> = ({
  results,
}) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {results.hierarchy.map((item) => (
      <div
        key={item.position}
        className={`rounded-lg border p-5 ${item.position === 'dominant' ? 'border-jung-accent-muted bg-jung-accent-light/70' : 'border-jung-border bg-jung-surface'}`}
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold text-jung-muted">
            {positionLabels[item.position]}
          </p>
          <FunctionEmblem code={getFunctionCode(item.channel, item.attitude)} className="h-9 w-9 shrink-0 text-jung-accent" />
        </div>
        <h3 className="mt-3 text-2xl font-semibold text-jung-dark">
          {item.label}
        </h3>
        <p className="mt-2 text-sm leading-6 text-jung-secondary">
          {ATTITUDE_LABELS[item.attitude]} channel, {item.score}% of mapped
          energy.
        </p>
      </div>
    ))}
  </div>
);

export const SignalGrid: React.FC<{ results: DepthAssessmentResult }> = ({
  results,
}) => {
  const signals = useMemo(
    () =>
      [
        [
          'behavioral',
          results.layerSignals.behavioral
            ? FUNCTION_LABELS[
            results.layerSignals.behavioral as FunctionChannel
            ]
            : 'Mixed',
        ],
        [
          'inferior',
          results.layerSignals.inferior
            ? FUNCTION_LABELS[results.layerSignals.inferior as FunctionChannel]
            : FUNCTION_LABELS[results.inferior],
        ],
        [
          'somatic',
          results.layerSignals.somatic
            ? FUNCTION_LABELS[results.layerSignals.somatic as FunctionChannel]
            : 'Mixed',
        ],
        ['attitude', ATTITUDE_LABELS[results.attitude.dominant]],
      ] as const,
    [results],
  );

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {signals.map(([layer, value]) => {
        const meta = depthLayerMeta[layer as keyof typeof depthLayerMeta];
        return (
          <div
            key={layer}
            className="rounded-lg border border-jung-border bg-jung-surface p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-jung-muted">
              {meta.shortLabel}
            </p>
            <p className="mt-2 text-lg font-semibold text-jung-dark">
              {value}
            </p>
          </div>
        );
      })}
    </div>
  );
};
