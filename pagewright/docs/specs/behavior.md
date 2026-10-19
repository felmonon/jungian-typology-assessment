# Pagewright behaviour specifications

Each rule is testable and names the test that enforces it. Rules come from the findings in
[`../research/word-behavior.md`](../research/word-behavior.md) (W-xx) or from Pagewright's own
product decisions (P-xx). Test locations: `core:` = `crates/pagewright-core/tests`, `ui:` =
`crates/pagewright-ui/tests` (or `src` unit tests), `gui:` = scenario in `tools/gui_workflow.py`,
`rt:` = `tools/roundtrip_check.py`.

## Editing

| ID | Rule | Test |
|---|---|---|
| E-1 | Typing on the page inserts text at the caret; AutoCorrect capitalises a sentence's first word | gui:`slice1`, ui:`accessibility::typing_and_toggling_bold_through_the_interface` |
| E-2 | Arrow keys move the caret; Shift+arrow (and Shift+Home/End, Ctrl+Shift+arrow) extends the selection | ui:`keys::shift_extends_caret_moves` |
| E-3 | Click places the caret; double-click selects a word; triple-click a paragraph; drag selects; Shift+click extends | canvas code `mouse()`; exercised in gui:`slice1` (click to focus) |
| E-4 | Undo reverses the last step (typing burst, formatting change); redo reapplies it | core:`slice1::undo_and_redo_restore_text_and_formatting` |
| E-5 | Copy puts HTML and plain text on the system clipboard; paste uses HTML when present, keeping bold/italic/etc.; cut removes and undo restores | core:`features::rich_clipboard_round_trip_keeps_formatting` |
| E-6 | A toolbar click, menu choice or closed dialog returns the keyboard to the page | ui:`accessibility::typing_and_toggling_bold_through_the_interface`, gui:`features` |
| E-7 | A key that moves focus to the page (Esc closing the find bar) is not also applied to the document | gui:`slice1` (find, Esc, Ctrl+B) |
| E-8 | Changing the selection drops formatting that was waiting for typing; the format bar shows the selection's formatting | ui:`accessibility::typing_and_toggling_bold_through_the_interface` |

## Formatting, styles, lists

