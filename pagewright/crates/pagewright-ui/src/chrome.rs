//! Everything around the page: title bar, contextual format bar, notice bar, status bar, outline,
//! toasts and the canvas context menu.

use egui::{Align, Color32, Frame, Layout, Margin, RichText, Sense, Stroke, Ui, pos2, vec2};
use serde_json::json;
use wordcraft_engine::doc::{Pos, StoryRef};
use wordcraft_engine::doc::props::Align as ParaAlign;

use crate::app::{PagewrightApp, Then, ThemePref};
use crate::icons::{self, Icon};
use crate::theme;
use crate::widgets::{self, Deco, divider, icon_button, letter_toggle};

/// What the format bar shows for the caret or selection.
#[derive(Clone, Debug, Default)]
pub struct FormatState {
    pub style_id: String,
    pub style_name: String,
    pub font: String,
    pub size: f32,
    pub bold: bool,
    pub italic: bool,
    pub underline: bool,
    pub strike: bool,
    pub align: Option<ParaAlign>,
    pub bullets: bool,
    pub numbered: bool,
    pub in_table: bool,
    pub in_header_footer: bool,
    pub on_link: bool,
    pub can_undo: bool,
    pub can_redo: bool,
    pub undo_label: Option<String>,
    pub redo_label: Option<String>,
}

pub fn format_state(app: &PagewrightApp) -> FormatState {
    let s = &app.ws.session;
    let focus = &s.sel.focus;
    let para = s.doc.para_at(focus);
    let style_id = para.and_then(|p| p.props.style.clone()).unwrap_or_else(|| "Normal".into());
    let style_name = s.doc.styles.get(&style_id).map(|st| st.name.clone()).unwrap_or_else(|| pretty_style(&style_id));
    let rc = s.doc.styles.resolve_char(Some(&style_id), &s.typing_props());
    let rp = para.map(|p| s.doc.styles.resolve_para(&p.props));
    let (bullets, numbered) = rp
        .as_ref()
        .and_then(|r| r.numbering.as_ref())
        .filter(|n| n.num != 0)
        .and_then(|n| s.doc.numbering.level(n.num, n.level))
        .map(|l| {
            let bullet = format!("{:?}", l.format).to_ascii_lowercase().contains("bullet");
            (bullet, !bullet)
        })
        .unwrap_or((false, false));
    let on_link = para.is_some_and(|p| {
        let off = focus.off;
        [off, p.prev_boundary(off)].into_iter().any(|o| p.props_of_char(o).link.as_deref().is_some_and(|l| !l.is_empty()))
    });
    FormatState {
        style_id,
        style_name,
        font: rc.font.clone(),
        size: rc.size,
        bold: rc.bold,
        italic: rc.italic,
        underline: format!("{:?}", rc.underline) != "None",
        strike: rc.strike,
        align: rp.as_ref().map(|r| r.align),
        bullets,
        numbered,
        in_table: focus.path.cell().is_some(),
        in_header_footer: s.story() != StoryRef::Body,
        on_link,
        can_undo: s.can_undo(),
        can_redo: s.can_redo(),
        undo_label: s.undo_label().map(str::to_string),
        redo_label: s.redo_label().map(str::to_string),
    }
}

fn pretty_style(id: &str) -> String {
    let mut out = String::new();
    for (i, c) in id.chars().enumerate() {
        if i > 0 && (c.is_ascii_uppercase() || (c.is_ascii_digit() && !out.ends_with(|p: char| p.is_ascii_digit()))) {
            out.push(' ');
        }
        out.push(c);
    }
    out
}

// -------------------------------------------------------------------------------------------
// Title bar

pub fn title_bar(app: &mut PagewrightApp, ui: &mut Ui) {
    let pal = app.pal;
    egui::Panel::top("pw-title")
        .exact_size(app.m.title_bar)
        .frame(Frame::NONE.fill(pal.surface).inner_margin(Margin { left: 12, right: 10, top: 0, bottom: 0 }).stroke(Stroke::NONE))
        .show(ui, |ui| {
            ui.horizontal_centered(|ui| {
                let (r, _) = ui.allocate_exact_size(vec2(22.0, 22.0), Sense::hover());
                brand_mark(ui, r, &pal);
                ui.add_space(4.0);
                let title = app.ws.title();
                let dirty = app.ws.is_dirty();
                let full = app.ws.path().map(|p| p.display().to_string()).unwrap_or_else(|| "Not saved to a file yet".into());
                ui.add(egui::Label::new(RichText::new(&title).font(theme::display(16.0)).color(pal.text)).truncate().sense(Sense::hover())).on_hover_text(full);
                if dirty {
                    let (d, _) = ui.allocate_exact_size(vec2(10.0, 10.0), Sense::hover());
                    ui.painter().circle_filled(d.center(), 3.5, pal.marker);
                }
                ui.add_space(6.0);
                let (status, attention) = app.save_status_text();
                let color = if attention { pal.warning } else { pal.text_muted };
                let resp = ui.add(egui::Label::new(RichText::new(status).font(theme::ui(12.0)).color(color)).sense(Sense::click()));
                let resp = resp.on_hover_text(if attention { "Click to save (Ctrl+S)" } else { "Where this document is saved" });
                if resp.clicked() && attention {
                    app.command("pw.save", json!({}));
                }

                ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                    ui.spacing_mut().item_spacing.x = 4.0;
                    more_menu(app, ui);
                    export_menu(app, ui);
                    ui.add_space(4.0);
                    search_button(app, ui);
                });
            });
        });
    // Hairline under the header.
    let r = ui.max_rect();
    let _ = r;
}

