//! Product identity and where Pagewright keeps its per-user files.

use std::path::PathBuf;

/// The product name shown in the interface and written into file metadata.
pub const PRODUCT: &str = "Pagewright";
/// Reverse-DNS application id (window class, desktop file, macOS bundle id).
pub const APP_ID: &str = "dev.pagewright.Pagewright";
/// Pagewright's own version.
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
/// The engine Pagewright is built on, for About and diagnostics.
pub const ENGINE: &str = "WordCraft engine 0.8.0 (storytold/wordcraft e6c5a70)";

/// Call once at start-up, before any document is saved or exported: file metadata then names
/// Pagewright instead of the engine's default.
pub fn init() {
    wordcraft_doc::product::set_name(PRODUCT);
}

/// The per-user profile folder: preferences, recovery copies, logs.
///
/// `PAGEWRIGHT_PROFILE_DIR` overrides it (tests and isolated runs). Otherwise the platform's
/// configuration folder: `$XDG_CONFIG_HOME/pagewright` or `~/.config/pagewright` on Linux and the
/// BSDs, `~/Library/Application Support/Pagewright` on macOS, `%APPDATA%\Pagewright` on Windows.
pub fn profile_dir() -> Option<PathBuf> {
    if let Some(p) = std::env::var_os("PAGEWRIGHT_PROFILE_DIR").filter(|p| !p.is_empty()) {
        return Some(PathBuf::from(p));
    }
    if cfg!(target_os = "windows") {
        return std::env::var_os("APPDATA").map(|a| PathBuf::from(a).join(PRODUCT));
    }
    let home = std::env::var_os("HOME").map(PathBuf::from);
    if cfg!(target_os = "macos") {
        return home.map(|h| h.join("Library/Application Support").join(PRODUCT));
    }
    std::env::var_os("XDG_CONFIG_HOME")
        .filter(|p| !p.is_empty())
        .map(PathBuf::from)
        .or_else(|| home.map(|h| h.join(".config")))
        .map(|c| c.join("pagewright"))
}

/// The folder recovery copies are kept in.
pub fn recovery_dir() -> Option<PathBuf> {
    profile_dir().map(|p| p.join("recovery"))
}
