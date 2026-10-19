//! Pagewright's product layer over the WordCraft engine: document lifecycle, file-format policy
//! and the fidelity guard. No UI code lives here, so every rule is testable headlessly.

pub mod fidelity;
pub mod filekind;
pub mod identity;
pub mod workspace;

pub use filekind::{FileKind, SaveMode};
pub use workspace::{Concern, FileInfo, Notice, SaveOutcome, SaveStatus, Workspace};
pub use wordcraft_engine as engine;
