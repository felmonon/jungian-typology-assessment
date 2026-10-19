//! Application state and the flows around a document: commands, saving, opening, closing,
//! exporting, printing and recovery.

use std::path::{Path, PathBuf};

use egui::{Context, Frame, Ui, ViewportCommand};
use pagewright_core::{FileKind, Notice, SaveOutcome, SaveStatus, Workspace};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use wordcraft_engine::CmdError;

use crate::canvas::Canvas;
use crate::dialogs::{ChooserMode, Dialog};
use crate::find::FindPanel;
use crate::keys::KeyMap;
use crate::palette::CommandSearch;
use crate::platform::Platform;
use crate::tokens::{Metrics, Palette};
use crate::{canvas, chrome, dialogs, find, palette, theme};

/// Light, dark, or following the system.
#[derive(Clone, Copy, PartialEq, Eq, Debug, Default, Serialize, Deserialize)]
pub enum ThemePref {
    #[default]
    System,
    Light,
    Dark,
}

/// Start-up options from the command line.
#[derive(Clone, Debug, Default)]
pub struct AppOptions {
    /// A document to open at start.
    pub open: Option<PathBuf>,
    /// Keep local recovery copies of unsaved work (off in tests).
    pub recovery: bool,
    /// Read and write preferences in the profile folder (off in tests).
    pub prefs: bool,
}

/// What happens once the current document has been saved or deliberately discarded.
#[derive(Clone, Debug, PartialEq)]
pub enum Then {
    Nothing,
    Quit,
    New,
    Open(Option<PathBuf>),
    Recover(String),
}

/// A short message at the bottom of the window.
pub struct Toast {
    pub text: String,
    pub warn: bool,
    pub until: f64,
}

/// Preferences kept between runs (`prefs.json` in the profile folder).
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct Prefs {
    pub theme: ThemePref,
    pub hide_outline: bool,
    pub zoom: Option<f32>,
    pub recent: Vec<PathBuf>,
    pub last_dir: Option<PathBuf>,
}

pub struct PagewrightApp {
    pub ws: Workspace,
    pub platform: Box<dyn Platform>,
    pub keys: KeyMap,
    pub canvas: Canvas,
    pub find: FindPanel,
    pub search: Option<CommandSearch>,
    pub dialog: Option<Dialog>,
    pub toast: Option<Toast>,
    pub show_outline: bool,
    pub theme: ThemePref,
    pub pal: Palette,
    pub m: Metrics,
    pub prefs: Prefs,
    pub time: f64,
    /// Notice messages the person dismissed for this document.
    pub dismissed: Vec<String>,
    /// Frames the current dialog has been on screen.
    pub dialog_frames: u32,
    /// The format bar's first control, where F6 takes the keyboard.
    pub toolbar_first: Option<egui::Id>,
    /// Save automatically (this document only; see [`Self::set_autosave`]).
    pub autosave: bool,
    /// When the document last changed (app time) and which revision that was.
    last_change: (f64, u64),
    /// When the last automatic save happened (app time).
    last_autosave: f64,
    pub autosaved_at: Option<std::time::SystemTime>,
    applied_dark: Option<bool>,
    fonts_ready: u8,
    allow_quit: bool,
    use_prefs: bool,
    recovery_enabled: bool,
    recovery_offered: bool,
    /// Document id before a recovery restore was requested; the restore has landed when it changes.
    pending_restore: Option<u64>,
}

