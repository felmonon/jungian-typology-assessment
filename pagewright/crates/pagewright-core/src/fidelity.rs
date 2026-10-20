//! The fidelity guard: what in a Word package an untouched re-save would lose, and whether the
//! package was damaged.
//!
//! The engine reads a `.docx` into its model and writes the model back out. Anything the model
//! can't represent is lost on save, sometimes legitimately (ECMA-376 Part 3 lets a consumer drop
//! elements in an ignorable namespace it doesn't understand). Pagewright never lets that happen
//! silently: when a file is opened, its package is scanned, the freshly opened document is saved
//! to memory without any edit, and the two scans are compared. Whatever shrank is reported, and
//! replacing the original file then needs an explicit choice.
//!
//! The scan is deliberately coarse and content-oriented: characters of text per kind of story,
//! counts of content-bearing elements (tables, pictures, fields, tracked changes, comments…),
//! every element in a namespace outside the core WordprocessingML/DrawingML set, and the
//! package's parts by kind. Markup-only normalisation (attribute order, run splitting, rsids)
//! doesn't register; losing a table, a comment, a picture or an extension element does.

use std::collections::BTreeMap;
use std::io::{Cursor, Read};

use quick_xml::events::{BytesStart, Event};
use quick_xml::name::ResolveResult;
use quick_xml::NsReader;
use serde::Serialize;

const W_T: &str = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const W_S: &str = "http://purl.oclc.org/ooxml/wordprocessingml/main";
const M: &str = "http://schemas.openxmlformats.org/officeDocument/2006/math";

/// Namespaces whose elements are ordinary document structure. Elements in any other namespace are
/// counted individually as extension content.
const CORE_NAMESPACES: &[&str] = &[
    W_T,
    W_S,
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "http://purl.oclc.org/ooxml/officeDocument/relationships",
    "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
    "http://purl.oclc.org/ooxml/drawingml/wordprocessingDrawing",
    "http://schemas.openxmlformats.org/drawingml/2006/main",
    "http://purl.oclc.org/ooxml/drawingml/main",
    "http://schemas.openxmlformats.org/drawingml/2006/picture",
    "http://purl.oclc.org/ooxml/drawingml/picture",
    "http://schemas.openxmlformats.org/markup-compatibility/2006",
    "urn:schemas-microsoft-com:vml",
    "urn:schemas-microsoft-com:office:office",
    "urn:schemas-microsoft-com:office:word",
    M,
    "http://purl.oclc.org/ooxml/officeDocument/math",
];

/// WordprocessingML elements whose count is tracked, with the words used to report them.
const WATCHED: &[(&str, &str)] = &[
    ("tbl", "tables"),
    ("tr", "table rows"),
    ("drawing", "pictures or drawings"),
    ("pict", "legacy (VML) pictures or shapes"),
    ("object", "embedded objects"),
    ("hyperlink", "hyperlinks"),
    ("fldSimple", "fields"),
    ("ins", "tracked insertions"),
    ("del", "tracked deletions"),
    ("moveFrom", "tracked moves"),
    ("moveTo", "tracked moves"),
    ("commentReference", "comments"),
    ("footnoteReference", "footnotes"),
    ("endnoteReference", "endnotes"),
    ("sdt", "content controls"),
    ("txbxContent", "text boxes"),
    ("altChunk", "imported content (altChunk)"),
    ("subDoc", "subdocuments"),
    ("customXml", "custom XML markup"),
    ("smartTag", "smart tags"),
    ("sectPr", "sections"),
    ("bookmarkStart", "bookmarks"),
];

/// What one scan of a package found.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize)]
pub struct Inventory {
    /// Characters of text (`w:t`, `w:delText`) per story kind: body, headers, footers, footnotes,
    /// endnotes, comments.
    pub text_chars: BTreeMap<String, usize>,
    /// Content element counts. Keys are report labels ("tables", "fields"…) or, for extension
    /// content, `{namespace}local`.
    pub elements: BTreeMap<String, usize>,
    /// Package parts by kind ("header", "media", "customXml"…) or exact name for the rest.
    pub parts: BTreeMap<String, usize>,
}

