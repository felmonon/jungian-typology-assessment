//! Command search (Ctrl+/): find any command by what it does and run it. Entries use plain names
//! and synonyms ("bigger text", "landscape", "word count"), show their shortcut, and say why a
//! command is unavailable instead of hiding it.

use egui::{Context, Frame, Key, Margin, RichText, Sense, Stroke, vec2};
use serde_json::{Value, json};

use crate::app::PagewrightApp;
use crate::theme;

/// One searchable command.
pub struct Entry {
    pub id: &'static str,
    pub params: &'static str,
    pub label: &'static str,
    pub group: &'static str,
    pub words: &'static str,
}

const fn e(id: &'static str, params: &'static str, label: &'static str, group: &'static str, words: &'static str) -> Entry {
    Entry { id, params, label, group, words }
}

/// Every command the search offers. A test runs each of them against a real document.
pub const ENTRIES: &[Entry] = &[
    // File
    e("pw.new", "{}", "New document", "File", "blank create start"),
    e("pw.open", "{}", "Open…", "File", "file load docx"),
    e("pw.save", "{}", "Save", "File", "write keep"),
    e("pw.saveAs", "{}", "Save as…", "File", "copy rename save copy"),
    e("pw.exportPdf", "{}", "Export as PDF…", "File", "pdf share send"),
    e("pw.exportHtml", "{}", "Export as web page…", "File", "html"),
    e("pw.exportMarkdown", "{}", "Export as Markdown…", "File", "md markdown"),
    e("pw.exportText", "{}", "Export as plain text…", "File", "txt text"),
    e("pw.print", "{}", "Print…", "File", "printer paper"),
    e("pw.recover", "{}", "Recover unsaved work…", "File", "autosave crash restore lost"),
    e("pw.close", "{}", "Close document", "File", "close"),
    // Edit
    e("edit.undo", "{}", "Undo", "Edit", "back revert"),
    e("edit.redo", "{}", "Redo", "Edit", "again repeat"),
    e("pw.cut", "{}", "Cut", "Edit", "clipboard"),
    e("pw.copy", "{}", "Copy", "Edit", "clipboard"),
    e("pw.paste", "{}", "Paste", "Edit", "clipboard"),
    e("edit.pasteText", "{}", "Paste as plain text", "Edit", "unformatted keep text only"),
    e("select.all", "{}", "Select all", "Edit", "everything"),
    e("pw.find", "{}", "Find…", "Edit", "search look for"),
    e("pw.replace", "{}", "Replace…", "Edit", "find and replace substitute"),
    e("edit.findNext", "{}", "Find next", "Edit", "search again"),
    e("edit.findPrevious", "{}", "Find previous", "Edit", "search back"),
    // Text
    e("format.bold", "{}", "Bold", "Text", "strong heavy weight"),
    e("format.italic", "{}", "Italic", "Text", "slanted emphasis oblique"),
    e("format.underline", "{}", "Underline", "Text", "line under"),
    e("format.doubleUnderline", "{}", "Double underline", "Text", "underline twice"),
    e("format.strikethrough", "{}", "Strikethrough", "Text", "cross out strike line through"),
    e("format.subscript", "{}", "Subscript", "Text", "below small lower"),
    e("format.superscript", "{}", "Superscript", "Text", "above exponent power upper"),
    e("format.smallCaps", "{}", "Small capitals", "Text", "small caps"),
    e("format.allCaps", "{}", "All capitals", "Text", "uppercase caps"),
    e("format.growFont", "{}", "Larger text", "Text", "bigger increase font size grow"),
    e("format.shrinkFont", "{}", "Smaller text", "Text", "decrease font size shrink"),
    e("format.highlight", r#"{"color":"FFFF00"}"#, "Highlight yellow", "Text", "marker highlighter"),
    e("format.highlight", r#"{"color":null}"#, "Remove highlight", "Text", "no highlight clear marker"),
    e("format.color", r#"{"color":"auto"}"#, "Automatic text colour", "Text", "black default color colour"),
    e("format.clear", "{}", "Clear formatting", "Text", "reset plain remove formatting"),
    // Paragraph
    e("para.alignLeft", "{}", "Align left", "Paragraph", "ragged left"),
    e("para.alignCenter", "{}", "Center", "Paragraph", "centre middle align"),
    e("para.alignRight", "{}", "Align right", "Paragraph", "right"),
    e("para.justify", "{}", "Justify", "Paragraph", "both edges block align"),
    e("para.single", "{}", "Single line spacing", "Paragraph", "line spacing 1"),
    e("para.lineSpacing", r#"{"value":1.15}"#, "1.15 line spacing", "Paragraph", "line spacing"),
    e("para.oneAndHalf", "{}", "1.5 line spacing", "Paragraph", "line spacing one and a half"),
    e("para.double", "{}", "Double line spacing", "Paragraph", "line spacing 2"),
    e("para.addSpaceBefore", "{}", "Add space before paragraph", "Paragraph", "spacing gap above"),
    e("para.removeSpaceAfter", "{}", "Remove space after paragraph", "Paragraph", "spacing gap below tight"),
    e("para.indent", "{}", "Increase indent", "Paragraph", "indent more move right"),
    e("para.outdent", "{}", "Decrease indent", "Paragraph", "outdent less move left"),
    e("para.bullets", "{}", "Bulleted list", "Paragraph", "bullets list points unordered"),
    e("para.numbering", "{}", "Numbered list", "Paragraph", "numbers ordered list steps"),
    e("para.numbering", r#"{"kind":"lowerLetter"}"#, "Lettered list (a, b, c)", "Paragraph", "letters list alphabet"),
    e("para.pageBreakBefore", "{}", "Start paragraph on a new page", "Paragraph", "page break before keep"),
    // Styles
    e("para.style", r#"{"style":"Normal"}"#, "Style: Normal", "Styles", "body text plain paragraph"),
    e("para.style", r#"{"style":"Title"}"#, "Style: Title", "Styles", "document title"),
    e("para.style", r#"{"style":"Subtitle"}"#, "Style: Subtitle", "Styles", "subheading"),
    e("para.heading1", "{}", "Style: Heading 1", "Styles", "heading level one h1 section"),
    e("para.heading2", "{}", "Style: Heading 2", "Styles", "heading level two h2 subsection"),
    e("para.heading3", "{}", "Style: Heading 3", "Styles", "heading level three h3"),
    e("para.style", r#"{"style":"Quote"}"#, "Style: Quote", "Styles", "quotation citation"),
    // Insert
    e("pw.insertTable", "{}", "Insert table…", "Insert", "grid rows columns"),
    e("pw.insertPicture", "{}", "Insert picture…", "Insert", "image photo figure graphic"),
    e("pw.link", "{}", "Insert link…", "Insert", "hyperlink url web address"),
    e("insert.removeLink", "{}", "Remove link", "Insert", "unlink hyperlink"),
    e("text.pageBreak", "{}", "Page break", "Insert", "new page"),
    e("text.lineBreak", "{}", "Line break", "Insert", "soft return newline"),
    e("insert.editHeader", "{}", "Edit header", "Insert", "top of page running head"),
    e("insert.editFooter", "{}", "Edit footer", "Insert", "bottom of page"),
    e("insert.pageNumber", r#"{"position":"bottom","align":"center"}"#, "Page numbers at the bottom", "Insert", "page numbering footer"),
    e("insert.pageNumber", r#"{"position":"top","align":"right"}"#, "Page numbers at the top right", "Insert", "page numbering header"),
    e("insert.dateField", "{}", "Today's date (updating)", "Insert", "date today field"),
    e("text.nbsp", "{}", "Non-breaking space", "Insert", "nbsp space keep together"),
    e("text.emDash", "{}", "Em dash —", "Insert", "dash long"),
    e("text.copyright", "{}", "Copyright sign ©", "Insert", "symbol c"),
    // Table
    e("table.insertRowAbove", "{}", "Insert row above", "Table", "add row"),
    e("table.insertRowBelow", "{}", "Insert row below", "Table", "add row"),
    e("table.insertColumnLeft", "{}", "Insert column left", "Table", "add column"),
    e("table.insertColumnRight", "{}", "Insert column right", "Table", "add column"),
    e("table.deleteRow", "{}", "Delete row", "Table", "remove row"),
    e("table.deleteColumn", "{}", "Delete column", "Table", "remove column"),
    e("table.merge", "{}", "Merge cells", "Table", "join combine"),
    e("table.repeatHeader", "{}", "Repeat header row on each page", "Table", "heading row repeat"),
    e("table.deleteTable", "{}", "Delete table", "Table", "remove table"),
    // Page
    e("pw.pageSetup", "{}", "Page setup…", "Page", "margins paper size orientation layout"),
    e("layout.orientation", r#"{"value":"landscape"}"#, "Landscape pages", "Page", "orientation wide sideways"),
    e("layout.orientation", r#"{"value":"portrait"}"#, "Portrait pages", "Page", "orientation tall upright"),
    e("layout.size", r#"{"name":"Letter"}"#, "Paper: US Letter", "Page", "size 8.5 x 11"),
    e("layout.size", r#"{"name":"A4"}"#, "Paper: A4", "Page", "size 210 297"),
    e("layout.margins", r#"{"preset":"normal"}"#, "Margins: normal (1 inch)", "Page", "margins 2.54 cm"),
    e("layout.margins", r#"{"preset":"narrow"}"#, "Margins: narrow (0.5 inch)", "Page", "margins small"),
    e("layout.margins", r#"{"preset":"wide"}"#, "Margins: wide", "Page", "margins large"),
    // View
    e("pw.toggleOutline", "{}", "Show or hide outline", "View", "navigation headings sidebar"),
    e("view.marks", "{}", "Show formatting marks", "View", "pilcrow paragraph marks hidden characters ¶"),
    e("pw.zoomIn", "{}", "Zoom in", "View", "bigger magnify"),
    e("pw.zoomOut", "{}", "Zoom out", "View", "smaller"),
    e("pw.zoomReset", "{}", "Zoom to 100%", "View", "actual size"),
    e("pw.fitWidth", "{}", "Fit page width", "View", "zoom fit"),
    e("pw.themeLight", "{}", "Light theme", "View", "appearance bright"),
    e("pw.themeDark", "{}", "Dark theme", "View", "appearance night"),
    e("pw.themeSystem", "{}", "Match system theme", "View", "appearance auto"),
    // Review & help
    e("review.wordCount", "{}", "Word count", "Review", "count words characters statistics"),
    e("pw.shortcuts", "{}", "Keyboard shortcuts", "Help", "keys hotkeys"),
    e("pw.about", "{}", "About Pagewright", "Help", "version licence credits engine"),
];

pub struct CommandSearch {
    pub query: String,
    pub selected: usize,
    focus: bool,
}

impl CommandSearch {
    pub fn new() -> Self {
        CommandSearch { query: String::new(), selected: 0, focus: true }
    }
}

impl Default for CommandSearch {
    fn default() -> Self {
        Self::new()
    }
}

/// Entries matching `query`, best first. Every word of the query must occur in the label,
/// group or synonyms; labels that start with the query rank first.
pub fn matches(query: &str) -> Vec<&'static Entry> {
    let q = query.trim().to_lowercase();
    if q.is_empty() {
        return ENTRIES.iter().collect();
    }
    let words: Vec<&str> = q.split_whitespace().collect();
    let mut scored: Vec<(i32, usize, &Entry)> = ENTRIES
        .iter()
        .enumerate()
        .filter_map(|(i, e)| {
            let label = e.label.to_lowercase();
            let hay = format!("{} {} {}", label, e.group.to_lowercase(), e.words);
            if !words.iter().all(|w| hay.contains(w)) {
                return None;
            }
            let mut score = 0;
            if label.starts_with(&q) {
                score += 100;
            }
            if label.split(|c: char| !c.is_alphanumeric()).any(|t| t.starts_with(words[0])) {
                score += 40;
            }
            if label.contains(&q) {
                score += 20;
            }
            Some((score, i, e))
        })
        .collect();
    scored.sort_by(|a, b| b.0.cmp(&a.0).then(a.1.cmp(&b.1)));
    scored.into_iter().map(|(_, _, e)| e).collect()
}

/// Why `e` can't run now, if it can't.
pub fn unavailable(app: &PagewrightApp, e: &Entry) -> Option<String> {
    if e.id.starts_with("pw.") {
        return match e.id {
            "pw.cut" | "pw.copy" if app.ws.session.sel.is_collapsed() => Some("select some text first".into()),
            "pw.recover" if !app.recovery_enabled() => Some("recovery copies are off for this session".into()),
            _ => None,
        };
    }
    let spec = app.ws.session.registry.get(e.id)?;
    (spec.enabled)(&app.ws.session).map(str::to_string)
}

/// Runs a search entry.
pub fn run(app: &mut PagewrightApp, e: &Entry) {
    let params: Value = serde_json::from_str(e.params).unwrap_or(json!({}));
    match e.id {
        "pw.cut" => crate::canvas::copy(app, true),
        "pw.copy" => crate::canvas::copy(app, false),
        "pw.paste" => crate::canvas::paste(app, ""),
        "pw.exportHtml" => app.export_flow(pagewright_core::FileKind::Html),
        "pw.exportMarkdown" => app.export_flow(pagewright_core::FileKind::Markdown),
        "pw.exportText" => app.export_flow(pagewright_core::FileKind::PlainText),
        "review.wordCount" => {
            let pages = app.ws.session.layout().pages.len();
            let d = &app.ws.session.doc;
            let words = d.word_count();
            let text = d.plain_text(wordcraft_engine::doc::StoryRef::Body);
            let chars = text.chars().filter(|c| *c != '\n').count();
            let no_space = text.chars().filter(|c| !c.is_whitespace()).count();
            app.dialog = Some(crate::dialogs::Dialog::Message {
                title: "Word count".into(),
                body: format!("Pages: {pages}\nWords: {words}\nCharacters (no spaces): {no_space}\nCharacters (with spaces): {chars}\nParagraphs: {}", d.paragraph_count()),
                warn: false,
            });
        }
        id => {
            app.command(id, params);
        }
    }
    app.canvas.want_focus = app.dialog.is_none() && !app.find.open;
}

pub fn show(app: &mut PagewrightApp, ctx: &Context) {
    let Some(mut cs) = app.search.take() else { return };
    let pal = app.pal;
    let mut keep = true;
    let mut chosen: Option<&'static Entry> = None;
    let screen = ctx.content_rect();
    let area = egui::Area::new("pw-search".into()).order(egui::Order::Foreground).fixed_pos(egui::pos2(screen.center().x - 280.0_f32.min(screen.width() / 2.0 - 16.0), screen.min.y + 70.0)).show(ctx, |ui| {
        let w = 560.0_f32.min(screen.width() - 32.0);
        Frame::popup(ui.style()).fill(pal.surface_raised).corner_radius(12.0).inner_margin(Margin::same(10)).stroke(Stroke::new(1.0, pal.border)).show(ui, |ui| {
            ui.set_width(w);
            let input = ui.add(egui::TextEdit::singleline(&mut cs.query).hint_text("Type a command: “bold”, “landscape”, “page numbers”…").desired_width(f32::INFINITY).font(theme::ui(15.0)).id_salt("pw-search-input"));
            if cs.focus {
                input.request_focus();
                cs.focus = false;
            }
            if input.changed() {
                cs.selected = 0;
            }
            let list = matches(&cs.query);
            let (down, up, enter, esc) = ui.input(|i| (i.key_pressed(Key::ArrowDown), i.key_pressed(Key::ArrowUp), i.key_pressed(Key::Enter), i.key_pressed(Key::Escape)));
            if down {
                cs.selected = (cs.selected + 1).min(list.len().saturating_sub(1));
            }
            if up {
                cs.selected = cs.selected.saturating_sub(1);
            }
            if esc {
                keep = false;
            }
            ui.add_space(6.0);
            if list.is_empty() {
                ui.label(RichText::new("No command matches. Try another word.").color(pal.text_muted));
            }
            egui::ScrollArea::vertical().max_height(380.0).show(ui, |ui| {
                for (i, e) in list.iter().enumerate().take(60) {
                    let why = unavailable(app, e);
                    let sel = i == cs.selected;
                    let (r, resp) = ui.allocate_exact_size(vec2(ui.available_width(), 30.0), Sense::click());
                    if sel || resp.hovered() {
                        ui.painter().rect_filled(r, 6.0, if sel { pal.accent_weak } else { pal.surface_sunken });
                    }
                    if sel && (down || up) {
                        ui.scroll_to_rect(r, None);
                    }
                    let color = if why.is_some() { pal.text_faint } else { pal.text };
                    ui.painter().text(r.min + vec2(10.0, 15.0), egui::Align2::LEFT_CENTER, e.label, theme::ui(13.5), color);
                    let right = match (&why, app.keys.shortcut_for(e.id)) {
                        (Some(w), _) => w.clone(),
                        (None, Some(k)) if e.params == "{}" => k.to_string(),
                        _ => String::new(),
                    };
                    let mut x = r.max.x - 10.0;
                    if !right.is_empty() {
                        let font = if why.is_some() { theme::ui(11.5) } else { theme::mono(11.0) };
                        let g = ui.painter().layout_no_wrap(right, font, pal.text_muted);
                        x -= g.size().x;
                        ui.painter().galley(egui::pos2(x, r.center().y - g.size().y / 2.0), g, pal.text_muted);
                        x -= 12.0;
                    }
                    let g = ui.painter().layout_no_wrap(e.group.to_string(), theme::ui(11.0), pal.text_muted);
                    if x - g.size().x > r.min.x + 260.0 {
                        ui.painter().galley(egui::pos2(x - g.size().x, r.center().y - g.size().y / 2.0), g, pal.text_muted);
                    }
                    let resp = match &why {
                        Some(w) => resp.on_hover_text(format!("Unavailable: {w}")),
                        None => resp,
                    };
                    if (resp.clicked() || (sel && enter)) && why.is_none() {
                        chosen = Some(e);
                    }
                }
            });
        });
    });
    // A click outside closes the search.
    let outside = ctx.input(|i| i.pointer.any_pressed() && i.pointer.interact_pos().is_some_and(|p| !area.response.rect.contains(p)));
    if outside {
        keep = false;
    }
    if let Some(e) = chosen {
        app.search = None;
        run(app, e);
        return;
    }
    if keep {
        app.search = Some(cs);
    } else {
        app.canvas.want_focus = true;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn synonyms_find_commands() {
        let first = |q: &str| matches(q).first().map(|e| e.label).unwrap_or("");
        assert_eq!(first("bold"), "Bold");
        assert_eq!(first("landscape"), "Landscape pages");
        assert_eq!(first("bigger"), "Larger text");
        assert_eq!(first("page num"), "Page numbers at the bottom");
        assert_eq!(first("h2"), "Style: Heading 2");
        assert!(matches("zzzz").is_empty());
    }
}
