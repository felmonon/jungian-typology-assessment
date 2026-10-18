# PLAN.md — Data-efficient pretraining at fixed compute

Status: **Phase 0 complete, waiting for research-lead approval.** No GPU work has started.
Last updated: 2026-10-18. Read this file and `RESEARCH_LOG.md` at the start of every session.

---

## 0. Decisions needed from the research lead (blocking)

| # | Question | Why it blocks | My default if you just say "go" |
|---|---|---|---|
| Q1 | **Hardware and budget.** The brief still has template placeholders: `[e.g. 1× RTX 4090, 24 GB VRAM]`, `[N] GPU-hours per week for [N] weeks`, and the approval threshold `[X] GPU-hours`. | Every cost below depends on it. | Plan assumes 1× RTX 4090 (24 GB). Every run expected to exceed 4 GPU-h gets asked about first. |
| Q2 | **Where do GPU runs happen?** This session's container has **no GPU** (4 vCPU, 15 GB RAM, ~30 GB free disk, no `nvidia-smi`, no torch). Its network policy blocks arxiv.org, huggingface.co, download.pytorch.org, openreview.net and aclanthology.org. Only pypi and raw.githubusercontent.com are reachable. | Phase 1 needs a GPU plus Hugging Face access (FineWeb, BabyLM eval data, the OOD eval sets). | I need SSH/shell access to the GPU box, or an environment with a GPU and Hugging Face network access. |
| Q3 | **Repository.** The only repo attached to this session is `felmonon/jungian-typology-assessment` (the TypeJung web app). I've kept all research files under `ml-research/` on branch `claude/clever-heisenberg-rj68x4` so nothing touches the app. | One commit per experiment would clutter the product repo. Run logs and configs don't belong there. | Move `ml-research/` to a dedicated repo, e.g. `felmonon/data-efficient-lm`. Never merge it into the app's `main`. |
| Q4 | **Approve a deviation from Track B as written.** Train on the fixed **100M-token FineWeb sample from NanoGPT Slowrun** (≈75M words, so still human-scale), not the BabyLM corpus. Keep the BabyLM zero-shot suite as held-out understanding tests. | Changes the training data and the reference baseline. | Use the Slowrun data (rationale in §1.3). If you prefer the BabyLM corpus, §2.4 gives the fallback. |
| Q5 | **Approve the Phase 1 reproduction run.** One run of the published Slowrun *Tiny-track* record config: about 10–18 h on a 4090 (estimate, measured before committing). | Almost certainly above your `[X]` threshold. | Measure throughput on ~100 steps first, then ask again with a measured number. |

---

## 1. Track choice

### 1.1 Recommendation

**Track B (data efficiency), set up as fixed data plus fixed compute:**

> Given a fixed set of unique training tokens D and a fixed training-compute budget C on the same GPU, find a training method that gets lower held-out loss than a strong, community-tuned baseline. It must also generalize better to text and tasks the model never trained on.

"Learns more" is measured as lower held-out loss at equal D and equal C. It's also reported as an **effective-data multiplier**: how many more unique tokens the baseline recipe would need to match. "Generalizes better" is measured as loss on out-of-distribution text, plus the BabyLM zero-shot suites of minimal-pair and world-knowledge tests.

### 1.2 Survey: state of each track (verified 2026-10-17/18)

Verification key:
- **[repo]** — read directly from the project's README or code on GitHub.
- **[abs]** — abstract or search-engine snippet only. Full papers were unreachable from this container, so numbers from inside the papers are **not** independently checked.

**Track A — compute efficiency (modded-nanogpt speedrun)**
- Task: reach ≤3.28 FineWeb val loss on 8×H100 as fast as possible.
  - Current record: **#92, 0.665 min, 2026-08-30** (@DevenPzak). It uses sampled softmax, full FP8 MLP, an 84.6M-row hashed n-gram table, the "ANVIL" optimizer stack and full CUDA-graph capture.
  - It needs "under 330M tokens". The llm.c baseline took 45 min and 10B tokens.
  - Records must show p<0.01 that mean loss is ≤3.28. **[repo]**
