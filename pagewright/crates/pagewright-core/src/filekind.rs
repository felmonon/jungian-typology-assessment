//! What kind of file a path or a byte string is, and what Pagewright can do with it.

use std::path::Path;

use serde::Serialize;

/// A file format Pagewright knows about.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
pub enum FileKind {
    /// Word document, macro-enabled document, template or macro-enabled template (OOXML).
    Word,
    /// Word 97–2003 binary `.doc`/`.dot`: opened by conversion, never written.
    LegacyWord,
    OpenDocument,
    Rtf,
    Html,
    Markdown,
    PlainText,
    Latex,
    Pdf,
    /// Word XML Document (Flat OPC) or Word 2003 XML.
    WordXml,
}

/// What saving to a format means.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
pub enum SaveMode {
    /// The document is written in full; the file becomes the document's home.
    Native,
    /// The file becomes the document's home, but the format can't hold everything the document can
    /// (OpenDocument and RTF through the engine's shared intermediate model).
    LossyHome,
    /// A copy in another format; the document keeps its current home and unsaved state.
    Export,
    /// Pagewright can't write this format.
    No,
}

impl FileKind {
    pub fn from_path(path: &Path) -> Option<FileKind> {
        let ext = path.extension()?.to_str()?.to_ascii_lowercase();
        Some(match ext.as_str() {
            "docx" | "docm" | "dotx" | "dotm" => FileKind::Word,
            "doc" | "dot" => FileKind::LegacyWord,
            "odt" => FileKind::OpenDocument,
            "rtf" => FileKind::Rtf,
            "html" | "htm" | "xhtml" => FileKind::Html,
            "md" | "markdown" => FileKind::Markdown,
            "txt" | "text" => FileKind::PlainText,
            "tex" => FileKind::Latex,
            "pdf" => FileKind::Pdf,
            "xml" => FileKind::WordXml,
            _ => return None,
        })
    }

    /// The format the bytes actually are, where that can be told from their first bytes.
    pub fn sniff(bytes: &[u8]) -> Option<FileKind> {
        let head = &bytes[..bytes.len().min(512)];
        let lower: Vec<u8> = head.iter().map(u8::to_ascii_lowercase).collect();
        let text = String::from_utf8_lossy(&lower);
        let trimmed = text.trim_start_matches('\u{feff}').trim_start();
        if bytes.starts_with(b"PK\x03\x04") {
            if crate::fidelity::is_word_package(bytes) {
                return Some(FileKind::Word);
            }
            if bytes.windows(39).take(200).any(|w| w == b"application/vnd.oasis.opendocument.text") {
                return Some(FileKind::OpenDocument);
            }
            return None;
        }
        if bytes.starts_with(&[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]) {
            return Some(FileKind::LegacyWord);
        }
        if bytes.starts_with(b"%PDF") {
            return Some(FileKind::Pdf);
        }
        if trimmed.starts_with("{\\rtf") {
            return Some(FileKind::Rtf);
        }
        if trimmed.starts_with("<!doctype html") || trimmed.starts_with("<html") || trimmed.starts_with("<body") {
            return Some(FileKind::Html);
        }
        if trimmed.starts_with("<?xml") && (text.contains("pkg:package") || text.contains("w:worddocument") || text.contains("wordml")) {
            return Some(FileKind::WordXml);
        }
        None
    }

    pub fn can_open(self) -> bool {
        !matches!(self, FileKind::Pdf)
    }

    pub fn save_mode(self) -> SaveMode {
        match self {
            FileKind::Word | FileKind::WordXml => SaveMode::Native,
            FileKind::OpenDocument | FileKind::Rtf => SaveMode::LossyHome,
            FileKind::Html | FileKind::Markdown | FileKind::PlainText | FileKind::Latex | FileKind::Pdf => SaveMode::Export,
            FileKind::LegacyWord => SaveMode::No,
        }
    }

    pub fn name(self) -> &'static str {
        match self {
            FileKind::Word => "Word document",
            FileKind::LegacyWord => "Word 97–2003 document",
            FileKind::OpenDocument => "OpenDocument text",
            FileKind::Rtf => "Rich Text Format",
            FileKind::Html => "web page (HTML)",
            FileKind::Markdown => "Markdown",
            FileKind::PlainText => "plain text",
            FileKind::Latex => "LaTeX",
            FileKind::Pdf => "PDF",
            FileKind::WordXml => "Word XML document",
        }
    }

    /// What a save in this format can't keep, for the confirmation that precedes a lossy save.
    pub fn lossy_note(self) -> &'static str {
        match self {
            FileKind::OpenDocument => "OpenDocument files keep text, styles, lists, tables, pictures and sections, but not every Word feature (for example content controls, some field types and drawing effects).",
            FileKind::Rtf => "RTF keeps text, formatting, lists, tables and pictures, but not every Word feature (for example content controls, themes and some drawing objects).",
            FileKind::Html => "A web page keeps text, headings, lists, tables, links and pictures, but not page layout: page size, margins, headers, footers and page breaks are lost.",
            FileKind::Markdown => "Markdown keeps headings, emphasis, lists, links and simple tables only.",
            FileKind::PlainText => "Plain text keeps only the words: all formatting, pictures and tables are lost.",
            FileKind::Latex => "LaTeX keeps structure and emphasis; page layout follows LaTeX, not this document.",
            _ => "",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extensions_and_modes() {
        assert_eq!(FileKind::from_path(Path::new("a/Report.DOCX")), Some(FileKind::Word));
        assert_eq!(FileKind::from_path(Path::new("old.doc")).map(FileKind::save_mode), Some(SaveMode::No));
        assert_eq!(FileKind::from_path(Path::new("x.txt")).map(FileKind::save_mode), Some(SaveMode::Export));
        assert_eq!(FileKind::from_path(Path::new("x.odt")).map(FileKind::save_mode), Some(SaveMode::LossyHome));
        assert_eq!(FileKind::from_path(Path::new("noext")), None);
    }

    #[test]
    fn sniffing() {
        assert_eq!(FileKind::sniff(b"<html><body>x</body></html>"), Some(FileKind::Html));
        assert_eq!(FileKind::sniff(b"  <!DOCTYPE html><p>"), Some(FileKind::Html));
        assert_eq!(FileKind::sniff(b"{\\rtf1\\ansi hello}"), Some(FileKind::Rtf));
        assert_eq!(FileKind::sniff(b"%PDF-1.7"), Some(FileKind::Pdf));
        assert_eq!(FileKind::sniff(&[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1, 0]), Some(FileKind::LegacyWord));
        assert_eq!(FileKind::sniff(b"plain words"), None);
    }
}
