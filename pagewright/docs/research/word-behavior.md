# Microsoft Word behaviour: findings for Pagewright

Word is the functional reference, not a design to copy. This file records what Pagewright's
behaviour is based on, how sure we are, and where the matching acceptance test lives.

## How findings are classified

| Class | Meaning |
|---|---|
| **Observed** | Seen directly in Microsoft Word by running it. |
| **Inferred** | From Microsoft's published documentation, Microsoft Q&A answers, or the ECMA-376 / ISO/IEC 29500 specification. Not seen in Word in this project. Q&A answers are community material and weaker than official articles; each row says which. |
| **Unknown** | Not specified in public material and not observed. Pagewright makes a stated choice and marks it. |

**No finding is classified Observed.** Microsoft Word was not available: this work ran in a Linux
container (Ubuntu 24.04) with no Word installation and no Windows/macOS host. REA (Reverse Engineer
Anything) was checked (CLI v6.7.0 runs; its MCP server is not connected to this session; no native
analysis engine is configured), but there was no Word binary or installation for it to inspect, so
no REA evidence about Word exists. See [`../evidence/rea-setup-dry-run.json`](../evidence/rea-setup-dry-run.json).

**Access route for sources.** The environment's network policy blocks `support.microsoft.com`,
`learn.microsoft.com` and `ecma-international.org` for direct download. Microsoft pages below were
read through web-search result summaries on 2026-10-19 (the URLs are the pages themselves). ECMA-376
clauses are cited by number from the standard; the schemas themselves were checked through
Microsoft's Open XML SDK validator (MIT), which embeds them.

## Findings

