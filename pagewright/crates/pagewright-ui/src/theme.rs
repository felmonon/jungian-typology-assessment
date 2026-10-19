//! Fonts and egui visuals from the design tokens.

use std::sync::Arc;

use egui::{Color32, CornerRadius, FontData, FontDefinitions, FontFamily, FontId, Stroke, Visuals};

use crate::tokens::{Metrics, Palette};

const INTER: &[u8] = include_bytes!("../../../vendor/wordcraft/assets/fonts/Inter-Regular.ttf");
const INTER_MEDIUM: &[u8] = include_bytes!("../../../vendor/wordcraft/assets/fonts/Inter-Medium.ttf");
const INTER_SEMIBOLD: &[u8] = include_bytes!("../../../vendor/wordcraft/assets/fonts/Inter-SemiBold.ttf");
const SERIF_SEMIBOLD: &[u8] = include_bytes!("../../../vendor/wordcraft/assets/fonts/SourceSerif4-Semibold.ttf");
const SERIF_BOLD: &[u8] = include_bytes!("../../../vendor/wordcraft/assets/fonts/SourceSerif4-Bold.ttf");
const SERIF_ITALIC: &[u8] = include_bytes!("../../../vendor/wordcraft/assets/fonts/SourceSerif4-It.ttf");
const MONO: &[u8] = include_bytes!("../../../vendor/wordcraft/assets/fonts/JetBrainsMono-Regular.ttf");

/// Named font families beyond egui's two.
pub const STRONG: &str = "pw-strong";
pub const MEDIUM: &str = "pw-medium";
pub const DISPLAY: &str = "pw-display";
pub const SERIF_B: &str = "pw-serif-bold";
pub const SERIF_I: &str = "pw-serif-italic";

pub fn install_fonts(ctx: &egui::Context) {
    let mut fonts = FontDefinitions::default();
    for (name, bytes) in [
        ("inter", INTER),
        ("inter-medium", INTER_MEDIUM),
        ("inter-semibold", INTER_SEMIBOLD),
        ("serif-semibold", SERIF_SEMIBOLD),
        ("serif-bold", SERIF_BOLD),
        ("serif-italic", SERIF_ITALIC),
        ("mono", MONO),
    ] {
        fonts.font_data.insert(name.into(), Arc::new(FontData::from_static(bytes)));
    }
    // egui's bundled fonts stay as fallbacks for symbols and emoji.
    let fallback_prop = fonts.families.get(&FontFamily::Proportional).cloned().unwrap_or_default();
    let fallback_mono = fonts.families.get(&FontFamily::Monospace).cloned().unwrap_or_default();
    let with = |first: &str, rest: &[String]| std::iter::once(first.to_string()).chain(rest.iter().cloned()).collect::<Vec<_>>();
    fonts.families.insert(FontFamily::Proportional, with("inter", &fallback_prop));
    fonts.families.insert(FontFamily::Monospace, with("mono", &fallback_mono));
    fonts.families.insert(FontFamily::Name(STRONG.into()), with("inter-semibold", &fallback_prop));
    fonts.families.insert(FontFamily::Name(MEDIUM.into()), with("inter-medium", &fallback_prop));
    fonts.families.insert(FontFamily::Name(DISPLAY.into()), with("serif-semibold", &fallback_prop));
    fonts.families.insert(FontFamily::Name(SERIF_B.into()), with("serif-bold", &fallback_prop));
    fonts.families.insert(FontFamily::Name(SERIF_I.into()), with("serif-italic", &fallback_prop));
    ctx.set_fonts(fonts);
}

pub fn ui(size: f32) -> FontId {
    FontId::proportional(size)
}
pub fn strong(size: f32) -> FontId {
    FontId::new(size, FontFamily::Name(STRONG.into()))
}
pub fn medium(size: f32) -> FontId {
    FontId::new(size, FontFamily::Name(MEDIUM.into()))
}
pub fn display(size: f32) -> FontId {
    FontId::new(size, FontFamily::Name(DISPLAY.into()))
}
pub fn mono(size: f32) -> FontId {
    FontId::monospace(size)
}

