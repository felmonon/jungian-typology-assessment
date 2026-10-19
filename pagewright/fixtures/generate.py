#!/usr/bin/env python3
"""Generate Pagewright's synthetic DOCX fixture suite.

Every fixture is produced here, independently of the Pagewright/WordCraft engine, with
python-docx (MIT) or hand-written OOXML following ECMA-376 Part 1. No personal documents and no
files produced by Microsoft Word are used. Re-running this script is deterministic apart from the
timestamps python-docx writes into docProps/core.xml.

    python3 fixtures/generate.py            # writes fixtures/docx/*.docx and fixtures/corrupt/*
"""

from __future__ import annotations

import io
import random
import zipfile
from pathlib import Path

from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor

HERE = Path(__file__).resolve().parent
OUT = HERE / "docx"
BAD = HERE / "corrupt"

# Deterministic prose (original sentences, no lorem ipsum source text).
SUBJECTS = ["The committee", "Our field team", "The survey", "This proposal", "The archive", "A small group of readers",
            "The northern office", "Every draft", "The final report", "Each appendix"]
VERBS = ["recommends", "describes", "questions", "summarises", "revisits", "measures", "compares", "outlines"]
OBJECTS = ["the cost of the new reading room", "three ways to shorten the review cycle", "how volunteers record their hours",
           "the results of the spring pilot", "a plan for the winter schedule", "the history of the river crossing",
           "what changed after the second meeting", "the budget for printed materials"]
TAILS = ["in plain language.", "with careful attention to detail.", "before the next deadline.", "for the board.",
         "using last year's figures.", "and suggests a next step.", "without new spending.", "in the appendix."]


def sentence(rng: random.Random) -> str:
    return f"{rng.choice(SUBJECTS)} {rng.choice(VERBS)} {rng.choice(OBJECTS)} {rng.choice(TAILS)}"


def paragraph_text(rng: random.Random, n: int = 4) -> str:
    return " ".join(sentence(rng) for _ in range(n))


def add_field(paragraph, instr: str, placeholder: str = "1") -> None:
    """A complex field (w:fldChar begin/separate/end) as Word writes PAGE and NUMPAGES."""
    def run_with(child):
        r = OxmlElement("w:r")
        r.append(child)
        paragraph._p.append(r)

    begin = OxmlElement("w:fldChar"); begin.set(qn("w:fldCharType"), "begin"); run_with(begin)
    it = OxmlElement("w:instrText"); it.set(qn("xml:space"), "preserve"); it.text = f" {instr} "; run_with(it)
    sep = OxmlElement("w:fldChar"); sep.set(qn("w:fldCharType"), "separate"); run_with(sep)
    t = OxmlElement("w:t"); t.text = placeholder; run_with(t)
    end = OxmlElement("w:fldChar"); end.set(qn("w:fldCharType"), "end"); run_with(end)


def add_hyperlink(paragraph, url: str, text: str) -> None:
    part = paragraph.part
    r_id = part.relate_to(url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)
    link = OxmlElement("w:hyperlink"); link.set(qn("r:id"), r_id)
    run = OxmlElement("w:r"); rpr = OxmlElement("w:rPr")
    style = OxmlElement("w:rStyle"); style.set(qn("w:val"), "Hyperlink"); rpr.append(style)
    color = OxmlElement("w:color"); color.set(qn("w:val"), "0563C1"); rpr.append(color)
    u = OxmlElement("w:u"); u.set(qn("w:val"), "single"); rpr.append(u)
    run.append(rpr)
    t = OxmlElement("w:t"); t.text = text; t.set(qn("xml:space"), "preserve"); run.append(t)
    link.append(run)
    paragraph._p.append(link)


def save(doc: Document, name: str) -> None:
    doc.core_properties.author = "Pagewright fixture generator"
    doc.core_properties.title = name.replace("-", " ").title()
    path = OUT / f"{name}.docx"
    doc.save(path)
    print(f"wrote {path.relative_to(HERE.parent)}")


# ---------------------------------------------------------------------------------------------
# Ordinary documents (python-docx)
# ---------------------------------------------------------------------------------------------

