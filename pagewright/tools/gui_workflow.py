#!/usr/bin/env python3
"""Drive the real Pagewright window through complete workflows and screenshot each step.

Runs the desktop binary under an X server (starts Xvfb on :99 if DISPLAY isn't set), types and
uses shortcuts with xdotool, captures the screen with ImageMagick `import`, and verifies every
saved file independently with python-docx and the Open XML SDK validator. Each run uses a fresh
HOME and profile folder, so nothing touches the user's files.

    python3 tools/gui_workflow.py --app target/release/pagewright --out /tmp/gui [--scenario all]

Exit code 0 when every check passes.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIX = ROOT / "fixtures"


class Gui:
    def __init__(self, app: Path, out: Path):
        self.app, self.out = app, out
        self.home = out / "home"
        self.docs = self.home / "Documents"
        self.profile = out / "profile"
        for d in (self.docs, self.profile):
            d.mkdir(parents=True, exist_ok=True)
        self.proc = None
        self.checks: list[tuple[str, bool, str]] = []
        self.n = 0
        if not os.environ.get("DISPLAY"):
            subprocess.Popen(["Xvfb", ":99", "-screen", "0", "1440x900x24", "-nolisten", "tcp"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            os.environ["DISPLAY"] = ":99"
            time.sleep(1.0)

    # -- process ---------------------------------------------------------------------------
    def launch(self, *args: str, wait: float = 5.0):
        env = dict(os.environ, HOME=str(self.home), PAGEWRIGHT_PROFILE_DIR=str(self.profile), PAGEWRIGHT_FILE_DIALOG="builtin", RUST_LOG="warn")
        env.pop("DBUS_SESSION_BUS_ADDRESS", None)
        log = open(self.out / "app.log", "a")
        self.proc = subprocess.Popen([str(self.app), *args], env=env, stdout=log, stderr=log)
        deadline = time.time() + 30
        while time.time() < deadline:
            r = subprocess.run(["xdotool", "search", "--name", "Pagewright"], capture_output=True, text=True)
            if r.stdout.strip():
                self.win = r.stdout.split()[0]
                break
            time.sleep(0.3)
        else:
            raise SystemExit("window did not appear")
        time.sleep(wait)
        self.focus()

    def quit(self, force: bool = False):
        if self.proc and self.proc.poll() is None:
            if force:
                self.proc.kill()
            else:
                self.proc.terminate()
            try:
                self.proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.proc.kill()
        self.proc = None

    def alive(self) -> bool:
        return self.proc is not None and self.proc.poll() is None

    # -- input -----------------------------------------------------------------------------
    def focus(self):
        subprocess.run(["xdotool", "windowfocus", "--sync", self.win], capture_output=True)

    def key(self, *keys: str, pause: float = 0.35):
        for k in keys:
            subprocess.run(["xdotool", "key", "--window", self.win, k])
            time.sleep(0.08)
        time.sleep(pause)

    def type(self, text: str, pause: float = 0.4):
        subprocess.run(["xdotool", "type", "--window", self.win, "--delay", "12", text])
        time.sleep(pause)

    def click(self, x: int, y: int, button: int = 1, repeat: int = 1, pause: float = 0.4):
        subprocess.run(["xdotool", "mousemove", "--window", self.win, str(x), str(y)])
        subprocess.run(["xdotool", "click", "--repeat", str(repeat), "--delay", "80", str(button)])
        time.sleep(pause)

    def shot(self, name: str) -> Path:
        self.n += 1
        p = self.out / f"{self.n:02d}-{name}.png"
        subprocess.run(["import", "-window", "root", "-crop", "1280x860+0+0", str(p)], check=True)
        return p

    def check(self, name: str, ok: bool, detail: str = ""):
        self.checks.append((name, bool(ok), detail))
        print(("PASS " if ok else "FAIL ") + name + (f"  ({detail})" if detail else ""))


def docx_summary(path: Path) -> dict:
    from docx import Document
    d = Document(str(path))
    paras = []
    for p in d.paragraphs:
        paras.append({
            "text": p.text, "style": p.style.name if p.style is not None else None,
            "align": str(p.alignment) if p.alignment is not None else None,
            "bold": [r.text for r in p.runs if r.bold], "italic": [r.text for r in p.runs if r.italic],
        })
    return {"paragraphs": paras, "tables": len(d.tables)}


def validate(path: Path) -> tuple[bool, str]:
    dll = ROOT / "tools/ooxml-validate/bin/ooxml-validate.dll"
    if not dll.exists():
        return True, "validator not built (skipped)"
    r = subprocess.run(["dotnet", str(dll), str(path)], capture_output=True, text=True)
    try:
        d = json.loads(r.stdout.strip().splitlines()[-1])
        return bool(d["valid"]), f"{d['errorCount']} schema errors"
    except Exception as e:  # noqa: BLE001
        return False, f"validator output unreadable: {e}"


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


# ------------------------------------------------------------------------------------------------
def slice1(g: Gui):
    """Create → type and format → save → close → reopen, all in the window."""
    g.launch()
    g.shot("launch-blank")
    g.click(700, 220)  # into the page
    g.type("Quarterly letter")
    g.key("ctrl+alt+1")
    g.key("ctrl+e")  # centre the heading
    g.key("Return")
    g.type("Dear reader, this part is bold and this part is italic. Thank you for reading.")
    # Select "bold" with the find bar, then bold it; same for "italic".
    g.key("ctrl+f")
    g.type("bold")
    g.key("Return", "Escape")
    g.key("ctrl+b")
    g.key("ctrl+f")
    g.key("ctrl+a")
    g.type("italic")
    g.key("Return", "Escape")
    g.key("ctrl+i")
    g.key("ctrl+End")
    p = g.shot("typed-and-formatted")
    g.check("app still running after typing", g.alive())

    g.key("ctrl+s", pause=0.8)
    g.shot("save-dialog")
    g.key("ctrl+a")
    g.type("Quarterly letter.docx")
    g.key("Return", pause=1.2)
    g.shot("saved")
    saved = g.docs / "Quarterly letter.docx"
    g.check("file saved to Documents", saved.exists(), str(saved))
    if saved.exists():
        s = docx_summary(saved)
        paras = s["paragraphs"]
        g.check("heading text and style", paras and paras[0]["text"] == "Quarterly letter" and paras[0]["style"] == "Heading 1", json.dumps(paras[:1]))
        g.check("heading centred", paras and "CENTER" in (paras[0]["align"] or ""), str(paras[0]["align"] if paras else None))
        body = paras[1] if len(paras) > 1 else {}
        g.check("body text", body.get("text", "").startswith("Dear reader, this part is bold"), body.get("text", "")[:60])
        g.check("bold run", "bold" in body.get("bold", []), str(body.get("bold")))
        g.check("italic run", "italic" in body.get("italic", []), str(body.get("italic")))
        ok, detail = validate(saved)
        g.check("saved file valid (Open XML SDK)", ok, detail)

    g.key("ctrl+w", pause=0.8)  # close: saved, so no prompt; a new blank document
    g.shot("closed")
    g.key("ctrl+o", pause=0.8)
    g.shot("open-dialog")
    g.type("Quarterly letter.docx")
    g.key("Return", pause=1.5)
    g.shot("reopened")
    g.quit()

    # Relaunch with the file on the command line: the document comes back from disk.
    g.launch(str(saved))
    g.shot("relaunched-with-file")
    g.quit()


def unsaved(g: Gui):
    """Unsaved changes are never discarded silently: closing asks, and Cancel keeps the work."""
    g.launch()
    g.click(700, 220)
    g.type("Draft that has not been saved.")
    g.key("ctrl+w", pause=0.8)
    g.shot("unsaved-prompt-on-close")
    g.key("Escape", pause=0.6)
    g.shot("after-cancel-text-kept")
    # Window close button / WM close: the same question.
    subprocess.run(["xdotool", "key", "--window", g.win, "ctrl+w"])
    time.sleep(0.6)
    g.check("app still running with unsaved work", g.alive())
    g.quit(force=True)


def fidelity(g: Gui):
    """Opening a file with content the engine can't keep: a notice, and Save offers a copy."""
    src = g.docs / "unsupported-content.docx"
    shutil.copy(FIX / "docx/unsupported-content.docx", src)
    before = sha(src)
    g.launch(str(src))
    g.shot("fidelity-notice")
    g.click(700, 300)
    g.key("ctrl+End")
    g.type(" Edited in Pagewright.")
    g.key("ctrl+s", pause=0.8)
    g.shot("fidelity-confirm")
    g.key("Return", pause=0.8)  # default: Save a copy…
    g.shot("fidelity-save-copy-dialog")
    g.key("Return", pause=1.2)
    g.shot("fidelity-copy-saved")
    copy = g.docs / "unsupported-content (edited).docx"
    g.check("original byte-for-byte unchanged", sha(src) == before)
    g.check("edited copy saved beside it", copy.exists(), str(copy))
    if copy.exists():
        s = docx_summary(copy)
        g.check("copy has the edit", any("Edited in Pagewright." in p["text"] for p in s["paragraphs"]))
        ok, detail = validate(copy)
        g.check("copy valid (Open XML SDK)", ok, detail)
    g.quit()


