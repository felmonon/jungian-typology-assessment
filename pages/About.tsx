import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSEO, PAGE_SEO } from '../hooks/useSEO';
import { LongformSection } from '../components/layout/LongformSection';

export const About: React.FC = () => {
  useSEO(PAGE_SEO.about);

  return (
    <div className="lt">
      <header className="wrap page-head">
        <h1 className="page-title">About This Assessment</h1>
        <p className="page-lead">
          Why this is not another MBTI clone, and how TypeJung turns Jung's ideas into a practical self-reflection map.
        </p>
      </header>

      <LongformSection id="about-warning" title="Jung's Warning" subtitle="Typology isn't a game">
        <p>
          Carl Jung never wanted his ideas turned into quick labels or fixed categories. In his 1934
          foreword to the Argentine edition of <em>Psychological Types</em>, he wrote:
        </p>

        <blockquote className="lt-quote">
          <p>"Using [typology] to stick labels on people at first sight is nothing but a childish parlor game."</p>
          <footer>Carl Jung, 1934</footer>
        </blockquote>

        <p>
          Jung used typology to help people understand natural "one-sidedness"
          (biases in how we think/perceive) and grow beyond it through <strong>individuation</strong> (becoming a
          more whole, unique self).
        </p>

        <div className="lt-note">
          <h3>A simple analogy</h3>
          <p>
            Typology is like a mirror showing your current "driving style" (habits). The goal isn't
            "I'm a sedan!"—it's learning to drive better in all conditions.
          </p>
        </div>

        <p>
          Popular tools (like MBTI) often focus on fun labels ("INTJ Judge"). This site returns to Jung:
          reflection on strengths, blind spots, and psychological balance.
        </p>
      </LongformSection>

      <LongformSection id="about-differs" title="How This Assessment Differs" subtitle="A different approach">
        <p>
          TypeJung combines scenario answers, stress-pattern prompts, body-signal prompts, and
          an introversion/extraversion measure to propose a function-stack pattern.
        </p>

        <div className="lt-grid">
          {[
            {
              title: 'Four channels, inferred stack',
              description: 'Thinking, feeling, sensation, and intuition scores combine with attitude direction to derive the eight-function display.'
            },
            {
              title: 'Nuanced results',
              description: 'The map keeps relative channel scores visible. Its function-attitude values are derived, not eight independent measurements.'
            },
            {
              title: 'Focus on growth',
              description: 'Highlights the inferior function, the least conscious part of the stack, as a place to grow.'
            }
          ].map((item) => (
            <div key={item.title} className="lt-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>

        <p>
          <strong>No forced four-letter box.</strong> Just a clearer map of the pattern in your answers.
        </p>
      </LongformSection>

      <LongformSection id="about-method" title="Our Methodology" subtitle="Theory-informed, not diagnostic">
        <p>
          We draw from Jung's writings and Marie-Louise von Franz's lectures on typology.
          The current scoring method is an educational self-reflection framework, not a clinical instrument.
        </p>

        <div className="lt-card">
          <h3>Four Channel Scores and a Derived Function Stack</h3>
          <p>
            The 42-question assessment scores thinking, feeling, sensation, and intuition using
            behavioral, stress, and body-signal answers. Six attitude prompts separately estimate
            an introversion/extraversion direction.
          </p>
          <p>
            The scoring rules combine those signals into a proposed stack. The eight-function view
            assigns function-attitude labels and derived values to that pattern; it does not
            independently measure Te, Ti, Fe, Fi, Se, Si, Ne, and Ni.
          </p>
          <p>
            <strong>Read it as a hypothesis:</strong> The eight-function display is an interpretation of the channel scores, not eight separate test scales.
          </p>
        </div>

        <div className="lt-card">
          <h3>Stress-pattern questions</h3>
          <p>
            Self-report often shows "who we want to be" (the persona, a social mask). Following
            <strong> Marie-Louise von Franz</strong>, we include questions on how you react under
            stress, where you get touchy, and where you turn rigid.
          </p>
          <p>
            These can point toward the <strong>inferior function</strong> (least conscious in this framework)—what
            von Franz called the "ever-bleeding wound," but also "treasure hard to attain."
          </p>
          <p>
            <strong>Example:</strong> Uncharacteristic worries or fixations under stress can be the inferior function surfacing (the "grip").
          </p>
          <p>
            <strong>Why include this?</strong> Tension and stress-pattern questions can add a confidence signal
            beyond claimed strengths, while still remaining self-report.
          </p>
        </div>

        <div className="lt-card">
          <h3>What you report, and what theory suggests</h3>
          <p>
            <strong>What you report:</strong> your current habits, from your own answers.
          </p>
          <p>
            <strong>What theory suggests:</strong> a "stack" based on Jung's opposites and compensation.
          </p>
          <p>
            A mismatch may reflect context, question wording, or limits in the scoring rules.
            Do not assume the test is right when your experience disagrees.
          </p>
        </div>
      </LongformSection>

      <LongformSection id="about-why" title="Why This Matters" subtitle="One-sidedness and growth">
        <p>
          Jung saw type as a <strong>one-sided bias</strong>—strengths create blind spots. Over-rely on logic,
          and feeling stays undeveloped and unconscious.
        </p>
        <p>
          The goal: <strong>Individuation</strong>—integrate opposites for wholeness.
        </p>
        <ul className="list-diamond">
          <li><strong>The inferior function:</strong> your growth edge (unconscious potential).</li>
          <li><strong>The leading functions:</strong> your strengths—but watch for over-one-sidedness.</li>
        </ul>
        <div className="lt-note">
          <h3>Analogy</h3>
          <p>Like exercising weak muscles—the "inferior" is where real development happens.</p>
        </div>
      </LongformSection>

      <LongformSection id="about-limits" title="Honest Limitations" subtitle="No tool is perfect">
        <div className="lt-grid">
          <div className="lt-card">
            <h3>Persona Problem</h3>
            <p>
              Self-report captures conscious image, not full unconscious (Jung: "Every mind contains unacknowledged contents").
            </p>
            <p>
              Like a mirror for reflection, not an X-ray or clinical assessment. Deeper personal work
              belongs with appropriate professional support.
            </p>
          </div>
          <div className="lt-card">
            <h3>Type Isn't Static</h3>
            <p>Jung: "The type changes in the course of life." Results = snapshot.</p>
          </div>
          <div className="lt-card">
            <h3>Consistency Is Not Accuracy</h3>
            <p>
              The consistency percentage is a rule-based agreement signal across answer layers.
              It is not the probability that your type is correct or a validated accuracy score.
            </p>
          </div>
          <div className="lt-card">
            <h3>Not Diagnosis</h3>
            <p>Educational/reflective only. It is not medical, mental-health, or diagnostic advice.</p>
          </div>
        </div>
      </LongformSection>

      <LongformSection id="about-sources" title="Primary Sources & Credits" subtitle="Influenced by">
        <ul className="list-diamond lt-sources">
          <li><strong>C.G. Jung:</strong> <em>Psychological Types</em> (CW 6, 1921).</li>
          <li><strong>Marie-Louise von Franz & James Hillman:</strong> <em>Lectures on Jung's Typology</em> (1971).</li>
          <li><strong>June Singer & Mary Loomis:</strong> Singer-Loomis Inventory research (1984).</li>
          <li><strong>John Beebe:</strong> Archetypal extensions (2016).</li>
        </ul>
        <p>
          Inspired by Jungian writers and analysts, with the goal of reflection rather than certainty or diagnosis.
        </p>
      </LongformSection>

      <section className="lt-close" aria-labelledby="about-close-title">
        <div className="wrap lt-close-row">
          <div>
            <h2 id="about-close-title" className="display-2">Ready for reflection?</h2>
            <p className="lt-close-text">
              Begin a self-reflection exercise informed by Jungian typology.
            </p>
          </div>
          <div className="lt-close-actions">
            <Link to="/assessment" className="btn btn-accent btn-lg">
              Take the assessment
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link to="/learn" className="text-link">
              Learn the theory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
