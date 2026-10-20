//! Find and replace: a slim bar under the format bar. Matches are highlighted on the page as you
//! type, with a "3 of 12" counter; Enter goes to the next match, Shift+Enter to the previous.

use egui::{Frame, Key, Margin, RichText, Stroke, Ui};
use serde_json::json;

use crate::app::PagewrightApp;
use crate::icons::Icon;
use crate::theme;
use crate::widgets::icon_button;

#[derive(Default)]
pub struct FindPanel {
    pub open: bool,
    pub replace_mode: bool,
    pub query: String,
    pub replacement: String,
    pub match_case: bool,
    pub whole_word: bool,
    /// Query and options the current results are for.
    searched: Option<(String, bool, bool)>,
    pub status: String,
    focus_query: bool,
    focus_replace: bool,
}

impl FindPanel {
    pub fn open_find(&mut self, selected: &str) {
        self.open = true;
        self.replace_mode = false;
        self.seed(selected);
    }

    pub fn open_replace(&mut self, selected: &str) {
        self.open = true;
        self.replace_mode = true;
        // Seeded from the selection: go straight to "replace with". A query left from an earlier
        // search stays in "find", selected, so typing replaces it.
        if self.seed(selected) {
            self.focus_query = false;
            self.focus_replace = true;
        }
    }

    /// Puts the selected text in "find" (when it's a short, single-line selection). Returns
    /// whether it did.
    fn seed(&mut self, selected: &str) -> bool {
        let s = selected.trim();
        let seeded = !s.is_empty() && !s.contains('\n') && s.chars().count() < 120;
        if seeded {
            self.query = s.to_string();
        }
        self.focus_query = true;
        self.searched = None;
        seeded
    }

    pub fn reset(&mut self) {
        self.searched = None;
        self.status.clear();
    }

    fn opts(&self) -> serde_json::Value {
        json!({"text": self.query, "matchCase": self.match_case, "wholeWord": self.whole_word})
    }
}

