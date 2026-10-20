//! Modal dialogs. Each asks one clear question; the safe choice is the default, and the
//! destructive one is never the default.

use std::path::{Path, PathBuf};

use egui::{Context, Id, Key, RichText, Sense, Stroke, Ui, vec2};
use pagewright_core::{Concern, FileKind};
use serde_json::json;
use wordcraft_engine::recovery::RecoveryInfo;

use crate::app::{PagewrightApp, Then};
use crate::platform::{PrintRequest, PrinterInfo};
use crate::theme;
use crate::widgets;

#[derive(Clone, Debug)]
pub enum ChooserMode {
    Open,
    Save(Box<Then>),
    Export(FileKind),
    Picture,
}

#[derive(Clone, Debug)]
pub struct Chooser {
    pub mode: ChooserMode,
    pub dir: PathBuf,
    pub dir_text: String,
    pub name: String,
    pub selected: Option<PathBuf>,
    pub error: Option<String>,
    pub focus_name: bool,
}

#[derive(Clone, Debug)]
pub enum Dialog {
    Unsaved { then: Then },
    Confirm { path: PathBuf, concerns: Vec<Concern>, then: Then },
    Message { title: String, body: String, warn: bool },
    Chooser(Chooser),
    InsertTable { rows: u32, cols: u32 },
    Link { text: String, url: String, had_selection: bool, error: Option<String> },
    /// Describe a picture for people using screen readers: before inserting (`path`), or for
    /// the selected picture (`None`).
    PictureAlt { path: Option<PathBuf>, alt: String },
    PageSetup { paper: String, landscape: bool, margins: [f32; 4], metric: bool },
    Print { printers: Vec<PrinterInfo>, printer: usize, copies: u32, pages: String, status: Option<String> },
    Recover { docs: Vec<RecoveryInfo> },
    About,
    Shortcuts,
}

impl Dialog {
    pub fn chooser(mode: ChooserMode, dir: Option<PathBuf>, name: Option<String>) -> Dialog {
        let dir = dir.filter(|d| d.is_dir()).or_else(|| std::env::current_dir().ok()).unwrap_or_else(|| PathBuf::from("/"));
        let name = name.unwrap_or_else(|| match &mode {
            ChooserMode::Save(_) => "Untitled.docx".into(),
            _ => String::new(),
        });
        Dialog::Chooser(Chooser { dir_text: dir.display().to_string(), dir, name, mode, selected: None, error: None, focus_name: true })
    }

    pub fn link(app: &PagewrightApp) -> Dialog {
        let text = app.ws.session.selected_text();
        let had_selection = !text.trim().is_empty();
        Dialog::Link { text: text.trim().to_string(), url: String::new(), had_selection, error: None }
    }

    pub fn page_setup(app: &mut PagewrightApp) -> Dialog {
        let layout = app.ws.session.layout();
        let pi = layout.page_of(&app.ws.session.sel.focus).unwrap_or(0);
        let (mut margins, mut landscape, mut paper) = ([72.0; 4], false, "Letter".to_string());
        if let Some(p) = layout.pages.get(pi) {
            let b = p.body;
            margins = [b.y, p.h - (b.y + b.h), b.x, p.w - p.markup - (b.x + b.w)];
            landscape = p.w > p.h;
            let (w, h) = if landscape { (p.h, p.w) } else { (p.w, p.h) };
            paper = PAPERS.iter().find(|(_, pw, ph)| (pw - w).abs() < 2.0 && (ph - h).abs() < 2.0).map(|(n, _, _)| n.to_string()).unwrap_or_else(|| "Custom".into());
        }
        let metric = format!("{:?}", app.ws.session.units()).to_lowercase().contains("cm") || format!("{:?}", app.ws.session.units()).to_lowercase().contains("mm");
        Dialog::PageSetup { paper, landscape, margins, metric }
    }

    pub fn print(app: &mut PagewrightApp) -> Dialog {
        let printers = app.platform.printers();
        let printer = printers.iter().position(|p| p.default).unwrap_or(0);
        Dialog::Print { printers, printer, copies: 1, pages: String::new(), status: None }
    }
}

/// Paper sizes offered (points, portrait).
const PAPERS: &[(&str, f32, f32)] = &[("Letter", 612.0, 792.0), ("Legal", 612.0, 1008.0), ("A4", 595.3, 841.9), ("A5", 419.5, 595.3), ("Executive", 522.0, 756.0)];

