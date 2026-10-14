#!/usr/bin/env python3
"""Builds TypeJung's identity SVGs from one geometry.

The mark is "the reflection": a solid triangle standing on a horizon bar, and
its outline hanging below. Above the line sits the function you lead with;
below it, the one you are still growing toward (the dominant–inferior axis).

The wordmark is Instrument Sans (SIL OFL) at weight 600, width 88, outlined to
paths so the SVGs need no font. Re-run: python3 brand/build-identity.py
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'brand'
OUT.mkdir(parents=True, exist_ok=True)

RED = '#D7261E'
INK = '#121416'
PAPER = '#F5F5F2'

# ---- The mark (64-unit grid) ---------------------------------------------
def mark_paths(top, bar, low, weight=4, half=15, bar_x=6):
    """Return SVG elements for the mark on a 64x64 grid."""
    h0, h1 = 32 - weight / 2, 32 + weight / 2  # horizon bar
    apex_t, apex_b = 1, 63
    # Lower outline triangle as an even-odd ring: outer minus inner.
    # Inner triangle is the outer one inset by `weight` on every side.
    import math
    ox1, ox2, oy = 32 - half, 32 + half, h1
    # inset distance along edges: for a triangle, inset by w moves base down by w
    # and the slanted sides inward by w; compute inner via similar triangles.
    height = apex_b - oy
    side = math.hypot(half, height)
    # incenter-based scaling
    perim = 2 * side + 2 * half
    area = half * height
    r = 2 * area / perim               # inradius
    k = (r - weight) / r               # scale about incenter
    cx, cy = 32, oy + r * 1.0          # incenter y (base at oy, apex below)
    # incenter lies on axis at distance r from the base
    def s(px, py):
        return (cx + (px - cx) * k, cy + (py - cy) * k)
    i1, i2, i3 = s(ox1, oy), s(ox2, oy), s(32, apex_b)
    ring = (f'M{ox1} {oy}H{ox2}L32 {apex_b}Z'
            f'M{i1[0]:.2f} {i1[1]:.2f}L32 {i3[1]:.2f}L{i2[0]:.2f} {i2[1]:.2f}Z')
    return (
        f'<path fill="{top}" d="M32 {apex_t}L{32 + half} {h0}H{32 - half}Z"/>'
        f'<rect fill="{bar}" x="{bar_x}" y="{h0}" width="{64 - 2 * bar_x}" height="{weight}"/>'
        f'<path fill="{low}" fill-rule="evenodd" d="{ring}"/>'
    )

def svg(viewbox, body, title, w=None, h=None):
    size = f' width="{w}" height="{h}"' if w else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}"{size} '
            f'role="img" aria-labelledby="t"><title id="t">{title}</title>{body}</svg>\n')

VARIANTS = {
    'color': (RED, INK, INK),
    'dark': (RED, PAPER, PAPER),
    'mono-ink': (INK, INK, INK),
    'mono-paper': (PAPER, PAPER, PAPER),
}

for name, (t, b, l) in VARIANTS.items():
    (OUT / f'typejung-mark-{name}.svg').write_text(
        svg('0 0 64 64', mark_paths(t, b, l), 'TypeJung'))

# Favicon: heavier bar and outline so it survives 16px.
fav = mark_paths(RED, INK, INK, weight=7, half=19, bar_x=1)
(ROOT / 'public' / 'favicon.svg').write_text(svg('0 0 64 64', fav, 'TypeJung'))
(OUT / 'typejung-favicon.svg').write_text(svg('0 0 64 64', fav, 'TypeJung'))
# Square app icon on the night field, with a safe zone for maskable icons.
icon_body = (f'<rect width="64" height="64" fill="{INK}"/>'
             f'<g transform="translate(12 12) scale(.625)">{mark_paths(RED, PAPER, PAPER, weight=6)}</g>')
(ROOT / 'public' / 'icon-maskable.svg').write_text(svg('0 0 64 64', icon_body, 'TypeJung'))
app_body = (f'<rect width="64" height="64" fill="{PAPER}"/>'
            f'<g transform="translate(6 6) scale(.8125)">{mark_paths(RED, INK, INK, weight=5)}</g>')
(ROOT / 'public' / 'logo.svg').write_text(svg('0 0 64 64', mark_paths(RED, INK, INK), 'TypeJung'))
(OUT / 'typejung-app-icon.svg').write_text(svg('0 0 64 64', app_body, 'TypeJung'))

# ---- The wordmark ---------------------------------------------------------
font_path = next((ROOT / 'public' / 'fonts').glob('instrument-sans-latin-1.woff2'))
font = TTFont(font_path)
font.flavor = None
inst = instantiateVariableFont(font, {'wght': 600, 'wdth': 88}, inplace=False)
gs = inst.getGlyphSet()
cmap = inst.getBestCmap()
upm = inst['head'].unitsPerEm
hmtx = inst['hmtx']
TEXT = 'TypeJung'
TRACK = -0.034 * upm
x = 0.0
glyph_paths = []
for ch in TEXT:
    gname = cmap[ord(ch)]
    pen = SVGPathPen(gs, ntos=lambda v: ('%.1f' % v).rstrip('0').rstrip('.'))
    # flip y: font units are y-up
    tp = TransformPen(pen, (1, 0, 0, -1, x, 0))
    gs[gname].draw(tp)
    glyph_paths.append(pen.getCommands())
    x += hmtx[gname][0] + TRACK
advance = x - TRACK
ascent = inst['OS/2'].sCapHeight
desc = -inst['hhea'].descent
# Wordmark box: cap-height on top, descender (for y and g) below.
top = -ascent - 0.02 * upm
bottom = desc * 0.92
word_d = ''.join(glyph_paths)

def word_svg(fill, title='TypeJung'):
    vb = f'0 {top:.0f} {advance:.0f} {bottom - top:.0f}'
    return svg(vb, f'<path fill="{fill}" d="{word_d}"/>', title)

(OUT / 'typejung-wordmark-ink.svg').write_text(word_svg(INK))
(OUT / 'typejung-wordmark-paper.svg').write_text(word_svg(PAPER))

# ---- Lockups ----------------------------------------------------------------
# Mark sized to the wordmark's cap-height x 1.9, sitting on the baseline grid.
cap = ascent
mark_size = cap * 2.1
scale = mark_size / 64
gap = cap * 0.42
mark_y = -cap / 2 - mark_size / 2  # mark centred on the cap-height middle

def lockup(t, b, l, word_fill, name, title='TypeJung'):
    width = mark_size + gap + advance
    vb_top = min(mark_y, top)
    vb_h = max(mark_y + mark_size, bottom) - vb_top
    body = (f'<g transform="translate(0 {mark_y:.1f}) scale({scale:.4f})">{mark_paths(t, b, l)}</g>'
            f'<path fill="{word_fill}" transform="translate({mark_size + gap:.1f} 0)" d="{word_d}"/>')
    (OUT / name).write_text(svg(f'0 {vb_top:.0f} {width:.0f} {vb_h:.0f}', body, title))

lockup(RED, INK, INK, INK, 'typejung-lockup-color.svg')
lockup(RED, PAPER, PAPER, PAPER, 'typejung-lockup-dark.svg')
lockup(INK, INK, INK, INK, 'typejung-lockup-mono-ink.svg')
lockup(PAPER, PAPER, PAPER, PAPER, 'typejung-lockup-mono-paper.svg')

# ---- Social preview (1200x630) ---------------------------------------------
# Day field above the line with the headline; night field below it with the
# offer. The mark stands on the horizon at the right, its outline reflected
# into the night. All text is outlined so the SVG needs no font.
_instances = {}

def outline(text, size, wght=600, wdth=88, track=-0.02):
    """Outline `text` at `size` px. Returns (path d with baseline at y=0, width px)."""
    key = (wght, wdth)
    if key not in _instances:
        _instances[key] = instantiateVariableFont(font, {'wght': wght, 'wdth': wdth}, inplace=False)
    f = _instances[key]
    k = size / f['head'].unitsPerEm
    glyphs, cm, metrics = f.getGlyphSet(), f.getBestCmap(), f['hmtx']
    pen = SVGPathPen(glyphs, ntos=lambda v: ('%.1f' % v).rstrip('0').rstrip('.'))
    cursor = 0.0
    for ch in text:
        gname = cm[ord(ch)]
        glyphs[gname].draw(TransformPen(pen, (k, 0, 0, -k, cursor, 0)))
        cursor += metrics[gname][0] * k + track * size
    return pen.getCommands(), cursor - track * size

OG_W, OG_H, HORIZON = 1200, 630, 400
NIGHT_MUTED = '#A9AEB2'
og = [f'<rect width="{OG_W}" height="{OG_H}" fill="#FFFFFF"/>',
      f'<rect y="{HORIZON}" width="{OG_W}" height="{OG_H - HORIZON}" fill="{INK}"/>']
# Lockup, top left: mark plus wordmark at a 44px cap height.
lock_scale = 44 / cap
og.append(f'<g transform="translate(72 {72 + cap * lock_scale:.1f}) scale({lock_scale:.4f})">'
          f'<g transform="translate(0 {mark_y:.1f}) scale({scale:.4f})">{mark_paths(RED, INK, INK)}</g>'
          f'<path fill="{INK}" transform="translate({mark_size + gap:.1f} 0)" d="{word_d}"/></g>')
for line, baseline in (('See the pattern', 246), ('under your type.', 334)):
    d, _ = outline(line, 84, track=-0.03)
    og.append(f'<path fill="{INK}" transform="translate(68 {baseline})" d="{d}"/>')
d, _ = outline('42 questions. A free map of all eight functions.', 30, wght=500, wdth=100, track=0)
og.append(f'<path fill="{PAPER}" transform="translate(72 {HORIZON + 92})" d="{d}"/>')
d, _ = outline('typejung.com', 24, wght=500, wdth=100, track=0)
og.append(f'<path fill="{NIGHT_MUTED}" transform="translate(72 {OG_H - 64})" d="{d}"/>')
# The mark at 6.4x: its ink bar sits on the horizon and merges into the night.
mk = 6.4
og.append(f'<g transform="translate({1000 - 32 * mk:.1f} {HORIZON - (32 - 2) * mk:.1f}) scale({mk})">'
          f'{mark_paths(RED, INK, PAPER)}</g>')
(ROOT / 'public' / 'og-image.svg').write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{OG_W}" height="{OG_H}" viewBox="0 0 {OG_W} {OG_H}" '
    f'role="img" aria-labelledby="t"><title id="t">TypeJung: See the pattern under your type.</title>'
    + ''.join(og) + '</svg>\n')

# Export the wordmark path for React (header lockup renders inline).
(ROOT / 'components' / 'brand' / 'wordmarkPath.ts').write_text(
    '// Generated by brand/build-identity.py. Instrument Sans 600/88, outlined.\n'
    f"export const WORDMARK_VIEWBOX = '0 {top:.0f} {advance:.0f} {bottom - top:.0f}';\n"
    f"export const WORDMARK_PATH = '{word_d}';\n")
print('identity written to', OUT)
