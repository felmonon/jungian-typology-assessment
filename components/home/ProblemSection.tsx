import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertOctagon, Ban, Terminal } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  return (
    <section className="py-32 bg-jung-surface-elevated relative overflow-hidden">
      {/* Background Noise */}
      <div className="absolute inset-0 bg-jung-dark opacity-[0.02]" />

      <div className="lab-container relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header LOG */}
          <div className="flex items-center gap-4 mb-20 border-b border-error/20 pb-4">
            <div className="w-3 h-3 bg-error animate-pulse" />
            <span className="font-mono text-error text-xs uppercase tracking-widest">System Diagnostics: Current Paradigm Failure</span>
            <div className="flex-grow text-right font-mono text-jung-muted text-[10px]">ERR_CODE_16</div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Terminal Output */}
            <div className="font-mono text-xs bg-black p-6 rounded border border-jung-border/50 shadow-2xl space-y-2 text-jung-secondary h-full relative group">
              <div className="absolute inset-0 bg-jung-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex justify-between border-b border-jung-border/30 pb-2 mb-4">
                <span>terminal.log</span>
                <span className="text-error">CRITICAL</span>
              </div>

              <div className="space-y-4">
                <p>&gt; initiating_scan(legacy_tools)...</p>
                <p className="text-error">&gt; FATAL ERROR: Binary_Dichotomy_Detected</p>
                <p className="pl-4 opacity-70">
                  Target is boxed into "E" or "I".<br />
                  Target is boxed into "N" or "S".<br />
                  Nuance factor: 0.00%
                </p>
                <p className="text-error">&gt; WARN: Mood_Bias_High</p>
                <p className="pl-4 opacity-70">Results fluctuating based on serotonin levels.</p>
                <p className="text-jung-accent">&gt; hypothesis: Current tools measure symptom, not origin.</p>
              </div>
            </div>

            {/* Right: The Explanation */}
            <div className="space-y-8">
              <h2 className="text-display text-4xl text-jung-dark">
                The map is not <br /> <span className="text-jung-muted italic">the territory.</span>
              </h2>
              <p className="text-body text-jung-secondary max-w-sm">
                Standard tests force you into 4 letters. But the human psyche is a dynamic system. You use <span className="text-jung-accent border-b border-jung-accent/50">all 8 functions</span>, not just 4.
              </p>

              <div className="space-y-4">
                {[
                  { title: 'Information Loss', desc: 'Binary choices discard 50% of your data.' },
                  { title: 'Stereotype Trap', desc: 'Behavioral generalization ignores cognitive intent.' },
                  { title: 'Static Model', desc: 'Fails to account for individuation (growth).' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 border border-jung-border/50 hover:bg-jung-surface transition-colors rounded-sm">
                    <AlertOctagon className="w-5 h-5 text-jung-muted flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-jung-dark mb-1">{item.title}</h4>
                      <p className="text-xs text-jung-secondary">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