/// What a dialog decided, applied after it is drawn.
enum Act {
    None,
    Close,
    Save(Then),
    Discard(Then),
    SaveCopy(PathBuf, Then),
    Replace(PathBuf, Then),
    ChooserDone(ChooserMode, PathBuf),
    Command(&'static str, serde_json::Value),
    Commands(Vec<(&'static str, serde_json::Value)>),
    Print(Option<String>, u32, String),
    Restore(String),
    DiscardRecovery(String),
    ExportPdf,
}

pub fn show(app: &mut PagewrightApp, ctx: &Context) {
    let Some(mut dialog) = app.dialog.take() else {
        app.dialog_frames = 0;
        app.dialog_kind = None;
        return;
    };
    // A different dialog (one dialog opening another) starts its count again.
    let kind = std::mem::discriminant(&dialog);
    if app.dialog_kind != Some(kind) {
        app.dialog_kind = Some(kind);
        app.dialog_frames = 0;
    }
    // Keys count only once the dialog has been on screen for a frame: the Enter that chose a
    // command in the search (earlier this frame) must not also confirm the dialog it opened.
    let settled = app.dialog_frames > 0;
    app.dialog_frames = app.dialog_frames.saturating_add(1);
    let enter = settled && ctx.input(|i| i.key_pressed(Key::Enter));
    let pal = app.pal;
    let mut act = Act::None;
    let modal = egui::Modal::new(Id::new("pw-dialog")).backdrop_color(egui::Color32::from_black_alpha(if pal.dark { 120 } else { 70 })).frame(
        egui::Frame::popup(&ctx.global_style()).fill(pal.surface_raised).corner_radius(14.0).inner_margin(egui::Margin::same(20)).stroke(Stroke::new(1.0, pal.border)),
    );
    let resp = modal.show(ctx, |ui| {
        ui.set_max_width(520.0);
        match &mut dialog {
            Dialog::Unsaved { then } => {
                title(ui, app, "Save changes before closing?");
                let what = app.ws.title();
                let where_ = app.ws.path().map(|p| format!("Your changes to “{what}” aren't saved to {}.", p.display())).unwrap_or_else(|| format!("“{what}” hasn't been saved to a file yet."));
                body(ui, app, &where_);
                body(ui, app, "If you don't save, your changes are discarded.");
                ui.add_space(12.0);
                ui.horizontal(|ui| {
                    if widgets::primary(ui, &pal, "Save").clicked() || enter {
                        act = Act::Save(then.clone());
                    }
                    if widgets::danger(ui, &pal, "Don't save").clicked() {
                        act = Act::Discard(then.clone());
                    }
                    if widgets::secondary(ui, &pal, "Cancel").clicked() {
                        act = Act::Close;
                    }
                });
            }
            Dialog::Confirm { path, concerns, then } => {
                title(ui, app, "Replace the original file?");
                for c in concerns.iter() {
                    ui.horizontal_top(|ui| {
                        let (r, _) = ui.allocate_exact_size(vec2(18.0, 18.0), Sense::hover());
                        crate::icons::paint(ui.painter(), r, crate::icons::Icon::Warning, pal.warning);
                        ui.add(egui::Label::new(RichText::new(c.message()).color(pal.text)).wrap());
                    });
                }
                body(ui, app, "Saving a copy keeps the original exactly as it is.");
                ui.add_space(12.0);
                let only_lossy = concerns.iter().all(|c| matches!(c, Concern::LossyFormat { .. }));
                ui.horizontal(|ui| {
                    if only_lossy {
                        if widgets::primary(ui, &pal, "Save anyway").clicked() {
                            act = Act::Replace(path.clone(), then.clone());
                        }
                        if widgets::secondary(ui, &pal, "Save as Word document…").clicked() {
                            act = Act::SaveCopy(path.with_extension("docx"), then.clone());
                        }
                    } else {
                        if widgets::primary(ui, &pal, "Save a copy…").clicked() || enter {
                            act = Act::SaveCopy(app.copy_path(path), then.clone());
                        }
                        if widgets::danger(ui, &pal, "Replace original").clicked() {
                            act = Act::Replace(path.clone(), then.clone());
                        }
                    }
                    if widgets::secondary(ui, &pal, "Cancel").clicked() {
                        act = Act::Close;
                    }
                });
            }
            Dialog::Message { title: t, body: b, warn } => {
                ui.horizontal(|ui| {
                    if *warn {
                        let (r, _) = ui.allocate_exact_size(vec2(20.0, 20.0), Sense::hover());
                        crate::icons::paint(ui.painter(), r, crate::icons::Icon::Warning, pal.warning);
                    }
                    title(ui, app, t);
                });
                body(ui, app, b);
                ui.add_space(12.0);
                if widgets::primary(ui, &pal, "OK").clicked() || enter {
                    act = Act::Close;
                }
            }
            Dialog::Chooser(c) => act = chooser(ui, app, c, enter),
            Dialog::InsertTable { rows, cols } => {
                title(ui, app, "Insert table");
                // A grid to pick a size by pointing, plus exact fields.
                let (gr, gresp) = ui.allocate_exact_size(vec2(10.0 * 22.0, 8.0 * 22.0), Sense::click());
                let hover = gresp.hover_pos().map(|p| (((p.x - gr.min.x) / 22.0).floor() as u32 + 1, ((p.y - gr.min.y) / 22.0).floor() as u32 + 1));
                if let Some((c, r)) = hover {
                    *cols = c.clamp(1, 10);
                    *rows = r.clamp(1, 8);
                }
                for r in 0..8 {
                    for c in 0..10 {
                        let cell = egui::Rect::from_min_size(gr.min + vec2(c as f32 * 22.0, r as f32 * 22.0), vec2(20.0, 20.0));
                        let on = c < *cols && r < *rows;
                        ui.painter().rect(cell, 3.0, if on { pal.accent_weak } else { pal.surface }, Stroke::new(1.0, if on { pal.accent } else { pal.border }), egui::StrokeKind::Inside);
                    }
                }
                if gresp.clicked() {
                    act = Act::Command("insert.table", json!({"rows": rows, "cols": cols}));
                }
                ui.add_space(8.0);
                ui.horizontal(|ui| {
                    ui.label("Rows");
                    ui.add(egui::DragValue::new(rows).range(1..=500));
                    ui.label("Columns");
                    ui.add(egui::DragValue::new(cols).range(1..=63));
                });
                ui.add_space(12.0);
                ui.horizontal(|ui| {
                    if widgets::primary(ui, &pal, &format!("Insert {rows} × {cols}")).clicked() || enter {
                        act = Act::Command("insert.table", json!({"rows": rows, "cols": cols}));
                    }
                    if widgets::secondary(ui, &pal, "Cancel").clicked() {
                        act = Act::Close;
                    }
                });
            }
            Dialog::Link { text, url, had_selection, error } => {
                title(ui, app, "Link");
                ui.label("Address");
                let u = ui.add(egui::TextEdit::singleline(url).hint_text("https://example.org or name@example.org").desired_width(440.0));
                u.request_focus();
                if !*had_selection {
                    ui.label("Text to show");
                    ui.add(egui::TextEdit::singleline(text).hint_text("Leave empty to show the address").desired_width(440.0));
                } else {
                    body(ui, app, &format!("Links the selected text: “{}”", ellipsize(text, 60)));
                }
                if let Some(e) = error {
                    ui.colored_label(pal.danger, e.as_str());
                }
                ui.add_space(12.0);
                ui.horizontal(|ui| {
                    let go = widgets::primary(ui, &pal, "Insert link").clicked() || enter;
                    if go {
                        match normalize_url(url) {
                            Some(full) => {
                                let mut p = json!({"url": full});
                                if !*had_selection {
                                    p["text"] = json!(if text.trim().is_empty() { url.trim().to_string() } else { text.trim().to_string() });
                                }
                                act = Act::Command("insert.link", p);
                            }
                            None => *error = Some("Enter a web address (https://…) or an email address.".into()),
                        }
                    }
                    if widgets::secondary(ui, &pal, "Cancel").clicked() {
                        act = Act::Close;
                    }
                });
            }
            Dialog::PictureAlt { path, alt } => {
                title(ui, app, "Describe this picture");
                body(ui, app, "A short description lets people using screen readers know what the picture shows. Leave it empty if the picture is only decoration.");
                ui.add_space(6.0);
                let r = ui.add(egui::TextEdit::multiline(alt).hint_text("For example: Bar chart of visits by month, peaking in July").desired_rows(2).desired_width(460.0).id_salt("pw-alt"));
                if !settled {
                    r.request_focus();
                }
                // Enter inserts; Shift+Enter would be a new line in the field.
                let go_key = enter && !ui.input(|i| i.modifiers.shift);
                ui.add_space(12.0);
                ui.horizontal(|ui| {
                    let label = if path.is_some() { "Insert picture" } else { "Save description" };
                    if widgets::primary(ui, &pal, label).clicked() || go_key {
                        let text = alt.trim().replace('\n', " ");
                        act = match path {
                            Some(p) => Act::Command("insert.picture", json!({"path": p.to_string_lossy(), "alt": text})),
                            None if text.is_empty() => Act::Command("object.altText", json!({"decorative": true})),
                            None => Act::Command("picture.altText", json!({"text": text})),
                        };
                    }
                    if widgets::secondary(ui, &pal, "Cancel").clicked() {
                        act = Act::Close;
                    }
                });
            }
            Dialog::PageSetup { paper, landscape, margins, metric } => {
                title(ui, app, "Page setup");
                body(ui, app, "Applies to the section the cursor is in (the whole document, unless it has section breaks).");
                ui.add_space(6.0);
                egui::Grid::new("pw-page-setup").num_columns(2).spacing(vec2(12.0, 8.0)).show(ui, |ui| {
                    ui.label("Paper");
                    egui::ComboBox::from_id_salt("pw-paper").selected_text(paper.as_str()).show_ui(ui, |ui| {
                        for (n, _, _) in PAPERS {
                            ui.selectable_value(paper, n.to_string(), *n);
                        }
                    });
                    ui.end_row();
                    ui.label("Orientation");
                    ui.horizontal(|ui| {
                        ui.radio_value(landscape, false, "Portrait");
                        ui.radio_value(landscape, true, "Landscape");
                    });
                    ui.end_row();
                    let (unit, k) = if *metric { ("cm", 72.0 / 2.54) } else { ("in", 72.0) };
                    for (i, name) in ["Top margin", "Bottom margin", "Left margin", "Right margin"].iter().enumerate() {
                        ui.label(*name);
                        let mut v = margins[i] / k;
                        ui.add(egui::DragValue::new(&mut v).range(0.0..=10.0).speed(0.01).max_decimals(2).suffix(format!(" {unit}")));
                        margins[i] = v * k;
                        ui.end_row();
                    }
                    ui.label("Units");
                    ui.checkbox(metric, "Centimetres");
                    ui.end_row();
                });
                ui.add_space(12.0);
                ui.horizontal(|ui| {
                    if widgets::primary(ui, &pal, "Apply").clicked() {
                        let mut cmds = Vec::new();
                        if paper != "Custom" {
                            cmds.push(("layout.size", json!({"name": paper.clone()})));
                        }
                        cmds.push(("layout.orientation", json!({"value": if *landscape { "landscape" } else { "portrait" }})));
                        cmds.push(("layout.margins", json!({"top": margins[0], "bottom": margins[1], "left": margins[2], "right": margins[3]})));
                        act = Act::Commands(cmds);
                    }
                    if widgets::secondary(ui, &pal, "Cancel").clicked() {
                        act = Act::Close;
                    }
                });
            }
            Dialog::Print { printers, printer, copies, pages, status } => {
                title(ui, app, "Print");
                if printers.is_empty() {
                    body(ui, app, "No printers were found on this computer. You can export a PDF and print it from another app, or add a printer in your system settings.");
                    ui.add_space(12.0);
                    ui.horizontal(|ui| {
                        if widgets::primary(ui, &pal, "Export PDF…").clicked() {
                            act = Act::ExportPdf;
                        }
                        if widgets::secondary(ui, &pal, "Close").clicked() {
                            act = Act::Close;
                        }
                    });
                } else {
                    egui::Grid::new("pw-print").num_columns(2).spacing(vec2(12.0, 8.0)).show(ui, |ui| {
                        ui.label("Printer");
                        egui::ComboBox::from_id_salt("pw-printer").selected_text(printers[*printer].name.clone()).show_ui(ui, |ui| {
                            for (i, p) in printers.iter().enumerate() {
                                ui.selectable_value(printer, i, format!("{}{}", p.name, if p.default { " (default)" } else { "" }));
                            }
                        });
                        ui.end_row();
                        ui.label("Copies");
                        ui.add(egui::DragValue::new(copies).range(1..=999));
                        ui.end_row();
                        ui.label("Pages");
                        ui.add(egui::TextEdit::singleline(pages).hint_text("All, or e.g. 1-3, 5").desired_width(160.0));
                        ui.end_row();
                    });
                    if let Some(s) = status {
                        ui.colored_label(pal.danger, s.as_str());
                    }
                    body(ui, app, "Pages print exactly as they appear here; the PDF export is the same layout.");
                    ui.add_space(12.0);
                    ui.horizontal(|ui| {
                        if widgets::primary(ui, &pal, "Print").clicked() || enter {
                            act = Act::Print(Some(printers[*printer].name.clone()), *copies, pages.trim().to_string());
                        }
                        if widgets::secondary(ui, &pal, "Cancel").clicked() {
                            act = Act::Close;
                        }
                    });
                }
            }
            Dialog::Recover { docs } => {
                title(ui, app, "Recover unsaved work");
                body(ui, app, "Pagewright kept copies of documents that were open with unsaved changes when it last closed unexpectedly. Restoring opens a copy; your files on disk are never changed.");
                ui.add_space(8.0);
                if enter
                    && let Some(d) = docs.first()
                {
                    act = Act::Restore(d.id.clone());
                }
                for d in docs.iter() {
                    ui.horizontal(|ui| {
                        ui.label(RichText::new(&d.name).font(theme::strong(13.0)));
                        ui.label(RichText::new(&d.saved_at).color(pal.text_muted).font(theme::ui(12.0)));
                        ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                            if widgets::danger(ui, &pal, "Discard").on_hover_text("Delete this recovery copy").clicked() {
                                act = Act::DiscardRecovery(d.id.clone());
                            }
                            if widgets::primary(ui, &pal, "Restore").clicked() {
                                act = Act::Restore(d.id.clone());
                            }
                        });
                    });
                }
                ui.add_space(12.0);
                if widgets::secondary(ui, &pal, "Not now").on_hover_text("Keep the copies; you can recover them later from the ⋯ menu").clicked() {
                    act = Act::Close;
                }
            }
            Dialog::About => {
                ui.horizontal(|ui| {
                    let (r, _) = ui.allocate_exact_size(vec2(40.0, 40.0), Sense::hover());
                    crate::chrome::brand_mark(ui, r, &pal);
                    ui.label(RichText::new("Pagewright").font(theme::display(26.0)).color(pal.text));
                });
                body(ui, app, &format!("Version {}. Write the page you'll send.", pagewright_core::identity::VERSION));
                ui.add_space(6.0);
                body(ui, app, &format!(
                    "Built on the {}: its document model, editing commands, layout, file formats and PDF writer are WordCraft's, by the ArtCraft Team and the WordCraft contributors, used under the MIT License (or Apache-2.0). Pagewright's interface, product layer and brand are new.",
                    pagewright_core::identity::ENGINE
                ));
                body(ui, app, "Fonts: Inter, Source Serif 4 and JetBrains Mono (SIL Open Font License 1.1). Full notices: THIRD_PARTY_NOTICES.md.");
                body(ui, app, "Pagewright is independent and not affiliated with Microsoft. Microsoft Word is a trademark of the Microsoft group of companies.");
                ui.add_space(12.0);
                if widgets::primary(ui, &pal, "Close").clicked() {
                    act = Act::Close;
                }
            }
            Dialog::Shortcuts => {
                title(ui, app, "Keyboard shortcuts");
                egui::ScrollArea::vertical().max_height(420.0).show(ui, |ui| {
                    egui::Grid::new("pw-keys").num_columns(2).striped(true).spacing(vec2(24.0, 6.0)).show(ui, |ui| {
                        for (label, id) in SHORTCUTS {
                            if let Some(k) = app.keys.shortcut_for(id) {
                                ui.label(*label);
                                widgets::kbd(ui, &pal, k);
                                ui.end_row();
                            }
                        }
                        ui.label("Extend a selection");
                        widgets::kbd(ui, &pal, "Shift + arrow keys");
                        ui.end_row();
                    });
                });
                ui.add_space(12.0);
                if widgets::primary(ui, &pal, "Close").clicked() {
                    act = Act::Close;
                }
            }
        }
    });
    if resp.should_close() && matches!(act, Act::None) {
        act = Act::Close;
    }
    apply(app, dialog, act);
}

const SHORTCUTS: &[(&str, &str)] = &[
    ("Search commands", "pw.commandSearch"),
    ("New document", "pw.new"),
    ("Open", "pw.open"),
    ("Save", "pw.save"),
    ("Save as", "pw.saveAs"),
    ("Print", "pw.print"),
    ("Find", "pw.find"),
    ("Replace", "pw.replace"),
    ("Show or hide outline", "pw.toggleOutline"),
    ("Undo", "edit.undo"),
    ("Redo", "edit.redo"),
    ("Select all", "select.all"),
    ("Bold", "format.bold"),
    ("Italic", "format.italic"),
    ("Underline", "format.underline"),
    ("Heading 1", "para.heading1"),
    ("Heading 2", "para.heading2"),
    ("Heading 3", "para.heading3"),
    ("Align left", "para.alignLeft"),
    ("Center", "para.alignCenter"),
    ("Align right", "para.alignRight"),
    ("Justify", "para.justify"),
    ("Bulleted list", "para.bullets"),
    ("Insert link", "pw.link"),
    ("Page break", "text.pageBreak"),
    ("Line break", "text.lineBreak"),
    ("Zoom in", "pw.zoomIn"),
    ("Zoom out", "pw.zoomOut"),
];

fn apply(app: &mut PagewrightApp, dialog: Dialog, act: Act) {
    let closing = !matches!(act, Act::None);
    apply_act(app, dialog, act);
    // A dialog that closed hands the keyboard back to the document (unless another took over).
    if closing && app.dialog.is_none() && app.search.is_none() {
        app.canvas.want_focus = true;
    }
}

fn apply_act(app: &mut PagewrightApp, dialog: Dialog, act: Act) {
    match act {
        Act::None => app.dialog = Some(dialog),
        Act::Close => app.canvas.want_focus = true,
        Act::Save(then) => app.save_flow(then),
        Act::Discard(then) => {
            app.ws.session.dirty = false;
            app.proceed(then);
        }
        Act::SaveCopy(path, then) => app.save_as_flow(Some(path), then),
        Act::Replace(path, then) => app.save_to(&path, true, then),
        Act::ChooserDone(mode, path) => match mode {
            ChooserMode::Open => app.open_path(&path),
            ChooserMode::Save(then) => app.save_to(&path, false, *then),
            ChooserMode::Export(_) => {
                let r = app.ws.export(&path);
                match r {
                    Ok(_) => app.toast(format!("Exported {}", path.display())),
                    Err(e) => app.dialog = Some(Dialog::Message { title: "Couldn't export".into(), body: e, warn: true }),
                }
            }
            ChooserMode::Picture => app.insert_picture(&path),
        },
        Act::Command(id, params) => {
            app.command(id, params);
            app.canvas.want_focus = true;
        }
        Act::Commands(list) => {
            for (id, p) in list {
                app.command(id, p);
            }
            app.canvas.want_focus = true;
        }
        Act::Print(printer, copies, pages) => print(app, dialog, printer, copies, pages),
        Act::Restore(id) => app.after_discard_or_save(Then::Recover(id)),
        Act::DiscardRecovery(id) => {
            let _ = app.engine("file.recover", json!({"discard": id.clone()}));
            if let Dialog::Recover { mut docs } = dialog {
                docs.retain(|d| d.id != id);
                if !docs.is_empty() {
                    app.dialog = Some(Dialog::Recover { docs });
                }
            }
        }
        Act::ExportPdf => app.export_flow(FileKind::Pdf),
    }
}

fn print(app: &mut PagewrightApp, dialog: Dialog, printer: Option<String>, copies: u32, pages: String) {
    let tmp = std::env::temp_dir().join(format!("pagewright-print-{}.pdf", std::process::id()));
    let mut params = json!({"path": tmp.to_string_lossy()});
    if !pages.is_empty() && !pages.eq_ignore_ascii_case("all") {
        params["pages"] = json!(pages);
    }
    let result = app
        .ws
        .session
        .run("file.printPdf", &params)
        .map_err(|e| e.to_string())
        .and_then(|_| std::fs::read(&tmp).map_err(|e| e.to_string()))
        .and_then(|pdf| app.platform.print_pdf(&pdf, &PrintRequest { printer: printer.clone(), copies, collate: true, title: app.ws.title() }));
    let _ = std::fs::remove_file(&tmp);
    match result {
        Ok(job) => app.toast(format!("Sent to {} {}", printer.unwrap_or_else(|| "the printer".into()), if job.is_empty() { String::new() } else { format!("({job})") })),
        Err(e) => {
            if let Dialog::Print { printers, printer, copies, pages, .. } = dialog {
                app.dialog = Some(Dialog::Print { printers, printer, copies, pages, status: Some(format!("Printing failed: {e}")) });
            }
        }
    }
}

fn chooser(ui: &mut Ui, app: &mut PagewrightApp, c: &mut Chooser, enter: bool) -> Act {
    let pal = app.pal;
    let mut act = Act::None;
    let (heading, button, exts): (&str, &str, &[&str]) = match &c.mode {
        ChooserMode::Open => ("Open a document", "Open", &["docx", "docm", "dotx", "dotm", "doc", "dot", "odt", "rtf", "html", "htm", "md", "txt", "xml"]),
        ChooserMode::Save(_) => ("Save as", "Save", &["docx", "odt", "rtf"]),
        ChooserMode::Export(FileKind::Pdf) => ("Export as PDF", "Export", &["pdf"]),
        ChooserMode::Export(FileKind::Html) => ("Export as web page", "Export", &["html", "htm"]),
        ChooserMode::Export(FileKind::Markdown) => ("Export as Markdown", "Export", &["md"]),
        ChooserMode::Export(_) => ("Export as plain text", "Export", &["txt"]),
        ChooserMode::Picture => ("Insert a picture", "Insert", &["png", "jpg", "jpeg", "gif", "bmp", "webp", "tif", "tiff"]),
    };
    let saving = matches!(c.mode, ChooserMode::Save(_) | ChooserMode::Export(_));
    title(ui, app, heading);
    ui.horizontal(|ui| {
        if ui.button("↑").on_hover_text("Parent folder").clicked()
            && let Some(p) = c.dir.parent()
        {
            c.dir = p.to_path_buf();
            c.dir_text = c.dir.display().to_string();
        }
        let r = ui.add(egui::TextEdit::singleline(&mut c.dir_text).desired_width(430.0).font(theme::ui(12.0)));
        if r.lost_focus() {
            let p = PathBuf::from(c.dir_text.trim());
            if p.is_dir() {
                c.dir = p;
            } else {
                c.dir_text = c.dir.display().to_string();
            }
        }
    });
    let mut entries: Vec<(bool, PathBuf)> = std::fs::read_dir(&c.dir)
        .map(|rd| {
            rd.flatten()
                .map(|e| e.path())
                .filter(|p| !p.file_name().is_some_and(|n| n.to_string_lossy().starts_with('.')))
                .filter(|p| p.is_dir() || p.extension().is_some_and(|x| exts.contains(&x.to_string_lossy().to_ascii_lowercase().as_str())))
                .map(|p| (p.is_dir(), p))
                .collect()
        })
        .unwrap_or_default();
    entries.sort_by(|a, b| b.0.cmp(&a.0).then_with(|| a.1.file_name().cmp(&b.1.file_name())));
    egui::Frame::NONE.fill(pal.surface).stroke(Stroke::new(1.0, pal.border)).corner_radius(8.0).inner_margin(egui::Margin::same(4)).show(ui, |ui| {
        egui::ScrollArea::vertical().max_height(260.0).min_scrolled_height(260.0).auto_shrink([false, false]).show(ui, |ui| {
            if entries.is_empty() {
                ui.label(RichText::new("No matching files in this folder.").color(pal.text_muted));
            }
            for (is_dir, p) in &entries {
                let name = p.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default();
                let selected = c.selected.as_deref() == Some(p.as_path());
                let resp = ui.horizontal(|ui| {
                    let (r, _) = ui.allocate_exact_size(vec2(16.0, 16.0), Sense::hover());
                    crate::icons::paint(ui.painter(), r, if *is_dir { crate::icons::Icon::Folder } else { crate::icons::Icon::File }, pal.text_muted);
                    ui.add(egui::Button::selectable(selected, name.clone()).min_size(vec2(440.0, 0.0)))
                });
                let r = resp.inner;
                if r.double_clicked() {
                    if *is_dir {
                        c.dir = p.clone();
                        c.dir_text = c.dir.display().to_string();
                    } else {
                        act = Act::ChooserDone(c.mode.clone(), p.clone());
                    }
                } else if r.clicked() {
                    c.selected = Some(p.clone());
                    if !*is_dir {
                        c.name = name;
                    }
                }
            }
        });
    });
    ui.horizontal(|ui| {
        ui.label("File name");
        let r = ui.add(egui::TextEdit::singleline(&mut c.name).desired_width(380.0).id_salt("pw-chooser-name").hint_text(if saving { "Name.docx" } else { "Type a name or a full path" }));
        if c.focus_name {
            r.request_focus();
            c.focus_name = false;
        }
        if r.changed() {
            c.error = None;
        }
    });
    if let Some(e) = &c.error {
        ui.colored_label(pal.danger, e.as_str());
    }
    ui.add_space(10.0);
    ui.horizontal(|ui| {
        let enabled = !c.name.trim().is_empty() || c.selected.as_ref().is_some_and(|p| p.is_file());
        let go = ui.add_enabled(enabled, egui::Button::new(RichText::new(button).color(pal.accent_text).font(theme::strong(13.0))).fill(pal.accent).min_size(vec2(96.0, 30.0)));
        let enter = enter && enabled;
        if go.clicked() || enter {
            if saving {
                let mut name = c.name.trim().to_string();
                let has_ext = Path::new(&name).extension().is_some_and(|x| exts.contains(&x.to_string_lossy().to_ascii_lowercase().as_str()));
                if !has_ext {
                    name.push('.');
                    name.push_str(exts[0]);
                }
                act = Act::ChooserDone(c.mode.clone(), c.dir.join(name));
            } else {
                // A typed name (relative to the folder) or full path; else the clicked file.
                let typed = c.name.trim();
                let target = if typed.is_empty() { c.selected.clone() } else if Path::new(typed).is_absolute() { Some(PathBuf::from(typed)) } else { Some(c.dir.join(typed)) };
                match target {
                    Some(p) if p.is_dir() => {
                        c.dir = p;
                        c.dir_text = c.dir.display().to_string();
                        c.name.clear();
                    }
                    Some(p) if p.is_file() => act = Act::ChooserDone(c.mode.clone(), p),
                    Some(p) => c.error = Some(format!("There is no file named “{}” here.", p.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default())),
                    None => {}
                }
            }
        }
        if widgets::secondary(ui, &pal, "Cancel").clicked() {
            act = Act::Close;
        }
    });
    act
}

fn title(ui: &mut Ui, app: &PagewrightApp, t: &str) {
    ui.label(RichText::new(t).font(theme::display(20.0)).color(app.pal.text));
    ui.add_space(4.0);
}

fn body(ui: &mut Ui, app: &PagewrightApp, t: &str) {
    ui.add(egui::Label::new(RichText::new(t).color(app.pal.text_muted).font(theme::ui(13.0))).wrap());
}

fn ellipsize(s: &str, n: usize) -> String {
    if s.chars().count() <= n { s.to_string() } else { format!("{}…", s.chars().take(n).collect::<String>()) }
}

/// A usable link target from what was typed, or `None`.
pub fn normalize_url(s: &str) -> Option<String> {
    let s = s.trim();
    if s.is_empty() || s.contains(char::is_whitespace) {
        return None;
    }
    let lower = s.to_ascii_lowercase();
    if ["http://", "https://", "mailto:", "ftp://", "file://"].iter().any(|p| lower.starts_with(p)) {
        return Some(s.to_string());
    }
    if s.contains('@') && !s.contains('/') {
        return Some(format!("mailto:{s}"));
    }
    if s.contains('.') {
        return Some(format!("https://{s}"));
    }
    None
}

#[cfg(test)]
mod tests {
    use super::normalize_url;

    #[test]
    fn urls() {
        assert_eq!(normalize_url("example.org/a").as_deref(), Some("https://example.org/a"));
        assert_eq!(normalize_url("a@b.org").as_deref(), Some("mailto:a@b.org"));
        assert_eq!(normalize_url("https://x.y").as_deref(), Some("https://x.y"));
        assert_eq!(normalize_url("not a url"), None);
        assert_eq!(normalize_url("word"), None);
    }
}
