//! Every core feature, built through engine commands the way the interface issues them, saved to
//! DOCX, checked structurally in the written package (independently of the engine's model), and
//! reopened. Also PDF export and clipboard round trips.

use std::io::Read;
use std::path::{Path, PathBuf};

use pagewright_core::fidelity::{self, Inventory};
use pagewright_core::{SaveOutcome, Workspace, identity};
use serde_json::{Value, json};
use wordcraft_engine::doc::StoryRef;

fn temp_dir(name: &str) -> PathBuf {
    let d = std::env::temp_dir().join(format!("pagewright-feat-{name}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&d);
    std::fs::create_dir_all(&d).unwrap();
    d
}

fn run(ws: &mut Workspace, id: &str, params: Value) -> Value {
    ws.session.run(id, &params).unwrap_or_else(|e| panic!("{id} {params}: {e}"))
}

fn typ(ws: &mut Workspace, text: &str) {
    run(ws, "text.insert", json!({ "text": text }));
}

fn enter(ws: &mut Workspace) {
    run(ws, "text.newParagraph", json!({}));
}

fn part(path: &Path, name: &str) -> String {
    let mut z = zip::ZipArchive::new(std::fs::File::open(path).unwrap()).unwrap();
    let mut s = String::new();
    if let Ok(mut f) = z.by_name(name) {
        f.read_to_string(&mut s).unwrap();
    }
    s
}

fn inventory(path: &Path) -> Inventory {
    let s = fidelity::scan_package(&std::fs::read(path).unwrap()).unwrap();
    assert!(!s.is_damaged(), "{:?}", s.damaged_parts);
    s.inventory
}

/// With `PAGEWRIGHT_TEST_OUT` set, keep a copy of an output for external validation.
fn keep(path: &Path) {
    if let Some(out) = std::env::var_os("PAGEWRIGHT_TEST_OUT") {
        let out = PathBuf::from(out);
        let _ = std::fs::create_dir_all(&out);
        let _ = std::fs::copy(path, out.join(path.file_name().unwrap()));
    }
}

fn picture_path() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../brand/png/pagewright-128.png")
}

/// Builds the feature document. Returns the workspace for further checks.
fn build() -> Workspace {
    let mut ws = Workspace::new_blank();
    typ(&mut ws, "Feature report");
    run(&mut ws, "para.heading1", json!({}));
    enter(&mut ws);
    typ(&mut ws, "Intro paragraph with a link and the word colour twice: colour.");
    // Hyperlink on the word "link".
    run(&mut ws, "select.text", json!({"text": "link"}));
    run(&mut ws, "insert.link", json!({"url": "https://example.org/report"}));
    run(&mut ws, "caret.docEnd", json!({}));
    enter(&mut ws);

    // Bulleted list, second item one level deeper, then a numbered list.
    run(&mut ws, "para.bullets", json!({}));
    typ(&mut ws, "First point");
    enter(&mut ws);
    run(&mut ws, "text.tab", json!({}));
    typ(&mut ws, "Nested point");
    enter(&mut ws);
    run(&mut ws, "text.backTab", json!({}));
    typ(&mut ws, "Second point");
    enter(&mut ws);
    run(&mut ws, "para.bullets", json!({"off": true}));
    run(&mut ws, "para.numbering", json!({}));
    typ(&mut ws, "Step one");
    enter(&mut ws);
    typ(&mut ws, "Step two");
    enter(&mut ws);
    run(&mut ws, "para.numbering", json!({"off": true}));

    // A 3 × 3 table with text in its first row; then continue after it.
    run(&mut ws, "insert.table", json!({"rows": 3, "cols": 3}));
    for (i, t) in ["Item", "Shelf", "Count"].iter().enumerate() {
        if i > 0 {
            run(&mut ws, "text.tab", json!({}));
        }
        typ(&mut ws, t);
    }
    run(&mut ws, "table.insertRowBelow", json!({}));
    run(&mut ws, "caret.docEnd", json!({}));
    typ(&mut ws, "After the table.");
    enter(&mut ws);

    // A picture, then a page break and a second page.
    run(&mut ws, "insert.picture", json!({"path": picture_path().to_string_lossy(), "alt": "Pagewright icon"}));
    enter(&mut ws);
    run(&mut ws, "text.pageBreak", json!({}));
    typ(&mut ws, "Second page text with colour.");

    // Page setup, header and page numbers.
    run(&mut ws, "layout.size", json!({"name": "A4"}));
    run(&mut ws, "layout.orientation", json!({"value": "landscape"}));
    run(&mut ws, "layout.margins", json!({"preset": "narrow"}));
    run(&mut ws, "insert.header", json!({"text": "Running header"}));
    run(&mut ws, "insert.closeHeader", json!({}));
    run(&mut ws, "insert.pageNumber", json!({"position": "bottom", "align": "center"}));
    run(&mut ws, "insert.closeHeader", json!({}));

    // Find and replace across the document.
    let r = run(&mut ws, "edit.replaceAll", json!({"text": "colour", "with": "color"}));
    assert_eq!(r["replaced"], 3, "{r}");
    ws
}

#[test]
fn every_core_feature_survives_save_and_reopen() {
    identity::init();
    let dir = temp_dir("all");
    let path = dir.join("features.docx");
    let mut ws = build();
    assert!(matches!(ws.save_as(&path, false).unwrap(), SaveOutcome::Saved { .. }));

    let inv = inventory(&path);
    let el = |k: &str| inv.elements.get(k).copied().unwrap_or(0);
    let parts = |k: &str| inv.parts.get(k).copied().unwrap_or(0);
    assert_eq!(el("tables"), 1, "{inv:?}");
    assert_eq!(el("table rows"), 4, "3 rows plus one inserted");
    assert_eq!(el("hyperlinks"), 1);
    assert!(el("pictures or drawings") >= 1 && parts("media") >= 1, "{inv:?}");
    assert!(el("page breaks") >= 1);
    assert!(el("fields") >= 1, "PAGE field in the footer: {inv:?}");
    assert!(parts("header") >= 1 && parts("footer") >= 1, "{inv:?}");

    let doc = part(&path, "word/document.xml");
    assert!(doc.matches("<w:numPr>").count() >= 5, "list paragraphs carry numbering");
    assert!(doc.contains("w:orient=\"landscape\""), "landscape section");
    assert!(doc.contains("w:w=\"16838\""), "A4 landscape width in twips");
    assert!(part(&path, "word/numbering.xml").contains("w:numFmt w:val=\"bullet\""));
    assert!(part(&path, "word/numbering.xml").contains("w:numFmt w:val=\"decimal\""));
    let rels = part(&path, "word/_rels/document.xml.rels");
    assert!(rels.contains("https://example.org/report") && rels.contains("TargetMode=\"External\""));
    assert!(doc.contains("descr=\"Pagewright icon\""), "picture alt text written");
    let footers: String = (1..6).map(|i| part(&path, &format!("word/footer{i}.xml"))).collect();
    assert!(footers.contains("PAGE"), "page number field");
    let headers: String = (1..6).map(|i| part(&path, &format!("word/header{i}.xml"))).collect();
    assert!(headers.contains("Running header"));

    keep(&path);
    // Reopen: same text, same structure, nothing flagged as unkeepable.
    let text_before = ws.session.doc.plain_text(StoryRef::Body);
    drop(ws);
    let ws = Workspace::open(&path).unwrap();
    assert!(ws.notices.is_empty(), "{:?}", ws.notices);
    assert_eq!(ws.session.doc.plain_text(StoryRef::Body), text_before);
    assert!(!text_before.contains("colour"));
    assert!(text_before.contains("Nested point"));
}

#[test]
fn nested_list_levels_are_written() {
    identity::init();
    let dir = temp_dir("lists");
    let path = dir.join("lists.docx");
    let mut ws = build();
    ws.save_as(&path, false).unwrap();
    let doc = part(&path, "word/document.xml");
    // The nested bullet is at level 1, the others at level 0.
    let nested = doc.find("Nested point").unwrap();
    let para_start = doc[..nested].rfind("<w:p>").or_else(|| doc[..nested].rfind("<w:p ")).unwrap();
    assert!(doc[para_start..nested].contains("<w:ilvl w:val=\"1\"/>"), "{}", &doc[para_start..nested]);
}

#[test]
fn pdf_export_matches_the_layout() {
    identity::init();
    let dir = temp_dir("pdf");
    let mut ws = build();
    let pages = ws.session.layout().pages.len();
    assert!(pages >= 2, "page break gives at least two pages");
    let pdf = dir.join("features.pdf");
    assert!(matches!(ws.export(&pdf).unwrap(), SaveOutcome::Exported { .. }));
    keep(&pdf);
    let bytes = std::fs::read(&pdf).unwrap();
    assert!(bytes.starts_with(b"%PDF-"));
    let text = String::from_utf8_lossy(&bytes);
    let count = text.matches("/Type /Page").count() - text.matches("/Type /Pages").count();
    let count = if count == 0 { text.matches("/Type/Page").count() - text.matches("/Type/Pages").count() } else { count };
    assert_eq!(count, pages, "one PDF page per laid-out page");
}

#[test]
fn rich_clipboard_round_trip_keeps_formatting() {
    let mut a = Workspace::new_blank();
    typ(&mut a, "Plain and bold words.");
    run(&mut a, "select.text", json!({"text": "bold"}));
    run(&mut a, "format.bold", json!({}));
    run(&mut a, "select.all", json!({}));
    let copied = run(&mut a, "edit.copy", json!({}));
    let html = copied["html"].as_str().expect("copy offers HTML for other apps").to_string();
    assert!(html.contains("bold"));
    assert_eq!(copied["text"].as_str().unwrap().trim(), "Plain and bold words.");

    // Paste the HTML into another document, as from the system clipboard.
    let mut b = Workspace::new_blank();
    run(&mut b, "edit.paste", json!({"html": html, "text": "Plain and bold words."}));
    assert_eq!(b.session.doc.plain_text(StoryRef::Body).trim(), "Plain and bold words.");
    run(&mut b, "select.text", json!({"text": "bold"}));
    assert_eq!(b.session.caret_props().bold, Some(true), "formatting survived the clipboard");
    run(&mut b, "select.text", json!({"text": "Plain"}));
    assert_ne!(b.session.caret_props().bold, Some(true));

    // Cut removes, undo restores.
    run(&mut a, "select.text", json!({"text": "and "}));
    run(&mut a, "edit.cut", json!({}));
    assert_eq!(a.session.doc.plain_text(StoryRef::Body).trim(), "Plain bold words.");
    run(&mut a, "edit.undo", json!({}));
    assert_eq!(a.session.doc.plain_text(StoryRef::Body).trim(), "Plain and bold words.");
}

#[test]
fn recovery_keeps_unsaved_work_and_never_touches_the_original() {
    identity::init();
    let dir = temp_dir("recovery");
    let original = dir.join("letter.docx");
    let mut ws = Workspace::new_blank();
    typ(&mut ws, "Saved text.");
    ws.save_as(&original, false).unwrap();
    let saved_bytes = std::fs::read(&original).unwrap();

    // A session with recovery on, edited but not saved.
    let root = dir.join("profile/recovery");
    let mut ws = Workspace::open(&original).unwrap();
    ws.session.enable_recovery(root.clone(), std::sync::Arc::new(|| {})).unwrap();
    typ(&mut ws, " Unsaved addition.");
    // The worker snapshots at most every ten seconds after a change; tick until it has.
    let deadline = std::time::Instant::now() + std::time::Duration::from_secs(40);
    while std::time::Instant::now() < deadline {
        ws.session.recovery_tick();
        if std::fs::read_dir(&root).map(|d| d.flatten().any(|e| e.path().is_dir() || e.path().extension().is_some_and(|x| x == "json"))).unwrap_or(false)
            && !ws.session.recovery_busy()
        {
            break;
        }
        std::thread::sleep(std::time::Duration::from_millis(200));
    }
    // Simulate a crash: drop without saving.
    drop(ws);
    assert_eq!(std::fs::read(&original).unwrap(), saved_bytes, "recovery never writes the original");

    // Next start: the copy is offered and restores the unsaved text.
    let mut next = Workspace::new_blank();
    next.session.enable_recovery(root, std::sync::Arc::new(|| {})).unwrap();
    let deadline = std::time::Instant::now() + std::time::Duration::from_secs(20);
    while !next.session.recovery_ready() && std::time::Instant::now() < deadline {
        next.session.recovery_tick();
        std::thread::sleep(std::time::Duration::from_millis(100));
    }
    let docs = next.session.recovery_documents();
    assert_eq!(docs.len(), 1, "{docs:?}");
    let before = next.session.document_id();
    next.session.run("file.recover", &json!({"restore": docs[0].id})).unwrap();
    let deadline = std::time::Instant::now() + std::time::Duration::from_secs(20);
    while next.session.document_id() == before && std::time::Instant::now() < deadline {
        next.session.recovery_tick();
        std::thread::sleep(std::time::Duration::from_millis(100));
    }
    next.adopt_recovered();
    let text = next.session.doc.plain_text(StoryRef::Body);
    assert!(text.contains("Saved text.") && text.contains("Unsaved addition."), "{text:?}");
    assert!(next.is_dirty() && next.path().is_none(), "a restored copy is unsaved and has no file");
}

#[test]
fn typing_into_a_new_table_fills_cells_without_extra_paragraphs() {
    let mut ws = Workspace::new_blank();
    typ(&mut ws, "Before");
    enter(&mut ws);
    run(&mut ws, "insert.table", json!({"rows": 2, "cols": 3}));
    for (i, t) in ["Item", "Shelf", "Count"].iter().enumerate() {
        if i > 0 {
            run(&mut ws, "text.tab", json!({}));
        }
        typ(&mut ws, t);
    }
    let doc = &ws.session.doc;
    let cells: Vec<String> = doc.para_paths(StoryRef::Body).into_iter().filter(|p| p.cell().is_some()).map(|p| format!("{:?}={:?}", p.0, doc.para(StoryRef::Body, &p).unwrap().plain_text())).collect();
    assert!(cells.iter().any(|c| c.ends_with("=\"Item\"")), "{cells:?}");
    assert_eq!(cells.iter().filter(|c| c.contains("[1, 0, 0,")).count(), 1, "first cell has one paragraph: {cells:?}");
}

#[test]
fn bold_with_the_caret_after_a_space_applies_to_new_text_only() {
    let mut ws = Workspace::new_blank();
    typ(&mut ws, "Plain ");
    run(&mut ws, "format.bold", json!({}));
    typ(&mut ws, "strong");
    let para = ws.session.doc.para_at(&ws.session.sel.focus).unwrap().clone();
    let marks: String = para.plain_text().char_indices().map(|(i, c)| if para.props_of_char(i).bold == Some(true) { c.to_ascii_uppercase() } else { c }).collect();
    assert_eq!(marks, "Plain STRONG", "only the newly typed word is bold");
}
