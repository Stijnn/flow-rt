use std::{
    collections::HashMap,
    sync::{Mutex, OnceLock},
};

use anyhow::Result;
use dyn_rt::{attach::AttachedPlugin, registry::PluginRegistry, FnDescriptor};
use serde::{Deserialize, Serialize};
use tauri::{async_runtime::block_on, Manager};
use tokio::sync::Mutex as TokioMutex;

use crate::settings::AppSettingsState;

pub mod binding;
pub mod fs;
pub mod projects;
pub mod settings;
pub mod graphs;
pub mod schemas;

#[macro_use]
pub mod macros;

static APP_PLUGIN_REGISTRY: OnceLock<Mutex<PluginRegistry>> = OnceLock::new();

#[derive(Serialize, Deserialize)]
struct PluginDescription {
    name: String,
    description: String,
    version: String,
    functions: HashMap<String, FnDescriptor>,
    location: String,
    blake3_hash: String,
}

impl PluginDescription {
    fn from_plugin(plugin: &AttachedPlugin) -> Self {
        Self {
            name: plugin.name.clone(),
            description: plugin.description.clone(),
            version: plugin.cargo_version.clone(),
            functions: plugin
                .functions
                .iter()
                .map(|(k, v)| (k.clone(), v.clone()))
                .collect::<HashMap<String, FnDescriptor>>(),
            location: plugin.location.clone(),
            blake3_hash: plugin.blake3_hash.clone(),
        }
    }
}

#[tauri::command]
async fn fetch_plugins() -> Result<Vec<PluginDescription>, String> {
    let registry_guard = APP_PLUGIN_REGISTRY
        .get()
        .ok_or_else(|| "Plugin registry is uninitialized.".to_string())?
        .lock()
        .map_err(|e| format!("Could not lock registry context: {e}"))?;

    let plugin_names = registry_guard
        .get_plugins_vec()
        .iter()
        .map(|k| PluginDescription::from_plugin(k))
        .collect();

    Ok(plugin_names)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            projects::initialize_project,
            projects::load_project,
            binding::request_plugin_reload,
            fs::open_file_directory_external,
            fs::list_directory,
            fs::get_home_directory,
            fs::list_drives,
            settings::get_or_init_settings,
            settings::sync_settings,
            fetch_plugins
        ])
        .setup(|app| {
            let settings_handle = app.handle();
            block_on(async {
                let settings = settings::get_or_init_settings(settings_handle.clone())
                    .await
                    .expect("Expected installation of settings config to succeed");

                app.manage::<crate::settings::AppSettingsState>(AppSettingsState {
                    settings: TokioMutex::new(settings),
                });
            });

            let plugin_registry_result = binding::load_default_modules(app.handle());
            if let Err(plugin_registry_error) = plugin_registry_result {
                println!("{plugin_registry_error:?}");
                panic!("{plugin_registry_error}");
            }

            let plugin_registry = plugin_registry_result.unwrap();
            println!("{:?}", plugin_registry.get_plugins_map());

            if let Err(_e) = APP_PLUGIN_REGISTRY.set(Mutex::new(plugin_registry)) {
                panic!("Failed to initialize global plugin repository.");
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