/// The Folded Leaf mark, painted (same geometry as brand/pagewright-mark.svg).
pub fn brand_mark(ui: &Ui, r: egui::Rect, pal: &crate::tokens::Palette) {
    let s = r.width() / 64.0;
    let at = |x: f32, y: f32| pos2(r.min.x + x * s, r.min.y + y * s);
    let outline = Stroke::new((2.5 * s).max(1.2), pal.text);
    let page = vec![at(14.0, 6.0), at(38.0, 6.0), at(50.0, 18.0), at(50.0, 58.0), at(14.0, 58.0)];
    ui.painter().add(egui::Shape::convex_polygon(page.clone(), if pal.dark { Color32::from_rgb(0x26, 0x30, 0x2D) } else { Color32::from_rgb(0xFB, 0xF8, 0xF1) }, outline));
    ui.painter().add(egui::Shape::convex_polygon(vec![at(38.0, 6.0), at(50.0, 18.0), at(38.0, 18.0)], Color32::from_rgb(0xE8, 0xB9, 0x31), outline));
    ui.painter().rect_filled(egui::Rect::from_min_max(at(20.5, 25.0), at(24.0, 45.0)), 1.75 * s, pal.accent);
}

fn search_button(app: &mut PagewrightApp, ui: &mut Ui) {
    let pal = app.pal;
    let w = (ui.available_width() * 0.42).clamp(150.0, 300.0);
    let (rect, resp) = ui.allocate_exact_size(vec2(w, 28.0), Sense::click());
    let hovered = resp.hovered();
    ui.painter().rect(rect, 8.0, if hovered { pal.surface_raised } else { pal.surface_sunken }, Stroke::new(1.0, if hovered { pal.border_strong } else { pal.border }), egui::StrokeKind::Inside);
    icons::paint(ui.painter(), egui::Rect::from_min_size(rect.min + vec2(8.0, 7.0), vec2(14.0, 14.0)), Icon::Search, pal.text_muted);
    ui.painter().text(rect.min + vec2(28.0, 14.0), egui::Align2::LEFT_CENTER, "Search commands", theme::ui(12.5), pal.text_muted);
    let key = app.keys.shortcut_for("pw.commandSearch").unwrap_or("Ctrl+/").to_string();
    if w > 200.0 {
        let g = ui.painter().layout_no_wrap(key, theme::mono(10.5), pal.text_muted);
        let kr = egui::Rect::from_min_size(pos2(rect.max.x - g.size().x - 16.0, rect.center().y - 9.0), vec2(g.size().x + 10.0, 18.0));
        ui.painter().rect(kr, 4.0, pal.surface, Stroke::new(1.0, pal.border), egui::StrokeKind::Inside);
        ui.painter().galley(kr.center() - g.size() / 2.0, g, pal.text_muted);
    }
    resp.widget_info(|| egui::WidgetInfo::labeled(egui::WidgetType::Button, true, "Search commands"));
    if resp.on_hover_text("Find any command by name and run it").clicked() {
        app.command("pw.commandSearch", json!({}));
    }
}

fn export_menu(app: &mut PagewrightApp, ui: &mut Ui) {
    let pal = app.pal;
    let btn = ui.add(egui::Button::new(RichText::new("Export").color(pal.text)).frame(true).fill(pal.surface).stroke(Stroke::new(1.0, pal.border)).min_size(vec2(64.0, 28.0)));
    let btn = btn.on_hover_text("PDF, print and other formats");
    egui::Popup::menu(&btn).show(|ui| {
        ui.set_min_width(220.0);
        menu_item(app, ui, "PDF…", "pw.exportPdf");
        menu_item(app, ui, "Print…", "pw.print");
        ui.separator();
        ui.label(RichText::new("Copies in other formats").font(theme::ui(11.0)).color(pal.text_muted));
        if ui.button("Web page (.html)…").clicked() {
            app.export_flow(pagewright_core::FileKind::Html);
        }
        if ui.button("Markdown (.md)…").clicked() {
            app.export_flow(pagewright_core::FileKind::Markdown);
        }
        if ui.button("Plain text (.txt)…").clicked() {
            app.export_flow(pagewright_core::FileKind::PlainText);
        }
    });
}

fn menu_item(app: &mut PagewrightApp, ui: &mut Ui, label: &str, id: &str) {
    let key = app.keys.shortcut_for(id).map(str::to_string);
    let resp = ui.add(egui::Button::new(label).shortcut_text(key.unwrap_or_default()));
    if resp.clicked() {
        app.command(id, json!({}));
        ui.close();
    }
}

fn more_menu(app: &mut PagewrightApp, ui: &mut Ui) {
    let pal = app.pal;
    let btn = icon_button(ui, &pal, Icon::More, "File, theme and help", Ok(()), false);
    egui::Popup::menu(&btn).show(|ui| {
        ui.set_min_width(240.0);
        menu_item(app, ui, "New document", "pw.new");
        menu_item(app, ui, "Open…", "pw.open");
        let recent = app.prefs.recent.clone();
        ui.add_enabled_ui(!recent.is_empty(), |ui| {
            ui.menu_button("Open recent", |ui| {
                for p in recent {
                    let label = p.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default();
                    if ui.button(label).on_hover_text(p.display().to_string()).clicked() {
                        app.after_discard_or_save(Then::Open(Some(p.clone())));
                        ui.close();
                    }
                }
            });
        })
        .response
        .on_disabled_hover_text("Documents you open or save appear here");
        ui.separator();
        menu_item(app, ui, "Save", "pw.save");
        menu_item(app, ui, "Save as…", "pw.saveAs");
        let mut auto = app.autosave;
        let blocked = app.autosave_blocked();
        let r = ui.add_enabled(blocked.is_none() || auto, egui::Checkbox::new(&mut auto, "Save automatically"));
        let r = match &blocked {
            Some(why) => r.on_disabled_hover_text(format!("Unavailable: {why}")),
            None => r.on_hover_text("Write changes to this file a few seconds after you stop typing"),
        };
        if r.clicked() {
            app.command("pw.autosave", json!({}));
        }
        ui.add_enabled_ui(app.recovery_enabled(), |ui| {
            if ui.button("Recover unsaved work…").clicked() {
                app.command("pw.recover", json!({}));
                ui.close();
            }
        })
        .response
        .on_disabled_hover_text("Recovery copies are turned off for this session");
        ui.separator();
        menu_item(app, ui, "Page setup…", "pw.pageSetup");
        let mut outline = app.show_outline;
        if ui.checkbox(&mut outline, "Show outline").clicked() {
            app.command("pw.toggleOutline", json!({}));
        }
        ui.menu_button("Theme", |ui| {
            for (label, t) in [("Match system", ThemePref::System), ("Light", ThemePref::Light), ("Dark", ThemePref::Dark)] {
                if ui.radio(app.theme == t, label).clicked() {
                    app.set_theme(t);
                    ui.close();
                }
            }
        });
        ui.separator();
        menu_item(app, ui, "Keyboard shortcuts", "pw.shortcuts");
        menu_item(app, ui, "About Pagewright", "pw.about");
        let _ = pal;
    });
}

