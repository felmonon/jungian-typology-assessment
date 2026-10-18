# RESEARCH_LOG.md (append-only)

Rules: never edit or delete past entries. Negative results stay. Each entry has: date, hypothesis, setup, result, interpretation, next step.

---

## 2026-10-18 — Phase 0: survey and plan

- **Hypothesis:** none yet (planning phase).
- **Setup:**
  - Literature and record survey for Tracks A/B/C, covering roughly Oct 2024 – Oct 2026.
  - Sources: READMEs and code fetched from raw.githubusercontent.com (modded-nanogpt, qlabs-eng/slowrun incl. `tiny/train.py` and `prepare_data.py`, babylm.github.io, babylm evaluation-pipeline-2025, ltgoslo/gpt-bert, SamsungSAILMontreal/TinyRecursiveModels), plus web-search snippets of paper abstracts.
  - arxiv.org, huggingface.co, aclanthology.org, openreview.net and download.pytorch.org were blocked by this container's network policy. Numbers marked [abs] in PLAN.md come from abstracts or snippets only.
  - The container has no GPU.
- **Result:**
  - Current records:
    - Speedrun #92: 0.665 min on 8×H100 (2026-08-30).
    - Slowrun Tiny: 3.295 (#15, 2026-09-05). Limited: 3.183. Two-hour: 3.139. Unlimited: 2.987.
    - ARC Prize 2025 Kaggle: 24.0% ARC-AGI-2 (NVARC).
    - BabyLM 4 workshop: Oct 24–29, 2026.
  - Chose Track B, set up as fixed data plus fixed compute, on the Slowrun FineWeb-100M data with BabyLM zero-shot suites as held-out tests.
  - Nine hypotheses ranked. Top: a dual AR + masked-diffusion objective.
- **Interpretation:**
  - Slowrun gives the strongest public, recently tuned baseline for data-constrained training.
  - Track C from scratch is out of budget: TRM ARC takes ~3 days on 4×H100 per run.
  - Track A's frontier is now mostly H100-specific systems work.
  - The biggest risk to any positive result: gains that are just extra regularization, which the baseline's own WD/dropout re-sweep must rule out.
- **Next step:**
  - Waiting for lead approval on Q1–Q5 in PLAN.md §0: hardware and budget, GPU access, repo location, the FineWeb-vs-BabyLM deviation, and the S3 reproduction run.
  - Then Phase 1 checklist (PLAN.md §8).
