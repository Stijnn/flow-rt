use std::sync::Mutex;

use dyn_rt::registry::PluginRegistry;
use tauri::{async_runtime::block_on, Manager};
use tauri_plugin_prevent_default::{KeyboardShortcut};
use tokio::sync::Mutex as TokioMutex;

use crate::{
    binding::init_plugin_repo, projects::ProjectConfiguration, settings::AppSettingsState,
};

pub mod binding;
pub mod fs;
pub mod models;
pub mod projects;
pub mod schema;
pub mod schemas;
pub mod settings;
pub mod state;

#[macro_use]
pub mod macros;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(not(debug_assertions))]
    let prevent = tauri_plugin_prevent_default::Builder::new()
        .with_flags(
            tauri_plugin_prevent_default::Flags::CONTEXT_MENU
                | tauri_plugin_prevent_default::Flags::RELOAD
                | tauri_plugin_prevent_default::Flags::PRINT
                | tauri_plugin_prevent_default::Flags::DOWNLOADS
                | tauri_plugin_prevent_default::Flags::keyboard()
        )
        .shortcut(KeyboardShortcut::with_alt("ArrowLeft"))
        .shortcut(KeyboardShortcut::with_alt("ArrowRight"))
        .build();

    #[cfg(debug_assertions)]
    let prevent = tauri_plugin_prevent_default::Builder::new()
        .with_flags(
                tauri_plugin_prevent_default::Flags::RELOAD
                | tauri_plugin_prevent_default::Flags::PRINT
                | tauri_plugin_prevent_default::Flags::DOWNLOADS
                | tauri_plugin_prevent_default::Flags::keyboard()
        )
        .shortcut(KeyboardShortcut::with_alt("ArrowLeft"))
        .shortcut(KeyboardShortcut::with_alt("ArrowRight"))
        .build();

    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(prevent)
        .manage::<Mutex<Option<ProjectConfiguration>>>(Mutex::new(None))
        .invoke_handler(tauri::generate_handler![
            binding::request_plugin_reload,
            binding::fetch_plugins,
            fs::open_file_directory_external,
            fs::list_directory,
            fs::get_home_directory,
            fs::list_drives,
            settings::get_or_init_settings,
            settings::sync_settings,
            projects::create_project,
            projects::open_project,
            projects::get_all_projects,
            projects::get_current_project,
            projects::build_project_structure
        ])
        .setup(|app| {
            let settings_handle = app.handle();
            block_on(async {
                let settings = settings::get_or_init_settings(settings_handle.clone())
                    .await
                    .expect("Expected installation of settings config to succeed");

                app.manage::<crate::settings::AppSettingsState>(AppSettingsState {
                    settings: TokioMutex::new(settings.clone()),
                });
            });

            init_plugin_repo(app.handle());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
