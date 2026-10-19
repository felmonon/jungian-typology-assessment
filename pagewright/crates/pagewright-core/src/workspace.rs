//! One open document and its relationship to a file: open, save, save as, export, and the
//! checks that stand between an edit and a file on disk.
//!
//! Rules this module enforces (see docs/specs/behavior.md, "Saving and file safety"):
//! - A save never silently loses content. If an untouched re-save of the opened file would lose
//!   something (see [`crate::fidelity`]), replacing that file needs explicit confirmation; saving a
//!   copy elsewhere is always available and leaves the original untouched.
//! - A damaged file, or a file whose content isn't the format its name says, is never overwritten
//!   without confirmation.
//! - Saving in a format that can't hold the whole document (OpenDocument, RTF) asks first, once per
//!   file per session. Plain text, HTML, Markdown, LaTeX and PDF are exports: they write a copy and
//!   leave the document's home and unsaved state alone.
//! - Word 97–2003 files are opened by conversion and saved as `.docx` beside them.

use std::path::{Path, PathBuf};
use std::time::SystemTime;

use serde::Serialize;
use serde_json::json;
use wordcraft_engine::Session;

use crate::fidelity::{self, Loss};
use crate::filekind::{FileKind, SaveMode};

/// Something the person should know about the open document.
#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum Notice {
    /// Parts of the file weren't well-formed; what could be read was recovered.
    Damaged { parts: Vec<String> },
    /// The file's content is a different format from its name.
    FormatMismatch { named: FileKind, actual: FileKind },
    /// An untouched re-save would lose these.
    WillLose { losses: Vec<Loss> },
    /// Opened by conversion from a format Pagewright can't write.
    Converted { from: FileKind },
    /// The document was saved as a copy; the original file still has everything it had.
    OriginalKept { path: PathBuf },
}

impl Notice {
    /// One sentence for the notice bar.
    pub fn message(&self) -> String {
        match self {
            Notice::Damaged { parts } => format!(
                "This file is damaged ({}). Pagewright recovered what it could read. Your original stays untouched unless you choose to replace it.",
                parts.join(", ")
            ),
            Notice::FormatMismatch { named, actual } => {
                format!("This file is named as a {} but contains a {}. Saving writes a real {}.", named.name(), actual.name(), named.name())
            }
            Notice::WillLose { losses } => {
                let n = losses.len();
                format!(
                    "{n} kind{} of content in this file can't be kept: {}. Your original stays untouched unless you choose to replace it.",
                    if n == 1 { "" } else { "s" },
                    losses.iter().map(Loss::describe).collect::<Vec<_>>().join("; ")
                )
            }
            Notice::Converted { from } => format!("Converted from a {}. Saving creates a new Word document; the original is not changed.", from.name()),
            Notice::OriginalKept { path } => format!("Saved as a copy. The original, {}, is unchanged.", path.display()),
        }
    }

    /// Whether the notice is a warning (versus information).
    pub fn is_warning(&self) -> bool {
        matches!(self, Notice::Damaged { .. } | Notice::FormatMismatch { .. } | Notice::WillLose { .. })
    }
}

/// Where the document lives.
#[derive(Clone, Debug, Serialize)]
pub struct FileInfo {
    pub path: PathBuf,
    /// The format the file was read as (after sniffing).
    pub kind: FileKind,
    /// What an untouched re-save of this file loses (empty once Pagewright wrote the file).
    pub untouched_losses: Vec<Loss>,
    pub damaged: bool,
    pub mismatch: Option<(FileKind, FileKind)>,
}

/// A concern that needs the person's agreement before a save goes ahead.
#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum Concern {
    WillLose { losses: Vec<Loss> },
    DamagedOriginal,
    FormatMismatch { named: FileKind, actual: FileKind },
    LossyFormat { format: FileKind, note: String },
}

impl Concern {
    pub fn message(&self) -> String {
        match self {
            Concern::WillLose { losses } => format!(
                "Replacing the original will permanently remove: {}.",
                losses.iter().map(Loss::describe).collect::<Vec<_>>().join("; ")
            ),
            Concern::DamagedOriginal => "The original file is damaged. Replacing it keeps only what Pagewright could recover.".into(),
            Concern::FormatMismatch { named, actual } => {
                format!("The original contains a {}, not a {}. Replacing it changes its format.", actual.name(), named.name())
            }
            Concern::LossyFormat { format, note } => format!("Saving as {}: {note}", format.name()),
        }
    }
}

/// What a save attempt did.
#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum SaveOutcome {
    /// Written; the file is now the document's home.
    Saved { path: PathBuf },
    /// A copy was written in another format; the document's home and unsaved state are unchanged.
    Exported { path: PathBuf },
    /// There is no file yet (or the format can't be written): ask where to save.
    NeedsLocation { suggested: Option<PathBuf> },
    /// Ask first; call again with `confirmed = true` to go ahead.
    NeedsConfirmation { path: PathBuf, concerns: Vec<Concern> },
}