// -------------------------------------------------------------------------------------------
// Format bar

/// Groups of the format bar, in display order. Each has a width and a priority: on a narrow
/// window the lowest-priority groups move into the overflow menu.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum Group {
    History,
    Style,
    Font,
    Emphasis,
    Color,
    Align,
    Lists,
    Insert,
    Table,
    HeaderFooter,
    Clear,
}

impl Group {
    fn width(self) -> f32 {
        match self {
            Group::History => 66.0,
            Group::Style => 160.0,
            Group::Font => 228.0,
            Group::Emphasis => 132.0,
            Group::Color => 70.0,
            Group::Align => 132.0,
            Group::Lists => 132.0,
            Group::Insert => 84.0,
            Group::Table => 84.0,
            Group::HeaderFooter => 196.0,
            Group::Clear => 40.0,
        }
    }
    /// Lower = kept longer.
    fn priority(self) -> u8 {
        match self {
            Group::Table | Group::HeaderFooter => 0,
            Group::Emphasis => 1,
            Group::Style => 2,
            Group::History => 3,
            Group::Insert => 4,
            Group::Lists => 5,
            Group::Align => 6,
            Group::Font => 7,
            Group::Color => 8,
            Group::Clear => 9,
        }
    }
}

pub fn format_bar(app: &mut PagewrightApp, ui: &mut Ui) {
    let pal = app.pal;
    let st = format_state(app);
    egui::Panel::top("pw-format")
        .exact_size(app.m.format_bar)
        .frame(Frame::NONE.fill(pal.surface).inner_margin(Margin { left: 10, right: 10, top: 0, bottom: 0 }).stroke(Stroke::new(1.0, pal.border)))
        .show(ui, |ui| {
            ui.horizontal_centered(|ui| {
                ui.spacing_mut().item_spacing.x = 2.0;
                let mut groups = vec![Group::History, Group::Style, Group::Font, Group::Emphasis, Group::Color, Group::Align, Group::Lists, Group::Insert];
                if st.in_table {
                    groups.push(Group::Table);
                }
                if st.in_header_footer {
                    groups.push(Group::HeaderFooter);
                }
                groups.push(Group::Clear);
                let budget = ui.available_width() - 40.0;
                let mut by_priority = groups.clone();
                by_priority.sort_by_key(|g| g.priority());
                let mut used = 0.0;
                let mut shown = Vec::new();
                for g in by_priority {
                    if used + g.width() <= budget {
                        used += g.width();
                        shown.push(g);
                    }
                }
                let hidden: Vec<Group> = groups.iter().copied().filter(|g| !shown.contains(g)).collect();
                for g in &groups {
                    if shown.contains(g) {
                        group(app, ui, *g, &st);
                    }
                }
                if !hidden.is_empty() {
                    divider(ui, &pal);
                    let btn = icon_button(ui, &pal, Icon::ChevronDown, "More formatting (the window is too narrow to show everything)", Ok(()), false);
                    egui::Popup::menu(&btn).show(|ui| {
                        ui.set_min_width(220.0);
                        for g in hidden {
                            overflow_group(app, ui, g, &st);
                        }
                    });
                }
            });
        });
}

