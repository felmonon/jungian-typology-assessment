//! Pagewright's interface.
//!
//! Layout, top to bottom: a title bar (document name, save status, command search, export), a
//! contextual format bar, then the outline beside the page canvas, and a status bar. The page is
//! the focus; everything else is one keystroke away through the command search (Ctrl+/).
//!
//! All document changes go through engine commands (`Session::run`). File operations go through
//! `pagewright_core::Workspace`, which applies the fidelity guard; the engine's own `file.*`
//! commands are intercepted so a shortcut can never bypass it.

pub mod app;
pub mod canvas;
pub mod chrome;
pub mod dialogs;
pub mod find;
pub mod icons;
pub mod keys;
pub mod palette;
pub mod platform;
pub mod theme;
pub mod tokens;
pub mod widgets;

pub use app::{AppOptions, PagewrightApp};
pub use platform::{NoPlatform, Platform, PrintRequest, PrinterInfo};