- GPT-2 Medium track (2.92 target): **#18, 17.35 min, 2025-12-31**. **[repo]**
- There is also an "optimization track": minimize steps at fixed architecture, data and batch size. **[repo]**
- Transfer evidence: Muon came out of this speedrun. Moonshot then scaled it (MuonClip) to Kimi K2: 1T total / 32B active parameters, 15.5T tokens, self-reported. **[abs]**
- Counter-evidence: Wen et al. 2025 (ICLR 2026, arXiv 2509.02046) compared ten optimizers with careful tuning. Matrix-optimizer speedups over AdamW **shrink from 1.4× at 0.1B to 1.1× at 1.2B parameters**, and many claimed 1.4–2× gains came from weak AdamW baselines. **[abs]**

**Track B — data efficiency**
- **NanoGPT Slowrun** (Q Labs): 100M FineWeb tokens, lowest val loss wins. Tracks are capped by compute. **[repo]**
  - *Tiny* (8×H100 ≤15 min): baseline 3.428 (2026-03-02) → **record #15: 3.295 (2026-09-05)**, "first-order meta-gradient every step on the MLP matrices".
  - *Limited* (≤1 h): 3.402 → **3.183**.
  - *Two-hour*: **3.139**.
  - *Unlimited*: **2.987** (ensembles plus snapshot ensembles; 80 h on 5×8×H100).
  - The Tiny record stacks: Muon/NorMuon-style optimizer, WD ≈0.8 → 0.93 schedule, dropout 0.1, 15 epochs, per-epoch document shuffling, U-Net skips, attention gating, XSA, SWA/EMA, MTP, 2× recurrence and the meta-gradient step.
  - The code falls back to SDPA when FA3 is unavailable, so it should run on non-Hopper GPUs (unverified). **[repo]**
- **Kim, Kotha, Liang, Hashimoto 2025** ("Pre-training under infinite compute", ICLR 2026, arXiv 2509.14786). **[abs]**
  - Optimal weight decay in the data-constrained regime is ~**30×** standard.
  - Combining epoching, regularization, parameter scaling and ensembling gives **5.17× data efficiency at 200M tokens**.
  - An ensemble distilled into an 8× smaller student keeps 83% of the benefit.
  - They evaluate by the scaling-law asymptote, not by fixed compute.
- **q0** (Mandal et al. 2026, arXiv 2606.03938, Q Labs/Princeton): cyclic LR/WD, chain distillation and a learned ensemble prior. A 1.8B model on 100M tokens matches a 256-epoch ensemble in ~56 epochs; they claim ~12.9× cumulative data efficiency in the Slowrun setting. **[abs]**
- **Diffusion vs AR under data constraints** (Prabhudesai et al., NeurIPS 2025, arXiv 2507.15857): masked diffusion beats AR once compute passes a critical threshold. They attribute this to implicit augmentation over token orderings. **[abs]**
- **Dual-objective LMs** (Samuel & Charpentier, ICLR 2026, arXiv 2512.14549): 50 models trained with AR plus masked-diffusion objectives. The mix beat either single objective at **every** repetition level tested, up to 128 repetitions. **[abs]**
- **Repetition baseline** (Muennighoff et al., NeurIPS 2023 / JMLR 2025): up to ~4 epochs is nearly as good as fresh data; returns fall toward zero after that. **[abs]**
- **Dropout:** Liu, Bauer, Manning 2025 (Findings ACL) say drop dropout in *single-epoch* pretraining. The regime is the opposite of ours; Slowrun keeps dropout 0.1. **[abs]**
- **BabyLM.** **[repo]** for the site and eval README, **[abs]** for findings.
  - The 4th edition (2026) runs at EMNLP 2026, Budapest, Oct 24–29. Detoxified 10M-word Strict-Small and 100M-word Strict corpora. Max 10 epochs for challenge entries. New MultiLingual track. Eval pipeline: `babylm-org/babylm-eval`.
  - Text tasks across 2025/26: BLiMP, BLiMP-supplement, EWoK, entity tracking, COMPS, WUG (adj/past), reading-time alignment, AoA and (Super)GLUE fine-tuning.
  - 2024 winner and current official baseline: GPT-BERT (hybrid MLM+CLM).
  - 2025 findings: new objectives/architectures did best; a masked-diffusion LM won an award; FLOPs and score were not fully correlated.
  - 2026 self-reported entries show the leaderboard aggregate isn't comparable across entries with missing tasks. Example: GPT-2 baseline overall 37.38 vs GPT-BERT-causal 28.46, despite BLiMP 65.23 vs 71.66.
