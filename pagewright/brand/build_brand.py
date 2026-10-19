#!/usr/bin/env python3
"""Build Pagewright's logo assets from brand/tokens.json.

Writes SVGs (mark, wordmark, lockups, app icon) and PNG renders of the app icon. The wordmark is
Source Serif 4 Semibold (SIL OFL 1.1, bundled in vendor/wordcraft/assets/fonts), shaped with
HarfBuzz (uharfbuzz) and converted to outlines with fontTools, so the SVGs need no font.
PNGs are rasterised with headless Chromium (Playwright's build at /opt/pw-browsers).

    python3 brand/build_brand.py
"""

from __future__ import annotations

import json
import os
import subprocess
import tempfile
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
TOK = json.loads((HERE / "tokens.json").read_text())
B = TOK["color"]["brand"]
FONT = ROOT / TOK["font"]["display"]["file"]
CHROME = Path("/opt/pw-browsers/chromium-1194/chrome-linux/chrome")


def mark_svg(outline: str, page: str, fold: str, caret: str, lines: str | None) -> str:
    """The Folded Leaf: a page whose top-right corner is folded down (the ochre underside), with a
    text caret at its writing margin. 64-unit grid."""
    stroke = f' stroke="{outline}" stroke-width="2.5" stroke-linejoin="round"' if outline != "none" else ""
    text_lines = (
        f'<rect x="28" y="30" width="15" height="3" rx="1.5" fill="{lines}"/>'
        f'<rect x="28" y="38" width="11" height="3" rx="1.5" fill="{lines}"/>'
        if lines else ""
    )
    return (
        f'<path d="M14 9a3 3 0 0 1 3-3h21l12 12v37a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3Z" fill="{page}"{stroke}/>'
        f'<path d="M38 6v9a3 3 0 0 0 3 3h9Z" fill="{fold}"{stroke}/>'
        f'<rect x="20.5" y="25" width="3.5" height="20" rx="1.75" fill="{caret}"/>'
        f"{text_lines}"
    )


def wordmark_path(text: str, size: float) -> tuple[str, float, float]:
    """Outline `text` in the display face. Returns (svg path d, width, ascent) at `size` px."""
    blob = hb.Blob.from_file_path(str(FONT))
    face = hb.Face(blob)
    font = hb.Font(face)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": True})
    tt = TTFont(str(FONT))
    upem = tt["head"].unitsPerEm
    glyph_set = tt.getGlyphSet()
    order = tt.getGlyphOrder()
    scale = size / upem
    tracking = -0.012 * size  # slight negative tracking for display sizes
    pen = SVGPathPen(glyph_set)
    x = 0.0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        name = order[info.codepoint]
        t = TransformPen(pen, (scale, 0, 0, -scale, x + pos.x_offset * scale, -pos.y_offset * scale))
        glyph_set[name].draw(t)
        x += pos.x_advance * scale + tracking
    ascent = tt["OS/2"].sCapHeight * scale
    return pen.getCommands(), x - tracking, ascent


def write(name: str, svg: str) -> Path:
    p = HERE / name
    p.write_text(svg)
    print(f"wrote brand/{name}")
    return p


def render_png(svg_path: Path, size: int, out: Path) -> None:
    """Rasterise at 1024 px in a tall window (Chromium's viewport is shorter than the window and has
    a minimum width), crop to the square, then downscale with ImageMagick."""
    html = f"""<!doctype html><html><head><style>html,body{{margin:0;padding:0;background:transparent}}
img{{display:block;width:1024px;height:1024px}}</style></head><body><img src="{svg_path.as_uri()}"></body></html>"""
    with tempfile.TemporaryDirectory() as td:
        page = Path(td) / "r.html"
        big = Path(td) / "big.png"
        page.write_text(html)
        subprocess.run([str(CHROME), "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
                        "--default-background-color=00000000", "--window-size=1024,1300",
                        f"--screenshot={big}", page.as_uri()], check=True, capture_output=True, timeout=60)
        subprocess.run(["convert", str(big), "-crop", "1024x1024+0+0", "+repage", "-filter", "Lanczos",
                        "-resize", f"{size}x{size}", str(out)], check=True)
    print(f"wrote {out.relative_to(ROOT)}")


def main() -> None:
    ink, paper, vir, deep, ochre = B["ink"], B["paper"], B["viridian"], B["viridianDeep"], B["ochre"]
    light, dark = TOK["color"]["light"], TOK["color"]["dark"]

    # Mark: outlined page for UI use on light and dark surfaces.
    write("pagewright-mark.svg", f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Pagewright">'
          f'{mark_svg(ink, paper, ochre, vir, None)}</svg>\n')
    write("pagewright-mark-dark.svg", f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Pagewright">'
          f'{mark_svg(dark["text"], "#26302D", ochre, dark["accent"], None)}</svg>\n')

    # Wordmark and lockups.
    d, w, cap = wordmark_path("Pagewright", 48)
    wm_h = 64
    base = 46
    write("pagewright-wordmark.svg", f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -{base} {w:.1f} {wm_h}" role="img" aria-label="Pagewright">'
          f'<path d="{d}" fill="{ink}"/></svg>\n')
    for variant, mark_colors, text_color, bg in (
        ("", (ink, paper, ochre, vir), ink, None),
        ("-dark", (dark["text"], "#26302D", ochre, dark["accent"]), dark["text"], None),
    ):
        lock_w = 64 + 14 + w + 4
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {lock_w:.1f} 64" role="img" aria-label="Pagewright">'
               f'{mark_svg(*mark_colors, None)}'
               f'<g transform="translate(78 {base})"><path d="{d}" fill="{text_color}"/></g></svg>\n')
        write(f"pagewright-lockup{variant}.svg", svg)

    # App icon: 1024 canvas, rounded square in viridian, paper page with ochre fold and a tall
    # caret: a fresh page, ready to write. Flat offset shadow (no blur filter).
    page_d = "M14 9a3 3 0 0 1 3-3h21l12 12v37a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3Z"
    icon = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-label="Pagewright">'
        '<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0" stop-color="{vir}"/><stop offset="1" stop-color="{deep}"/></linearGradient></defs>'
        '<rect x="64" y="64" width="896" height="896" rx="200" fill="url(#bg)"/>'
        '<g transform="translate(160 160) scale(11)">'
        f'<path d="{page_d}" transform="translate(0 1.4)" fill="#071F1A" fill-opacity="0.45"/>'
        f'{mark_svg("none", paper, ochre, deep, None)}</g></svg>\n'
    )
    icon_path = write("pagewright-app-icon.svg", icon)
    small = (  # 16–48 px: no shadow, page fills more of the tile
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
        f'<rect x="1" y="1" width="62" height="62" rx="14" fill="{vir}"/>'
        f'<g transform="translate(-3.2 -3.2) scale(1.1)">{mark_svg("none", paper, ochre, deep, None)}</g></svg>\n'
    )
    small_path = write("pagewright-app-icon-small.svg", small)

    png = HERE / "png"
    png.mkdir(exist_ok=True)
    if CHROME.exists() and not os.environ.get("PAGEWRIGHT_SKIP_PNG"):
        for s in (64, 128, 256, 512, 1024):
            render_png(icon_path, s, png / f"pagewright-{s}.png")
        for s in (16, 24, 32, 48):
            render_png(small_path, s, png / f"pagewright-{s}.png")
    else:
        print("Chromium not found: PNGs not rendered")


if __name__ == "__main__":
    main()
