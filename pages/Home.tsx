import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  ArrowRight, CheckCircle, Beaker,
  MessageCircle, Sparkles, Brain,
  ChevronDown, ChevronUp, Check, X, Clock, Shield,
  ShieldCheck, Compass
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

// Cognitive functions with semantic colors
const FUNCTIONS = [
  { abbr: 'Ni', name: 'Introverted Intuition', desc: 'Synthesizes into singular insights', type: 'perceive' },
  { abbr: 'Ne', name: 'Extraverted Intuition', desc: 'Generates possibilities', type: 'perceive' },
  { abbr: 'Si', name: 'Introverted Sensing', desc: 'Stores detailed impressions', type: 'perceive' },
  { abbr: 'Se', name: 'Extraverted Sensing', desc: 'Engages the present moment', type: 'perceive' },
  { abbr: 'Ti', name: 'Introverted Thinking', desc: 'Builds internal logic', type: 'judge' },
  { abbr: 'Te', name: 'Extraverted Thinking', desc: 'Organizes externally', type: 'judge' },
  { abbr: 'Fi', name: 'Introverted Feeling', desc: 'Navigates by values', type: 'judge' },
  { abbr: 'Fe', name: 'Extraverted Feeling', desc: 'Reads social dynamics', type: 'judge' },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);

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
    <div className="flex flex-col">
      {/* ════════════════════════════════════════════════════════════════════
          HERO - Asymmetric editorial layout
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23451a03' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 md:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            {/* Left column - Main content */}
            <div className="lg:col-span-7 space-y-8">
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-jung-accent"></span>
                <span className="text-xs font-medium tracking-[0.15em] uppercase text-jung-accent">
                  Cognitive Function Assessment
                </span>
              </div>

              {/* Headline - SCALE_SHOCK */}
              <h1 className="font-serif text-jung-dark leading-[1.1]">
                <span className="block text-2xl sm:text-3xl md:text-4xl font-normal text-jung-secondary">
                  Who are you,
                </span>
                <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold italic text-jung-primary mt-1">
                  really?
                </span>
              </h1>

              {/* Subhead */}
              <p className="text-lg md:text-xl text-jung-secondary max-w-xl leading-relaxed">
                MBTI gives you a label. We give you a map of your mind—measuring all 8 cognitive functions independently to reveal how you actually think.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button size="lg" onClick={() => navigate('/assessment')}>
                  Begin Assessment
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/learn')}>
                  Learn the Theory
                </Button>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-jung-secondary pt-2">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-jung-accent" />
                  ~15 minutes
                </span>
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-jung-accent" />
                  No signup required
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-jung-accent" />
                  Free to start
                </span>
              </div>
            </div>

            {/* Right column - Functions visualization */}
            <div className="lg:col-span-5 lg:pt-8">
              <div className="bg-white/60 backdrop-blur-sm border border-stone-200 p-6 md:p-8 rounded-sm shadow-sm">
                <p className="text-xs font-medium tracking-[0.15em] uppercase text-jung-secondary mb-6">
                  The 8 Cognitive Functions
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {FUNCTIONS.map((func, i) => (
                    <div
                      key={func.abbr}
                      className="group p-4 border border-stone-200 hover:border-jung-accent hover:bg-jung-accent/5 transition-all duration-300 cursor-default rounded-sm"
                      style={{
                        animationDelay: `${i * 80}ms`,
                      }}
                    >
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-serif text-2xl font-semibold text-jung-primary group-hover:text-jung-accent transition-colors">
                          {func.abbr}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-jung-secondary">
                          {func.type}
                        </span>
                      </div>
                      <p className="text-xs text-jung-secondary leading-snug">{func.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          QUOTE - Full-width moment
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-jung-dark py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <blockquote className="font-serif text-xl sm:text-2xl md:text-3xl text-stone-200 leading-relaxed italic">
            "The shoe that fits one person pinches another; there is no recipe for living that suits all cases."
          </blockquote>
          <cite className="block mt-6 text-sm text-stone-500 not-italic tracking-wide">
            — Carl Jung, <span className="text-stone-400">Modern Man in Search of a Soul</span>
          </cite>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          THE PROBLEM - Editorial two-column
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Sticky left */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <span className="text-xs font-medium tracking-[0.15em] uppercase text-jung-accent block mb-3">
                  The Problem
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-jung-dark leading-tight">
                  MBTI promised insight.<br />
                  <span className="text-jung-accent italic">It delivered horoscopes.</span>
                </h2>
              </div>
            </div>

            {/* Scrolling right */}
            <div className="lg:col-span-8 space-y-6">
              <p className="text-lg text-jung-secondary leading-relaxed">
                You've been typed as an INFJ. Or an ENTP. Or whatever four letters the internet assigned you last Tuesday.
              </p>
              <p className="text-lg text-jung-secondary leading-relaxed">
                But here's the thing—you've also tested as three other types depending on your mood, the website, or whether you had coffee that morning.
              </p>
              <p className="text-xl text-jung-dark font-medium leading-relaxed">
                That's not your fault. It's the test's fault.
              </p>
              <p className="text-lg text-jung-secondary leading-relaxed">
                Most personality assessments force you into 16 predetermined boxes using crude either/or questions. Thinking <em className="text-jung-accent font-medium not-italic">or</em> Feeling. Sensing <em className="text-jung-accent font-medium not-italic">or</em> Intuition. As if human psychology works in binary.
              </p>
              <p className="text-lg text-jung-secondary leading-relaxed">
                It doesn't. Carl Jung knew this. His original work described 8 distinct cognitive functions that exist on a spectrum—present in everyone to varying degrees.
              </p>
              <p className="text-lg text-jung-secondary italic border-l-2 border-jung-accent pl-6 py-2">
                Somewhere along the way, pop psychology threw out the nuance and gave us horoscopes with better marketing.
              </p>

              {/* Problem cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                {[
                  { title: 'Binary thinking', desc: 'Forced dichotomies ignore cognitive spectrums' },
                  { title: 'Hidden functions', desc: 'The meaningful insight gets buried in letters' },
                  { title: 'Unreliable results', desc: '50% get different results on retest' },
                  { title: 'No growth path', desc: 'Static labels, not developmental maps' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="border-l-2 border-stone-300 hover:border-jung-primary pl-4 py-2 transition-colors"
                  >
                    <h3 className="font-medium text-jung-dark mb-1">{item.title}</h3>
                    <p className="text-sm text-jung-secondary">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          METHODOLOGY - Cards
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-stone-100 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-medium tracking-[0.15em] uppercase text-jung-accent block mb-3">
              Why 132 Questions?
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-jung-dark mb-4">
              Built on Scientific Methodology
            </h2>
            <p className="text-lg text-jung-secondary max-w-2xl mx-auto">
              This isn't another 10-minute quiz. We use a validated approach that captures the true complexity of your psyche.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Singer-Loomis */}
            <div className="bg-white p-8 rounded-sm border border-stone-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-sm bg-jung-primary/10 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-jung-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-jung-dark">Singer-Loomis Methodology</h3>
                  <p className="text-sm text-jung-secondary">Peer-reviewed since 1980</p>
                </div>
              </div>
              <p className="text-jung-secondary mb-6 leading-relaxed">
                Unlike MBTI's forced-choice format that assumes you're either Thinking OR Feeling, we measure each of the 8 cognitive functions <strong className="text-jung-dark">independently</strong>.
              </p>
              <ul className="space-y-3">
                {['Each function scored on its own scale', 'No false dichotomies', 'Reveals nuanced development'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-jung-secondary">
                    <Check className="w-4 h-4 text-jung-accent flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Scientific Validation */}
            <div className="bg-white p-8 rounded-sm border border-stone-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-sm bg-jung-accent/10 flex items-center justify-center">
                  <Beaker className="w-6 h-6 text-jung-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-jung-dark">Scientific Validation</h3>
                  <p className="text-sm text-jung-secondary">Grounded in research</p>
                </div>
              </div>
              <p className="text-jung-secondary mb-6 leading-relaxed">
                132 questions isn't arbitrary. It's the minimum needed to reliably measure 8 distinct cognitive functions with proper statistical validity.
              </p>
              <ul className="space-y-3">
                {['~16 questions per function', 'Stress/grip probes for accuracy', 'Based on Jung\'s original work'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-jung-secondary">
                    <Check className="w-4 h-4 text-jung-accent flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          THE 8 FUNCTIONS - Grid
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-medium tracking-[0.15em] uppercase text-jung-accent block mb-3">
              The 8 Functions
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-jung-dark mb-4">
              A more complete map
            </h2>
            <p className="text-lg text-jung-secondary max-w-2xl mx-auto">
              Jung identified eight cognitive functions—four ways of perceiving and four ways of judging. We measure each independently.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-stone-200 border border-stone-200">
            {[
              { abbr: 'Ni', name: 'Introverted Intuition', desc: 'Synthesizes into singular insights. Future-focused pattern recognition.' },
              { abbr: 'Ne', name: 'Extraverted Intuition', desc: 'Generates possibilities. Explores connections and tangents.' },
              { abbr: 'Si', name: 'Introverted Sensing', desc: 'Stores detailed impressions. Values tradition and experience.' },
              { abbr: 'Se', name: 'Extraverted Sensing', desc: 'Engages with the present moment. Seeks sensory experience.' },
              { abbr: 'Ti', name: 'Introverted Thinking', desc: 'Builds internal logic frameworks. Analyzes from first principles.' },
              { abbr: 'Te', name: 'Extraverted Thinking', desc: 'Organizes externally. Values systems and measurable results.' },
              { abbr: 'Fi', name: 'Introverted Feeling', desc: 'Navigates by internal values. Seeks authenticity.' },
              { abbr: 'Fe', name: 'Extraverted Feeling', desc: 'Reads social dynamics. Values harmony and connection.' },
            ].map((func) => (
              <div
                key={func.abbr}
                className="bg-jung-base p-6 hover:bg-white transition-colors"
              >
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-serif text-3xl font-semibold text-jung-primary">
                    {func.abbr}
                  </span>
                </div>
                <p className="text-xs text-jung-secondary mb-2">{func.name}</p>
                <p className="text-sm text-jung-secondary leading-relaxed">{func.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          HOW IT WORKS - Steps
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-stone-100 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-medium tracking-[0.15em] uppercase text-jung-accent block mb-3">
              The Process
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-jung-dark">
              Three steps to actual understanding
            </h2>
          </div>

          <div className="space-y-12">
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
              <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-2">
                  <span className="font-serif text-6xl text-stone-300">{step.num}</span>
                </div>
                <div className="md:col-span-10">
                  <h3 className="font-serif text-xl md:text-2xl text-jung-primary mb-3">{step.title}</h3>
                  <p className="text-lg text-jung-secondary leading-relaxed max-w-2xl">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate('/assessment')}>
              Start My Free Assessment
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-jung-secondary text-sm mt-4">Most people finish in 12-15 minutes</p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          AI TYPE COACH DEMO
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-medium tracking-[0.15em] uppercase text-jung-accent block mb-3">
              Premium Feature
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-jung-dark mb-4">
              AI Type Coach in Action
            </h2>
            <p className="text-lg text-jung-secondary max-w-2xl mx-auto">
              Ask deep questions about your psychology. Get personalized, Jungian-informed insights.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="border border-stone-200 rounded-sm overflow-hidden bg-white shadow-sm">
              {/* Header */}
              <div className="px-6 py-4 flex items-center gap-3 border-b border-stone-200 bg-stone-50">
                <div className="w-10 h-10 rounded-sm bg-jung-accent/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-jung-accent" />
                </div>
                <div>
                  <h4 className="font-medium text-jung-dark">AI Type Coach</h4>
                  <p className="text-sm text-jung-secondary">Powered by your assessment results</p>
                </div>
              </div>

              {/* Messages */}
              <div className="p-6 space-y-6 min-h-[350px] bg-stone-50/50">
                {/* User */}
                <div className="flex justify-end">
                  <div className="px-4 py-3 bg-jung-primary text-white rounded-sm max-w-[80%]">
                    <p>{AI_DEMO_CONVERSATION[0].message}</p>
                  </div>
                </div>

                {/* AI */}
                {showResponse && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 bg-white border border-stone-200 rounded-sm max-w-[80%]">
                      <div className="space-y-3">
                        {displayedMessage.split('\n\n').map((paragraph, idx) => {
                          if (paragraph.startsWith('**')) {
                            return (
                              <p key={idx} className="font-medium text-jung-dark mt-4 first:mt-0">
                                {paragraph.replace(/\*\*/g, '')}
                              </p>
                            );
                          }
                          return <p key={idx} className="text-jung-secondary leading-relaxed">{paragraph}</p>;
                        })}
                        {isTyping && (
                          <span className="inline-block w-0.5 h-4 bg-jung-accent animate-pulse ml-1" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-stone-200 px-4 py-3 bg-white">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Ask about your type, relationships, career..."
                    className="flex-1 px-4 py-2 bg-stone-100 border border-stone-200 rounded-sm text-sm text-jung-secondary cursor-not-allowed"
                    disabled
                  />
                  <button className="w-10 h-10 rounded-sm border border-stone-200 flex items-center justify-center cursor-not-allowed bg-stone-100">
                    <ArrowRight className="w-5 h-5 text-stone-400" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center text-jung-secondary text-sm mt-6">
              Unlock the AI Type Coach with your premium assessment results
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          COMPARISON TABLE
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-stone-100 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-jung-dark">
              How we compare
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-sm overflow-hidden">
              <thead>
                <tr className="bg-stone-50">
                  <th className="text-left py-4 px-4 text-jung-secondary text-sm font-medium border-b border-stone-200"></th>
                  <th className="py-4 px-4 text-jung-secondary text-sm font-medium border-b border-stone-200">16Personalities</th>
                  <th className="py-4 px-4 text-jung-secondary text-sm font-medium border-b border-stone-200">Enneagram</th>
                  <th className="py-4 px-4 text-jung-secondary text-sm font-medium border-b border-stone-200">Big Five</th>
                  <th className="py-4 px-4 text-jung-primary text-sm font-semibold border-b-2 border-jung-accent bg-jung-accent/5">JungianTypology</th>
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
                  <tr key={i} className="border-b border-stone-100 last:border-b-0">
                    <td className="py-4 px-4 text-jung-dark font-medium">{row[0]}</td>
                    <td className="py-4 px-4 text-center text-jung-secondary">{row[1]}</td>
                    <td className="py-4 px-4 text-center text-jung-secondary">{row[2]}</td>
                    <td className="py-4 px-4 text-center text-jung-secondary">{row[3]}</td>
                    <td className="py-4 px-4 text-center text-jung-dark font-medium bg-jung-accent/5">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          PRICING
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-medium tracking-[0.15em] uppercase text-jung-accent block mb-3">
              Choose Your Path
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-jung-dark mb-4">
              Start free, go deeper when ready
            </h2>
            <p className="text-jung-secondary">
              Professional assessments cost $50-200. Get validated results starting at $0.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* FREE */}
            <div className="border border-stone-200 p-8 bg-white rounded-sm">
              <div className="text-center mb-8">
                <Compass className="w-8 h-8 text-jung-secondary mx-auto mb-4" />
                <h3 className="text-xs font-medium tracking-[0.15em] uppercase text-jung-secondary mb-2">Free</h3>
                <div className="font-serif text-5xl text-jung-dark">$0</div>
                <p className="text-sm text-jung-secondary mt-2">See Your Profile</p>
              </div>
              <ul className="space-y-4 mb-8">
                {['132-question assessment', 'Radar chart visualization', 'Basic AI insight', 'Shareable results'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-jung-secondary">
                    <Check className="w-4 h-4 text-jung-secondary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate('/assessment')}>
                Take Free Assessment
              </Button>
            </div>

            {/* INSIGHT - Featured */}
            <div className="border-2 border-jung-accent p-8 bg-white rounded-sm relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-medium tracking-wider uppercase bg-jung-accent text-white rounded-sm">
                Most Popular
              </div>
              <div className="text-center mb-8">
                <Brain className="w-8 h-8 text-jung-accent mx-auto mb-4" />
                <h3 className="text-xs font-medium tracking-[0.15em] uppercase text-jung-accent mb-2">Insight</h3>
                <div className="font-serif text-5xl text-jung-primary">$19</div>
                <p className="text-sm text-jung-secondary mt-2">Understand What It Means</p>
              </div>
              <ul className="space-y-4 mb-8">
                {['25-page PDF report', 'Full 8-function analysis', 'Relationship insights', 'Career alignment guide'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-jung-dark">
                    <Check className="w-4 h-4 text-jung-accent flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full" onClick={() => navigate('/pricing')}>
                Get Insight
              </Button>
              <p className="text-center text-xs text-jung-secondary mt-4">One-time payment</p>
            </div>

            {/* MASTERY */}
            <div className="border border-stone-200 p-8 bg-white rounded-sm">
              <div className="text-center mb-8">
                <Sparkles className="w-8 h-8 text-jung-primary mx-auto mb-4" />
                <h3 className="text-xs font-medium tracking-[0.15em] uppercase text-jung-primary mb-2">Mastery</h3>
                <div className="font-serif text-5xl text-jung-dark">$39</div>
                <p className="text-sm text-jung-secondary mt-2">Transform With Guidance</p>
              </div>
              <ul className="space-y-4 mb-8">
                {['AI Type Coach (unlimited)', 'Growth exercises', 'Dream journaling guide', 'Everything in Insight'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-jung-secondary">
                    <Sparkles className="w-4 h-4 text-jung-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate('/pricing')}>
                Get Mastery
              </Button>
              <p className="text-center text-xs text-jung-secondary mt-4">Lifetime access</p>
            </div>
          </div>

          {/* Guarantee */}
          <div className="text-center mt-12 pt-8 border-t border-stone-200">
            <div className="flex items-center justify-center gap-3 text-jung-secondary">
              <ShieldCheck className="w-5 h-5 text-jung-accent" />
              <p className="text-sm">
                <strong className="text-jung-dark">30-day money-back guarantee.</strong> Not satisfied? Full refund, no questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-stone-100 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-jung-dark">
              "Finally, a test that didn't try to box me in"
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-sm border border-stone-200">
                <p className="text-jung-secondary italic mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-jung-primary/10 flex items-center justify-center">
                    <span className="font-serif text-jung-primary font-semibold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-jung-dark font-medium">{testimonial.name}</p>
                    <p className="text-sm text-jung-secondary">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-jung-dark">
              Questions people ask
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => (
              <div key={index} className="border border-stone-200 rounded-sm bg-white overflow-hidden">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-stone-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-medium text-jung-dark pr-4">{item.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-jung-secondary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-jung-secondary flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 border-t border-stone-200 bg-stone-50">
                    <p className="text-jung-secondary leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-jung-primary py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-white leading-tight mb-6">
            Stop fitting yourself into boxes
          </h2>
          <p className="text-lg text-stone-300 mb-8 max-w-xl mx-auto">
            Take the assessment Jung would have built. See all 8 of your cognitive functions. Get insights that actually mean something.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/assessment')}
              className="bg-white text-jung-primary hover:bg-stone-100"
            >
              Take the Free Assessment
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/learn')}
              className="border-white text-white hover:bg-white/10"
            >
              Learn the Theory First
            </Button>
          </div>
          <p className="text-sm text-stone-400 mt-8 flex items-center justify-center gap-4 flex-wrap">
            <span>15 minutes</span>
            <span>·</span>
            <span>No signup</span>
            <span>·</span>
            <span>Instant results</span>
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          EXIT POPUP
      ════════════════════════════════════════════════════════════════════ */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full p-8 rounded-sm relative shadow-xl">
            <button
              onClick={() => setShowExitPopup(false)}
              className="absolute top-4 right-4 text-jung-secondary hover:text-jung-dark transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-jung-accent/10 flex items-center justify-center mx-auto mb-6">
                <Compass className="w-8 h-8 text-jung-accent" />
              </div>

              <h3 className="font-serif text-2xl text-jung-dark mb-4">
                Before you go...
              </h3>

              <p className="text-jung-secondary mb-6">
                Did you know most people get <strong className="text-jung-dark">different results</strong> every time they take a personality test? Ours measures all 8 cognitive functions independently—so your results stay consistent.
              </p>

              <div className="bg-stone-50 border border-stone-200 p-4 mb-6 text-left rounded-sm">
                <p className="text-sm text-jung-secondary italic">
                  "I've taken MBTI tests 20 times and always got different results. This finally explained why."
                </p>
                <p className="text-xs text-jung-secondary mt-2">— Sarah K.</p>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  setShowExitPopup(false);
                  navigate('/assessment');
                }}
              >
                Try the Free Assessment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <button
                onClick={() => setShowExitPopup(false)}
                className="mt-4 text-sm text-jung-secondary hover:text-jung-dark transition-colors"
              >
                No thanks, I'll pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
