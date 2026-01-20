import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  Compass, Brain, ArrowRight, Activity, CheckCircle, Beaker,
  MessageCircle, Sparkles, Users, FileText, Target, Zap,
  ChevronDown, ChevronUp, Check, X, Clock, Shield, Star, Crown,
  Quote, ShieldCheck
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
    quote: "I've taken MBTI tests probably 20 times over the years. Sometimes I'm INFP, sometimes INFJ, once I got ENFP. This assessment showed me why—my Fi and Ni scores are almost identical. The nuance matters, and JungianTypology actually captures it.",
    name: "Sarah K.",
    role: "Designer"
  },
  {
    quote: "I was skeptical of all personality typing until I learned about cognitive functions. This is the only assessment I've found that measures them properly. The AI coach helped me understand shadow work in a way that actually made sense for my specific profile.",
    name: "Marcus T.",
    role: "Software Engineer"
  },
  {
    quote: "I recommend this to my coaching clients who want a deeper self-understanding baseline. It's more rigorous than most tools I've seen, and the price point makes it accessible.",
    name: "Dr. Jennifer L.",
    role: "Executive Coach"
  }
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
      {/* Sticky CTA Header */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm transition-all duration-300 ${
          showStickyHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Compass className="w-6 h-6 text-jung-primary" />
            <span className="font-serif font-medium text-jung-dark hidden sm:inline">JungianTypology</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-600 hidden md:inline">
              Free · 15 min · No signup
            </span>
            <Button size="sm" onClick={() => navigate('/assessment')}>
              Start Free Assessment <ArrowRight className="ml-1 w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="w-full bg-stone-100 py-12 sm:py-16 md:py-20 px-4 text-center border-b border-stone-200">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Social Proof Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-jung-primary/10 rounded-full text-jung-primary text-sm font-medium">
            <Users className="w-4 h-4" />
            <span>Based on <strong>Singer-Loomis</strong> validated methodology since 1980</span>
          </div>

          <div className="inline-block p-3 rounded-full bg-jung-primary/5 mb-2 sm:mb-4">
             <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-jung-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-jung-dark font-medium leading-tight">
            Who are you, <span className="italic text-jung-accent">really</span>?
          </h1>
          <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed px-2">
            In just 15 minutes, see why you've gotten different results on every personality test. We measure all 8 cognitive functions independently—revealing your true psychological profile, not a 4-letter box.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/assessment')}>
              See My Cognitive Profile — Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/learn')}>
              Learn the Theory
            </Button>
          </div>
          <p className="text-stone-500 text-sm flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> ~15 minutes</span>
            <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> No signup required</span>
            <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> Instant results</span>
          </p>

          {/* Results Preview */}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6 max-w-md mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-jung-primary" />
                <span className="text-sm font-medium text-jung-dark">Your Cognitive Profile Preview</span>
              </div>
              {/* Mini Radar Chart Mockup */}
              <div className="relative w-48 h-48 mx-auto mb-4">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Background grid */}
                  <polygon points="100,20 180,100 100,180 20,100" fill="none" stroke="#e7e5e4" strokeWidth="1" />
                  <polygon points="100,40 160,100 100,160 40,100" fill="none" stroke="#e7e5e4" strokeWidth="1" />
                  <polygon points="100,60 140,100 100,140 60,100" fill="none" stroke="#e7e5e4" strokeWidth="1" />
                  {/* Sample profile shape */}
                  <polygon
                    points="100,35 165,85 145,155 55,145 45,75"
                    fill="rgba(180, 83, 9, 0.15)"
                    stroke="#b45309"
                    strokeWidth="2"
                  />
                  {/* Function labels */}
                  <text x="100" y="12" textAnchor="middle" className="text-xs fill-stone-500">Ni</text>
                  <text x="188" y="104" textAnchor="start" className="text-xs fill-stone-500">Te</text>
                  <text x="100" y="198" textAnchor="middle" className="text-xs fill-stone-500">Se</text>
                  <text x="12" y="104" textAnchor="end" className="text-xs fill-stone-500">Fi</text>
                </svg>
              </div>
              <p className="text-xs text-stone-500 text-center">See your unique function stack visualized</p>
            </div>
          </div>

          {/* Testimonial Preview */}
          <div className="mt-6">
            <div className="inline-flex items-start gap-3 bg-white px-6 py-4 rounded-xl shadow-sm border border-stone-200 max-w-xl text-left">
              <Quote className="w-6 h-6 text-jung-accent flex-shrink-0 mt-1" />
              <div>
                <p className="text-stone-600 italic text-sm leading-relaxed">
                  "Finally, a test that didn't try to box me in. The nuance matters, and JungianTypology actually captures it."
                </p>
                <p className="text-xs text-stone-500 mt-2 font-medium">— Sarah K., Designer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Validation Section - FIRST after Hero */}
      <section className="w-full bg-gradient-to-b from-jung-primary/5 to-white py-12 sm:py-16 px-4 border-b border-stone-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-jung-primary/10 rounded-full text-jung-primary text-sm font-medium mb-4">
              <Beaker className="w-4 h-4" />
              Why 132 Questions?
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-jung-dark mb-4">
              Built on Scientific Methodology
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              This isn't another 10-minute quiz. We use a validated approach that captures the true complexity of your psyche.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Singer-Loomis Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-jung-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-jung-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-jung-dark">Singer-Loomis Methodology</h3>
                  <p className="text-sm text-stone-500 mt-1">Peer-reviewed since 1980</p>
                </div>
              </div>
              <p className="text-stone-600 leading-relaxed mb-4">
                Unlike MBTI's forced-choice format that assumes you're either Thinking OR Feeling, we measure each of the 8 cognitive functions <strong>independently</strong>. This reveals your unique profile—not a box you're forced into.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-stone-600">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Each function scored on its own scale</span>
                </li>
                <li className="flex items-start gap-2 text-stone-600">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>No false dichotomies or forced choices</span>
                </li>
                <li className="flex items-start gap-2 text-stone-600">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Reveals nuanced function development</span>
                </li>
              </ul>
            </div>

            {/* Scientific Validation Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-jung-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Beaker className="w-6 h-6 text-jung-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-jung-dark">Scientific Validation</h3>
                  <p className="text-sm text-stone-500 mt-1">Grounded in research</p>
                </div>
              </div>
              <p className="text-stone-600 leading-relaxed mb-4">
                132 questions isn't arbitrary. It's the minimum needed to reliably measure 8 distinct cognitive functions with proper statistical validity—something 10-question quizzes simply cannot do.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-stone-600">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>~16 questions per function for reliability</span>
                </li>
                <li className="flex items-start gap-2 text-stone-600">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Stress/grip probes for accuracy</span>
                </li>
                <li className="flex items-start gap-2 text-stone-600">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Based on Jung's original clinical work</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="w-full bg-jung-primary py-4 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-white text-sm sm:text-base">
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <strong>132</strong> questions measuring all 8 functions
          </span>
          <span className="hidden sm:inline text-white/40">|</span>
          <span>Singer-Loomis validated methodology</span>
          <span className="hidden sm:inline text-white/40">|</span>
          <span>Rooted in Jung's 1921 original framework</span>
        </div>
      </section>

      {/* Problem Section */}
      <section className="w-full bg-white py-12 sm:py-16 md:py-20 px-4 border-b border-stone-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-jung-dark mb-8 text-center leading-tight">
            You've taken the tests. You've gotten the letters.<br />
            <span className="text-jung-accent">Something still doesn't fit.</span>
          </h2>
          
          <div className="prose prose-lg prose-stone max-w-none space-y-6 text-stone-600">
            <p>
              You've been typed as an INFJ. Or an ENTP. Or whatever four letters the internet assigned you last Tuesday.
            </p>
            <p>
              But here's the thing—you've also tested as three other types depending on your mood, the website, or whether you had coffee that morning.
            </p>
            <p className="font-semibold text-jung-dark">
              That's not your fault. It's the test's fault.
            </p>
            <p>
              Most personality assessments force you into 16 predetermined boxes using crude either/or questions. Thinking <em>or</em> Feeling. Sensing <em>or</em> Intuition. As if human psychology works in binary.
            </p>
            <p>
              It doesn't. Carl Jung knew this. His original work described 8 distinct cognitive functions that exist on a spectrum—present in everyone to varying degrees.
            </p>
            <p className="text-jung-secondary italic">
              Somewhere along the way, pop psychology threw out the nuance and gave us horoscopes with better marketing.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full bg-white py-12 sm:py-16 md:py-20 px-4 border-b border-stone-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-jung-dark mb-4">
              Three steps to actual self-understanding
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-jung-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-serif font-bold text-jung-primary">1</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-jung-dark mb-3">Answer 132 questions honestly</h3>
              <p className="text-stone-600">
                No trick questions. No "which animal are you?" nonsense. Each question measures a specific cognitive function based on the Singer-Loomis methodology.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-jung-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-serif font-bold text-jung-primary">2</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-jung-dark mb-3">See your complete cognitive profile</h3>
              <p className="text-stone-600">
                Your results show how you actually use all 8 functions—not which box you fit into. Visualized as a radar chart unique to you.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-jung-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-serif font-bold text-jung-primary">3</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-jung-dark mb-3">Understand what it means</h3>
              <p className="text-stone-600">
                Get AI-generated insights about your specific pattern. Not copy-pasted descriptions. Analysis written for your exact results.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Button size="lg" onClick={() => navigate('/assessment')}>
              Start My Free Assessment <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <p className="text-stone-500 text-sm mt-3">Most people finish in 12-15 minutes</p>
          </div>
        </div>
      </section>

      {/* AI Type Coach Demo Section */}
      <section className="w-full bg-stone-50 py-12 sm:py-16 md:py-20 px-4 border-b border-stone-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-jung-accent/10 rounded-full text-jung-accent text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Premium Feature
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-jung-dark mb-4">
              AI Type Coach in Action
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Ask deep questions about your psychology. Get personalized, Jungian-informed insights—not generic advice.
            </p>
          </div>

          {/* Chat Demo */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-lg">
              {/* Chat Header */}
              <div className="bg-jung-primary text-white px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold">AI Type Coach</h4>
                  <p className="text-sm text-white/80">Powered by your assessment results</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-4 sm:p-6 space-y-4 min-h-[400px]">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-jung-primary text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[85%]">
                    <p>{AI_DEMO_CONVERSATION[0].message}</p>
                  </div>
                </div>

                {/* AI Response */}
                {showResponse && (
                  <div className="flex justify-start">
                    <div className="bg-stone-100 border border-stone-200 px-4 py-3 rounded-2xl rounded-bl-md max-w-[85%]">
                      <div className="prose prose-sm prose-stone max-w-none">
                        {displayedMessage.split('\n\n').map((paragraph, idx) => {
                          if (paragraph.startsWith('**')) {
                            return (
                              <p key={idx} className="font-semibold text-jung-dark mt-3 first:mt-0">
                                {paragraph.replace(/\*\*/g, '')}
                              </p>
                            );
                          }
                          return <p key={idx} className="text-stone-700 mt-2 first:mt-0">{paragraph}</p>;
                        })}
                        {isTyping && (
                          <span className="inline-block w-2 h-4 bg-jung-primary animate-pulse ml-1" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input (decorative) */}
              <div className="border-t border-stone-200 px-4 py-3 bg-white">
                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    placeholder="Ask about your type, relationships, career..." 
                    className="flex-1 px-4 py-2 bg-stone-100 rounded-full text-sm text-stone-600 cursor-not-allowed"
                    disabled
                  />
                  <button className="w-10 h-10 bg-jung-primary/20 rounded-full flex items-center justify-center cursor-not-allowed">
                    <ArrowRight className="w-5 h-5 text-jung-primary/50" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center text-stone-500 text-sm mt-4">
              Unlock the AI Type Coach with your premium assessment results
            </p>
          </div>
        </div>
      </section>

      {/* Key Differentiators */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-white w-full border-b border-stone-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-jung-dark mb-4">
              This isn't another MBTI clone
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-jung-accent">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-jung-dark">8 Functions Measured Independently</h3>
              <p className="text-stone-600 leading-relaxed">
                MBTI forces binary choices: you're either a Thinker or a Feeler. We measure all 8 cognitive functions separately, because you use all of them—just in different proportions.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-jung-accent">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-jung-dark">Based on Jung's Actual Work</h3>
              <p className="text-stone-600 leading-relaxed">
                We built this from Jung's 1921 Psychological Types, not the simplified corporate training version. The Singer-Loomis methodology has been validated in clinical research since the 1980s.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-jung-accent">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-jung-dark">Personalized AI Analysis</h3>
              <p className="text-stone-600 leading-relaxed">
                No generic "INFJs are creative healers" paragraphs. Our AI writes analysis specific to your function scores—because someone with strong Ti and moderate Fe is different from someone with strong Ti and weak Fe, even if MBTI calls them both "INTP."
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-jung-accent">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-jung-dark">Growth-Oriented, Not Just Labeling</h3>
              <p className="text-stone-600 leading-relaxed">
                Most tests stop at "here's your type." We show you your path to individuation—Jung's term for psychological wholeness. Shadow work prompts, stress patterns, and specific exercises for your profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-stone-50 w-full border-b border-stone-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-jung-dark mb-4">
              How we compare
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-stone-200">
              <thead>
                <tr className="bg-jung-primary text-white">
                  <th className="px-4 py-4 text-left font-medium"></th>
                  <th className="px-4 py-4 text-center font-medium text-sm">16Personalities</th>
                  <th className="px-4 py-4 text-center font-medium text-sm">Enneagram</th>
                  <th className="px-4 py-4 text-center font-medium text-sm">Big Five</th>
                  <th className="px-4 py-4 text-center font-medium text-sm bg-jung-accent">JungianTypology</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-stone-100">
                  <td className="px-4 py-4 font-medium text-jung-dark">Approach</td>
                  <td className="px-4 py-4 text-center text-stone-600">4 binary dichotomies</td>
                  <td className="px-4 py-4 text-center text-stone-600">Motivation-based</td>
                  <td className="px-4 py-4 text-center text-stone-600">5 trait spectrums</td>
                  <td className="px-4 py-4 text-center font-medium text-jung-primary bg-jung-primary/5">8 functions independently</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="px-4 py-4 font-medium text-jung-dark">Scientific basis</td>
                  <td className="px-4 py-4 text-center text-stone-600">Weak</td>
                  <td className="px-4 py-4 text-center text-stone-600">Minimal</td>
                  <td className="px-4 py-4 text-center text-stone-600">Strong</td>
                  <td className="px-4 py-4 text-center font-medium text-jung-primary bg-jung-primary/5">Singer-Loomis validated</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="px-4 py-4 font-medium text-jung-dark">Personalization</td>
                  <td className="px-4 py-4 text-center text-stone-600">Generic descriptions</td>
                  <td className="px-4 py-4 text-center text-stone-600">Generic descriptions</td>
                  <td className="px-4 py-4 text-center text-stone-600">Statistical placement</td>
                  <td className="px-4 py-4 text-center font-medium text-jung-primary bg-jung-primary/5">AI-written for your scores</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="px-4 py-4 font-medium text-jung-dark">Growth path</td>
                  <td className="px-4 py-4 text-center text-stone-600">Read about type</td>
                  <td className="px-4 py-4 text-center text-stone-600">Work on "wing"</td>
                  <td className="px-4 py-4 text-center text-stone-600">None</td>
                  <td className="px-4 py-4 text-center font-medium text-jung-primary bg-jung-primary/5">Individuation roadmap</td>
                </tr>
                <tr>
                  <td className="px-4 py-4 font-medium text-jung-dark">Price</td>
                  <td className="px-4 py-4 text-center text-stone-600">$30-40</td>
                  <td className="px-4 py-4 text-center text-stone-600">$29+</td>
                  <td className="px-4 py-4 text-center text-stone-600">Free-$50</td>
                  <td className="px-4 py-4 text-center font-bold text-jung-accent bg-jung-primary/5">Free / $19 / $39</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Choose Your Path - 3 Tier Pricing Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-white w-full border-b border-stone-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-jung-dark mb-4">
              Choose Your Path
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Start free, go deeper when you're ready. No subscriptions.
            </p>
            {/* Pricing Anchor */}
            <p className="text-sm text-stone-500 mt-3">
              Professional personality assessments cost $50-200. Get scientifically-validated results starting at $0.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* FREE Tier */}
            <div className="bg-stone-50 rounded-2xl p-6 sm:p-8 border border-stone-200">
              <div className="text-center mb-6">
                <h3 className="text-xl font-serif font-bold text-jung-dark mb-1">FREE</h3>
                <div className="text-3xl font-bold text-jung-dark mb-2">$0</div>
                <p className="text-stone-600 text-sm">See Your Profile</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-stone-700">132-question assessment</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-stone-700">Radar chart visualization</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-stone-700">Basic AI insight</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-stone-700">Shareable results</span>
                </li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full py-3"
                onClick={() => navigate('/assessment')}
              >
                Take Free Assessment <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            {/* INSIGHT Tier - Highlighted */}
            <div className="relative bg-gradient-to-br from-jung-primary/5 to-jung-accent/5 rounded-2xl p-6 sm:p-8 border-2 border-jung-primary shadow-xl md:-translate-y-2 md:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 bg-jung-primary text-white">
                <Star className="w-4 h-4" />
                Most Popular
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-serif font-bold text-jung-dark mb-1">INSIGHT</h3>
                <div className="text-3xl font-bold text-jung-primary mb-2">$19</div>
                <p className="text-stone-600 text-sm">Understand What It Means</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-jung-primary flex-shrink-0 mt-0.5" />
                  <span className="text-stone-700">25-page PDF report</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-jung-primary flex-shrink-0 mt-0.5" />
                  <span className="text-stone-700">Full 8-function analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-jung-primary flex-shrink-0 mt-0.5" />
                  <span className="text-stone-700">Relationship insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-jung-primary flex-shrink-0 mt-0.5" />
                  <span className="text-stone-700">Career alignment guide</span>
                </li>
              </ul>
              <Button 
                className="w-full py-3 bg-jung-primary hover:bg-jung-primary/90"
                onClick={() => navigate('/pricing')}
              >
                Get Insight
              </Button>
              <p className="text-center text-xs text-stone-500 mt-3">One-time payment</p>
            </div>

            {/* MASTERY Tier */}
            <div className="relative bg-gradient-to-br from-jung-accent/5 to-amber-50 rounded-2xl p-6 sm:p-8 border-2 border-jung-accent shadow-lg">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 bg-jung-accent text-white">
                <Crown className="w-4 h-4" />
                Best Value
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-serif font-bold text-jung-dark mb-1">MASTERY</h3>
                <div className="text-3xl font-bold text-jung-accent mb-2">$39</div>
                <p className="text-stone-600 text-sm">Transform With Guidance</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                  <span className="text-stone-700">AI Type Coach (unlimited)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                  <span className="text-stone-700">Growth exercises</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                  <span className="text-stone-700">Dream journaling guide</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                  <span className="text-stone-700">Everything in Insight</span>
                </li>
              </ul>
              <Button 
                className="w-full py-3 bg-jung-accent hover:bg-jung-accent/90"
                onClick={() => navigate('/pricing')}
              >
                Get Mastery
              </Button>
              <p className="text-center text-xs text-stone-500 mt-3">Lifetime access</p>
            </div>
          </div>

          <div className="text-center mt-10">
            <a
              href="/pricing"
              onClick={(e) => { e.preventDefault(); navigate('/pricing'); }}
              className="text-jung-primary hover:text-jung-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
            >
              See full feature comparison <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Money-Back Guarantee */}
          <div className="mt-10 pt-8 border-t border-stone-200">
            <div className="flex items-center justify-center gap-3 text-stone-600">
              <ShieldCheck className="w-6 h-6 text-green-600" />
              <p className="text-sm">
                <strong className="text-jung-dark">30-day money-back guarantee.</strong> Not satisfied? Get a full refund, no questions asked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-jung-base w-full border-b border-stone-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-jung-dark mb-4">
              "Finally, a test that didn't try to box me in"
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
                <p className="text-stone-600 italic mb-4 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-jung-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-jung-primary font-serif font-bold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-jung-dark">{testimonial.name}</p>
                    <p className="text-sm text-stone-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-white w-full border-b border-stone-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-jung-dark mb-4">
              Questions people ask
            </h2>
          </div>

          <div className="space-y-4" role="region" aria-label="Frequently Asked Questions">
            {FAQ_ITEMS.map((item, index) => (
              <div key={index} className="border border-stone-200 rounded-xl overflow-hidden">
                <button
                  id={`faq-button-${index}`}
                  className="w-full px-6 py-4 flex items-center justify-between text-left bg-white hover:bg-stone-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-panel-${index}`}
                >
                  <span className="font-medium text-jung-dark pr-4">{item.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-stone-400 flex-shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-400 flex-shrink-0" aria-hidden="true" />
                  )}
                </button>
                {openFaq === index && (
                  <div 
                    id={`faq-panel-${index}`}
                    role="region"
                    aria-labelledby={`faq-button-${index}`}
                    className="px-6 py-4 bg-stone-50 border-t border-stone-200"
                  >
                    <p className="text-stone-600 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full bg-jung-primary py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Stop fitting yourself into boxes
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Take the assessment Jung would have built. See all 8 of your cognitive functions. Get insights that actually mean something.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/assessment')}
              className="bg-white hover:bg-stone-100"
              style={{ color: '#5D4E37' }}
            >
              Take the Free Assessment <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/learn')}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Learn About the Theory First
            </Button>
          </div>
          <p className="text-white/60 text-sm mt-6 flex items-center justify-center gap-4 flex-wrap">
            <span>15 minutes</span>
            <span>·</span>
            <span>No signup</span>
            <span>·</span>
            <span>Instant results</span>
          </p>
        </div>
      </section>

      {/* Exit Intent Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowExitPopup(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
              aria-label="Close popup"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-jung-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass className="w-8 h-8 text-jung-accent" />
              </div>

              <h3 className="text-2xl font-serif font-bold text-jung-dark mb-3">
                Wait! Before you go...
              </h3>

              <p className="text-stone-600 mb-6">
                Did you know most people get <strong>different results</strong> every time they take a personality test? Ours measures all 8 cognitive functions independently—so your results actually stay consistent.
              </p>

              <div className="bg-stone-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-stone-600 italic">
                  "I've taken MBTI tests 20 times and always got different results. This finally explained why."
                </p>
                <p className="text-xs text-stone-500 mt-2">— Sarah K.</p>
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
                className="mt-4 text-sm text-stone-500 hover:text-stone-700 transition-colors"
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