/// The save state shown in the title bar.
#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum SaveStatus {
    /// A new document that has never been saved.
    NeverSaved { edited: bool },
    /// The file on disk matches the document.
    Saved { path: PathBuf, at: Option<SystemTime> },
    /// The document has changes that aren't in its file.
    Unsaved { path: PathBuf, saved_at: Option<SystemTime> },
}

/// One open document.
pub struct Workspace {
    pub session: Session,
    file: Option<FileInfo>,
    pub notices: Vec<Notice>,
    last_saved: Option<SystemTime>,
    /// Lossy formats already confirmed for a path this session.
    lossy_ok: Vec<PathBuf>,
}

impl Workspace {
    /// A new, blank document on the default template.
    pub fn new_blank() -> Self {
        let mut session = Session::new(wordcraft_doc::Document::default());
        let _ = session.run("file.new", &json!({}));
        session.dirty = false;
        session.reset_history();
        Workspace { session, file: None, notices: Vec::new(), last_saved: None, lossy_ok: Vec::new() }
    }

    /// Opens `path`. Errors are plain-language messages; nothing on disk is changed.
    pub fn open(path: &Path) -> Result<Self, String> {
        let named = FileKind::from_path(path);
        let bytes = std::fs::read(path).map_err(|e| format!("{}: {e}", path.display()))?;
        let actual = FileKind::sniff(&bytes);
        let kind = actual.or(named).unwrap_or(FileKind::PlainText);
        if !kind.can_open() {
            return Err(format!("{} is a {}; Pagewright opens documents, not {} files.", file_name(path), kind.name(), kind.name()));
        }
        let mut notices = Vec::new();
        let mismatch = match (named, actual) {
            (Some(n), Some(a)) if n != a && !(n == FileKind::Word && a == FileKind::WordXml) => Some((n, a)),
            // Bytes with no recognisable signature in a file named as a Word package: plain text.
            (Some(FileKind::Word), None) if !bytes.is_empty() => Some((FileKind::Word, FileKind::PlainText)),
            _ => None,
        };
        if let Some((named, actual)) = mismatch {
            notices.push(Notice::FormatMismatch { named, actual });
        }

        let mut session = Session::new(wordcraft_doc::Document::default());
        session.run("file.open", &json!({"path": path.to_string_lossy()})).map_err(|e| plain_error(&e.to_string()))?;
        session.dirty = false;
        session.reset_history();

        let mut damaged = false;
        let mut untouched_losses = Vec::new();
        if kind == FileKind::Word && !bytes.is_empty() {
            match fidelity::scan_package(&bytes) {
                Ok(scan) => {
                    if scan.is_damaged() {
                        damaged = true;
                        notices.push(Notice::Damaged { parts: scan.damaged_parts.iter().map(|(p, _)| p.clone()).collect() });
                    }
                    // Untouched re-save, in memory: what the engine's model can't carry.
                    match wordcraft_engine::io::save_bytes("untouched.docx", &session.doc).map(|b| fidelity::scan_package(&b)) {
                        Ok(Ok(after)) => untouched_losses = fidelity::compare(&scan.inventory, &after.inventory),
                        Ok(Err(e)) | Err(e) => log::warn!("fidelity check skipped: {e}"),
                    }
                    if !untouched_losses.is_empty() {
                        notices.push(Notice::WillLose { losses: untouched_losses.clone() });
                    }
                }
                Err(e) => log::warn!("package scan failed: {e}"),
            }
        }
        if kind == FileKind::LegacyWord {
            notices.push(Notice::Converted { from: kind });
        }
        let file = FileInfo { path: path.to_path_buf(), kind, untouched_losses, damaged, mismatch };
        Ok(Workspace { session, file: Some(file), notices, last_saved: None, lossy_ok: Vec::new() })
    }

    pub fn file(&self) -> Option<&FileInfo> {
        self.file.as_ref()
    }

    pub fn path(&self) -> Option<&Path> {
        self.file.as_ref().map(|f| f.path.as_path())
    }

    /// The name shown in the title bar.
    pub fn title(&self) -> String {
        match &self.file {
            Some(f) => file_name(&f.path),
            None => {
                let t = self.session.doc.core.title.trim();
                if t.is_empty() { "Untitled".into() } else { t.to_string() }
            }
        }
    }

    pub fn is_dirty(&self) -> bool {
        self.session.dirty
    }

    pub fn save_status(&self) -> SaveStatus {
        match &self.file {
            None => SaveStatus::NeverSaved { edited: self.session.dirty },
            Some(f) if self.session.dirty => SaveStatus::Unsaved { path: f.path.clone(), saved_at: self.last_saved },
            Some(f) => SaveStatus::Saved { path: f.path.clone(), at: self.last_saved },
        }
    }

    /// Where Save As should start: beside the current file, as a Word document.
    pub fn suggested_save_path(&self) -> Option<PathBuf> {
        let f = self.file.as_ref()?;
        Some(f.path.with_extension("docx")).filter(|p| p != &f.path || f.kind == FileKind::Word)
    }

