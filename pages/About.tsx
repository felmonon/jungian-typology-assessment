import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, FileText, Users, BookOpen, ArrowRight, Target, Lightbulb, Scale } from 'lucide-react';
import { useSEO, PAGE_SEO } from '../hooks/useSEO';

export const About: React.FC = () => {
  useSEO(PAGE_SEO.about);

  return (
    <div className="editorial-container py-12 md:py-20">
      {/* Hero Header */}
      <header className="mb-16 md:mb-20 text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <img src="/logo.svg" alt="Jungian Typology" className="w-12 h-12" />
        </div>
        <h1 className="text-display text-4xl sm:text-5xl md:text-6xl mb-6 max-w-3xl mx-auto">
          About This Assessment
        </h1>
        <p className="text-body text-xl text-jung-muted max-w-2xl mx-auto leading-relaxed">
          Why this is not another MBTI clone—and how we stay true to Jung's original clinical insights.
        </p>
      </header>

      {/* Jung's Warning Section */}
      <section className="mb-16 md:mb-20">
        <div className="flex items-start gap-4 md:gap-5 mb-8">
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-jung-accent/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-jung-accent" />
          </div>
          <div>
            <h2 className="text-heading text-2xl md:text-3xl">Jung's Warning</h2>
            <p className="text-body text-jung-muted mt-1">Typology isn't a game</p>
          </div>
        </div>

        <div className="prose-editorial">
          <p>
            Carl Jung never wanted his ideas turned into quick labels or fixed categories. In 1934, he wrote:
          </p>

          <blockquote className="my-8 pl-6 border-l-4 border-jung-accent bg-jung-surface/50 py-6 pr-6 rounded-r-lg">
            <p className="text-lg md:text-xl italic text-jung-secondary leading-relaxed">
              "Using [typology] to stick labels on people at first sight is nothing but a childish parlor game."
            </p>
            <footer className="mt-4 text-sm font-semibold text-jung-accent not-italic">
              — Carl Jung, 1934
            </footer>
          </blockquote>

          <p>
            Jung created typology as a <strong>clinical tool</strong>—to help understand our natural "one-sidedness"
            (biases in how we think/perceive) and grow beyond it through <strong>individuation</strong> (becoming a
            more whole, unique self).
          </p>

          <div className="card-elevated p-6 my-8 bg-amber-50/50 border-amber-200/50">
            <div className="flex items-start gap-4">
              <Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-ui font-semibold text-jung-dark mb-2">Simple Analogy</h4>
                <p className="text-body text-jung-secondary">
                  Typology is like a mirror showing your current "driving style" (habits). The goal isn't
                  "I'm a sedan!"—it's learning to drive better in all conditions.
                </p>
              </div>
            </div>
          </div>

          <p>
            Popular tools (like MBTI) often focus on fun labels ("INTJ Judge"). This site returns to Jung:
            reflection on strengths, blind spots, and psychic balance.
          </p>
        </div>
      </section>

      {/* How This Assessment Differs */}
      <section className="mb-16 md:mb-20">
        <div className="flex items-start gap-4 md:gap-5 mb-8">
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-jung-accent/10 flex items-center justify-center">
            <Scale className="w-7 h-7 text-jung-accent" />
          </div>
          <div>
            <h2 className="text-heading text-2xl md:text-3xl">How This Assessment Differs</h2>
            <p className="text-body text-jung-muted mt-1">A fundamentally different approach</p>
          </div>
        </div>

        <div className="prose-editorial mb-10">
          <p>
            Most tests (e.g., MBTI) force choices: "Logic OR feelings?" This assumes opposites cancel
            each other—and outputs rigid 16 types.
          </p>
          <p className="text-jung-accent font-semibold">We do the opposite:</p>
        </div>

        <div className="space-y-4 mb-10">
          {[
            {
              icon: Target,
              title: 'Independent Measurement',
              description: 'Singer-Loomis method: All 8 processes scored separately on scales.'
            },
            {
              icon: Scale,
              title: 'Nuanced Results',
              description: 'You might be high in both logical organization (Te) and personal values (Fi)—real life isn\'t black/white.'
            },
            {
              icon: ArrowRight,
              title: 'Focus on Growth',
              description: 'Highlights unconscious "blind spots" (inferior function) for self-awareness.'
            }
          ].map((item, index) => (
            <div
              key={index}
              className="card-elevated p-5 flex gap-4 hover:border-jung-accent/30 transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-jung-accent/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-jung-accent" />
              </div>
              <div>
                <h4 className="text-ui font-semibold text-jung-dark mb-1">{item.title}</h4>
                <p className="text-body text-sm text-jung-muted">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-jung-surface rounded-xl p-6 text-center border border-jung-border">
          <p className="text-body text-jung-secondary font-medium">
            No 4-letter codes. No boxes. Just an honest psychic profile.
          </p>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="mb-16 md:mb-20 card-elevated p-6 md:p-10 rounded-2xl">
        <div className="flex items-start gap-4 md:gap-5 mb-8">
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-jung-accent/10 flex items-center justify-center">
            <FileText className="w-7 h-7 text-jung-accent" />
          </div>
          <div>
            <h2 className="text-heading text-2xl md:text-3xl">Our Methodology</h2>
            <p className="text-body text-jung-muted mt-1">Honoring clinical roots</p>
          </div>
        </div>

        <p className="text-body text-jung-secondary mb-10">
          We draw from Jung's writings, von Franz (his closest student), and Singer-Loomis (Jungian analysts' research).
        </p>

        <div className="space-y-10">
          {/* Method 1 */}
          <div>
            <h3 className="text-lg font-serif font-bold text-jung-accent mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-jung-accent text-white flex items-center justify-center text-sm">1</span>
              Independent Measurement of 8 Processes
            </h3>
            <div className="text-body text-jung-secondary space-y-4 pl-10">
              <p>
                Traditional tests pit functions against each other (mutually exclusive). We follow
                <strong> Singer-Loomis</strong> (validated 1984 research): Each process (Te, Ti, Fe, etc.)
                scored alone on a scale.
              </p>
              <p>
                <strong>Why?</strong> Real people use multiple processes fluidly. High Te + high Fe?
                Possible—and reveals nuanced psyche.
              </p>
              <div className="bg-jung-surface rounded-lg p-4 border border-jung-border">
                <p className="text-sm text-jung-muted italic">
                  <strong className="not-italic">Analogy:</strong> Like measuring ingredients separately in a recipe—not forcing "salt OR sugar?"
                </p>
              </div>
            </div>
          </div>

          {/* Method 2 */}
          <div>
            <h3 className="text-lg font-serif font-bold text-jung-accent mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-jung-accent text-white flex items-center justify-center text-sm">2</span>
              Probing the Unconscious (Dysfunction & Grip Questions)
            </h3>
            <div className="text-body text-jung-secondary space-y-4 pl-10">
              <p>
                Self-report often shows "who we want to be" (Persona—social mask). Following
                <strong> Marie-Louise von Franz</strong>: We include questions on stress reactivity,
                emotional "touchiness," and rigid behaviors.
              </p>
              <p>
                These reveal the <strong>inferior function</strong> (most unconscious)—your "ever-bleeding wound"
                (von Franz) but also "treasure hard to attain."
              </p>
              <div className="bg-jung-surface rounded-lg p-4 border border-jung-border">
                <p className="text-sm text-jung-muted italic">
                  <strong className="not-italic">Example:</strong> Sudden irrational fears or obsessions under stress? That's often the inferior erupting ("grip").
                </p>
              </div>
              <p className="text-sm text-jung-muted">
                <strong>Why reliable?</strong> Negative patterns show unconscious compensation better than claimed strengths.
              </p>
            </div>
          </div>

          {/* Method 3 */}
          <div>
            <h3 className="text-lg font-serif font-bold text-jung-accent mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-jung-accent text-white flex items-center justify-center text-sm">3</span>
              Empirical Scores + Theoretical Insights
            </h3>
            <div className="text-body text-jung-secondary space-y-4 pl-10">
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

      {/* Why This Matters */}
      <section className="mb-16 md:mb-20">
        <div className="flex items-start gap-4 md:gap-5 mb-8">
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-jung-accent/10 flex items-center justify-center">
            <ArrowRight className="w-7 h-7 text-jung-accent" />
          </div>
          <div>
            <h2 className="text-heading text-2xl md:text-3xl">Why This Matters</h2>
            <p className="text-body text-jung-muted mt-1">One-sidedness & growth</p>
          </div>
        </div>

        <div className="prose-editorial">
          <p>
            Jung saw type as <strong>problematic bias</strong>—strengths create blind spots. Over-rely on logic?
            Emotions become primitive/unconscious.
          </p>
          <p>
            The goal: <strong>Individuation</strong>—integrate opposites for wholeness.
          </p>
          <ul className="space-y-2 my-6">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-jung-accent mt-2.5 flex-shrink-0" />
              <span><strong>Low scores?</strong> Your growth edge (unconscious potential).</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-jung-accent mt-2.5 flex-shrink-0" />
              <span><strong>High scores?</strong> Your strengths—but watch for over-one-sidedness.</span>
            </li>
          </ul>

          <div className="card-elevated p-6 my-8 bg-blue-50/50 border-blue-200/50">
            <p className="text-body text-blue-800">
              <strong>Analogy:</strong> Like exercising weak muscles—the "inferior" is where real development happens.
            </p>
          </div>
        </div>
      </section>

      {/* Limitations */}
      <section className="mb-16 md:mb-20">
        <div className="card-elevated p-6 md:p-8 bg-amber-50/30 border-amber-200/50 rounded-2xl">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 flex-shrink-0 text-amber-700 mt-1" />
            <div>
              <h3 className="text-heading text-xl md:text-2xl text-amber-900 mb-4">Honest Limitations</h3>
              <p className="text-body text-amber-800 mb-6">We're transparent—no tool is perfect.</p>

              <div className="space-y-6">
                <div>
                  <p className="font-semibold text-amber-900 mb-1">1. Persona Problem</p>
                  <p className="text-sm text-amber-800">
                    Self-report captures conscious image, not full unconscious (Jung: "Every mind contains unacknowledged contents").
                  </p>
                  <p className="text-sm text-amber-700 italic mt-2">
                    Analogy: Like a mirror (surface reflection)—not an X-ray (deep scan). True depth needs dreams/therapy.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-amber-900 mb-1">2. Type Isn't Static</p>
                  <p className="text-sm text-amber-800">
                    Jung: "The type changes in the course of life." Results = snapshot.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-amber-900 mb-1">3. Not Diagnosis</p>
                  <p className="text-sm text-amber-800">
                    Educational/reflective only. Deep work requires trained analyst.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="mb-16 md:mb-20 border-t border-jung-border pt-10">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-jung-muted" />
          <h3 className="text-heading text-xl">Primary Sources & Credits</h3>
        </div>
        <p className="text-body text-jung-muted mb-6">Faithful to originals:</p>
        <ul className="text-body text-sm text-jung-secondary space-y-3">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-jung-accent mt-2 flex-shrink-0" />
            <span><strong>C.G. Jung:</strong> <em>Psychological Types</em> (CW 6, 1921).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-jung-accent mt-2 flex-shrink-0" />
            <span><strong>Marie-Louise von Franz & James Hillman:</strong> <em>Lectures on Jung's Typology</em> (1971).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-jung-accent mt-2 flex-shrink-0" />
            <span><strong>June Singer & Mary Loomis:</strong> Singer-Loomis Inventory research (1984).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-jung-accent mt-2 flex-shrink-0" />
            <span><strong>John Beebe:</strong> Archetypal extensions (2016).</span>
          </li>
        </ul>
        <p className="text-sm text-jung-muted mt-6 italic">
          Inspired by clinical Jungians—aiming for insight, not entertainment.
        </p>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 border-t border-jung-border">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-jung-accent/10 mb-6">
          <span className="text-jung-accent font-serif text-4xl">ψ</span>
        </div>
        <h2 className="text-display text-2xl md:text-3xl mb-4">
          Ready for Reflection?
        </h2>
        <p className="text-body text-jung-muted mb-8 max-w-md mx-auto">
          Begin your journey of self-discovery with an assessment rooted in authentic Jungian psychology.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="
              inline-flex items-center justify-center gap-2
              px-8 py-4 min-h-[56px]
              bg-jung-accent text-white text-ui font-semibold
              rounded-lg shadow-lg shadow-jung-accent/20
              hover:bg-jung-accent-hover hover:-translate-y-0.5
              transition-all duration-200
            "
          >
            Take the Assessment
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/learn"
            className="
              inline-flex items-center justify-center gap-2
              px-8 py-4 min-h-[56px]
              bg-jung-surface text-jung-accent text-ui font-semibold
              rounded-lg border-2 border-jung-accent
              hover:bg-jung-accent/5 hover:-translate-y-0.5
              transition-all duration-200
            "
          >
            <BookOpen className="w-5 h-5" />
            Learn the Theory
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 pt-10 border-t border-jung-border text-center">
        <img src="/logo.svg" alt="Jungian Typology" className="w-12 h-12 mx-auto mb-4" />
        <p className="text-ui font-semibold text-jung-dark mb-2">Jungian Typology</p>
        <p className="text-body text-sm text-jung-muted mb-4 max-w-md mx-auto">
          A self-exploration tool based on Jung's <em>Psychological Types</em> (1921). Mirror for reflection—not fixed label.
        </p>
        <p className="text-xs text-jung-muted mb-2">
          <strong>Key Concepts:</strong> Individuation • One-Sidedness • Inferior Function • 8 Processes
        </p>
        <p className="text-xs text-jung-muted/70">
          <strong>Disclaimer:</strong> Self-report only. Results = current configuration, not permanent identity.
        </p>
        <p className="mt-6 text-xs text-jung-muted/50">© 2026 Jungian Typology Assessment</p>
      </footer>
    </div>
  );
};