/// A package scan: the inventory plus any parts that aren't well-formed XML.
#[derive(Clone, Debug, Default, Serialize)]
pub struct PackageScan {
    pub inventory: Inventory,
    /// `(part name, problem)` for each XML part that failed to parse completely.
    pub damaged_parts: Vec<(String, String)>,
}

impl PackageScan {
    pub fn is_damaged(&self) -> bool {
        !self.damaged_parts.is_empty()
    }
}

/// One kind of content that would be lost, with its counts before and after.
#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
pub struct Loss {
    /// Plain-language description: "comments", "text in footers", "elements from urn:x (note)".
    pub what: String,
    pub before: usize,
    pub after: usize,
}

impl Loss {
    pub fn describe(&self) -> String {
        if self.after == 0 {
            format!("{} ({})", self.what, self.before)
        } else {
            format!("{} ({} of {} kept)", self.what, self.after, self.before)
        }
    }
}

/// Is `bytes` a ZIP package with a main WordprocessingML part?
pub fn is_word_package(bytes: &[u8]) -> bool {
    bytes.starts_with(b"PK")
        && zip::ZipArchive::new(Cursor::new(bytes)).is_ok_and(|mut z| z.by_name("word/document.xml").is_ok() || main_part_name(&mut z).is_some())
}

/// Scans a package. Errors only when the bytes aren't a readable ZIP archive at all.
pub fn scan_package(bytes: &[u8]) -> Result<PackageScan, String> {
    let mut zip = zip::ZipArchive::new(Cursor::new(bytes)).map_err(|e| format!("not a ZIP package: {e}"))?;
    let mut scan = PackageScan::default();
    let names: Vec<String> = (0..zip.len()).filter_map(|i| zip.by_index(i).ok().map(|f| f.name().to_string())).collect();
    for name in &names {
        *scan.inventory.parts.entry(part_kind(name)).or_default() += 1;
    }
    for name in &names {
        let lower = name.to_ascii_lowercase();
        if !(lower.ends_with(".xml") || lower.ends_with(".rels")) {
            continue;
        }
        let mut data = Vec::new();
        if let Err(e) = zip.by_name(name).and_then(|mut f| f.read_to_end(&mut data).map_err(Into::into)) {
            scan.damaged_parts.push((name.clone(), format!("unreadable: {e}")));
            continue;
        }
        let story = story_kind(name);
        if let Err(e) = scan_xml(&data, story, &mut scan.inventory) {
            scan.damaged_parts.push((name.clone(), e));
        }
    }
    Ok(scan)
}

/// What `after` lost relative to `before`.
pub fn compare(before: &Inventory, after: &Inventory) -> Vec<Loss> {
    let mut out = Vec::new();
    for (story, &n) in &before.text_chars {
        let m = after.text_chars.get(story).copied().unwrap_or(0);
        if m < n {
            out.push(Loss { what: format!("text in {story}"), before: n, after: m });
        }
    }
    for (key, &n) in &before.elements {
        let m = after.elements.get(key).copied().unwrap_or(0);
        if m < n {
            out.push(Loss { what: element_label(key), before: n, after: m });
        }
    }
    for (kind, &n) in &before.parts {
        if VOLATILE_PARTS.contains(&kind.as_str()) {
            continue;
        }
        let m = after.parts.get(kind).copied().unwrap_or(0);
        if m < n {
            out.push(Loss { what: part_label(kind), before: n, after: m });
        }
    }
    out
}

/// Parts a writer regenerates or that carry no document content (losing one is not a loss).
const VOLATILE_PARTS: &[&str] = &[
    "relationships",
    "[Content_Types].xml",
    "docProps/app.xml",
    "docProps/core.xml",
    "word/fontTable.xml",
    "word/webSettings.xml",
    "word/settings.xml",
    "word/styles.xml",
    "word/stylesWithEffects.xml",
    "word/theme",
];

