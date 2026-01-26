use std::{fs::{File, create_dir_all}, io::BufReader, path::PathBuf};

use anyhow::Result;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize, Deserialize)]
pub struct Project {
    name: String,
    graphs: Vec<ProjectGraph>,
}

#[derive(Serialize, Deserialize)]
pub struct ProjectGraph {
    name: String,
    nodes: Option<Vec<Value>>,
    edges: Option<Vec<Value>>,
}

impl ProjectGraph {
    fn from_file(path: PathBuf) -> Result<Self, String> {
        let f = File::open(path).map_err(|e| "Failed to open file")?;
        let b = BufReader::new(f);
        Ok(serde_json::from_reader::<BufReader<File>, ProjectGraph>(b).map_err(|e| "Failed to parse graph")?)
    }
}

#[derive(Serialize, Deserialize)]
pub struct LocalProject {
    name: String,
}

#[tauri::command]
pub async fn initialize_project(new_project: LocalProject) -> Result<Project, String> {
    #[cfg(any(target_os = "windows", target_os = "linux"))]
    return impl_initialize_project(new_project).await;
    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    return Err("Unsupported Platform");
}

async fn impl_initialize_project(new_project: LocalProject) -> Result<Project, String> {
    let home_dir = crate::fs::get_home_directory()
        .await
        .map_err(|_| "Error retrieving $HOME")?;
    let dir = PathBuf::from(home_dir).join(format!(".projects/{}", new_project.name));

    if dir.exists() {
        return Err(format!("Directory {:?} already exists", dir));
    }

    tokio::fs::create_dir_all(dir.clone())
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
        graphs: vec![],
    })
}

#[tauri::command]
pub async fn load_project(project: LocalProject) -> Result<Project, String> {
    #[cfg(any(target_os = "windows", target_os = "linux"))]
    return impl_load_project(project).await;
    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    return Err("Unsupported Platform");
}

async fn impl_load_project(project: LocalProject) -> Result<Project, String> {
    let home_dir = crate::fs::get_home_directory()
        .await
        .map_err(|_| "Error retrieving $HOME")?;
    let root_dir = PathBuf::from(home_dir).join(format!(".projects/{}", project.name));

    if !root_dir.exists() {
        return Err("Could not find project directory.".into());
    }

    let graph_dir = root_dir.join("graphs/");
    if !graph_dir.exists() {
        let _ = create_dir_all(graph_dir.clone());
    }

    let graph_entries = crate::fs::list_directory(graph_dir.to_str().unwrap().to_string())
        .await
        .map_err(|e| e)?;

    let graphs = graph_entries
        .entries
        .iter()
        .filter(|f| f.ext.is_some())
        .map(|f| (f, f.ext.clone().unwrap()))
        .filter(|(_, ext)| ext.eq("graph"))
        .map(|(f, _)| f)
        .map(|fg| ProjectGraph::from_file(PathBuf::from(fg.path.clone())))
        .filter(|graph_result| graph_result.is_ok())
        .map(|graph| graph.unwrap())
        .collect::<Vec<_>>();

    let script_dir = root_dir.join("scripts/");
    if !script_dir.exists() {
        let _ = create_dir_all(script_dir);
    }

    Ok(Project {
        name: project.name,
        graphs: graphs,
    })
}
