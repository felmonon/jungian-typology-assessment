import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Hexagon, Activity, Play, Terminal } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeroSectionProps {
  onStartAssessment: () => void;
  onLearnMore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartAssessment, onLearnMore }) => {
  const [initStage, setInitStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setInitStage(1), 500);
    const timer2 = setTimeout(() => setInitStage(2), 1200);
    const timer3 = setTimeout(() => setInitStage(3), 2000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[size:50px_50px] [background-image:linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)]" />

      {/* Center "Eye" / Interface */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        {/* Left Column: Terminal Data */}
        <div className="lg:col-span-7 space-y-8">
          {/* Status Line */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-xs font-mono text-jung-accent"
          >
            <div className="w-2 h-2 bg-jung-accent animate-pulse" />
            <span>SYSTEM_READY /// V2.0.4</span>
          </motion.div>

          {/* Main Headline */}
          <div className="relative">
            <motion.h1
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-display text-6xl md:text-8xl text-jung-dark leading-[0.9] mix-blend-difference"
            >
              The Architecture <br />
              <span className="text-jung-accent opacity-90">of the Psyche.</span>
            </motion.h1>

            {/* Decoding Text Effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute -right-10 top-0 hidden lg:block"
            >
              <Hexagon className="w-24 h-24 text-jung-border stroke-[0.5] animate-spin-slow opacity-20" />
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-jung-secondary font-light max-w-xl leading-relaxed font-sans"
          >
            Analyze your cognitive stack with the Singer-Loomis protocol.
            <span className="text-jung-dark border-b border-jung-accent/30 mx-1">Measure all 8 functions</span>
            independently—moving beyond binary typologies.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-5 pt-4"
          >
            <Button
              onClick={onStartAssessment}
              className="btn-premium group"
            >
              <Activity className="w-4 h-4 mr-2 group-hover:animate-pulse" />
              Initiate Diagnostic
            </Button>

            <Button
              onClick={onLearnMore}
              variant="outline"
              className="border-jung-border text-jung-secondary hover:text-jung-dark hover:border-jung-accent font-mono text-xs uppercase tracking-widest px-8"
            >
              Review Protocol
            </Button>
          </motion.div>

          {/* Data Readout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-jung-border/30"
          >
            {[
              { label: 'Time', value: '15m 00s' },
              { label: 'Precision', value: '99.8%' },
              { label: 'Functions', value: '08' },
              { label: 'Status', value: 'Private' }
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-jung-muted">{stat.label}</p>
                <p className="text-sm font-mono text-jung-dark">{stat.value}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Column: Visualizer */}
        <div className="lg:col-span-5 relative h-[500px] flex items-center justify-center">
          {/* Central Orb */}
          <div className="relative w-full aspect-square max-w-md">
            {/* Spinning Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-jung-border/30 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[20px] border border-jung-border/20 rounded-full border-dashed"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[60px] border border-jung-accent/20 rounded-full"
            />

            {/* Core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-jung-accent/5 backdrop-blur-md rounded-full border border-jung-accent/30 flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.1)]">
                <div className="text-center space-y-1">
                  <div className="text-[10px] font-mono text-jung-accent animate-pulse">Scanning...</div>
                  <div className="text-2xl font-display text-jung-dark">&psi;</div>
                </div>
              </div>
            </div>

            {/* Orbiting Points */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                initial={{ rotate: deg }}
                animate={{ rotate: deg + 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-jung-dark rounded-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
