//! Vertical slice 1 and the file-safety rules, end to end through the real engine and real files.
//! Fixtures come from fixtures/generate.py (python-docx and hand-written OOXML).

use std::io::Read;
use std::path::{Path, PathBuf};

use pagewright_core::fidelity;
use pagewright_core::{Concern, FileKind, Notice, SaveOutcome, SaveStatus, Workspace, identity};
use serde_json::json;
use wordcraft_engine::doc::StoryRef;

fn fixtures() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../fixtures")
}

fn temp_dir(name: &str) -> PathBuf {
    let d = std::env::temp_dir().join(format!("pagewright-test-{name}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&d);
    std::fs::create_dir_all(&d).unwrap();
    d
}

fn run(ws: &mut Workspace, id: &str, params: serde_json::Value) {
    ws.session.run(id, &params).unwrap_or_else(|e| panic!("{id}: {e}"));
}

fn select(ws: &mut Workspace, text: &str) {
    run(ws, "select.text", json!({ "text": text }));
}

fn zip_part(path: &Path, part: &str) -> String {
    let mut z = zip::ZipArchive::new(std::fs::File::open(path).unwrap()).unwrap();
    let mut s = String::new();
    z.by_name(part).unwrap().read_to_string(&mut s).unwrap();
    s
}

#[test]
fn slice1_create_type_format_save_close_reopen() {
    identity::init();
    let dir = temp_dir("slice1");
    let path = dir.join("Letter to the board.docx");

    let mut ws = Workspace::new_blank();
    assert_eq!(ws.save_status(), SaveStatus::NeverSaved { edited: false });
    assert_eq!(ws.title(), "Untitled");

    run(&mut ws, "text.insert", json!({"text": "Quarterly letter"}));
    run(&mut ws, "para.heading1", json!({}));
    run(&mut ws, "text.newParagraph", json!({}));
    run(&mut ws, "text.insert", json!({"text": "Dear reader, this part is bold and this part is italic."}));
    select(&mut ws, "bold");
    run(&mut ws, "format.bold", json!({}));
    select(&mut ws, "italic");
    run(&mut ws, "format.italic", json!({}));
    select(&mut ws, "Dear reader");
    run(&mut ws, "format.size", json!({"size": 14}));
    run(&mut ws, "format.color", json!({"color": "1E6A5A"}));
    run(&mut ws, "para.alignCenter", json!({}));
    assert!(ws.is_dirty());
    assert_eq!(ws.save_status(), SaveStatus::NeverSaved { edited: true });

    // Save with no file asks for a location; Save As writes it.
    assert_eq!(ws.save(false).unwrap(), SaveOutcome::NeedsLocation { suggested: None });
    assert_eq!(ws.save_as(&path, false).unwrap(), SaveOutcome::Saved { path: path.clone() });
    assert!(!ws.is_dirty());
    assert!(matches!(ws.save_status(), SaveStatus::Saved { .. }));
    assert_eq!(ws.title(), "Letter to the board.docx");
    drop(ws); // close

    // Structurally a real package with Pagewright in its metadata, not HTML renamed.
    let bytes = std::fs::read(&path).unwrap();
    assert!(bytes.starts_with(b"PK\x03\x04"));
    assert!(zip_part(&path, "docProps/app.xml").contains("<Application>Pagewright</Application>"));
    assert!(fidelity::scan_package(&bytes).is_ok_and(|s| !s.is_damaged()));

    // Reopen: content and formatting intact.
    let mut ws = Workspace::open(&path).unwrap();
    assert!(ws.notices.is_empty(), "{:?}", ws.notices);
    let text = ws.session.doc.plain_text(StoryRef::Body);
    assert!(text.starts_with("Quarterly letter\n"), "{text:?}");
    assert!(text.contains("Dear reader, this part is bold and this part is italic."));
    run(&mut ws, "caret.docStart", json!({}));
    let first = ws.session.doc.para_at(&ws.session.sel.focus).unwrap();
    assert_eq!(first.props.style.as_deref(), Some("Heading1"));
    select(&mut ws, "bold");
    assert_eq!(ws.session.caret_props().bold, Some(true));
    select(&mut ws, "italic");
    assert_eq!(ws.session.caret_props().italic, Some(true));
    select(&mut ws, "Dear reader");
    let p = ws.session.caret_props();
    assert_eq!(p.size, Some(14.0));
    assert_eq!(p.color, Some(wordcraft_engine::doc::props::TextColor::Rgb(wordcraft_engine::doc::props::Rgb(0x1E, 0x6A, 0x5A))));
    let para = ws.session.doc.para_at(&ws.session.sel.focus).unwrap();
    assert_eq!(format!("{:?}", para.props.align), "Some(Center)");
    assert!(!ws.is_dirty());
}

#[test]
fn undo_and_redo_restore_text_and_formatting() {
    let mut ws = Workspace::new_blank();
    run(&mut ws, "text.insert", json!({"text": "alpha beta"}));
    select(&mut ws, "beta");
    run(&mut ws, "format.bold", json!({}));
    assert_eq!(ws.session.caret_props().bold, Some(true));
    run(&mut ws, "edit.undo", json!({}));
    select(&mut ws, "beta");
    assert_ne!(ws.session.caret_props().bold, Some(true));
    run(&mut ws, "edit.redo", json!({}));
    select(&mut ws, "beta");
    assert_eq!(ws.session.caret_props().bold, Some(true));
    run(&mut ws, "edit.undo", json!({}));
    run(&mut ws, "edit.undo", json!({}));
    assert_eq!(ws.session.doc.plain_text(StoryRef::Body).trim(), "");
}

#[test]
fn content_the_engine_cannot_keep_blocks_silent_overwrite_and_copy_keeps_original() {
    identity::init();
    let dir = temp_dir("unsupported");
    let orig = dir.join("unsupported-content.docx");
    std::fs::copy(fixtures().join("docx/unsupported-content.docx"), &orig).unwrap();
    let before = std::fs::read(&orig).unwrap();

    let mut ws = Workspace::open(&orig).unwrap();
    let losses = ws.file().unwrap().untouched_losses.clone();
    assert!(losses.iter().any(|l| l.what.contains("privateNote")), "{losses:?}");
    assert!(ws.notices.iter().any(|n| matches!(n, Notice::WillLose { .. })));

    run(&mut ws, "caret.docEnd", json!({}));
    run(&mut ws, "text.insert", json!({"text": " Edited."}));
    match ws.save(false).unwrap() {
        SaveOutcome::NeedsConfirmation { concerns, .. } => assert!(matches!(concerns[0], Concern::WillLose { .. })),
        other => panic!("expected confirmation, got {other:?}"),
    }
    assert_eq!(std::fs::read(&orig).unwrap(), before, "original untouched until confirmed");

    let copy = dir.join("unsupported-content (Pagewright).docx");
    assert_eq!(ws.save_as(&copy, false).unwrap(), SaveOutcome::Saved { path: copy.clone() });
    assert_eq!(std::fs::read(&orig).unwrap(), before, "saving a copy leaves the original byte-for-byte");
    assert!(ws.notices.iter().any(|n| matches!(n, Notice::OriginalKept { .. })));
    // The copy kept what the engine models: comments, tracked changes, bookmark, custom XML.
    let s = fidelity::scan_package(&std::fs::read(&copy).unwrap()).unwrap();
    assert_eq!(s.inventory.elements.get("tracked insertions"), Some(&1));
    assert_eq!(s.inventory.elements.get("comments"), Some(&1));
    assert_eq!(s.inventory.parts.get("customXml"), Some(&1));

    // Explicit confirmation replaces the original.
    let mut ws = Workspace::open(&orig).unwrap();
    assert!(matches!(ws.save(true).unwrap(), SaveOutcome::Saved { .. }));
    assert_ne!(std::fs::read(&orig).unwrap(), before);
}

#[test]
fn damaged_and_mismatched_files_open_with_notices_and_need_confirmation() {
    let dir = temp_dir("damaged");
    for (name, want) in [("malformed-xml.docx", "Damaged"), ("not-a-zip.docx", "FormatMismatch")] {
        let p = dir.join(name);
        std::fs::copy(fixtures().join("corrupt").join(name), &p).unwrap();
        let before = std::fs::read(&p).unwrap();
        let mut ws = Workspace::open(&p).unwrap_or_else(|e| panic!("{name}: {e}"));
        assert!(ws.notices.iter().any(|n| format!("{n:?}").starts_with(want)), "{name}: {:?}", ws.notices);
        assert!(matches!(ws.save(false).unwrap(), SaveOutcome::NeedsConfirmation { .. }), "{name}");
        assert_eq!(std::fs::read(&p).unwrap(), before);
    }
}

#[test]
fn unreadable_files_fail_with_a_message_and_empty_files_open_blank() {
    for name in ["truncated.docx", "missing-document-part.docx"] {
        let e = Workspace::open(&fixtures().join("corrupt").join(name)).err().unwrap_or_else(|| panic!("{name} opened"));
        assert!(!e.is_empty() && !e.contains("panicked"), "{name}: {e}");
        assert!(!e.starts_with("not a valid") && !e.starts_with("missing part"), "{name}: plain language first: {e}");
    }
    let ws = Workspace::open(&fixtures().join("corrupt/empty.docx")).unwrap();
    assert_eq!(ws.session.doc.plain_text(StoryRef::Body).trim(), "");
}

#[test]
fn lossy_home_formats_ask_once_and_exports_keep_the_documents_home() {
    let dir = temp_dir("formats");
    let mut ws = Workspace::new_blank();
    run(&mut ws, "text.insert", json!({"text": "Format test"}));
    let odt = dir.join("t.odt");
    match ws.save_as(&odt, false).unwrap() {
        SaveOutcome::NeedsConfirmation { concerns, .. } => assert!(matches!(concerns[0], Concern::LossyFormat { format: FileKind::OpenDocument, .. })),
        o => panic!("{o:?}"),
    }
    assert!(matches!(ws.save_as(&odt, true).unwrap(), SaveOutcome::Saved { .. }));
    run(&mut ws, "text.insert", json!({"text": " again"}));
    assert!(matches!(ws.save(false).unwrap(), SaveOutcome::Saved { .. }), "asked once per file per session");

    let docx = dir.join("t.docx");
    assert!(matches!(ws.save_as(&docx, false).unwrap(), SaveOutcome::Saved { .. }));
    run(&mut ws, "text.insert", json!({"text": " unsaved"}));
    for ext in ["pdf", "txt", "html", "md"] {
        let out = dir.join(format!("t.{ext}"));
        assert_eq!(ws.export(&out).unwrap(), SaveOutcome::Exported { path: out.clone() });
        assert!(out.metadata().unwrap().len() > 0, "{ext}");
        assert!(ws.is_dirty(), "export keeps unsaved state ({ext})");
        assert_eq!(ws.path(), Some(docx.as_path()), "export keeps the home ({ext})");
    }
    assert!(std::fs::read(dir.join("t.pdf")).unwrap().starts_with(b"%PDF"));
    assert!(std::fs::read_to_string(dir.join("t.txt")).unwrap().contains("Format test again unsaved"));
}

#[test]
fn clean_fixtures_report_no_losses() {
    for entry in std::fs::read_dir(fixtures().join("docx")).unwrap() {
        let p = entry.unwrap().path();
        if p.file_stem().unwrap() == "unsupported-content" {
            continue;
        }
        let ws = Workspace::open(&p).unwrap();
        assert!(ws.notices.is_empty(), "{}: {:?}", p.display(), ws.notices);
    }
}
