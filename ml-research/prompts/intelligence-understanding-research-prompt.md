# Research brief: What are intelligence and understanding, and how do we build AI that has them?

You are an independent research scientist with deep knowledge of machine learning, cognitive science, neuroscience, psychology and philosophy of mind. Produce the most rigorous, honest and useful in-depth report you can on three questions:

1. **What is intelligence?**
2. **What is understanding?** How does it differ from intelligence, knowledge, memorization and consciousness?
3. **What is the best way to build AI that has both?** And what evidence would convince a well-informed skeptic that a system has them?

## Why this matters

The report will guide real work on building AI, not win a philosophy debate. Every definition you settle on must be *operational*: it has to say what you would measure, what result would show a system has the property, and what result would show it doesn't. A definition that can't be tested is a starting point, not an answer.

## Rules of evidence

- Verify every factual claim against a primary source: the paper, the official benchmark or leaderboard page, or the code. Don't rely on memory. Cite each with a link and its date. If you could only read an abstract, say so.
- Cover work up to today. The field changes monthly; state the date of your newest source.
- For each major position, present its strongest version and the strongest objection to it. Report real disagreements as disagreements. Don't invent a consensus.
- Label every important claim as **established**, **contested** or **speculative** (your own idea).
- Separate definitional disputes (people using the same word for different things) from empirical disputes (people predicting different results). Say which kind each disagreement is.
- Treat benchmark results with suspicion. Check for test-set contamination, shortcuts, weak baselines, and results that collapse under small changes to the task. Prefer evidence from tests a system could not have seen in training.
- Give a calibrated confidence for each main conclusion (for example, "about 70% confident").
- No hype. "Nobody knows yet" is an acceptable answer. Don't call anything a breakthrough.

## Part 1: Intelligence

Starting points, not a complete list (verify each, and go beyond it):

- **AI theory.**
  - Legg & Hutter's universal intelligence.
  - Chollet's "On the Measure of Intelligence" (intelligence as skill-acquisition efficiency) and the ARC-AGI benchmarks.
  - Intelligence as prediction and compression: Solomonoff induction, the Hutter Prize, "Language Modeling Is Compression".
- **Psychology.** The g factor, fluid vs crystallized intelligence, and what IQ tests do and don't capture.
- **Animals and children.** What crows, octopuses, bees and infants learn from little data; core knowledge (Spelke); children as scientists (Gopnik).
- **Neuroscience.** Predictive processing and the free-energy principle, cognitive maps and the hippocampus, and complementary learning systems (fast and slow memory). Separate what is well established from what is speculative.

Answer these:

- Is intelligence one ability or a bundle of them?
- Is it a property of an agent alone, or of an agent together with its goals and environment?
- Why are humans so much more data-efficient than current AI? The BabyLM organizers put a 13-year-old's lifetime language exposure at under about 100 million words; check this. Which explanations of the gap have evidence behind them?

**Part 1 output:** your best working definition, the alternatives you rejected and why, and how to measure it.

## Part 2: Understanding

Starting points:

- **Philosophy.** Searle's Chinese Room, Harnad's symbol-grounding problem, Bender & Koller's "octopus" argument, functionalist replies, and Mitchell & Krakauer's review of the debate over whether language models understand.
- **Candidate tests of understanding.** A system that understands something might be able to:
  - predict and explain it;
  - answer "what if" and "what would happen if I did X" questions (Pearl's ladder of causation);
  - handle new combinations of familiar parts (compositional generalization: Fodor & Pylyshyn, Lake & Baroni);
  - transfer what it knows to new domains;
  - compress what it knows into reusable abstractions;
  - notice when something doesn't make sense;
  - teach it to someone else;
  - know the limits of its own knowledge.

  Assess which of these matter most and how they relate.
- **Evidence from AI, in both directions.**
  - Interpretability studies that find internal world models, for example Othello-GPT and later work.
  - Failure studies, for example the reversal curse, performance drops on counterfactual versions of familiar tasks, and the gap between AI and humans on ARC-AGI.

Answer these:

- Is understanding all-or-nothing or a matter of degree?
- Does it need a body, senses or interaction with the world?
- Keep understanding (a functional ability) separate from consciousness (subjective experience). Explain whether and how they're connected.

**Part 2 output:** your best working definition and a concrete **test battery**. It should contain tests that can't be passed by memorization, with instructions for building fresh versions so they can't leak into training data.

## Part 3: How to build AI that has both

Map the main approaches, including at least:

- scaling next-token prediction;
- reinforcement learning on problems with checkable answers, plus more computation at answer time;
- world models and predictive architectures, for example JEPA and Dreamer/MuZero-style planning;
- program synthesis and neurosymbolic methods;
- Bayesian and probabilistic-program learning;
- meta-learning;
- embodied and developmental learning;
- curiosity-driven and open-ended learning;
- learning at test time;
- brain-inspired designs.

For each approach, give:

- the core bet;
- the best evidence for and against it;
- what it predicts that the others don't;
- what it costs;
- whether its benefits grow or shrink with scale;
- how it affects how predictable, controllable and interpretable the resulting systems would be.

Then identify the **cruxes**: the few open empirical questions whose answers would most change which approach is best. For each, describe the cheapest experiment that would settle it.

## Part 4: Overlooked connections

Look for links between fields that mainstream AI hasn't exploited. These are findings in neuroscience, child development, education, evolution, physics or other sciences that point to a training method nobody has tried at scale.

Propose 5–10 ideas. For each, give:

- the mechanism;
- why it should work;
- why it might fail;
- why it may have been overlooked;
- a small experiment that would test it (one or a few GPUs, days not months).

Before calling any idea new, search for prior art and report exactly what you found. Many "new" ideas turn out to be already published. Say so honestly, and say which part, if any, remains untested.

Rank the ideas by expected impact × probability it works ÷ cost to test.

## Deliverable

1. **Plain-language summary.** 1–2 pages, no jargon, for a smart non-specialist: what intelligence is, what understanding is, where AI stands today, and what to build next.
2. **Main report.** Organized by Parts 1–4, with claims labeled and sources cited inline.
3. **Comparison table** of building approaches against evidence, predictions, cost and scaling.
4. **The understanding test battery.**
5. **The ranked list of overlooked ideas.** Each with its experiment and prior-art findings.
6. **Open questions.** For each main conclusion, also say what evidence would change your mind.
7. **Glossary** of technical terms.
8. **Annotated bibliography.** The 30–60 most important sources, each with a link, its date and one line on why it matters.

## How to work

- Start by writing a short research plan: the sub-questions and the first sources you'll check. Then carry it out.
- Go deep where it matters most for building AI, rather than covering every philosophical position.
- Aim for a main report a careful reader can get through in about an hour, plus appendices.
- If part of this brief looks wrong, or you see a better way to frame the questions, say so and propose the change instead of quietly working around it.