pub fn panel(app: &mut PagewrightApp, ui: &mut Ui) {
    let pal = app.pal;
    let mut close = false;
    // Alt+R / Alt+A act before the text fields see the key, so no letter is typed.
    let (alt_r, alt_a) = ui.input_mut(|i| {
        let r = i.consume_key(egui::Modifiers::ALT, Key::R);
        let a = i.consume_key(egui::Modifiers::ALT, Key::A);
        if r || a {
            i.events.retain(|e| !matches!(e, egui::Event::Text(_)));
        }
        (r, a)
    });
    let (alt_r, alt_a) = (alt_r && app.find.replace_mode, alt_a && app.find.replace_mode);
    egui::Panel::top("pw-find").frame(Frame::NONE.fill(pal.surface_raised).inner_margin(Margin::symmetric(12, 6)).stroke(Stroke::new(1.0, pal.border))).show(ui, |ui| {
        ui.horizontal(|ui| {
            ui.spacing_mut().item_spacing.x = 4.0;
            let q = ui.add(egui::TextEdit::singleline(&mut app.find.query).hint_text("Find in document").desired_width(220.0).id_salt("pw-find-query"));
            if app.find.focus_query {
                q.request_focus();
                app.find.focus_query = false;
                // Select what's there, so typing replaces an old query.
                let mut state = egui::TextEdit::load_state(ui.ctx(), q.id).unwrap_or_default();
                let n = app.find.query.chars().count();
                state.cursor.set_char_range(Some(egui::text::CCursorRange::two(egui::text::CCursor::new(0), egui::text::CCursor::new(n))));
                state.store(ui.ctx(), q.id);
            }
            let enter = q.lost_focus() && ui.input(|i| i.key_pressed(Key::Enter));
            let shift = ui.input(|i| i.modifiers.shift);
            let key = (app.find.query.clone(), app.find.match_case, app.find.whole_word);
            if app.find.searched.as_ref() != Some(&key) {
                search(app);
            }
            let n = app.ws.session.find.results.len();
            let counter = if app.find.query.is_empty() {
                String::new()
            } else if n == 0 {
                "No matches".into()
            } else {
                format!("{} of {}", current_index(app).map_or(0, |i| i + 1), n)
            };
            ui.label(RichText::new(counter).font(theme::ui(12.0)).color(if n == 0 && !app.find.query.is_empty() { pal.danger } else { pal.text_muted }));
            let has = n > 0;
            if icon_button(ui, &pal, Icon::ChevronDown, "Next match (Enter)", if has { Ok(()) } else { Err("no matches") }, false).clicked() {
                step(app, true);
            }
            if enter {
                // In replace mode, Enter moves on to "replace with" while it's empty.
                if app.find.replace_mode && app.find.replacement.is_empty() {
                    app.find.focus_replace = true;
                } else {
                    if has {
                        step(app, !shift);
                    }
                    q.request_focus();
                }
            }
            let prev = icon_button(ui, &pal, Icon::ChevronUp, "Previous match (Shift+Enter)", if has { Ok(()) } else { Err("no matches") }, false);
            if prev.clicked() {
                step(app, false);
            }
            ui.toggle_value(&mut app.find.match_case, RichText::new("Aa").font(theme::medium(12.0))).on_hover_text("Match case");
            ui.toggle_value(&mut app.find.whole_word, RichText::new("Whole words").font(theme::ui(12.0))).on_hover_text("Only whole words");
            ui.separator();
            ui.toggle_value(&mut app.find.replace_mode, "Replace…").on_hover_text("Show replace (Ctrl+H)");
            if app.find.replace_mode {
                let r = ui.add(egui::TextEdit::singleline(&mut app.find.replacement).hint_text("Replace with").desired_width(180.0).id_salt("pw-find-replace"));
                if app.find.focus_replace {
                    r.request_focus();
                    app.find.focus_replace = false;
                }
                let replace_enter = r.lost_focus() && ui.input(|i| i.key_pressed(Key::Enter));
                let one = ui.add_enabled(has, egui::Button::new("Replace")).on_hover_text("Replace this match and go to the next (Alt+R, or Enter in Replace with)").on_disabled_hover_text("No matches");
                if (one.clicked() || alt_r || replace_enter) && has {
                    replace_one(app);
                    if replace_enter {
                        app.find.focus_replace = true;
                    }
                }
                let all = ui.add_enabled(has, egui::Button::new("Replace all")).on_hover_text("Replace every match, as one undo step (Alt+A)").on_disabled_hover_text("No matches");
                if (all.clicked() || alt_a) && has {
                    replace_all(app);
                }
            }
            ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                if icon_button(ui, &pal, Icon::Close, "Close find (Esc)", Ok(()), false).clicked() {
                    close = true;
                }
                if !app.find.status.is_empty() {
                    ui.label(RichText::new(&app.find.status).font(theme::ui(12.0)).color(pal.text_muted));
                }
            });
        });
    });
    if close || (ui.input(|i| i.key_pressed(Key::Escape)) && app.dialog.is_none() && app.search.is_none()) {
        app.find.open = false;
        app.ws.session.find.highlight = false;
        app.canvas.want_focus = true;
    }
}

fn search(app: &mut PagewrightApp) {
    let key = (app.find.query.clone(), app.find.match_case, app.find.whole_word);
    app.find.searched = Some(key);
    app.find.status.clear();
    if app.find.query.is_empty() {
        app.ws.session.find.results.clear();
        app.ws.session.find.highlight = false;
        return;
    }
    // Search from where the caret was, not from the previous match.
    let (a, _) = app.ws.session.sel.ordered();
    app.ws.session.sel = wordcraft_engine::Selection::caret(a);
    let _ = app.engine("edit.find", app.find.opts());
    app.ws.session.find.highlight = true;
}

fn current_index(app: &PagewrightApp) -> Option<usize> {
    let (a, b) = app.ws.session.sel.ordered();
    app.ws.session.find.results.iter().position(|(x, y)| *x == a && *y == b)
}

fn step(app: &mut PagewrightApp, forward: bool) {
    let _ = app.engine(if forward { "edit.findNext" } else { "edit.findPrevious" }, json!({}));
}

fn replace_one(app: &mut PagewrightApp) {
    let mut p = app.find.opts();
    p["with"] = json!(app.find.replacement);
    if let Ok(v) = app.engine("edit.replace", p) {
        let left = v.get("remaining").and_then(|n| n.as_u64()).unwrap_or(0);
        app.find.status = format!("Replaced 1 · {left} left");
    }
    app.find.searched = None;
}

fn replace_all(app: &mut PagewrightApp) {
    let mut p = app.find.opts();
    p["with"] = json!(app.find.replacement);
    if let Ok(v) = app.engine("edit.replaceAll", p) {
        let n = v.get("count").or_else(|| v.get("replaced")).and_then(|n| n.as_u64()).unwrap_or(0);
        app.find.status = format!("Replaced {n}");
    }
    app.find.searched = None;
}
