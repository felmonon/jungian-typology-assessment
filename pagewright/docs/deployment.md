# Deploying Pagewright

Pagewright is a desktop app, so "deploying" means building it for each operating system and
putting the files somewhere people can download them. Nothing has been released or published.
The source is visible to anyone, though: this repository is public, and the code is on the
`claude/friendly-rubin-tu258l` branch.

Checked 2026-10-20 in the Linux container. "Compiles" means `cargo check` passed, which is type
checking only: nothing was linked or run on that platform.

| Route | State | What was verified | What it still needs |
|---|---|---|---|
| **Linux .deb and portable .tar.gz** | **Ready to build** with `packaging/linux/build-packages.sh` | Package built with `dpkg-deb`. Installed into a throwaway dpkg root and removed again. The extracted app launched and opened a file; the extracted CLI converted to PDF and ODT. Under `strace` with an empty HOME it never touched the source tree: fonts and assets are compiled in | A place to host the files (for example GitHub Releases). The binaries need **glibc 2.39+** (Ubuntu 24.04, Debian 13, Fedora 40 or newer); build on Ubuntu 22.04 to reach older systems. Lintian not run. No real desktop session (menu entry, icon, file association) tested |
| AppImage, Flatpak | Not built | — | Tools aren't installed here, and the network policy blocks Flathub. An AppImage should be built from binaries compiled on an older base |
| **Windows** (x86-64) | **Compiles** (GNU and MSVC targets) | `cargo check --release -p pagewright -p pagewright-cli` passes | A Windows machine or CI runner to build, test and run. A code-signing certificate (paid) or Microsoft's signing service, without which SmartScreen warns on download. An installer (MSI/MSIX) or a zip |
| **macOS** (Apple Silicon) | **Compiles** | `cargo check` passes for `aarch64-apple-darwin` | A Mac or CI runner to build, test and run. The Apple Developer Program (US$99/year) for Developer ID signing and notarisation, without which Gatekeeper blocks the app. A `.app` bundle and `.dmg` |
| **Web** (in the browser, WebAssembly) | **Not runnable yet** | The engine and `pagewright-core` compile for `wasm32-unknown-unknown`. `pagewright-ui` compiles once one desktop-only call (recovery) is gated | A web entry point (eframe web runner, built with Trunk or wasm-bindgen). A browser `Platform`: open as upload, save as download, browser clipboard, print through the PDF. A wasm-safe clock: `SystemTime::now()`, used on every save, panics in WebAssembly. Recovery stored in the browser (IndexedDB) instead of threads and files. Hosting separate from the TypeJung site. Upstream WordCraft has a web front end (`apps/wordcraft-web`) to learn from |
| App stores (Microsoft Store, Mac App Store, Flathub) | Not started | — | Developer accounts, store review, sandboxing changes |

## Before a public release

These are product and legal decisions, not build steps:

1. **The name.** "Pagewright" is provisional and has had no trademark clearance (BRAND.md).
2. **Word compatibility.** No file has been opened in Microsoft Word ([G-03](known-gaps.md#g-03)).
   Don't describe it as a Word replacement until that's done.
3. **Real documents.** Only synthetic test files have been used ([G-04](known-gaps.md#g-04)).
4. **Where releases live.** This repository is the TypeJung website. A dedicated repository
   would keep app releases, issues and CI separate from the site.
5. **Maintainer and homepage.** The Linux package uses a placeholder maintainer address; there
   is no project URL yet.

## Building the Linux packages

```sh
cd pagewright
cargo build --release -p pagewright -p pagewright-cli
packaging/linux/build-packages.sh          # writes target/packages/out/*.deb, *.tar.gz, SHA256SUMS
```

The package installs `pagewright` and `pagewright-cli` to `/usr/bin`, a desktop entry
(`dev.pagewright.Pagewright`) with Word, OpenDocument and RTF file associations, icons, and
`/usr/share/doc/pagewright/copyright` with every licence and notice.