fn group(app: &mut PagewrightApp, ui: &mut Ui, g: Group, st: &FormatState) {
    let pal = app.pal;
    match g {
        Group::History => {
            let undo_tip = format!("Undo {} ({})", st.undo_label.as_deref().unwrap_or(""), app.keys.shortcut_for("edit.undo").unwrap_or("Ctrl+Z"));
            if icon_button(ui, &pal, Icon::Undo, &undo_tip, if st.can_undo { Ok(()) } else { Err("nothing to undo") }, false).clicked() {
                app.command("edit.undo", json!({}));
            }
            let redo_tip = format!("Redo {} ({})", st.redo_label.as_deref().unwrap_or(""), app.keys.shortcut_for("edit.redo").unwrap_or("Ctrl+Y"));
            if icon_button(ui, &pal, Icon::Redo, &redo_tip, if st.can_redo { Ok(()) } else { Err("nothing to redo") }, false).clicked() {
                app.command("edit.redo", json!({}));
            }
            divider(ui, &pal);
        }
        Group::Style => {
            style_menu(app, ui, st);
            divider(ui, &pal);
        }
        Group::Font => {
            font_menu(app, ui, st);
            size_menu(app, ui, st);
            divider(ui, &pal);
        }
        Group::Emphasis => {
            let k: std::collections::HashMap<&str, String> =
                ["format.bold", "format.italic", "format.underline"].into_iter().map(|id| (id, app.keys.shortcut_for(id).unwrap_or("").to_string())).collect();
            let k = |id: &str| k.get(id).cloned().unwrap_or_default();
            if letter_toggle(ui, &pal, "B", theme::strong(15.0), Deco::None, &format!("Bold ({})", k("format.bold")), st.bold).clicked() {
                app.command("format.bold", json!({}));
            }
            if letter_toggle(ui, &pal, "I", egui::FontId::new(16.0, egui::FontFamily::Name(theme::SERIF_I.into())), Deco::None, &format!("Italic ({})", k("format.italic")), st.italic).clicked() {
                app.command("format.italic", json!({}));
            }
            if letter_toggle(ui, &pal, "U", theme::medium(14.0), Deco::Underline, &format!("Underline ({})", k("format.underline")), st.underline).clicked() {
                app.command("format.underline", json!({}));
            }
            if letter_toggle(ui, &pal, "S", theme::medium(14.0), Deco::Strike, "Strikethrough", st.strike).clicked() {
                app.command("format.strikethrough", json!({}));
            }
            divider(ui, &pal);
        }
        Group::Color => {
            color_menu(app, ui);
            highlight_menu(app, ui);
            divider(ui, &pal);
        }
        Group::Align => {
            for (icon, id, tip, a) in [
                (Icon::AlignLeft, "para.alignLeft", "Align left", ParaAlign::Left),
                (Icon::AlignCenter, "para.alignCenter", "Center", ParaAlign::Center),
                (Icon::AlignRight, "para.alignRight", "Align right", ParaAlign::Right),
                (Icon::AlignJustify, "para.justify", "Justify", ParaAlign::Justify),
            ] {
                let tip = match app.keys.shortcut_for(id) {
                    Some(k) => format!("{tip} ({k})"),
                    None => tip.to_string(),
                };
                if icon_button(ui, &pal, icon, &tip, Ok(()), st.align == Some(a)).clicked() {
                    app.command(id, json!({}));
                }
            }
            divider(ui, &pal);
        }
        Group::Lists => {
            if icon_button(ui, &pal, Icon::Bullets, "Bulleted list", Ok(()), st.bullets).clicked() {
                app.command("para.bullets", if st.bullets { json!({"off": true}) } else { json!({}) });
            }
            if icon_button(ui, &pal, Icon::Numbering, "Numbered list", Ok(()), st.numbered).clicked() {
                app.command("para.numbering", if st.numbered { json!({"off": true}) } else { json!({}) });
            }
            if icon_button(ui, &pal, Icon::IndentLess, "Decrease indent (Shift+Tab in a list)", Ok(()), false).clicked() {
                app.command("para.outdent", json!({}));
            }
            if icon_button(ui, &pal, Icon::IndentMore, "Increase indent (Tab in a list)", Ok(()), false).clicked() {
                app.command("para.indent", json!({}));
            }
            divider(ui, &pal);
        }
        Group::Insert => {
            let btn = ui.add(egui::Button::new(RichText::new("+ Insert").color(pal.text)).min_size(vec2(76.0, 28.0)));
            let btn = btn.on_hover_text("Table, picture, link, page break, header, footer, page numbers");
            egui::Popup::menu(&btn).show(|ui| {
                ui.set_min_width(220.0);
                insert_items(app, ui);
            });
        }
        Group::Table => {
            divider(ui, &pal);
            let btn = widgets::dropdown_named(ui, &pal, "Table tools", "Table", 72.0, Some((pal.accent_hover, pal.accent_weak)));
            let btn = btn.on_hover_text("Rows, columns and cells of this table");
            egui::Popup::menu(&btn).show(|ui| {
                ui.set_min_width(200.0);
                table_items(app, ui);
            });
        }
        Group::HeaderFooter => {
            divider(ui, &pal);
            ui.label(RichText::new("Editing header/footer").color(pal.accent_hover).font(theme::medium(12.0)));
            if ui.button("Page number").on_hover_text("Insert the page number at the cursor").clicked() {
                app.command("insert.pageField", json!({}));
            }
            if ui.button("Done").on_hover_text("Back to the document body (Esc)").clicked() {
                app.command("insert.closeHeader", json!({}));
            }
        }
        Group::Clear => {
            if icon_button(ui, &pal, Icon::ClearFormat, "Clear formatting: back to the paragraph style", Ok(()), false).clicked() {
                app.command("format.clear", json!({}));
            }
        }
    }
}

fn overflow_group(app: &mut PagewrightApp, ui: &mut Ui, g: Group, st: &FormatState) {
    let item = |app: &mut PagewrightApp, ui: &mut Ui, label: &str, id: &str, params: serde_json::Value| {
        if ui.button(label).clicked() {
            app.command(id, params);
            ui.close();
        }
    };
    match g {
        Group::History => {
            item(app, ui, "Undo", "edit.undo", json!({}));
            item(app, ui, "Redo", "edit.redo", json!({}));
        }
        Group::Style => {
            ui.menu_button(format!("Style: {}", st.style_name), |ui| style_items(app, ui, st));
        }
        Group::Font => {
            ui.label(format!("Font: {} {}", st.font, st.size));
            item(app, ui, "Larger text", "format.growFont", json!({}));
            item(app, ui, "Smaller text", "format.shrinkFont", json!({}));
        }
        Group::Emphasis => {
            item(app, ui, "Bold", "format.bold", json!({}));
            item(app, ui, "Italic", "format.italic", json!({}));
            item(app, ui, "Underline", "format.underline", json!({}));
            item(app, ui, "Strikethrough", "format.strikethrough", json!({}));
        }
        Group::Color => {
            ui.menu_button("Text colour", |ui| color_items(app, ui));
            ui.menu_button("Highlight", |ui| highlight_items(app, ui));
        }
        Group::Align => {
            item(app, ui, "Align left", "para.alignLeft", json!({}));
            item(app, ui, "Center", "para.alignCenter", json!({}));
            item(app, ui, "Align right", "para.alignRight", json!({}));
            item(app, ui, "Justify", "para.justify", json!({}));
        }
        Group::Lists => {
            item(app, ui, "Bulleted list", "para.bullets", if st.bullets { json!({"off": true}) } else { json!({}) });
            item(app, ui, "Numbered list", "para.numbering", if st.numbered { json!({"off": true}) } else { json!({}) });
            item(app, ui, "Decrease indent", "para.outdent", json!({}));
            item(app, ui, "Increase indent", "para.indent", json!({}));
        }
        Group::Insert => {
            ui.menu_button("Insert", |ui| insert_items(app, ui));
        }
        Group::Table => {
            ui.menu_button("Table", |ui| table_items(app, ui));
        }
        Group::HeaderFooter => {
            item(app, ui, "Close header and footer", "insert.closeHeader", json!({}));
        }
        Group::Clear => item(app, ui, "Clear formatting", "format.clear", json!({})),
    }
    ui.separator();
}