/// Applies the palette to egui's style.
pub fn apply(ctx: &egui::Context, p: &Palette) {
    let m = Metrics::get();
    let mut v = if p.dark { Visuals::dark() } else { Visuals::light() };
    v.panel_fill = p.surface;
    v.window_fill = p.surface_raised;
    v.extreme_bg_color = p.surface_sunken;
    v.faint_bg_color = p.surface_sunken;
    v.code_bg_color = p.surface_sunken;
    v.window_stroke = Stroke::new(1.0, p.border);
    v.window_corner_radius = CornerRadius::same(m.radius_xl as u8);
    v.menu_corner_radius = CornerRadius::same(m.radius_l as u8);
    v.selection.bg_fill = p.accent_weak;
    v.selection.stroke = Stroke::new(1.0, p.accent);
    v.hyperlink_color = p.accent;
    v.warn_fg_color = p.warning;
    v.error_fg_color = p.danger;
    v.override_text_color = Some(p.text);
    v.weak_text_color = Some(p.text_muted);
    let r = CornerRadius::same(m.radius_m as u8);
    let w = &mut v.widgets;
    w.noninteractive.bg_fill = p.surface;
    w.noninteractive.weak_bg_fill = p.surface;
    w.noninteractive.bg_stroke = Stroke::new(1.0, p.border);
    w.noninteractive.fg_stroke = Stroke::new(1.0, p.text);
    w.inactive.bg_fill = p.surface_raised;
    w.inactive.weak_bg_fill = Color32::TRANSPARENT;
    w.inactive.bg_stroke = Stroke::NONE;
    w.inactive.fg_stroke = Stroke::new(1.0, p.text);
    w.hovered.bg_fill = p.surface_sunken;
    w.hovered.weak_bg_fill = p.surface_sunken;
    w.hovered.bg_stroke = Stroke::new(1.0, p.border);
    w.hovered.fg_stroke = Stroke::new(1.0, p.text);
    w.active.bg_fill = p.accent_weak;
    w.active.weak_bg_fill = p.accent_weak;
    w.active.bg_stroke = Stroke::new(1.0, p.accent);
    w.active.fg_stroke = Stroke::new(1.0, p.text);
    w.open.bg_fill = p.surface_sunken;
    w.open.weak_bg_fill = p.surface_sunken;
    w.open.bg_stroke = Stroke::new(1.0, p.border);
    w.open.fg_stroke = Stroke::new(1.0, p.text);
    for s in [&mut w.noninteractive, &mut w.inactive, &mut w.hovered, &mut w.active, &mut w.open] {
        s.corner_radius = r;
    }
    v.popup_shadow = egui::Shadow { offset: [0, 6], blur: 18, spread: 0, color: Color32::from_black_alpha(if p.dark { 110 } else { 40 }) };
    v.window_shadow = egui::Shadow { offset: [0, 12], blur: 32, spread: 0, color: Color32::from_black_alpha(if p.dark { 130 } else { 50 }) };
    ctx.set_visuals(v);
    ctx.all_styles_mut(|s| {
        s.spacing.item_spacing = egui::vec2(6.0, 6.0);
        s.spacing.button_padding = egui::vec2(8.0, 4.0);
        s.spacing.interact_size.y = 26.0;
        s.spacing.menu_margin = egui::Margin::same(6);
        s.text_styles.insert(egui::TextStyle::Body, ui(m.body));
        s.text_styles.insert(egui::TextStyle::Button, ui(m.body));
        s.text_styles.insert(egui::TextStyle::Small, ui(m.small));
        s.text_styles.insert(egui::TextStyle::Heading, display(m.display));
        s.text_styles.insert(egui::TextStyle::Monospace, mono(m.small));
    });
}
