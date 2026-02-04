use std::sync::Mutex;

use dyn_rt::{registry::PluginRegistry};
use tauri::{async_runtime::block_on, Manager};
use tokio::sync::Mutex as TokioMutex;

use crate::{binding::init_plugin_repo, projects::ProjectConfiguration, settings::AppSettingsState};

pub mod models;
pub mod schema;
pub mod projects;
pub mod binding;
pub mod fs;
pub mod settings;
pub mod schemas;
pub mod state;

#[macro_use]
pub mod macros;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
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
            projects::get_all_projects
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
