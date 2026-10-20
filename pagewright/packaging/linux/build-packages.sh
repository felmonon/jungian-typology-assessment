#!/usr/bin/env bash
# Package the Linux release binaries as a .deb (dpkg-deb) and a portable .tar.gz.
#
#   cargo build --release -p pagewright -p pagewright-cli
#   packaging/linux/build-packages.sh [work-dir]      # default: target/packages
#
# Output goes to <work-dir>/out with SHA256SUMS. Publishes nothing; reads the source tree only.
# The binaries need the glibc they were built against (2.39 on Ubuntu 24.04); build on an older
# base for wider reach.
set -euo pipefail

SRC=$(cd "$(dirname "$0")/../.." && pwd)
REL=$SRC/target/release
W=${1:-$SRC/target/packages}
APP_ID=dev.pagewright.Pagewright
OUT=$W/out

VERSION=$("$REL/pagewright" --version | awk '{print $2}')
CLI_VERSION=$("$REL/pagewright-cli" --version | awk '{print $2}')
[ "$VERSION" = "$CLI_VERSION" ] || { echo "version mismatch: $VERSION vs $CLI_VERSION" >&2; exit 1; }
case "$VERSION" in [0-9]*.[0-9]*.[0-9]*) ;; *) echo "bad version '$VERSION'" >&2; exit 1 ;; esac
echo "==> Pagewright $VERSION"

DEB_NAME=pagewright_${VERSION}_amd64
TAR_NAME=pagewright-${VERSION}-linux-x86_64
DEB_ROOT=$W/stage-deb/$DEB_NAME
TAR_ROOT=$W/stage-tar/$TAR_NAME
rm -rf "$W/stage-deb" "$W/stage-tar" "$OUT"
mkdir -p "$OUT"

# ---------------------------------------------------------------- shared payload (written once)
PAY=$W/stage-payload
rm -rf "$PAY"
mkdir -p "$PAY"/{bin,applications,doc/licenses/wordcraft-fonts,doc/licenses/egui-default-fonts,doc/licenses/craft-libs}

install -m755 "$REL/pagewright" "$PAY/bin/pagewright"
install -m755 "$REL/pagewright-cli" "$PAY/bin/pagewright-cli"
strip "$PAY/bin/pagewright" "$PAY/bin/pagewright-cli"

cat > "$PAY/applications/$APP_ID.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Pagewright
GenericName=Word Processor
Comment=Write and edit documents; open and save Word files
Exec=pagewright %f
TryExec=pagewright
Icon=$APP_ID
Terminal=false
StartupNotify=true
StartupWMClass=$APP_ID
Categories=Office;WordProcessor;
Keywords=word;processor;document;docx;odt;rtf;writer;letter;report;
MimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document;application/vnd.oasis.opendocument.text;application/rtf;text/rtf;
EOF

