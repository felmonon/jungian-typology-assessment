# Third-party notices

Pagewright is built on other people's work. This file lists everything shipped in the Pagewright
app and CLI that Pagewright's contributors did not write, with its licence. Tools used only for
testing or building assets are listed separately at the end; they are not shipped.

## Pagewright's own code

`crates/pagewright-core`, `crates/pagewright-ui`, `apps/*`, `tools/*`, `fixtures/generate.py`,
`brand/*`: written for Pagewright, licensed MIT OR Apache-2.0 (the same terms as the engine it is
built on). Copyright (c) 2026 the Pagewright contributors.

## WordCraft engine (vendored, modified)

`vendor/wordcraft/` — the document model, editing commands, layout, DOCX/ODT/RTF/HTML/Markdown/
text/LaTeX formats, rasteriser and PDF writer.

- Source: https://github.com/storytold/wordcraft, commit `e6c5a701ddff5be16e266028168c70658aae39d9`
- Copyright (c) 2026 ArtCraft Team and the WordCraft contributors
- Licence: MIT OR Apache-2.0 — [`vendor/wordcraft/LICENSE-MIT`](vendor/wordcraft/LICENSE-MIT),
  [`vendor/wordcraft/LICENSE-APACHE`](vendor/wordcraft/LICENSE-APACHE)
- Upstream notice: [`vendor/wordcraft/NOTICE`](vendor/wordcraft/NOTICE); asset attribution:
  [`vendor/wordcraft/ATTRIBUTION.md`](vendor/wordcraft/ATTRIBUTION.md)
- Modified by Pagewright: one patch (product name in file metadata and messages), described in
  [`vendor/wordcraft/UPSTREAM.md`](vendor/wordcraft/UPSTREAM.md) and included as
  [`vendor/wordcraft/patches/0001-product-identity.patch`](vendor/wordcraft/patches/0001-product-identity.patch).
- Not included: the ArtCraft name, wordmark and logos (trademarks, `docs/brand/` upstream) and
  WordCraft's app icon and Word-style front end.

Bundled with the engine (details and licence texts in `vendor/wordcraft/ATTRIBUTION.md` and
`vendor/wordcraft/assets/fonts/`):

- Fonts: Inter (Rasmus Andersson / The Inter Project Authors), Source Sans 3 and Source Serif 4
  (Adobe), JetBrains Mono (The JetBrains Mono Project Authors) — SIL Open Font License 1.1.
  Pagewright's interface also uses Inter, Source Serif 4 and JetBrains Mono from this folder.
- English word list and hyphenation (from Grady Ward's Moby Hyphenator II, public domain; patterns
  CC0-1.0); Polish, Portuguese and Italian TeX hyphenation patterns (MIT / BSD-3-Clause / MIT,
  notices in the files); supplementary word lists (MIT OR Apache-2.0).

## craft-libs (git dependency)

`craft-pdf` (PDF writer front end), `craft-print` (system print spooler) and the patched `krilla`
PDF backend, from https://github.com/storytold/craft-libs (revisions `c3487320` and `d27646a5`).
Copyright (c) 2026 ArtCraft Team and the craft-libs contributors. MIT OR Apache-2.0 —
[`docs/licenses/craft-libs/`](docs/licenses/craft-libs/). `krilla` is by Laurenz Stampfl and
contributors (MIT OR Apache-2.0).

## egui and its default fonts

The interface toolkit egui/eframe (Emil Ernerfeldt and contributors, MIT OR Apache-2.0) embeds
fallback fonts (`epaint_default_fonts`), shipped in the app binary:

- Ubuntu Light — Ubuntu Font Licence 1.0 ([`UFL.txt`](docs/licenses/egui-default-fonts/UFL.txt))
- Noto Emoji — SIL Open Font License 1.1 ([`OFL.txt`](docs/licenses/egui-default-fonts/OFL.txt))
- Hack — Hack licence (MIT with Bitstream Vera terms) ([`Hack-Regular.txt`](docs/licenses/egui-default-fonts/Hack-Regular.txt))
- emoji-icon-font — MIT ([`emoji-icon-font-mit-license.txt`](docs/licenses/egui-default-fonts/emoji-icon-font-mit-license.txt))

## All Rust crates

468 third-party crates (crates.io and the git sources above), every one under a permissive licence
or offering one (MIT, Apache-2.0, BSD-2/3-Clause, ISC, Zlib, BSL-1.0, Unicode-3.0, Unlicense,
0BSD; two crates offer GPL/LGPL only as an alternative, and Pagewright uses their MIT/Apache
option). Full list with versions and repositories: [`docs/licenses/rust-crates.md`](docs/licenses/rust-crates.md).

## Brand assets

The Pagewright name, mark, wordmark and app icon are original to this project. The wordmark is set
in Source Serif 4 Semibold (SIL OFL 1.1) and converted to outlines; no font software is
distributed as part of the logo files. No Microsoft logos, icons, illustrations or other assets
are included anywhere in Pagewright.

## Tools used in testing and asset generation (not shipped)

- Microsoft Open XML SDK (`DocumentFormat.OpenXml`, MIT), downloaded from NuGet when
  `tools/ooxml-validate` is built; used only to validate files.
- python-docx (MIT): generates the fixture suite. LibreOffice (MPL-2.0), poppler-utils (GPL),
  ImageMagick (ImageMagick licence), xdotool (BSD), Xvfb/Mesa (MIT), CUPS and CUPS-PDF (Apache-2.0 /
  GPL): independent consumers, renderers and test infrastructure invoked as separate programs.
- fontTools (MIT) and uharfbuzz (Apache-2.0): build the brand assets.
- REA (rea-agents, MIT): readiness checked with its read-only `doctor`/dry-run; not used on Word.

Microsoft and Microsoft Word are trademarks of the Microsoft group of companies. Pagewright is an
independent project, not affiliated with or endorsed by Microsoft or by the ArtCraft Team.
