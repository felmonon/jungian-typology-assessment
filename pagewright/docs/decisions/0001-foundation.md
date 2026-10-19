# 0001 — Foundation: build on WordCraft's engine, write a new front end

**Status:** accepted (2026-10-19) · **Decider:** lead engineer (this session)

## Question

Build Pagewright **(A)** on WordCraft's licensed document/editing/layout engine with a redesigned
product, or **(B)** as an independent application assembled from other licensed components?

## What was checked (all reproducible)

| Check | Result | Evidence |
|---|---|---|
| Licence | MIT OR Apache-2.0 for code; ArtCraft name/logos in `docs/brand/` are trademarks that forks must remove; every bundled asset is listed with an open licence | upstream `NOTICE`, `ATTRIBUTION.md`, `docs/brand/LICENSE-brand.txt` |
| Architecture | Layers L0–L4 (`geom`, `doc`, `fonts`, `proof`, `layout`, `docx`, `docbin`, `formats`, `render`, `pdf`, `engine`) have no UI dependency; enforced upstream by `cargo xtask layers`. The UI (L6) is declared swappable | `docs/architecture.md`, crate manifests |
| Engine surface | Every action is a command (`Session::run(id, params)`), including caret motion, selection, hit testing (`caret.set {page,x,y}`), clipboard (`edit.copy` returns text+HTML), undo/redo. Layout exposes caret and selection geometry; `render` rasterises pages | `crates/engine/src/cmd/*.rs`, `crates/layout/src/hit.rs` |
| Build | `cargo build --release -p wordcraft-cli` succeeds on Rust 1.97 / Ubuntu 24.04 in 3 m 43 s | this session |
| Round trip on independent fixtures | 10/10 synthetic fixtures (python-docx + hand-written OOXML, not produced by WordCraft): re-saved DOCX **valid** under Microsoft's Open XML SDK validator (Office 2019 schemas), paragraph text identical (read back with python-docx), tables/rows/pictures/links/sections/headers/footers/fields/comments/tracked changes/bookmarks/custom XML parts all kept, no package part dropped | `docs/evidence/foundation-roundtrip-wordcraft-e6c5a70.json` |
| Independent consumer | LibreOffice 24.2 opened all 10 re-saved files; its PDF page counts equal WordCraft's own PDF export on every fixture (48/48 pages on the long document, 4/4 on the multi-page table) | same file |
| Hostile input | Empty, truncated, missing-part files: clean error, exit 1, no output. Malformed XML: **recovered silently** (text salvaged, no warning). HTML renamed `.docx`: **imported as HTML silently**. No crash on any | same file |
| Unknown content | A paragraph-level element in an MCE-ignorable custom namespace was **dropped on save without warning** (permitted by ECMA-376 Part 3, but contrary to Pagewright's "never silently discard" rule) | same file |
| Own gaps (upstream's words) | DOCX never tested on real-world files; pagination differs from Word (no Aptos metric-compatible font); screen-reader access to the canvas untested with real readers; native printing depth | upstream `docs/gaps.md` |
| Unit tests | upstream suite run for the engine crates: see "Test run" below | `docs/evidence/foundation-tests.txt` |

## Option B, assessed

A web-technology editor (ProseMirror/Lexical in Electron or Tauri) with `mammoth` (import) and
`docx` (export) would give quick UI polish but: no true pagination (contenteditable flows, it
doesn't paginate), lossy one-way DOCX import that converts to semantic HTML and cannot carry
unknown parts, a separate exporter with its own model, and no PDF writer tied to the on-screen
layout. Matching WordCraft's verified round-trip fidelity would mean writing an OOXML model,
paginator and PDF path from scratch: the "rewrite a mature layout engine" outcome the brief warns
against.

## Decision

**Route A.** Vendor WordCraft's engine layers (L0–L4) at a pinned commit and write a new
Pagewright front end and product layer on top:

- `vendor/wordcraft/` — upstream code, notices kept, one small documented patch (product name in
  file metadata and messages). Commit and patch in `vendor/wordcraft/UPSTREAM.md`.
- `crates/pagewright-core` — new: document lifecycle (new/open/save/save as/close), unsaved-change
  state, format capability and **fidelity guard** (finds content the engine cannot keep by
  comparing the original package with an untouched re-save, and blocks silent overwrites),
  damaged-file and format-mismatch notices, recovery wiring. No UI dependency; tested headlessly.
- `crates/pagewright-ui` — new egui front end. It does not reuse WordCraft's ribbon, Backstage,
  keytips or icons.
- `apps/pagewright` (desktop) and `apps/pagewright-cli` (convert/check, used by the test harness).

Why not inherit the upstream UI: it is a deliberate clone of Word's ribbon workflow, which the
brief rules out, and it is the layer upstream itself calls swappable.

## Consequences and risks

- Pagewright inherits the engine's fidelity *and* its gaps (pagination differences, real-world
  corpus untested). Both are tracked in `STATUS.md` and the feature matrix, not hidden.
- The two silent behaviours found above are addressed in `pagewright-core`, not by patching the
  engine: damaged or mismatched files open with a visible notice and are never overwritten
  without confirmation; the fidelity guard reports anything an untouched re-save would lose.
- Vendored code must be re-synced deliberately (procedure in `UPSTREAM.md`).
- Pagewright must be described as "built on the WordCraft engine", never as written from scratch.