- Why this regime matters at scale: Villalobos et al. (Epoch) project that the stock of public human text (~300T tokens) will be fully used **between 2026 and 2032** (median 2028). Later commentary pushes the start of that window to ~2028. **[abs]**

**Track C — reasoning**
- **ARC Prize 2025.** Kaggle ARC-AGI-2 private set at $0.20/task: **NVARC 24.0%**, ARChitects 16.5%, MindsAI 12.6%. Grand Prize unclaimed. The 1st-place paper award went to TRM. **[abs]**
- **TRM** (7M params): ~45% ARC-AGI-1, ~8% ARC-AGI-2. Its own README lists **~3 days on 4×H100** per ARC run and ~18 h on one L40S for Sudoku. **[repo]**
- ARC Prize's HRM analysis found the outer refinement loop, not the hierarchy, drove performance (32% ARC-AGI-1 / 2% ARC-AGI-2 semi-private). **[abs]**
- **RL post-training of small open models:** the "spurious rewards" gains on Qwen2.5-Math are largely MATH-500 contamination. Qwen2.5-Math-7B completes 54.6% of truncated MATH-500 problems exactly; on a post-cutoff benchmark, random rewards gave no reliable gain (arXiv 2507.10532). **[abs]**

### 1.3 Why Track B in this form

1. **It fits the mission.** Holding *both* unique data and compute fixed measures "learn more from less data" at equal compute directly. No extrapolation needed.
2. **The benefit should grow with scale.** If public text runs out before compute does, the frontier moves into many-epoch, data-bound training. Methods that trade compute for data efficiency become more valuable as compute per unique token grows. Slowrun's compute-capped tracks and Kim et al. both show held-out loss keeps falling with compute here.
3. **A strong, public, recently tuned baseline exists.** Slowrun Tiny has 15 records in 7 months. That defends against "weak baseline" artifacts better than anything I could tune alone. It also gives a published number (3.295) to reproduce.
4. **Scales down to one GPU, and back up to the public setting.** Screening uses a ~1/37-compute version; the final check runs the exact public Tiny-track setting.
5. **Low-noise primary metric** (held-out loss), plus held-out generalization tests (OOD loss, BabyLM suites).

**Why FineWeb-100M over the BabyLM corpus (Q4):**
- Slowrun has the strongest tuned baseline and published numbers.
- Web text matches what larger models train on, which makes transfer more plausible.
- BabyLM's headline aggregate is unreliable (see above).
- BabyLM's minimal-pair evaluations run on any causal LM, so we keep them as generalization tests.

**Why not A:**
- The speedrun frontier is now mostly H100-specific systems work: FP8, FA3, CUDA graphs. Its objective is wall-clock, which filters out exactly the compute-for-data trades this mission cares about.
- Small-scale optimizer and architecture gains are known to shrink with scale (Wen et al.).
- Still the best option if you care about pure compute efficiency. Speedrun tricks have transferred before (Muon).

**Why not C:**
- From-scratch ARC costs ~12 H100-days per TRM run, which is infeasible for 3 seeds × 2 sizes on one consumer GPU.
- ARC eval is coarse: 120–400 tasks, so 1 task ≈ 0.25–0.8 pp.
- Small-model RLVR results are dominated by base-model priors and contamination, and rarely say much about scale.

---

## 2. Baseline to reproduce

### 2.1 Anchor (Phase 1, approval-gated): Slowrun Tiny-track record #15