fn part_kind(name: &str) -> String {
    let n = name.trim_start_matches('/');
    let file = n.rsplit('/').next().unwrap_or(n);
    if file.ends_with(".rels") {
        return "relationships".into();
    }
    let stem_digits = |prefix: &str| file.strip_prefix(prefix).is_some_and(|r| r.trim_end_matches(".xml").chars().all(|c| c.is_ascii_digit()));
    match n {
        _ if n.starts_with("word/media/") => "media".into(),
        _ if n.starts_with("word/embeddings/") => "embeddings".into(),
        _ if n.starts_with("word/charts/") => "charts".into(),
        _ if n.starts_with("word/diagrams/") => "diagrams".into(),
        _ if n.starts_with("word/theme/") => "word/theme".into(),
        _ if n.starts_with("customXml/") && file.starts_with("itemProps") => "customXml properties".into(),
        _ if n.starts_with("customXml/") => "customXml".into(),
        _ if n.starts_with("word/") && stem_digits("header") => "header".into(),
        _ if n.starts_with("word/") && stem_digits("footer") => "footer".into(),
        _ if n.starts_with("docProps/thumbnail") => "thumbnail".into(),
        _ => n.to_string(),
    }
}

fn part_label(kind: &str) -> String {
    match kind {
        "media" => "pictures and media files".into(),
        "embeddings" => "embedded files".into(),
        "charts" => "charts".into(),
        "diagrams" => "SmartArt diagrams".into(),
        "customXml" => "custom XML data".into(),
        "customXml properties" => "custom XML data properties".into(),
        "header" => "headers".into(),
        "footer" => "footers".into(),
        "thumbnail" => "the document thumbnail".into(),
        "word/comments.xml" | "word/commentsExtended.xml" | "word/commentsIds.xml" | "word/commentsExtensible.xml" => format!("comment data ({kind})"),
        "word/footnotes.xml" => "footnotes (word/footnotes.xml)".into(),
        "word/endnotes.xml" => "endnotes (word/endnotes.xml)".into(),
        "word/numbering.xml" => "list definitions (word/numbering.xml)".into(),
        "word/people.xml" => "reviewer details (word/people.xml)".into(),
        "word/glossary/document.xml" => "building blocks (glossary)".into(),
        "word/vbaProject.bin" => "macros (vbaProject.bin)".into(),
        other => format!("package part {other}"),
    }
}

fn story_kind(name: &str) -> Option<&'static str> {
    let file = name.trim_start_matches('/');
    let f = file.strip_prefix("word/")?;
    if f.contains('/') {
        return None;
    }
    let digits = |p: &str| f.strip_prefix(p).is_some_and(|r| r.trim_end_matches(".xml").chars().all(|c| c.is_ascii_digit()) && r.ends_with(".xml"));
    Some(match f {
        "document.xml" => "the body",
        "footnotes.xml" => "footnotes",
        "endnotes.xml" => "endnotes",
        "comments.xml" => "comments",
        _ if digits("header") => "headers",
        _ if digits("footer") => "footers",
        _ => return None,
    })
}

fn element_label(key: &str) -> String {
    if let Some(rest) = key.strip_prefix('{')
        && let Some((ns, local)) = rest.split_once('}')
    {
        return format!("extension content <{local}> from {ns}");
    }
    key.to_string()
}

