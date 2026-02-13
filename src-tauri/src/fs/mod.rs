use std::{fs::create_dir_all, path::PathBuf};

use serde::{Deserialize, Serialize};
use tokio::fs::read_dir;

#[tauri::command]
pub async fn open_file_directory_external(dir: String) {
    let mut path = PathBuf::from(dir);
    if !path.exists() {
        return;
    }

    if path.is_file() {
        path.pop();
    }

    #[cfg(target_os = "linux")]
    {
        use std::process::Command;
        let _ = Command::new("xdg-open").arg(path).spawn();
    }

    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        let _ = Command::new("cmd")
            .args(["/C", "start", "explorer", path.as_path().to_str().unwrap()])
            .spawn();
    }
}

#[tauri::command]
pub(crate) async fn get_home_directory() -> Result<String, String> {
    match std::env::home_dir() {
        Some(dir_path) => Ok(dir_path.to_str().unwrap().to_string()),
        None => Err("Could not locate $HOME.".into()),
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub(crate) struct DirectoryListing {
    pub(crate) entries: Vec<DirectoryItem>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub(crate) enum DirectoryItemType {
    File,
    Directory,
    Other,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub(crate) struct DirectoryItem {
    pub(crate) name: String,
    pub(crate) path: String,
    pub(crate) ext: Option<String>,
    pub(crate) item_type: DirectoryItemType,
}

#[tauri::command]
pub(crate) async fn validate_directory(location: String) -> Result<String, String> {
    let path = PathBuf::from(location);

    if path.is_file() {
        return path
            .parent()
            .map(|p| p.to_string_lossy().to_string())
            .ok_or_else(|| "Could not find parent directory".to_string());
    }

    if path.is_dir() {
        return Ok(path.to_string_lossy().to_string());
    }

    Err("Path does not exist".to_string())
}

#[tauri::command]
pub(crate) async fn list_drives() -> Result<DirectoryListing, String> {
    #[cfg(target_os = "linux")]
    todo!();
    #[cfg(target_os = "windows")]
    {
        let drives = win32_get_logical_drives()
            .iter()
            .map(|drive_letter| DirectoryItem {
                name: drive_letter.clone(),
                path: drive_letter.clone(),
                item_type: DirectoryItemType::Directory,
                ext: None,
            })
            .collect::<Vec<_>>();
        let listing = DirectoryListing { entries: drives };
        Ok(listing)
    }
}

#[cfg(windows)]
fn win32_get_logical_drives() -> Vec<String> {
    let mut drive_collection: Vec<_> = vec![];
    unsafe {
        let drives_mask = windows::Win32::Storage::FileSystem::GetLogicalDrives();

        for i in 0..26 {
            if (drives_mask >> i) & 1 == 1 {
                let drive_letter = (b'A' + i as u8) as char;
                println!("{}:\\", drive_letter);
                drive_collection.push(format!("{}:\\", drive_letter));
            }
        }
    }

    drive_collection
}

#[tauri::command]
pub(crate) async fn list_directory(path: String) -> Result<DirectoryListing, String> {
    let mut path_buf = PathBuf::from(path.clone());
    if !path_buf.exists() {
        return Err(format!("{path} does not exist"));
    }

    if path_buf.is_file() {
        path_buf.pop();
    }

    let mut dir_entries = read_dir(path_buf).await.map_err(|_| "Error reading dir")?;
    let mut dir_listing = DirectoryListing { entries: vec![] };
    while let Ok(entry_result) = dir_entries.next_entry().await {
        match entry_result {
            Some(entry) => {
                let file_type = entry
                    .file_type()
                    .await
                    .map_err(|_| "Error retrieving entry type")?;

                let mut extension: Option<String> = None;
                let entry_type = if file_type.is_dir() {
                    DirectoryItemType::Directory
                } else if file_type.is_file() {
                    extension = Some(
                        entry
                            .path()
                            .extension()
                            .unwrap()
                            .to_str()
                            .unwrap()
                            .to_string(),
                    );
                    DirectoryItemType::File
                } else {
                    DirectoryItemType::Other
                };

                let entry_name = entry.file_name().to_str().unwrap().to_string();
                let entry_path = entry.path().to_str().unwrap().to_string();

                let item = DirectoryItem {
                    name: entry_name,
                    path: entry_path,
                    item_type: entry_type,
                    ext: extension,
                };
                println!("{item:?}");
                dir_listing.entries.push(item);
            }
            None => {
                break;
            }
        }
    }

    println!("{dir_listing:?}");
    Ok(dir_listing)
}

pub(crate) fn get_or_init_settings_path() -> Option<PathBuf> {
    let path = std::env::home_dir()?;

    let path = path.join(PathBuf::from(format!(".config/{}", env!("CARGO_PKG_NAME"))));
    if !path.exists() {
        let _ = create_dir_all(path.clone());
    }

    Some(path)
}

pub(crate) fn visit_dirs(
    dir: &std::path::Path,
    root: &std::path::Path,
    files: &mut Vec<crate::projects::ProjectFile>,
) -> Result<(), String> {
    if dir.is_dir() {
        for entry in std::fs::read_dir(dir).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();

            if path.is_dir() {
                // Recursively visit subdirectories
                visit_dirs(&path, root, files)?;
            } else {
                // Extract relative path
                let relative_location = path
                    .strip_prefix(root)
                    .map(|p| p.to_string_lossy().into_owned())
                    .map_err(|e| e.to_string())?;

                // Extract extension
                let extension = path
                    .extension()
                    .and_then(|ext| ext.to_str())
                    .unwrap_or("")
                    .to_string();

                files.push(crate::projects::ProjectFile::new(
                    relative_location,
                    extension,
                ));
            }
        }
    }
    Ok(())
}
