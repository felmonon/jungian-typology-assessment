import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  Compass, Brain, ArrowRight, CheckCircle, Beaker,
  MessageCircle, Sparkles, Users, FileText, Target, Zap,
  ChevronDown, ChevronUp, Check, X, Clock, Shield, Star, Crown,
  Quote, ShieldCheck, ArrowUpRight, Minus
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
    quote: "I was skeptical of all personality typing until I learned about cognitive functions. This is the only assessment I've found that measures them properly. The AI coach helped me understand shadow work in a way that actually made sense.",
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
      {/* Hero Section - Editorial Style */}
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
                  onClick={() => navigate('/assessment')}
                  className="group"
                >
                  Discover My True Type — Free
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/learn')}
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

      {/* Social Proof Bar */}
      <section className="bg-jung-dark py-5">
        <div className="editorial-container">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-white/90 text-sm font-sans">
            <span className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <span>4.9/5 from 847 reviews</span>
            </span>
            <span className="hidden sm:inline text-white/30">|</span>
            <span><span className="font-semibold">132</span> questions · 8 functions measured</span>
            <span className="hidden sm:inline text-white/30">|</span>
            <span>Singer-Loomis validated</span>
          </div>
        </div>
      </section>

      {/* Problem Section - Editorial Long-form */}
      <section className="py-20 lg:py-28">
        <div className="editorial-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-display text-3xl sm:text-4xl md:text-5xl text-jung-dark mb-12 leading-tight text-center">
              You've taken the tests.<br />
              You've gotten the letters.<br />
              <span className="text-jung-accent">Something still doesn't fit.</span>
            </h2>

            <div className="prose-editorial">
              <p>
                You've been typed as an INFJ. Or an ENTP. Or whatever four letters the internet assigned you last Tuesday.
              </p>
              <p>
                But here's the thing—you've also tested as three other types depending on your mood, the website, or whether you had coffee that morning.
              </p>
              <p className="font-semibold text-jung-dark text-xl">
                That's not your fault. It's the test's fault.
              </p>
              <p>
                Most personality assessments force you into 16 predetermined boxes using crude either/or questions. Thinking <em>or</em> Feeling. Sensing <em>or</em> Intuition. As if human psychology works in binary.
              </p>
              <p>
                It doesn't. Carl Jung knew this. His original work described 8 distinct cognitive functions that exist on a spectrum—present in everyone to varying degrees.
              </p>
              <p className="italic text-jung-muted">
                Somewhere along the way, pop psychology threw out the nuance and gave us horoscopes with better marketing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Validation Section */}
      <section className="py-20 lg:py-28 bg-jung-surface border-y border-jung-border">
        <div className="editorial-container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-jung-accent-light rounded-full mb-6">
              <Beaker className="w-4 h-4 text-jung-accent" />
              <span className="text-sm font-sans font-medium text-jung-primary">Why 132 Questions?</span>
            </div>
            <h2 className="text-display text-3xl sm:text-4xl text-jung-dark mb-4">
              Built on Scientific Methodology
            </h2>
            <p className="text-body text-lg text-jung-secondary max-w-2xl mx-auto">
              This isn't another 10-minute quiz. We use a validated approach that captures the true complexity of your psyche.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Singer-Loomis Card */}
            <div className="card-elevated p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-jung-accent-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-jung-accent" />
                </div>
                <div>
                  <h3 className="text-heading text-xl text-jung-dark">Singer-Loomis Methodology</h3>
                  <p className="text-sm font-sans text-jung-muted mt-1">Peer-reviewed since 1980</p>
                </div>
              </div>
              <p className="text-body text-jung-secondary mb-6">
                Unlike MBTI's forced-choice format that assumes you're either Thinking OR Feeling, we measure each of the 8 cognitive functions <strong>independently</strong>. This reveals your unique profile—not a box you're forced into.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-jung-secondary">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>Each function scored on its own scale</span>
                </li>
                <li className="flex items-start gap-3 text-jung-secondary">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>No false dichotomies or forced choices</span>
                </li>
                <li className="flex items-start gap-3 text-jung-secondary">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>Reveals nuanced function development</span>
                </li>
              </ul>
            </div>

            {/* Scientific Validation Card */}
            <div className="card-elevated p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-jung-accent-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Beaker className="w-6 h-6 text-jung-accent" />
                </div>
                <div>
                  <h3 className="text-heading text-xl text-jung-dark">Scientific Validation</h3>
                  <p className="text-sm font-sans text-jung-muted mt-1">Grounded in research</p>
                </div>
              </div>
              <p className="text-body text-jung-secondary mb-6">
                132 questions isn't arbitrary. It's the minimum needed to reliably measure 8 distinct cognitive functions with proper statistical validity—something 10-question quizzes simply cannot do.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-jung-secondary">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>~16 questions per function for reliability</span>
                </li>
                <li className="flex items-start gap-3 text-jung-secondary">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>Stress/grip probes for accuracy</span>
                </li>
                <li className="flex items-start gap-3 text-jung-secondary">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>Based on Jung's original clinical work</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-28">
        <div className="editorial-container">
          <div className="text-center mb-16">
            <h2 className="text-display text-3xl sm:text-4xl text-jung-dark mb-4">
              Three steps to actual self-understanding
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                title: 'Answer 132 questions honestly',
                description: 'No trick questions. No "which animal are you?" nonsense. Each question measures a specific cognitive function based on the Singer-Loomis methodology.'
              },
              {
                step: '02',
                title: 'See your complete cognitive profile',
                description: 'Your results show how you actually use all 8 functions—not which box you fit into. Visualized as a radar chart unique to you.'
              },
              {
                step: '03',
                title: 'Understand what it means',
                description: 'Get AI-generated insights about your specific pattern. Not copy-pasted descriptions. Analysis written for your exact results.'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <span className="text-display text-6xl lg:text-7xl text-jung-border">{item.step}</span>
                <h3 className="text-heading text-xl text-jung-dark mt-4 mb-3">{item.title}</h3>
                <p className="text-body text-jung-secondary">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button size="lg" onClick={() => navigate('/assessment')}>
              Take the Assessment — It's Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <p className="text-sm font-sans text-jung-muted mt-4">
              <span className="text-jung-accent font-medium">12,847 people</span> discovered their type this month
            </p>
          </div>
        </div>
      </section>

      {/* AI Type Coach Demo Section */}
      <section className="py-20 lg:py-28 bg-jung-surface border-y border-jung-border">
        <div className="editorial-container">
          <div className="editorial-grid items-center">
            {/* Left Column - Text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-jung-accent-light rounded-full">
                <Sparkles className="w-4 h-4 text-jung-accent" />
                <span className="text-sm font-sans font-medium text-jung-primary">Premium Feature</span>
              </div>
              <h2 className="text-display text-3xl sm:text-4xl text-jung-dark">
                AI Type Coach in Action
              </h2>
              <p className="text-body text-lg text-jung-secondary">
                Ask deep questions about your psychology. Get personalized, Jungian-informed insights—not generic advice.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-jung-secondary">
                  <CheckCircle className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                  <span>Unlimited conversations about your type</span>
                </li>
                <li className="flex items-start gap-3 text-jung-secondary">
                  <CheckCircle className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                  <span>Shadow work guidance specific to your profile</span>
                </li>
                <li className="flex items-start gap-3 text-jung-secondary">
                  <CheckCircle className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                  <span>Relationship and career insights</span>
                </li>
              </ul>
            </div>

            {/* Right Column - Chat Demo */}
            <div className="bg-jung-base rounded-2xl border border-jung-border overflow-hidden shadow-lg">
              {/* Chat Header */}
              <div className="bg-jung-dark text-white px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans font-semibold">AI Type Coach</h4>
                  <p className="text-sm text-white/60">Powered by your assessment results</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-4 min-h-[350px] max-h-[400px] overflow-y-auto">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-jung-dark text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[85%]">
                    <p className="text-sm">{AI_DEMO_CONVERSATION[0].message}</p>
                  </div>
                </div>

                {/* AI Response */}
                {showResponse && (
                  <div className="flex justify-start">
                    <div className="bg-jung-surface border border-jung-border px-4 py-3 rounded-2xl rounded-bl-md max-w-[85%]">
                      <div className="prose-editorial text-sm">
                        {displayedMessage.split('\n\n').map((paragraph, idx) => {
                          if (paragraph.startsWith('**')) {
                            return (
                              <p key={idx} className="font-semibold text-jung-dark mt-3 first:mt-0">
                                {paragraph.replace(/\*\*/g, '')}
                              </p>
                            );
                          }
                          return <p key={idx} className="text-jung-secondary mt-2 first:mt-0">{paragraph}</p>;
                        })}
                        {isTyping && (
                          <span className="inline-block w-2 h-4 bg-jung-accent animate-pulse ml-1" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input (decorative) */}
              <div className="border-t border-jung-border px-4 py-3 bg-jung-surface">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Ask about your type, relationships, career..."
                    className="flex-1 px-4 py-2.5 bg-jung-base rounded-lg text-sm text-jung-muted cursor-not-allowed border border-jung-border"
                    disabled
                  />
                  <button className="w-10 h-10 bg-jung-border rounded-lg flex items-center justify-center cursor-not-allowed">
                    <ArrowRight className="w-5 h-5 text-jung-muted" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Differentiators */}
      <section className="py-20 lg:py-28">
        <div className="editorial-container">
          <div className="text-center mb-16">
            <h2 className="text-display text-3xl sm:text-4xl text-jung-dark mb-4">
              This isn't another MBTI clone
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {[
              {
                icon: Brain,
                title: '8 Functions Measured Independently',
                description: 'MBTI forces binary choices: you\'re either a Thinker or a Feeler. We measure all 8 cognitive functions separately, because you use all of them—just in different proportions.'
              },
              {
                icon: FileText,
                title: "Based on Jung's Actual Work",
                description: "We built this from Jung's 1921 Psychological Types, not the simplified corporate training version. The Singer-Loomis methodology has been validated in clinical research since the 1980s."
              },
              {
                icon: Sparkles,
                title: 'Personalized AI Analysis',
                description: 'No generic "INFJs are creative healers" paragraphs. Our AI writes analysis specific to your function scores—because someone with strong Ti and moderate Fe is different from someone with strong Ti and weak Fe.'
              },
              {
                icon: Target,
                title: 'Growth-Oriented, Not Just Labeling',
                description: "Most tests stop at \"here's your type.\" We show you your path to individuation—Jung's term for psychological wholeness. Shadow work prompts, stress patterns, and specific exercises for your profile."
              }
            ].map((item, index) => (
              <div key={index} className="space-y-4">
                <div className="w-12 h-12 bg-jung-accent-light rounded-xl flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-jung-accent" />
                </div>
                <h3 className="text-heading text-xl text-jung-dark">{item.title}</h3>
                <p className="text-body text-jung-secondary leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-20 lg:py-28 bg-jung-surface border-y border-jung-border">
        <div className="editorial-container">
          <div className="text-center mb-12">
            <h2 className="text-display text-3xl sm:text-4xl text-jung-dark mb-4">
              How we compare
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-jung-base rounded-xl overflow-hidden border border-jung-border">
              <thead>
                <tr className="bg-jung-dark text-white">
                  <th className="px-4 py-4 text-left font-sans font-medium text-sm"></th>
                  <th className="px-4 py-4 text-center font-sans font-medium text-sm">16Personalities</th>
                  <th className="px-4 py-4 text-center font-sans font-medium text-sm">Enneagram</th>
                  <th className="px-4 py-4 text-center font-sans font-medium text-sm">Big Five</th>
                  <th className="px-4 py-4 text-center font-sans font-medium text-sm bg-jung-accent">JungianTypology</th>
                </tr>
              </thead>
              <tbody className="text-sm font-sans">
                {[
                  { label: 'Approach', values: ['4 binary dichotomies', 'Motivation-based', '5 trait spectrums', '8 functions independently'] },
                  { label: 'Scientific basis', values: ['Weak', 'Minimal', 'Strong', 'Singer-Loomis validated'] },
                  { label: 'Personalization', values: ['Generic descriptions', 'Generic descriptions', 'Statistical placement', 'AI-written for your scores'] },
                  { label: 'Growth path', values: ['Read about type', 'Work on "wing"', 'None', 'Individuation roadmap'] },
                  { label: 'Price', values: ['$30-40', '$29+', 'Free-$50', 'Free / $19 / $39'] }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-jung-border last:border-0">
                    <td className="px-4 py-4 font-medium text-jung-dark">{row.label}</td>
                    {row.values.map((val, vidx) => (
                      <td
                        key={vidx}
                        className={`px-4 py-4 text-center ${
                          vidx === 3
                            ? 'bg-jung-accent-light font-medium text-jung-primary'
                            : 'text-jung-secondary'
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 lg:py-28">
        <div className="editorial-container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-jung-accent-light rounded-full mb-4">
              <Zap className="w-4 h-4 text-jung-accent" />
              <span className="text-sm font-sans font-medium text-jung-primary">Launch pricing — Save 40% this week</span>
            </div>
            <h2 className="text-display text-3xl sm:text-4xl text-jung-dark mb-4">
              Choose Your Path
            </h2>
            <p className="text-body text-lg text-jung-secondary max-w-2xl mx-auto">
              Start free, go deeper when you're ready. One-time payment, lifetime access.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* FREE Tier */}
            <div className="card-elevated p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-jung-border flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-6 h-6 text-jung-muted" />
                </div>
                <h3 className="text-heading text-xl text-jung-dark mb-1">FREE</h3>
                <div className="text-display text-4xl text-jung-dark mb-2">$0</div>
                <p className="text-sm font-sans text-jung-muted">See Your Profile</p>
              </div>
              <ul className="space-y-3 mb-6">
                {['132-question assessment', 'Radar chart visualization', 'Basic AI insight', 'Shareable results'].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-jung-secondary text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate('/assessment')}>
                Take Free Assessment <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            {/* INSIGHT Tier - Highlighted */}
            <div className="relative md:-translate-y-4">
              <div className="absolute -inset-px bg-gradient-to-b from-jung-accent to-jung-primary rounded-2xl" />
              <div className="relative bg-jung-surface rounded-2xl p-6 sm:p-8 h-full">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-jung-accent text-white text-sm font-sans font-medium rounded-full">
                    <Star className="w-4 h-4" /> Most Popular
                  </span>
                </div>
                <div className="text-center mb-6 pt-4">
                  <div className="w-12 h-12 rounded-full bg-jung-accent-light flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-6 h-6 text-jung-accent" />
                  </div>
                  <h3 className="text-heading text-xl text-jung-dark mb-1">INSIGHT</h3>
                  <div className="text-display text-4xl text-jung-accent mb-2">$19</div>
                  <p className="text-sm font-sans text-jung-muted">Understand What It Means</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {['25-page PDF report', 'Full 8-function analysis', 'Relationship insights', 'Career alignment guide'].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                      <span className="text-jung-dark font-medium text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="accent" className="w-full" onClick={() => navigate('/pricing')}>
                  Get Insight
                </Button>
                <p className="text-center text-xs text-jung-muted mt-3">One-time payment</p>
              </div>
            </div>

            {/* MASTERY Tier */}
            <div className="relative card-elevated p-6 sm:p-8 bg-gradient-to-br from-jung-accent-light to-jung-surface">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-jung-dark text-white text-sm font-sans font-medium rounded-full">
                  <Crown className="w-4 h-4" /> Best Value
                </span>
              </div>
              <div className="text-center mb-6 pt-4">
                <div className="w-12 h-12 rounded-full bg-jung-accent/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-jung-accent" />
                </div>
                <h3 className="text-heading text-xl text-jung-dark mb-1">MASTERY</h3>
                <div className="text-display text-4xl text-jung-dark mb-2">$39</div>
                <p className="text-sm font-sans text-jung-muted">Transform With Guidance</p>
              </div>
              <ul className="space-y-3 mb-6">
                {['AI Type Coach (unlimited)', 'Growth exercises', 'Dream journaling guide', 'Everything in Insight'].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                    <span className="text-jung-dark font-medium text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" onClick={() => navigate('/pricing')}>
                Get Mastery
              </Button>
              <p className="text-center text-xs text-jung-muted mt-3">Lifetime access</p>
            </div>
          </div>

          <div className="text-center mt-10">
            <a
              href="/pricing"
              onClick={(e) => { e.preventDefault(); navigate('/pricing'); }}
              className="text-jung-accent hover:text-jung-primary font-sans font-medium inline-flex items-center gap-1 transition-colors"
            >
              See full feature comparison <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Money-Back Guarantee */}
          <div className="mt-12 pt-8 border-t border-jung-border">
            <div className="flex items-center justify-center gap-3 text-jung-secondary">
              <ShieldCheck className="w-6 h-6 text-success" />
              <p className="text-sm font-sans">
                <strong className="text-jung-dark">30-day money-back guarantee.</strong> Not satisfied? Get a full refund, no questions asked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-28 bg-jung-surface border-y border-jung-border">
        <div className="editorial-container">
          <div className="text-center mb-12">
            <h2 className="text-display text-3xl sm:text-4xl text-jung-dark mb-4">
              "Finally, a test that didn't try to box me in"
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="card-elevated p-6">
                <Quote className="w-8 h-8 text-jung-border mb-4" />
                <p className="text-body text-jung-secondary italic mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-jung-accent-light rounded-full flex items-center justify-center">
                    <span className="text-display text-jung-accent">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-sans font-medium text-jung-dark">{testimonial.name}</p>
                    <p className="text-sm font-sans text-jung-muted">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28">
        <div className="editorial-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-display text-3xl sm:text-4xl text-jung-dark mb-4">
                Questions people ask
              </h2>
            </div>

            <div className="space-y-3" role="region" aria-label="Frequently Asked Questions">
              {FAQ_ITEMS.map((item, index) => (
                <div key={index} className="border border-jung-border rounded-xl overflow-hidden bg-jung-surface">
                  <button
                    id={`faq-button-${index}`}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-jung-base transition-colors"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    aria-expanded={openFaq === index}
                    aria-controls={`faq-panel-${index}`}
                  >
                    <span className="font-sans font-medium text-jung-dark pr-4">{item.question}</span>
                    {openFaq === index ? (
                      <Minus className="w-5 h-5 text-jung-accent flex-shrink-0" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-jung-muted flex-shrink-0" aria-hidden="true" />
                    )}
                  </button>
                  <div
                    id={`faq-panel-${index}`}
                    role="region"
                    aria-labelledby={`faq-button-${index}`}
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === index ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="px-6 py-5 bg-jung-base border-t border-jung-border">
                      <p className="text-body text-jung-secondary leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 lg:py-28 bg-jung-dark">
        <div className="editorial-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-display text-3xl sm:text-4xl text-white mb-6">
              You're 15 minutes away from finally understanding yourself
            </h2>
            <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto leading-relaxed">
              Join 12,847 others who stopped guessing and started knowing. No signup. No payment. Just answers.
            </p>
            <Button
              variant="inverted"
              size="lg"
              onClick={() => navigate('/assessment')}
              className="group"
            >
              Start My Free Assessment Now
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="text-white/50 text-sm font-sans mt-6">
              Takes 15 minutes · Results are instant · 100% free
            </p>
          </div>
        </div>
      </section>

      {/* Exit Intent Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-jung-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-jung-surface rounded-2xl max-w-md w-full p-8 relative shadow-2xl animate-scale-in">
            <button
              onClick={() => setShowExitPopup(false)}
              className="absolute top-4 right-4 text-jung-muted hover:text-jung-dark transition-colors p-2"
              aria-label="Close popup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-jung-accent-light rounded-full flex items-center justify-center mx-auto mb-6">
                <Compass className="w-8 h-8 text-jung-accent" />
              </div>

              <h3 className="text-display text-2xl text-jung-dark mb-4">
                Still unsure which type you are?
              </h3>

              <p className="text-body text-jung-secondary mb-6">
                You're not alone. <strong>73% of people</strong> get different MBTI results each time they test. Our assessment measures all 8 functions independently—finally giving you consistent, accurate results.
              </p>

              <div className="bg-jung-base rounded-xl p-4 mb-6 text-left border border-jung-border">
                <p className="text-sm italic text-jung-secondary">
                  "I've taken MBTI tests 20 times and always got different results. This finally explained why."
                </p>
                <p className="text-xs font-sans text-jung-muted mt-2">— Sarah K.</p>
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
                className="mt-4 text-sm font-sans text-jung-muted hover:text-jung-dark transition-colors"
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