# Licences and notices
install -m644 "$SRC/LICENSE-MIT" "$PAY/doc/LICENSE-MIT"
install -m644 "$SRC/LICENSE-APACHE" "$PAY/doc/LICENSE-APACHE"
install -m644 "$SRC/THIRD_PARTY_NOTICES.md" "$PAY/doc/THIRD_PARTY_NOTICES.md"
install -m644 "$SRC/vendor/wordcraft/NOTICE" "$PAY/doc/NOTICE.wordcraft"
install -m644 "$SRC/vendor/wordcraft/ATTRIBUTION.md" "$PAY/doc/ATTRIBUTION.wordcraft.md"
install -m644 "$SRC/vendor/wordcraft/LICENSE-MIT" "$PAY/doc/licenses/LICENSE-MIT.wordcraft"
install -m644 "$SRC"/vendor/wordcraft/assets/fonts/OFL-*.txt "$PAY/doc/licenses/wordcraft-fonts/"
install -m644 "$SRC"/docs/licenses/egui-default-fonts/* "$PAY/doc/licenses/egui-default-fonts/"
install -m644 "$SRC"/docs/licenses/craft-libs/* "$PAY/doc/licenses/craft-libs/"
install -m644 "$SRC/docs/licenses/rust-crates.md" "$PAY/doc/licenses/rust-crates.md"

COPYRIGHT=$PAY/doc/copyright
{
  cat <<'EOF'
Format: https://www.debian.org/doc/packaging-manuals/copyright-format/1.0/
Upstream-Name: Pagewright
Comment: Package of the Pagewright desktop word processor and CLI.
 Pagewright is built on the WordCraft engine (https://github.com/storytold/wordcraft,
 commit e6c5a701ddff5be16e266028168c70658aae39d9), vendored and modified (one patch:
 product identity). Pagewright is an independent project, not affiliated with or
 endorsed by Microsoft or by the ArtCraft Team. Paths such as docs/licenses/... in the
 notices below refer to the source tree; in this package those files are under
 /usr/share/doc/pagewright/licenses/ (or share/doc/pagewright/licenses/ in the tarball).
 .
 Also statically linked into the binaries:
  - craft-libs (craft-pdf, craft-print, patched krilla), Copyright 2026 ArtCraft Team
    and the craft-libs contributors; krilla by Laurenz Stampfl and contributors.
    MIT OR Apache-2.0. See licenses/craft-libs/.
  - egui/eframe default fonts (epaint_default_fonts): Ubuntu Light (Ubuntu Font
    Licence 1.0), Noto Emoji (OFL 1.1), Hack (MIT with Bitstream Vera terms),
    emoji-icon-font (MIT). Full texts in licenses/egui-default-fonts/.
  - 468 third-party Rust crates under permissive licences (MIT, Apache-2.0,
    BSD-2/3-Clause, ISC, Zlib, BSL-1.0, Unicode-3.0, Unlicense, 0BSD). Full list:
    licenses/rust-crates.md.

Files: *
Copyright: 2026 the Pagewright contributors
License: MIT or Apache-2.0
Comment: Pagewright's own code (crates/pagewright-core, crates/pagewright-ui, apps/*)
 and brand assets (name, mark, wordmark, app icon).

Files: vendor/wordcraft/*
Copyright: 2026 ArtCraft Team and the WordCraft contributors
License: MIT or Apache-2.0
Comment: Upstream NOTICE and ATTRIBUTION are reproduced in full below, and as
 NOTICE.wordcraft and ATTRIBUTION.wordcraft.md in this directory.

Files: vendor/wordcraft/assets/fonts/*
Copyright: Rasmus Andersson / The Inter Project Authors (Inter);
 Adobe (Source Sans 3, Source Serif 4); The JetBrains Mono Project Authors (JetBrains Mono)
License: OFL-1.1
Comment: Embedded in the binaries. Full texts: licenses/wordcraft-fonts/OFL-*.txt

License: MIT
EOF
  sed -e 's/^$/./' -e 's/^/ /' "$SRC/LICENSE-MIT"
  cat <<'EOF'

License: Apache-2.0
 Licensed under the Apache License, Version 2.0 (the "License"); you may not use
 this software except in compliance with the License. On Debian systems the full
 text is in /usr/share/common-licenses/Apache-2.0; a copy is also shipped as
 LICENSE-APACHE in this directory.

License: OFL-1.1
 SIL Open Font License, Version 1.1. Full texts: licenses/wordcraft-fonts/OFL-*.txt
 and licenses/egui-default-fonts/OFL.txt in this directory.

EOF
  echo "==========================================================================="
  echo "THIRD_PARTY_NOTICES.md (Pagewright)"
  echo "==========================================================================="
  cat "$SRC/THIRD_PARTY_NOTICES.md"
  echo
  echo "==========================================================================="
  echo "vendor/wordcraft/NOTICE (WordCraft engine, upstream)"
  echo "==========================================================================="
  cat "$SRC/vendor/wordcraft/NOTICE"
  echo
  echo "==========================================================================="
  echo "vendor/wordcraft/ATTRIBUTION.md (WordCraft engine, upstream)"
  echo "==========================================================================="
  cat "$SRC/vendor/wordcraft/ATTRIBUTION.md"
  # Full texts of licences that are not in /usr/share/common-licenses, so the copyright file
  # stands alone on systems that path-exclude /usr/share/doc/* except copyright.
  for f in "$SRC"/vendor/wordcraft/assets/fonts/OFL-*.txt "$SRC"/docs/licenses/egui-default-fonts/* \
           "$SRC"/docs/licenses/craft-libs/* "$SRC/vendor/wordcraft/LICENSE-MIT" "$SRC/docs/licenses/rust-crates.md"; do
    echo
    echo "==========================================================================="
    echo "${f#"$SRC"/}"
    echo "==========================================================================="
    cat "$f"
  done
} > "$COPYRIGHT"
chmod 644 "$COPYRIGHT"

# ---------------------------------------------------------------- .deb tree
install -Dm755 "$PAY/bin/pagewright" "$DEB_ROOT/usr/bin/pagewright"
install -Dm755 "$PAY/bin/pagewright-cli" "$DEB_ROOT/usr/bin/pagewright-cli"
install -Dm644 "$PAY/applications/$APP_ID.desktop" "$DEB_ROOT/usr/share/applications/$APP_ID.desktop"
for s in 16 24 32 48 64 128 256 512; do
  install -Dm644 "$SRC/brand/png/pagewright-$s.png" "$DEB_ROOT/usr/share/icons/hicolor/${s}x${s}/apps/$APP_ID.png"
done
install -Dm644 "$SRC/brand/pagewright-app-icon.svg" "$DEB_ROOT/usr/share/icons/hicolor/scalable/apps/$APP_ID.svg"
DOC=$DEB_ROOT/usr/share/doc/pagewright
mkdir -p "$DOC"
cp -R "$PAY/doc/." "$DOC/"
# Debian keeps the full Apache text in common-licenses; keep a copy anyway (the copyright file points at both).
printf '%s\n' \
  "pagewright ($VERSION) unstable; urgency=low" "" \
  "  * Package built from the release binaries (target/release)." "" \
  " -- Pagewright contributors <maintainers@pagewright.invalid>  $(date -R)" \
  | gzip -9n > "$DOC/changelog.gz"
chmod 644 "$DOC/changelog.gz"

INSTALLED_KB=$(du -sk --exclude=DEBIAN "$DEB_ROOT" | cut -f1)
mkdir -p "$DEB_ROOT/DEBIAN"
cat > "$DEB_ROOT/DEBIAN/control" <<EOF
Package: pagewright
Version: $VERSION
Architecture: amd64
Maintainer: Pagewright contributors <maintainers@pagewright.invalid>
Installed-Size: $INSTALLED_KB
Depends: libc6 (>= 2.39), libgcc-s1, libxkbcommon0, libx11-6 | libwayland-client0, libvulkan1 | libegl1
Recommends: libx11-xcb1, libxcb1, libxcursor1, libxi6, libxkbcommon-x11-0, libwayland-client0, libwayland-egl1, mesa-vulkan-drivers | libegl-mesa0, libdbus-1-3, xdg-desktop-portal, xdg-utils
Suggests: cups-client
Section: editors
Priority: optional
Description: local-first desktop word processor for .docx documents
 Pagewright edits real pages and keeps Word files intact: it opens and saves
 .docx, opens .odt, .rtf, .html, .md and .txt, prints through CUPS and exports
 PDF. It warns before a save could lose content the file contained.
 .
 Includes pagewright-cli, a headless converter (convert, check, text).
 .
 Built on the WordCraft engine (MIT OR Apache-2.0). Fonts, hyphenation data and
 brand assets are compiled into the binaries; windowing (X11 or Wayland) and the
 GPU (Vulkan, or EGL/OpenGL) are loaded at run time.
EOF
chmod 644 "$DEB_ROOT/DEBIAN/control"
find "$DEB_ROOT" -type d -exec chmod 755 {} +
( cd "$DEB_ROOT" && find usr -type f -print0 | sort -z | xargs -0 md5sum > DEBIAN/md5sums )
chmod 644 "$DEB_ROOT/DEBIAN/md5sums"

dpkg-deb --root-owner-group -Zxz --build "$DEB_ROOT" "$OUT/$DEB_NAME.deb"

# ---------------------------------------------------------------- portable tarball
mkdir -p "$TAR_ROOT"/{bin,share/applications,share/doc/pagewright}
install -m755 "$PAY/bin/pagewright" "$PAY/bin/pagewright-cli" "$TAR_ROOT/bin/"
install -m644 "$PAY/applications/$APP_ID.desktop" "$TAR_ROOT/share/applications/"
cp -R "$DEB_ROOT/usr/share/icons" "$TAR_ROOT/share/icons"
cp -R "$PAY/doc/." "$TAR_ROOT/share/doc/pagewright/"
cat > "$TAR_ROOT/README.txt" <<EOF
Pagewright $VERSION for Linux x86-64 (portable build)
=====================================================

Contents
  bin/pagewright        desktop app      (run: ./bin/pagewright [FILE])
  bin/pagewright-cli    command line     (./bin/pagewright-cli convert in.docx out.pdf | check | text)
  share/applications/   desktop entry ($APP_ID.desktop)
  share/icons/hicolor/  app icons
  share/doc/pagewright/ licences and third-party notices (copyright, THIRD_PARTY_NOTICES.md)

Requirements
  - glibc 2.39 or newer (Ubuntu 24.04+, Debian 13+, Fedora 40+ or similar)
  - X11 or Wayland, with libxkbcommon
  - Vulkan (libvulkan1 + Mesa drivers) or EGL/OpenGL
  - optional: xdg-desktop-portal (native Open/Save dialogs; otherwise a built-in chooser is
    used), xdg-utils (opening links), CUPS 'lp' (printing)
  Fonts, hyphenation data and the interface assets are compiled into the binaries; nothing is
  read from the source tree at run time.

Install for the current user (optional)
  mkdir -p ~/.local/bin ~/.local/share
  cp bin/pagewright bin/pagewright-cli ~/.local/bin/
  cp -R share/applications share/icons ~/.local/share/
  update-desktop-database ~/.local/share/applications 2>/dev/null || true
  (~/.local/bin must be on PATH for the menu entry's Exec=pagewright to work.)

Settings and recovery copies live in ~/.config/pagewright (PAGEWRIGHT_PROFILE_DIR overrides
it; PAGEWRIGHT_NO_RECOVERY=1 turns recovery copies off; PAGEWRIGHT_FILE_DIALOG=builtin|system
forces the file chooser).

Licence: MIT OR Apache-2.0. See share/doc/pagewright/copyright.
EOF
chmod 644 "$TAR_ROOT/README.txt"
tar --owner=0 --group=0 --numeric-owner --sort=name -C "$W/stage-tar" -czf "$OUT/$TAR_NAME.tar.gz" "$TAR_NAME"

( cd "$OUT" && sha256sum ./*.deb ./*.tar.gz > SHA256SUMS )
ls -la "$OUT"