- Code: `qlabs-eng/slowrun`, `tiny/train.py` at commit `45bf3fdf229c2079f276142073838b924a333ba1`. Data from `prepare_data.py`, which is hash-locked: FineWeb `sample-10BT` streamed, first 10M tokens → val, next 100M → train, GPT-2 tokenizer.
- Config (defaults): 16 layers, d=1024, ~300M total parameters, seq 2048, 524,288 tokens/step, 15 epochs, dropout 0.1, WD schedule 0.8 → 0.93, SWA over the last 4 epochs, MTP (3 tokens, annealed), 2× recurrence schedule, meta-gradient step.
- On one GPU: same global batch via gradient accumulation (`TOTAL_BATCH_SIZE % tokens_per_fwdbwd == 0`). Same steps and tokens, so loss should match up to nondeterminism. Wall-clock won't match.
- **Pass criterion:** final official-val loss within **±0.005 of 3.295**. Slowrun publishes no seed spread; the ±0.005 tolerance is my estimate and gets replaced by measured S1 noise scaled up. If it misses, run seed 2 before debugging.
- Known risks:
  - The fused FP8 softcapped-CE kernel (`cuda_kernels`) may not compile on non-Hopper GPUs. Fallback: plain bf16 CE with MTP, documented as a deviation.
  - FA3 isn't available off Hopper, so the SDPA fallback is slower.
  - The `kernels` package downloads from the Hugging Face Hub.

### 2.2 Screening baseline: "S1" (scaled-down Tiny)

- Data: the first 12.5M tokens (whole documents) of the Slowrun train stream.
- Model: 8 layers, d=512, ~27M-parameter trunk, ≈ the Tiny ratio of trunk params to unique tokens (≈2.2 vs 2.06). 15 epochs.
- ≈7.9e16 training FLOPs, ≈1/37 of Tiny. Estimated **~0.5 h on a 4090** including eval.
- Code is the anchor's code with only scale arguments changed. All record features start on.
- **Tuning effort for the baseline (fixed before any hypothesis run):**
  - Ablate each record feature at S1 and keep only those that help: ~10 runs.
  - Sweep LR × WD × dropout × (model width at fixed FLOPs) × batch: ~30 runs.
  - Then 5 seeds at the chosen point to measure the noise floor σ for every metric.
- Rule: **the baseline gets at least as many tuning runs as the most-tuned hypothesis.** Any method that acts as a regularizer is compared against a baseline whose WD and dropout were re-swept alongside it.

### 2.3 Scale ladder (Phase 3)

| Scale | Unique tokens | Model (trunk) | Train FLOPs (est.) | 4090 time (est.) |
|---|---|---|---|---|
| S1 | 12.5M | 8L × 512 (~27M) | 7.9e16 | ~0.5 h |
| S2 | 25M | 10L × 640 (~51M) | ~2.1e17 | ~1.2 h |
| S3 (= public Tiny) | 100M | 16L × 1024 (~206M) | ~3–4e18 | ~10–18 h |

Effects must **hold or grow** from S1 → S2 → S3. If they shrink, the report says so.

### 2.4 Fallback if Q4 is declined

Train on BabyLM 2026 Strict-Small (10M words) and Strict (100M words), with the 10-epoch cap. Baseline: GPT-BERT (`ltgoslo/gpt-bert`, the official baseline), tuned by the same rules. Same hypotheses and evals, but the primary metric becomes BabyLM dev-split zero-shot accuracy plus held-out CLM loss on a BabyLM dev slice.

---

## 3. Evals

All eval sets are disjoint from training. **Dev data drives every decision. The official val set is touched only (a) to verify the Phase 1 reproduction and (b) for final Phase 4 numbers.**

1. **Primary (decision metric):** mean next-token loss (nats/token, canonical GPT-2 tokenization) on a **dev split**: 5M tokens of whole FineWeb `sample-10BT` documents taken from the stream after Slowrun's 110M val+train tokens. Check for exact-duplicate overlap with train/val by document hash. Also report train–dev gap.
2. **Effective-data multiplier:** fit the baseline curve L(D) = E + B·D^-β at fixed epochs for D ∈ {3.125, 6.25, 12.5, 25}M, 2 seeds each. Convert a method's loss into the D the baseline would need. Bootstrap CI over seeds. This is a reporting aid; the claim stays Δloss at equal D and C.
3. **OOD loss** (never trained on): WikiText-103 test, a PG-19 test slice (~1M tokens), a C4-validation slice (~1M tokens). Report each separately.
4. **Held-out understanding (BabyLM 2026 zero-shot, `babylm-org/babylm-eval`):** BLiMP (filtered), BLiMP-supplement, EWoK, COMPS, entity tracking, WUG-adj/past. Fast splits during development, full splits only for final numbers. Report per task, **never the aggregate**.
5. **Downstream zero-shot (S2/S3 only, lm-eval-harness):** LAMBADA, HellaSwag, ARC-Easy, PIQA. These are expected near chance at S1. They're reported only where an effect beats measured seed noise.
6. **Compute accounting for every run:**
   - Analytic training FLOPs, including extra forwards (teachers, recurrence) and attention.
   - Measured wall-clock on the same GPU, and peak memory.
   - **Equal compute = FLOPs matched within ±3%** by adjusting steps. Wall-clock is reported too. Any method more than 10% slower at equal FLOPs is flagged, and also compared at equal wall-clock.

