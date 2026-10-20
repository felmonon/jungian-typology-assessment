//! The real system services: clipboard (with HTML), native file dialogs, printing, URLs.

use std::path::PathBuf;

use pagewright_ui::{Platform, PrintRequest, PrinterInfo};

pub struct System {
    clipboard: Option<arboard::Clipboard>,
    native_dialogs: bool,
}

impl System {
    pub fn new() -> Self {
        let clipboard = arboard::Clipboard::new().map_err(|e| log::warn!("clipboard unavailable: {e}")).ok();
        // Native dialogs need a desktop portal on Linux and the BSDs; without a session bus
        // (a bare X server, a container) the built-in chooser is used instead.
        let native_dialogs = match std::env::var("PAGEWRIGHT_FILE_DIALOG").as_deref() {
            Ok("builtin") => false,
            Ok("system") => true,
            _ => cfg!(any(target_os = "macos", target_os = "windows")) || std::env::var_os("DBUS_SESSION_BUS_ADDRESS").is_some(),
        };
        System { clipboard, native_dialogs }
    }
}

impl Platform for System {
    fn set_clipboard(&mut self, html: Option<&str>, text: &str) {
        let Some(cb) = self.clipboard.as_mut() else { return };
        let r = match html {
            Some(h) => cb.set_html(h, Some(text)),
            None => cb.set_text(text),
        };
        if let Err(e) = r {
            log::warn!("clipboard write failed: {e}");
        }
    }

    fn clipboard_html(&mut self) -> Option<String> {
        self.clipboard.as_mut()?.get().html().ok()
    }

    fn clipboard_text(&mut self) -> Option<String> {
        self.clipboard.as_mut()?.get_text().ok()
    }

    fn pick_open(&mut self, start: Option<PathBuf>) -> Option<PathBuf> {
        let mut d = rfd::FileDialog::new().add_filter("Documents", &["docx", "docm", "dotx", "dotm", "doc", "odt", "rtf", "html", "htm", "md", "txt", "png", "jpg", "jpeg", "gif"]);
        if let Some(s) = start {
            d = d.set_directory(s);
        }
        d.pick_file()
    }

    fn pick_save(&mut self, suggested: Option<PathBuf>, filter: (&str, &[&str])) -> Option<PathBuf> {
        let mut d = rfd::FileDialog::new().add_filter(filter.0, filter.1);
        if let Some(s) = suggested {
            if let Some(dir) = s.parent() {
                d = d.set_directory(dir);
            }
            if let Some(name) = s.file_name() {
                d = d.set_file_name(name.to_string_lossy());
            }
        }
        d.save_file()
    }

    fn has_native_dialogs(&self) -> bool {
        self.native_dialogs
    }

    fn printers(&mut self) -> Vec<PrinterInfo> {
        craft_print::printers().into_iter().map(|p| PrinterInfo { name: p.name, default: p.default }).collect()
    }

    fn print_pdf(&mut self, pdf: &[u8], job: &PrintRequest) -> Result<String, String> {
        let j = craft_print::Job {
            printer: job.printer.clone(),
            copies: job.copies.max(1),
            collate: job.collate,
            duplex: None,
            scaling: craft_print::Scaling::Exact,
            grayscale: false,
            title: job.title.clone(),
            options: Vec::new(),
        };
        craft_print::submit(pdf, &j).map_err(|e| e.to_string())
    }

    fn open_url(&mut self, url: &str) {
        let program = if cfg!(target_os = "macos") {
            "open"
        } else if cfg!(target_os = "windows") {
            "explorer"
        } else {
            "xdg-open"
        };
        if let Err(e) = std::process::Command::new(program).arg(url).spawn() {
            log::warn!("couldn't open {url}: {e}");
        }
    }
}