impl PagewrightApp {
    pub fn new(ctx: &Context, platform: Box<dyn Platform>, opts: AppOptions) -> Self {
        pagewright_core::identity::init();
        let prefs = if opts.prefs { load_prefs() } else { Prefs::default() };
        let ws = Workspace::new_blank();
        let keys = KeyMap::new(&ws.session.registry);
        let mut app = PagewrightApp {
            ws,
            platform,
            keys,
            canvas: Canvas::new(prefs.zoom.unwrap_or(1.0)),
            find: FindPanel::default(),
            search: None,
            dialog: None,
            toast: None,
            show_outline: !prefs.hide_outline,
            theme: prefs.theme,
            pal: Palette::get(false),
            m: Metrics::get(),
            prefs,
            time: 0.0,
            dismissed: Vec::new(),
            dialog_frames: 0,
            toolbar_first: None,
            autosave: false,
            last_change: (0.0, 0),
            last_autosave: f64::NEG_INFINITY,
            autosaved_at: None,
            applied_dark: None,
            fonts_ready: 0,
            allow_quit: false,
            use_prefs: opts.prefs,
            recovery_enabled: false,
            recovery_offered: false,
            pending_restore: None,
        };
        if opts.recovery
            && let Some(dir) = pagewright_core::identity::recovery_dir()
        {
            let c = ctx.clone();
            match app.ws.session.enable_recovery(dir, std::sync::Arc::new(move || c.request_repaint())) {
                Ok(()) => app.recovery_enabled = true,
                Err(e) => log::warn!("recovery unavailable: {e}"),
            }
        }
        if let Some(p) = opts.open {
            app.open_path(&p);
        }
        app
    }

    /// The whole window, once per frame.
    pub fn ui(&mut self, ui: &mut Ui) {
        let ctx = ui.ctx().clone();
        self.time = ctx.input(|i| i.time);
        // Pagewright's fonts are installed in the context that draws it; they take effect from
        // the next frame, so the very first frame is left empty.
        if self.fonts_ready == 0 {
            theme::install_fonts(&ctx);
            self.fonts_ready = 1;
            ctx.request_repaint();
            return;
        }
        self.apply_theme(&ctx);
        self.recovery_tick(&ctx);
        self.autosave_tick(self.time);
        if self.autosave && self.ws.is_dirty() {
            ctx.request_repaint_after(std::time::Duration::from_millis(500));
        }
        self.close_request(&ctx);
        self.shell_shortcuts(&ctx);
        self.region_keys(&ctx);

        chrome::title_bar(self, ui);
        chrome::format_bar(self, ui);
        chrome::status_bar(self, ui);
        chrome::notice_bar(self, ui);
        if self.find.open {
            find::panel(self, ui);
        }
        if self.show_outline {
            chrome::outline(self, ui);
        }
        let desk = self.pal.desk;
        egui::CentralPanel::default().frame(Frame::NONE.fill(desk)).show(ui, |ui| canvas::show(self, ui));
        palette::show(self, &ctx);
        dialogs::show(self, &ctx);
        chrome::toast(self, &ctx);
    }

    fn apply_theme(&mut self, ctx: &Context) {
        let dark = match self.theme {
            ThemePref::Light => false,
            ThemePref::Dark => true,
            ThemePref::System => ctx.system_theme().is_some_and(|t| t == egui::Theme::Dark),
        };
        if self.applied_dark != Some(dark) {
            self.pal = Palette::get(dark);
            theme::apply(ctx, &self.pal);
            self.applied_dark = Some(dark);
        }
    }

    pub fn set_theme(&mut self, t: ThemePref) {
        self.theme = t;
        self.applied_dark = None;
        self.prefs.theme = t;
        self.save_prefs();
    }

    // ---------------------------------------------------------------------------------------
    // Commands