/// Paragraph styles offered in the style menu, in this order, plus any other gallery styles the
/// document defines.
const CORE_STYLES: &[&str] = &["Normal", "Title", "Subtitle", "Heading1", "Heading2", "Heading3", "Heading4", "Quote", "IntenseQuote", "NoSpacing", "ListParagraph"];

fn style_menu(app: &mut PagewrightApp, ui: &mut Ui, st: &FormatState) {
    let pal = app.pal;
    let btn = widgets::dropdown_named(ui, &pal, "Paragraph style", &st.style_name, 150.0, None);
    app.toolbar_first = Some(btn.id);
    let btn = btn.on_hover_text("Paragraph style: headings build the outline (Ctrl+Alt+1–3)");
    egui::Popup::menu(&btn).show(|ui| style_items(app, ui, st));
}

fn style_items(app: &mut PagewrightApp, ui: &mut Ui, st: &FormatState) {
    ui.set_min_width(240.0);
    let doc = &app.ws.session.doc;
    let mut ids: Vec<String> = CORE_STYLES.iter().map(|s| s.to_string()).collect();
    for s in &doc.styles.styles {
        if format!("{:?}", s.kind) == "Paragraph" && s.quick && !s.hidden && !ids.contains(&s.id) {
            ids.push(s.id.clone());
        }
    }
    let previews: Vec<(String, String, f32, bool, bool)> = ids
        .iter()
        .map(|id| {
            let name = doc.styles.get(id).map(|s| s.name.clone()).unwrap_or_else(|| pretty_style(id));
            let rc = doc.styles.resolve_char(Some(id), &Default::default());
            (id.clone(), name, rc.size, rc.bold, rc.italic)
        })
        .collect();
    for (id, name, size, bold, italic) in previews {
        let font = if bold { theme::strong(size.clamp(12.0, 20.0)) } else if italic { egui::FontId::new(size.clamp(12.0, 20.0), egui::FontFamily::Name(theme::SERIF_I.into())) } else { theme::ui(size.clamp(12.0, 20.0)) };
        let key = match id.as_str() {
            "Heading1" => "Ctrl+Alt+1",
            "Heading2" => "Ctrl+Alt+2",
            "Heading3" => "Ctrl+Alt+3",
            "Normal" => "Ctrl+Shift+N",
            _ => "",
        };
        let key = if cfg!(target_os = "macos") { crate::keys::pretty(&key.replace("Ctrl+", "Mod+")) } else { key.to_string() };
        let resp = ui.add(egui::Button::selectable(st.style_id == id, RichText::new(name).font(font)).shortcut_text(key).min_size(vec2(230.0, 0.0)));
        if resp.clicked() {
            app.command("para.style", json!({"style": id}));
            ui.close();
        }
    }
}

fn font_menu(app: &mut PagewrightApp, ui: &mut Ui, st: &FormatState) {
    let pal = app.pal;
    let installed = wordcraft_fonts::FontDb::global().families().iter().any(|f| f.eq_ignore_ascii_case(&st.font));
    let btn = widgets::dropdown_named(ui, &pal, "Font", &st.font, 150.0, None);
    let btn = if installed { btn.on_hover_text("Font") } else { btn.on_hover_text(format!("Font: {} isn't installed on this computer, so a similar font is shown. The document keeps {}.", st.font, st.font)) };
    egui::Popup::menu(&btn).show(|ui| {
        ui.set_min_width(220.0);
        egui::ScrollArea::vertical().max_height(360.0).show(ui, |ui| {
            for f in wordcraft_fonts::FontDb::global().families() {
                if ui.add(egui::Button::selectable(st.font == f, f.as_str())).clicked() {
                    app.command("format.font", json!({"name": f}));
                    ui.close();
                }
            }
        });
    });
}

const SIZES: &[f32] = &[8.0, 9.0, 10.0, 10.5, 11.0, 12.0, 14.0, 16.0, 18.0, 20.0, 24.0, 28.0, 32.0, 36.0, 48.0, 72.0];

fn size_menu(app: &mut PagewrightApp, ui: &mut Ui, st: &FormatState) {
    let pal = app.pal;
    let shown = if st.size.fract() == 0.0 { format!("{}", st.size as i32) } else { format!("{:.1}", st.size) };
    let btn = widgets::dropdown_named(ui, &pal, "Font size", &shown, 58.0, None);
    let btn = btn.on_hover_text("Font size (Ctrl+] larger, Ctrl+[ smaller)");
    egui::Popup::menu(&btn).show(|ui| {
        ui.set_min_width(80.0);
        egui::ScrollArea::vertical().max_height(320.0).show(ui, |ui| {
            for s in SIZES {
                let label = if s.fract() == 0.0 { format!("{}", *s as i32) } else { format!("{s}") };
                if ui.add(egui::Button::selectable((st.size - s).abs() < 0.01, label)).clicked() {
                    app.command("format.size", json!({"size": s}));
                    ui.close();
                }
            }
        });
    });
}

const TEXT_COLORS: &[(&str, &str)] = &[
    ("Ink", "1D1B18"),
    ("Graphite", "5C5A55"),
    ("Brick", "B0402D"),
    ("Amber", "B86E00"),
    ("Olive", "6B7A1E"),
    ("Viridian", "1E6A5A"),
    ("Teal", "1F6E80"),
    ("Blue", "2A5DB0"),
    ("Indigo", "4B4AA8"),
    ("Plum", "7D3C7A"),
];

fn color_menu(app: &mut PagewrightApp, ui: &mut Ui) {
    let pal = app.pal;
    let btn = icon_button(ui, &pal, Icon::TextColor, "Text colour", Ok(()), false);
    egui::Popup::menu(&btn).show(|ui| color_items(app, ui));
}

