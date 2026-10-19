# Test results

Latest full run: **2026-10-19**, Ubuntu 24.04 (x86-64) container, Rust 1.97, release builds unless
noted. All checks run on synthetic documents from `fixtures/generate.py`; no personal documents
were opened. **Not run: anything in Microsoft Word** (not available; [G-03](known-gaps.md#g-03)).

| Suite | Result | Command | Evidence |
|---|---|---|---|
| Pagewright core (lifecycle, fidelity guard, formats, features, recovery) | **20 / 20 pass** | `cargo test -p pagewright-core` | — |
| Pagewright UI (commands, accessibility tree, keys, tokens, dialogs) | **22 / 22 pass** | `cargo test -p pagewright-ui` | — |
| Real window, release binary (Xvfb, xdotool) | **34 / 34 checks pass** in 8 scenarios | `python3 tools/gui_workflow.py --app target/release/pagewright --out /tmp/gui` | [`evidence/gui/`](evidence/gui/), [`screenshots/`](screenshots/) |
| DOCX round trip, 10 fixtures | **10 / 10**: input and output valid, text equal, structure kept, nothing dropped silently | `python3 tools/roundtrip_check.py --cli target/release/pagewright-cli --out /tmp/rt` | [`evidence/roundtrip-pagewright.json`](evidence/roundtrip-pagewright.json) |
| Damaged files, 5 fixtures | **5 / 5** handled without a crash, each with a plain-language message | same | same (`corrupt`) |
| PDF against LibreOffice, 10 fixtures | **page counts agree 10 / 10**; page-1 RMSE 0.004–0.187 | `python3 tools/compare_pdf.py --cli target/release/pagewright-cli --out /tmp/pdf` | [`evidence/pdf-vs-libreoffice.json`](evidence/pdf-vs-libreoffice.json), [contact sheet](evidence/pdf-vs-libreoffice.png) |
| Sample files in `docs/samples` | 4 / 4 DOCX valid (Open XML SDK, 0 errors); 3 PDFs open and render (poppler) | `dotnet tools/ooxml-validate/bin/ooxml-validate.dll <file>` | — |
| Vendored WordCraft engine suites | **1,919 pass, 2 fail** (neither feature is used by Pagewright; [G-20](known-gaps.md#g-20)) | `cargo test --release -p wordcraft-doc -p wordcraft-docx -p wordcraft-layout -p wordcraft-engine -p wordcraft-pdf -p wordcraft-render` | [`evidence/foundation-tests.txt`](evidence/foundation-tests.txt) |
| Microsoft Word opens Pagewright's files | **Unperformed** | — | — |
| Screen readers (NVDA, JAWS, VoiceOver, Orca) | **Unperformed** | — | — |
| macOS and Windows builds | **Unperformed** | — | — |

## What the checks cover

### Headless tests (`cargo test`)

- **Core, 20 tests.**
  - Slice 1 end to end: new → type → heading, centring, bold, italic → save → close → reopen,
    checked in the saved XML.
  - Undo and redo.
  - The fidelity guard blocks a silent overwrite, and *Save a copy* leaves the original
    byte-for-byte.
  - Damaged and mismatched files.
  - Unreadable files.
  - Lossy home formats and exports.
  - No false alarms on clean fixtures.
  - Every feature survives save and reopen: lists, nested levels, table, picture with
    description, link, page break, header, footer page number, A4 landscape, replace all.
  - PDF page count.
  - The rich clipboard round trip.
  - Recovery never touches the original.
  - Typing in tables.
  - Bold at a word edge.
  - Unit tests for file-type detection and the fidelity scan (6).
- **UI, 22 tests,** run through the egui test harness against the real application code.
  - Every one of the 105 command-search entries runs or says why it can't. Exactly four must say
    why in a blank document: merge (needs selected cells), picture description (needs a
    picture), save automatically (needs a saved Word file) and recovered work (recovery is off in
    tests). Merge and save automatically then have their own tests.
  - Dialogs open and close.
  - Closing with unsaved changes asks first.
  - Merge explains itself, then merges.
  - Autosave writes after a pause and refuses files it can't keep.
  - Accessibility tree: every control has a name; the page reports the document, page and
    paragraph; typing and Bold through the interface; F6, Tab and Esc; the outline announces
    level and current section and scrolls to it; Bold's pressed state; a dialog opened by
    another dialog takes the keyboard.
  - Shortcut mapping.
  - Colour contrast in both themes (WCAG 2.2 AA).
  - Link normalisation.

### Real window (`tools/gui_workflow.py`)

The release binary runs under Xvfb with Mesa's software Vulkan driver. Input is sent with
xdotool and saved files are checked by reading them back.

| Scenario | What it does | Checks |
|---|---|---|
| `slice1` | Types a heading and a body, centres, bolds, italicises, saves through the dialog, closes, reopens | 8 |
| `unsaved` | Closes with unsaved work; Cancel keeps it | 1 |
| `fidelity` | Opens a file with content the engine can't keep, edits, saves; the original's SHA-256 is unchanged and a valid edited copy is beside it | 4 |
| `features` | Lists, nested bullets, table, picture with description, link, find and replace all, page break, footer page number, landscape, PDF export, print to CUPS-PDF, save; the saved file is validated | 16 |
| `recovery` | Types, kills the process (SIGKILL), relaunches, restores | 1 |
| `corrupt` | Opens a truncated and a malformed file | 2 |
| `layout` | Dark theme, command search, a 700 × 520 window | 1 |
| `long` | 48-page document; the caret moves to the end; the outline follows | 1 |

Each scenario's screenshots are the step-by-step record. A selection is in
[`screenshots/`](screenshots/).

### Interoperability (`tools/roundtrip_check.py`)

For each fixture, the script checks:

- The input is valid (Open XML SDK, Office 2019 schemas).
- pagewright-cli re-saves it as DOCX and exports PDF without error.
- The re-saved file is valid.
- The paragraph text is identical when read back by python-docx, an independent reader.
- Tables, rows, pictures, links, sections, headers, footers, fields, comments, tracked changes,
  bookmarks and custom XML are all kept.
- No package part is dropped.
- LibreOffice opens the re-saved file and gives the same page count as for the input.

`unsupported-content` re-saves with the CLI's note that one kind of content can't be kept. That
is the fidelity guard working: the app saves such files only as a copy unless the person
chooses otherwise.