    /// Runs a command by id: Pagewright's own (`pw.*`), an intercepted `file.*`, or an engine
    /// command. Returns whether it succeeded; failures are shown to the person.
    pub fn command(&mut self, id: &str, params: Value) -> bool {
        match id {
            "pw.commandSearch" => self.search = Some(CommandSearch::new()),
            "pw.toggleOutline" => {
                self.show_outline = !self.show_outline;
                self.prefs.hide_outline = !self.show_outline;
                self.save_prefs();
            }
            "pw.find" | "edit.find" if params.get("text").is_none() => self.find.open_find(&self.ws.session.selected_text()),
            "pw.replace" | "edit.findReplace" => self.find.open_replace(&self.ws.session.selected_text()),
            // Nothing searched yet: "find next" opens Find, as in Word.
            "edit.findNext" | "edit.findPrevious" if self.ws.session.find.query.is_empty() => self.find.open_find(&self.ws.session.selected_text()),
            "edit.findNext" | "edit.findPrevious" => {
                let q = self.ws.session.find.query.clone();
                match self.ws.session.run(id, &params) {
                    Ok(_) => {
                        self.ws.session.pending = None;
                        self.canvas.reveal_caret = true;
                    }
                    Err(_) => self.toast(format!("No matches for “{q}”.")),
                }
            }
            "pw.new" | "file.new" if params.get("template").is_none() => self.after_discard_or_save(Then::New),
            "pw.open" => self.after_discard_or_save(Then::Open(None)),
            "file.open" => {
                let p = params.get("path").and_then(Value::as_str).map(PathBuf::from);
                self.after_discard_or_save(Then::Open(p))
            }
            "pw.save" | "file.save" => self.save_flow(Then::Nothing),
            "pw.saveAs" | "file.saveAs" => self.save_as_flow(self.ws.suggested_save_path(), Then::Nothing),
            "pw.close" | "file.close" => self.after_discard_or_save(Then::New),
            "pw.print" | "file.print" => self.dialog = Some(Dialog::print(self)),
            "pw.exportPdf" | "file.exportPdf" => self.export_flow(FileKind::Pdf),
            "pw.link" | "insert.link" if params.get("url").is_none() => self.dialog = Some(Dialog::link(self)),
            "pw.insertTable" => self.dialog = Some(Dialog::InsertTable { rows: 3, cols: 3 }),
            "pw.insertPicture" | "insert.picture" if params.get("path").is_none() && params.get("data").is_none() => self.pick_picture(),
            "pw.pageSetup" => self.dialog = Some(Dialog::page_setup(self)),
            "pw.zoomIn" => self.canvas.set_zoom(self.canvas.zoom * 1.1),
            "pw.zoomOut" => self.canvas.set_zoom(self.canvas.zoom / 1.1),
            "pw.zoomReset" => self.canvas.set_zoom(1.0),
            "pw.fitWidth" => self.canvas.fit_width = true,
            "pw.themeLight" => self.set_theme(ThemePref::Light),
            "pw.themeDark" => self.set_theme(ThemePref::Dark),
            "pw.themeSystem" => self.set_theme(ThemePref::System),
            "pw.about" => self.dialog = Some(Dialog::About),
            "pw.recover" => self.offer_recovery(true),
            "pw.shortcuts" => self.dialog = Some(Dialog::Shortcuts),
            "pw.autosave" => {
                let on = !self.autosave;
                self.set_autosave(on);
            }
            _ => {
                let ok = self.engine(id, params).is_ok();
                self.return_focus();
                return ok;
            }
        }
        self.return_focus();
        true
    }

    /// After a toolbar, menu or search action the keyboard belongs to the document again,
    /// unless the action opened something that wants it (a dialog, the search, the find bar).
    fn return_focus(&mut self) {
        if self.dialog.is_none() && self.search.is_none() && !self.find.open {
            self.canvas.want_focus = true;
        }
    }

    /// Runs an engine command, shows a failure, and acts on the requests it leaves for the UI.
    pub fn engine(&mut self, id: &str, params: Value) -> Result<Value, String> {
        let mutates = self.ws.session.registry.get(id).is_some_and(|s| s.mutates);
        let r = self.ws.session.run(id, &params);
        let out = match r {
            Ok(v) => {
                // A new selection drops formatting that was waiting for typing (Ctrl+B with no
                // selection, then a click elsewhere), so the bar shows what's selected.
                if id.starts_with("select.") || id.starts_with("edit.find") {
                    self.ws.session.pending = None;
                }
                if mutates || id.starts_with("caret.") || id.starts_with("select.") {
                    self.canvas.reveal_caret = true;
                    self.canvas.restart_blink(self.time);
                }
                Ok(v)
            }
            Err(CmdError::Disabled(why)) => {
                let why = why.split_once(": ").map_or(why.as_str(), |(_, w)| w).to_string();
                self.warn(format!("Not available: {why}"));
                Err(why)
            }
            Err(e) => {
                let msg = e.to_string();
                self.warn(msg.clone());
                Err(msg)
            }
        };
        self.ui_requests();
        out
    }