fn color_items(app: &mut PagewrightApp, ui: &mut Ui) {
    if ui.button("Automatic").clicked() {
        app.command("format.color", json!({"color": "auto"}));
        ui.close();
    }
    ui.horizontal_wrapped(|ui| {
        ui.set_max_width(200.0);
        for (name, hex) in TEXT_COLORS {
            let c = crate::tokens::parse_hex(&format!("#{hex}")).unwrap_or(Color32::BLACK);
            let (r, resp) = ui.allocate_exact_size(vec2(22.0, 22.0), Sense::click());
            ui.painter().rect_filled(r.shrink(2.0), 4.0, c);
            if resp.hovered() {
                ui.painter().rect_stroke(r, 5.0, Stroke::new(2.0, app.pal.focus), egui::StrokeKind::Inside);
            }
            if resp.on_hover_text(*name).clicked() {
                app.command("format.color", json!({"color": hex}));
                ui.close();
            }
        }
    });
}

/// Word's highlight colours (`w:highlight` is a fixed set): label, engine name, swatch.
const HIGHLIGHTS: &[(&str, &str, &str)] = &[
    ("Yellow", "yellow", "FFFF00"),
    ("Bright green", "brightGreen", "00FF00"),
    ("Turquoise", "turquoise", "00FFFF"),
    ("Pink", "pink", "FF00FF"),
    ("Light grey", "gray25", "C0C0C0"),
];

fn highlight_menu(app: &mut PagewrightApp, ui: &mut Ui) {
    let pal = app.pal;
    let btn = icon_button(ui, &pal, Icon::Highlight, "Highlight", Ok(()), false);
    egui::Popup::menu(&btn).show(|ui| highlight_items(app, ui));
}

fn highlight_items(app: &mut PagewrightApp, ui: &mut Ui) {
    if ui.button("No highlight").clicked() {
        app.command("format.highlight", json!({"color": "none"}));
        ui.close();
    }
    ui.horizontal(|ui| {
        for (label, name, hex) in HIGHLIGHTS {
            let c = crate::tokens::parse_hex(&format!("#{hex}")).unwrap_or(Color32::YELLOW);
            let (r, resp) = ui.allocate_exact_size(vec2(22.0, 22.0), Sense::click());
            ui.painter().rect_filled(r.shrink(2.0), 4.0, c);
            if resp.on_hover_text(*label).clicked() {
                app.command("format.highlight", json!({"color": name}));
                ui.close();
            }
        }
    });
}

fn insert_items(app: &mut PagewrightApp, ui: &mut Ui) {
    let row = |app: &mut PagewrightApp, ui: &mut Ui, icon: Icon, label: &str, id: &str, params: serde_json::Value| {
        let key = app.keys.shortcut_for(id).map(str::to_string).unwrap_or_default();
        let resp = ui.horizontal(|ui| {
            let (r, _) = ui.allocate_exact_size(vec2(16.0, 16.0), Sense::hover());
            icons::paint(ui.painter(), r, icon, app.pal.text_muted);
            ui.add(egui::Button::new(label).frame(false).shortcut_text(key).min_size(vec2(180.0, 22.0)))
        });
        if resp.inner.clicked() {
            app.command(id, params);
            ui.close();
        }
    };
    row(app, ui, Icon::Table, "Table…", "pw.insertTable", json!({}));
    row(app, ui, Icon::Image, "Picture…", "pw.insertPicture", json!({}));
    row(app, ui, Icon::Link, "Link…", "pw.link", json!({}));
    ui.separator();
    row(app, ui, Icon::PageBreak, "Page break", "text.pageBreak", json!({}));
    row(app, ui, Icon::Header, "Header", "insert.editHeader", json!({}));
    row(app, ui, Icon::Header, "Footer", "insert.editFooter", json!({}));
    row(app, ui, Icon::Page, "Page numbers (bottom, centred)", "insert.pageNumber", json!({"position": "bottom", "align": "center"}));
}

fn table_items(app: &mut PagewrightApp, ui: &mut Ui) {
    for (label, id) in [
        ("Insert row above", "table.insertRowAbove"),
        ("Insert row below", "table.insertRowBelow"),
        ("Insert column left", "table.insertColumnLeft"),
        ("Insert column right", "table.insertColumnRight"),
        ("", ""),
        ("Merge cells", "table.merge"),
        ("Repeat header row on each page", "table.repeatHeader"),
        ("", ""),
        ("Delete row", "table.deleteRow"),
        ("Delete column", "table.deleteColumn"),
        ("Delete table", "table.deleteTable"),
    ] {
        if id.is_empty() {
            ui.separator();
            continue;
        }
        let reason = app.unavailable(id);
        let resp = ui.add_enabled(reason.is_none(), egui::Button::new(label));
        let resp = match reason {
            Some(r) => resp.on_disabled_hover_text(r),
            None => resp,
        };
        if resp.clicked() {
            app.command(id, json!({}));
            ui.close();
        }
    }
}

// -------------------------------------------------------------------------------------------
// Notice bar, status bar, outline, toast, context menu

pub fn notice_bar(app: &mut PagewrightApp, ui: &mut Ui) {
    let notices: Vec<(String, bool)> = app.notice_messages().into_iter().filter(|(m, _)| !app.dismissed.contains(m)).collect();
    let Some((msg, warn)) = notices.first().cloned() else { return };
    let pal = app.pal;
    let (bg, fg) = if warn { (pal.warning_weak, pal.text) } else { (pal.accent_weak, pal.text) };
    egui::Panel::top("pw-notice").frame(Frame::NONE.fill(bg).inner_margin(Margin::symmetric(14, 8)).stroke(Stroke::new(1.0, pal.border))).show(ui, |ui| {
        ui.horizontal(|ui| {
            let (r, _) = ui.allocate_exact_size(vec2(18.0, 18.0), Sense::hover());
            icons::paint(ui.painter(), r, if warn { Icon::Warning } else { Icon::Info }, if warn { pal.warning } else { pal.accent });
            ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                if icon_button(ui, &pal, Icon::Close, "Dismiss", Ok(()), false).clicked() {
                    app.dismissed.push(msg.clone());
                }
                if warn {
                    if let Some(p) = app.ws.path().map(|p| p.to_path_buf()) {
                        let copy = app.copy_path(&p);
                        if widgets::secondary(ui, &pal, "Save a copy…").on_hover_text("Keep your original exactly as it is and save the edited document beside it").clicked() {
                            app.save_as_flow(Some(copy), Then::Nothing);
                        }
                    }
                } else if app.ws.file().is_some_and(|f| f.kind == pagewright_core::FileKind::LegacyWord) && widgets::secondary(ui, &pal, "Save as Word document…").clicked() {
                    app.save_as_flow(app.ws.suggested_save_path(), Then::Nothing);
                }
                ui.with_layout(Layout::left_to_right(Align::Center), |ui| {
                    ui.add(egui::Label::new(RichText::new(msg).color(fg).font(theme::ui(12.5))).wrap());
                });
            });
        });
    });
}

