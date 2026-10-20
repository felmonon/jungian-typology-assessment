//! Small controls in Pagewright's style. Every control has a tooltip; a disabled one says why.

use egui::{Color32, Response, RichText, Sense, Stroke, Ui, vec2};

use crate::icons::{self, Icon};
use crate::tokens::Palette;

/// A square icon button. `active` draws it pressed (a format that is on).
pub fn icon_button(ui: &mut Ui, pal: &Palette, icon: Icon, tip: &str, enabled: Result<(), &str>, active: bool) -> Response {
    let size = vec2(28.0, 28.0);
    let (rect, resp) = ui.allocate_exact_size(size, if enabled.is_ok() { Sense::click() } else { Sense::hover() });
    let fill = if active {
        pal.accent_weak
    } else if resp.hovered() && enabled.is_ok() {
        pal.surface_sunken
    } else {
        Color32::TRANSPARENT
    };
    ui.painter().rect_filled(rect, 6.0, fill);
    if active {
        ui.painter().rect_stroke(rect, 6.0, Stroke::new(1.0, pal.accent.gamma_multiply(0.6)), egui::StrokeKind::Inside);
    }
    if resp.has_focus() {
        ui.painter().rect_stroke(rect.expand(1.0), 7.0, Stroke::new(2.0, pal.focus), egui::StrokeKind::Outside);
    }
    let color = match (enabled.is_ok(), active) {
        (false, _) => pal.text_faint,
        (true, true) => if pal.dark { pal.accent } else { pal.accent_hover },
        _ => pal.text,
    };
    icons::paint(ui.painter(), rect.shrink(6.0), icon, color);
    let name = accessible_name(tip);
    let on = enabled.is_ok();
    if active {
        resp.widget_info(|| egui::WidgetInfo::selected(egui::WidgetType::Checkbox, on, true, &name));
    } else {
        resp.widget_info(|| egui::WidgetInfo::labeled(egui::WidgetType::Button, on, &name));
    }
    let resp = resp.on_hover_text(tip);
    match enabled {
        Ok(()) => resp,
        Err(why) => resp.on_hover_text(format!("Unavailable: {why}")),
    }
}

/// Decoration drawn under or through a letter toggle.
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Deco {
    None,
    Underline,
    Strike,
}

/// A letter toggle (B, I, U, S) set in a face that shows what it does.
pub fn letter_toggle(ui: &mut Ui, pal: &Palette, text: &str, font: egui::FontId, deco: Deco, tip: &str, active: bool) -> Response {
    let size = vec2(28.0, 28.0);
    let (rect, resp) = ui.allocate_exact_size(size, Sense::click());
    let fill = if active { pal.accent_weak } else if resp.hovered() { pal.surface_sunken } else { Color32::TRANSPARENT };
    ui.painter().rect_filled(rect, 6.0, fill);
    if active {
        ui.painter().rect_stroke(rect, 6.0, Stroke::new(1.0, pal.accent.gamma_multiply(0.6)), egui::StrokeKind::Inside);
    }
    if resp.has_focus() {
        ui.painter().rect_stroke(rect.expand(1.0), 7.0, Stroke::new(2.0, pal.focus), egui::StrokeKind::Outside);
    }
    let color = if active { if pal.dark { pal.accent } else { pal.accent_hover } } else { pal.text };
    let galley = ui.painter().layout_no_wrap(text.to_string(), font, color);
    let pos = rect.center() - galley.size() / 2.0;
    let g = galley.rect.translate(pos.to_vec2());
    ui.painter().galley(pos, galley, color);
    match deco {
        Deco::Underline => {
            ui.painter().line_segment([egui::pos2(g.min.x, g.max.y - 2.0), egui::pos2(g.max.x, g.max.y - 2.0)], Stroke::new(1.3, color));
        }
        Deco::Strike => {
            ui.painter().line_segment([egui::pos2(g.min.x - 1.0, g.center().y + 1.0), egui::pos2(g.max.x + 1.0, g.center().y + 1.0)], Stroke::new(1.3, color));
        }
        Deco::None => {}
    }
    let name = accessible_name(tip);
    resp.widget_info(|| egui::WidgetInfo::selected(egui::WidgetType::Checkbox, true, active, &name));
    resp.on_hover_text(tip)
}

/// The spoken name of a control: its tooltip without the shortcut in brackets.
pub fn accessible_name(tip: &str) -> String {
    tip.split(" (").next().unwrap_or(tip).trim().to_string()
}