    /// The engine asks the front end for dialogs and other host actions through `ui_requests`.
    fn ui_requests(&mut self) {
        let reqs: Vec<Value> = std::mem::take(&mut self.ws.session.ui_requests);
        for r in reqs {
            if r.get("close").is_some() {
                self.after_discard_or_save(Then::New);
            } else if let Some(open) = r.get("open").and_then(Value::as_str) {
                match open {
                    "saveAs" => self.save_as_flow(self.ws.suggested_save_path(), Then::Nothing),
                    "openFile" => self.after_discard_or_save(Then::Open(None)),
                    "print" => self.dialog = Some(Dialog::print(self)),
                    "exportPdf" => self.export_flow(FileKind::Pdf),
                    "link" => self.dialog = Some(Dialog::link(self)),
                    "insertPicture" => self.pick_picture(),
                    "pageSetup" => self.dialog = Some(Dialog::page_setup(self)),
                    "find" | "goto" => self.find.open_find(&self.ws.session.selected_text()),
                    other => self.warn(format!("“{other}” needs a dialog Pagewright doesn't have yet.")),
                }
            } else if r.get("scrollTo").is_some() {
                self.canvas.reveal_caret = true;
            }
        }
    }

    /// Pagewright's own shortcuts work wherever focus is (except inside dialogs).
    fn shell_shortcuts(&mut self, ctx: &Context) {
        if self.dialog.is_some() || self.search.is_some() {
            return;
        }
        let events = ctx.input(|i| i.events.clone());
        for ev in events {
            if let egui::Event::Key { key, pressed: true, modifiers, repeat: false, .. } = ev
                && let Some((id, params)) = self.keys.lookup(key, modifiers)
                && id.starts_with("pw.")
            {
                ctx.input_mut(|i| i.consume_key(modifiers, key));
                self.command(&id, params);
            }
        }
    }

    /// F6 moves the keyboard between the page and the format bar (Word's pane key); Esc in the
    /// bars goes back to the page. Tab and Shift+Tab move between controls within a bar.
    fn region_keys(&mut self, ctx: &Context) {
        if self.dialog.is_some() || self.search.is_some() {
            return;
        }
        let focused = ctx.memory(|m| m.focused());
        let on_page = focused.is_some() && focused == self.canvas.widget_id;
        if ctx.input_mut(|i| i.consume_key(egui::Modifiers::NONE, egui::Key::F6)) {
            match (on_page, self.toolbar_first) {
                (true, Some(id)) => ctx.memory_mut(|m| m.request_focus(id)),
                _ => self.canvas.want_focus = true,
            }
        } else if !on_page && !self.find.open && ctx.input(|i| i.key_pressed(egui::Key::Escape)) {
            // egui has already released the focused control by now; give the page the keyboard.
            self.canvas.want_focus = true;
        }
    }

    pub fn toast(&mut self, text: impl Into<String>) {
        self.toast = Some(Toast { text: text.into(), warn: false, until: self.time + 3.5 });
    }

    pub fn warn(&mut self, text: impl Into<String>) {
        self.toast = Some(Toast { text: text.into(), warn: true, until: self.time + 6.0 });
    }

    // ---------------------------------------------------------------------------------------
    // Saving, opening, closing

    /// Runs `then` now if there are no unsaved changes; otherwise asks first.
    pub fn after_discard_or_save(&mut self, then: Then) {
        if self.ws.is_dirty() {
            self.dialog = Some(Dialog::Unsaved { then });
        } else {
            self.proceed(then);
        }
    }

