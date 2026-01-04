use std::path::PathBuf;
use std::sync::Arc;

use anyhow::anyhow;
use anyhow::Ok as anyhowOk;

use dyn_rt::registry::{PluginRegistry, PluginRegistryBuilder};
use tauri::path::BaseDirectory;
use tauri::AppHandle;
use tauri::Manager;

use crate::PluginDescription;
use crate::APP_PLUGIN_REGISTRY;

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
