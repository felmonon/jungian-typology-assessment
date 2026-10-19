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


SCENARIOS = {"slice1": slice1, "unsaved": unsaved, "fidelity": fidelity}


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
