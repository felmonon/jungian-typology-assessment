# DRAFT: disclosure that Study VI Stage 0 Run 2 was executed twice

Status: draft for the owner's review. Nothing has been committed or pushed.

The text has two parts, and both are append-only additions. No existing row or entry changes.
1. A new row for `research_vi_experience_sample_efficiency/runs.md`, placed directly after the existing `s0-run2` row.
2. A new dated entry at the end of `research_lab/RESEARCH_DECISIONS.md`.

---

## 1. `runs.md`: new row

| id | date (UTC) | script | seeds / data | purpose | outcome |
|---|---|---|---|---|---|
| s0-run2a | 2026-11-18, 10:28:52Z–12:19:02Z | `vi_meter.py stage0-run2 -- vi_stage0.py --full <out> --workers 4 --checkpoint-dir <ckpt>`, run from a separate git worktree detached at `3f9e6c1` (manifest SHA-256 `eb708ac0…6521`), with its own fresh ledger and checkpoint folder, both outside the repo | Stage 0 synthetic seeds; no world | **Disclosure added after the fact.** This was the authorised Stage 0 Run 2 as FORGE first launched it, in one session. A second FORGE session did not know about it and launched row `s0-run2` 44 s after this run ended. **The one authorised run was therefore executed twice.** | **COMPLETE, decision INVALID: T1 failed.** Meter rc 0, **25,268.8 s metered CPU, 6,611.8 s wall**, 4 workers, with no pause or other intervention. The phases and test outcomes are the same as in `s0-run2`, including the same 3 of 80 T1 failures at rung 128. **The outputs match `s0-run2`:** `stage0_trials.csv` (`e5f0a448…`) and `stage0_curves.csv` (`19f6a563…`) are byte-identical, and `tests`, `gates`, `decision`, `descriptive` and `prior` in `stage0.json` are equal. Only the timing and worker fields differ (`stage0.json` `de937791…`, `stage0.log` `5bd24f82…`). **CPU across both executions: 25,268.8 + 28,193.8 = 53,462.6 s**, against the single 32,400 s cap. Each execution kept its own ledger, so neither run's cap check counted the other. The outputs are kept outside the repo and are not committed. |

---

## 2. `RESEARCH_DECISIONS.md`: new entry

## 2026-11-19: Disclosure: Study VI Stage 0 Run 2 was executed twice (two FORGE sessions)

* **What happened.**
  * The owner authorised **one** Stage 0 Run 2.
  * FORGE launched it in one session at 10:28:52Z (row `s0-run2a`). It used 4 workers in a separate worktree at `3f9e6c1`, with its own ledger.
  * It ended COMPLETE at 12:19:02Z, using 25,268.8 s of CPU.
  * At 12:19:46Z a second FORGE session, which did not know about the first execution, launched the run again (row `s0-run2`, 28,193.8 s of CPU).
  * Every record so far describes only the second execution and says that Run 2 "ran once". That is incorrect.
* **Effect on the result: none.**
  * The two executions produced byte-identical trial and curve files.
  * Their tests, gates and decision are equal.
  * The INVALID verdict and the owner's acceptance of it, with no waiver, stand unchanged.
  * This also counts as one more cross-run reproduction. It is descriptive only.
* **Compute.**
  * Both executions together used 53,462.6 s of CPU, against a cap of 32,400 s for one run. That breaks the authorisation's limit.
  * Each execution kept its own ledger, so neither enforced cap could see the other.
  * The cost was $0, on local CPU only, with no world and no GPU.
* **Gate quantities.** While diagnosing T1, the first session's FORGE computed and saw the gate quantities in `stage0.json`. It did this before it learned of the owner's decision to leave them unread. It has not reported, recorded or used them, and the owner's decision still applies.
* **Handling error, disclosed.**
  * While checking the second execution's output folder, the first session's FORGE moved the untracked `results/` contents out of the repo by mistake. That included the E1, E1-B and E2 run folders.
  * It moved them back within minutes. The `s0-run2` output hashes verify OK.
  * No file was changed or deleted.
* **Cause and safeguard.**
  * Two sessions acted on one authorisation, and no shared lock existed.
  * Proposed safeguard: before a metered run launches, it writes a lock file into the repo, for example `results/<run-id>.lock`. A second launch with the same label then refuses to start.
  * This is a proposal only, not adopted.
* **Not authorised.** No change of any kind. This entry corrects the record only.
