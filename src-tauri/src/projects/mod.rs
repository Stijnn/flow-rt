use std::{io::Read, path::{Path, PathBuf}, sync::Mutex};

use diesel::{
    ExpressionMethods, OptionalExtension, QueryDsl, QueryResult, RunQueryDsl, SelectableHelper,
};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager};

use crate::{
    fs::visit_dirs, models::{NewTrackedProject, TrackedProject}, schema::project::{self, directory_location, title}, silence
};

mod initializer;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub(crate) struct ProjectStructure {
    files: Vec<ProjectFile>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub(crate) struct ProjectFile {
    relative_location: String,
    extension: String
}

impl ProjectFile {
    pub(crate) fn new(relative_location: String, extension: String) -> Self {
        Self { relative_location, extension }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub(crate) struct ProjectTOMLConfiguration {
    #[serde(rename = "info", alias = "information", alias = "workspace")]
    pub info: ProjectInformation,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub(crate) struct ProjectConfiguration {
    #[serde(rename = "info", alias = "information", alias = "workspace")]
    pub info: ProjectInformation,
    pub location: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub(crate) struct ProjectInformation {
    pub name: String,
    pub description: String,
    pub version: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub(crate) struct NewProject {
    pub name: String,
    pub location: String,
}

#[tauri::command]
pub(crate) async fn create_project(
    app: AppHandle,
    new_project: NewProject,
) -> Result<ProjectConfiguration, String> {
    let result = new_project.init_at_location();
    if let Err(e) = result {
        eprintln!("{e}");
        return Err(e);
    }

    let new_project = result.unwrap();
    silence!(track_project(
        new_project.name.clone(),
        &new_project.location
    ));

    open_project(app, new_project.location.clone()).await
}

#[tauri::command]
pub(crate) async fn build_project_structure(root: String) -> Result<ProjectStructure, String> {
    let mut files = Vec::new();
    let root_path = Path::new(&root);

    if !root_path.is_dir() {
        return Err("Provided path is not a directory".to_string());
    }

    visit_dirs(root_path, root_path, &mut files)?;

    Ok(ProjectStructure { files })
}

#[tauri::command]
pub(crate) async fn open_project(
    app: AppHandle,
    location: String,
) -> Result<ProjectConfiguration, String> {
    match get_project_configuration_from_location(&app, &location) {
        Ok(config) => {
            let tracked_project = find_tracked_project_by_name_and_location(&config, &location)
                .or_else(|| track_project(config.info.name.clone(), &location).ok());

            if tracked_project.is_none() {
                return Err("Failed to find imported project".to_string());
            }

            let tracked_project = tracked_project.unwrap();
            silence!(record_opening(tracked_project.id));

            let state = app.state::<Mutex<Option<ProjectConfiguration>>>();
            let mut project_lock = state.lock().map_err(|_| "Failed to lock project state")?;

            *project_lock = Some(config.clone());

            silence!(app.emit("on_current_project_changed", config.clone()));

            Ok(config)
        }
        Err(e) => Err(e),
    }
}

#[tauri::command]
pub(crate) async fn get_all_projects() -> Vec<ProjectConfiguration> {
    distinct_projects()
}

#[tauri::command]
pub(crate) async fn get_current_project(app: AppHandle) -> Option<ProjectConfiguration> {
    app.state::<Mutex<Option<ProjectConfiguration>>>()
        .lock()
        .unwrap()
        .clone()
}

fn has_project(app: &AppHandle) -> bool {
    app.state::<Mutex<Option<ProjectConfiguration>>>()
        .lock()
        .unwrap()
        .is_some()
}

fn close_project(app: &AppHandle) -> Result<(), String> {
    let state = app.state::<Mutex<Option<ProjectConfiguration>>>();
    let mut project_lock = state.lock().map_err(|_| "Failed to lock project state")?;
    *project_lock = None;
    Ok(())
}

fn get_project_configuration_from_location(
    app: &AppHandle,
    location: &String,
) -> Result<ProjectConfiguration, String> {
    if has_project(app) {
        crate::silence!(close_project(app));
    }

    let location_as_root_dir = PathBuf::from(location);
    if !location_as_root_dir.exists() || !location_as_root_dir.is_dir() {
        return Err(format!(
            "{location} does not exist or is not a valid directory."
        ));
    }

    let toml_location = location_as_root_dir.join("Flow.toml");
    if !toml_location.is_file() || !toml_location.exists() {
        return Err(format!("{toml_location:?} could not be found."));
    }

    toml_from_project_location(&toml_location).map(|original| ProjectConfiguration {
        info: original.info.clone(),
        location: location.clone(),
    })
}

fn toml_from_project_location(location: &PathBuf) -> Result<ProjectTOMLConfiguration, String> {
    let mut toml_str_buffer = String::new();

    let _config_wrapper_result = std::fs::File::open(location)
        .unwrap()
        .read_to_string(&mut toml_str_buffer);

    let config_wrapper = toml::from_str::<ProjectTOMLConfiguration>(&toml_str_buffer)
        .map_err(|_| "Could not load Flow.toml")?;

    Ok(config_wrapper)
}

fn distinct_projects() -> Vec<ProjectConfiguration> {
    let mut collection = vec![];

    let mut state_connection = crate::state::get_connection();
    let projects = project::dsl::project
        .select(TrackedProject::as_select())
        .distinct()
        .load::<TrackedProject>(&mut *state_connection)
        .expect("Failed to load projects");

    projects.iter().for_each(|tracked_project| {
        let root_dir_path = PathBuf::from(tracked_project.directory_location.clone());
        let toml_path = root_dir_path.join("Flow.toml");

        if !root_dir_path.exists()
            || !root_dir_path.is_dir()
            || !toml_path.exists()
            || !toml_path.is_file()
        {
            return;
        }

        silence!(match toml_from_project_location(&toml_path) {
            Ok(config) => {
                collection.push(ProjectConfiguration {
                    info: config.info.clone(),
                    location: tracked_project.directory_location.clone(),
                });
            }
            Err(e) => {
                eprintln!("Error loading Flow.toml at {toml_path:?} with: {e}");
            }
        });
    });

    collection
}

fn track_project(name: String, location: &String) -> QueryResult<TrackedProject> {
    let mut state_connection = crate::state::get_connection();
    diesel::insert_into(crate::schema::project::table)
        .values(&NewTrackedProject {
            title: name,
            directory_location: location.to_string(),
        })
        .on_conflict_do_nothing()
        .returning(TrackedProject::as_returning())
        .get_result::<TrackedProject>(&mut *state_connection)
}

fn find_tracked_project_by_name_and_location(
    config: &ProjectConfiguration,
    location: &String,
) -> Option<TrackedProject> {
    let mut conn = crate::state::get_connection();

    let target_name = &config.info.name;

    project::dsl::project
        .filter(title.eq(target_name))
        .filter(directory_location.eq(location))
        .first::<TrackedProject>(&mut *conn)
        .optional()
        .expect("Database query failed")
}

fn record_opening(p_id: i32) -> QueryResult<usize> {
    use crate::schema::recent_project;

    let mut state_connection = crate::state::get_connection();
    diesel::insert_into(recent_project::table)
        .values(recent_project::project_id.eq(p_id))
        .execute(&mut *state_connection)
}
