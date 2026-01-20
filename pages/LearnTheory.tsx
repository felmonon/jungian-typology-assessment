import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Brain, Compass, Layers, AlertTriangle, ChevronDown, ArrowRight, Sparkles, Zap, HelpCircle } from 'lucide-react';
import { FUNCTION_DESCRIPTIONS, STACK_POSITIONS, THE_GRIP } from '../data/questions';

interface AccordionItemProps {
  title: string;
  code?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, code, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {code && (
            <span className="font-mono font-bold text-lg text-jung-accent bg-jung-accent/10 px-2 py-1 rounded">
              {code}
            </span>
          )}
          <span className="font-serif text-lg md:text-xl font-semibold text-jung-dark">{title}</span>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-stone-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      {isOpen && (
        <div className="px-4 md:px-5 pb-5 pt-2 border-t border-stone-100">
          {children}
        </div>
      )}
    </div>
  );
};

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-jung-accent/10 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-jung-dark">{title}</h2>
      {subtitle && <p className="text-stone-600 mt-1">{subtitle}</p>}
    </div>
  </div>
);

export const LearnTheory: React.FC = () => {
  const functionOrder = ['Te', 'Ti', 'Fe', 'Fi', 'Se', 'Si', 'Ne', 'Ni'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 text-jung-accent mb-4">
          <span className="text-4xl font-serif">ψ</span>
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-jung-dark mb-4">
          Learn the Theory
        </h1>
        <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed px-2">
          A clear, in-depth guide to Carl Jung's psychological typology—the real foundation behind personality theory.
        </p>
      </header>

      <section className="mb-16">
        <SectionHeader 
          icon={<BookOpen className="w-6 h-6 text-jung-accent" />}
          title="Why Jung Created Typology"
          subtitle="The origins and philosophy"
        />
        
        <div className="prose prose-stone prose-lg max-w-none">
          <p>
            In 1921, Swiss psychiatrist <strong>Carl Gustav Jung</strong> published <em>Psychological Types</em>, 
            a groundbreaking book. It wasn't about putting people in boxes or labels. Jung wanted to understand 
            <strong> why we all see and judge the world differently</strong>—and how this "one-sidedness" shapes 
            our strengths, blind spots, and personal growth.
          </p>
          
          <blockquote className="border-l-4 border-jung-accent pl-6 italic my-6 text-jung-secondary">
            "The classification of individuals means nothing, nothing at all. It is only the instrument... 
            To understand them, you have to be on the spot."
            <footer className="text-sm font-bold mt-2 not-italic text-jung-primary">— Carl Jung</footer>
          </blockquote>

          <p>
            Jung noticed that everyone leans toward certain ways of thinking, feeling, perceiving, and deciding. 
            This creates natural biases—like wearing tinted glasses. Typology helps us see our "tint" so we can 
            grow beyond it through <strong>individuation</strong> (becoming a more whole, unique self).
          </p>

          <div className="bg-amber-50 rounded-lg p-6 my-8 not-prose">
            <h4 className="font-serif font-bold text-jung-dark mb-3 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-600" />
              Simple Analogy
            </h4>
            <p className="text-stone-700">
              Imagine driving a car. Some people love the accelerator (outward action), others prefer the brakes 
              (inner reflection). Some focus on the map (logic/values), others on the scenery (details/possibilities). 
              Your "driving style" is your type—but the goal is learning to drive well in all conditions.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <SectionHeader 
          icon={<Brain className="w-6 h-6 text-jung-accent" />}
          title="How This Assessment Differs from MBTI"
          subtitle="A more nuanced approach"
        />
        
        <div className="prose prose-stone prose-lg max-w-none mb-8">
          <p>
            The popular Myers-Briggs Type Indicator (MBTI) uses forced-choice questions 
            (e.g., "Logic OR feelings?") and outputs 16 fixed "types" (like INFP).
          </p>
          <p><strong>This assessment is different:</strong></p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <div className="w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5 text-jung-accent" />
            </div>
            <h4 className="font-semibold text-jung-dark mb-2">Singer-Loomis Method</h4>
            <p className="text-sm text-stone-600">Created by Jungian analysts for more accurate measurement</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <div className="w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-jung-accent" />
            </div>
            <h4 className="font-semibold text-jung-dark mb-2">8 Independent Scales</h4>
            <p className="text-sm text-stone-600">Measures each cognitive process independently—no forcing opposites</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <div className="w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center mb-3">
              <Compass className="w-5 h-5 text-jung-accent" />
            </div>
            <h4 className="font-semibold text-jung-dark mb-2">Nuanced Profile</h4>
            <p className="text-sm text-stone-600">You can be high in both logical organization AND group harmony</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <div className="w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center mb-3">
              <ArrowRight className="w-5 h-5 text-jung-accent" />
            </div>
            <h4 className="font-semibold text-jung-dark mb-2">Growth-Focused</h4>
            <p className="text-sm text-stone-600">Focuses on self-reflection and development, not labels</p>
          </div>
        </div>

        <div className="bg-stone-100 rounded-lg p-6">
          <p className="text-stone-700 text-center font-medium">
            No 4-letter codes. No rigid boxes. Just a mirror for your current psychic "configuration."
          </p>
        </div>
      </section>

      <section className="mb-16">
        <SectionHeader 
          icon={<Zap className="w-6 h-6 text-jung-accent" />}
          title="The Foundation: Psychic Energy"
          subtitle="Libido and how it flows"
        />
        
        <div className="prose prose-stone prose-lg max-w-none">
          <p>
            Jung saw the mind as a dynamic system with energy called <strong>libido</strong> (not just sexual—general 
            life force, like motivation or attention). This energy flows in patterns, creating habits in how we 
            engage reality.
          </p>

          <div className="bg-blue-50 rounded-lg p-6 my-6 not-prose">
            <h4 className="font-serif font-bold text-blue-900 mb-2">Analogy</h4>
            <p className="text-blue-800">
              Libido is like water in a river. It naturally flows one main way—but dams or blocks cause 
              floods (unconscious eruptions).
            </p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <SectionHeader 
          icon={<Compass className="w-6 h-6 text-jung-accent" />}
          title="The Two Attitudes"
          subtitle="Where your energy flows"
        />
        
        <div className="prose prose-stone prose-lg max-w-none mb-8">
          <p>
            Libido flows in one primary direction—this creates <strong>Extraversion</strong> or <strong>Introversion</strong>. 
            (Not about being shy/outgoing—it's a deeper orientation.)
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-stone-200 rounded-lg p-6">
            <h3 className="font-serif text-xl font-bold text-jung-dark mb-3 flex items-center gap-2">
              <span className="text-2xl">→</span>
              Extraversion — Outward Flow
            </h3>
            <p className="text-stone-700 mb-4">
              Energy moves <strong>from you to the world</strong> (object = external reality, people, facts). 
              The world "pulls" your attention. You adapt by engaging, influencing, exploring.
            </p>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold text-green-700">Strengths:</span> Action-oriented, adaptable, confident in new situations</p>
              <p><span className="font-semibold text-red-700">Blind Spots:</span> Can overlook inner needs; fear boredom/solitude</p>
            </div>
            <p className="text-stone-500 text-sm mt-4 italic">
              Example: At a party, you dive in—chat, organize games, feed off the energy.
            </p>
          </div>
          
          <div className="bg-white border border-stone-200 rounded-lg p-6">
            <h3 className="font-serif text-xl font-bold text-jung-dark mb-3 flex items-center gap-2">
              <span className="text-2xl">←</span>
              Introversion — Inward Flow
            </h3>
            <p className="text-stone-700 mb-4">
              Energy moves <strong>from the world back to you</strong> (subject = inner impressions, values). 
              You filter the world through your inner lens first. Caution toward external demands.
            </p>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold text-green-700">Strengths:</span> Deep reflection, independence, concentration</p>
              <p><span className="font-semibold text-red-700">Blind Spots:</span> Can withdraw too much; inertia or secrecy</p>
            </div>
            <p className="text-stone-500 text-sm mt-4 italic">
              Example: At a party, you observe first, process internally, join selectively.
            </p>
          </div>
        </div>

        <blockquote className="border-l-4 border-jung-accent pl-6 italic text-jung-secondary bg-stone-50 py-4 rounded-r-lg mb-6">
          "The introvert... tries to withdraw libido from the object, as though to prevent the object from gaining power over him."
          <footer className="text-sm font-bold mt-2 not-italic text-jung-primary">— Carl Jung</footer>
        </blockquote>

        <div className="bg-stone-100 rounded-lg p-6">
          <p className="text-stone-700">
            <strong>Key:</strong> Everyone has both—but one dominates consciously. The opposite builds in the 
            unconscious (compensation).
          </p>
        </div>
      </section>

      <section className="mb-16">
        <SectionHeader 
          icon={<Brain className="w-6 h-6 text-jung-accent" />}
          title="The Four Functions"
          subtitle="How you process reality"
        />
        
        <div className="prose prose-stone prose-lg max-w-none mb-8">
          <p>
            We take in and evaluate experience via four basic "tools." Two pairs of opposites.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white border-2 border-jung-accent/20 rounded-lg p-6">
            <h3 className="font-serif text-xl font-bold text-jung-accent mb-2">
              Perceiving Functions (Irrational)
            </h3>
            <p className="text-stone-600 text-sm mb-4">
              "Irrational" means "beyond reason"—they just register data, no judgment.
            </p>
            <div className="space-y-4">
              <div>
                <span className="font-bold text-jung-primary">Sensation</span>
                <p className="text-stone-700 text-sm mt-1">
                  "What exists right now?" Concrete senses (sight, touch, body signals). 
                  Includes raw emotions (affect) as internal sensations.
                </p>
              </div>
              <div>
                <span className="font-bold text-jung-primary">Intuition</span>
                <p className="text-stone-700 text-sm mt-1">
                  "Where is this going?" Unconscious patterns/possibilities. Sudden "aha!" 
                  insights or seeing hidden meanings.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-jung-primary/20 rounded-lg p-6">
            <h3 className="font-serif text-xl font-bold text-jung-primary mb-2">
              Judging Functions (Rational)
            </h3>
            <p className="text-stone-600 text-sm mb-4">
              Make ordered judgments and evaluations.
            </p>
            <div className="space-y-4">
              <div>
                <span className="font-bold text-jung-accent">Thinking</span>
                <p className="text-stone-700 text-sm mt-1">
                  "What is true/logical?" Analyzes connections, principles. 
                  Focus: Objective facts, systems, "true/false."
                </p>
              </div>
              <div>
                <span className="font-bold text-jung-accent">Feeling</span>
                <p className="text-stone-700 text-sm mt-1">
                  "What is valuable?" Assigns worth (good/bad, like/dislike).
                  <span className="block text-stone-500 mt-1">
                    <strong>Important:</strong> This is rational valuation, not raw emotion. 
                    Emotion = bodily affect (sensation). Feeling = systematic "yes/no" based on values.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-stone-100 rounded-lg p-6 mb-6">
          <h4 className="font-serif font-bold text-jung-dark mb-3">Law of Opposites</h4>
          <p className="text-stone-700">
            Functions compensate. Strong Thinking → weak/unconscious Feeling (and vice versa). 
            Strong Sensation → weak Intuition. Like left/right hand—one dominant, the other 
            underdeveloped but still there (and sometimes "possesses" you under stress).
          </p>
        </div>
      </section>

      <section className="mb-16">
        <SectionHeader 
          icon={<span className="text-2xl text-jung-accent">ψ</span>}
          title="The 8 Function-Attitudes"
          subtitle="The building blocks"
        />
        
        <div className="prose prose-stone prose-lg max-w-none mb-8">
          <p>
            Combine attitudes + functions → 8 distinct processes. Each has unique flavor. 
            Click each to explore.
          </p>
        </div>

        <div className="space-y-3">
          {functionOrder.map(code => {
            const func = FUNCTION_DESCRIPTIONS[code];
            const shortDesc: Record<string, string> = {
              'Te': 'Efficient external systems',
              'Ti': 'Precise inner principles',
              'Fe': 'Group harmony/values',
              'Fi': 'Personal authenticity/values',
              'Se': 'Immersive present reality',
              'Si': 'Detailed inner impressions/memory',
              'Ne': 'Brainstorming possibilities',
              'Ni': 'Deep foresight/symbols'
            };
            return (
              <AccordionItem key={code} code={code} title={`${func.title} — ${shortDesc[code]}`}>
                <div className="space-y-4">
                  <p className="text-stone-700 leading-relaxed">{func.desc}</p>
                  
                  <blockquote className="border-l-4 border-jung-accent pl-4 italic text-jung-secondary text-sm">
                    "{func.quote}"
                  </blockquote>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">Positive Expression</h5>
                      <p className="text-sm text-green-900">{func.positive}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <h5 className="font-semibold text-red-800 mb-2">Shadow Side</h5>
                      <p className="text-sm text-red-900">{func.negative}</p>
                    </div>
                  </div>
                </div>
              </AccordionItem>
            );
          })}
        </div>
      </section>

      <section className="mb-16">
        <SectionHeader 
          icon={<Layers className="w-6 h-6 text-jung-accent" />}
          title="The Function Hierarchy"
          subtitle="Your psychic 'stack'"
        />
        
        <div className="prose prose-stone prose-lg max-w-none mb-8">
          <p>
            Functions aren't equal—one dominates consciousness.
          </p>
        </div>

        <div className="space-y-4">
          {Object.entries(STACK_POSITIONS).map(([key, position]) => (
            <AccordionItem 
              key={key} 
              title={`${position.name}: ${position.archetype}`}
              defaultOpen={key === 'dominant'}
            >
              <div className="space-y-4">
                <p className="text-stone-700 leading-relaxed">{position.description}</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-800 mb-2">Development</h5>
                    <p className="text-sm text-blue-900">{position.development}</p>
                  </div>
                  <div className="bg-stone-100 rounded-lg p-4">
                    <h5 className="font-semibold text-stone-700 mb-2">Shadow Aspect</h5>
                    <p className="text-sm text-stone-600">{position.shadow}</p>
                  </div>
                </div>
              </div>
            </AccordionItem>
          ))}
        </div>

        <blockquote className="border-l-4 border-jung-accent pl-6 italic text-jung-secondary bg-stone-50 py-4 rounded-r-lg mt-8">
          "The inferior function is the ever-bleeding wound... but through it the unconscious can always come in."
          <footer className="text-sm font-bold mt-2 not-italic text-jung-primary">— Marie-Louise von Franz</footer>
        </blockquote>

        <div className="bg-amber-50 rounded-lg p-4 mt-6">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Positions like "Hero/Parent" are modern extensions (John Beebe)—helpful metaphors, not Jung's exact words.
          </p>
        </div>
      </section>

      <section className="mb-16">
        <SectionHeader 
          icon={<AlertTriangle className="w-6 h-6 text-jung-accent" />}
          title="The Grip"
          subtitle="When stress takes over"
        />
        
        <div className="prose prose-stone prose-lg max-w-none mb-8">
          <p>
            Under pressure, the inferior "erupts" primitively—feels "not like you."
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <h4 className="font-serif font-bold text-amber-900 mb-3">Signs You May Be "In the Grip"</h4>
          <ul className="space-y-2 text-amber-800">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              Behaviors that feel foreign or "not like yourself"
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              Hypersensitivity in areas you're normally confident about
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              Rigid, black-and-white thinking where you're usually nuanced
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              Obsessive focus on things you normally ignore
            </li>
          </ul>
        </div>

        <details className="border border-stone-200 rounded-lg bg-white">
          <summary className="p-4 cursor-pointer font-serif font-semibold text-jung-dark hover:bg-stone-50">
            View Grip Patterns by Dominant Function
          </summary>
          <div className="p-4 pt-0 space-y-4 border-t border-stone-100">
            {Object.entries(THE_GRIP).map(([code, grip]) => (
              <div key={code} className="border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                <h5 className="font-semibold text-jung-primary mb-2">
                  {code}-Dominant → {grip.inferiorFunction}
                </h5>
                <p className="text-sm text-stone-600 mb-2">{grip.gripDescription}</p>
                <p className="text-xs text-stone-500">
                  <strong>Triggers:</strong> {grip.triggers}
                </p>
              </div>
            ))}
          </div>
        </details>
      </section>

      <section className="mb-16">
        <SectionHeader 
          icon={<HelpCircle className="w-6 h-6 text-jung-accent" />}
          title="Common Misconceptions"
          subtitle="Clearing up confusion"
        />
        
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <h4 className="font-semibold text-jung-dark mb-2">"Feeling = emotional"</h4>
            <p className="text-stone-600 text-sm">
              <strong>No</strong>—Feeling is rational value judgment. Raw emotion = sensation (affect).
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <h4 className="font-semibold text-jung-dark mb-2">"Introvert = shy"</h4>
            <p className="text-stone-600 text-sm">
              <strong>No</strong>—it's energy direction (inner focus), not social behavior.
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <h4 className="font-semibold text-jung-dark mb-2">"Type is fixed"</h4>
            <p className="text-stone-600 text-sm">
              <strong>No</strong>—your type configuration changes with life experiences and growth.
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <h4 className="font-semibold text-jung-dark mb-2">"Better types exist"</h4>
            <p className="text-stone-600 text-sm">
              <strong>No</strong>—all types have unique strengths and blind spots.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <SectionHeader 
          icon={<Sparkles className="w-6 h-6 text-jung-accent" />}
          title="Individuation"
          subtitle="The real goal"
        />
        
        <div className="prose prose-stone prose-lg max-w-none">
          <p>
            Jung didn't want you to "find your type" and stop. Typology reveals <strong>one-sidedness</strong>—your 
            strengths create blind spots.
          </p>

          <p>
            <strong>Individuation:</strong> Lifelong integration of opposites → more whole Self.
          </p>

          <ul>
            <li><strong>First half of life:</strong> Develop dominant/auxiliary (adapt to world)</li>
            <li><strong>Second half:</strong> Reclaim tertiary/inferior, confront Shadow → wholeness</li>
          </ul>
          
          <blockquote className="border-l-4 border-jung-accent pl-6 italic my-6 text-jung-secondary">
            "Individuation means becoming one's own self... our incomparable uniqueness."
            <footer className="text-sm font-bold mt-2 not-italic text-jung-primary">— Carl Jung</footer>
          </blockquote>

          <div className="bg-jung-primary/5 rounded-lg p-6 mt-8 not-prose">
            <h4 className="font-serif font-bold text-jung-dark mb-3">Key Insight</h4>
            <p className="text-stone-700">
              Your lowest scores? That's your <strong>growth edge</strong>—the "treasure hard to attain."
            </p>
          </div>
        </div>
      </section>

      <section className="text-center py-12 border-t border-stone-200">
        <div className="inline-block text-4xl font-serif text-jung-accent mb-4">ψ</div>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-jung-dark mb-4">
          Ready to Reflect?
        </h2>
        <p className="text-stone-600 mb-8 max-w-xl mx-auto px-2">
          Take the assessment for your current profile. Use it as a mirror—not a label.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-8 py-4 bg-jung-primary text-white font-semibold rounded-lg hover:bg-jung-primary/90 transition-colors shadow-lg"
        >
          Take the Assessment
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      <footer className="mt-12 pt-8 border-t border-stone-200 text-center text-sm text-stone-500">
        <div className="font-serif text-jung-accent text-xl mb-2">ψ</div>
        <p className="font-semibold text-stone-700 mb-2">Jungian Typology</p>
        <p className="mb-4">
          A self-exploration tool based on Jung's <em>Psychological Types</em> (1921). Not diagnostic—just reflection.
        </p>
        <p className="text-xs mb-2">
          <strong>Key Concepts:</strong> Individuation • Differentiation • Dominant-Inferior • 8 Processes
        </p>
        <p className="text-xs text-stone-400">
          <strong>Disclaimer:</strong> Self-report only—can't access unconscious fully. Results = snapshot, not fixed identity.
        </p>
        <p className="mt-4 text-xs">© 2026 Jungian Typology Assessment</p>
      </footer>
    </div>
  );
};
