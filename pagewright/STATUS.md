# Pagewright status

**Updated:** 2026-10-19 · **Version:** 0.1.0 (early release; WordCraft engine 0.8.0) · **Branch:** `claude/friendly-rubin-tu258l`

## Where things stand

Pagewright is a working desktop word processor for Linux, built on the WordCraft engine
(`vendor/wordcraft`, commit e6c5a70, MIT OR Apache-2.0). It has its own interface, product layer
and brand. You can create, write, format, save, close and reopen real Word documents. It also
does lists, tables, pictures with descriptions, links, headers and footers, page numbers, page
setup, find and replace, PDF export, printing, crash recovery and opt-in automatic saving. Before
anything could overwrite content it can't keep, it tells you what and protects the original.

Not proved: compatibility with Microsoft Word itself, real-world documents, macOS and Windows,
and screen readers. See [known gaps](docs/known-gaps.md).

| Phase | State | Where |
|---|---|---|
| 1. Environment, REA readiness, locate Word | Done. Word not present; REA checked but not set up (below) | [research](docs/research/word-behavior.md), [REA dry run](docs/evidence/rea-setup-dry-run.json) |
| 2. Word behaviour research → specs and tests | Done. 17 findings: 0 Observed, 14 Inferred (two with an Unknown part), 3 Unknown | [findings](docs/research/word-behavior.md), [specs](docs/specs/behavior.md) |
| 3. Foundation: build on WordCraft (A) vs independent (B) | Done. Chose A, engine vendored with notices and one documented patch | [decision](docs/decisions/0001-foundation.md), [UPSTREAM.md](vendor/wordcraft/UPSTREAM.md) |
| 4. Brand | Done. Pagewright, the Folded Leaf mark, viridian and ochre, Source Serif 4 / Inter | [BRAND.md](BRAND.md), `brand/` |
| 5. Vertical slices | Done for the core set; advanced features on the [roadmap](docs/roadmap.md) | [feature matrix](docs/feature-matrix.md) |
| 6. Proof | Done on Linux; Word verification **unperformed** | [test results](docs/test-results.md), `docs/screenshots/` |
| 7. Deliverables | Done | [README](README.md) |

## Blockers and what would unblock them

1. **Microsoft Word is not available.** This environment is a Linux container with no Word
   install and no Windows or Mac host. Everything about Word is therefore Inferred from
   Microsoft's documentation, never Observed, and opening Pagewright's files in Word is
   unperformed. *Unblock:* a Windows or Mac machine with Word, to open `docs/samples/*.docx` and
   repeat the scenarios.
2. **REA has not been set up.** `npx rea-agents setup` ran only as a dry run, so nothing was
   changed. The CLI (v6.7.0) runs. Its plan would add an MCP registration to `~/.claude.json` and
   install a skill. I didn't apply it: it changes your Claude Code configuration, and it couldn't
   help here anyway, because there is no Word binary to analyse and no analysis engine (Ghidra,
   IDA, JADX, Kuna) is configured. *Unblock:* your go-ahead to apply it, on a machine where Word
   is installed.
3. **Microsoft's documentation sites are blocked** by this environment's network policy
   (support.microsoft.com, learn.microsoft.com, ecma-international.org). Pages were read through
   search-result summaries. *Unblock:* allow those hosts in the environment's network settings.
4. **No macOS or Windows host** to compile and test those builds.

## Decisions waiting on you

- **Publishing.** Nothing has been deployed, published, released or submitted anywhere. The
  code is on the branch above, with no pull request.
- **Licence.** Pagewright's own code is declared MIT OR Apache-2.0, matching the engine it
  builds on and compatible with this repository's MIT licence. Change it before any release if
  you want different terms. The engine's licence can't change.
- **Name.** "Pagewright" is provisional. Web searches found no software product with this name, but
  that is not trademark clearance ([BRAND.md](BRAND.md)).

## Next concrete task

On a machine with Microsoft Word: open the four files in `docs/samples/` and the 10 round-trip
outputs from `tools/roundtrip_check.py`. Record for each whether Word opens it without a repair
prompt and whether the pages match the PDFs in `docs/samples/`. Then add the results to
`docs/research/word-behavior.md` as Observed findings (gap G-03).

## Recent changes

- The outline now scrolls to the current section when the caret moves to another one. The real
  48-page document showed the highlight off-screen. Test:
  `accessibility::the_outline_scrolls_to_the_current_section`.
- Pictures get a description (alt text) as they are inserted, and from the command search
  afterwards. It is stored as `descr` in the file.
- A dialog opened from another dialog now takes the keyboard. Before, typed text went to the page.
