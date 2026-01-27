import React from 'react';
import { Beaker, ArrowRight, Users, Clock, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { AnalyticsEvents } from './data';

interface HeroSectionProps {
  onStartAssessment: () => void;
  onLearnMore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartAssessment, onLearnMore }) => {
  const handleStart = () => {
    AnalyticsEvents.ctaClicked('start_assessment', 'hero');
    onStartAssessment();
  };

  const handleLearn = () => {
    AnalyticsEvents.ctaClicked('learn_more', 'hero');
    onLearnMore();
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-jung-base">
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="editorial-container relative z-10 py-20 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column - Text */}
          <div className="lg:col-span-7 space-y-8">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-jung-accent-light rounded-full">
              <Beaker className="w-4 h-4 text-jung-accent" />
              <span className="text-sm font-sans font-medium text-jung-primary">
                Singer-Loomis validated methodology
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-jung-dark leading-[1.05]">
              Who are you,{' '}
              <span className="italic text-jung-accent">really</span>?
            </h1>

            {/* Subheadline */}
            <p className="text-body text-lg sm:text-xl text-jung-secondary max-w-xl leading-relaxed">
              In just 15 minutes, discover why you've gotten different results on every personality test.
              We measure all 8 cognitive functions independently—not just four letters.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                onClick={handleStart}
                className="group"
              >
                Discover My True Type — Free
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleLearn}
              >
                How Is This Different?
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm font-sans text-jung-muted">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-jung-accent" /> <strong className="text-jung-dark">12,847</strong> assessments taken
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> ~15 minutes
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> No signup required
              </span>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Decorative circle */}
              <div className="absolute -top-8 -right-8 w-64 h-64 bg-jung-accent/5 rounded-full blur-3xl" />

              {/* Results Preview Card */}
              <div className="relative bg-jung-surface rounded-2xl shadow-lg border border-jung-border p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-jung-accent-light flex items-center justify-center">
                    <img src="/logo.svg" alt="" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-heading text-base text-jung-dark">Your Results Preview</h3>
                    <p className="text-sm font-sans text-jung-muted">All 8 functions visualized</p>
                  </div>
                </div>

                {/* Radar Chart Preview */}
                <div className="relative w-full aspect-square max-w-[280px] mx-auto">
                  <svg viewBox="0 0 240 240" className="w-full h-full">
                    {/* Background octagon grids */}
                    <polygon points="120,30 190,60 210,120 190,180 120,210 50,180 30,120 50,60" fill="none" stroke="#E8E4DC" strokeWidth="1" />
                    <polygon points="120,50 175,75 190,120 175,165 120,190 65,165 50,120 65,75" fill="none" stroke="#E8E4DC" strokeWidth="1" />
                    <polygon points="120,70 160,90 170,120 160,150 120,170 80,150 70,120 80,90" fill="none" stroke="#E8E4DC" strokeWidth="1" />
                    {/* Sample profile shape */}
                    <polygon
                      points="120,40 180,70 195,125 170,170 120,185 70,160 45,115 65,65"
                      fill="rgba(166, 93, 49, 0.12)"
                      stroke="#A65D31"
                      strokeWidth="2"
                    />
                    {/* Function labels */}
                    <text x="120" y="16" textAnchor="middle" className="text-xs font-sans fill-jung-muted">Ni</text>
                    <text x="204" y="55" textAnchor="start" className="text-xs font-sans fill-jung-muted">Ne</text>
                    <text x="224" y="124" textAnchor="start" className="text-xs font-sans fill-jung-muted">Te</text>
                    <text x="204" y="195" textAnchor="start" className="text-xs font-sans fill-jung-muted">Ti</text>
                    <text x="120" y="232" textAnchor="middle" className="text-xs font-sans fill-jung-muted">Si</text>
                    <text x="36" y="195" textAnchor="end" className="text-xs font-sans fill-jung-muted">Se</text>
                    <text x="16" y="124" textAnchor="end" className="text-xs font-sans fill-jung-muted">Fe</text>
                    <text x="36" y="55" textAnchor="end" className="text-xs font-sans fill-jung-muted">Fi</text>
                  </svg>
                </div>

                {/* Testimonial Mini */}
                <div className="mt-6 pt-6 border-t border-jung-border">
                  <p className="text-sm italic text-jung-secondary leading-relaxed">
                    "Finally, a test that didn't try to box me in."
                  </p>
                  <p className="text-xs font-sans text-jung-muted mt-2">— Sarah K., Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
