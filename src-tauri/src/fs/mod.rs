use std::{fs::create_dir_all, path::PathBuf};

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
        let _ = Command::new("start").arg(format!("\"{path}\"")).spawn();
    }
}

pub(crate) fn get_or_init_settings_path() -> Option<PathBuf> {
    let path = std::env::home_dir()?;

    let path = path.join(PathBuf::from(format!(".config/{}", env!("CARGO_PKG_NAME"))));
    if !path.exists() {
        let _ = create_dir_all(path.clone());
    }

    Some(path)
}