    /// Save to the document's own file. `NeedsLocation` when there isn't one it can write.
    pub fn save(&mut self, confirmed: bool) -> Result<SaveOutcome, String> {
        let Some(f) = &self.file else {
            return Ok(SaveOutcome::NeedsLocation { suggested: None });
        };
        let target_kind = FileKind::from_path(&f.path).unwrap_or(f.kind);
        if matches!(target_kind.save_mode(), SaveMode::No | SaveMode::Export) {
            // A converted .doc, or a text/HTML/Markdown file: Save means "save as a Word document".
            return Ok(SaveOutcome::NeedsLocation { suggested: self.suggested_save_path() });
        }
        let path = f.path.clone();
        self.save_as(&path, confirmed)
    }

    /// Save to `path`, which becomes the document's home (or, for export formats, export to it).
    pub fn save_as(&mut self, path: &Path, confirmed: bool) -> Result<SaveOutcome, String> {
        let Some(kind) = FileKind::from_path(path) else {
            return Err(format!("{}: choose a file name ending in .docx (or .odt, .rtf, .pdf, .html, .md, .txt).", file_name(path)));
        };
        match kind.save_mode() {
            SaveMode::No => return Err(format!("Pagewright can't write {} files. Save as a Word document (.docx) instead.", kind.name())),
            SaveMode::Export => return self.export(path),
            SaveMode::Native | SaveMode::LossyHome => {}
        }
        let concerns = self.concerns_for(path, kind);
        if !concerns.is_empty() && !confirmed {
            return Ok(SaveOutcome::NeedsConfirmation { path: path.to_path_buf(), concerns });
        }
        if kind.save_mode() == SaveMode::LossyHome && !self.lossy_ok.iter().any(|p| p == path) {
            self.lossy_ok.push(path.to_path_buf());
        }
        let previous = self.file.as_ref().map(|f| f.path.clone());
        self.session.run("file.save", &json!({"path": path.to_string_lossy()})).map_err(|e| plain_error(&e.to_string()))?;
        self.session.dirty = false;
        self.last_saved = Some(SystemTime::now());
        let replaced_original = previous.as_deref() == Some(path);
        // The file now holds what Pagewright wrote: nothing left in it that a re-save would lose.
        let had_losses = self.file.as_ref().is_some_and(|f| !f.untouched_losses.is_empty() || f.damaged || f.mismatch.is_some());
        self.notices.retain(|n| !matches!(n, Notice::WillLose { .. } | Notice::Damaged { .. } | Notice::FormatMismatch { .. } | Notice::Converted { .. } | Notice::OriginalKept { .. }));
        if !replaced_original && had_losses && let Some(orig) = previous {
            self.notices.push(Notice::OriginalKept { path: orig });
        }
        self.file = Some(FileInfo { path: path.to_path_buf(), kind, untouched_losses: Vec::new(), damaged: false, mismatch: None });
        Ok(SaveOutcome::Saved { path: path.to_path_buf() })
    }

    /// Writes a copy in an export format (PDF, HTML, Markdown, plain text, LaTeX). The document's
    /// home and unsaved state don't change.
    pub fn export(&mut self, path: &Path) -> Result<SaveOutcome, String> {
        let kind = FileKind::from_path(path).ok_or_else(|| format!("{}: unknown export format", file_name(path)))?;
        let r = if kind == FileKind::Pdf {
            self.session.run("file.exportPdf", &json!({"path": path.to_string_lossy()}))
        } else {
            let dirty = self.session.dirty;
            let r = self.session.run("file.saveAs", &json!({"path": path.to_string_lossy()}));
            self.session.dirty = dirty;
            r
        };
        r.map_err(|e| plain_error(&e.to_string()))?;
        Ok(SaveOutcome::Exported { path: path.to_path_buf() })
    }

    fn concerns_for(&self, path: &Path, kind: FileKind) -> Vec<Concern> {
        let mut out = Vec::new();
        if let Some(f) = &self.file
            && f.path == path
        {
            if !f.untouched_losses.is_empty() {
                out.push(Concern::WillLose { losses: f.untouched_losses.clone() });
            }
            if f.damaged {
                out.push(Concern::DamagedOriginal);
            }
            if let Some((named, actual)) = f.mismatch {
                out.push(Concern::FormatMismatch { named, actual });
            }
        }
        if kind.save_mode() == SaveMode::LossyHome && !self.lossy_ok.iter().any(|p| p == path) {
            out.push(Concern::LossyFormat { format: kind, note: kind.lossy_note().into() });
        }
        out
    }
}

fn file_name(path: &Path) -> String {
    path.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_else(|| path.display().to_string())
}

/// Engine error text without the command prefix ("file.open: …", "not available: …").
fn plain_error(e: &str) -> String {
    let e = e.strip_prefix("not available: ").unwrap_or(e);
    let e = e.split_once(": ").filter(|(head, _)| head.starts_with("file.")).map_or(e, |(_, tail)| tail);
    e.to_string()
}
