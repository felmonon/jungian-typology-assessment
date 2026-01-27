import React from 'react';

export const ProblemSection: React.FC = () => {
  return (
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
  );
};