pub fn status_bar(app: &mut PagewrightApp, ui: &mut Ui) {
    let pal = app.pal;
    egui::Panel::bottom("pw-status")
        .exact_size(app.m.status_bar)
        .frame(Frame::NONE.fill(pal.surface).inner_margin(Margin::symmetric(12, 0)).stroke(Stroke::new(1.0, pal.border)))
        .show(ui, |ui| {
            ui.horizontal_centered(|ui| {
                let small = |t: String| RichText::new(t).font(theme::ui(11.5)).color(pal.text_muted);
                let layout = app.ws.session.layout();
                let caret_page = layout.page_of(&app.ws.session.sel.focus).unwrap_or(app.canvas.top_page);
                let total = layout.pages.len().max(1);
                ui.label(small(format!("Page {} of {}", caret_page + 1, total)));
                ui.label(small("·".into()));
                let words = app.ws.session.word_count();
                let sel_words = if app.ws.session.sel.is_collapsed() { None } else { Some(app.ws.session.selected_text().split_whitespace().count()) };
                let wc = match sel_words {
                    Some(n) => format!("{} of {} words", group_digits(n), group_digits(words)),
                    None => format!("{} words", group_digits(words)),
                };
                ui.label(small(wc)).on_hover_text("Word count (selection, when there is one)");
                ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                    ui.spacing_mut().item_spacing.x = 2.0;
                    if ui.small_button("Fit").on_hover_text("Fit page width to the window").clicked() {
                        app.command("pw.fitWidth", json!({}));
                    }
                    if ui.small_button("+").on_hover_text("Zoom in (Ctrl+=)").clicked() {
                        app.command("pw.zoomIn", json!({}));
                    }
                    let z = format!("{:.0}%", app.canvas.zoom * 100.0);
                    if ui.add(egui::Button::new(small(z)).frame(false)).on_hover_text("Zoom to 100% (Ctrl+0)").clicked() {
                        app.command("pw.zoomReset", json!({}));
                    }
                    if ui.small_button("−").on_hover_text("Zoom out (Ctrl+−)").clicked() {
                        app.command("pw.zoomOut", json!({}));
                    }
                    ui.add_space(10.0);
                    // Fidelity status for the file this document came from.
                    let (text, warn, tip) = match app.ws.file() {
                        Some(f) if !f.untouched_losses.is_empty() => (
                            format!("{} kind{} of content can't be kept", f.untouched_losses.len(), if f.untouched_losses.len() == 1 { "" } else { "s" }),
                            true,
                            f.untouched_losses.iter().map(|l| l.describe()).collect::<Vec<_>>().join("\n"),
                        ),
                        Some(f) if f.damaged => ("Recovered from a damaged file".into(), true, "Some parts of the file couldn't be read.".into()),
                        Some(f) if f.kind == pagewright_core::FileKind::Word => ("All file content kept".into(), false, "Checked when the file was opened: saving keeps everything this file contains.".into()),
                        _ => (String::new(), false, String::new()),
                    };
                    if !text.is_empty() {
                        let color = if warn { pal.warning } else { pal.success };
                        let resp = ui.add(egui::Label::new(RichText::new(text).font(theme::ui(11.5)).color(color)).sense(Sense::click()));
                        if resp.on_hover_text(tip).clicked() && warn {
                            app.dismissed.clear();
                        }
                    }
                });
            });
        });
}

fn group_digits(n: usize) -> String {
    let s = n.to_string();
    let mut out = String::new();
    for (i, c) in s.chars().enumerate() {
        if i > 0 && (s.len() - i) % 3 == 0 {
            out.push(',');
        }
        out.push(c);
    }
    out
}

/// Headings of the body: (level 0–8, text, position).
pub fn headings(app: &PagewrightApp) -> Vec<(u8, String, Pos)> {
    let doc = &app.ws.session.doc;
    let mut out = Vec::new();
    for path in doc.para_paths(StoryRef::Body) {
        if path.0.len() != 1 {
            continue; // headings in table cells don't structure the document
        }
        let Some(p) = doc.para(StoryRef::Body, &path) else { continue };
        let Some(level) = doc.styles.resolve_para(&p.props).outline_level else { continue };
        let text = p.plain_text().trim().to_string();
        if text.is_empty() {
            continue;
        }
        out.push((level, text, Pos::new(StoryRef::Body, path, 0)));
    }
    out
}

