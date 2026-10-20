//! Pagewright desktop app: a window around `pagewright_ui::PagewrightApp` with the system's
//! clipboard, file dialogs and print spooler.
//!
//!     pagewright [FILE]
//!
//! Environment: `PAGEWRIGHT_PROFILE_DIR` (preferences and recovery copies),
//! `PAGEWRIGHT_FILE_DIALOG=builtin|system` (force the built-in or the native file chooser),
//! `PAGEWRIGHT_NO_RECOVERY=1`.

#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod platform;

use std::path::PathBuf;

use pagewright_ui::{AppOptions, PagewrightApp};

struct Shell {
    app: PagewrightApp,
}

impl eframe::App for Shell {
    fn ui(&mut self, ui: &mut egui::Ui, _frame: &mut eframe::Frame) {
        self.app.ui(ui);
    }

    fn clear_color(&self, _visuals: &egui::Visuals) -> [f32; 4] {
        self.app.pal.desk.to_normalized_gamma_f32()
    }
}

fn icon() -> Option<egui::IconData> {
    let png = include_bytes!("../../../brand/png/pagewright-256.png");
    let img = image::load_from_memory(png).ok()?.into_rgba8();
    let (w, h) = img.dimensions();
    Some(egui::IconData { rgba: img.into_raw(), width: w, height: h })
}

fn main() -> eframe::Result {
    let args: Vec<String> = std::env::args().skip(1).collect();
    if args.iter().any(|a| a == "--version" || a == "-V") {
        println!("{} {} ({})", pagewright_core::identity::PRODUCT, pagewright_core::identity::VERSION, pagewright_core::identity::ENGINE);
        return Ok(());
    }
    let open = args.iter().find(|a| !a.starts_with('-')).map(PathBuf::from);
    let (min_w, min_h) = pagewright_ui::tokens::Metrics::min_window();
    let mut viewport = egui::ViewportBuilder::default()
        .with_title("Pagewright")
        .with_app_id(pagewright_core::identity::APP_ID)
        .with_inner_size([1280.0, 860.0])
        .with_min_inner_size([min_w, min_h]);
    if let Some(i) = icon() {
        viewport = viewport.with_icon(i);
    }
    let options = eframe::NativeOptions { viewport, ..Default::default() };
    eframe::run_native(
        "Pagewright",
        options,
        Box::new(move |cc| {
            let platform = Box::new(platform::System::new());
            let opts = AppOptions { open, recovery: std::env::var_os("PAGEWRIGHT_NO_RECOVERY").is_none(), prefs: true };
            Ok(Box::new(Shell { app: PagewrightApp::new(&cc.egui_ctx, platform, opts) }))
        }),
    )
}
