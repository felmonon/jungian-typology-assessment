import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, FileText, Users, BookOpen, ArrowRight, Target, Lightbulb, Scale } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 text-jung-accent mb-4">
          <span className="text-4xl font-serif">ψ</span>
          <Activity className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-jung-dark mb-4">
          About This Assessment
        </h1>
        <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed px-2">
          Why this is not another MBTI clone—and how we stay true to Jung's original clinical insights.
        </p>
      </header>

      <section className="mb-16">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-jung-accent/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-jung-accent" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-jung-dark">Jung's Warning</h2>
            <p className="text-stone-600 mt-1">Typology isn't a game</p>
          </div>
        </div>
        
        <div className="prose prose-stone prose-lg max-w-none">
          <p>
            Carl Jung never wanted his ideas turned into quick labels or fixed categories. In 1934, he wrote:
          </p>
          
          <blockquote className="border-l-4 border-jung-accent pl-6 italic my-6 text-jung-secondary">
            "Using [typology] to stick labels on people at first sight is nothing but a childish parlor game."
            <footer className="text-sm font-bold mt-2 not-italic text-jung-primary">— Carl Jung, 1934</footer>
          </blockquote>

          <p>
            Jung created typology as a <strong>clinical tool</strong>—to help understand our natural "one-sidedness" 
            (biases in how we think/perceive) and grow beyond it through <strong>individuation</strong> (becoming a 
            more whole, unique self).
          </p>

          <div className="bg-amber-50 rounded-lg p-6 my-8 not-prose">
            <h4 className="font-serif font-bold text-jung-dark mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              Simple Analogy
            </h4>
            <p className="text-stone-700">
              Typology is like a mirror showing your current "driving style" (habits). The goal isn't 
              "I'm a sedan!"—it's learning to drive better in all conditions.
            </p>
          </div>

          <p>
            Popular tools (like MBTI) often focus on fun labels ("INTJ Judge"). This site returns to Jung: 
            reflection on strengths, blind spots, and psychic balance.
          </p>
        </div>
      </section>

      <section className="mb-16">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-jung-accent/10 flex items-center justify-center">
            <Scale className="w-6 h-6 text-jung-accent" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-jung-dark">How This Assessment Differs</h2>
            <p className="text-stone-600 mt-1">A fundamentally different approach</p>
          </div>
        </div>
        
        <div className="prose prose-stone prose-lg max-w-none mb-8">
          <p>
            Most tests (e.g., MBTI) force choices: "Logic OR feelings?" This assumes opposites cancel 
            each other—and outputs rigid 16 types.
          </p>
          <p><strong>We do the opposite:</strong></p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-white border border-stone-200 rounded-lg p-5 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-jung-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-jung-dark mb-1">Independent Measurement</h4>
              <p className="text-sm text-stone-600">Singer-Loomis method: All 8 processes scored separately on scales.</p>
            </div>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-5 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-jung-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-jung-dark mb-1">Nuanced Results</h4>
              <p className="text-sm text-stone-600">You might be high in both logical organization (Te) and personal values (Fi)—real life isn't black/white.</p>
            </div>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-5 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center flex-shrink-0">
              <ArrowRight className="w-5 h-5 text-jung-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-jung-dark mb-1">Focus on Growth</h4>
              <p className="text-sm text-stone-600">Highlights unconscious "blind spots" (inferior function) for self-awareness.</p>
            </div>
          </div>
        </div>

        <div className="bg-stone-100 rounded-lg p-6">
          <p className="text-stone-700 text-center font-medium">
            No 4-letter codes. No boxes. Just an honest psychic profile.
          </p>
        </div>
      </section>

      <section className="mb-16 bg-stone-50 p-6 md:p-8 rounded-lg">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-jung-accent/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-jung-accent" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-jung-dark">Our Methodology</h2>
            <p className="text-stone-600 mt-1">Honoring clinical roots</p>
          </div>
        </div>

        <p className="text-stone-700 mb-8">
          We draw from Jung's writings, von Franz (his closest student), and Singer-Loomis (Jungian analysts' research).
        </p>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-jung-primary mb-3">1. Independent Measurement of 8 Processes</h3>
            <div className="text-stone-700 space-y-3">
              <p>
                Traditional tests pit functions against each other (mutually exclusive). We follow 
                <strong> Singer-Loomis</strong> (validated 1984 research): Each process (Te, Ti, Fe, etc.) 
                scored alone on a scale.
              </p>
              <p>
                <strong>Why?</strong> Real people use multiple processes fluidly. High Te + high Fe? 
                Possible—and reveals nuanced psyche.
              </p>
              <div className="bg-white rounded-lg p-4 border border-stone-200">
                <p className="text-sm text-stone-600 italic">
                  <strong>Analogy:</strong> Like measuring ingredients separately in a recipe—not forcing "salt OR sugar?"
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-jung-primary mb-3">2. Probing the Unconscious (Dysfunction & Grip Questions)</h3>
            <div className="text-stone-700 space-y-3">
              <p>
                Self-report often shows "who we want to be" (Persona—social mask). Following 
                <strong> Marie-Louise von Franz</strong>: We include questions on stress reactivity, 
                emotional "touchiness," and rigid behaviors.
              </p>
              <p>
                These reveal the <strong>inferior function</strong> (most unconscious)—your "ever-bleeding wound" 
                (von Franz) but also "treasure hard to attain."
              </p>
              <div className="bg-white rounded-lg p-4 border border-stone-200">
                <p className="text-sm text-stone-600 italic">
                  <strong>Example:</strong> Sudden irrational fears or obsessions under stress? That's often the inferior erupting ("grip").
                </p>
              </div>
              <p className="text-sm text-stone-500">
                <strong>Why reliable?</strong> Negative patterns show unconscious compensation better than claimed strengths.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-jung-primary mb-3">3. Empirical Scores + Theoretical Insights</h3>
            <div className="text-stone-700 space-y-3">
              <p>
                <strong>Empirical:</strong> What you actually report (current habits).
              </p>
              <p>
                <strong>Theoretical:</strong> Suggested "stack" based on Jung's opposites/compensation.
              </p>
              <p>
                Discrepancies? Not errors—opportunities for reflection (e.g., "Why do I avoid this function?").
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-jung-accent/10 flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-jung-accent" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-jung-dark">Why This Matters</h2>
            <p className="text-stone-600 mt-1">One-sidedness & growth</p>
          </div>
        </div>
        
        <div className="prose prose-stone prose-lg max-w-none">
          <p>
            Jung saw type as <strong>problematic bias</strong>—strengths create blind spots. Over-rely on logic? 
            Emotions become primitive/unconscious.
          </p>
          <p>
            The goal: <strong>Individuation</strong>—integrate opposites for wholeness.
          </p>
          <ul>
            <li><strong>Low scores?</strong> Your growth edge (unconscious potential).</li>
            <li><strong>High scores?</strong> Your strengths—but watch for over-one-sidedness.</li>
          </ul>
          
          <div className="bg-blue-50 rounded-lg p-6 my-6 not-prose">
            <p className="text-blue-800">
              <strong>Analogy:</strong> Like exercising weak muscles—the "inferior" is where real development happens.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <div className="flex items-start gap-4 p-6 bg-amber-50 rounded-lg border border-amber-100">
          <AlertTriangle className="w-8 h-8 flex-shrink-0 text-amber-700 mt-1" />
          <div>
            <h3 className="font-serif font-bold text-xl text-amber-900 mb-4">Honest Limitations</h3>
            <p className="text-amber-800 mb-4">We're transparent—no tool is perfect.</p>
            
            <div className="space-y-4 text-amber-800">
              <div>
                <p className="font-semibold">1. Persona Problem</p>
                <p className="text-sm">
                  Self-report captures conscious image, not full unconscious (Jung: "Every mind contains unacknowledged contents").
                </p>
                <p className="text-sm italic mt-1">
                  Analogy: Like a mirror (surface reflection)—not an X-ray (deep scan). True depth needs dreams/therapy.
                </p>
              </div>
              
              <div>
                <p className="font-semibold">2. Type Isn't Static</p>
                <p className="text-sm">
                  Jung: "The type changes in the course of life." Results = snapshot.
                </p>
              </div>
              
              <div>
                <p className="font-semibold">3. Not Diagnosis</p>
                <p className="text-sm">
                  Educational/reflective only. Deep work requires trained analyst.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16 border-t border-stone-200 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-stone-500" />
          <h3 className="text-xl font-serif font-bold text-stone-700">Primary Sources & Credits</h3>
        </div>
        <p className="text-stone-600 mb-4">Faithful to originals:</p>
        <ul className="text-sm text-stone-600 space-y-2">
          <li><strong>C.G. Jung:</strong> <em>Psychological Types</em> (CW 6, 1921).</li>
          <li><strong>Marie-Louise von Franz & James Hillman:</strong> <em>Lectures on Jung's Typology</em> (1971).</li>
          <li><strong>June Singer & Mary Loomis:</strong> Singer-Loomis Inventory research (1984).</li>
          <li><strong>John Beebe:</strong> Archetypal extensions (2016).</li>
        </ul>
        <p className="text-sm text-stone-500 mt-4 italic">
          Inspired by clinical Jungians—aiming for insight, not entertainment.
        </p>
      </section>

      <section className="text-center py-12 border-t border-stone-200">
        <div className="inline-block text-4xl font-serif text-jung-accent mb-4">ψ</div>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-jung-dark mb-4">
          Ready for Reflection?
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-jung-primary text-white font-semibold rounded-lg hover:bg-jung-primary/90 transition-colors shadow-lg"
          >
            Take the Assessment
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            to="/learn" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-jung-primary font-semibold rounded-lg border-2 border-jung-primary hover:bg-jung-primary/5 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            Learn the Theory
          </Link>
        </div>
      </section>

      <footer className="mt-12 pt-8 border-t border-stone-200 text-center text-sm text-stone-500">
        <div className="font-serif text-jung-accent text-xl mb-2">ψ</div>
        <p className="font-semibold text-stone-700 mb-2">Jungian Typology</p>
        <p className="mb-4">
          A self-exploration tool based on Jung's <em>Psychological Types</em> (1921). Mirror for reflection—not fixed label.
        </p>
        <p className="text-xs mb-2">
          <strong>Key Concepts:</strong> Individuation • One-Sidedness • Inferior Function • 8 Processes
        </p>
        <p className="text-xs text-stone-400">
          <strong>Disclaimer:</strong> Self-report only. Results = current configuration, not permanent identity.
        </p>
        <p className="mt-4 text-xs">© 2026 Jungian Typology Assessment</p>
      </footer>
    </div>
  );
};
