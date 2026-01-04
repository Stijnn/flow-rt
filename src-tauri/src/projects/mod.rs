use std::path::PathBuf;

use anyhow::Result;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Project {
    name: String,
}

#[derive(Serialize, Deserialize)]
pub struct ProjectMetaData {
    name: String,
    directory: PathBuf,
}

#[tauri::command]
pub async fn initialize_project(new_project: ProjectMetaData) -> Result<Project, String> {
    #[cfg(any(target_os = "windows", target_os = "linux"))]
    return impl_initialize_project(new_project).await;
    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    return Err("Unsupported Platform");
}

async fn impl_initialize_project(new_project: ProjectMetaData) -> Result<Project, String> {
    let dir = &new_project.directory;

    if dir.exists() {
        return Err(format!("Directory {:?} already exists", dir));
    }

    tokio::fs::create_dir_all(dir)
        .await
        .map_err(|e| format!("Failed to create project directory: {e}"))?;

    let json_content = serde_json::to_string_pretty(&new_project)
        .map_err(|e| format!("Failed to serialize data: {e}"))?;

    let file_path = dir.join("project.json");
    tokio::fs::write(&file_path, json_content)
        .await
        .map_err(|e| format!("Failed to write project.json: {e}"))?;

    Ok(Project {
        name: new_project.name,
    })
}
