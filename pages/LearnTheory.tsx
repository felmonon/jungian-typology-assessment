import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FUNCTION_DESCRIPTIONS, STACK_POSITIONS, THE_GRIP } from '../data/questions';
import { useSEO, PAGE_SEO } from '../hooks/useSEO';
import { LongformSection } from '../components/layout/LongformSection';
import { AnalyticsEvents } from '../lib/analytics';
import { FunctionEmblem } from '../components/brand/FunctionEmblem';

const BlockQuote: React.FC<{ children: React.ReactNode; author: string }> = ({ children, author }) => (
  <blockquote className="lt-quote">
    <p>{children}</p>
    <footer>{author}</footer>
  </blockquote>
);

export const LearnTheory: React.FC = () => {
  const functionOrder = ['Te', 'Ti', 'Fe', 'Fi', 'Se', 'Si', 'Ne', 'Ni'];

  // SEO and analytics
  useSEO(PAGE_SEO.learn);
  React.useEffect(() => {
    AnalyticsEvents.theoryPageViewed();
  }, []);

  return (
    <div className="lt">
      <header className="wrap page-head">
        <h1 className="page-title">Learn the Theory</h1>
        <p className="page-lead">
          A comprehensive guide to Carl Jung's psychological typology—the authentic foundation behind modern personality frameworks.
        </p>
      </header>

      <LongformSection id="learn-origins" title="Why Jung Created Typology" subtitle="The origins and philosophy">
        <p>
          In 1921, Swiss psychiatrist <strong>Carl Gustav Jung</strong> published <em>Psychological Types</em>,
          a groundbreaking work that would reshape our understanding of human cognition. It wasn't about
          putting people in boxes or assigning labels. Jung wanted to understand
          <strong> why we all perceive and judge the world differently</strong>—and how this natural "one-sidedness"
          shapes our strengths, blind spots, and paths toward psychological growth.
        </p>

        <BlockQuote author="Carl Jung">
          The classification of individuals means nothing, nothing at all. It is only the instrument...
          To understand them, you have to be on the spot.
        </BlockQuote>

        <p>
          Jung noticed that everyone gravitates toward certain ways of thinking, feeling, perceiving, and deciding.
          This creates natural biases—like wearing tinted glasses that color everything we see.
          Typology helps us recognize our particular "tint" so we can transcend it through
          <strong> individuation</strong>—the lifelong journey of becoming a more whole, integrated self.
        </p>

        <div className="lt-note">
          <h3>A simple analogy</h3>
          <p>
            Imagine driving a car. Some people love the accelerator (outward action), others prefer the brakes
            (inner reflection). Some focus on the map (logic/values), others on the scenery (details/possibilities).
            Your "driving style" is your type—but the goal is learning to drive skillfully in all conditions.
          </p>
        </div>
      </LongformSection>

      <LongformSection id="learn-differs" title="How This Assessment Differs" subtitle="A more nuanced approach than MBTI">
        <p>
          The popular Myers-Briggs Type Indicator (MBTI) uses forced-choice questions
          (e.g., "Logic OR feelings?") and outputs 16 fixed "types" (like INFP).
          This assessment takes a different approach:
        </p>

        <div className="lt-grid">
          {[
            {
              title: 'Function-first method',
              desc: 'Scores thinking, feeling, sensation and intuition separately instead of forcing either-or choices.',
            },
            {
              title: 'All eight on one map',
              desc: 'Places the eight function-attitudes from those four scores and your attitude lean. They are derived, not eight separate scales.',
            },
            {
              title: 'Nuanced profile',
              desc: 'You can score high in both logical organization and group harmony.',
            },
            {
              title: 'Growth-focused',
              desc: 'Emphasizes self-reflection and development, not static labels.',
            },
          ].map((item) => (
            <div key={item.title} className="lt-card">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>

        <p>
          <strong>No 4-letter codes. No rigid boxes.</strong> Just a mirror for your current psychic configuration.
        </p>
      </LongformSection>

      <LongformSection id="learn-energy" title="The Foundation: Psychic Energy" subtitle="Libido and how it flows">
        <p>
          Jung conceived of the mind as a dynamic system powered by energy called <strong>libido</strong>{' '}
          (not strictly sexual—rather, a general life force akin to motivation, attention, or psychic vitality).
          This energy flows in characteristic patterns, creating habitual ways of engaging with reality.
        </p>

        <div className="lt-note">
          <h3>Analogy</h3>
          <p>
            Libido flows like water in a river. It naturally takes one main course—but dams or blocks
            cause floods (unconscious eruptions). Understanding your flow pattern is the first step
            toward psychological balance.
          </p>
        </div>
      </LongformSection>

      <LongformSection id="learn-attitudes" title="The Two Attitudes" subtitle="Where your energy flows">
        <p>
          Libido flows in one primary direction—this creates <strong>Extraversion</strong> or <strong>Introversion</strong>.
          This is not about being shy or outgoing—it's a deeper orientation of psychic energy.
        </p>

        <div className="lt-grid">
          <div className="lt-card">
            <h3>Extraversion: outward flow</h3>
            <p>
              Energy moves <strong>from you toward the world</strong>. The external object (people, facts, situations)
              "pulls" your attention. You adapt by engaging, influencing, exploring.
            </p>
            <p><strong>Strengths:</strong> Action-oriented, adaptable, confident in new situations.</p>
            <p><strong>Blind spots:</strong> Can overlook inner needs; may fear boredom or solitude.</p>
            <p>
              Example: At a gathering, you naturally dive in—initiate conversations, organize activities, feed off the collective energy.
            </p>
          </div>

          <div className="lt-card">
            <h3>Introversion: inward flow</h3>
            <p>
              Energy moves <strong>from the world back to you</strong>. The subject (inner impressions, values)
              takes precedence. You filter reality through your inner lens before responding.
            </p>
            <p><strong>Strengths:</strong> Deep reflection, independence, sustained concentration.</p>
            <p><strong>Blind spots:</strong> Can withdraw excessively; risk of inertia or isolation.</p>
            <p>
              Example: At a gathering, you observe first, process internally, then join selectively based on genuine interest.
            </p>
          </div>
        </div>

        <BlockQuote author="Carl Jung">
          The introvert... tries to withdraw libido from the object, as though to prevent the object from gaining power over him.
        </BlockQuote>

        <p>
          <strong>Key insight:</strong> Everyone possesses both attitudes—but one dominates
          conscious life. The opposite builds in the unconscious, creating a compensatory dynamic that shapes our growth.
        </p>
      </LongformSection>

      <LongformSection id="learn-functions" title="The Four Functions" subtitle="How you process reality">
        <p>
          We take in and evaluate experience via four basic cognitive "tools"—two pairs of natural opposites.
        </p>

        <div className="lt-grid">
          <div className="lt-card">
            <h3>Perceiving functions (irrational)</h3>
            <p>"Irrational" means "beyond reason"—they simply register data without judgment.</p>
            <p>
              <strong>Sensation.</strong> "What exists right now?" Concrete sensory data (sight, touch, body signals).
              Includes raw emotions (affect) as internal sensations.
            </p>
            <p>
              <strong>Intuition.</strong> "Where is this going?" Unconscious pattern recognition. Sudden "aha!"
              insights or perceiving hidden meanings and possibilities.
            </p>
          </div>

          <div className="lt-card">
            <h3>Judging functions (rational)</h3>
            <p>Make ordered judgments and systematic evaluations.</p>
            <p>
              <strong>Thinking.</strong> "What is true/logical?" Analyzes connections and principles.
              Focus: Objective facts, systems, "true vs. false."
            </p>
            <p>
              <strong>Feeling.</strong> "What is valuable?" Assigns worth (good/bad, like/dislike).
              This is rational valuation, not raw emotion: emotion is bodily affect, feeling is a
              systematic "yes/no" based on values.
            </p>
          </div>
        </div>

        <div className="lt-note">
          <h3>Law of opposites</h3>
          <p>
            Functions compensate each other. Strong Thinking → weak/unconscious Feeling (and vice versa).
            Strong Sensation → weak Intuition. Like left and right hands—one dominant, the other
            underdeveloped but still present (and sometimes "possesses" you under stress).
          </p>
        </div>
      </LongformSection>

      <LongformSection id="learn-eight" title="The 8 Function-Attitudes" subtitle="The building blocks of cognition">
        <p>
          Combine attitudes with functions and you get 8 distinct cognitive processes, each with its unique flavor.
          Open each one to explore its characteristics.
        </p>

        <div className="lt-acc-list">
          {functionOrder.map((code) => {
            const func = FUNCTION_DESCRIPTIONS[code];
            const shortDesc: Record<string, string> = {
              'Te': 'Efficient external systems',
              'Ti': 'Precise inner principles',
              'Fe': 'Group harmony and shared values',
              'Fi': 'Personal authenticity and deep values',
              'Se': 'Immersive present-moment reality',
              'Si': 'Detailed inner impressions and memory',
              'Ne': 'Brainstorming possibilities',
              'Ni': 'Deep foresight and symbolic vision'
            };
            return (
              <details key={code} className="lt-acc">
                <summary>
                  <FunctionEmblem code={code} className="lt-acc-glyph" />
                  <span className="lt-acc-code">{code}</span>
                  <span>
                    {func.title}
                    <span className="lt-acc-name">{shortDesc[code]}</span>
                  </span>
                </summary>
                <div className="lt-acc-body">
                  <p>{func.desc}</p>
                  <blockquote className="lt-acc-quote">"{func.quote}"</blockquote>
                  <div className="lt-pair">
                    <div>
                      <h4>Positive expression</h4>
                      <p>{func.positive}</p>
                    </div>
                    <div>
                      <h4>Shadow side</h4>
                      <p>{func.negative}</p>
                    </div>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </LongformSection>

      <LongformSection id="learn-hierarchy" title="The Function Hierarchy" subtitle="Your psychic 'stack'">
        <p>
          Functions aren't equal in influence—one dominates consciousness while others operate at different levels of awareness.
        </p>

        <div className="lt-acc-list">
          {Object.entries(STACK_POSITIONS).map(([key, position]) => (
            <details key={key} className="lt-acc" open={key === 'dominant'}>
              <summary>
                <span>
                  {position.name}
                  <span className="lt-acc-name">{position.archetype}</span>
                </span>
              </summary>
              <div className="lt-acc-body is-flush">
                <p>{position.description}</p>
                <div className="lt-pair">
                  <div>
                    <h4>Development</h4>
                    <p>{position.development}</p>
                  </div>
                  <div>
                    <h4>Shadow aspect</h4>
                    <p>{position.shadow}</p>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>

        <BlockQuote author="Marie-Louise von Franz">
          The inferior function is the ever-bleeding wound... but through it the unconscious can always come in.
        </BlockQuote>

        <p>
          <strong>Note:</strong> Archetypal labels like "Hero/Parent" are modern extensions (John Beebe)—helpful
          metaphors for understanding the stack, though not Jung's exact terminology.
        </p>
      </LongformSection>

      <LongformSection id="learn-grip" title="The Grip" subtitle="When stress takes over">
        <p>
          Under heavy pressure, the inferior function can show up in a cruder form—reactions that feel "not like you."
        </p>

        <div className="lt-note">
          <h3>What the grip can look like</h3>
          <ul className="list-diamond">
            {[
              'Reactions that feel foreign or "not like yourself"',
              'Touchiness in areas you\'re normally confident about',
              'Black-and-white thinking where you\'re usually nuanced',
              'Fixating on things you normally ignore',
            ].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <details className="lt-acc">
          <summary>Grip patterns by dominant function</summary>
          <div className="lt-acc-body is-flush">
            {Object.entries(THE_GRIP).map(([code, grip]) => (
              <div key={code} className="lt-card">
                <h3>{code}-dominant → {grip.inferiorFunction}</h3>
                <p>{grip.gripDescription}</p>
                <p><strong>Triggers:</strong> {grip.triggers}</p>
              </div>
            ))}
          </div>
        </details>
      </LongformSection>

      <LongformSection id="learn-myths" title="Common Misconceptions" subtitle="Clearing up confusion">
        <div className="lt-grid">
          {[
            { myth: '"Feeling = emotional"', truth: 'Feeling is rational value judgment. Raw emotion = sensation (affect).' },
            { myth: '"Introvert = shy"', truth: 'It\'s energy direction (inner focus), not social behavior or anxiety.' },
            { myth: '"Type is fixed"', truth: 'Your configuration changes with life experiences and conscious development.' },
            { myth: '"Better types exist"', truth: 'All types have unique strengths and blind spots. No hierarchy.' }
          ].map((item) => (
            <div key={item.myth} className="lt-card">
              <h3>{item.myth}</h3>
              <p><strong>Actually:</strong> {item.truth}</p>
            </div>
          ))}
        </div>
      </LongformSection>

      <LongformSection id="learn-individuation" title="Individuation" subtitle="The real goal of typology">
        <p>
          Jung didn't want you to "find your type" and stop there. Typology reveals <strong>one-sidedness</strong>—your
          natural strengths create corresponding blind spots.
        </p>
        <p>
          <strong>Individuation:</strong> The lifelong integration of opposites → becoming a more whole Self.
        </p>
        <ul className="list-diamond">
          <li><strong>First half of life:</strong> Develop dominant/auxiliary functions (adapt to world)</li>
          <li><strong>Second half:</strong> Reclaim tertiary/inferior, confront Shadow → wholeness</li>
        </ul>

        <BlockQuote author="Carl Jung">
          Individuation means becoming one's own self... our incomparable uniqueness.
        </BlockQuote>

        <div className="lt-note">
          <h3>Key insight</h3>
          <p>
            Your inferior function is your <strong>growth edge</strong>—the "treasure hard to attain" that holds
            the key to psychological wholeness.
          </p>
        </div>
      </LongformSection>

      <section className="lt-close" aria-labelledby="learn-close-title">
        <div className="wrap lt-close-row">
          <div>
            <h2 id="learn-close-title" className="display-2">Ready to reflect?</h2>
            <p className="lt-close-text">
              Take the assessment to discover your current cognitive profile. Use it as a mirror—not a label.
            </p>
          </div>
          <div className="lt-close-actions">
            <Link to="/assessment" className="btn btn-accent btn-lg">
              Begin your assessment
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