| ID | Rule | Test |
|---|---|---|
| F-1 | Bold/italic/underline/strike toggle on a selection; with a caret inside a word they apply to the word; otherwise to new typing (W-08) | core:`features::bold_with_the_caret_after_a_space_applies_to_new_text_only` |
| F-2 | Font, size, colour, highlight (Word's highlight colours), alignment, line spacing, indents apply to the selection or paragraph | ui:`command_search::every_entry_runs_or_explains_why_not` |
| F-3 | Paragraph styles apply from the style menu or Ctrl+Alt+1–3; Enter after a heading gives the style's following style (W-05) | core:`slice1`, gui:`slice1` |
| F-4 | Bullets and numbering toggle; Tab demotes, Shift+Tab promotes; Enter on an empty item ends the list (W-07) | core:`features::nested_list_levels_are_written`, gui:`features` |
| F-5 | The format bar reports the caret's style, font, size, emphasis, alignment and list state, and toggles report pressed state to assistive technology | ui:`accessibility::bold_reports_its_pressed_state` |

## Objects and pages

| ID | Rule | Test |
|---|---|---|
| O-1 | Insert a table by size (grid or numbers); Tab moves cell to cell; rows/columns insert and delete; merge needs two or more selected cells and says so otherwise | core:`features::every_core_feature_survives_save_and_reopen`, ui:`command_search::merge_explains_itself_then_merges_a_cell_selection` |
| O-2 | Insert a picture from a file, with alt text stored in the document | core:`features` (`descr` attribute), gui:`features` |
| O-3 | Insert a link to a typed address (https:// added to bare domains, mailto: for emails); Ctrl+click follows it | ui:`dialogs::tests::urls`, gui:`features` |
| O-4 | Page size, orientation and margins apply to the current section | core:`features` (A4 landscape, `w:w="16838"`) |
| O-5 | Page breaks start a new page; headers and footers can be edited; page numbers insert a PAGE field | core:`features`, gui:`features` |
| O-6 | Find highlights every match and shows "n of N"; Enter/Shift+Enter step; replace one or all (one undo step); Alt+R/Alt+A act without typing a letter | gui:`features`, core:`features` (replace all) |

## Saving and file safety (P-1…P-9: Pagewright decisions)

| ID | Rule | Test |
|---|---|---|
| P-1 | A new document that was never saved shows "Not saved yet"; once edited, "Unsaved · not in a file yet" in the warning colour | ui:`app` status text; gui:`slice1` screenshots |
| P-2 | Save with no file asks where to save; the suggested name is the first line of the document | core:`slice1`; ui:`app::tests::names_and_labels` |
| P-3 | Saving writes a real OOXML package (never HTML renamed), atomically (temporary file then rename) | core:`slice1` (ZIP signature, `docProps/app.xml` names Pagewright) |
| P-4 | Opening a DOCX scans the package and an untouched re-save; anything that would be lost is listed in a notice and in the status bar | core:`slice1::content_the_engine_cannot_keep_…`, gui:`fidelity` |
| P-5 | Replacing such a file, a damaged file, or a file whose content isn't the format its name says, needs confirmation; the default is "Save a copy", which leaves the original byte-for-byte unchanged | core:`slice1`, gui:`fidelity` |
| P-6 | OpenDocument and RTF saves warn once per file per session that some features won't be kept; HTML, Markdown, text and PDF are exports that keep the document's home and unsaved state | core:`slice1::lossy_home_formats_ask_once_…` |
| P-7 | Closing or quitting with unsaved changes asks Save / Don't save / Cancel; Cancel keeps everything | ui:`command_search::closing_with_unsaved_changes_asks_first`, gui:`unsaved` |
| P-8 | Recovery copies of unsaved work are made locally, never written over the original, offered on the next start, and restore as an unsaved document without a file | core:`features::recovery_…`, gui:`recovery` |
| P-9 | "Save automatically" is opt-in per document and refused (with the reason) for documents without a file, non-Word files and files with fidelity concerns; it stops itself if a save ever needs a decision | ui:`command_search::autosave_…` |
| P-10 | Unreadable files explain why in plain language and leave the current document open; empty files open as a new document that saves back to them | core:`slice1::unreadable_files_…`, gui:`corrupt` |

## Interface and accessibility

| ID | Rule | Test |
|---|---|---|
| U-1 | Every command in the command search runs or shows why it's unavailable; none names an unknown command or needs a missing dialog | ui:`command_search` (all tests) |
| U-2 | Every control has an accessible name; the page announces document, page and the paragraph at the caret; outline entries announce level and current section | ui:`accessibility` |
| U-3 | F6 moves between page and format bar; Tab within; Esc returns to the page (W-03) | ui:`accessibility::f6_…` |
| U-4 | Text/background colour pairs meet WCAG 2.2 AA (4.5:1) in both themes; the caret is ≥ 7:1 on paper | ui:`tokens::tests` |
| U-5 | In a narrow window the format bar moves lower-priority groups into an overflow menu instead of clipping them | gui:`layout` (700 × 520 screenshot) |
| U-6 | Pages stay paper-white in the dark theme so the screen matches print | gui:`layout` |
| U-7 | The outline highlights the section containing the caret and scrolls it into view when the caret enters another section; it doesn't fight the person's own scrolling | ui:`accessibility::the_outline_scrolls_to_the_current_section`, gui:`long` |

## Usability improvements over a ribbon interface (hypotheses, with how they're tested)

"Better" is a claim to test. These are the improvements Pagewright makes, the task each targets,
and the evidence collected so far. No study with users has been run.

1. **Command search (Ctrl+/) with plain names and synonyms.** Task: *find a command you can't
   see* (e.g. "landscape", "page numbers", "word count"). Measured: any of the 105 catalogued commands
   is reachable in three interactions (shortcut, a word, Enter); unavailable commands say why
   instead of disappearing. Evidence: ui:`palette::tests::synonyms_find_commands`,
   ui:`command_search`; gui:`features` drives tables, pictures, page numbers, landscape and margins
   entirely through it. Not yet measured: time-on-task against a ribbon with real users.
2. **Visible save state and the fidelity guard.** Task: *know whether your work is safe, and
   never lose part of a file by saving.* The title bar always says where the document lives and
   whether it has unsaved changes; opening a file with content Pagewright can't keep says what
   it is; replacing the original needs a decision whose default keeps it. Evidence: P-1, P-4, P-5
   tests and the `fidelity` GUI scenario (original's SHA-256 unchanged).
3. **Outline that tracks your position.** Task: *move around a long document.* Headings appear
   in the outline with the current section highlighted and scrolled into view; one click jumps
   there. Evidence: ui:`accessibility::outline_entries_…`,
   ui:`accessibility::the_outline_scrolls_to_the_current_section`, gui:`long` (48-page fixture,
   screenshot 19). Not yet measured:
   comparison with scrolling/Page Down counts.
4. **Contextual format bar.** Task: *format without hunting through tabs.* Table tools appear
   only in a table and header/footer tools only while editing one; low-priority groups collapse
   into an overflow menu in narrow windows rather than a second ribbon row. Evidence: U-5.