def letter_simple() -> None:
    d = Document()
    st = d.styles["Normal"]; st.font.name = "Liberation Serif"; st.font.size = Pt(11)
    d.add_paragraph("19 October 2026")
    d.add_paragraph("Rivera & Okafor Bookbinding\n14 Mill Lane\nHarbourton HT2 9QP")
    d.add_paragraph("Dear Ms. Okafor,")
    p = d.add_paragraph("Thank you for the samples you sent last week. ")
    p.add_run("The linen covers").bold = True
    p.add_run(" were exactly what our reading group hoped for, and the ")
    p.add_run("deckle-edged").italic = True
    p.add_run(" endpapers drew several compliments.")
    d.add_paragraph("We would like to order forty copies in the same format. Could you confirm the price and an "
                    "approximate delivery date? We are happy to collect them from the workshop.")
    d.add_paragraph("Kind regards,")
    d.add_paragraph("Jordan Ellis\nSecretary, Harbourton Reading Circle")
    save(d, "letter-simple")


def report_styled() -> None:
    rng = random.Random(7)
    d = Document()
    d.add_heading("Annual Review of the Reading Room", level=0)
    sub = d.add_paragraph("Prepared for the board, October 2026"); sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    d.add_heading("1. Summary", level=1)
    p = d.add_paragraph(paragraph_text(rng, 5)); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    pf = p.paragraph_format; pf.space_before = Pt(6); pf.space_after = Pt(12); pf.line_spacing = 1.15
    d.add_heading("1.1 Highlights", level=2)
    p = d.add_paragraph()
    p.add_run("Bold, ").bold = True
    p.add_run("italic, ").italic = True
    r = p.add_run("underlined, "); r.underline = True
    r = p.add_run("struck, "); r.font.strike = True
    r = p.add_run("coloured"); r.font.color.rgb = RGBColor(0x1E, 0x6A, 0x5A)
    p.add_run(" and ")
    r = p.add_run("large"); r.font.size = Pt(16)
    p.add_run(" text; E = mc")
    r = p.add_run("2"); r.font.superscript = True
    p.add_run(" and H")
    r = p.add_run("2"); r.font.subscript = True
    p.add_run("O.")
    d.add_heading("1.2 Alignment", level=2)
    for text, al in [("Left aligned paragraph.", WD_ALIGN_PARAGRAPH.LEFT), ("Centred paragraph.", WD_ALIGN_PARAGRAPH.CENTER),
                     ("Right aligned paragraph.", WD_ALIGN_PARAGRAPH.RIGHT)]:
        d.add_paragraph(text).alignment = al
    q = d.add_paragraph("Quoted remarks from a member: the room is quieter and better lit than before.", style="Quote")
    q.paragraph_format.left_indent = Cm(1.5)
    d.add_heading("2. Detail", level=1)
    for _ in range(3):
        d.add_paragraph(paragraph_text(rng, 6)).paragraph_format.first_line_indent = Cm(0.75)
    d.add_paragraph().add_run().add_break(WD_BREAK.PAGE)
    d.add_heading("3. After the page break", level=1)
    d.add_paragraph(paragraph_text(rng, 4))
    d.add_heading("3.1 Third-level heading", level=3)
    d.add_paragraph(paragraph_text(rng, 3))
    save(d, "report-styled")


def lists_nested() -> None:
    d = Document()
    d.add_heading("Nested lists", level=1)
    d.add_paragraph("Packing list", style="List Bullet")
    d.add_paragraph("Waterproof jacket", style="List Bullet 2")
    d.add_paragraph("Hood folds into the collar", style="List Bullet 3")
    d.add_paragraph("Walking boots", style="List Bullet 2")
    d.add_paragraph("Food", style="List Bullet")
    d.add_paragraph("Steps", style="List Number")
    d.add_paragraph("Check the forecast", style="List Number 2")
    d.add_paragraph("Look at wind speed", style="List Number 3")
    d.add_paragraph("Tell someone the route", style="List Number 2")
    d.add_paragraph("Leave before nine", style="List Number")
    d.add_paragraph("Arrive at the hut", style="List Number")
    d.add_paragraph("A plain paragraph between lists.")
    d.add_paragraph("Mixed: numbered parent", style="List Number")
    d.add_paragraph("Bulleted child", style="List Bullet 2")
    save(d, "lists-nested")


