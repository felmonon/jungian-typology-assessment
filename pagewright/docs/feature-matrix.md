# Feature matrix

What Pagewright 0.1 does today, and how each claim was checked. Microsoft Word is the reference
for *which* features matter, not proof of compatibility: **no file in this project has been opened
in Microsoft Word** (Word was not available; see [known gaps](known-gaps.md#g-03)).

| Status | Meaning |
|---|---|
| **Verified** | Automated test passes **and** the feature was driven in the real desktop window (`tools/gui_workflow.py`, release build, Linux/Xvfb) with its output checked |
| **Tested** | Automated test passes (headless core test, UI test through the egui test harness, or command-search sweep), not separately driven in the real window |
| **Partial** | Works with a stated limit |
| **Kept, not editable** | Comes through open → save unchanged (round-trip checked), but there is no interface to create or change it |
| **Not yet** | Not in this release; on the [roadmap](roadmap.md) |

Test names: `core:` `crates/pagewright-core/tests`, `ui:` `crates/pagewright-ui/tests` or unit
tests, `gui:` scenario in `tools/gui_workflow.py`, `rt:` `tools/roundtrip_check.py`, `pdf:`
`tools/compare_pdf.py`. Evidence files are in [`evidence/`](evidence/).

## Documents and files

| Feature | Status | Checked by | Notes |
|---|---|---|---|
| New document | Verified | core:`slice1`, gui:`slice1` | Title bar says "Not saved yet" |
| Save / Save As Word (.docx) | Verified | core:`slice1`, gui:`slice1`, `features` | Real OOXML package, written to a temporary file then renamed; Open XML SDK validator: 0 schema errors on every saved file |
| Close and reopen | Verified | core:`slice1`, gui:`slice1` (screenshot 05) | Heading style, centring, bold and italic come back |
| Open Word (.docx, .docm, .dotx) | Verified on the synthetic suite | rt: 10/10 fixtures, gui:`fidelity` | Real-world documents not yet tested ([G-04](known-gaps.md#g-04)) |
| Fidelity guard: say what a save would lose, protect the original | Verified | core:`slice1`, gui:`fidelity` | Original's SHA-256 unchanged; default is *Save a copy* |
| Damaged files, files whose content isn't the format their name says | Verified | core:`slice1`, gui:`corrupt`, rt: 5 corrupt fixtures | Plain-language notice; no crash on any fixture |
| Unsaved-changes prompt on close/quit | Verified | ui:`command_search`, gui:`unsaved` | Save / Don't save / Cancel |
| Recovery copies after a crash | Verified | core:`features`, gui:`recovery` | Local only; restore opens an unsaved copy; never writes to the original |
| Save automatically (opt-in) | Tested | ui:`command_search::autosave_…` | Only for Word files with no fidelity question open |
| Export PDF | Verified | core:`features`, gui:`features`, pdf: 10/10 | Page counts equal LibreOffice's on all 10 fixtures ([G-01](known-gaps.md#g-01)) |
| Print | Verified on a virtual printer | gui:`features` (CUPS-PDF job) | Linux/CUPS only so far; no physical printer, macOS or Windows ([G-09](known-gaps.md#g-09)) |
| OpenDocument (.odt), RTF: open and save | Tested | core:`slice1::lossy_home_formats_…` | Warns once per file that some features won't be kept |
| Export HTML, Markdown, plain text, LaTeX | Tested | core:`slice1`, CLI `convert` | Exports keep the document's home file and unsaved state |
| Word 97–2003 (.doc) | Partial | — | Opens through the engine's importer (not tested by Pagewright, no .doc fixture); saving asks for a .docx name |
| Password-protected documents | Not yet | core:`friendly_open_error` | Explains that passwords aren't supported yet ([G-08](known-gaps.md#g-08)) |
| Command line: convert, check, text | Tested | rt:, pdf: | Same pipeline and fidelity notes as the app |

## Editing

| Feature | Status | Checked by | Notes |
|---|---|---|---|
| Typing, Enter, Backspace/Delete, AutoCorrect sentence capitals | Verified | gui:`slice1`, ui:`accessibility` | |
| Caret movement and keyboard selection (arrows, Home/End, Ctrl+arrow, Shift to extend) | Tested | ui:`keys::shift_extends_caret_moves` | |
| Mouse: click, double-click word, triple-click paragraph, drag, Shift+click | Partial | gui:`slice1` (click) | Implemented in the canvas; only click-to-place is driven by a test |
| Undo / redo | Tested | core:`slice1::undo_and_redo_…` | Typing burst is one step |
| Cut / copy / paste with formatting | Tested | core:`features::rich_clipboard_…` | HTML + plain text on the system clipboard; exchange with other apps not tested |
| Paste as plain text | Tested | ui:`command_search` | |
| Find with match count, step through matches | Verified | gui:`slice1`, `features` | "n of N", Enter / Shift+Enter |
| Replace one / replace all | Verified | gui:`features`, core:`features` | Replace all is one undo step |
| Word count | Tested | ui:`command_search` | |
| Input methods (IME composition) | Partial | — | Pre-edit text is drawn at the caret and commits on confirm; not tested with a real IME ([G-12](known-gaps.md#g-12)) |
| Spelling | Not yet | — | No spelling marks or suggestions in the interface ([G-13](known-gaps.md#g-13)) |

## Formatting, styles, lists

| Feature | Status | Checked by | Notes |
|---|---|---|---|
| Bold, italic, underline | Verified | gui:`slice1`, ui:`accessibility`, core:`features` | Caret inside a word: the word; otherwise new typing (W-08) |
| Double underline, strikethrough, sub/superscript, small caps, all caps, grow/shrink, clear formatting | Tested | ui:`command_search` | |
| Font and size | Tested | ui:`command_search`, core:`features` | Fonts not installed are shown with a stand-in, and the font control says so ([G-02](known-gaps.md#g-02)) |
| Text colour, highlight | Tested | ui:`command_search` | Word's highlight colours |
| Alignment | Verified | gui:`slice1` (centre) | Left, centre, right, justify |
| Line spacing, space before/after, indents | Tested | ui:`command_search` | |
| Apply paragraph styles (Normal, Title, Subtitle, Heading 1–3, Quote and the document's own) | Verified | gui:`slice1`, core:`slice1` | Enter after a heading gives the following style (W-05) |
| Create or edit styles | Not yet | — | Styles from files are kept and applied |
| Bulleted, numbered and lettered lists; Tab/Shift+Tab levels | Verified | core:`features::nested_list_levels_…`, gui:`features` | |

## Objects and pages

| Feature | Status | Checked by | Notes |
|---|---|---|---|
| Insert table (grid or numbers), type in cells, Tab between cells | Verified | gui:`features`, core:`features` | |
| Insert/delete rows and columns, merge cells, repeat header row, delete table | Tested | ui:`command_search`, ui:`merge_explains_itself_…` | Merge says why when fewer than two cells are selected |
| Resize columns and rows by dragging | Not yet | — | Widths from files are kept ([G-10](known-gaps.md#g-10)) |
| Insert picture with a description (alt text) | Verified | gui:`features` (`descr` in the saved file), ui:`accessibility` | |
| Resize, crop, wrap pictures | Not yet | — | Pictures go in at their natural size, never wider than the text column ([G-10](known-gaps.md#g-10)) |
| Links: insert, remove, Ctrl+click to follow | Verified (insert) / Tested | gui:`features`, ui:`dialogs::tests::urls` | Bare domains get https://, emails mailto: |
| Page break, line break | Verified | gui:`features` (2-page PDF) | |
| Headers and footers | Verified | gui:`features`, core:`features` | Esc or *Done* leaves them |
| Different first page / odd and even headers | Kept, not editable | rt:`header-footer` | Shown and kept from files; no option to switch them on ([G-11](known-gaps.md#g-11)) |
| Page numbers, date field | Verified / Tested | gui:`features` (PDF text), ui:`command_search` | PAGE field |
| Paper size, orientation, margins | Verified | gui:`features`, core:`features` (A4 landscape) | Applies to the current section |
| Insert section breaks | Not yet | — | Sections from files are kept (rt:`header-footer`: 2 sections) |
| Comments, tracked changes, bookmarks, fields, custom XML parts | Kept, not editable | foundation round trip ([evidence](evidence/foundation-roundtrip-wordcraft-e6c5a70.json)) | No interface to add or review them ([G-07](known-gaps.md#g-07)) |
| Footnotes, equations, text boxes, charts, SmartArt | Not yet in the interface | — | The engine has commands for some; Pagewright doesn't expose them and hasn't tested them |

## Interface and accessibility

| Feature | Status | Checked by | Notes |
|---|---|---|---|
| Command search (Ctrl+/) over 105 commands, with synonyms | Verified | ui:`command_search`, ui:`palette::tests`, gui:`features` | Unavailable commands say why |
| Contextual format bar with overflow menu in narrow windows | Verified | gui:`layout` (700 × 520, screenshot 17) | |
| Outline that follows the caret | Verified | ui:`accessibility::outline_…`, ui:`the_outline_scrolls_to_the_current_section`, gui:`long` | 48-page fixture, screenshot 19; the list scrolls to the current section |
| Zoom, fit width, formatting marks | Tested | ui:`command_search` | Ctrl+scroll and Ctrl +/− |
| Light and dark themes (pages stay paper-white) | Verified | gui:`layout` (screenshot 15), ui:`tokens::tests` | |
| Keyboard-only use: F6 to the format bar, Tab within, Esc back | Tested | ui:`accessibility::f6_…` | |
| Accessible names and states for assistive technology (AccessKit) | Tested | ui:`accessibility` (7 tests) | Real screen readers not tested ([G-05](known-gaps.md#g-05)) |
| Contrast WCAG 2.2 AA in both themes | Tested | ui:`tokens::tests` | Text pairs ≥ 4.5:1; caret ≥ 7:1 |
| macOS and Windows | Not yet verified | — | Cross-platform code, not compiled or run there ([G-06](known-gaps.md#g-06)) |