| ID | Area | Behaviour | Class | Source | Pagewright | Acceptance test |
|---|---|---|---|---|---|---|
| W-01 | Shortcuts | Ctrl+B / I / U bold, italic, underline; Ctrl+Z undo; Ctrl+Y redo; Ctrl+S save; Ctrl+O open; Ctrl+N new | Inferred (official) | [Keyboard shortcuts in Word](https://support.microsoft.com/en-us/office/keyboard-shortcuts-in-word-95ef89dd-7142-4b50-afb2-f762f663ceb2) | Same keys (⌘ on macOS) | `keys.rs::familiar_shortcuts_map_to_engine_commands` |
| W-02 | Shortcuts | Ctrl+E centres; Ctrl+Alt+1 Heading 1; Ctrl+Shift+N Normal; Ctrl+Enter page break; Ctrl+K hyperlink | Inferred (official) | [Keyboard shortcuts in Word (accessibility)](https://support.microsoft.com/en-us/accessibility/word/keyboard-shortcuts-in-word); [Use a screen reader to insert a hyperlink](https://support.microsoft.com/en-us/accessibility/word/use-a-screen-reader-to-insert-a-hyperlink-in-word) | Same keys | `keys.rs` tests; GUI `slice1` (Ctrl+Alt+1, Ctrl+E), `features` (Ctrl+Enter, Ctrl+K) |
| W-03 | Navigation | F6 cycles the document, task pane, status bar and ribbon; Tab moves within the ribbon | Inferred (official) | [Keyboard shortcuts in Word (accessibility)](https://support.microsoft.com/en-us/accessibility/word/keyboard-shortcuts-in-word) | F6 moves between page and format bar; Tab within; Esc back to page | `accessibility.rs::f6_reaches_the_toolbar_and_escape_returns_to_the_page` |
| W-04 | Headers/footers | Esc (or Close Header and Footer) leaves header/footer editing | Inferred (official) | [Use a screen reader to create headers or footers](https://support.microsoft.com/en-gb/office/use-a-screen-reader-to-create-headers-or-footers-in-word-7a61ea68-8cf2-48eb-a693-fda2bb7f311f) | Esc leaves; "Done" in the format bar | GUI `features` (page numbers, then Esc) |
| W-05 | Styles | Enter at the end of a paragraph applies its style's "Style for following paragraph" (`w:next`); headings default to Normal | Inferred (Q&A + ECMA-376 §17.7.4.10 `next`) | [Microsoft Q&A: Style changes when I press Enter](https://learn.microsoft.com/en-us/answers/questions/2899107f-f053-4e7e-ae83-cd3786984adf/style-changes-when-i-press-enter?forum=msoffice-all) | Engine applies `w:next` | GUI `slice1`: body after Heading 1 is Normal |
| W-06 | Paragraphs | Direct paragraph formatting (e.g. centring) carries into the new paragraph on Enter | Inferred (general Word convention; no official page found) | — | Engine keeps it (observed in Pagewright, `slice1` screenshot 02) | GUI `slice1` |
| W-07 | Lists | Tab demotes a list item, Shift+Tab promotes; Enter twice ends the list; Shift+Enter is a line break inside the item | Inferred (official Mac page + Q&A) | [Create a bulleted or numbered list in Word for Mac](https://support.microsoft.com/en-us/word/create-a-bulleted-or-numbered-list-in-word-for-mac); [Q&A: Going back one level](https://learn.microsoft.com/en-us/answers/questions/17098c64-ab85-411a-ad7f-7b1f802d925f/going-back-one-level-in-bulleted-lists?forum=msoffice-all) | Same | `features.rs::nested_list_levels_are_written`; GUI `features` |
| W-08 | Formatting | With no selection, Ctrl+B applies to the whole word only when the insertion point is inside it **and** "When selecting, automatically select entire word" is on; otherwise it sets formatting for new typing | Inferred (Q&A); **default of the option: Unknown** | [Q&A: No longer able to apply Bold by Ctrl+B](https://learn.microsoft.com/en-us/answers/questions/84f2a66e-75fe-434d-9b8a-b097d3fcfe27/no-longer-able-to-apply-bold-to-a-word-by-pressing?forum=msoffice-all) | Inside a word: whole word; at a word edge or after a space: new typing only (no option) | `features.rs::bold_with_the_caret_after_a_space_applies_to_new_text_only`; `accessibility.rs::typing_and_toggling_bold_through_the_interface` |
| W-09 | Saving | AutoSave saves every few seconds, but only for files on OneDrive/SharePoint; local files get AutoRecover copies (described as every 10 minutes) instead | Inferred (official) | [What is AutoSave?](https://support.microsoft.com/en-us/office/collab-files/what-is-autosave); [Turn on autosave in Microsoft 365 apps](https://support.microsoft.com/en-us/onedrive/turn-on-autosave-in-microsoft-365-apps) | Local recovery copies every ≤10 s after a change (never written to the original); opt-in "Save automatically" for Word files with no fidelity concerns | `features.rs::recovery_keeps_unsaved_work_and_never_touches_the_original`; `command_search.rs::autosave_writes_after_a_pause_and_refuses_files_it_cannot_keep`; GUI `recovery` |
| W-10 | Recovery | On start, Word looks for AutoRecover files and offers them in a Document Recovery pane; recovered copies should be saved as .docx | Inferred (official) | [How to recover unsaved Word documents](https://learn.microsoft.com/en-us/office/troubleshoot/word/recover-lost-unsaved-corrupted-document) | Recovery dialog on start; Restore opens an unsaved copy with no file | GUI `recovery` |
| W-11 | Fonts | Aptos is the default Office font (replacing Calibri); when Aptos isn't installed Word substitutes another font | Inferred (official + Q&A) | [New Office theme](https://support.microsoft.com/en-us/office/new-office-theme-e7bbfe02-d1fb-4c4d-b3b7-6a47f0cefd3f); [Aptos (Microsoft Typography)](https://learn.microsoft.com/en-us/typography/font-list/aptos) | New documents use Aptos (engine template); without Aptos installed a substitute lays out, so line breaks and page counts can differ from Word; the font menu says so | Known gap G-02 |
| W-12 | File format | Unknown elements in a namespace listed in `mc:Ignorable` may be ignored by a consumer that doesn't understand them | Inferred (ECMA-376 Part 3 §10.2.1) | ECMA-376 Part 3, Markup Compatibility and Extensibility | The fidelity guard reports such content before any overwrite | `slice1.rs::content_the_engine_cannot_keep_blocks_silent_overwrite_and_copy_keeps_original` |
| W-13 | File format | Whether Word itself keeps unknown ignorable content on save | **Unknown** | — | Pagewright assumes it may not and protects the original | — |
| W-14 | Pagination | Word's line-breaking and pagination algorithm (widow/orphan, keep-with-next, compatibility options, font metrics) | **Unknown** in detail (only option semantics are specified in ECMA-376 §17.3.1, §17.15) | ECMA-376 Part 1 | Engine's own layout; compared against LibreOffice as a second, independent renderer, not against Word | `tools/roundtrip_check.py` page counts; gap G-01 |
| W-15 | Clipboard | Word exchanges rich text with other apps through HTML and RTF clipboard formats | Inferred (engine documentation; Windows clipboard conventions) | upstream `crates/engine/src/cmd/edit.rs` | Copy puts HTML + text on the clipboard; paste prefers HTML | `features.rs::rich_clipboard_round_trip_keeps_formatting` |
| W-16 | Undo | How Word groups typing into undo steps | **Unknown** | — | Engine groups a typing burst into one step; formatting commands are separate steps | `slice1.rs::undo_and_redo_restore_text_and_formatting` |
| W-17 | Find | Ctrl+F opens the Navigation pane search; Ctrl+H opens Replace; Find Next with no previous search opens Find | Inferred (official for Ctrl+F/Ctrl+H; the last part is **Unknown**) | [Keyboard shortcuts in Word](https://support.microsoft.com/en-us/office/keyboard-shortcuts-in-word-95ef89dd-7142-4b50-afb2-f762f663ceb2) | Find bar (Ctrl+F), replace (Ctrl+H); find next with nothing searched opens the bar | `command_search.rs::every_entry_runs_or_explains_why_not`; GUI `slice1`, `features` |

## Reproducible checks

All checks use synthetic documents from [`../../fixtures/generate.py`](../../fixtures/generate.py);
no personal documents were opened.

- Shortcuts and focus: `cargo test -p pagewright-ui` (`keys.rs`, `tests/accessibility.rs`).
- Editing, lists, styles, saving, recovery: `cargo test -p pagewright-core`.
- In the real window: `python3 tools/gui_workflow.py --app target/release/pagewright --out /tmp/gui`.
- File interoperability: `python3 tools/roundtrip_check.py --cli target/release/pagewright-cli --out /tmp/rt`.

## What would upgrade these findings

Running the same scenarios in Microsoft Word (Windows or macOS) on the fixture suite and recording
what happens would turn the Inferred rows into Observed or contradict them. The scenarios are
written so that a person with Word can repeat them step by step (see `tools/gui_workflow.py`, each
scenario's docstring and key sequence). This has not been done.
