use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::OnceLock;

use anyhow::anyhow;
use anyhow::Ok as anyhowOk;

use dyn_rt::attach::AttachedPlugin;
use dyn_rt::registry::{PluginRegistry, PluginRegistryBuilder};
use dyn_rt::FnDescriptor;
use serde::Deserialize;
use serde::Serialize;
use tauri::path::BaseDirectory;
use tauri::AppHandle;
use tauri::Manager;

static APP_PLUGIN_REGISTRY: OnceLock<Mutex<PluginRegistry>> = OnceLock::new();

#[derive(Serialize, Deserialize)]
pub(crate) struct PluginDescription {
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

pub(crate) fn init_plugin_repo(handle: &AppHandle) {
    let plugin_registry_result = load_default_modules(handle);
    if let Err(plugin_registry_error) = plugin_registry_result {
        println!("{plugin_registry_error:?}");
        panic!("{plugin_registry_error}");
    }

    let plugin_registry = plugin_registry_result.unwrap();
    println!("{:?}", plugin_registry.get_plugins_map());

    if let Err(_e) = APP_PLUGIN_REGISTRY.set(Mutex::new(plugin_registry)) {
        panic!("Failed to initialize global plugin repository.");
    }
}

#[tauri::command]
pub(crate) async fn fetch_plugins() -> Result<Vec<PluginDescription>, String> {
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

fn get_lib_files_in_dir(dir: PathBuf) -> anyhow::Result<Vec<PathBuf>> {
    if !dir.is_dir() {
        return Err(anyhow::anyhow!("{dir:?} is not a valid directory"));
    }

    let entries = std::fs::read_dir(&dir)
        .map_err(|e| anyhow::anyhow!("Error retrieving directory entries: {e}"))?;

    let libs = entries
        .filter_map(|entry| {
            let path = entry.ok()?.path();
            if !path.is_file() {
                return None;
            }

            println!("{path:?}");
            if let Some(ext) = path.extension() {
                if ext == "so" || ext == "dll" || ext == "dylib" {
                    println!("{path:?} is possible valid plugin");
                    return Some(path);
                }
            }
            None
        })
        .collect::<Vec<PathBuf>>();

    anyhowOk(libs)
}

pub(crate) fn load_default_modules(app: &AppHandle) -> anyhow::Result<PluginRegistry> {
    let resource_path = app.path().resolve("modules/", BaseDirectory::Resource)?;

    let module_paths = get_lib_files_in_dir(resource_path);

    println!("{module_paths:?}");
    if let Err(e) = module_paths {
        return Err(anyhow!("Failed to load default modules: {e}"));
    }

    let module_paths_collection = module_paths.unwrap();
    let registry = PluginRegistryBuilder::new()
        .add_libraries(module_paths_collection)
        .build();

    Ok(registry)
}

#[tauri::command]
pub(crate) async fn request_plugin_reload(
    plugin_desc: PluginDescription,
) -> std::result::Result<(), String> {
    let plugin_registry_mutex = APP_PLUGIN_REGISTRY.get().unwrap();

    let mut registry = plugin_registry_mutex.lock().map_err(|_| "Mutex poisoned")?;

    impl_request_plugin_reload(&mut registry, plugin_desc)
}

fn impl_request_plugin_reload(
    registry: &mut crate::PluginRegistry,
    plugin_desc: PluginDescription,
) -> std::result::Result<(), String> {
    registry.unload_plugin(&plugin_desc.name);

    let path = PathBuf::from(&plugin_desc.location);

    let plugin = dyn_rt::attach::attach_library(&path)
        .map_err(|e| format!("Failed to reload plugin at {:?}: {}", path, e).to_string())?;

    registry.add_plugin(Arc::from(plugin));

    Ok(())
}
