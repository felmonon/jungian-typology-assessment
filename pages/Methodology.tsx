import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSEO, PAGE_SEO } from '../hooks/useSEO';
import { LongformSection } from '../components/layout/LongformSection';
import { depthLayerMeta, depthQuestions, type DepthLayer } from '../data/depthAssessment';

const layerOrder: DepthLayer[] = ['behavioral', 'inferior', 'somatic', 'attitude'];

export const Methodology: React.FC = () => {
  useSEO(PAGE_SEO.methodology);

  const totalQuestions = depthQuestions.length;
  const layerCounts = layerOrder.map((layer) => ({
    layer,
    meta: depthLayerMeta[layer],
    count: depthQuestions.filter((question) => question.layer === layer).length,
  }));

  return (
    <div className="lt">
      <header className="wrap page-head">
        <h1 className="page-title">
          How TypeJung reads {totalQuestions} answers into a function-stack map
        </h1>
        <p className="page-lead">
          The map is built to be inspected, not believed. This page lays out exactly how the prompts
          are grouped, how the dominant and inferior functions are inferred, what the reliability
          signal means, and — just as importantly — what TypeJung does not claim.
        </p>
      </header>

      <LongformSection
        id="method-layers"
        title="Four evidence layers"
        subtitle="Rather than asking you to self-label, the assessment gathers four kinds of evidence and looks for the function pattern they agree on. Each prompt belongs to one layer."
      >
        <div className="lt-grid">
          {layerCounts.map(({ layer, meta, count }) => (
            <div key={layer} className="lt-card">
              <h3>{meta.label}</h3>
              <p>{meta.description}</p>
              <p><strong>{count} prompts</strong></p>
            </div>
          ))}
        </div>
      </LongformSection>

      <LongformSection id="method-prompts" title="How the prompts are grouped">
        <div className="lt-grid">
          <div className="lt-card">
            <h3>Scenario, not self-label</h3>
            <p>
              Each prompt describes a concrete situation and asks what you actually notice or do first —
              not which trait word you identify with. Behaviour is harder to flatter than a label.
            </p>
          </div>
          <div className="lt-card">
            <h3>Rotated options</h3>
            <p>
              Answer options are deterministically rotated per question so the same function is not always
              in the first slot. This reduces position bias without making the test feel random.
            </p>
          </div>
          <div className="lt-card">
            <h3>"None fits" is valid</h3>
            <p>
              Every prompt lets you say none of the options match. Honest gaps are more useful than a
              forced pick — and repeated "none" answers visibly lower the reliability signal.
            </p>
          </div>
        </div>
      </LongformSection>

      <LongformSection id="method-inference" title="How dominant and inferior are inferred">
        <p>
          Behavioural and somatic answers are scored across the four function channels — thinking,
          feeling, sensation, and intuition — and combined into an energy profile. The strongest
          channel becomes the candidate <strong>dominant</strong> function.
        </p>
        <p>
          The <strong>inferior</strong> is not simply the lowest bar. Jung's model puts the inferior
          opposite the dominant, and it shows up most clearly under stress. TypeJung weights the
          inferior-detection layer most heavily and cross-checks it against the dominant: when your
          stress answers and your everyday energy point at the same opposing channel, confidence is
          high. When they disagree, the edge is resolved structurally and the tension is reported as a
          note rather than hidden.
        </p>
        <p>
          Attitude direction (introverted / extraverted) then orients the stack into specific
          function-attitude codes such as Ni or Te. When the introversion–extraversion split is within
          a few points, the result is reported as <strong>balanced</strong> — a working hypothesis, not
          a fixed identity claim.
        </p>
        <div className="lt-note on-night">
          <h3>The chain, in order</h3>
          <ul className="list-diamond">
            <li>Score channels from behaviour + somatic evidence</li>
            <li>Take the strongest channel as candidate dominant</li>
            <li>Detect the inferior from stress triggers, opposite the dominant</li>
            <li>Orient with attitude direction into function-attitude codes</li>
            <li>Keep all eight functions visible so close signals stay inspectable</li>
          </ul>
        </div>
      </LongformSection>

      <LongformSection
        id="method-reliability"
        title="What the reliability signal means"
        subtitle={'Every result carries a consistency label — High, Moderate, or Exploratory — that reflects how much the four layers agreed with each other, not how "good" your type is.'}
      >
        <div className="lt-grid">
          <div className="lt-card">
            <h3>Raises it</h3>
            <p>
              Behavioural, stress, somatic, and attitude evidence converging on the same dominant–inferior axis.
            </p>
          </div>
          <div className="lt-card">
            <h3>Lowers it</h3>
            <p>
              Layers pointing at different functions, lots of "none" answers, or a near-even attitude split.
            </p>
          </div>
          <div className="lt-card">
            <h3>How to use it</h3>
            <p>
              Treat an Exploratory result as a prompt to re-read the evidence, not a verdict to defend.
            </p>
          </div>
        </div>
      </LongformSection>

      <LongformSection id="method-claims" title="What TypeJung does not claim">
        <ul className="list-diamond is-open">
          <li>It is educational self-reflection, <strong>not</strong> a clinical or diagnostic assessment.</li>
          <li>It does not measure intelligence, mental health, fit for a job, or compatibility.</li>
          <li>A function-stack code is a working hypothesis, not a fixed identity or a verdict.</li>
          <li>It is an independent Jungian tool, not the official MBTI® instrument or a substitute for it.</li>
          <li>Balanced or low-confidence results are reported as such instead of forcing a winner.</li>
          <li>No result here should be used to make medical, hiring, or relationship decisions.</li>
        </ul>
      </LongformSection>

      <section className="lt-close" aria-labelledby="method-close-title">
        <div className="wrap lt-close-row">
          <div>
            <h2 id="method-close-title" className="display-2">See the method on your own answers</h2>
            <p className="lt-close-text">
              The free map shows every layer and the reliability signal before any optional paid report.
            </p>
          </div>
          <div className="lt-close-actions">
            <Link to="/assessment" className="btn btn-accent btn-lg">
              Build my free map
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link to="/sample-report" className="text-link">
              See a full sample report
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
