// Shared content for all three design directions, so they can be compared
// fairly. Product facts come from the live app (pages/Home.tsx,
// pages/Results.tsx, data/pricing.ts, data/discount.ts,
// components/brand/PatternLens.tsx, data/depthAssessment.ts).
//
// The sample result was produced by running the real scoring code
// (utils/depthScoring.ts calculateDepthResults and
// utils/depthCompatibility.ts) on a scripted set of illustrative answers.
// It is not a real person's result.
window.TJ = {
  home: {
    kicker: 'Free Jungian cognitive functions test',
    headline: 'See how you notice, decide, and react under stress.',
    sub: 'Answer 42 questions about everyday situations. Your free map shows the eight cognitive functions Jung described: the one you lead with, the ones that support it, and the one that tends to trip you up under pressure.',
    mbtiLine: 'If your MBTI result keeps changing, this looks at the pattern underneath the four letters.',
    cta: 'Get my free map',
    secondary: 'How it works',
    reassurance: 'Free results. No signup. No card.',
    time: '42 questions · 20–25 minutes',
    timeNote: 'Take your time. Your progress saves as you go.',
    getsTitle: 'What your free map shows',
    gets: [
      ['What you lead with', 'The way of paying attention or deciding that comes most naturally to you.'],
      ['What supports it', 'The functions that back up your lead, and how strongly each shows up.'],
      ['Your stress edge', 'The least developed function, and the pattern that tends to appear when you are under pressure.'],
    ],
    sampleQuestion: {
      label: 'A real question from the assessment',
      prompt: 'You walk into a room where two friends are having a tense conversation. What do you notice first?',
      options: [
        'Whether the argument is logically consistent and where the claims break down',
        'Who is being hurt and what the emotional temperature of the room feels like',
        'Who is standing where, their posture, facial tension, and the physical details in the room',
        'What the fight is really about underneath and where the pattern is heading',
      ],
      note: 'There are no right answers. Pick what sounds most like you.',
    },
    reportLine: 'An optional Insight report goes deeper for CA$7, paid once. Your map is free either way.',
  },

  sampleLabel: 'Sample result',
  sampleNote: 'Illustrative answers run through the real scoring. Not a real person.',

  result: {
    date: 'Oct 14, 2026',
    title: 'A clearer view of your pattern.',
    intro: 'Your result is a starting point for reflection. Compare what you read with what you notice in everyday life.',
    dominant: {
      code: 'Ni', name: 'Introverted Intuition', verb: 'See the thread',
      plain: 'Follow the underlying meaning in what you notice. Check your interpretation against new information.',
    },
    energyMap: 'Your energy flows most strongly through introverted intuition. Feeling appears as the supporting channel, with thinking available but less central. Sensation carries the least conscious energy and marks the developmental edge.',
    stack: [
      { role: 'Dominant', plainRole: 'What you lead with', code: 'Ni', name: 'Introverted Intuition', verb: 'See the thread', desc: 'Follow the underlying meaning in what you notice.', family: 'intuition' },
      { role: 'Auxiliary', plainRole: 'What supports it', code: 'Fe', name: 'Extraverted Feeling', verb: 'Find connection', desc: 'Attend to the emotional space between people.', family: 'feeling' },
      { role: 'Tertiary', plainRole: 'What you are developing', code: 'Ti', name: 'Introverted Thinking', verb: 'Find the logic', desc: 'Look for an explanation that holds together.', family: 'thinking' },
      { role: 'Inferior', plainRole: 'Your stress edge', code: 'Se', name: 'Extraverted Sensation', verb: 'Meet the moment', desc: 'Engage with what is happening around you.', family: 'sensation' },
    ],
    // All eight values, as the live "Function map" tab derives them.
    eight: [
      { code: 'Ni', name: 'Introverted Intuition', verb: 'See the thread', score: 61, family: 'intuition', dir: 'in' },
      { code: 'Fe', name: 'Extraverted Feeling', verb: 'Find connection', score: 21, family: 'feeling', dir: 'out' },
      { code: 'Ne', name: 'Extraverted Intuition', verb: 'Open possibilities', score: 21, family: 'intuition', dir: 'out' },
      { code: 'Ti', name: 'Introverted Thinking', verb: 'Find the logic', score: 9, family: 'thinking', dir: 'in' },
      { code: 'Se', name: 'Extraverted Sensation', verb: 'Meet the moment', score: 9, family: 'sensation', dir: 'out' },
      { code: 'Fi', name: 'Introverted Feeling', verb: 'Know what matters', score: 7, family: 'feeling', dir: 'in' },
      { code: 'Te', name: 'Extraverted Thinking', verb: 'Make it work', score: 4, family: 'thinking', dir: 'out' },
      { code: 'Si', name: 'Introverted Sensation', verb: 'Draw on experience', score: 4, family: 'sensation', dir: 'in' },
    ],
    eightNote: 'These values are derived from four function channels and your attention direction. They help you compare the pattern; they are not eight independent psychological measurements.',
    attitude: { introverted: 83, extraverted: 17, summary: 'Introverted energy is stronger in this result (83%).' },
    consistency: { label: 'High', note: 'Behavioral, inferior, somatic, and attitude signals were internally consistent.' },
    edgeTitle: 'Notice your growth edge.',
    edge: 'Your challenge is not to see more possibilities. It is to land in the body, finish one concrete thing, and stay with what is present before moving to what could be.',
    stress: 'Complexes are most likely to capture you through the body: symptoms, appetite, exhaustion, comfort, sensory irritation, and concrete follow-through. The body becomes the doorway where neglected reality asks for attention.',
    practiceTitle: 'What to notice this week',
    practice: 'Do one concrete regulating action: feet on the floor, slower exhale, food or water, then one finishable task under ten minutes.',
    offer: {
      title: 'See your Ni–Se tension in everyday life.',
      body: 'Your map points to extraverted sensation as a growth edge. Explore what a report can help you notice in stress, relationships, and work.',
      name: 'Insight report',
      price: 'CA$7',
      terms: 'One time · No subscription · 7-day refund',
      items: [
        'Ten personalized, AI-generated sections',
        'Stress and recovery reflections',
        'Relationship, work, and growth prompts',
        'The Function Stack in Depth guide (PDF)',
      ],
      cta: 'Add the Insight report · CA$7',
      notReadyTitle: 'Not ready to decide?',
      notReady: 'Email yourself a link back to this report, with your report code, and come back when you want it.',
      notReadyCta: 'Email my link',
    },
  },
};
