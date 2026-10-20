//! The interface through its accessibility tree (AccessKit), as a screen reader sees it: every
//! control has a name, toggles report their state, the page reports where the caret is, and the
//! keyboard reaches the toolbar and comes back. egui_kittest drives the real UI code headlessly.

use egui_kittest::Harness;
use egui_kittest::kittest::{NodeT, Queryable};
use pagewright_ui::{AppOptions, NoPlatform, PagewrightApp};
use serde_json::json;
use wordcraft_engine::doc::StoryRef;

fn harness() -> Harness<'static, PagewrightApp> {
    let app = PagewrightApp::new(&egui::Context::default(), Box::new(NoPlatform::default()), AppOptions::default());
    let mut h = Harness::builder().with_size(egui::vec2(1280.0, 860.0)).build_ui_state(|ui, app: &mut PagewrightApp| app.ui(ui), app);
    h.run_steps(4);
    h
}

#[test]
fn toolbar_controls_have_accessible_names() {
    let h = harness();
    for name in [
        "Undo", "Redo", "Bold", "Italic", "Underline", "Strikethrough", "Text colour", "Highlight", "Align left", "Center", "Align right",
        "Justify", "Bulleted list", "Numbered list", "Decrease indent", "Increase indent", "Search commands", "File, theme and help",
        "Clear formatting: back to the paragraph style", "Paragraph style: Normal", "Font size: 12",
    ] {
        assert!(h.query_by_label(name).is_some(), "no control named {name:?}");
    }
    assert!(h.query_by_label_contains("Font: ").is_some());
}

#[test]
fn the_page_reports_document_and_page() {
    let h = harness();
    assert!(h.query_by_label_contains("Document “Untitled”, page 1 of 1").is_some());
}

#[test]
fn typing_and_toggling_bold_through_the_interface() {
    let mut h = harness();
    // The page has focus at start: typing goes into the document.
    h.get_by_label_contains("Document “Untitled”").type_text("Plain ");
    h.run_steps(3);
    h.get_by_label("Bold").click();
    h.run_steps(3);
    h.get_by_label_contains("Document “Untitled”").type_text("strong");
    h.run_steps(3);
    let app = h.state_mut();
    assert_eq!(app.ws.session.doc.plain_text(StoryRef::Body).trim(), "Plain strong");
    let para = app.ws.session.doc.para_at(&app.ws.session.sel.focus).unwrap().clone();
    let marks: String = para.plain_text().char_indices().map(|(i, c)| if para.props_of_char(i).bold == Some(true) { c.to_ascii_uppercase() } else { c }).collect();
    assert_eq!(marks, "Plain STRONG", "clicking Bold kept focus on the page and applied to new text only");
    // Selecting the plain word: the Bold button shows it's off.
    app.command("select.text", json!({"text": "Plain"}));
    h.run_steps(3);
    assert_eq!(format!("{:?}", h.get_by_label("Bold").accesskit_node().toggled()), "Some(False)");
    h.state_mut().command("select.text", json!({"text": "strong"}));
    h.run_steps(3);
    assert_eq!(format!("{:?}", h.get_by_label("Bold").accesskit_node().toggled()), "Some(True)");
}

#[test]
fn f6_reaches_the_toolbar_and_escape_returns_to_the_page() {
    let mut h = harness();
    let focused = |h: &Harness<PagewrightApp>| h.ctx.memory(|m| m.focused());
    let canvas = h.state().canvas.widget_id;
    assert_eq!(focused(&h), canvas, "the page has focus at start");
    h.key_press(egui::Key::F6);
    h.run_steps(3);
    assert_eq!(focused(&h), h.state().toolbar_first, "F6 moves to the format bar");
    h.key_press(egui::Key::Tab);
    h.run_steps(2);
    assert_ne!(focused(&h), canvas, "Tab moves within the bar");
    h.key_press(egui::Key::Escape);
    h.run_steps(3);
    assert_eq!(focused(&h), canvas, "Esc returns to the page");
}

#[test]
fn outline_entries_are_announced_with_level_and_current_section() {
    let mut h = harness();
    {
        let app = h.state_mut();
        app.command("text.insert", json!({"text": "Annual review"}));
        app.command("para.heading1", json!({}));
        app.command("text.newParagraph", json!({}));
        app.command("text.insert", json!({"text": "Body"}));
    }
    h.run_steps(4);
    assert!(h.query_by_label("Heading level 1: Annual review (current section)").is_some());
}

#[test]
fn the_outline_scrolls_to_the_current_section() {
    let long = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../fixtures/docx/long-document.docx");
    let app = PagewrightApp::new(&egui::Context::default(), Box::new(NoPlatform::default()), AppOptions { open: Some(long), ..AppOptions::default() });
    let mut h = Harness::builder().with_size(egui::vec2(1280.0, 860.0)).build_ui_state(|ui, app: &mut PagewrightApp| app.ui(ui), app);
    h.run_steps(4);
    h.state_mut().command("caret.docEnd", json!({}));
    h.run_steps(6);
    let current = h.get_by(|n| n.label().is_some_and(|l| l.ends_with("(current section)")));
    let label = current.accesskit_node().label().unwrap_or_default();
    assert!(label.contains("20.3"), "the last section is current: {label}");
    let r = current.rect();
    assert!(r.min.y >= 0.0 && r.max.y <= 860.0, "current section is on screen: {r:?}");
}

#[test]
fn bold_reports_its_pressed_state() {
    let mut h = harness();
    h.state_mut().command("format.bold", json!({}));
    h.run_steps(3);
    let toggled = format!("{:?}", h.get_by_label("Bold").accesskit_node().toggled());
    assert_eq!(toggled, "Some(True)");
    let italic = format!("{:?}", h.get_by_label("Italic").accesskit_node().toggled());
    assert_eq!(italic, "Some(False)");
}

#[test]
fn a_dialog_opened_by_another_dialog_takes_the_keyboard() {
    let mut h = harness();
    // The chooser (no native dialogs in tests) hands over to the picture-description dialog.
    let png = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../brand/png/pagewright-64.png");
    h.state_mut().dialog = Some(pagewright_ui::dialogs::Dialog::chooser(pagewright_ui::dialogs::ChooserMode::Picture, png.parent().map(|p| p.to_path_buf()), None));
    h.run_steps(3);
    h.state_mut().insert_picture(&png);
    h.run_steps(3);
    // Typed text goes wherever the keyboard is: it must be the description field.
    h.event(egui::Event::Text("Brand mark".into()));
    h.run_steps(2);
    h.key_press(egui::Key::Enter);
    h.run_steps(4);
    let app = h.state_mut();
    assert!(app.dialog.is_none(), "inserted: {:?}", app.dialog);
    let saved = std::env::temp_dir().join(format!("pagewright-alt-{}.docx", std::process::id()));
    app.ws.save_as(&saved, true).unwrap();
    let mut xml = String::new();
    use std::io::Read;
    zip::ZipArchive::new(std::fs::File::open(&saved).unwrap()).unwrap().by_name("word/document.xml").unwrap().read_to_string(&mut xml).unwrap();
    assert!(xml.contains("descr=\"Brand mark\""), "alt text saved");
}
