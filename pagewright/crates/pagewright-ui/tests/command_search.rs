//! Every command the search offers runs against a real document without an error, or says why
//! it's unavailable. No entry may name an unknown command or need a dialog Pagewright lacks.

use pagewright_ui::palette::{self, ENTRIES};
use pagewright_ui::{AppOptions, NoPlatform, PagewrightApp};
use serde_json::json;

fn app() -> PagewrightApp {
    let ctx = egui::Context::default();
    let mut app = PagewrightApp::new(&ctx, Box::new(NoPlatform::default()), AppOptions::default());
    for (id, p) in [
        ("text.insert", json!({"text": "Title line"})),
        ("text.newParagraph", json!({})),
        ("text.insert", json!({"text": "Body text with colour and a link here."})),
        ("text.newParagraph", json!({})),
    ] {
        assert!(app.command(id, p), "setup {id}");
    }
    app
}

fn into_table(app: &mut PagewrightApp) {
    if app.ws.session.sel.focus.path.cell().is_none() {
        app.command("caret.docEnd", json!({}));
        app.command("insert.table", json!({"rows": 3, "cols": 3}));
        app.command("text.insert", json!({"text": "cell"}));
    }
    assert!(app.ws.session.sel.focus.path.cell().is_some());
}

#[test]
fn every_entry_names_a_real_command() {
    let a = app();
    for e in ENTRIES {
        if !e.id.starts_with("pw.") {
            assert!(a.ws.session.registry.get(e.id).is_some(), "{} names unknown command {}", e.label, e.id);
        }
        assert!(serde_json::from_str::<serde_json::Value>(e.params).is_ok(), "{}: bad params", e.label);
    }
}

#[test]
fn every_entry_runs_or_explains_why_not() {
    let mut a = app();
    let mut ran = 0;
    for e in ENTRIES {
        a.toast = None;
        a.dialog = None;
        a.search = None;
        a.find.open = false;
        if e.group == "Table" {
            into_table(&mut a);
        } else if a.ws.session.sel.focus.path.cell().is_some() {
            a.command("caret.docEnd", json!({}));
        }
        if matches!(e.id, "pw.cut" | "pw.copy" | "insert.removeLink") {
            a.command("select.text", json!({"text": "link"}));
            if e.id == "insert.removeLink" {
                a.command("insert.link", json!({"url": "https://example.org"}));
            }
        }
        if let Some(why) = palette::unavailable(&a, e) {
            assert!(!why.trim().is_empty(), "{} is unavailable without a reason", e.label);
            continue;
        }
        palette::run(&mut a, e);
        ran += 1;
        if let Some(t) = &a.toast {
            assert!(!t.warn, "{} ({}) failed: {}", e.label, e.id, t.text);
        }
        // Undo what changed the document so the next entry starts from a usable state.
        if matches!(e.id, "table.deleteTable" | "pw.new" | "pw.close") {
            a.command("text.insert", json!({"text": "Body text with colour and a link here."}));
        }
    }
    assert!(ran >= ENTRIES.len() - 3, "only {ran} of {} entries ran", ENTRIES.len());
}

#[test]
fn dialogs_open_for_commands_that_need_input() {
    let mut a = app();
    for (id, want) in [("pw.insertTable", "InsertTable"), ("pw.link", "Link"), ("pw.pageSetup", "PageSetup"), ("pw.print", "Print"), ("pw.exportPdf", "Chooser"), ("pw.saveAs", "Chooser"), ("pw.about", "About")] {
        a.dialog = None;
        a.command(id, json!({}));
        let got = format!("{:?}", a.dialog);
        assert!(got.starts_with(&format!("Some({want}")), "{id} opened {got}");
    }
}

#[test]
fn closing_with_unsaved_changes_asks_first() {
    let mut a = app();
    assert!(a.ws.is_dirty());
    a.command("pw.close", json!({}));
    assert!(format!("{:?}", a.dialog).starts_with("Some(Unsaved"), "{:?}", a.dialog);
    assert!(a.ws.session.doc.plain_text(wordcraft_engine::doc::StoryRef::Body).contains("Body text"), "nothing discarded yet");
}

#[test]
fn merge_explains_itself_then_merges_a_cell_selection() {
    let mut a = app();
    into_table(&mut a);
    assert_eq!(a.unavailable("table.merge").as_deref(), Some("select two or more cells first"));
    // Select from the first cell into the second.
    let start = a.ws.session.sel.focus.clone();
    a.command("text.tab", json!({}));
    a.command("text.insert", json!({"text": "next"}));
    let end = a.ws.session.sel.focus.clone();
    a.ws.session.sel = wordcraft_engine::Selection { anchor: start, focus: end };
    assert_eq!(a.unavailable("table.merge"), None);
    assert!(a.command("table.merge", json!({})));
    assert!(a.toast.as_ref().is_none_or(|t| !t.warn), "{:?}", a.toast.as_ref().map(|t| &t.text));
}

#[test]
fn autosave_writes_after_a_pause_and_refuses_files_it_cannot_keep() {
    let dir = std::env::temp_dir().join(format!("pagewright-autosave-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    let mut a = app();
    // No file yet: refused, with the reason.
    a.set_autosave(true);
    assert!(!a.autosave);
    let path = dir.join("auto.docx");
    a.save_to(&path, false, pagewright_ui::app::Then::Nothing);
    a.set_autosave(true);
    assert!(a.autosave);
    a.command("text.insert", json!({"text": " More."}));
    a.autosave_tick(100.0); // change noticed
    assert!(a.ws.is_dirty());
    a.autosave_tick(101.0); // still typing (under 2 s idle)
    assert!(a.ws.is_dirty());
    a.autosave_tick(102.5); // idle: saved
    assert!(!a.ws.is_dirty(), "saved automatically");
    let ws = pagewright_core::Workspace::open(&path).unwrap();
    assert!(ws.session.doc.plain_text(wordcraft_engine::doc::StoryRef::Body).contains("More."));

    // A file with content the engine can't keep: refused.
    let src = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../fixtures/docx/unsupported-content.docx");
    let copy = dir.join("unsupported.docx");
    std::fs::copy(&src, &copy).unwrap();
    a.open_path(&copy);
    a.set_autosave(true);
    assert!(!a.autosave);
    assert!(a.autosave_blocked().unwrap().contains("can't keep"));
}