def table_multipage() -> None:
    d = Document()
    d.add_heading("Inventory (multi-page table)", level=1)
    t = d.add_table(rows=1, cols=4)
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = t.rows[0]
    for cell, text in zip(hdr.cells, ["Item", "Shelf", "Count", "Condition"]):
        cell.text = text
        cell.paragraphs[0].runs[0].bold = True
        shd = OxmlElement("w:shd"); shd.set(qn("w:val"), "clear"); shd.set(qn("w:color"), "auto"); shd.set(qn("w:fill"), "D9E8E3")
        cell._tc.get_or_add_tcPr().append(shd)
    trpr = hdr._tr.get_or_add_trPr()
    th = OxmlElement("w:tblHeader"); trpr.append(th)  # repeat header row on each page
    rng = random.Random(11)
    for i in range(1, 151):
        row = t.add_row().cells
        row[0].text = f"Volume {i:03d}"
        row[1].text = f"{chr(65 + i % 8)}-{i % 12 + 1}"
        row[2].text = str(rng.randint(1, 40))
        row[3].text = rng.choice(["Good", "Fair", "Needs repair", "New"])
    merged = t.add_row().cells
    merged[0].merge(merged[3])
    merged[0].text = "Total rows: 150 (this row spans all four columns)"
    d.add_paragraph("Text after the table.")
    save(d, "table-multipage")