    /// Carries out `then` (the document has been saved or deliberately discarded).
    pub fn proceed(&mut self, then: Then) {
        match then {
            Then::Nothing => {}
            Then::Quit => self.allow_quit = true,
            Then::New => {
                self.autosave = false;
                self.ws.new_in_place();
                self.canvas.reset();
                self.find.reset();
            }
            Then::Open(Some(p)) => self.open_path(&p),
            Then::Open(None) => {
                let start = self.prefs.last_dir.clone();
                if self.platform.has_native_dialogs() {
                    if let Some(p) = self.platform.pick_open(start) {
                        self.open_path(&p);
                    }
                } else {
                    self.dialog = Some(Dialog::chooser(ChooserMode::Open, start, None));
                }
            }
            Then::Recover(id) => {
                self.pending_restore = Some(self.ws.session.document_id());
                let _ = self.engine("file.recover", json!({"restore": id}));
            }
        }
    }

    /// Why this document can't save itself automatically, if it can't.
    pub fn autosave_blocked(&self) -> Option<String> {
        let Some(f) = self.ws.file() else {
            return Some("save the document to a file first".into());
        };
        if f.kind != FileKind::Word {
            return Some(format!("automatic saving is for Word documents; this is a {}", f.kind.name()));
        }
        if !f.untouched_losses.is_empty() || f.damaged || f.mismatch.is_some() {
            return Some("this file has content Pagewright can't keep; save a copy first".into());
        }
        None
    }

    /// Turns automatic saving on or off for this document. Turning it on is refused (with the
    /// reason) when a save would need a decision: no file yet, a non-Word file, or a file with
    /// content the fidelity guard reported.
    pub fn set_autosave(&mut self, on: bool) {
        if on && let Some(why) = self.autosave_blocked() {
            self.warn(format!("Can't save automatically: {why}."));
            return;
        }
        self.autosave = on;
        if on {
            self.toast("Saving automatically: changes are written to the file a few seconds after you stop typing.");
        } else {
            self.toast("Automatic saving is off. Save with Ctrl+S.");
        }
    }

    /// Saves when the document has been idle for 2 s after a change, at most every 5 s.
    pub fn autosave_tick(&mut self, now: f64) {
        let rev = self.ws.session.rev();
        if rev != self.last_change.1 {
            self.last_change = (now, rev);
        }
        if !self.autosave || !self.ws.is_dirty() || now - self.last_change.0 < 2.0 || now - self.last_autosave < 5.0 {
            return;
        }
        self.last_autosave = now;
        match self.ws.save(false) {
            Ok(SaveOutcome::Saved { .. }) => self.autosaved_at = Some(std::time::SystemTime::now()),
            Ok(_) => {
                self.autosave = false;
                self.warn("Automatic saving stopped: this save needs your decision. Use Save (Ctrl+S).");
            }
            Err(e) => {
                self.autosave = false;
                self.warn(format!("Automatic saving stopped: {e}"));
            }
        }
    }

    /// Whether the window may close now (set once unsaved work has been dealt with).
    pub fn quit_allowed(&self) -> bool {
        self.allow_quit
    }

    fn close_request(&mut self, ctx: &Context) {
        if self.allow_quit {
            ctx.send_viewport_cmd(ViewportCommand::Close);
            return;
        }
        if ctx.input(|i| i.viewport().close_requested()) && self.ws.is_dirty() {
            ctx.send_viewport_cmd(ViewportCommand::CancelClose);
            if !matches!(self.dialog, Some(Dialog::Unsaved { .. })) {
                self.dialog = Some(Dialog::Unsaved { then: Then::Quit });
            }
        }
    }

