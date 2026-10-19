//! `pagewright-cli`: the same document pipeline as the desktop app, without a window.
//!
//!     pagewright-cli convert IN OUT      convert by extension (docx, odt, rtf, pdf, html, md, txt, tex)
//!     pagewright-cli check IN            JSON report: damage, format mismatch, what a save would lose
//!     pagewright-cli text IN             plain text of the body
//!
//! Exit codes: 0 success, 1 error, 2 usage.

use std::path::Path;
use std::process::ExitCode;

use pagewright_core::{SaveOutcome, Workspace, identity};

fn main() -> ExitCode {
    identity::init();
    let args: Vec<String> = std::env::args().skip(1).collect();
    let result = match args.iter().map(String::as_str).collect::<Vec<_>>().as_slice() {
        ["convert", input, output] => convert(Path::new(input), Path::new(output)),
        ["check", input] => check(Path::new(input)),
        ["text", input] => Workspace::open(Path::new(input)).map(|ws| print!("{}", ws.session.doc.plain_text(wordcraft_engine::doc::StoryRef::Body))),
        ["--version"] => {
            println!("{} {} ({})", identity::PRODUCT, identity::VERSION, identity::ENGINE);
            Ok(())
        }
        _ => {
            eprintln!("usage: pagewright-cli convert IN OUT | check IN | text IN | --version");
            return ExitCode::from(2);
        }
    };
    match result {
        Ok(()) => ExitCode::SUCCESS,
        Err(e) => {
            eprintln!("pagewright-cli: {e}");
            ExitCode::FAILURE
        }
    }
}

/// Converts without asking: the CLI is explicit by nature, so concerns are printed, not prompted.
fn convert(input: &Path, output: &Path) -> Result<(), String> {
    let mut ws = Workspace::open(input)?;
    for n in &ws.notices {
        eprintln!("note: {}", n.message());
    }
    let outcome = match ws.save_as(output, false)? {
        SaveOutcome::NeedsConfirmation { concerns, .. } => {
            for c in &concerns {
                eprintln!("note: {}", c.message());
            }
            ws.save_as(output, true)?
        }
        o => o,
    };
    match outcome {
        SaveOutcome::Saved { path } | SaveOutcome::Exported { path } => {
            println!("wrote {}", path.display());
            Ok(())
        }
        o => Err(format!("not written: {o:?}")),
    }
}

fn check(input: &Path) -> Result<(), String> {
    let ws = Workspace::open(input)?;
    let report = serde_json::json!({
        "file": input,
        "kind": ws.file().map(|f| f.kind),
        "damaged": ws.file().is_some_and(|f| f.damaged),
        "mismatch": ws.file().and_then(|f| f.mismatch),
        "wouldLose": ws.file().map(|f| f.untouched_losses.clone()).unwrap_or_default(),
        "notices": ws.notices.iter().map(|n| n.message()).collect::<Vec<_>>(),
        "paragraphs": ws.session.doc.paragraph_count(),
        "words": ws.session.doc.word_count(),
    });
    println!("{}", serde_json::to_string_pretty(&report).unwrap_or_default());
    Ok(())
}