/// Parses one XML part completely (well-formedness check) and, for story parts, adds to `inv`.
fn scan_xml(data: &[u8], story: Option<&'static str>, inv: &mut Inventory) -> Result<(), String> {
    let mut r = NsReader::from_reader(data);
    r.config_mut().check_end_names = true;
    let mut buf = Vec::new();
    let mut depth: usize = 0;
    let mut in_text = 0usize; // inside w:t / w:delText
    loop {
        let pos = r.buffer_position();
        let (ns, ev) = r.read_resolved_event_into(&mut buf).map_err(|e| format!("not well-formed XML near byte {pos}: {e}"))?;
        let ns_str = match ns {
            ResolveResult::Bound(n) => Some(String::from_utf8_lossy(n.as_ref()).into_owned()),
            _ => None,
        };
        match ev {
            Event::Start(e) => {
                depth += 1;
                if let Some(story) = story {
                    if is_text_element(ns_str.as_deref(), &e) {
                        in_text += 1;
                    }
                    count_element(ns_str.as_deref(), &e, inv);
                    let _ = story;
                }
            }
            Event::Empty(e) => {
                if story.is_some() {
                    count_element(ns_str.as_deref(), &e, inv);
                }
            }
            Event::End(e) => {
                depth = depth.checked_sub(1).ok_or("unbalanced end tag")?;
                if story.is_some() && in_text > 0 {
                    let local = e.local_name();
                    if matches!(local.as_ref(), b"t" | b"delText") && matches!(ns_str.as_deref(), Some(W_T | W_S)) {
                        in_text -= 1;
                    }
                }
            }
            Event::Text(t) if in_text > 0 => {
                if let Some(story) = story {
                    let s = t.decode().map_err(|e| format!("bad text encoding: {e}"))?;
                    *inv.text_chars.entry(story.to_string()).or_default() += s.chars().count();
                }
            }
            Event::GeneralRef(_) if in_text > 0 => {
                if let Some(story) = story {
                    *inv.text_chars.entry(story.to_string()).or_default() += 1;
                }
            }
            Event::CData(c) if in_text > 0 => {
                if let Some(story) = story {
                    *inv.text_chars.entry(story.to_string()).or_default() += String::from_utf8_lossy(&c).chars().count();
                }
            }
            Event::Eof => break,
            _ => {}
        }
        buf.clear();
    }
    if depth != 0 {
        return Err(format!("the part ends before {depth} element(s) are closed"));
    }
    Ok(())
}

fn is_text_element(ns: Option<&str>, e: &BytesStart) -> bool {
    matches!(ns, Some(W_T | W_S)) && matches!(e.local_name().as_ref(), b"t" | b"delText")
}

fn attr<'a>(e: &'a BytesStart, local: &[u8]) -> Option<String> {
    e.attributes().flatten().find(|a| a.key.local_name().as_ref() == local).map(|a| String::from_utf8_lossy(&a.value).into_owned())
}

fn count_element(ns: Option<&str>, e: &BytesStart, inv: &mut Inventory) {
    let local = String::from_utf8_lossy(e.local_name().as_ref()).into_owned();
    match ns {
        Some(W_T | W_S) => {
            let label = match local.as_str() {
                // A complex field is counted at its begin character, so a field written either way
                // (simple or complex) counts once.
                "fldChar" => (attr(e, b"fldCharType").as_deref() == Some("begin")).then_some("fields"),
                // Word's "last edit position" bookmark is volatile.
                "bookmarkStart" => (attr(e, b"name").as_deref() != Some("_GoBack")).then_some("bookmarks"),
                "br" => (attr(e, b"type").as_deref() == Some("page")).then_some("page breaks"),
                l => WATCHED.iter().find(|(k, _)| *k == l).map(|(_, label)| *label),
            };
            if let Some(label) = label {
                *inv.elements.entry(label.to_string()).or_default() += 1;
            }
        }
        Some(M) if local == "oMath" => *inv.elements.entry("equations".into()).or_default() += 1,
        Some(ns) if !CORE_NAMESPACES.contains(&ns) => {
            *inv.elements.entry(format!("{{{ns}}}{local}")).or_default() += 1;
        }
        // Unbound or unknown prefix: an element that only an ignorable declaration made legal.
        None => *inv.elements.entry(format!("{{(no namespace)}}{local}")).or_default() += 1,
        _ => {}
    }
}

