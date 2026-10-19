# Vendored WordCraft engine

Pagewright's document model, editing commands, layout, file formats, rasteriser and PDF writer are
**WordCraft's**, vendored here with only the small patch listed below. Pagewright did not write
this code and does not claim authorship of it.

| | |
|---|---|
| Upstream | https://github.com/storytold/wordcraft |
| Commit | `e6c5a701ddff5be16e266028168c70658aae39d9` (2026-10-19, "The caret and clicks land between the letters of a ligature") |
| Upstream version | 0.8.0 |
| Licence | MIT OR Apache-2.0, at your option ([LICENSE-MIT](LICENSE-MIT), [LICENSE-APACHE](LICENSE-APACHE)) |
| Copyright | Copyright (c) 2026 ArtCraft Team and the WordCraft contributors ([NOTICE](NOTICE)) |
| Asset attribution | [ATTRIBUTION.md](ATTRIBUTION.md) (upstream's, unmodified) |

## What is included

`crates/`: `geom`, `doc`, `fonts`, `proof`, `layout`, `docx`, `docbin`, `formats`, `render`,
`pdf`, `engine`, `metafile` (upstream layers L0–L4: the dependency closure of `wordcraft-engine`).

`assets/`: `fonts/` (Inter, JetBrains Mono, Source Sans 3, Source Serif 4, all SIL OFL 1.1, with
their licence texts), `hyphenation/` and `spelling/` (sources and licences in ATTRIBUTION.md).

## What is deliberately excluded

- `docs/brand/`: the ArtCraft name, wordmark and logos are ArtCraft trademarks, not open source,
  and their licence requires forks to remove them.
- `assets/app-icon/`: WordCraft's application icon. Pagewright has its own (`pagewright/brand/`).
- `crates/ui-egui` and `apps/*`: WordCraft's Word-style front end (ribbon, Backstage, keytips) and
  its apps. Pagewright's interface (`pagewright/crates/pagewright-ui`) is a separate, new front end
  written for Pagewright; it does not copy the ribbon UI.
- `crates/mcp`, `crates/zotero`, `crates/control-key`, `xtask`: not needed by Pagewright today.

ATTRIBUTION.md still lists the excluded files because it is kept verbatim; those rows do not
describe files shipped by Pagewright.

## Pagewright's patch

One patch, [`patches/0001-product-identity.patch`](patches/0001-product-identity.patch) (paths
relative to `crates/`), 16 files, +41/−20 lines:

- Adds `wordcraft_doc::product` (`set_name`/`name`, default "WordCraft").
- File metadata uses it: DOCX `docProps/app.xml` `Application`, PDF creator/producer, ODT, HTML,
  RTF and LaTeX generator, default comment author, sample document creator.
- User-facing messages that named WordCraft now use the product name or neutral wording (open
  errors, safe-save folder errors, encryption errors, read-only chart/SmartArt notes).

Internal identifiers are unchanged on purpose: `wordcraft:` passthrough keys, temporary-file
names, the `urn:wordcraft:canvas-xfrm` DrawingML extension URI, crate names. Changing them would
break interchange with files WordCraft writes and would misdescribe where the code comes from.

## Updating

1. Check out the new upstream commit next to this directory.
2. Copy the crates and assets listed above over `vendor/wordcraft/`.
3. Re-apply `patches/0001-product-identity.patch` (`git apply -p1 --directory=pagewright/vendor/wordcraft/crates`).
4. Update the commit above, run `cargo test` and `tools/roundtrip_check.py`, and review
   ATTRIBUTION.md for new assets.
