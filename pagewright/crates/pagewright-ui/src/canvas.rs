//! The page canvas: real pages from the engine's layout, rasterised per page and cached; the
//! caret, selection and find matches drawn over them; mouse, keyboard, clipboard and IME input
//! turned into engine commands.

use std::collections::HashMap;
use std::hash::{Hash, Hasher};
use std::sync::Arc;

use egui::{Color32, CursorIcon, Event, Id, ImeEvent, Key, Modifiers, Pos2, Rect, Sense, Stroke, TextureHandle, TextureOptions, Ui, pos2, vec2};
use serde_json::json;
use wordcraft_engine::doc::{Pos, StoryRef};
use wordcraft_engine::layout::{DocLayout, Page, Placed};

use crate::app::PagewrightApp;

/// Logical pixels per point at 100% zoom (96 dpi screen, 72 points per inch).
pub const PX_PER_PT: f32 = 96.0 / 72.0;
const MIN_ZOOM: f32 = 0.3;
const MAX_ZOOM: f32 = 4.0;

pub struct Canvas {
    pub zoom: f32,
    /// Fit the widest page to the window on the next frame.
    pub fit_width: bool,
    textures: HashMap<usize, (u64, TextureHandle)>,
    keys_for: Option<Arc<DocLayout>>,
    keys: Vec<Option<u64>>,
    pub reveal_caret: bool,
    /// Scroll so this page (and point in it, in points) is at the top.
    pub scroll_to: Option<(usize, f32)>,
    pub focused: bool,
    pub want_focus: bool,
    blink_epoch: f64,
    drag_anchor: Option<Pos>,
    clicks: (f64, Pos2, u32),
    pub preedit: String,
    /// Screen rects of the pages drawn last frame.
    pub page_rects: Vec<Rect>,
    pub caret_rect: Option<Rect>,
    /// The page nearest the top of the view, for the status bar.
    pub top_page: usize,
    pub page_count: usize,
    pub widget_id: Option<Id>,
    pub rendered_pages: u64,
}

impl Canvas {
    pub fn new(zoom: f32) -> Self {
        Canvas {
            zoom: zoom.clamp(MIN_ZOOM, MAX_ZOOM),
            fit_width: false,
            textures: HashMap::new(),
            keys_for: None,
            keys: Vec::new(),
            reveal_caret: true,
            scroll_to: None,
            focused: false,
            want_focus: true,
            blink_epoch: 0.0,
            drag_anchor: None,
            clicks: (0.0, Pos2::ZERO, 0),
            preedit: String::new(),
            page_rects: Vec::new(),
            caret_rect: None,
            top_page: 0,
            page_count: 0,
            widget_id: None,
            rendered_pages: 0,
        }
    }

    /// Forget everything tied to the previous document.
    pub fn reset(&mut self) {
        self.textures.clear();
        self.keys_for = None;
        self.keys.clear();
        self.reveal_caret = true;
        self.scroll_to = Some((0, 0.0));
        self.want_focus = true;
        self.drag_anchor = None;
        self.preedit.clear();
    }

    pub fn set_zoom(&mut self, z: f32) {
        self.zoom = (z.clamp(MIN_ZOOM, MAX_ZOOM) * 100.0).round() / 100.0;
        self.fit_width = false;
        self.reveal_caret = true;
    }

    pub fn restart_blink(&mut self, now: f64) {
        self.blink_epoch = now;
    }

    fn scale(&self) -> f32 {
        self.zoom * PX_PER_PT
    }

    /// Content fingerprint of page `i` of `layout`, computed once per layout (paragraph layouts
    /// are shared `Arc`s, so an unchanged paragraph keeps its address across relayouts).
    fn page_key(&mut self, layout: &Arc<DocLayout>, i: usize) -> u64 {
        if !self.keys_for.as_ref().is_some_and(|l| Arc::ptr_eq(l, layout)) {
            self.keys_for = Some(layout.clone());
            self.keys = vec![None; layout.pages.len()];
        }
        if let Some(Some(k)) = self.keys.get(i) {
            return *k;
        }
        let k = layout.pages.get(i).map_or(0, page_content_key);
        if let Some(slot) = self.keys.get_mut(i) {
            *slot = Some(k);
        }
        k
    }
}

