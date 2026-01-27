import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles, Users, Clock, Shield, ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  onStartAssessment: () => void;
  onLearnMore: () => void;
}

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      countRef.current = Math.floor(easeOutQuart * end);
      setCount(countRef.current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 500);

    return () => clearTimeout(timer);
  }, [end, duration]);

  return count.toLocaleString();
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartAssessment, onLearnMore }) => {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const assessmentCount = useAnimatedCounter(12847);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToContent = () => {
    const nextSection = heroRef.current?.nextElementSibling;
    nextSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col overflow-hidden"
    >
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-jung-cream via-jung-base to-jung-surface" />

      {/* Animated Background Orbs - More subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1 -top-40 -right-40 opacity-40" />
        <div className="orb orb-2 top-1/3 -left-20 opacity-30" />

        {/* Refined Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(var(--color-jung-dark) 1px, transparent 1px),
                              linear-gradient(90deg, var(--color-jung-dark) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center relative z-10">
        <div className="editorial-container w-full py-24 lg:py-0">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[calc(100vh-12rem)]">

            {/* Left Column - Content (7 columns for asymmetry) */}
            <div className="lg:col-span-7 space-y-10">
              {/* Overline */}
              <div
                className={`transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <span className="text-overline text-jung-muted tracking-widest">
                  Singer-Loomis Type Deployment Inventory
                </span>
              </div>

              {/* Main Headline - More dramatic editorial style */}
              <h1
                className={`text-display-xl transition-all duration-1000 delay-100 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] text-jung-dark">
                  Discover Your
                </span>
                <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] mt-2">
                  <span className="gradient-text">Cognitive</span>
                </span>
                <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] mt-2">
                  <span className="gradient-text">Architecture</span>
                </span>
              </h1>

              {/* Subheadline - Refined */}
              <p
                className={`text-body-lg text-jung-secondary max-w-xl transition-all duration-1000 delay-200 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                Move beyond simplistic four-letter labels. Our assessment measures
                <em className="text-jung-dark not-italic font-medium"> all eight cognitive functions independently</em>—revealing
                how you actually perceive and judge, not how you wish you did.
              </p>

              {/* CTA Buttons */}
              <div
                className={`flex flex-col sm:flex-row gap-4 pt-2 transition-all duration-1000 delay-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <button
                  onClick={onStartAssessment}
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-jung-dark text-white font-sans font-semibold text-base rounded-xl shadow-xl shadow-jung-dark/20 hover:shadow-2xl hover:shadow-jung-dark/25 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                >
                  <span className="relative z-10">Begin Free Assessment</span>
                  <ArrowRight className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-gradient-to-r from-jung-secondary to-jung-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>

                <button
                  onClick={onLearnMore}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-jung-secondary font-sans font-medium text-base rounded-xl border border-jung-border hover:border-jung-dark hover:text-jung-dark bg-white/50 hover:bg-white transition-all duration-300"
                >
                  Learn the Methodology
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                </button>
              </div>

              {/* Trust Indicators - More refined */}
              <div
                className={`flex flex-wrap items-center gap-8 pt-8 border-t border-jung-border/50 transition-all duration-1000 delay-400 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-jung-surface-alt flex items-center justify-center border border-jung-border/50">
                    <Users className="w-5 h-5 text-jung-secondary" />
                  </div>
                  <div>
                    <p className="text-jung-dark font-semibold font-sans text-lg">{assessmentCount}+</p>
                    <p className="text-xs text-jung-muted">assessments completed</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-jung-surface-alt flex items-center justify-center border border-jung-border/50">
                    <Clock className="w-5 h-5 text-jung-secondary" />
                  </div>
                  <div>
                    <p className="text-jung-dark font-semibold font-sans text-lg">15 min</p>
                    <p className="text-xs text-jung-muted">to complete</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-jung-surface-alt flex items-center justify-center border border-jung-border/50">
                    <Shield className="w-5 h-5 text-jung-secondary" />
                  </div>
                  <div>
                    <p className="text-jung-dark font-semibold font-sans text-lg">Private</p>
                    <p className="text-xs text-jung-muted">& secure</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Cognitive Profile Visualization (5 columns) */}
            <div
              className={`lg:col-span-5 relative transition-all duration-1000 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              {/* Main Visualization Card */}
              <div className="relative">
                {/* Subtle Glow */}
                <div className="absolute -inset-8 bg-gradient-to-br from-jung-accent/5 to-jung-gold/5 rounded-[3rem] blur-3xl" />

                {/* Card */}
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl shadow-jung-dark/5 border border-jung-border/50">
                  {/* Card Header */}
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-jung-border/50">
                    <div className="w-12 h-12 rounded-2xl bg-jung-dark flex items-center justify-center">
                      <span className="text-xl font-serif text-white">ψ</span>
                    </div>
                    <div>
                      <h3 className="text-heading-sm text-lg text-jung-dark">Cognitive Profile</h3>
                      <p className="text-xs text-jung-muted font-sans">8 functions visualized</p>
                    </div>
                  </div>

                  {/* Radar Chart - Cleaner design */}
                  <div className="relative w-full aspect-square max-w-[280px] mx-auto">
                    <svg viewBox="0 0 280 280" className="w-full h-full">
                      {/* Background rings */}
                      {[30, 60, 90, 115].map((r, i) => (
                        <polygon
                          key={i}
                          points={Array.from({length: 8}, (_, j) => {
                            const angle = (j * 45 - 90) * Math.PI / 180;
                            const x = 140 + r * Math.cos(angle);
                            const y = 140 + r * Math.sin(angle);
                            return `${x},${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="var(--color-jung-border)"
                          strokeWidth="1"
                          strokeDasharray={i === 0 ? "none" : "3 3"}
                          opacity={0.5 + i * 0.15}
                        />
                      ))}

                      {/* Data shape */}
                      <polygon
                        points="140,35 205,70 220,140 195,200 140,220 85,195 60,140 75,70"
                        fill="url(#radarGradient)"
                        stroke="var(--color-jung-dark)"
                        strokeWidth="2"
                        style={{ filter: 'drop-shadow(0 2px 8px rgba(24, 24, 27, 0.15))' }}
                      />

                      {/* Function labels */}
                      {['Ni', 'Ne', 'Te', 'Ti', 'Si', 'Se', 'Fe', 'Fi'].map((fn, i) => {
                        const angle = (i * 45 - 90) * Math.PI / 180;
                        const x = 140 + 130 * Math.cos(angle);
                        const y = 140 + 130 * Math.sin(angle);
                        const isPrimary = ['Ni', 'Te'].includes(fn);
                        return (
                          <text
                            key={fn}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="font-sans"
                            style={{
                              fontSize: isPrimary ? '13px' : '11px',
                              fontWeight: isPrimary ? 700 : 500,
                              fill: isPrimary ? 'var(--color-jung-dark)' : 'var(--color-jung-muted)'
                            }}
                          >
                            {fn}
                          </text>
                        );
                      })}

                      <defs>
                        <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="rgba(24, 24, 27, 0.08)" />
                          <stop offset="100%" stopColor="rgba(24, 24, 27, 0.02)" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Stack Labels */}
                  <div className="flex flex-wrap justify-center gap-2 mt-6 pt-6 border-t border-jung-border/50">
                    {[
                      { label: 'Dominant', color: 'bg-jung-dark text-white' },
                      { label: 'Auxiliary', color: 'bg-jung-surface-alt text-jung-secondary border border-jung-border/50' },
                      { label: 'Tertiary', color: 'bg-jung-surface-alt text-jung-muted border border-jung-border/50' },
                      { label: 'Inferior', color: 'bg-jung-surface-alt text-jung-subtle border border-jung-border/50' }
                    ].map((item) => (
                      <span
                        key={item.label}
                        className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium ${item.color}`}
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Floating Quote Card */}
                <div
                  className="absolute -bottom-4 -left-4 lg:-left-8 bg-white rounded-2xl p-5 shadow-xl shadow-jung-dark/10 max-w-[220px] border border-jung-border/50 animate-float hidden md:block"
                  style={{ animationDelay: '1s' }}
                >
                  <p className="text-jung-secondary text-sm italic leading-relaxed mb-3 font-serif">
                    "Finally understood why I process information differently."
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-jung-dark flex items-center justify-center text-white text-xs font-bold">
                      S
                    </div>
                    <div>
                      <p className="text-jung-dark text-xs font-semibold font-sans">Sarah K.</p>
                      <p className="text-jung-muted text-[10px]">Product Designer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="relative z-10 pb-8 flex justify-center">
        <button
          onClick={scrollToContent}
          className="group flex flex-col items-center gap-2 text-jung-muted hover:text-jung-dark transition-colors"
          aria-label="Scroll to learn more"
        >
          <span className="text-xs font-sans font-medium tracking-wide">Scroll to explore</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-jung-surface to-transparent pointer-events-none" />
    </section>
  );
};