    pub fn open_path(&mut self, path: &Path) {
        match self.ws.open_in_place(path) {
            Ok(()) => {
                self.autosave = false;
                self.canvas.reset();
                self.find.reset();
                self.remember(path);
                if let Some(n) = self.ws.notices.iter().find(|n| n.is_warning()) {
                    let _ = n;
                } else {
                    self.toast(format!("Opened {}", self.ws.title()));
                }
            }
            Err(e) => {
                self.dialog = Some(Dialog::Message {
                    title: "Couldn't open this file".into(),
                    body: format!("{e}\n\nNothing was changed; the document you had open is still here."),
                    warn: true,
                })
            }
        }
    }

    pub fn save_flow(&mut self, then: Then) {
        let r = self.ws.save(false);
        self.handle_save(r, then);
    }

    pub fn save_as_flow(&mut self, suggested: Option<PathBuf>, then: Then) {
        let suggested = suggested.or_else(|| self.default_new_path());
        if self.platform.has_native_dialogs() {
            if let Some(p) = self.platform.pick_save(suggested, ("Word document", &["docx"])) {
                self.save_to(&p, false, then);
            }
        } else {
            let dir = suggested.as_ref().and_then(|p| p.parent().map(Path::to_path_buf)).or_else(|| self.prefs.last_dir.clone());
            let name = suggested.as_ref().and_then(|p| p.file_name()).map(|n| n.to_string_lossy().into_owned());
            self.dialog = Some(Dialog::chooser(ChooserMode::Save(Box::new(then)), dir, name));
        }
    }

    pub fn save_to(&mut self, path: &Path, confirmed: bool, then: Then) {
        let r = self.ws.save_as(path, confirmed);
        self.handle_save(r, then);
    }

    fn handle_save(&mut self, r: Result<SaveOutcome, String>, then: Then) {
        match r {
            Ok(SaveOutcome::Saved { path }) => {
                self.remember(&path);
                self.toast(format!("Saved to {}", folder_label(&path)));
                self.proceed(then);
            }
            Ok(SaveOutcome::Exported { path }) => {
                self.toast(format!("Exported {}", path.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default()));
                self.proceed(then);
            }
            Ok(SaveOutcome::NeedsLocation { suggested }) => self.save_as_flow(suggested, then),
            Ok(SaveOutcome::NeedsConfirmation { path, concerns }) => self.dialog = Some(Dialog::Confirm { path, concerns, then }),
            Err(e) => self.dialog = Some(Dialog::Message { title: "Couldn't save".into(), body: format!("{e}\n\nYour document is still open with all its changes."), warn: true }),
        }
    }

    /// A copy beside the original: "Report (edited).docx".
    pub fn copy_path(&self, path: &Path) -> PathBuf {
        let stem = path.file_stem().map(|s| s.to_string_lossy().into_owned()).unwrap_or_else(|| "Document".into());
        let dir = path.parent().map(Path::to_path_buf).unwrap_or_default();
        let mut candidate = dir.join(format!("{stem} (edited).docx"));
        let mut n = 2;
        while candidate.exists() {
            candidate = dir.join(format!("{stem} (edited {n}).docx"));
            n += 1;
        }
        candidate
    }

    fn default_new_path(&self) -> Option<PathBuf> {
        let dir = self.prefs.last_dir.clone().or_else(documents_dir)?;
        let title = self.ws.title();
        let base = if title == "Untitled" { first_words(&self.ws.session.doc.plain_text(wordcraft_engine::doc::StoryRef::Body)) } else { title };
        Some(dir.join(format!("{}.docx", sanitize(&base))))
    }

