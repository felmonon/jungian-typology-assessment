import React from 'react';
import { BookOpen, Compass, Layers, Activity, ArrowRight } from 'lucide-react';

export const Learn: React.FC = () => {
  return (
    <div className="editorial-container py-12 font-body text-lg leading-relaxed text-jung-text">

      {/* Header */}
      <div className="mb-12 border-b border-jung-border pb-8">
        <div className="flex items-center gap-3 text-jung-accent mb-4">
          <BookOpen className="w-6 h-6" />
          <span className="font-sans font-bold uppercase tracking-widest text-sm">The Theory</span>
        </div>
        <h1 className="text-display text-jung-text mb-6">
          Jungian Depth Psychology
        </h1>
        <p className="text-xl text-jung-secondary leading-relaxed font-sans font-light">
          "The classification of individuals means nothing, nothing at all. To understand them, you have to be on the spot."
        </p>
      </div>

      <div className="max-w-none">

        {/* Section 1: Core Concept */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-jung-text mb-6 flex items-center gap-3">
            <Compass className="w-8 h-8 text-jung-accent" />
            Orientation of Consciousness
          </h2>
          <p className="text-jung-secondary mb-4">
            Carl Jung's <i>Psychological Types</i> (1921) was not intended to be a labeling system. It was a critical psychology of consciousness.
            Jung observed that people tend to adapt to the world in fundamentally different ways. This "one-sidedness" allows us to specialize and function effectively,
            but it comes at a cost: whatever we do not consciously develop falls into the unconscious.
          </p>
          <p className="text-jung-secondary">
            The goal of Jungian psychology is not to identify with your type, but to understand your one-sidedness so you can begin the process of
            <strong className="text-jung-text"> Individuation</strong>—the move toward wholeness.
          </p>
        </section>

        {/* Section 2: The Four Functions */}
        <section className="mb-16 card-elevated p-8 rounded-2xl">
          <h3 className="text-2xl font-serif font-bold text-jung-accent mb-6">The Four Functions</h3>
          <p className="mb-6 text-jung-secondary">
            Jung identified four basic psychological mechanisms by which consciousness orients itself to experience.
            He divided these into two pairs of opposites:
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-jung-text border-b border-jung-accent/30 pb-2 mb-3 font-sans">Rational (Judging) Functions</h4>
              <p className="text-base mb-4 text-jung-secondary">
                These functions evaluate experience based on a norm or standard.
              </p>
              <ul className="space-y-4 text-base">
                <li className="flex gap-3">
                  <span className="font-bold text-jung-accent min-w-[80px] font-sans">Thinking</span>
                  <span className="text-jung-secondary">Evaluates <i>truth/falsity</i> through logical inference and conceptual connection. "What is this?"</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-jung-accent min-w-[80px] font-sans">Feeling</span>
                  <span className="text-jung-secondary">Evaluates <i>value/worth</i> (acceptance or rejection) through an ego-based value system. "What is this worth to me?" (Note: This is not emotion; it is rational judgment).</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-jung-text border-b border-jung-accent/30 pb-2 mb-3 font-sans">Irrational (Perceiving) Functions</h4>
              <p className="text-base mb-4 text-jung-secondary">
                These functions gather data without judgment or evaluation.
              </p>
              <ul className="space-y-4 text-base">
                <li className="flex gap-3">
                  <span className="font-bold text-jung-accent min-w-[80px] font-sans">Sensation</span>
                  <span className="text-jung-secondary">Perceives <i>that</i> something exists through physical stimuli. Focuses on reality and facts.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-jung-accent min-w-[80px] font-sans">Intuition</span>
                  <span className="text-jung-secondary">Perceives <i>possibilities</i> and patterns via the unconscious. Focuses on where things came from and where they are going.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: The Attitudes */}
        <section className="mb-16">
          <h3 className="text-2xl font-serif font-bold text-jung-accent mb-6">The Two Attitudes</h3>
          <p className="text-jung-secondary">
            Every function operates in one of two directions. Jung defined these as the flow of "libido" (psychic energy).
          </p>
          <div className="grid md:grid-cols-2 gap-8 my-8">
            <div className="bg-jung-surface p-6 rounded-2xl border-l-4 border-jung-muted">
              <h4 className="font-bold text-jung-text mb-2 text-xl font-sans">Extraversion (E)</h4>
              <p className="text-base text-jung-secondary">
                The flow of energy is directed <strong className="text-jung-text">outward</strong> toward the object. The subject aligns themselves with external conditions, collective facts, and the environment. Action, interaction, and objective data are primary.
              </p>
            </div>
            <div className="bg-jung-surface p-6 rounded-2xl border-l-4 border-jung-text">
               <h4 className="font-bold text-jung-text mb-2 text-xl font-sans">Introversion (I)</h4>
              <p className="text-base text-jung-secondary">
                The flow of energy is directed <strong className="text-jung-text">inward</strong> toward the subject. The subject validates experience against internal structures, archetypes, and subjective impressions. Reflection, abstraction, and depth are primary.
              </p>
            </div>
          </div>
          <div className="bg-jung-accent/10 p-4 rounded-2xl text-base text-jung-secondary italic border border-jung-accent/20">
            <strong className="text-jung-text">Important:</strong> In Jungian theory, Extraversion is NOT social confidence, and Introversion is NOT shyness. They are orientations of energy, not social skills.
          </div>
        </section>

        {/* Section 4: The 8 Function-Attitudes */}
        <section className="mb-16">
          <h3 className="text-2xl font-serif font-bold text-jung-accent mb-6">The 8 Function-Attitudes</h3>
          <p className="text-jung-secondary">
            Combining the 4 functions with the 2 attitudes creates the 8 distinctive cognitive processes that form the basis of this assessment.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {[
              { code: 'Te', name: 'Extraverted Thinking', desc: 'Organizing external systems for efficiency.' },
              { code: 'Ti', name: 'Introverted Thinking', desc: 'Clarifying internal logical principles.' },
              { code: 'Fe', name: 'Extraverted Feeling', desc: 'Maintaining social harmony and collective values.' },
              { code: 'Fi', name: 'Introverted Feeling', desc: 'Adhering to internal authenticity and core values.' },
              { code: 'Se', name: 'Extraverted Sensation', desc: 'Experiencing the immediate physical world vividly.' },
              { code: 'Si', name: 'Introverted Sensation', desc: 'Comparing present experience to past impressions.' },
              { code: 'Ne', name: 'Extraverted Intuition', desc: 'Generating possibilities and connecting ideas.' },
              { code: 'Ni', name: 'Introverted Intuition', desc: 'Foreseeing implications and realizing visions.' },
            ].map(f => (
              <div key={f.code} className="flex items-start gap-4 p-4 border border-jung-border rounded-2xl hover:bg-jung-surface transition-colors">
                <span className="font-mono font-bold text-lg text-jung-accent">{f.code}</span>
                <div>
                  <strong className="block text-jung-text font-sans">{f.name}</strong>
                  <span className="text-sm text-jung-secondary">{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: The Dynamics */}
        <section className="mb-16">
           <h2 className="text-3xl font-serif font-bold text-jung-text mb-6 flex items-center gap-3">
            <Layers className="w-8 h-8 text-jung-accent" />
            The Dynamics of the Stack
          </h2>
          <p className="text-jung-secondary">
             The most critical aspect of Jung's theory is often lost in modern adaptations: the <strong className="text-jung-text">Compensatory Relationship</strong> between consciousness and the unconscious.
          </p>

          <div className="my-8 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-jung-accent font-sans">1. The Dominant (Superior) Function</h3>
              <p className="text-base text-jung-secondary">
                This is your "hero" function—the most differentiated and conscious tool you have. It is how you primarily adapt to reality. If you are a Thinking type, you navigate the world through logic.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-jung-accent font-sans">2. The Inferior Function</h3>
              <p className="text-base text-jung-secondary">
                Because energy is finite, specializing in one area (e.g., Thinking) necessarily deprives its opposite (Feeling) of energy. The opposite function drops into the unconscious.
              </p>
              <ul className="list-disc pl-6 mt-2 text-base text-jung-secondary space-y-1">
                <li>It acts in "archaic, infantile, and primitive" ways.</li>
                <li>It is where you are "touchy," hypersensitive, and reactive.</li>
                <li>It is the "doorway to the unconscious" (von Franz).</li>
                <li><strong className="text-jung-text">Integration of this function is the primary work of mid-life development.</strong></li>
              </ul>
            </div>
          </div>

          <blockquote className="border-l-4 border-jung-accent pl-6 italic my-8 text-jung-secondary text-xl">
            "The inferior function is the ever-bleeding wound of the conscious personality, but through it the unconscious can always come in."
            <footer className="text-sm font-bold mt-2 not-italic text-jung-accent font-sans">— Marie-Louise von Franz</footer>
          </blockquote>
        </section>

      </div>
    </div>
  );
};