def make_png(w: int, h: int, seed: int) -> bytes:
    from PIL import Image, ImageDraw
    img = Image.new("RGB", (w, h), (247, 243, 234))
    dr = ImageDraw.Draw(img)
    rng = random.Random(seed)
    for y in range(h):
        c = int(200 - 120 * y / h)
        dr.line([(0, y), (w, y)], fill=(30, 106 + (c - 80) // 4, 90))
    for _ in range(12):
        x, y, r = rng.randint(0, w), rng.randint(0, h), rng.randint(8, 40)
        dr.ellipse([x - r, y - r, x + r, y + r], outline=(232, 185, 49), width=3)
    dr.rectangle([4, 4, w - 5, h - 5], outline=(28, 26, 23), width=4)
    buf = io.BytesIO(); img.save(buf, "PNG"); return buf.getvalue()


def make_jpeg(w: int, h: int) -> bytes:
    from PIL import Image, ImageDraw
    img = Image.new("RGB", (w, h), (28, 26, 23))
    dr = ImageDraw.Draw(img)
    for i in range(0, w, 20):
        dr.line([(i, 0), (w - i, h)], fill=(200, 80 + i % 120, 60), width=3)
    buf = io.BytesIO(); img.save(buf, "JPEG", quality=85); return buf.getvalue()


def images() -> None:
    d = Document()
    d.add_heading("Pictures", level=1)
    d.add_paragraph("An inline PNG, 3 inches wide:")
    d.add_picture(io.BytesIO(make_png(600, 400, 3)), width=Inches(3))
    d.add_paragraph("Figure 1. A generated gradient with rings.").alignment = WD_ALIGN_PARAGRAPH.CENTER
    d.add_paragraph("An inline JPEG, 2 inches wide, inside running text:")
    p = d.add_paragraph("Before the picture ")
    p.add_run().add_picture(io.BytesIO(make_jpeg(300, 300)), width=Inches(2))
    p.add_run(" after the picture.")
    save(d, "images")


def header_footer() -> None:
    rng = random.Random(5)
    d = Document()
    sec = d.sections[0]
    sec.page_width, sec.page_height = Cm(21.0), Cm(29.7)  # A4
    sec.left_margin = sec.right_margin = Inches(1.25)
    sec.top_margin = sec.bottom_margin = Inches(1)
    sec.different_first_page_header_footer = True
    sec.first_page_header.paragraphs[0].text = "FIRST PAGE HEADER: Harbourton Reading Circle"
    sec.header.paragraphs[0].text = "Running header: Minutes of the autumn meeting"
    fp = sec.footer.paragraphs[0]; fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    fp.add_run("Page "); add_field(fp, "PAGE"); fp.add_run(" of "); add_field(fp, "NUMPAGES", "3")
    d.add_heading("Minutes", level=1)
    for _ in range(14):
        d.add_paragraph(paragraph_text(rng, 6))
    new = d.add_section()
    new.orientation = WD_ORIENT.LANDSCAPE
    new.page_width, new.page_height = Cm(29.7), Cm(21.0)
    d.add_heading("Landscape section", level=1)
    d.add_paragraph(paragraph_text(rng, 5))
    save(d, "header-footer")


def unicode_mix() -> None:
    d = Document()
    d.add_heading("Unicode coverage", level=1)
    samples = [
        ("Latin with diacritics", "Crème brûlée, façade, naïve, Ångström, Łódź, São Paulo, Straße"),
        ("Greek", "Η γρήγορη καφέ αλεπού πηδά πάνω από τον τεμπέλη σκύλο."),
        ("Cyrillic", "Съешь же ещё этих мягких французских булок, да выпей чаю."),
        ("Chinese", "我能吞下玻璃而不伤身体。"),
        ("Japanese", "いろはにほへと ちりぬるを。日本語の文章です。"),
        ("Korean", "다람쥐 헌 쳇바퀴에 타고파."),
        ("Devanagari", "ऋषियों को सताने वाले दुष्ट राक्षसों के राजा रावण का सर्वनाश करने वाले"),
        ("Emoji and ZWJ", "Thumbs 👍🏽, family 👩‍👩‍👧, flag 🇳🇿, keycap 1️⃣"),
        ("Combining marks", "é ä ñ (decomposed) vs é ä ñ (precomposed)"),
        ("Math symbols", "∀x ∈ ℝ: x² ≥ 0; ∑ᵢ aᵢ ≤ ∞; √2 ≈ 1.414"),
    ]
    for label, text in samples:
        p = d.add_paragraph(); p.add_run(f"{label}: ").bold = True; p.add_run(text)
    for label, text in [("Arabic (RTL)", "نص عربي للاختبار مع أرقام ١٢٣"), ("Hebrew (RTL)", "טקסט בעברית לבדיקה")]:
        p = d.add_paragraph()
        ppr = p._p.get_or_add_pPr(); bidi = OxmlElement("w:bidi"); ppr.append(bidi)
        r = p.add_run(text); rpr = r._r.get_or_add_rPr(); rtl = OxmlElement("w:rtl"); rpr.append(rtl)
        p.add_run(f"  ({label})")
    save(d, "unicode")


def long_document() -> None:
    rng = random.Random(42)
    d = Document()
    d.add_heading("A Long Document", level=0)
    for chapter in range(1, 21):
        d.add_heading(f"Chapter {chapter}", level=1)
        for section in range(1, 4):
            d.add_heading(f"{chapter}.{section} Section", level=2)
            for _ in range(5):
                d.add_paragraph(paragraph_text(rng, rng.randint(4, 8)))
    save(d, "long-document")


def hyperlinks() -> None:
    d = Document()
    d.add_heading("Links", level=1)
    p = d.add_paragraph("Read the specification at ")
    add_hyperlink(p, "https://ecma-international.org/publications-and-standards/standards/ecma-376/", "ECMA-376")
    p.add_run(" or visit ")
    add_hyperlink(p, "https://example.org/reading-room?tab=hours&lang=en", "the reading room hours page")
    p.add_run(".")
    save(d, "hyperlinks")


# ---------------------------------------------------------------------------------------------
# Hand-written OOXML: content an editor may not model, which must not be silently dropped
# ---------------------------------------------------------------------------------------------

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
CT = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/comments.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"/>
<Override PartName="/customXml/itemProps1.xml" ContentType="application/vnd.openxmlformats-officedocument.customXmlProperties+xml"/>
</Types>"""
ROOT_RELS = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="{R}/officeDocument" Target="word/document.xml"/>
</Relationships>"""
DOC_RELS = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="{R}/comments" Target="comments.xml"/>
<Relationship Id="rId2" Type="{R}/customXml" Target="../customXml/item1.xml"/>
</Relationships>"""
COMMENTS = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:comments xmlns:w="{W}"><w:comment w:id="0" w:author="Reviewer A" w:date="2026-10-01T09:00:00Z" w:initials="RA">
<w:p><w:r><w:t>Please check this figure against the ledger.</w:t></w:r></w:p></w:comment></w:comments>"""
CUSTOM_ITEM = """<?xml version="1.0" encoding="UTF-8"?><catalogue xmlns="urn:example:pagewright-fixture"><record id="42">Keep me</record></catalogue>"""
CUSTOM_PROPS = """<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<ds:datastoreItem ds:itemID="{6C2E8A40-0D5B-4F43-9E0C-1B2A3C4D5E6F}" xmlns:ds="http://schemas.openxmlformats.org/officeDocument/2006/customXml"><ds:schemaRefs><ds:schemaRef ds:uri="urn:example:pagewright-fixture"/></ds:schemaRefs></ds:datastoreItem>"""
CUSTOM_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXmlProps" Target="itemProps1.xml"/></Relationships>"""


def unsupported_content() -> None:
    body = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="{W}" xmlns:r="{R}"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:x="urn:example:pagewright-ext" mc:Ignorable="x">
<w:body>
<w:p><w:r><w:t>Paragraph one: plain text that every editor keeps.</w:t></w:r></w:p>
<w:p><w:commentRangeStart w:id="0"/><w:r><w:t>Commented text: 1,284 volumes.</w:t></w:r><w:commentRangeEnd w:id="0"/><w:r><w:commentReference w:id="0"/></w:r></w:p>
<w:p><w:r><w:t xml:space="preserve">Tracked change: the meeting starts at </w:t></w:r><w:del w:id="1" w:author="Reviewer A" w:date="2026-10-01T09:05:00Z"><w:r><w:delText>nine</w:delText></w:r></w:del><w:ins w:id="2" w:author="Reviewer A" w:date="2026-10-01T09:05:00Z"><w:r><w:t>ten</w:t></w:r></w:ins><w:r><w:t>.</w:t></w:r></w:p>
<w:p><w:bookmarkStart w:id="3" w:name="budget_note"/><w:r><w:t>Bookmarked paragraph.</w:t></w:r><w:bookmarkEnd w:id="3"/></w:p>
<w:p><x:privateNote>An extension element in an ignorable namespace.</x:privateNote><w:r><w:t>Paragraph with an ignorable extension element before this run.</w:t></w:r></w:p>
<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>
</w:body></w:document>"""
    path = OUT / "unsupported-content.docx"
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", CT)
        z.writestr("_rels/.rels", ROOT_RELS)
        z.writestr("word/document.xml", body)
        z.writestr("word/_rels/document.xml.rels", DOC_RELS)
        z.writestr("word/comments.xml", COMMENTS)
        z.writestr("customXml/item1.xml", CUSTOM_ITEM)
        z.writestr("customXml/itemProps1.xml", CUSTOM_PROPS)
        z.writestr("customXml/_rels/item1.xml.rels", CUSTOM_RELS)
    print(f"wrote {path.relative_to(HERE.parent)}")


def corrupt() -> None:
    good = (OUT / "letter-simple.docx").read_bytes()
    (BAD / "truncated.docx").write_bytes(good[: len(good) // 2])
    (BAD / "not-a-zip.docx").write_bytes(b"<html><body><p>This is HTML renamed to .docx</p></body></html>")
    (BAD / "empty.docx").write_bytes(b"")
    with zipfile.ZipFile(BAD / "missing-document-part.docx", "w") as z:
        z.writestr("[Content_Types].xml", CT)
        z.writestr("_rels/.rels", ROOT_RELS)
    with zipfile.ZipFile(BAD / "malformed-xml.docx", "w") as z:
        z.writestr("[Content_Types].xml", CT)
        z.writestr("_rels/.rels", ROOT_RELS)
        z.writestr("word/document.xml", f'<w:document xmlns:w="{W}"><w:body><w:p><w:r><w:t>Unclosed')
    print("wrote corrupt/*.docx")


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True); BAD.mkdir(exist_ok=True)
    letter_simple(); report_styled(); lists_nested(); table_multipage(); images(); header_footer()
    unicode_mix(); long_document(); hyperlinks(); unsupported_content(); corrupt()
