#!/usr/bin/env python3
"""Compare Pagewright's PDF output with LibreOffice's for every fixture.

LibreOffice is an independent renderer of the same DOCX files, not Microsoft Word: agreement
means two different layout engines produce the same pages, not that Word would. For each fixture:
page counts, page size, and a visual difference score for page 1 (ImageMagick RMSE on 50-dpi
greyscale renders, 0 = identical, 1 = completely different). A contact sheet puts each pair side
by side.

    python3 tools/compare_pdf.py --cli target/release/pagewright-cli --out /tmp/pdfcmp
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIX = ROOT / "fixtures" / "docx"


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def pdfinfo(p: Path) -> dict:
    out = run(["pdfinfo", str(p)]).stdout
    pages = re.search(r"Pages:\s+(\d+)", out)
    size = re.search(r"Page size:\s+([\d.]+) x ([\d.]+)", out)
    return {"pages": int(pages.group(1)) if pages else None, "size": (float(size.group(1)), float(size.group(2))) if size else None}


def render(pdf: Path, out_prefix: Path, dpi: int = 50) -> Path:
    run(["pdftoppm", "-f", "1", "-l", "1", "-r", str(dpi), "-gray", "-png", str(pdf), str(out_prefix)])
    cands = sorted(out_prefix.parent.glob(out_prefix.name + "*.png"))
    return cands[0]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--cli", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    out = Path(a.out)
    shutil.rmtree(out, ignore_errors=True)
    (out / "pw").mkdir(parents=True)
    (out / "lo").mkdir(parents=True)
    report = {}
    pairs = []
    for f in sorted(FIX.glob("*.docx")):
        pw_pdf = out / "pw" / f"{f.stem}.pdf"
        run([a.cli, "convert", str(f), str(pw_pdf)])
        run(["soffice", "--headless", "--norestore", "--convert-to", "pdf", "--outdir", str(out / "lo"), str(f)], timeout=240)
        lo_pdf = out / "lo" / f"{f.stem}.pdf"
        r = {"pagewright": pdfinfo(pw_pdf) if pw_pdf.exists() else None, "libreoffice": pdfinfo(lo_pdf) if lo_pdf.exists() else None}
        if pw_pdf.exists() and lo_pdf.exists():
            a_png = render(pw_pdf, out / "pw" / f"{f.stem}-p1")
            b_png = render(lo_pdf, out / "lo" / f"{f.stem}-p1")
            # Same canvas size before comparing.
            b_resized = out / "lo" / f"{f.stem}-p1-resized.png"
            w_h = run(["identify", "-format", "%wx%h", str(a_png)]).stdout.strip()
            run(["convert", str(b_png), "-resize", f"{w_h}!", str(b_resized)])
            cmp = run(["compare", "-metric", "RMSE", str(a_png), str(b_resized), "null:"])
            m = re.search(r"\(([\d.]+)\)", cmp.stderr)
            r["page1_rmse"] = float(m.group(1)) if m else None
            pairs.append((f.stem, a_png, b_resized))
        r["pages_agree"] = bool(r["pagewright"] and r["libreoffice"] and r["pagewright"]["pages"] == r["libreoffice"]["pages"])
        report[f.stem] = r
        pw, lo = r["pagewright"] or {}, r["libreoffice"] or {}
        print(f"{f.stem:22} pages pw={pw.get('pages')} lo={lo.get('pages')} agree={r['pages_agree']!s:5} page1 RMSE={r.get('page1_rmse')}")
    # Contact sheet: label | Pagewright | LibreOffice, one row per fixture.
    rows = []
    for stem, a_png, b_png in pairs:
        row = out / f"row-{stem}.png"
        run(["convert", "(", str(a_png), "-bordercolor", "#BFB7A8", "-border", "1", ")", "(", str(b_png), "-bordercolor", "#BFB7A8", "-border", "1", ")",
             "+append", "-gravity", "north", "-background", "#ECE8E0", "-splice", "0x18", "-font", "DejaVu-Sans", "-pointsize", "12",
             "-annotate", "+0+2", f"{stem}   (left: Pagewright, right: LibreOffice)", str(row)])
        rows.append(str(row))
    if rows:
        run(["convert", *rows, "-background", "#ECE8E0", "-append", str(out / "contact-sheet.png")])
    (out / "report.json").write_text(json.dumps(report, indent=2))
    agree = sum(1 for r in report.values() if r["pages_agree"])
    print(f"page counts agree on {agree} of {len(report)} fixtures")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