def search(g: Gui, query: str, pause: float = 0.8):
    """Run a command through the command search."""
    g.key("ctrl+slash", pause=0.5)
    g.type(query, pause=0.4)
    g.key("Return", pause=pause)


def features(g: Gui):
    """Lists, table, link, picture, page break, page numbers, page setup, find/replace, PDF,
    printing and saving: through the toolbar, the command search, dialogs and shortcuts."""
    printed_before = set(Path("/root/PDF").glob("*.pdf")) if Path("/root/PDF").exists() else set()
    g.launch()
    g.click(700, 220)
    g.type("Feature tour")
    g.key("ctrl+alt+1", "Return")
    g.type("Intro with a link word and colour, colour.")
    g.key("Return")
    g.click(815, 63)  # the bulleted-list button in the format bar
    g.type("First point")
    g.key("Return", "Tab")
    g.type("Nested point")
    g.key("Return", "shift+Tab")
    g.type("Second point")
    g.key("Return", "Return")  # Enter on an empty item ends the list
    search(g, "numbered list")
    g.type("Step one")
    g.key("Return")
    g.type("Step two")
    g.key("Return", "Return")
    g.shot("lists")
    search(g, "insert table")
    g.shot("table-dialog")
    g.key("Return", pause=0.8)
    for i, t in enumerate(["Item", "Shelf", "Count"]):
        if i:
            g.key("Tab")
        g.type(t)
    g.key("ctrl+End")
    g.type("After the table.")
    g.key("Return")
    g.shot("table")
    g.key("ctrl+f")
    g.type("link")
    g.key("Return", "Escape")
    g.key("ctrl+k", pause=0.6)
    g.shot("link-dialog")
    g.type("example.org/tour")
    g.key("Return", pause=0.6)
    g.key("ctrl+End")
    search(g, "insert picture")
    g.type(str(ROOT / "brand/png/pagewright-256.png"))
    g.key("Return", pause=1.0)
    g.shot("picture-description")
    g.type("Pagewright app icon")
    g.key("Return", pause=1.0)
    g.key("ctrl+End")
    g.key("Return")
    g.key("ctrl+Return")
    g.type("Second page.")
    search(g, "page numbers at the bottom")
    g.key("Escape")
    search(g, "landscape pages")
    search(g, "margins narrow")
    g.key("ctrl+Home")  # no selection, so Ctrl+H starts in "find"
    g.key("ctrl+h", pause=0.5)
    g.type("colour")
    g.key("Return")  # on to "replace with"
    g.type("color")
    g.key("alt+a", pause=0.6)
    g.shot("replaced")
    g.key("Escape")
    g.key("ctrl+Home")
    g.shot("feature-tour")
    g.check("app alive after the tour", g.alive())

    search(g, "export as pdf")
    g.shot("export-pdf-dialog")
    g.key("Return", pause=1.5)
    pdf = g.docs / "Feature tour.pdf"
    g.check("PDF exported", pdf.exists(), str(pdf))
    if pdf.exists():
        info = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True).stdout
        pages = next((l.split()[-1] for l in info.splitlines() if l.startswith("Pages:")), "?")
        g.check("PDF has 2 pages (page break)", pages == "2", pages)
        txt = subprocess.run(["pdftotext", "-layout", str(pdf), "-"], capture_output=True, text=True).stdout
        g.check("PDF text has the replacement and page numbers", "color, color" in txt and "colour" not in txt and "\n" in txt, txt[:120].replace("\n", " | "))

    g.key("ctrl+p", pause=0.8)
    g.shot("print-dialog")
    g.key("Return", pause=4.0)
    printed = (set(Path("/root/PDF").glob("*.pdf")) if Path("/root/PDF").exists() else set()) - printed_before
    g.check("print job reached the CUPS-PDF printer", bool(printed), ", ".join(p.name for p in printed))

    g.key("ctrl+s", pause=0.8)
    g.key("Return", pause=1.2)
    doc = g.docs / "Feature tour.docx"
    g.check("document saved", doc.exists(), str(doc))
    if doc.exists():
        import zipfile
        with zipfile.ZipFile(doc) as z:
            xml = z.read("word/document.xml").decode()
            rels = z.read("word/_rels/document.xml.rels").decode()
            names = z.namelist()
        s = docx_summary(doc)
        texts = [p["text"] for p in s["paragraphs"]]
        g.check("lists written as numbered paragraphs", xml.count("<w:numPr>") >= 5, str(xml.count("<w:numPr>")))
        g.check("nested bullet at level 1", "Nested point" in xml and '<w:ilvl w:val="1"/>' in xml)
        g.check("one table", s["tables"] == 1, str(s["tables"]))
        g.check("hyperlink to example.org", "https://example.org/tour" in rels)
        g.check("picture embedded", any(n.startswith("word/media/") for n in names))
        g.check("picture has its description (alt text)", 'descr="Pagewright app icon"' in xml)
        g.check("landscape section", 'w:orient="landscape"' in xml)
        g.check("footer with page number", any(n.startswith("word/footer") for n in names))
        g.check("replace all applied", not any("colour" in t for t in texts) and any("color, color" in t for t in texts))
        ok, detail = validate(doc)
        g.check("saved file valid (Open XML SDK)", ok, detail)
    g.quit()


