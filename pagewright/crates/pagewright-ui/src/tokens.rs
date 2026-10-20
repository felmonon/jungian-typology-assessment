//! Design tokens, read from `brand/tokens.json` (compiled in), so the interface and the brand
//! assets can't drift apart.

use std::sync::OnceLock;

use egui::Color32;
use serde_json::Value;

const TOKENS: &str = include_str!("../../../brand/tokens.json");

/// One theme's colours.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Palette {
    pub dark: bool,
    pub desk: Color32,
    pub page: Color32,
    pub page_shadow: Color32,
    pub surface: Color32,
    pub surface_raised: Color32,
    pub surface_sunken: Color32,
    pub border: Color32,
    pub border_strong: Color32,
    pub text: Color32,
    pub text_muted: Color32,
    pub text_faint: Color32,
    pub accent: Color32,
    pub accent_hover: Color32,
    pub accent_text: Color32,
    pub accent_weak: Color32,
    pub marker: Color32,
    pub marker_weak: Color32,
    pub selection: Color32,
    pub caret: Color32,
    pub focus: Color32,
    pub success: Color32,
    pub warning: Color32,
    pub warning_weak: Color32,
    pub danger: Color32,
    pub danger_weak: Color32,
}

/// Spacing, radii and bar sizes.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Metrics {
    pub title_bar: f32,
    pub format_bar: f32,
    pub status_bar: f32,
    pub sidebar: f32,
    pub page_gap: f32,
    pub radius_s: f32,
    pub radius_m: f32,
    pub radius_l: f32,
    pub radius_xl: f32,
    pub body: f32,
    pub small: f32,
    pub caption: f32,
    pub title: f32,
    pub display: f32,
}

fn tokens() -> &'static Value {
    static T: OnceLock<Value> = OnceLock::new();
    T.get_or_init(|| serde_json::from_str(TOKENS).expect("brand/tokens.json is valid JSON"))
}

/// `#RRGGBB` or `#RRGGBBAA` (unmultiplied alpha).
pub fn parse_hex(s: &str) -> Option<Color32> {
    let h = s.strip_prefix('#')?;
    let b = |i: usize| u8::from_str_radix(h.get(i..i + 2)?, 16).ok();
    match h.len() {
        6 => Some(Color32::from_rgb(b(0)?, b(2)?, b(4)?)),
        8 => Some(Color32::from_rgba_unmultiplied(b(0)?, b(2)?, b(4)?, b(6)?)),
        _ => None,
    }
}

fn color(theme: &str, name: &str) -> Color32 {
    tokens()["color"][theme][name].as_str().and_then(parse_hex).unwrap_or_else(|| panic!("token color.{theme}.{name} missing or invalid"))
}

fn num(path: &[&str]) -> f32 {
    let mut v = tokens();
    for p in path {
        v = &v[*p];
    }
    v.as_f64().unwrap_or_else(|| panic!("token {} missing", path.join("."))) as f32
}

impl Palette {
    pub fn get(dark: bool) -> Palette {
        let t = if dark { "dark" } else { "light" };
        let c = |n| color(t, n);
        Palette {
            dark,
            desk: c("desk"),
            page: c("page"),
            page_shadow: c("pageShadow"),
            surface: c("surface"),
            surface_raised: c("surfaceRaised"),
            surface_sunken: c("surfaceSunken"),
            border: c("border"),
            border_strong: c("borderStrong"),
            text: c("text"),
            text_muted: c("textMuted"),
            text_faint: c("textFaint"),
            accent: c("accent"),
            accent_hover: c("accentHover"),
            accent_text: c("accentText"),
            accent_weak: c("accentWeak"),
            marker: c("marker"),
            marker_weak: c("markerWeak"),
            selection: c("selection"),
            caret: c("caret"),
            focus: c("focus"),
            success: c("success"),
            warning: c("warning"),
            warning_weak: c("warningWeak"),
            danger: c("danger"),
            danger_weak: c("dangerWeak"),
        }
    }
}

impl Metrics {
    pub fn get() -> Metrics {
        Metrics {
            title_bar: num(&["layout", "titleBar"]),
            format_bar: num(&["layout", "formatBar"]),
            status_bar: num(&["layout", "statusBar"]),
            sidebar: num(&["layout", "sidebar"]),
            page_gap: num(&["layout", "pageGap"]),
            radius_s: num(&["radius", "s"]),
            radius_m: num(&["radius", "m"]),
            radius_l: num(&["radius", "l"]),
            radius_xl: num(&["radius", "xl"]),
            body: num(&["size", "body"]),
            small: num(&["size", "small"]),
            caption: num(&["size", "caption"]),
            title: num(&["size", "title"]),
            display: num(&["size", "display"]),
        }
    }

    pub fn min_window() -> (f32, f32) {
        (num(&["layout", "minWindowWidth"]), num(&["layout", "minWindowHeight"]))
    }
}

/// WCAG 2.x contrast ratio between two opaque colours.
pub fn contrast(a: Color32, b: Color32) -> f32 {
    fn lum(c: Color32) -> f32 {
        let f = |v: u8| {
            let v = v as f32 / 255.0;
            if v <= 0.03928 { v / 12.92 } else { ((v + 0.055) / 1.055).powf(2.4) }
        };
        0.2126 * f(c.r()) + 0.7152 * f(c.g()) + 0.0722 * f(c.b())
    }
    let (x, y) = (lum(a), lum(b));
    (x.max(y) + 0.05) / (x.min(y) + 0.05)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_token_parses() {
        for dark in [false, true] {
            let _ = Palette::get(dark);
        }
        let _ = Metrics::get();
    }

    #[test]
    fn text_pairs_meet_wcag_aa() {
        for dark in [false, true] {
            let p = Palette::get(dark);
            for (name, fg, bg) in [
                ("text/surface", p.text, p.surface),
                ("text/raised", p.text, p.surface_raised),
                ("muted/surface", p.text_muted, p.surface),
                ("muted/raised", p.text_muted, p.surface_raised),
                ("accentText/accent", p.accent_text, p.accent),
                ("accent/surface", p.accent, p.surface),
                ("danger/surface", p.danger, p.surface),
                ("warning/warningWeak", p.warning, p.warning_weak),
                ("text/accentWeak", p.text, p.accent_weak),
                ("text/markerWeak", p.text, p.marker_weak),
                ("text/dangerWeak", p.text, p.danger_weak),
            ] {
                let r = contrast(fg, bg);
                assert!(r >= 4.5, "{} theme {name}: {r:.2}:1 is below 4.5:1", if dark { "dark" } else { "light" });
            }
        }
    }

    #[test]
    fn caret_is_visible_on_paper_in_both_themes() {
        for dark in [false, true] {
            let p = Palette::get(dark);
            assert!(contrast(p.caret, p.page) >= 7.0);
        }
    }
}