/// A thin vertical divider between groups.
pub fn divider(ui: &mut Ui, pal: &Palette) {
    let (rect, _) = ui.allocate_exact_size(vec2(9.0, 22.0), Sense::hover());
    ui.painter().line_segment([rect.center_top(), rect.center_bottom()], Stroke::new(1.0, pal.border));
}

/// A key hint, like `Ctrl+/`.
pub fn kbd(ui: &mut Ui, pal: &Palette, keys: &str) {
    let font = crate::theme::mono(11.0);
    let galley = ui.painter().layout_no_wrap(keys.to_string(), font, pal.text_muted);
    let (rect, _) = ui.allocate_exact_size(galley.size() + vec2(10.0, 4.0), Sense::hover());
    ui.painter().rect(rect, 4.0, pal.surface_sunken, Stroke::new(1.0, pal.border), egui::StrokeKind::Inside);
    ui.painter().galley(rect.center() - galley.size() / 2.0, galley, pal.text_muted);
}

/// A primary (accent) button.
pub fn primary(ui: &mut Ui, pal: &Palette, label: &str) -> Response {
    ui.add(egui::Button::new(RichText::new(label).color(pal.accent_text).font(crate::theme::strong(13.0))).fill(pal.accent).min_size(vec2(96.0, 30.0)))
}

/// A secondary button.
pub fn secondary(ui: &mut Ui, pal: &Palette, label: &str) -> Response {
    ui.add(egui::Button::new(RichText::new(label).color(pal.text)).fill(pal.surface_raised).stroke(Stroke::new(1.0, pal.border_strong)).min_size(vec2(88.0, 30.0)))
}

/// A destructive button.
pub fn danger(ui: &mut Ui, pal: &Palette, label: &str) -> Response {
    ui.add(egui::Button::new(RichText::new(label).color(pal.danger)).fill(pal.surface_raised).stroke(Stroke::new(1.0, pal.danger.gamma_multiply(0.7))).min_size(vec2(88.0, 30.0)))
}

/// A dropdown button: label, then a painted chevron (the bundled fonts have no ▾ glyph).
pub fn dropdown(ui: &mut Ui, pal: &Palette, label: &str, min_width: f32, tint: Option<(Color32, Color32)>) -> Response {
    let font = crate::theme::ui(13.0);
    let (fg, bg) = tint.unwrap_or((pal.text, Color32::TRANSPARENT));
    let galley = ui.painter().layout_no_wrap(label.to_string(), font.clone(), fg);
    let w = (galley.size().x + 34.0).max(min_width);
    let (rect, resp) = ui.allocate_exact_size(vec2(w, 28.0), Sense::click());
    let fill = if resp.hovered() || resp.is_pointer_button_down_on() { pal.surface_sunken } else { bg };
    ui.painter().rect(rect, 6.0, fill, Stroke::new(1.0, if resp.hovered() { pal.border } else { Color32::TRANSPARENT }), egui::StrokeKind::Inside);
    if resp.has_focus() {
        ui.painter().rect_stroke(rect.expand(1.0), 7.0, Stroke::new(2.0, pal.focus), egui::StrokeKind::Outside);
    }
    let text_rect = egui::Rect::from_min_max(rect.min + vec2(8.0, 0.0), rect.max - vec2(22.0, 0.0));
    let galley = ui.painter().layout(label.to_string(), font, fg, f32::INFINITY);
    let clip = ui.painter().with_clip_rect(text_rect);
    clip.galley(egui::pos2(text_rect.min.x, rect.center().y - galley.size().y / 2.0), galley, fg);
    icons::paint(ui.painter(), egui::Rect::from_center_size(egui::pos2(rect.max.x - 12.0, rect.center().y), vec2(12.0, 12.0)), Icon::ChevronDown, pal.text_muted);
    resp
}

/// [`dropdown`] with an accessible name ("Paragraph style") and its current value.
pub fn dropdown_named(ui: &mut Ui, pal: &Palette, name: &str, value: &str, min_width: f32, tint: Option<(Color32, Color32)>) -> Response {
    let resp = dropdown(ui, pal, value, min_width, tint);
    let label = format!("{name}: {value}");
    resp.widget_info(|| {
        let mut i = egui::WidgetInfo::labeled(egui::WidgetType::ComboBox, true, &label);
        i.current_text_value = Some(value.to_string());
        i
    });
    resp
}
