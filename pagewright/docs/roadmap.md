# Roadmap

Ordered by what most blocks everyday use and trust, not by size. Each item names the gap it
closes. Nothing here is promised by date.

## Next: prove compatibility

1. **Verify in Microsoft Word** (G-03). Open the samples and round-trip outputs in Word for
   Windows and Mac. Repeat the GUI scenarios step by step in Word, which turns the Inferred
   findings in `research/word-behavior.md` into Observed ones or contradicts them.
2. **Real-world corpus** (G-04). Run a licensed set of real documents through
   `tools/roundtrip_check.py`, fix what breaks, and add the worst cases as fixtures.
3. **macOS and Windows builds** (G-06, G-09). Compile, run the Rust test suites, and port the GUI
   workflow driver. Then test native dialogs, the clipboard, printing and ⌘ shortcuts.
   Installers come after that.
4. **Screen reader pass** (G-05). Test with NVDA, VoiceOver and Orca. Add text navigation
   (line, word, character) and formatting announcements for the page.

## Then: the features people reach for weekly

5. Comments: a side list, add, reply, resolve (G-07).
6. Tracked changes: show, accept, reject, with a review mode (G-07).
7. Spelling: underlines and suggestions using the engine's proofing layer, plus a language per
   paragraph (G-13).
8. Resize pictures and table columns by dragging; picture wrapping and cropping (G-10).
9. Footnotes and endnotes; section breaks and columns; first-page and odd/even headers (G-11).
10. Table of contents from headings; create and edit styles (G-14).
11. Password prompt for protected documents (G-08).
12. Drag and drop files and pictures (G-17); several windows (G-18).

## Later

- Citations and bibliography, equations, text boxes and shapes. The engine has commands for some
  of these; each needs an interface and its own tests before it is offered.
- Mail merge.
- A value-level fidelity comparison: properties, not just counts (G-15).
- Real-time collaboration and cloud storage. This needs a separate decision. It conflicts with
  the local-first promise unless it stays optional.
