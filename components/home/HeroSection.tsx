import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles, Users, Clock, Shield, Play } from 'lucide-react';
import { Button } from '../ui/Button';

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

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-pattern-subtle"
    >
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1 -top-40 -right-40" />
        <div className="orb orb-2 top-1/3 -left-20" />
        <div className="orb orb-3 bottom-0 right-1/4" />
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(180, 83, 9, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(180, 83, 9, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="editorial-container relative z-10 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-8rem)]">
          
          {/* Left Column - Content */}
          <div className="space-y-8 lg:pr-8">
            {/* Premium Badge */}
            <div 
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{
                background: 'linear-gradient(135deg, rgba(180, 83, 9, 0.08), rgba(245, 158, 11, 0.08))',
                border: '1px solid rgba(180, 83, 9, 0.15)',
                boxShadow: '0 2px 20px rgba(180, 83, 9, 0.1)'
              }}
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-sans font-semibold text-amber-800 tracking-wide">
                Singer-Loomis Validated Methodology
              </span>
            </div>

            {/* Main Headline */}
            <h1 
              className={`text-display-lg text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-jung-dark leading-[0.95] transition-all duration-1000 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Discover Your
              <br />
              <span className="relative inline-block mt-2">
                <span className="gradient-text">True Nature</span>
                <svg 
                  className="absolute -bottom-2 left-0 w-full" 
                  viewBox="0 0 300 12" 
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path 
                    d="M2 8C50 2 100 2 150 6C200 10 250 10 298 4" 
                    stroke="url(#gradient)" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#B45309" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p 
              className={`text-body-lg text-jung-secondary max-w-xl leading-relaxed transition-all duration-1000 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Unlike typical personality tests that box you into four letters, we measure 
              <span className="text-jung-dark font-medium"> all 8 cognitive functions independently</span>. 
              In just 15 minutes, understand how you actually think—not how you wish you did.
            </p>

            {/* CTA Buttons */}
            <div 
              className={`flex flex-col sm:flex-row gap-4 pt-4 transition-all duration-1000 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <button
                onClick={onStartAssessment}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-sans font-semibold text-lg rounded-2xl shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/30 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
              >
                <span className="relative z-10">Begin Free Assessment</span>
                <ArrowRight className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>

              <button
                onClick={onLearnMore}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-jung-dark font-sans font-medium text-lg rounded-2xl border-2 border-jung-border hover:border-amber-600 hover:text-amber-700 transition-all duration-300"
              >
                <Play className="w-4 h-4" />
                See How It Works
              </button>
            </div>

            {/* Trust Indicators */}
            <div 
              className={`flex flex-wrap items-center gap-6 pt-6 transition-all duration-1000 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="flex items-center gap-2 text-jung-muted">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-jung-dark font-semibold font-sans">{assessmentCount}</p>
                  <p className="text-xs">assessments taken</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-jung-muted">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-jung-dark font-semibold font-sans">~15 min</p>
                  <p className="text-xs">to complete</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-jung-muted">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-jung-dark font-semibold font-sans">Private</p>
                  <p className="text-xs">secure data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div 
            className={`relative transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            {/* Main Card */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-[2.5rem] blur-3xl opacity-60" />
              
              {/* Card */}
              <div className="relative glass rounded-[2rem] p-8 shadow-2xl">
                {/* Card Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 2a10 10 0 0 1 10 10"/>
                      <path d="M12 12L2 12"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-heading text-xl text-jung-dark">Your Cognitive Profile</h3>
                    <p className="text-sm text-jung-muted font-sans">8 functions visualized</p>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="relative w-full aspect-square max-w-[320px] mx-auto">
                  <svg viewBox="0 0 280 280" className="w-full h-full">
                    {/* Background rings */}
                    {[30, 60, 90, 120].map((r, i) => (
                      <polygon
                        key={i}
                        points={Array.from({length: 8}, (_, j) => {
                          const angle = (j * 45 - 90) * Math.PI / 180;
                          const x = 140 + r * Math.cos(angle);
                          const y = 140 + r * Math.sin(angle);
                          return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#E7E5E4"
                        strokeWidth="1"
                        strokeDasharray={i % 2 === 0 ? "4 4" : "none"}
                      />
                    ))}

                    {/* Data shape */}
                    <polygon
                      points="140,30 210,65 230,140 200,205 140,230 80,200 50,140 70,65"
                      fill="url(#radarGradient)"
                      stroke="#B45309"
                      strokeWidth="2.5"
                      className="animate-pulse-glow"
                      style={{ filter: 'drop-shadow(0 4px 12px rgba(180, 83, 9, 0.3))' }}
                    />

                    {/* Function labels */}
                    {['Ni', 'Ne', 'Te', 'Ti', 'Si', 'Se', 'Fe', 'Fi'].map((fn, i) => {
                      const angle = (i * 45 - 90) * Math.PI / 180;
                      const x = 140 + 135 * Math.cos(angle);
                      const y = 140 + 135 * Math.sin(angle);
                      return (
                        <text
                          key={fn}
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-sm font-sans font-bold"
                          fill={['Ni', 'Te', 'Si', 'Fe'].includes(fn) ? '#B45309' : '#78716C'}
                        >
                          {fn}
                        </text>
                      );
                    })}

                    <defs>
                      <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(180, 83, 9, 0.25)" />
                        <stop offset="100%" stopColor="rgba(245, 158, 11, 0.15)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Function Tags */}
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {['Dominant', 'Auxiliary', 'Tertiary', 'Inferior'].map((pos, i) => (
                    <span
                      key={pos}
                      className="px-3 py-1.5 rounded-full text-xs font-sans font-medium"
                      style={{
                        background: i === 0 ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)' : '#F5F5F4',
                        color: i === 0 ? '#92400E' : '#78716C',
                        border: `1px solid ${i === 0 ? 'rgba(180, 83, 9, 0.2)' : 'transparent'}`
                      }}
                    >
                      {pos}
                    </span>
                  ))}
                </div>
              </div>

              {/* Floating Testimonial Card */}
              <div 
                className="absolute -bottom-6 -left-6 glass rounded-2xl p-5 shadow-xl max-w-[240px] animate-float"
                style={{ animationDelay: '1s' }}
              >
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-jung-secondary text-sm italic leading-relaxed mb-3">
                  "Finally, a test that understood my complexity. The insights were uncanny."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold">
                    S
                  </div>
                  <div>
                    <p className="text-jung-dark text-sm font-semibold">Sarah K.</p>
                    <p className="text-jung-muted text-xs">UX Designer</p>
                  </div>
                </div>
              </div>

              {/* Stats Badge */}
              <div 
                className="absolute -top-4 -right-4 glass rounded-2xl p-4 shadow-xl animate-float"
                style={{ animationDelay: '2s' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-jung-dark text-lg font-bold font-sans">94%</p>
                    <p className="text-jung-muted text-xs">Accuracy Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-jung-base to-transparent pointer-events-none" />
    </section>
  );
};
