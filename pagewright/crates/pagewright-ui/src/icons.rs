//! Pagewright's interface icons: original line drawings on a 16-unit grid, 1.5-unit rounded
//! strokes, painted in code. No third-party or Microsoft artwork.

use egui::{Color32, Painter, Pos2, Rect, Stroke, pos2, vec2};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Icon {
    Undo,
    Redo,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Bullets,
    Numbering,
    IndentLess,
    IndentMore,
    Link,
    Image,
    Table,
    PageBreak,
    Search,
    Sidebar,
    Page,
    Export,
    Print,
    More,
    Close,
    Check,
    Warning,
    Info,
    ChevronDown,
    ChevronUp,
    Plus,
    Minus,
    Moon,
    Sun,
    TextColor,
    Highlight,
    Folder,
    File,
    Save,
    LineSpacing,
    ClearFormat,
    Header,
}

/// Paints `icon` into `rect` (square), in `color`.
pub fn paint(p: &Painter, rect: Rect, icon: Icon, color: Color32) {
    let s = rect.width().min(rect.height()) / 16.0;
    let o = rect.center() - vec2(8.0 * s, 8.0 * s);
    let at = |x: f32, y: f32| -> Pos2 { pos2(o.x + x * s, o.y + y * s) };
    let st = Stroke::new(1.5 * s, color);
    let line = |a: (f32, f32), b: (f32, f32)| {
        p.line_segment([at(a.0, a.1), at(b.0, b.1)], st);
    };
    let poly = |pts: &[(f32, f32)]| {
        p.add(egui::Shape::line(pts.iter().map(|&(x, y)| at(x, y)).collect(), st));
    };
    let closed = |pts: &[(f32, f32)]| {
        p.add(egui::Shape::closed_line(pts.iter().map(|&(x, y)| at(x, y)).collect(), st));
    };
    let rect_at = |x0: f32, y0: f32, x1: f32, y1: f32, r: f32| {
        p.rect_stroke(Rect::from_min_max(at(x0, y0), at(x1, y1)), r * s, st, egui::StrokeKind::Middle);
    };
    let dot = |x: f32, y: f32, r: f32| {
        p.circle_filled(at(x, y), r * s, color);
    };
    match icon {
        Icon::Undo | Icon::Redo => {
            let f = |x: f32| if icon == Icon::Undo { x } else { 16.0 - x };
            // A hook arrow: the curve, then the head.
            poly(&[(f(3.5), 6.0), (f(10.0), 6.0), (f(12.5), 7.0), (f(13.5), 9.5), (f(12.5), 12.0), (f(10.0), 13.0), (f(7.0), 13.0)]);
            poly(&[(f(6.0), 3.0), (f(3.0), 6.0), (f(6.0), 9.0)]);
        }
        Icon::AlignLeft | Icon::AlignCenter | Icon::AlignRight | Icon::AlignJustify => {
            let rows = [(3.0, 13.0), (3.0, 9.0), (3.0, 13.0), (3.0, 10.0)];
            for (i, (y, (_, w))) in [4.0f32, 7.0, 10.0, 13.0].iter().zip(rows.iter()).enumerate() {
                let w = if icon == Icon::AlignJustify { 10.0 } else if i % 2 == 1 { w - 3.0 } else { *w - 3.0 + 3.0 * ((i == 0) as u8 as f32) };
                let (x0, x1) = match icon {
                    Icon::AlignLeft | Icon::AlignJustify => (3.0, 3.0 + w),
                    Icon::AlignRight => (13.0 - w, 13.0),
                    _ => (8.0 - w / 2.0, 8.0 + w / 2.0),
                };
                line((x0, *y), (x1, *y));
            }
        }
        Icon::Bullets => {
            for y in [4.5, 8.0, 11.5] {
                dot(3.5, y, 1.1);
                line((6.5, y), (13.5, y));
            }
        }
        Icon::Numbering => {
            for (i, y) in [4.5f32, 8.0, 11.5].iter().enumerate() {
                let x = 3.0;
                match i {
                    0 => line((x + 0.8, *y - 1.5), (x + 0.8, *y + 1.5)),
                    1 => {
                        poly(&[(x, *y - 1.2), (x + 1.6, *y - 1.5), (x + 1.6, *y), (x, *y + 1.5), (x + 1.8, *y + 1.5)]);
                    }
                    _ => {
                        poly(&[(x, *y - 1.5), (x + 1.8, *y - 1.5), (x + 0.8, *y), (x + 1.8, *y + 1.5), (x, *y + 1.5)]);
                    }
                }
                line((6.5, *y), (13.5, *y));
            }
        }
        Icon::IndentLess | Icon::IndentMore => {
            for y in [3.5, 12.5] {
                line((3.0, y), (13.0, y));
            }
            for y in [6.5, 9.5] {
                line((8.0, y), (13.0, y));
            }
            if icon == Icon::IndentMore {
                poly(&[(3.0, 5.5), (5.5, 8.0), (3.0, 10.5)]);
            } else {
                poly(&[(5.5, 5.5), (3.0, 8.0), (5.5, 10.5)]);
            }
        }
        Icon::Link => {
            p.rect_stroke(Rect::from_center_size(at(5.8, 10.2), vec2(6.0 * s, 4.0 * s)).rotate_bb(egui::emath::Rot2::from_angle(-0.785)), 2.0 * s, st, egui::StrokeKind::Middle);
            p.rect_stroke(Rect::from_center_size(at(10.2, 5.8), vec2(6.0 * s, 4.0 * s)).rotate_bb(egui::emath::Rot2::from_angle(-0.785)), 2.0 * s, st, egui::StrokeKind::Middle);
            line((6.5, 9.5), (9.5, 6.5));
        }
        Icon::Image => {
            rect_at(2.5, 3.5, 13.5, 12.5, 1.5);
            poly(&[(3.0, 11.5), (6.5, 8.0), (9.0, 10.5), (10.5, 9.0), (13.0, 11.5)]);
            dot(10.5, 6.2, 1.2);
        }
        Icon::Table => {
            rect_at(2.5, 3.0, 13.5, 13.0, 1.5);
            line((2.5, 6.5), (13.5, 6.5));
            line((2.5, 10.0), (13.5, 10.0));
            line((8.0, 6.5), (8.0, 13.0));
        }
        Icon::PageBreak => {
            poly(&[(4.0, 2.5), (4.0, 6.0), (12.0, 6.0), (12.0, 2.5)]);
            poly(&[(4.0, 13.5), (4.0, 10.0), (12.0, 10.0), (12.0, 13.5)]);
            for x in [2.0, 5.5, 9.0, 12.5] {
                line((x, 8.0), (x + 1.5, 8.0));
            }
        }
        Icon::Search => {
            p.circle_stroke(at(7.0, 7.0), 4.0 * s, st);
            line((10.0, 10.0), (13.5, 13.5));
        }
        Icon::Sidebar => {
            rect_at(2.0, 3.0, 14.0, 13.0, 1.5);
            line((6.0, 3.0), (6.0, 13.0));
            line((3.5, 5.5), (4.5, 5.5));
            line((3.5, 7.5), (4.5, 7.5));
        }
        Icon::Page | Icon::File => {
            closed(&[(4.0, 2.5), (9.5, 2.5), (12.5, 5.5), (12.5, 13.5), (4.0, 13.5)]);
            poly(&[(9.5, 2.5), (9.5, 5.5), (12.5, 5.5)]);
            if icon == Icon::Page {
                line((6.0, 8.5), (10.5, 8.5));
                line((6.0, 11.0), (9.0, 11.0));
            }
        }
        Icon::Header => {
            closed(&[(3.5, 2.5), (12.5, 2.5), (12.5, 13.5), (3.5, 13.5)]);
            line((5.5, 5.0), (10.5, 5.0));
            for y in [8.0, 10.0] {
                line((5.5, y), (10.5, y));
            }
        }
        Icon::Export => {
            poly(&[(6.0, 4.0), (3.5, 4.0), (3.5, 13.0), (12.5, 13.0), (12.5, 10.5)]);
            line((8.0, 8.5), (13.0, 3.5));
            poly(&[(9.5, 3.0), (13.0, 3.0), (13.0, 6.5)]);
        }
        Icon::Print => {
            rect_at(2.5, 6.0, 13.5, 11.5, 1.5);
            poly(&[(4.5, 6.0), (4.5, 2.5), (11.5, 2.5), (11.5, 6.0)]);
            rect_at(4.5, 9.5, 11.5, 13.5, 0.5);
        }
        Icon::Save => {
            closed(&[(3.0, 3.0), (11.0, 3.0), (13.0, 5.0), (13.0, 13.0), (3.0, 13.0)]);
            poly(&[(5.5, 3.0), (5.5, 6.0), (10.0, 6.0), (10.0, 3.0)]);
            rect_at(5.5, 9.0, 10.5, 13.0, 0.5);
        }
        Icon::More => {
            for x in [4.0, 8.0, 12.0] {
                dot(x, 8.0, 1.2);
            }
        }
        Icon::Close => {
            line((4.0, 4.0), (12.0, 12.0));
            line((12.0, 4.0), (4.0, 12.0));
        }
        Icon::Check => {
            poly(&[(3.5, 8.5), (6.5, 11.5), (12.5, 4.5)]);
        }
        Icon::Warning => {
            closed(&[(8.0, 2.5), (14.0, 13.0), (2.0, 13.0)]);
            line((8.0, 6.5), (8.0, 9.5));
            dot(8.0, 11.4, 0.9);
        }
        Icon::Info => {
            p.circle_stroke(at(8.0, 8.0), 5.8 * s, st);
            line((8.0, 7.5), (8.0, 11.0));
            dot(8.0, 5.2, 0.9);
        }
        Icon::ChevronUp => {
            poly(&[(4.5, 9.5), (8.0, 6.0), (11.5, 9.5)]);
        }
        Icon::ChevronDown => {
            poly(&[(4.5, 6.5), (8.0, 10.0), (11.5, 6.5)]);
        }
        Icon::Plus => {
            line((8.0, 3.5), (8.0, 12.5));
            line((3.5, 8.0), (12.5, 8.0));
        }
        Icon::Minus => {
            line((3.5, 8.0), (12.5, 8.0));
        }
        Icon::Moon => {
            let pts: Vec<(f32, f32)> = (0..=16)
                .map(|i| {
                    let t = -0.9 + i as f32 / 16.0 * 4.6;
                    (8.0 + 5.5 * t.cos(), 8.0 + 5.5 * t.sin())
                })
                .collect();
            poly(&pts);
            poly(&[(pts[0].0, pts[0].1), (7.5, 6.0), (9.0, 10.5), (pts[16].0, pts[16].1)]);
        }
        Icon::Sun => {
            p.circle_stroke(at(8.0, 8.0), 3.0 * s, st);
            for i in 0..8 {
                let a = i as f32 * std::f32::consts::FRAC_PI_4;
                line((8.0 + 5.0 * a.cos(), 8.0 + 5.0 * a.sin()), (8.0 + 6.5 * a.cos(), 8.0 + 6.5 * a.sin()));
            }
        }
        Icon::TextColor => {
            poly(&[(4.0, 11.0), (8.0, 2.5), (12.0, 11.0)]);
            line((5.5, 8.0), (10.5, 8.0));
        }
        Icon::Highlight => {
            closed(&[(9.5, 2.5), (13.5, 6.5), (7.5, 12.5), (3.5, 8.5)]);
            line((3.5, 8.5), (2.5, 12.0));
            line((2.5, 12.0), (6.0, 12.0));
        }
        Icon::Folder => {
            closed(&[(2.0, 4.0), (6.5, 4.0), (8.0, 5.5), (14.0, 5.5), (14.0, 12.5), (2.0, 12.5)]);
        }
        Icon::LineSpacing => {
            for y in [4.0, 8.0, 12.0] {
                line((7.0, y), (14.0, y));
            }
            poly(&[(2.5, 5.0), (4.0, 3.0), (5.5, 5.0)]);
            poly(&[(2.5, 11.0), (4.0, 13.0), (5.5, 11.0)]);
            line((4.0, 3.5), (4.0, 12.5));
        }
        Icon::ClearFormat => {
            poly(&[(3.5, 3.5), (12.5, 3.5)]);
            line((8.0, 3.5), (6.0, 12.5));
            line((10.0, 9.5), (14.0, 13.5));
            line((14.0, 9.5), (10.0, 13.5));
        }
    }
}