pub fn outline(app: &mut PagewrightApp, ui: &mut Ui) {
    let pal = app.pal;
    egui::Panel::left("pw-outline")
        .resizable(true)
        .default_size(app.m.sidebar)
        .size_range(180.0..=420.0)
        .frame(Frame::NONE.fill(pal.surface).inner_margin(Margin { left: 12, right: 8, top: 12, bottom: 8 }).stroke(Stroke::new(1.0, pal.border)))
        .show(ui, |ui| {
            ui.horizontal(|ui| {
                ui.label(RichText::new("Outline").font(theme::strong(13.0)).color(pal.text));
                ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                    if icon_button(ui, &pal, Icon::Close, "Hide outline (Ctrl+Shift+O)", Ok(()), false).clicked() {
                        app.command("pw.toggleOutline", json!({}));
                    }
                });
            });
            ui.add_space(4.0);
            let hs = headings(app);
            if hs.is_empty() {
                ui.add(egui::Label::new(
                    RichText::new("Headings you add appear here. Choose Heading 1–3 from the style menu, or press Ctrl+Alt+1, 2 or 3.").font(theme::ui(12.0)).color(pal.text_muted),
                ).wrap());
                return;
            }
            // The section the caret is in: the last heading at or before it.
            let focus = app.ws.session.sel.focus.clone();
            let current = hs.iter().rposition(|(_, _, p)| p.path <= focus.path);
            // Bring the current section into view when the caret moves into another one, and
            // leave the list where the person scrolled it otherwise.
            let followed = egui::Id::new("pw-outline-followed");
            let follow = ui.data(|d| d.get_temp::<Option<usize>>(followed)) != Some(current);
            if follow {
                ui.data_mut(|d| d.insert_temp(followed, current));
            }
            egui::ScrollArea::vertical().auto_shrink([false, false]).show(ui, |ui| {
                for (i, (level, text, pos)) in hs.iter().enumerate() {
                    let indent = (*level as f32).min(5.0) * 14.0;
                    let active = current == Some(i);
                    let w = ui.available_width();
                    let (r, resp) = ui.allocate_exact_size(vec2(w, 26.0), Sense::click());
                    if active || resp.hovered() {
                        ui.painter().rect_filled(r, 6.0, if active { pal.accent_weak } else { pal.surface_sunken });
                    }
                    if active {
                        ui.painter().rect_filled(egui::Rect::from_min_size(r.min + vec2(0.0, 5.0), vec2(3.0, 16.0)), 1.5, pal.accent);
                        if follow {
                            ui.scroll_to_rect(r, Some(Align::Center));
                        }
                    }
                    let font = if *level == 0 { theme::medium(12.5) } else { theme::ui(12.5) };
                    let color = if active { pal.text } else if *level == 0 { pal.text } else { pal.text_muted };
                    let g = ui.painter().layout(text.clone(), font, color, (w - indent - 14.0).max(40.0));
                    let row = g.rows.first().map(|r| r.text()).unwrap_or_default();
                    let g = ui.painter().layout_no_wrap(if row.len() < text.len() { format!("{}…", row.trim_end()) } else { row }, if *level == 0 { theme::medium(12.5) } else { theme::ui(12.5) }, color);
                    ui.painter().galley(pos2(r.min.x + 10.0 + indent, r.center().y - g.size().y / 2.0), g, color);
                    let spoken = format!("Heading level {}: {}{}", level + 1, text, if active { " (current section)" } else { "" });
                    resp.widget_info(|| egui::WidgetInfo::labeled(egui::WidgetType::Button, true, &spoken));
                    let resp = resp.on_hover_text(text.as_str());
                    if resp.clicked() {
                        app.ws.session.sel = wordcraft_engine::Selection::caret(pos.clone());
                        app.ws.session.pending = None;
                        app.canvas.reveal_caret = true;
                        app.canvas.want_focus = true;
                        if let Some(page) = app.ws.session.layout().page_of(pos) {
                            app.canvas.scroll_to = Some((page, 0.0));
                        }
                    }
                }
            });
        });
}

pub fn toast(app: &mut PagewrightApp, ctx: &egui::Context) {
    let Some(t) = &app.toast else { return };
    if app.time > t.until {
        app.toast = None;
        return;
    }
    let pal = app.pal;
    let (text, warn) = (t.text.clone(), t.warn);
    egui::Area::new("pw-toast".into()).anchor(egui::Align2::CENTER_BOTTOM, vec2(0.0, -40.0)).order(egui::Order::Foreground).interactable(false).show(ctx, |ui| {
        Frame::NONE
            .fill(if pal.dark { pal.surface_raised } else { pal.text })
            .corner_radius(8.0)
            .inner_margin(Margin::symmetric(14, 9))
            .show(ui, |ui| {
                ui.set_max_width(520.0);
                let fg = if pal.dark { pal.text } else { pal.surface };
                ui.horizontal(|ui| {
                    if warn {
                        let (r, _) = ui.allocate_exact_size(vec2(16.0, 16.0), Sense::hover());
                        icons::paint(ui.painter(), r, Icon::Warning, pal.marker);
                    }
                    ui.add(egui::Label::new(RichText::new(text).color(fg).font(theme::ui(12.5))).wrap());
                });
            });
    });
    ctx.request_repaint_after(std::time::Duration::from_millis(250));
}

pub fn context_menu(app: &mut PagewrightApp, ui: &mut Ui) {
    let has_sel = !app.ws.session.sel.is_collapsed();
    ui.set_min_width(200.0);
    if ui.add_enabled(has_sel, egui::Button::new("Cut").shortcut_text(crate::keys::pretty("Mod+X"))).clicked() {
        crate::canvas::copy(app, true);
        ui.close();
    }
    if ui.add_enabled(has_sel, egui::Button::new("Copy").shortcut_text(crate::keys::pretty("Mod+C"))).clicked() {
        crate::canvas::copy(app, false);
        ui.close();
    }
    if ui.add(egui::Button::new("Paste").shortcut_text(crate::keys::pretty("Mod+V"))).clicked() {
        crate::canvas::paste(app, "");
        ui.close();
    }
    ui.separator();
    let st = format_state(app);
    if ui.button(if st.on_link { "Edit link…" } else { "Link…" }).clicked() {
        app.command("pw.link", json!({}));
        ui.close();
    }
    if st.on_link && ui.button("Remove link").clicked() {
        app.command("insert.removeLink", json!({}));
        ui.close();
    }
    if st.in_table {
        ui.menu_button("Table", |ui| table_items(app, ui));
    }
    ui.separator();
    if ui.add(egui::Button::new("Select all").shortcut_text(crate::keys::pretty("Mod+A"))).clicked() {
        app.command("select.all", json!({}));
        ui.close();
    }
}
