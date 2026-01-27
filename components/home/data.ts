import { 
  Compass, Brain, Beaker, ArrowRight, CheckCircle, 
  MessageCircle, Sparkles, Users, FileText, Target, Zap,
  Star, Crown, Quote, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { AnalyticsEvents } from '../../lib/analytics';

export const AI_DEMO_CONVERSATION = [
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

export const FAQ_ITEMS = [
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

export const TESTIMONIALS = [
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

export const HOW_IT_WORKS_STEPS = [
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
];

export const DIFFERENTIATORS = [
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
];

export const COMPARISON_ROWS = [
  { label: 'Approach', values: ['4 binary dichotomies', 'Motivation-based', '5 trait spectrums', '8 functions independently'] },
  { label: 'Scientific basis', values: ['Weak', 'Minimal', 'Strong', 'Singer-Loomis validated'] },
  { label: 'Personalization', values: ['Generic descriptions', 'Generic descriptions', 'Statistical placement', 'AI-written for your scores'] },
  { label: 'Growth path', values: ['Read about type', 'Work on "wing"', 'None', 'Individuation roadmap'] },
  { label: 'Price', values: ['$30-40', '$29+', 'Free-$50', 'Free / $19 / $39'] }
];

export const PRICING_TIERS = [
  {
    name: 'FREE',
    price: '$0',
    icon: Compass,
    description: 'See Your Profile',
    features: ['132-question assessment', 'Radar chart visualization', 'Basic AI insight', 'Shareable results'],
    cta: 'Take Free Assessment',
    popular: false,
    variant: 'outline' as const,
  },
  {
    name: 'INSIGHT',
    price: '$19',
    icon: Brain,
    description: 'Understand What It Means',
    features: ['25-page PDF report', 'Full 8-function analysis', 'Relationship insights', 'Career alignment guide'],
    cta: 'Get Insight',
    popular: true,
    variant: 'accent' as const,
  },
  {
    name: 'MASTERY',
    price: '$39',
    icon: Sparkles,
    description: 'Transform With Guidance',
    features: ['AI Type Coach (unlimited)', 'Growth exercises', 'Dream journaling guide', 'Everything in Insight'],
    cta: 'Get Mastery',
    popular: false,
    variant: 'primary' as const,
  }
];

export { AnalyticsEvents };
