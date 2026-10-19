//! Keyboard shortcuts: egui key events to engine command ids.
//!
//! The engine declares each command's default shortcut (`Mod+B`, `Mod+Alt+1`, `Shift+F3`…; `Mod`
//! is Ctrl, or ⌘ on macOS). This module turns a key event into the same canonical chord and looks
//! it up, with two Pagewright additions on top: its own shell shortcuts (command search, outline,
//! find panel) and Shift extending any caret movement, as in every text editor.

use std::collections::HashMap;

use egui::{Key, Modifiers};
use serde_json::{Value, json};
use wordcraft_engine::Registry;
use wordcraft_engine::keymap::normalize;

/// Pagewright's own shortcuts. They take precedence over engine bindings for the same chord.
pub const SHELL: &[(&str, &str, &str)] = &[
    ("Mod+/", "pw.commandSearch", "Search commands"),
    ("Mod+Shift+O", "pw.toggleOutline", "Show or hide the outline"),
    ("Mod+F", "pw.find", "Find"),
    ("Mod+H", "pw.replace", "Replace"),
    ("Mod+N", "pw.new", "New document"),
    ("Mod+O", "pw.open", "Open"),
    ("Mod+S", "pw.save", "Save"),
    ("Mod+Shift+S", "pw.saveAs", "Save as"),
    ("F12", "pw.saveAs", "Save as"),
    ("Mod+P", "pw.print", "Print"),
    ("Mod+W", "pw.close", "Close document"),
    ("Mod+K", "pw.link", "Insert or edit link"),
    ("Mod+=", "pw.zoomIn", "Zoom in"),
    ("Mod+-", "pw.zoomOut", "Zoom out"),
    ("Mod+0", "pw.zoomReset", "Zoom to 100%"),
];

/// The canonical chord for a key event, or `None` for keys that aren't shortcuts.
pub fn chord(key: Key, m: Modifiers) -> Option<String> {
    let name = key_name(key)?;
    let mut s = String::new();
    if m.command {
        s.push_str("Mod+");
    }
    // On macOS Ctrl is separate from ⌘; elsewhere `command` already is Ctrl.
    if m.ctrl && cfg!(target_os = "macos") {
        s.push_str("Ctrl+");
    }
    if m.alt {
        s.push_str("Alt+");
    }
    if m.shift {
        s.push_str("Shift+");
    }
    s.push_str(name);
    normalize(&s)
}

fn key_name(k: Key) -> Option<&'static str> {
    Some(match k {
        Key::ArrowLeft => "Left",
        Key::ArrowRight => "Right",
        Key::ArrowUp => "Up",
        Key::ArrowDown => "Down",
        Key::Home => "Home",
        Key::End => "End",
        Key::PageUp => "PageUp",
        Key::PageDown => "PageDown",
        Key::Enter => "Enter",
        Key::Tab => "Tab",
        Key::Backspace => "Backspace",
        Key::Delete => "Delete",
        Key::Escape => "Escape",
        Key::Space => "Space",
        Key::Insert => "Insert",
        Key::Equals | Key::Plus => "=",
        Key::Minus => "-",
        Key::Period => ".",
        Key::Comma => ",",
        Key::Slash => "/",
        Key::OpenBracket => "[",
        Key::CloseBracket => "]",
        Key::Semicolon => ";",
        Key::Backslash => "\\",
        Key::Num0 => "0",
        Key::Num1 => "1",
        Key::Num2 => "2",
        Key::Num3 => "3",
        Key::Num4 => "4",
        Key::Num5 => "5",
        Key::Num6 => "6",
        Key::Num7 => "7",
        Key::Num8 => "8",
        Key::Num9 => "9",
        Key::A => "A",
        Key::B => "B",
        Key::C => "C",
        Key::D => "D",
        Key::E => "E",
        Key::F => "F",
        Key::G => "G",
        Key::H => "H",
        Key::I => "I",
        Key::J => "J",
        Key::K => "K",
        Key::L => "L",
        Key::M => "M",
        Key::N => "N",
        Key::O => "O",
        Key::P => "P",
        Key::Q => "Q",
        Key::R => "R",
        Key::S => "S",
        Key::T => "T",
        Key::U => "U",
        Key::V => "V",
        Key::W => "W",
        Key::X => "X",
        Key::Y => "Y",
        Key::Z => "Z",
        Key::F1 => "F1",
        Key::F2 => "F2",
        Key::F3 => "F3",
        Key::F4 => "F4",
        Key::F5 => "F5",
        Key::F6 => "F6",
        Key::F7 => "F7",
        Key::F8 => "F8",
        Key::F9 => "F9",
        Key::F10 => "F10",
        Key::F11 => "F11",
        Key::F12 => "F12",
        _ => return None,
    })
}

