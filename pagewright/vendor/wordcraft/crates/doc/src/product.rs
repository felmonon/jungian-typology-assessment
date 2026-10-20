//! Product identity. [Pagewright patch, see vendor/wordcraft/UPSTREAM.md]
//!
//! The application name the engine writes into file metadata (DOCX `Application`, PDF creator and
//! producer, ODT/HTML/RTF/LaTeX generator) and uses in user-facing messages. A front end sets it
//! once at start-up with [`set_name`]; until then it is upstream's "WordCraft", so upstream tests
//! and tools behave exactly as before.

use std::sync::OnceLock;

static NAME: OnceLock<String> = OnceLock::new();

/// Sets the product name once. Later calls are ignored (the first front end to start wins).
pub fn set_name(name: &str) {
    let _ = NAME.set(name.to_string());
}

/// The product name: the one given to [`set_name`], or "WordCraft".
pub fn name() -> &'static str {
    NAME.get().map(String::as_str).unwrap_or("WordCraft")
}