fn page_content_key(page: &Page) -> u64 {
    let mut h = std::collections::hash_map::DefaultHasher::new();
    (page.w.to_bits(), page.h.to_bits(), page.number).hash(&mut h);
    for list in [&page.items, &page.header, &page.footer] {
        list.len().hash(&mut h);
        for it in list {
            match it {
                Placed::Lines { para, l0, l1, x, y, .. } => (Arc::as_ptr(para) as usize, l0, l1, x.to_bits(), y.to_bits()).hash(&mut h),
                other => format!("{other:?}").hash(&mut h),
            }
        }
    }
    h.finish()
}

/// The page canvas.
pub fn show(app: &mut PagewrightApp, ui: &mut Ui) {
    let layout = app.ws.session.layout();
    app.canvas.page_count = layout.pages.len();
    let gap = app.m.page_gap;
    if app.canvas.fit_width {
        let widest = layout.pages.iter().map(|p| p.w).fold(1.0, f32::max);
        let z = ((ui.available_width() - 2.0 * gap - 16.0) / (widest * PX_PER_PT)).clamp(MIN_ZOOM, MAX_ZOOM);
        app.canvas.zoom = (z * 100.0).floor() / 100.0;
        app.canvas.fit_width = false;
    }
    let scale = app.canvas.scale();
    let ppp = ui.ctx().pixels_per_point();
    let widest = layout.pages.iter().map(|p| p.w * scale).fold(0.0, f32::max);
    let total_h: f32 = layout.pages.iter().map(|p| p.h * scale + gap).sum::<f32>() + gap;
    let id = ui.make_persistent_id("pagewright-canvas");
    app.canvas.widget_id = Some(id);

    let mut scroll = egui::ScrollArea::both().id_salt("canvas-scroll").auto_shrink([false, false]);
    if let Some((page, y)) = app.canvas.scroll_to.take() {
        let top: f32 = layout.pages.iter().take(page).map(|p| p.h * scale + gap).sum::<f32>() + gap + y * scale - gap;
        scroll = scroll.vertical_scroll_offset(top.max(0.0));
    }

    scroll.show_viewport(ui, |ui, viewport| {
        let content_w = (widest + 2.0 * gap).max(ui.available_width());
        let (rect, response) = ui.allocate_exact_size(vec2(content_w, total_h.max(ui.available_height())), Sense::click_and_drag());
        let response = ui.interact(rect, id, Sense::click_and_drag()).union(response);
        let painter = ui.painter_at(ui.clip_rect());
        let origin = rect.min;

        // Page rectangles (screen space).
        let mut y = gap;
        let mut rects = Vec::with_capacity(layout.pages.len());
        for p in &layout.pages {
            let w = p.w * scale;
            let x = ((content_w - w) / 2.0).max(gap);
            rects.push(Rect::from_min_size(origin + vec2(x, y), vec2(w, p.h * scale)));
            y += p.h * scale + gap;
        }
        app.canvas.top_page = rects.iter().position(|r| r.max.y - origin.y > viewport.min.y + 40.0).unwrap_or(0);

        // Pages: shadow, paper raster.
        let visible = viewport.expand2(vec2(0.0, viewport.height() * 0.5));
        let doc_opts = wordcraft_render::RenderOptions { text_darkening: cfg!(target_os = "macos"), ..Default::default() };
        for (i, r) in rects.iter().enumerate() {
            let local = r.translate(-origin.to_vec2());
            if !local.intersects(visible) {
                continue;
            }
            let shadow = app.pal.page_shadow;
            painter.rect_filled(r.translate(vec2(0.0, 2.0)).expand(1.0), 2.0, shadow);
            painter.rect_filled(*r, 0.0, app.pal.page);
            let scale_px = scale * ppp;
            let key = {
                let k = app.canvas.page_key(&layout, i);
                let mut h = std::collections::hash_map::DefaultHasher::new();
                (k, scale_px.to_bits()).hash(&mut h);
                h.finish()
            };
            let cached = app.canvas.textures.get(&i).is_some_and(|(k, _)| *k == key);
            if !cached {
                let img = wordcraft_render::render_page(&app.ws.session.doc, &layout.pages[i], scale_px, &doc_opts);
                let color = egui::ColorImage::from_rgba_premultiplied([img.width as usize, img.height as usize], &img.pixels);
                app.canvas.rendered_pages += 1;
                match app.canvas.textures.get_mut(&i) {
                    Some((k, tex)) => {
                        tex.set(color, TextureOptions::LINEAR);
                        *k = key;
                    }
                    None => {
                        let tex = ui.ctx().load_texture(format!("page-{i}"), color, TextureOptions::LINEAR);
                        app.canvas.textures.insert(i, (key, tex));
                    }
                }
            }
            if let Some((_, tex)) = app.canvas.textures.get(&i) {
                let size = tex.size_vec2() / ppp;
                let snap = |v: f32| (v * ppp).round() / ppp;
                let at = Rect::from_min_size(pos2(snap(r.min.x), snap(r.min.y)), size);
                painter.image(tex.id(), at, Rect::from_min_max(pos2(0.0, 0.0), pos2(1.0, 1.0)), Color32::WHITE);
            }
        }
        // Drop textures for pages that no longer exist.
        let n = rects.len();
        app.canvas.textures.retain(|i, _| *i < n);
        app.canvas.page_rects = rects.clone();

        let to_screen = |page: usize, x: f32, y: f32| -> Option<Pos2> { rects.get(page).map(|r| r.min + vec2(x * scale, y * scale)) };

        // Find matches.
        let hint = app.ws.session.page_hint;
        let finds: Vec<(Pos, Pos)> = if app.find.open { app.ws.session.find_highlights().to_vec() } else { Vec::new() };
        let doc = &app.ws.session.doc;
        for (a, b) in &finds {
            for (pg, rr) in layout.selection_rects(doc, a, b, hint) {
                if let (Some(p0), Some(p1)) = (to_screen(pg, rr.x, rr.y), to_screen(pg, rr.x + rr.w, rr.y + rr.h)) {
                    painter.rect_filled(Rect::from_min_max(p0, p1), 1.0, app.pal.marker.gamma_multiply(0.45));
                }
            }
        }

        // Selection.
        let (sa, sb) = app.ws.session.sel.ordered();
        let collapsed = sa == sb;
        if !collapsed {
            for (pg, rr) in layout.selection_rects(doc, &sa, &sb, hint) {
                if let (Some(p0), Some(p1)) = (to_screen(pg, rr.x, rr.y), to_screen(pg, rr.x + rr.w, rr.y + rr.h)) {
                    painter.rect_filled(Rect::from_min_max(p0, p1), 0.0, app.pal.selection);
                }
            }
        }

        // Caret.
        let focus = app.ws.session.sel.focus.clone();
        app.canvas.caret_rect = layout.caret_on(&focus, hint).and_then(|c| {
            let p0 = to_screen(c.page, c.x, c.top)?;
            Some(Rect::from_min_size(p0, vec2((c.width * scale).max(1.5), (c.height * scale).max(8.0))))
        });
        if let Some(cr) = app.canvas.caret_rect {
            if collapsed && app.canvas.focused {
                let t = (app.time - app.canvas.blink_epoch).max(0.0);
                if t % 1.06 < 0.6 || t > 30.0 {
                    let w = (cr.width()).clamp(1.5, 3.0);
                    painter.rect_filled(Rect::from_min_size(cr.min, vec2(w, cr.height())), 0.0, app.pal.caret);
                }
                if t < 30.0 {
                    ui.ctx().request_repaint_after(std::time::Duration::from_millis(120));
                }
            }
            if !app.canvas.preedit.is_empty() {
                let font = egui::FontId::proportional((cr.height() * 0.75).max(10.0));
                let galley = painter.layout_no_wrap(app.canvas.preedit.clone(), font, Color32::BLACK);
                let bg = Rect::from_min_size(cr.min, galley.size()).expand(2.0);
                painter.rect_filled(bg, 2.0, Color32::from_rgb(0xFF, 0xF8, 0xDC));
                painter.galley(cr.min, galley.clone(), Color32::BLACK);
                painter.line_segment([pos2(bg.min.x, bg.max.y), pos2(bg.max.x, bg.max.y)], Stroke::new(1.0, Color32::BLACK));
            }
            if app.canvas.reveal_caret {
                ui.scroll_to_rect(cr.expand2(vec2(40.0, 60.0)), None);
                app.canvas.reveal_caret = false;
            }
        }

        // Focus. Keys are only taken when the canvas already had focus as this frame began: the
        // key that moved focus here (Escape closing the find bar, say) belongs to its old owner.
        let had_focus = response.has_focus();
        if app.canvas.want_focus && app.dialog.is_none() && app.search.is_none() {
            response.request_focus();
            app.canvas.want_focus = false;
        }
        app.canvas.focused = response.has_focus();
        if app.canvas.focused {
            ui.memory_mut(|m| m.set_focus_lock_filter(id, egui::EventFilter { tab: true, horizontal_arrows: true, vertical_arrows: true, escape: false }));
            // Where the IME candidate window goes.
            if let Some(cr) = app.canvas.caret_rect {
                ui.ctx().output_mut(|o| o.ime = Some(egui::output::IMEOutput { purpose: Default::default(), rect, cursor_rect: cr, should_interrupt_composition: false }));
            }
        }

        mouse(app, ui, &response, &rects, scale, &layout);
        if app.canvas.focused && had_focus {
            keyboard(app, ui);
        }
        if response.hovered() {
            ui.ctx().set_cursor_icon(CursorIcon::Text);
        }
        // Ctrl + wheel zooms.
        let zoom = ui.input(|i| i.zoom_delta());
        if response.hovered() && (zoom - 1.0).abs() > 0.001 {
            app.canvas.set_zoom(app.canvas.zoom * zoom);
            app.canvas.reveal_caret = false;
        }
        response.context_menu(|ui| crate::chrome::context_menu(app, ui));
    });
}

