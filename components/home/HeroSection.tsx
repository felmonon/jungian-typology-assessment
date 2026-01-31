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
      className="relative min-h-screen flex items-center overflow-hidden bg-jung-base section-padding"
    >
      {/* Decorative Mandala SVG Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03]"
          viewBox="0 0 400 400"
          fill="none"
        >
          {/* Outer circle */}
          <circle cx="200" cy="200" r="190" stroke="#1B1B3A" strokeWidth="1" />
          <circle cx="200" cy="200" r="150" stroke="#1B1B3A" strokeWidth="1" />
          <circle cx="200" cy="200" r="110" stroke="#1B1B3A" strokeWidth="1" />
          <circle cx="200" cy="200" r="70" stroke="#1B1B3A" strokeWidth="1" />
          {/* Diamond patterns */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 200 + 190 * Math.cos(rad);
            const y1 = 200 + 190 * Math.sin(rad);
            return (
              <line
                key={angle}
                x1="200"
                y1="200"
                x2={x1}
                y2={y1}
                stroke="#1B1B3A"
                strokeWidth="0.5"
              />
            );
          })}
          {/* Inner diamonds */}
          <polygon
            points="200,50 350,200 200,350 50,200"
            stroke="#1B1B3A"
            strokeWidth="0.75"
            fill="none"
          />
          <polygon
            points="200,90 310,200 200,310 90,200"
            stroke="#1B1B3A"
            strokeWidth="0.75"
            fill="none"
          />
        </svg>
      </div>

      <div className="editorial-container relative z-10 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-8rem)]">

          {/* Left Column - Content */}
          <div className="space-y-8 lg:pr-8">
            {/* Premium Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-jung-accent-light border border-jung-accent/15 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Sparkles className="w-4 h-4 text-jung-accent" />
              <span className="text-sm font-serif font-semibold text-jung-accent tracking-wide">
                Singer-Loomis Validated Methodology
              </span>
            </div>

            {/* Main Headline */}
            <h1
              className={`text-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-jung-dark leading-[0.95] transition-all duration-1000 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Discover Your
              <br />
              <span className="relative inline-block mt-2">
                <span className="text-jung-accent">True Nature</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 8C50 2 100 2 150 6C200 10 250 10 298 4"
                    stroke="#1F7A67"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                  />
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
              className={`flex flex-col sm:flex-row gap-4 pt-6 transition-all duration-1000 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Button
                onClick={onStartAssessment}
                variant="accent"
                size="lg"
                className="group"
              >
                <span>Begin Free Assessment</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>

              <Button
                onClick={onLearnMore}
                variant="outline"
                size="lg"
                className="group"
              >
                <Play className="w-4 h-4" />
                <span>See How It Works</span>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div
              className={`flex flex-wrap items-center gap-6 pt-6 transition-all duration-1000 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="flex items-center gap-2 text-jung-muted">
                <div className="w-10 h-10 rounded-full bg-jung-accent-light flex items-center justify-center">
                  <Users className="w-5 h-5 text-jung-accent" />
                </div>
                <div>
                  <p className="text-jung-dark font-semibold font-serif">{assessmentCount}+</p>
                  <p className="text-xs">assessments taken</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-jung-muted">
                <div className="w-10 h-10 rounded-full bg-jung-accent-light flex items-center justify-center">
                  <Clock className="w-5 h-5 text-jung-accent" />
                </div>
                <div>
                  <p className="text-jung-dark font-semibold font-serif">~15 min</p>
                  <p className="text-xs">to complete</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-jung-muted">
                <div className="w-10 h-10 rounded-full bg-jung-accent-light flex items-center justify-center">
                  <Shield className="w-5 h-5 text-jung-accent" />
                </div>
                <div>
                  <p className="text-jung-dark font-semibold font-serif">Private</p>
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
              {/* Card */}
              <div className="relative card-elevated rounded-2xl p-8 shadow-md">
                {/* Card Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-xl bg-jung-accent flex items-center justify-center shadow-sm">
                    <span className="text-2xl font-serif text-white">&psi;</span>
                  </div>
                  <div>
                    <h3 className="text-heading text-xl text-jung-dark">Your Cognitive Profile</h3>
                    <p className="text-sm text-jung-muted font-serif">8 functions visualized</p>
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
                        stroke="#EDEAE3"
                        strokeWidth="1"
                        strokeDasharray={i % 2 === 0 ? "4 4" : "none"}
                      />
                    ))}

                    {/* Data shape */}
                    <polygon
                      points="140,30 210,65 230,140 200,205 140,230 80,200 50,140 70,65"
                      fill="rgba(31, 122, 103, 0.12)"
                      stroke="#1F7A67"
                      strokeWidth="2.5"
                      style={{ filter: 'drop-shadow(0 4px 12px rgba(31, 122, 103, 0.2))' }}
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
                          className="text-sm font-serif font-bold"
                          fill={['Ni', 'Te', 'Si', 'Fe'].includes(fn) ? '#1F7A67' : '#6B6B8D'}
                        >
                          {fn}
                        </text>
                      );
                    })}
                  </svg>
                </div>

                {/* Function Tags */}
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {['Dominant', 'Auxiliary', 'Tertiary', 'Inferior'].map((pos, i) => (
                    <span
                      key={pos}
                      className="px-3 py-1.5 rounded-full text-xs font-serif font-medium"
                      style={{
                        background: i === 0 ? '#E0F2ED' : '#EDEAE3',
                        color: i === 0 ? '#1F7A67' : '#6B6B8D',
                        border: `1px solid ${i === 0 ? 'rgba(31, 122, 103, 0.2)' : 'transparent'}`
                      }}
                    >
                      {pos}
                    </span>
                  ))}
                </div>
              </div>

              {/* Floating Testimonial Card */}
              <div
                className="absolute -bottom-6 -left-6 card-elevated rounded-xl p-5 shadow-md max-w-[240px] hidden md:block"
              >
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-jung-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-jung-secondary text-sm italic leading-relaxed mb-3">
                  "Finally, a test that understood my complexity. The insights were uncanny."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-jung-accent flex items-center justify-center text-white text-sm font-bold">
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
                className="absolute -top-4 -right-4 card-elevated rounded-xl p-4 shadow-md hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-jung-accent flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-jung-dark text-lg font-bold font-serif">94%</p>
                    <p className="text-jung-muted text-xs">Accuracy Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-jung-base pointer-events-none" style={{ maskImage: 'linear-gradient(to top, black, transparent)' }} />
    </section>
  );
};