fn main_part_name<R: Read + std::io::Seek>(z: &mut zip::ZipArchive<R>) -> Option<String> {
    let mut rels = String::new();
    z.by_name("_rels/.rels").ok()?.read_to_string(&mut rels).ok()?;
    let i = rels.find("relationships/officeDocument")?;
    let tail = &rels[i..];
    let t = tail.find("Target=\"")? + 8;
    let end = tail[t..].find('"')?;
    Some(tail[t..t + end].trim_start_matches('/').to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    fn pkg(document: &str, extra: &[(&str, &str)]) -> Vec<u8> {
        let mut zw = zip::ZipWriter::new(Cursor::new(Vec::new()));
        let opt = zip::write::SimpleFileOptions::default();
        zw.start_file("[Content_Types].xml", opt).unwrap();
        zw.write_all(b"<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"/>").unwrap();
        zw.start_file("word/document.xml", opt).unwrap();
        zw.write_all(document.as_bytes()).unwrap();
        for (n, c) in extra {
            zw.start_file(*n, opt).unwrap();
            zw.write_all(c.as_bytes()).unwrap();
        }
        zw.finish().unwrap().into_inner()
    }

    const DOC_HEAD: &str = r#"<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:x="urn:ex" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x"><w:body>"#;

    #[test]
    fn counts_text_tables_fields_and_extensions() {
        let doc = format!(
            "{DOC_HEAD}<w:p><w:r><w:t>Hello &amp; bye</w:t></w:r></w:p><w:tbl><w:tr><w:tc><w:p/></w:tc></w:tr></w:tbl>\
             <w:p><w:fldSimple w:instr=\"PAGE\"/><w:r><w:fldChar w:fldCharType=\"begin\"/></w:r><w:r><w:fldChar w:fldCharType=\"end\"/></w:r>\
             <x:note>hi</x:note><w:bookmarkStart w:id=\"0\" w:name=\"_GoBack\"/></w:p></w:body></w:document>"
        );
        let s = scan_package(&pkg(&doc, &[])).unwrap();
        assert!(!s.is_damaged());
        assert_eq!(s.inventory.text_chars["the body"], "Hello & bye".chars().count());
        assert_eq!(s.inventory.elements["tables"], 1);
        assert_eq!(s.inventory.elements["table rows"], 1);
        assert_eq!(s.inventory.elements["fields"], 2, "a simple and a complex field count once each");
        assert_eq!(s.inventory.elements["{urn:ex}note"], 1);
        assert!(!s.inventory.elements.contains_key("bookmarks"), "_GoBack is volatile");
    }

    #[test]
    fn malformed_and_truncated_parts_are_damage() {
        let s = scan_package(&pkg(&format!("{DOC_HEAD}<w:p><w:r><w:t>Unclosed"), &[])).unwrap();
        assert!(s.is_damaged(), "{s:?}");
        let s = scan_package(&pkg(&format!("{DOC_HEAD}<w:p></w:r></w:body></w:document>"), &[])).unwrap();
        assert!(s.is_damaged());
        assert!(scan_package(b"<html></html>").is_err());
    }

    #[test]
    fn compare_reports_only_what_shrank() {
        let a = scan_package(&pkg(&format!("{DOC_HEAD}<w:p><w:r><w:t>abc</w:t></w:r><x:note/></w:p></w:body></w:document>"), &[("word/comments.xml", "<w:comments xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"/>")])).unwrap();
        let b = scan_package(&pkg(&format!("{DOC_HEAD}<w:p><w:r><w:t>abcdef</w:t></w:r></w:p></w:body></w:document>"), &[])).unwrap();
        let losses = compare(&a.inventory, &b.inventory);
        let what: Vec<_> = losses.iter().map(|l| l.what.as_str()).collect();
        assert_eq!(what, ["extension content <note> from urn:ex", "comment data (word/comments.xml)"]);
        assert!(compare(&b.inventory, &b.inventory).is_empty());
    }

    #[test]
    fn header_and_media_parts_compare_by_kind_not_name() {
        let a = scan_package(&pkg("<a/>", &[("word/header1.xml", "<a/>"), ("word/media/image1.png", "x")])).unwrap();
        let b = scan_package(&pkg("<a/>", &[("word/header7.xml", "<a/>"), ("word/media/pic.png", "x")])).unwrap();
        assert!(compare(&a.inventory, &b.inventory).is_empty());
    }
}
