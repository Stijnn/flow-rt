use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tokio::io::AsyncWriteExt;

use crate::projects::{has_project, ProjectConfiguration};

#[derive(Serialize, Deserialize)]
pub(crate) struct NewGraphParameters {
    name: String,
    graph_type: String,
    data: serde_json::Value,
}

async fn retrieve_project_configuration(app: AppHandle) -> Result<ProjectConfiguration, String> {
    if !has_project(&app.clone()) {
        return Err(
            "No project currently loaded. Should not be called without managed project."
                .to_string(),
        );
    }

    let current_project = crate::projects::get_current_project(app.clone()).await;
    if current_project.is_none() {
        return Err(
            "No project currently loaded. Should not be called without managed project."
                .to_string(),
        );
    }

    Ok(current_project.unwrap())
}

#[tauri::command]
pub(crate) async fn create_graph(
    app: AppHandle,
    parameters: serde_json::Value,
) -> Result<serde_json::Value, String> {
    println!("{parameters:?}");
    let project_config = retrieve_project_configuration(app.clone()).await?;
    let project_graphs_location = PathBuf::from(project_config.location).join("flows");
    let graph_location = project_graphs_location.join(format!(
        "{}.jfg",
        parameters
            .get("name")
            .expect("name does not exist")
            .as_str()
            .unwrap()
    ));
    println!("{graph_location:?}");

    if graph_location.exists() {
        return Err("Graph already exists.".into());
    }

    match tokio::fs::File::create_new(&graph_location).await {
        Ok(mut file) => {
            let data = serde_json::to_string_pretty(&parameters)
                .map_err(|e| format!("Serialization failed: {}", e))?;

            file.write_all(data.as_bytes())
                .await
                .map_err(|e| format!("Failed to write to file: {}", e))?;

            Ok(parameters)
        }
        Err(e) => Err(format!(
            "Could not create file at {:?}: {}",
            graph_location, e
        )),
    }
}

