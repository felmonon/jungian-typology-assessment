import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  Compass, Brain, ArrowRight, Activity, CheckCircle, Beaker,
  MessageCircle, Sparkles, Users, FileText, Target, Zap,
  ChevronDown, ChevronUp, Check, X, Clock, Shield, Star, Crown,
  Quote, ShieldCheck, ArrowUpRight
} from 'lucide-react';

const AI_DEMO_CONVERSATION = [
  {
    role: 'user',
    message: "How does my shadow affect my relationships?"
  },
  {
    role: 'assistant',
    message: `Your shadow—rooted in your inferior Extraverted Sensing (Se)—profoundly shapes your intimate connections. Because Se lives in your unconscious, you may unconsciously project it onto partners, finding yourself drawn to spontaneous, sensory-oriented people who embody what you've disowned.

**In practice, this creates a pattern:**

When stress mounts, your shadow Se erupts as impulsive criticism of a partner's "irresponsibility" or sudden sensory indulgence (binge eating, overspending) that shocks both of you. Your partner may feel they're dealing with two different people.

**The path forward:** Rather than fighting these eruptions, treat them as messages. When you feel the urge to criticize your partner's spontaneity, pause and ask: "What am I denying in myself?" Integration doesn't mean becoming Se-dominant—it means befriending that wild, present-moment energy so it enriches rather than sabotages your bonds.`
  }
];

const FAQ_ITEMS = [
  {
    question: "How is this different from 16Personalities or other MBTI tests?",
    answer: "Most tests force binary choices—you're either Thinking or Feeling. We measure all 8 cognitive functions on a spectrum, giving you a profile that's actually unique to you. We also base our methodology on Jung's original work and the Singer-Loomis framework, which has clinical validation."
  },
  {
    question: "Is this scientifically valid?",
    answer: "The Singer-Loomis Type Development Inventory, which informs our methodology, has been used in clinical and research settings since the 1980s. Unlike MBTI (which most research psychologists consider unreliable), measuring functions independently produces more consistent, meaningful results."
  },
  {
    question: "Why should I pay when other tests are free?",
    answer: "The free assessment gives you real results—not a teaser. Our Insight tier ($19) unlocks a comprehensive PDF report and full analysis. The Mastery tier ($39) adds the AI Type Coach and growth exercises you won't find elsewhere. Compare that to 16Personalities ($30+) or Truity ($29) which offer less depth."
  },
  {
    question: "What if I don't like my results?",
    answer: "This isn't about \"good\" or \"bad\" types. Every function pattern has strengths and growth areas. The goal is self-understanding, not judgment. That said, if you're unsatisfied with the premium purchase, contact us."
  },
  {
    question: "How long does the assessment take?",
    answer: "About 15-20 minutes. Answer honestly—don't overthink it."
  },
  {
    question: "Do I need to create an account?",
    answer: "Not for the free assessment. You'll only need an account if you purchase premium and want to save your results history."
  }
];

const TESTIMONIALS = [
  {
    quote: "I've taken MBTI tests probably 20 times over the years. Sometimes I'm INFP, sometimes INFJ, once I got ENFP. This assessment showed me why—my Fi and Ni scores are almost identical. The nuance matters.",
    name: "Sarah K.",
    role: "Designer"
  },
  {
    quote: "I was skeptical of all personality typing until I learned about cognitive functions. This is the only assessment I've found that measures them properly.",
    name: "Marcus T.",
    role: "Software Engineer"
  },
  {
    quote: "I recommend this to my coaching clients who want a deeper self-understanding baseline. It's more rigorous than most tools I've seen.",
    name: "Dr. Jennifer L.",
    role: "Executive Coach"
  }
];