/// Chords to commands, built once from the engine registry plus [`SHELL`].
pub struct KeyMap {
    map: HashMap<String, String>,
    /// Display form of each command's first shortcut, for menus and the command search.
    display: HashMap<String, String>,
}

impl KeyMap {
    pub fn new(registry: &Registry) -> Self {
        let mut map = HashMap::new();
        let mut display = HashMap::new();
        for spec in registry.all() {
            if spec.shortcut.is_empty() {
                continue;
            }
            for (i, k) in spec.shortcut.split(" / ").enumerate() {
                if let Some(n) = normalize(k) {
                    map.entry(n).or_insert_with(|| spec.id.to_string());
                    if i == 0 {
                        display.entry(spec.id.to_string()).or_insert_with(|| pretty(k));
                    }
                }
            }
        }
        for (k, id, _) in SHELL {
            if let Some(n) = normalize(k) {
                map.insert(n, (*id).to_string());
                display.entry((*id).to_string()).or_insert_with(|| pretty(k));
            }
        }
        // File shortcuts belong to Pagewright's own flows (fidelity checks, dialogs).
        for (engine, shell) in [("file.save", "pw.save"), ("file.open", "pw.open"), ("file.new", "pw.new"), ("file.print", "pw.print"), ("file.saveAs", "pw.saveAs"), ("file.close", "pw.close")] {
            if let Some(d) = display.get(shell).cloned() {
                display.insert(engine.to_string(), d);
            }
        }
        KeyMap { map, display }
    }

    /// The command and its parameters for a key event.
    pub fn lookup(&self, key: Key, m: Modifiers) -> Option<(String, Value)> {
        let c = chord(key, m)?;
        if let Some(id) = self.map.get(&c) {
            return Some((id.clone(), json!({})));
        }
        // Shift extends a caret movement: Shift+Left is caret.left with extend.
        if m.shift {
            let unshifted = chord(key, Modifiers { shift: false, ..m })?;
            if let Some(id) = self.map.get(&unshifted).filter(|id| id.starts_with("caret.")) {
                return Some((id.clone(), json!({"extend": true})));
            }
        }
        None
    }

    pub fn shortcut_for(&self, id: &str) -> Option<&str> {
        self.display.get(id).map(String::as_str)
    }
}

/// `Mod+Shift+K` as the platform writes it: `Ctrl+Shift+K`, or `⌘⇧K` on macOS.
pub fn pretty(k: &str) -> String {
    if cfg!(target_os = "macos") {
        k.replace("Mod+", "⌘").replace("Ctrl+", "⌃").replace("Alt+", "⌥").replace("Shift+", "⇧")
    } else {
        k.replace("Mod+", "Ctrl+")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn km() -> KeyMap {
        let s = wordcraft_engine::Session::new(Default::default());
        KeyMap::new(&s.registry)
    }

    const CTRL: Modifiers = Modifiers { alt: false, ctrl: true, shift: false, mac_cmd: false, command: true };

    #[test]
    fn familiar_shortcuts_map_to_engine_commands() {
        let k = km();
        let id = |key, m| k.lookup(key, m).map(|(id, _)| id);
        assert_eq!(id(Key::B, CTRL).as_deref(), Some("format.bold"));
        assert_eq!(id(Key::I, CTRL).as_deref(), Some("format.italic"));
        assert_eq!(id(Key::U, CTRL).as_deref(), Some("format.underline"));
        assert_eq!(id(Key::Z, CTRL).as_deref(), Some("edit.undo"));
        assert_eq!(id(Key::Y, CTRL).as_deref(), Some("edit.redo"));
        assert_eq!(id(Key::A, CTRL).as_deref(), Some("select.all"));
        assert_eq!(id(Key::E, CTRL).as_deref(), Some("para.alignCenter"));
        assert_eq!(id(Key::Enter, CTRL).as_deref(), Some("text.pageBreak"));
        assert_eq!(id(Key::Enter, Modifiers::NONE).as_deref(), Some("text.newParagraph"));
        assert_eq!(id(Key::S, CTRL).as_deref(), Some("pw.save"), "Pagewright's save flow, not the engine's");
        assert_eq!(id(Key::Slash, CTRL).as_deref(), Some("pw.commandSearch"));
        assert_eq!(id(Key::K, CTRL).as_deref(), Some("pw.link"));
    }

    #[test]
    fn shift_extends_caret_moves() {
        let k = km();
        let (id, params) = k.lookup(Key::ArrowLeft, Modifiers::SHIFT).unwrap();
        assert_eq!(id, "caret.left");
        assert_eq!(params, json!({"extend": true}));
        let (id, params) = k.lookup(Key::End, Modifiers::SHIFT).unwrap();
        assert_eq!((id.as_str(), params), ("caret.end", json!({"extend": true})));
    }
}