/// The page and page-local point (points) under a screen position.
fn hit_page(rects: &[Rect], scale: f32, p: Pos2) -> Option<(usize, f32, f32)> {
    let (i, r) = rects.iter().enumerate().min_by(|(_, a), (_, b)| dist(a, p).total_cmp(&dist(b, p)))?;
    let q = pos2(p.x.clamp(r.min.x, r.max.x), p.y.clamp(r.min.y, r.max.y));
    Some((i, (q.x - r.min.x) / scale, (q.y - r.min.y) / scale))
}

fn dist(r: &Rect, p: Pos2) -> f32 {
    let dx = (r.min.x - p.x).max(0.0).max(p.x - r.max.x);
    let dy = (r.min.y - p.y).max(0.0).max(p.y - r.max.y);
    dx * dx + dy * dy
}

fn mouse(app: &mut PagewrightApp, ui: &Ui, response: &egui::Response, rects: &[Rect], scale: f32, layout: &Arc<DocLayout>) {
    let (pressed, shift, pos, now) = ui.input(|i| (i.pointer.primary_pressed(), i.modifiers.shift, i.pointer.interact_pos(), i.time));
    if pressed && response.hovered() && let Some(p) = pos {
        app.canvas.want_focus = true;
        app.canvas.restart_blink(now);
        let Some((page, x, y)) = hit_page(rects, scale, p) else { return };
        // Click counting: double = word, triple = paragraph.
        let (t0, p0, n) = app.canvas.clicks;
        let n = if now - t0 < 0.45 && p.distance(p0) < 6.0 { n + 1 } else { 1 };
        app.canvas.clicks = (now, p, n);
        if shift {
            let story = app.ws.session.story();
            if let Some(hit) = layout.hit(page, x, y, story) {
                app.ws.session.sel.focus = hit;
                app.ws.session.goal_x = None;
            }
            return;
        }
        // Ctrl+click follows a link, as in Word.
        if ui.input(|i| i.modifiers.command)
            && let Some(url) = link_at(app, layout, page, x, y)
        {
            app.platform.open_url(&url);
            return;
        }
        let _ = app.engine("caret.set", json!({"page": page, "x": x, "y": y}));
        match n {
            2 => {
                let _ = app.engine("select.word", json!({}));
            }
            3.. => {
                let _ = app.engine("select.paragraph", json!({}));
            }
            _ => {}
        }
        app.canvas.drag_anchor = (n == 1).then(|| app.ws.session.sel.anchor.clone());
        app.canvas.reveal_caret = false;
    }
    if response.dragged() && let (Some(anchor), Some(p)) = (app.canvas.drag_anchor.clone(), pos) {
        if let Some((page, x, y)) = hit_page(rects, scale, p) {
            let story = anchor.story;
            if let Some(hit) = layout.hit(page, x, y, story) {
                app.ws.session.sel.anchor = anchor;
                app.ws.session.sel.focus = hit;
                app.ws.session.goal_x = None;
            }
        }
        // Dragging past the edge scrolls.
        let clip = ui.clip_rect();
        if p.y > clip.max.y - 12.0 || p.y < clip.min.y + 12.0 {
            app.canvas.reveal_caret = true;
        }
    }
    if ui.input(|i| i.pointer.primary_released()) {
        app.canvas.drag_anchor = None;
    }
}