// Function labels for the visualization
const FUNCTIONS = [
  { abbr: 'Ni', name: 'Introverted Intuition', color: '#6b8f71' },
  { abbr: 'Ne', name: 'Extraverted Intuition', color: '#6b7a8c' },
  { abbr: 'Si', name: 'Introverted Sensing', color: '#6b7a8c' },
  { abbr: 'Se', name: 'Extraverted Sensing', color: '#6b8f71' },
  { abbr: 'Ti', name: 'Introverted Thinking', color: '#c67d5e' },
  { abbr: 'Te', name: 'Extraverted Thinking', color: '#d4a574' },
  { abbr: 'Fi', name: 'Introverted Feeling', color: '#d4a574' },
  { abbr: 'Fe', name: 'Extraverted Feeling', color: '#c67d5e' },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  // Sticky header on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyHeader(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShownPopup) {
        setShowExitPopup(true);
        setHasShownPopup(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShownPopup]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowResponse(true);
      setIsTyping(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showResponse || !isTyping) return;

    const fullMessage = AI_DEMO_CONVERSATION[1].message;
    let index = 0;

    const typeInterval = setInterval(() => {
      if (index < fullMessage.length) {
        setDisplayedMessage(fullMessage.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 15);

    return () => clearInterval(typeInterval);
  }, [showResponse, isTyping]);

  return (
    <div className="flex flex-col items-center">
      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Sticky CTA Header */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-500 ${
          showStickyHeader
            ? 'translate-y-0 opacity-100 bg-[#0d0f14]/95 border-[#252a38]'
            : '-translate-y-full opacity-0 bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg text-[#f0ede8]">Jungian<span className="text-[#d4a574]">Typology</span></span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-[#a8a4a0] hidden md:inline">
              Free · 15 min · No signup
            </span>
            <Button size="sm" onClick={() => navigate('/assessment')}>
              Begin Assessment <ArrowRight className="ml-1 w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          HERO SECTION - Editorial style with dramatic typography
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0d0f14 0%, #1a1d26 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              {/* Eyebrow */}
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-[#d4a574]" />
                <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#d4a574]">
                  Cognitive Function Assessment
                </span>
              </div>

              {/* Headline - SCALE_SHOCK mutation */}
              <h1 className="font-serif text-[#f0ede8]">
                <span className="block text-3xl sm:text-4xl font-normal leading-tight">Who are you,</span>
                <span
                  className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-normal italic leading-[0.9] mt-2"
                  style={{ color: '#d4a574' }}
                >
                  really?
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-[#a8a4a0] max-w-xl leading-relaxed font-light">
                MBTI gives you a label. We give you a map of your mind—measuring all 8 cognitive functions independently to reveal how you actually think.
              </p>

              {/* CTA Group */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/assessment')}
                  className="group"
                >
                  Begin Assessment
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <button
                  onClick={() => navigate('/learn')}
                  className="px-6 py-3 text-[#a8a4a0] border border-[#3d4455] hover:border-[#6b6862] hover:text-[#f0ede8] transition-all text-sm font-medium"
                >
                  Learn the Theory
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-8 pt-4 text-[#6b6862] text-sm">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> ~15 min
                </span>
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" /> No signup
                </span>
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Free
                </span>
              </div>
            </div>

            {/* Right: 8 Functions Visualization */}
            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative w-[360px] h-[360px] sm:w-[420px] sm:h-[420px]">
                {/* Concentric circles */}
                <div className="absolute inset-0 border border-[#252a38] rounded-full" />
                <div className="absolute inset-8 border border-[#252a38]/60 rounded-full" />
                <div className="absolute inset-16 border border-[#252a38]/40 rounded-full" />

                {/* Dashed connecting circle */}
                <div
                  className="absolute inset-4 border border-dashed border-[#3d4455]/50 rounded-full"
                  style={{ animation: 'spin 60s linear infinite' }}
                />

                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-serif text-sm italic text-[#6b6862]">Your cognitive</p>
                    <p className="font-serif text-sm italic text-[#6b6862]">architecture</p>
                  </div>
                </div>

                {/* Function nodes positioned around the circle */}
                {FUNCTIONS.map((func, i) => {
                  const angle = (i * 45 - 90) * (Math.PI / 180);
                  const radius = 160;
                  const x = 50 + (radius / 210) * 50 * Math.cos(angle);
                  const y = 50 + (radius / 210) * 50 * Math.sin(angle);

                  return (
                    <div
                      key={func.abbr}
                      className="absolute w-16 h-16 flex flex-col items-center justify-center rounded-full border transition-all duration-300 hover:scale-110 cursor-default"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)',
                        background: '#1a1d26',
                        borderColor: func.color,
                        animation: `fadeIn 0.6s ease-out ${i * 100 + 500}ms both`,
                      }}
                    >
                      <span className="font-serif text-base font-semibold" style={{ color: func.color }}>
                        {func.abbr}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-[#6b6862] mt-0.5">
                        {i < 4 ? 'Perceive' : 'Judge'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1a1d26] to-transparent pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          PHILOSOPHY QUOTE - Full-width editorial moment
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 px-6 relative" style={{ background: '#1a1d26' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3d4455] to-transparent" />

        <div className="max-w-4xl mx-auto text-center">
          <span className="block font-serif text-6xl sm:text-7xl text-[#d4a574]/30 leading-none mb-6">"</span>
          <blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#f0ede8] leading-relaxed font-normal italic">
            The shoe that fits one person pinches another; there is no recipe for living that suits all cases.
          </blockquote>
          <cite className="block mt-8 text-sm text-[#6b6862] tracking-wide not-italic">
            — <span className="text-[#a8a4a0]">Carl Jung</span>, Modern Man in Search of a Soul
          </cite>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          THE PROBLEM - Editorial two-column layout with sticky header
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 px-6" style={{ background: '#0d0f14' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left column - sticky */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#d4a574] block mb-4">
                  The Problem
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#f0ede8] leading-tight mb-6">
                  MBTI promised insight.<br />
                  <span className="italic text-[#d4a574]">It delivered horoscopes.</span>
                </h2>
              </div>
            </div>

            {/* Right column - content */}
            <div className="lg:col-span-8 space-y-8">
              <p className="text-lg text-[#a8a4a0] leading-relaxed">
                You've been typed as an INFJ. Or an ENTP. Or whatever four letters the internet assigned you last Tuesday.
              </p>
              <p className="text-lg text-[#a8a4a0] leading-relaxed">
                But here's the thing—you've also tested as three other types depending on your mood, the website, or whether you had coffee that morning.
              </p>
              <p className="text-xl text-[#f0ede8] font-medium leading-relaxed">
                That's not your fault. It's the test's fault.
              </p>
              <p className="text-lg text-[#a8a4a0] leading-relaxed">
                Most personality assessments force you into 16 predetermined boxes using crude either/or questions. Thinking <em className="text-[#d4a574]">or</em> Feeling. Sensing <em className="text-[#d4a574]">or</em> Intuition. As if human psychology works in binary.
              </p>
              <p className="text-lg text-[#a8a4a0] leading-relaxed">
                It doesn't. Carl Jung knew this. His original work described 8 distinct cognitive functions that exist on a spectrum—present in everyone to varying degrees.
              </p>
              <p className="text-lg italic text-[#6b6862] border-l-2 border-[#3d4455] pl-6">
                Somewhere along the way, pop psychology threw out the nuance and gave us horoscopes with better marketing.
              </p>

              {/* Problem cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
                {[
                  { title: 'Binary thinking', desc: 'Forced dichotomies ignore cognitive spectrums' },
                  { title: 'Hidden functions', desc: 'The meaningful insight gets buried in letters' },
                  { title: 'Unreliable results', desc: '50% get different results on retest' },
                  { title: 'No growth path', desc: 'Static labels, not developmental maps' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="border-l-2 border-[#3d4455] hover:border-[#d4a574] pl-4 py-2 transition-colors"
                  >
                    <h3 className="text-[#f0ede8] font-medium mb-1">{item.title}</h3>
                    <p className="text-sm text-[#6b6862]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          METHODOLOGY - Scientific foundation
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 px-6 border-t border-[#252a38]" style={{ background: '#1a1d26' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#d4a574] block mb-4">
              Why 132 Questions?
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#f0ede8] leading-tight mb-6">
              Built on Scientific Methodology
            </h2>
            <p className="text-lg text-[#a8a4a0] max-w-2xl mx-auto">
              This isn't another 10-minute quiz. We use a validated approach that captures the true complexity of your psyche.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Singer-Loomis Card */}
            <div className="p-8 border border-[#252a38] hover:border-[#3d4455] transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 border border-[#6b8f71] flex items-center justify-center">
                  <Brain className="w-6 h-6 text-[#6b8f71]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#f0ede8]">Singer-Loomis Methodology</h3>
                  <p className="text-sm text-[#6b6862]">Peer-reviewed since 1980</p>
                </div>
              </div>
              <p className="text-[#a8a4a0] mb-6 leading-relaxed">
                Unlike MBTI's forced-choice format that assumes you're either Thinking OR Feeling, we measure each of the 8 cognitive functions <strong className="text-[#f0ede8]">independently</strong>.
              </p>
              <ul className="space-y-3">
                {['Each function scored on its own scale', 'No false dichotomies', 'Reveals nuanced development'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#a8a4a0]">
                    <Check className="w-4 h-4 text-[#6b8f71]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Scientific Validation Card */}
            <div className="p-8 border border-[#252a38] hover:border-[#3d4455] transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 border border-[#d4a574] flex items-center justify-center">
                  <Beaker className="w-6 h-6 text-[#d4a574]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#f0ede8]">Scientific Validation</h3>
                  <p className="text-sm text-[#6b6862]">Grounded in research</p>
                </div>
              </div>
              <p className="text-[#a8a4a0] mb-6 leading-relaxed">
                132 questions isn't arbitrary. It's the minimum needed to reliably measure 8 distinct cognitive functions with proper statistical validity.
              </p>
              <ul className="space-y-3">
                {['~16 questions per function', 'Stress/grip probes for accuracy', 'Based on Jung\'s original work'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#a8a4a0]">
                    <Check className="w-4 h-4 text-[#d4a574]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          THE 8 FUNCTIONS - Grid display
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 px-6" style={{ background: '#0d0f14' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#d4a574] block mb-4">
              The 8 Functions
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#f0ede8] leading-tight mb-6">
              A more complete map
            </h2>
            <p className="text-lg text-[#a8a4a0] max-w-2xl mx-auto">
              Jung identified eight cognitive functions—four ways of perceiving and four ways of judging. We measure each independently.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#252a38]">
            {[
              { abbr: 'Ni', name: 'Introverted Intuition', desc: 'Synthesizes into singular insights. Future-focused pattern recognition.', color: '#6b8f71' },
              { abbr: 'Ne', name: 'Extraverted Intuition', desc: 'Generates possibilities. Explores connections and tangents.', color: '#6b7a8c' },
              { abbr: 'Si', name: 'Introverted Sensing', desc: 'Stores detailed impressions. Values tradition and experience.', color: '#6b7a8c' },
              { abbr: 'Se', name: 'Extraverted Sensing', desc: 'Engages with the present moment. Seeks sensory experience.', color: '#6b8f71' },
              { abbr: 'Ti', name: 'Introverted Thinking', desc: 'Builds internal logic frameworks. Analyzes from first principles.', color: '#c67d5e' },
              { abbr: 'Te', name: 'Extraverted Thinking', desc: 'Organizes externally. Values systems and measurable results.', color: '#d4a574' },
              { abbr: 'Fi', name: 'Introverted Feeling', desc: 'Navigates by internal values. Seeks authenticity.', color: '#d4a574' },
              { abbr: 'Fe', name: 'Extraverted Feeling', desc: 'Reads social dynamics. Values harmony and connection.', color: '#c67d5e' },
            ].map((func, i) => (
              <div
                key={func.abbr}
                className="p-6 hover:bg-[#1a1d26] transition-colors"
                style={{ background: '#0d0f14' }}
              >
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-serif text-3xl font-semibold" style={{ color: func.color }}>
                    {func.abbr}
                  </span>
                  <span className="text-xs text-[#6b6862]">{func.name}</span>
                </div>
                <p className="text-sm text-[#a8a4a0] leading-relaxed">{func.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          HOW IT WORKS - Three steps
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 px-6 border-t border-[#252a38]" style={{ background: '#1a1d26' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#d4a574] block mb-4">
              The Process
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#f0ede8] leading-tight">
              Three steps to actual understanding
            </h2>
          </div>

          <div className="space-y-16">
            {[
              {
                num: '01',
                title: 'Answer 132 questions honestly',
                desc: 'No trick questions. No "which animal are you?" nonsense. Each question measures a specific cognitive function based on the Singer-Loomis methodology.'
              },
              {
                num: '02',
                title: 'See your complete cognitive profile',
                desc: 'Your results show how you actually use all 8 functions—not which box you fit into. Visualized as a radar chart unique to you.'
              },
              {
                num: '03',
                title: 'Understand what it means',
                desc: 'Get AI-generated insights about your specific pattern. Not copy-pasted descriptions. Analysis written for your exact results.'
              }
            ].map((step, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-2">
                  <span className="font-serif text-6xl text-[#252a38]">{step.num}</span>
                </div>
                <div className="md:col-span-10 md:pt-4">
                  <h3 className="font-serif text-2xl text-[#d4a574] mb-4">{step.title}</h3>
                  <p className="text-lg text-[#a8a4a0] leading-relaxed max-w-2xl">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button size="lg" onClick={() => navigate('/assessment')}>
              Start My Free Assessment <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <p className="text-[#6b6862] text-sm mt-4">Most people finish in 12-15 minutes</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          AI TYPE COACH DEMO
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 px-6" style={{ background: '#0d0f14' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#d4a574] block mb-4">
              Premium Feature
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#f0ede8] leading-tight mb-6">
              AI Type Coach in Action
            </h2>
            <p className="text-lg text-[#a8a4a0] max-w-2xl mx-auto">
              Ask deep questions about your psychology. Get personalized, Jungian-informed insights.
            </p>
          </div>

          {/* Chat Demo */}
          <div className="max-w-3xl mx-auto">
            <div className="border border-[#252a38] overflow-hidden">
              {/* Chat Header */}
              <div className="px-6 py-4 flex items-center gap-3 border-b border-[#252a38]" style={{ background: '#1a1d26' }}>
                <div className="w-10 h-10 border border-[#d4a574] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#d4a574]" />
                </div>
                <div>
                  <h4 className="font-medium text-[#f0ede8]">AI Type Coach</h4>
                  <p className="text-sm text-[#6b6862]">Powered by your assessment results</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-6 min-h-[400px]" style={{ background: '#0d0f14' }}>
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="px-5 py-3 max-w-[85%] text-[#f0ede8]" style={{ background: '#252a38' }}>
                    <p>{AI_DEMO_CONVERSATION[0].message}</p>
                  </div>
                </div>

                {/* AI Response */}
                {showResponse && (
                  <div className="flex justify-start">
                    <div className="px-5 py-3 max-w-[85%] border border-[#252a38]" style={{ background: '#1a1d26' }}>
                      <div className="space-y-3">
                        {displayedMessage.split('\n\n').map((paragraph, idx) => {
                          if (paragraph.startsWith('**')) {
                            return (
                              <p key={idx} className="font-semibold text-[#f0ede8] mt-4 first:mt-0">
                                {paragraph.replace(/\*\*/g, '')}
                              </p>
                            );
                          }
                          return <p key={idx} className="text-[#a8a4a0] leading-relaxed">{paragraph}</p>;
                        })}
                        {isTyping && (
                          <span className="inline-block w-0.5 h-4 bg-[#d4a574] animate-pulse ml-1" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input (decorative) */}
              <div className="border-t border-[#252a38] px-4 py-3" style={{ background: '#1a1d26' }}>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Ask about your type, relationships, career..."
                    className="flex-1 px-4 py-2 bg-[#0d0f14] border border-[#252a38] text-sm text-[#6b6862] cursor-not-allowed"
                    disabled
                  />
                  <button className="w-10 h-10 border border-[#252a38] flex items-center justify-center cursor-not-allowed">
                    <ArrowRight className="w-5 h-5 text-[#3d4455]" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center text-[#6b6862] text-sm mt-6">
              Unlock the AI Type Coach with your premium assessment results
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          COMPARISON TABLE
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 px-6 border-t border-[#252a38]" style={{ background: '#1a1d26' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#f0ede8] leading-tight">
              How we compare
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-4 px-4 text-[#6b6862] text-sm font-medium border-b border-[#252a38]"></th>
                  <th className="py-4 px-4 text-[#6b6862] text-sm font-medium border-b border-[#252a38]">16Personalities</th>
                  <th className="py-4 px-4 text-[#6b6862] text-sm font-medium border-b border-[#252a38]">Enneagram</th>
                  <th className="py-4 px-4 text-[#6b6862] text-sm font-medium border-b border-[#252a38]">Big Five</th>
                  <th className="py-4 px-4 text-[#d4a574] text-sm font-medium border-b border-[#d4a574]">JungianTypology</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ['Approach', '4 dichotomies', 'Motivation-based', '5 trait spectrums', '8 functions independently'],
                  ['Scientific basis', 'Weak', 'Minimal', 'Strong', 'Singer-Loomis validated'],
                  ['Personalization', 'Generic', 'Generic', 'Statistical', 'AI-written for your scores'],
                  ['Growth path', 'Read about type', 'Work on wing', 'None', 'Individuation roadmap'],
                  ['Price', '$30-40', '$29+', 'Free-$50', 'Free / $19 / $39'],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[#252a38]/50">
                    <td className="py-4 px-4 text-[#f0ede8] font-medium">{row[0]}</td>
                    <td className="py-4 px-4 text-center text-[#6b6862]">{row[1]}</td>
                    <td className="py-4 px-4 text-center text-[#6b6862]">{row[2]}</td>
                    <td className="py-4 px-4 text-center text-[#6b6862]">{row[3]}</td>
                    <td className="py-4 px-4 text-center text-[#f0ede8] font-medium" style={{ background: 'rgba(212, 165, 116, 0.05)' }}>{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          PRICING - Three tiers
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 px-6" style={{ background: '#0d0f14' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#d4a574] block mb-4">
              Choose Your Path
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#f0ede8] leading-tight mb-4">
              Start free, go deeper when ready
            </h2>
            <p className="text-[#6b6862]">
              Professional assessments cost $50-200. Get validated results starting at $0.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* FREE Tier */}
            <div className="border border-[#252a38] p-8 hover:border-[#3d4455] transition-colors">
              <div className="text-center mb-8">
                <Compass className="w-8 h-8 text-[#6b6862] mx-auto mb-4" />
                <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-[#6b6862] mb-2">Free</h3>
                <div className="font-serif text-5xl text-[#f0ede8]">$0</div>
                <p className="text-sm text-[#6b6862] mt-2">See Your Profile</p>
              </div>
              <ul className="space-y-4 mb-8">
                {['132-question assessment', 'Radar chart visualization', 'Basic AI insight', 'Shareable results'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#a8a4a0]">
                    <Check className="w-4 h-4 text-[#6b6862]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/assessment')}
              >
                Take Free Assessment
              </Button>
            </div>

            {/* INSIGHT Tier - Featured */}
            <div className="border-2 border-[#d4a574] p-8 relative" style={{ background: 'rgba(212, 165, 116, 0.03)' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-medium tracking-wider uppercase" style={{ background: '#d4a574', color: '#0d0f14' }}>
                Most Popular
              </div>
              <div className="text-center mb-8">
                <Brain className="w-8 h-8 text-[#d4a574] mx-auto mb-4" />
                <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-[#d4a574] mb-2">Insight</h3>
                <div className="font-serif text-5xl text-[#d4a574]">$19</div>
                <p className="text-sm text-[#6b6862] mt-2">Understand What It Means</p>
              </div>
              <ul className="space-y-4 mb-8">
                {['25-page PDF report', 'Full 8-function analysis', 'Relationship insights', 'Career alignment guide'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#f0ede8]">
                    <Check className="w-4 h-4 text-[#d4a574]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                onClick={() => navigate('/pricing')}
              >
                Get Insight
              </Button>
              <p className="text-center text-xs text-[#6b6862] mt-4">One-time payment</p>
            </div>

            {/* MASTERY Tier */}
            <div className="border border-[#252a38] p-8 hover:border-[#3d4455] transition-colors">
              <div className="text-center mb-8">
                <Sparkles className="w-8 h-8 text-[#c67d5e] mx-auto mb-4" />
                <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-[#c67d5e] mb-2">Mastery</h3>
                <div className="font-serif text-5xl text-[#f0ede8]">$39</div>
                <p className="text-sm text-[#6b6862] mt-2">Transform With Guidance</p>
              </div>
              <ul className="space-y-4 mb-8">
                {['AI Type Coach (unlimited)', 'Growth exercises', 'Dream journaling guide', 'Everything in Insight'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#a8a4a0]">
                    <Sparkles className="w-4 h-4 text-[#c67d5e]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full border-[#c67d5e] text-[#c67d5e] hover:bg-[#c67d5e]/10"
                onClick={() => navigate('/pricing')}
              >
                Get Mastery
              </Button>
              <p className="text-center text-xs text-[#6b6862] mt-4">Lifetime access</p>
            </div>
          </div>

          {/* Money-back guarantee */}
          <div className="text-center mt-12 pt-8 border-t border-[#252a38]">
            <div className="flex items-center justify-center gap-3 text-[#6b6862]">
              <ShieldCheck className="w-5 h-5 text-[#6b8f71]" />
              <p className="text-sm">
                <strong className="text-[#a8a4a0]">30-day money-back guarantee.</strong> Not satisfied? Full refund, no questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 px-6 border-t border-[#252a38]" style={{ background: '#1a1d26' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#f0ede8] leading-tight">
              "Finally, a test that didn't try to box me in"
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="border border-[#252a38] p-6">
                <p className="text-[#a8a4a0] italic mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-[#3d4455] flex items-center justify-center">
                    <span className="font-serif text-[#d4a574]">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-[#f0ede8] font-medium">{testimonial.name}</p>
                    <p className="text-sm text-[#6b6862]">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 px-6" style={{ background: '#0d0f14' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#f0ede8] leading-tight">
              Questions people ask
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <div key={index} className="border border-[#252a38]">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#1a1d26] transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-medium text-[#f0ede8] pr-4">{item.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-[#6b6862] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#6b6862] flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 border-t border-[#252a38]" style={{ background: '#1a1d26' }}>
                    <p className="text-[#a8a4a0] leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 px-6" style={{ background: '#d4a574' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight mb-6" style={{ color: '#0d0f14' }}>
            Stop fitting yourself into boxes
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: '#451a03' }}>
            Take the assessment Jung would have built. See all 8 of your cognitive functions. Get insights that actually mean something.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/assessment')}
              className="bg-[#0d0f14] hover:bg-[#1a1d26] text-[#f0ede8]"
            >
              Take the Free Assessment <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <button
              onClick={() => navigate('/learn')}
              className="px-6 py-3 border-2 hover:bg-[#0d0f14]/10 transition-colors font-medium"
              style={{ borderColor: '#0d0f14', color: '#0d0f14' }}
            >
              Learn the Theory First
            </button>
          </div>
          <p className="text-sm mt-8 flex items-center justify-center gap-4 flex-wrap" style={{ color: '#451a03' }}>
            <span>15 minutes</span>
            <span>·</span>
            <span>No signup</span>
            <span>·</span>
            <span>Instant results</span>
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          EXIT INTENT POPUP
      ═══════════════════════════════════════════════════════════════════════════ */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className="max-w-md w-full p-8 relative border border-[#252a38]"
            style={{ background: '#1a1d26' }}
          >
            <button
              onClick={() => setShowExitPopup(false)}
              className="absolute top-4 right-4 text-[#6b6862] hover:text-[#a8a4a0] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 border border-[#d4a574] flex items-center justify-center mx-auto mb-6">
                <Compass className="w-8 h-8 text-[#d4a574]" />
              </div>

              <h3 className="font-serif text-2xl text-[#f0ede8] mb-4">
                Before you go...
              </h3>

              <p className="text-[#a8a4a0] mb-6">
                Did you know most people get <strong className="text-[#f0ede8]">different results</strong> every time they take a personality test? Ours measures all 8 cognitive functions independently—so your results stay consistent.
              </p>

              <div className="border border-[#252a38] p-4 mb-6 text-left" style={{ background: '#0d0f14' }}>
                <p className="text-sm text-[#a8a4a0] italic">
                  "I've taken MBTI tests 20 times and always got different results. This finally explained why."
                </p>
                <p className="text-xs text-[#6b6862] mt-2">— Sarah K.</p>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  setShowExitPopup(false);
                  navigate('/assessment');
                }}
              >
                Try the Free Assessment <ArrowRight className="ml-2 w-4 h-4" />
              </Button>

              <button
                onClick={() => setShowExitPopup(false)}
                className="mt-4 text-sm text-[#6b6862] hover:text-[#a8a4a0] transition-colors"
              >
                No thanks, I'll pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
