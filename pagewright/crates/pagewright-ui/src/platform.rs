//! Services the desktop shell provides to the interface: the system clipboard's rich formats,
//! native file dialogs and printing. The UI only talks to this trait, so it runs headlessly in
//! tests with [`NoPlatform`] and the app crate supplies the real thing.

use std::path::PathBuf;

/// A printer the system offers.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PrinterInfo {
    pub name: String,
    pub default: bool,
}

/// A print job for [`Platform::print_pdf`].
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PrintRequest {
    pub printer: Option<String>,
    pub copies: u32,
    pub collate: bool,
    pub title: String,
}

pub trait Platform {
    /// Put rich and plain text on the system clipboard.
    fn set_clipboard(&mut self, html: Option<&str>, text: &str);
    /// The clipboard's HTML, when it has some.
    fn clipboard_html(&mut self) -> Option<String>;
    /// The clipboard's plain text.
    fn clipboard_text(&mut self) -> Option<String>;
    /// A native "open" dialog. `None` when cancelled or when there is no native dialog
    /// (see [`Platform::has_native_dialogs`]).
    fn pick_open(&mut self, start: Option<PathBuf>) -> Option<PathBuf>;
    /// A native "save" dialog suggesting `suggested`.
    fn pick_save(&mut self, suggested: Option<PathBuf>, filter: (&str, &[&str])) -> Option<PathBuf>;
    /// Whether native file dialogs are available; otherwise the built-in chooser is used.
    fn has_native_dialogs(&self) -> bool;
    fn printers(&mut self) -> Vec<PrinterInfo>;
    /// Submit a print-ready PDF to the system spooler; returns the job id or a message.
    fn print_pdf(&mut self, pdf: &[u8], job: &PrintRequest) -> Result<String, String>;
    /// Open a URL in the default browser.
    fn open_url(&mut self, url: &str);
}

/// No system services: an in-memory clipboard, no native dialogs, no printers. Used by tests.
#[derive(Default)]
pub struct NoPlatform {
    pub html: Option<String>,
    pub text: String,
    pub opened_urls: Vec<String>,
}

impl Platform for NoPlatform {
    fn set_clipboard(&mut self, html: Option<&str>, text: &str) {
        self.html = html.map(str::to_string);
        self.text = text.to_string();
    }
    fn clipboard_html(&mut self) -> Option<String> {
        self.html.clone()
    }
    fn clipboard_text(&mut self) -> Option<String> {
        Some(self.text.clone())
    }
    fn pick_open(&mut self, _: Option<PathBuf>) -> Option<PathBuf> {
        None
    }
    fn pick_save(&mut self, _: Option<PathBuf>, _: (&str, &[&str])) -> Option<PathBuf> {
        None
    }
    fn has_native_dialogs(&self) -> bool {
        false
    }
    fn printers(&mut self) -> Vec<PrinterInfo> {
        Vec::new()
    }
    fn print_pdf(&mut self, _: &[u8], _: &PrintRequest) -> Result<String, String> {
        Err("No printing service is available.".into())
    }
    fn open_url(&mut self, url: &str) {
        self.opened_urls.push(url.to_string());
    }
}