**Statistics.** Every claim reports mean ± std over n seeds, the effect in σ_seed units, a Welch t-test and a bootstrap 95% CI. A difference smaller than seed noise is reported as "no effect".

---

## 4. Hypotheses (ranked by expected gain × plausibility ÷ cost)

How the score works:
- **G (expected gain):** 1 means under 1σ at S1; 3 means about 3σ, or ~1.3× effective data; 5 means 10σ or more, or 2× or more effective data.
- **P (plausibility):** my probability that a gain of at least 2σ survives on top of the *tuned* S1 baseline.
- **C (cost):** GPU-hours for the S1 screen plus implementation risk, on a 1–5 scale.
- **Score = G·P/C.** The scores are subjective and written down now so they can be checked later.

| Rank | ID | Hypothesis | G | P | C | Score |
|---|---|---|---|---|---|---|
| 1 | H1 | Dual objective: AR + masked-diffusion loss on a fraction of sequences | 4 | 0.45 | 1.5 | 1.20 |
| 2 | H2 | Input-token corruption: corrupt inputs, keep clean targets (cheap augmentation; also H1's ablation) | 2 | 0.35 | 1 | 0.70 |
| 3 | H7 | Fixed-compute ensemble: k=2 half-size models, probability averaging, matched train and inference FLOPs | 3 | 0.30 | 1.5 | 0.60 |
| 4 | H9 | Meta-gradient sign and target: flip the record's descent step to an ascent (SAM-like) step, or move it beyond MLPs | 1.5 | 0.20 | 0.5 | 0.60 |
| 5 | H4 | Online self-distillation from the EMA teacher (KL to EMA logits) | 3 | 0.35 | 2 | 0.53 |
| 6 | H6 | Loss-prioritized document replay across epochs (more compute on hard docs) | 2 | 0.20 | 1 | 0.40 |
| 7 | H3 | Stochastic sub-tokenization augmentation (StochasTok-style splits, annealed to canonical) | 3 | 0.25 | 2 | 0.38 |
| 8 | H5 | NextLat auxiliary loss: predict own next hidden state | 2.5 | 0.20 | 2 | 0.25 |
| 9 | H8 | Adaptive recurrence: per-sequence or per-token pass count | 3 | 0.20 | 4 | 0.15 |

**H1 — Dual AR + masked-diffusion objective.**
- **Mechanism:** a masked, any-order objective acts as implicit data augmentation, and repeated data is where that should pay. Supported by Samuel & Charpentier (ICLR 2026, best at every repetition level), Prabhudesai et al. (NeurIPS 2025) and GPT-BERT (BabyLM 2024 winner). I found no Slowrun record that uses it.
- **Implementation:**
  - A fraction r ∈ {0.125, 0.25, 0.5} of sequences per step use masked-next-token prediction, with mask rate t ~ U(0,1), an unused padded-vocab id as [MASK] and bidirectional attention. The rest stay causal.
  - Equal tokens per step, so ~equal FLOPs.
  - Evaluated on **AR loss only**.
- **Falsified if:** no gain of at least 2σ at S1, or the gain disappears once the baseline's WD and dropout are re-swept (it would then just be "more regularization").
- **Ablations:**
  - Causal attention with masked inputs (= H2), to test whether bidirectionality matters or noise alone does.
  - Mask-rate distribution.
  - r = 0.
- **Dose-response:** the gain should grow with epochs. Test at 8 vs 15 vs 30 epochs at S1.

**H2 — Input-token corruption.**
- Replace a fraction q ∈ {2, 5, 10}% of input tokens with [MASK] or a random token, keeping clean targets. Optionally anneal q to 0.
- Cheapest augmentation in the family; doubles as H1's mechanism ablation.
- Falsifier as H1.

**H7 — Fixed-compute ensemble.**
- Kim et al. and q0 find ensembles beat a single model at the loss asymptote. Untested at *small fixed* compute, where a single model may win.
- Train k=2 models at ~half FLOPs each (narrower trunk, so inference FLOPs ≈ one model) and average probabilities. Compare to the tuned single model at equal total training FLOPs.
- Mostly a replication of a claim relevant to scale. The ensemble-vs-single gap is expected to widen with compute; test S1 vs S2.

**H9 — Meta-gradient sign and target.**
- The record's step is θ_P ← θ_P − η·g/‖g‖ on half the batch, then the update gradient comes from the other half. That's first-order-MAML-like.
- Variants:
  - Ascent sign (+η, SAM-like).
  - All matrices instead of MLP only.
  - η ∈ {0.25, 0.5, 1.0}.
- Nearly free, since these are flags in the existing code. Mostly tells us *why* the record works; low prior of beating it.

**H4 — Online EMA self-distillation.**
- Add α·KL(p_EMA ‖ p_student) at temperature τ on a fraction s of sequences.
- The teacher forward costs ≈ +s·33% FLOPs, so the method gets fewer steps at equal FLOPs.
- Evidence: Slowrun unlimited chain distillation (3.166 → 3.126), q0 chain distillation, born-again networks. Not yet tested inside a single compute-capped run.

**H6 — Loss-prioritized replay.**
- At each epoch boundary, sample documents with w ∝ clip(loss_d − floor)^γ, γ ∈ {0.5, 1}. Cap at 3× uniform, exclude the top 1% loss as likely noise, anneal to uniform in the last 2 epochs. Tokens per epoch stay constant.
- Tests "more compute on harder inputs" at the data level.
- Risk: memorizing noise. The dev loss weights documents uniformly.

**H3 — Stochastic sub-tokenization.**
- Precompute, for each GPT-2 token, all splits into two in-vocabulary tokens whose bytes concatenate to it.
- Split each token with probability p ∈ {0.05, 0.1}, annealed to 0 over the final 20% of training. Each epoch then sees a different segmentation of the same text.
- Eval on canonical tokens. FLOPs matched; splitting lengthens sequences, so fewer documents fit per step.
- BPE-dropout helps low-resource pretraining (arXiv 2605.13436). I found no study in multi-epoch AR pretraining.

**H5 — NextLat.**
- A small auxiliary MLP predicts the stop-gradient next final hidden state from (h_t, emb(x_{t+1})); λ ∈ {0.1, 0.3}. Minimal FLOPs.
- Reported gains (arXiv 2511.05963) are on world-modeling and planning; the LM-loss evidence is unverified.

**H8 — Adaptive recurrence.**
- Replace the record's fixed pass schedule with a learned, entropy-based per-sequence pass count at equal FLOPs.
- Highest implementation and systems cost on one GPU. Only attempted if the earlier hypotheses fail fast.

**Considered and not ranked:**
- Curriculum or ordering: BabyLM 2023–25 curricula were mostly null.
- Self-generated synthetic data: the generator is too weak at 27M parameters, and it costs a lot.
- New optimizers: heavily mined by the speedrun and Slowrun, and gains shrink with scale (Wen et al.).
- Test-time training / dynamic evaluation: changes the eval protocol, so it isn't comparable.
- RL on checkable answers: that's Track C.

---

## 5. Compute plan (RTX 4090 hours; estimates until Phase 1 measures throughput)

Assumed effective throughput is ~60 TFLOPS bf16 on a 4090. Rough multipliers for other GPUs: H100 ≈ 0.15–0.2×, A100 ≈ 0.4×, 3090 ≈ 2× (no FP8).

| Phase | Work | GPU-h |
|---|---|---|
| 1a | Environment, data prep, dev split, throughput check (~100 steps each at S1/S3) | ~1 |
| 1b | **S3 reproduction of Slowrun Tiny #15** (approval-gated, Q5) | 10–18 |
| 1c | S1 port, feature ablations (~10), HP sweep (~30) | ~20 |
| 1d | S1 noise floor: 5 seeds | ~2.5 |
| 1e | S1 data-scaling curve (D = 3.125/6.25/25M, 2 seeds) | ~2 |
| 2 | Screening: ≤4 configs × 9 hypotheses × 1 seed (~32 runs), gate-2 seeds plus baseline re-sweeps for ~3 hypotheses, epoch dose-response | ~24 |
| 3 | Per survivor (×2): S1 with 5 fresh seeds × {baseline, method, 2 ablations} | ~20 |
| 3 | S2: baseline re-tune (~6 runs) + 3 seeds × 4 arms per survivor | ~35 |
| 3 | **S3 confirmation** (approval-gated): baseline + best method, 2–3 seeds each | 40–108 |
| 4 | Full BabyLM, OOD and downstream evals | ~3 |

- **Minimal path** (1 survivor, S1 + S2 only, no S3 confirmation): **≈95–100 GPU-h**.
- **Full path** (2 survivors plus S3 confirmation): **≈160–235 GPU-h**.

At an assumed 40 GPU-h/week, that's about 2.5 weeks for the minimal path and 4–6 weeks for the full path; I'll redo these numbers once you tell me the real budget. Rough total GPU time per phase: Phase 1 ≈ 25 h plus the S3 reproduction, Phase 2 ≈ 24 h, Phase 3 ≈ 55 h plus S3 confirmation.

**Gates and kill rules:**
- *Screen gate 1:* the best config improves dev loss by ≥ 2σ_seed with 1 seed.
- *Gate 2:* 2 more seeds plus a re-swept baseline; one-sided Welch p<0.05 and mean Δ ≥ 1σ.
- *Phase 3* uses **fresh seeds** only, so the final numbers aren't inflated by the screening selection (winner's curse).
- Kill a run if loss is NaN, or if it's more than 0.2 nats above the baseline curve after 10% of steps.
- Ask before any single run over the `[X]` threshold.