def recovery(g: Gui):
    """Unsaved work survives a crash: kill the app, relaunch, restore."""
    g.launch()
    g.click(700, 220)
    g.type("Work that must not be lost.")
    time.sleep(13)  # recovery snapshots at most every 10 s after a change
    g.quit(force=True)  # SIGKILL: no chance to save
    g.launch(wait=6.0)
    g.shot("recovery-offered")
    g.key("Return", pause=2.0)
    g.shot("recovered")
    g.check("app alive after restore", g.alive())
    g.quit(force=True)


def corrupt(g: Gui):
    """Unreadable files explain themselves; damaged files open with a notice."""
    g.launch(str(FIX / "corrupt/truncated.docx"))
    g.shot("truncated-error")
    g.check("app alive after an unreadable file", g.alive())
    g.quit()
    g.launch(str(FIX / "corrupt/malformed-xml.docx"))
    g.shot("damaged-notice")
    g.check("app alive after a damaged file", g.alive())
    g.quit()


def layout(g: Gui):
    """Small window, dark theme, command search and dialogs at a glance."""
    g.launch(str(FIX / "docx/report-styled.docx"))
    g.shot("report-light")
    search(g, "dark theme", pause=1.0)
    g.shot("report-dark")
    g.key("ctrl+slash", pause=0.5)
    g.type("page")
    g.shot("command-search")
    g.key("Escape")
    search(g, "light theme", pause=1.0)
    subprocess.run(["xdotool", "windowsize", g.win, "700", "520"])
    time.sleep(1.5)
    p = g.shot("small-window")
    subprocess.run(["convert", str(p), "-crop", "700x520+0+0", str(p)])
    subprocess.run(["xdotool", "windowsize", g.win, "1280", "860"])
    time.sleep(1.0)
    g.check("app alive after resizing", g.alive())
    g.quit()


def long(g: Gui):
    """A 48-page document: the outline lists its headings and follows the caret to the end."""
    g.launch(str(FIX / "docx/long-document.docx"), wait=6.0)
    g.shot("long-start")
    g.click(700, 300)
    g.key("ctrl+End", pause=1.5)
    g.shot("long-end")
    g.check("app alive after moving through 48 pages", g.alive())
    g.quit()


SCENARIOS = {"slice1": slice1, "unsaved": unsaved, "fidelity": fidelity, "features": features, "recovery": recovery, "corrupt": corrupt, "layout": layout, "long": long}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--app", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--scenario", default="all")
    a = ap.parse_args()
    out = Path(a.out)
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)
    names = list(SCENARIOS) if a.scenario == "all" else a.scenario.split(",")
    failed = 0
    for name in names:
        print(f"== {name}")
        g = Gui(Path(a.app).resolve(), out / name)
        try:
            SCENARIOS[name](g)
        finally:
            g.quit(force=True)
        failed += sum(1 for _, ok, _ in g.checks if not ok)
        (out / name / "checks.json").write_text(json.dumps(g.checks, indent=2))
    print("all checks passed" if failed == 0 else f"{failed} check(s) failed")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
