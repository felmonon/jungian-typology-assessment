# RESULTS.md — every run

Each row is one run.
- **Dev loss** is in nats/token on the FineWeb dev split (PLAN.md §3).
- **Official val** is filled in only for the Phase 1 reproduction and final Phase 4 numbers.
- **FLOPs** are analytic training FLOPs.
- **Tuning count** columns track how many configs the baseline and each method have been given (rigor rule: baseline ≥ method).

| Run ID | Date | Commit | Scale | Arm (baseline / H#) | Config file | Seed | Train FLOPs | Wall-clock (h) | GPU | Dev loss | Official val | OOD (Wiki / PG19 / C4) | BabyLM fast (BLiMP / Supp / EWoK / COMPS / ET) | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | No runs yet (Phase 0). |

## Tuning-budget ledger

| Arm | Scale | Configs tried | Seeds |
|---|---|---|---|
| baseline | S1 | 0 | 0 |

## Noise floor (filled in Phase 1d)

| Scale | Metric | Mean | Std (σ_seed) | n seeds |
|---|---|---|---|---|
| S1 | dev loss | — | — | — |