---

## 6. Rigor protocol

1. Baseline tuning budget ≥ the method tuning budget (counted in RESULTS.md).
2. Equal FLOPs (±3%) on the same GPU; wall-clock reported.
3. At least 3 seeds for any claim; mean ± std; effect in σ units.
4. Dev split only for decisions; official val and full BabyLM only for final numbers.
5. An ablation for every component of a surviving method.
6. S1 → S2 → S3 scaling check; a shrinking effect is reported as such.
7. Before claiming anything: a **fresh reviewer subagent** that sees only code, configs and logs tries to debunk the result. Fix what it finds and log it.
8. Report effect sizes and confidence. No "breakthrough" language.

---

## 7. Operations

- Layout (to be moved per Q3):
  - `ml-research/PLAN.md` — this file.
  - `RESEARCH_LOG.md` — append-only.
  - `RESULTS.md` — every run.
  - `configs/` — one file per experiment.
  - `scripts/`.
  - `runs/<id>/` — logs and metrics JSON; no checkpoints or data, which go in `.gitignore`.
- One commit per experiment with its config. A run ID = date + hypothesis + scale + seed.
- Start of session: read PLAN.md, the tail of RESEARCH_LOG.md, and RESULTS.md. End of session: update all three.
- Report to the lead at each phase boundary, and immediately on surprises.

## 8. Phase 1 checklist (after approval)

1. Pin environment: torch 2.10, tiktoken, `kernels`. Record the GPU, driver and CUDA versions.
2. Run `prepare_data.py` and check its hashes. Build the dev split and its overlap check, plus the nested train subsets.
3. Throughput check (~100 steps) at S1 and S3; replace every estimate above with measured numbers.
4. Ask for Q5 approval with the measured cost → S3 reproduction → compare to 3.295.
5. Port to S1; feature ablations; HP sweep; 5-seed noise floor; data-scaling curve.
6. Report to the lead at the Phase 1 boundary.