fn link_at(app: &PagewrightApp, layout: &DocLayout, page: usize, x: f32, y: f32) -> Option<String> {
    let pos = layout.hit(page, x, y, StoryRef::Body)?;
    let para = app.ws.session.doc.para_at(&pos)?;
    let off = pos.off;
    [off, para.prev_boundary(off)].into_iter().find_map(|o| para.props_of_char(o).link.clone().filter(|l| !l.is_empty()))
}

fn keyboard(app: &mut PagewrightApp, ui: &Ui) {
    let events = ui.input(|i| i.events.clone());
    for ev in events {
        match ev {
            Event::Text(t) => {
                let cmd = ui.input(|i| i.modifiers.command && !i.modifiers.alt);
                if !cmd && !t.is_empty() && !t.chars().all(char::is_control) {
                    let _ = app.engine("text.insert", json!({"text": t}));
                }
            }
            Event::Key { key, pressed: true, modifiers, .. } => {
                if key == Key::Escape && !app.canvas.preedit.is_empty() {
                    continue;
                }
                // Esc leaves a header or footer, as in Word.
                if key == Key::Escape && modifiers.is_none() && app.ws.session.story() != StoryRef::Body {
                    let _ = app.engine("insert.closeHeader", json!({}));
                    continue;
                }
                if let Some((id, params)) = app.keys.lookup(key, modifiers) {
                    // Clipboard keys arrive as Copy/Cut/Paste events; Pagewright's own were handled globally.
                    if matches!(id.as_str(), "edit.copy" | "edit.cut" | "edit.paste") || id.starts_with("pw.") {
                        continue;
                    }
                    app.command(&id, params);
                } else if key == Key::Escape && app.find.open {
                    app.find.open = false;
                }
            }
            Event::Copy => copy(app, false),
            Event::Cut => copy(app, true),
            Event::Paste(text) => paste(app, &text),
            Event::Ime(ime) => match ime {
                ImeEvent::Preedit { text, .. } => app.canvas.preedit = text,
                ImeEvent::Commit(s) => {
                    app.canvas.preedit.clear();
                    if !s.is_empty() {
                        let _ = app.engine("text.insert", json!({"text": s}));
                    }
                }
                ImeEvent::DeleteSurrounding { .. } => {}
                #[allow(deprecated)]
                ImeEvent::Enabled | ImeEvent::Disabled => app.canvas.preedit.clear(),
            },
            _ => {}
        }
    }
    let _ = Modifiers::NONE;
}

/// Copy or cut: the engine's fragment as HTML and plain text on the system clipboard.
pub fn copy(app: &mut PagewrightApp, cut: bool) {
    if app.ws.session.sel.is_collapsed() {
        return;
    }
    if let Ok(v) = app.engine(if cut { "edit.cut" } else { "edit.copy" }, json!({})) {
        let text = v.get("text").and_then(|t| t.as_str()).unwrap_or_default().to_string();
        let html = v.get("html").and_then(|t| t.as_str()).map(str::to_string);
        app.platform.set_clipboard(html.as_deref(), &text);
    }
}

/// Paste: rich HTML when the clipboard has it, else the text.
pub fn paste(app: &mut PagewrightApp, text: &str) {
    let html = app.platform.clipboard_html();
    let text = if text.is_empty() { app.platform.clipboard_text().unwrap_or_default() } else { text.to_string() };
    let mut params = json!({"text": text});
    if let Some(h) = html.filter(|h| !h.trim().is_empty()) {
        params["html"] = json!(h);
    }
    if params["text"].as_str().is_some_and(str::is_empty) && params.get("html").is_none() {
        return;
    }
    let _ = app.engine("edit.paste", params);
}