    pub fn export_flow(&mut self, kind: FileKind) {
        let ext = match kind {
            FileKind::Pdf => "pdf",
            FileKind::Html => "html",
            FileKind::Markdown => "md",
            FileKind::PlainText => "txt",
            _ => "pdf",
        };
        let base = self.ws.path().map(|p| p.with_extension(ext)).or_else(|| self.default_new_path().map(|p| p.with_extension(ext)));
        if self.platform.has_native_dialogs() {
            if let Some(p) = self.platform.pick_save(base, (kind.name(), &[ext])) {
                let r = self.ws.export(&p);
                self.handle_save(r, Then::Nothing);
            }
        } else {
            let dir = base.as_ref().and_then(|p| p.parent().map(Path::to_path_buf));
            let name = base.as_ref().and_then(|p| p.file_name()).map(|n| n.to_string_lossy().into_owned());
            self.dialog = Some(Dialog::chooser(ChooserMode::Export(kind), dir, name));
        }
    }

    fn pick_picture(&mut self) {
        if self.platform.has_native_dialogs() {
            if let Some(p) = self.platform.pick_open(self.prefs.last_dir.clone()) {
                self.insert_picture(&p);
            }
        } else {
            self.dialog = Some(Dialog::chooser(ChooserMode::Picture, self.prefs.last_dir.clone(), None));
        }
    }

    pub fn insert_picture(&mut self, path: &Path) {
        if self.engine("insert.picture", json!({"path": path.to_string_lossy()})).is_ok() {
            self.toast("Picture inserted. Add a description for screen readers from the command search: “Alt Text”.");
        }
    }

    fn remember(&mut self, path: &Path) {
        self.prefs.recent.retain(|p| p != path);
        self.prefs.recent.insert(0, path.to_path_buf());
        self.prefs.recent.truncate(10);
        self.prefs.last_dir = path.parent().map(Path::to_path_buf);
        self.save_prefs();
    }

    pub fn save_prefs(&self) {
        if !self.use_prefs {
            return;
        }
        let mut p = self.prefs.clone();
        p.zoom = Some(self.canvas.zoom);
        if let Some(dir) = pagewright_core::identity::profile_dir() {
            let _ = std::fs::create_dir_all(&dir);
            if let Ok(s) = serde_json::to_string_pretty(&p) {
                let _ = std::fs::write(dir.join("prefs.json"), s);
            }
        }
    }

    /// The text for the save-status indicator, and whether it needs attention.
    pub fn save_status_text(&self) -> (String, bool) {
        let ago = |t: Option<std::time::SystemTime>| t.and_then(|t| t.elapsed().ok()).map(|d| ago(d.as_secs()));
        match self.ws.save_status() {
            SaveStatus::NeverSaved { edited: false } => ("Not saved yet".into(), false),
            SaveStatus::NeverSaved { edited: true } => ("Unsaved · not in a file yet".into(), true),
            SaveStatus::Saved { path, at } if self.autosave => (format!("Saving automatically · {}{}", folder_label(&path), ago(at).map(|a| format!(" · {a}")).unwrap_or_default()), false),
            SaveStatus::Unsaved { path, .. } if self.autosave => (format!("Saving automatically · {}", folder_label(&path)), false),
            SaveStatus::Saved { path, at } => match ago(at) {
                Some(a) => (format!("Saved to {} · {a}", folder_label(&path)), false),
                None => (format!("In {} · no changes", folder_label(&path)), false),
            },
            SaveStatus::Unsaved { path, .. } => (format!("Unsaved changes · {}", folder_label(&path)), true),
        }
    }

    // ---------------------------------------------------------------------------------------
    // Recovery

    fn recovery_tick(&mut self, ctx: &Context) {
        if !self.recovery_enabled {
            return;
        }
        self.ws.session.recovery_tick();
        if let Some(before) = self.pending_restore
            && self.ws.session.document_id() != before
            && !self.ws.session.recovery_busy()
        {
            self.pending_restore = None;
            self.ws.adopt_recovered();
            self.canvas.reset();
            self.toast("Recovered. Save it to keep it.");
        }
        if !self.recovery_offered && self.ws.session.recovery_ready() {
            self.recovery_offered = true;
            self.offer_recovery(false);
        }
        if let Some(w) = self.ws.session.recovery_wait() {
            ctx.request_repaint_after(w);
        }
    }

    /// Shows recoverable copies. At start-up only when there are some; from the menu always.
    pub fn offer_recovery(&mut self, explicit: bool) {
        let docs = self.ws.session.recovery_documents();
        if docs.is_empty() {
            if explicit {
                let msg = if self.recovery_enabled { "There is no unsaved work to recover." } else { "Recovery copies are turned off for this session." };
                self.toast(msg);
            }
            return;
        }
        self.dialog = Some(Dialog::Recover { docs });
    }

    /// Why an engine command can't run right now: its own enablement, plus conditions the
    /// engine only reports after trying (so the interface can say so before).
    pub fn unavailable(&self, id: &str) -> Option<String> {
        let s = &self.ws.session;
        if let Some(why) = s.registry.get(id).and_then(|spec| (spec.enabled)(s)) {
            return Some(why.to_string());
        }
        match id {
            "table.merge" if s.cell_range().is_none() && !spans_cells(s) => Some("select two or more cells first".into()),
            _ => None,
        }
    }

    pub fn recovery_enabled(&self) -> bool {
        self.recovery_enabled
    }

    pub fn notice_messages(&self) -> Vec<(String, bool)> {
        self.ws.notices.iter().map(|n: &Notice| (n.message(), n.is_warning())).collect()
    }
}

/// Whether the selection runs across more than one table cell.
fn spans_cells(s: &wordcraft_engine::Session) -> bool {
    let (a, b) = s.sel.ordered();
    a.path.cell().is_some() && b.path.cell().is_some() && a.path.cell() != b.path.cell()
}

fn load_prefs() -> Prefs {
    pagewright_core::identity::profile_dir()
        .and_then(|d| std::fs::read_to_string(d.join("prefs.json")).ok())
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

fn documents_dir() -> Option<PathBuf> {
    let home = std::env::var_os(if cfg!(windows) { "USERPROFILE" } else { "HOME" }).map(PathBuf::from)?;
    let docs = home.join("Documents");
    Some(if docs.is_dir() { docs } else { home })
}

/// "Documents" or "~/Projects/Reports" style label for a file's folder.
pub fn folder_label(path: &Path) -> String {
    let dir = path.parent().unwrap_or(path);
    let name = dir.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_else(|| dir.display().to_string());
    if name.is_empty() { dir.display().to_string() } else { name }
}

fn ago(secs: u64) -> String {
    match secs {
        0..=9 => "just now".into(),
        10..=59 => format!("{secs} s ago"),
        60..=3599 => format!("{} min ago", secs / 60),
        _ => format!("{} h ago", secs / 3600),
    }
}

/// A file name from the document's first non-empty line (its title, usually), at most 8 words.
fn first_words(text: &str) -> String {
    let line = text.lines().map(str::trim).find(|l| !l.is_empty()).unwrap_or("");
    let words: Vec<&str> = line.split_whitespace().take(8).collect();
    if words.is_empty() { "Untitled".into() } else { words.join(" ").trim_end_matches(|c: char| ",;:.".contains(c)).to_string() }
}

fn sanitize(s: &str) -> String {
    let t: String = s.chars().map(|c| if "/\\:*?\"<>|".contains(c) || c.is_control() { ' ' } else { c }).collect();
    let t = t.trim().trim_end_matches('.').to_string();
    if t.is_empty() { "Untitled".into() } else { t.chars().take(80).collect() }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn names_and_labels() {
        assert_eq!(sanitize("Q3: plan/draft?"), "Q3  plan draft");
        assert_eq!(first_words("Quarterly letter\nDear reader, this part"), "Quarterly letter");
        assert_eq!(first_words("\n\n  A very long first line that goes on and on and on"), "A very long first line that goes on");
        assert_eq!(first_words(""), "Untitled");
        assert_eq!(folder_label(Path::new("/home/a/Documents/x.docx")), "Documents");
        assert_eq!(ago(5), "just now");
        assert_eq!(ago(125), "2 min ago");
    }
}
