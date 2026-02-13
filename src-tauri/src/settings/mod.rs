use std::path::PathBuf;

use serde::{Deserialize, Deserializer, Serialize, Serializer};
use serde_json::from_str;
use tauri::{AppHandle, Manager};
use tokio::sync::Mutex;

#[derive(Debug, Clone)]
pub struct Version {
    pub major: u8,
    pub minor: u8,
    pub patch: u8,
}

impl Default for Version {
    fn default() -> Self {
        let cargo_version = env!("CARGO_PKG_VERSION")
            .split(".")
            .map(|f| 
                from_str::<u8>(f).expect("Failed to convert CARGO_PKG_VERSION into Version for Default Version implementation")
            )
            .collect::<Vec<u8>>();

        Self {
            major: *cargo_version.first().expect("Expected a Major version"),
            minor: *cargo_version.get(1).expect("Expected a Minor version"),
            patch: *cargo_version.get(2).expect("Expected a Patch version"),
        }
    }
}

impl Serialize for Version {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_u32(
            (self.major as u32) | (self.minor as u32) << 8 | (self.patch as u32) << 16,
        )
    }
}

impl<'de> Deserialize<'de> for Version {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let packed = u32::deserialize(deserializer)?;
        Ok(Version {
            major: (packed & 0xFF) as u8,
            minor: ((packed >> 8) & 0xFF) as u8,
            patch: ((packed >> 16) & 0xFF) as u8,
        })
    }
}

pub struct AppSettingsState {
    pub settings: Mutex<AppSettings>,
}

const THEME_MODE_DEFAULT: &str = "system";
fn theme_mode_default() -> String {
    THEME_MODE_DEFAULT.to_owned()
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AppSettings {
    version: Version,
    #[serde(default = "theme_mode_default", rename = "themeMode")]
    theme_mode: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            version: Version::default(),
            theme_mode: "system".to_owned(),
        }
    }
}

#[tauri::command]
pub async fn get_or_init_settings(app: AppHandle) -> Result<AppSettings, String> {
    if let Some(state) = app.try_state::<AppSettingsState>() {
        let settings = state.settings.lock().await;
        return Ok(settings.clone());
    }

    let settings_dir = crate::fs::get_or_init_settings_path();
    if settings_dir.is_none() {
        return Err("No $HOME directory found.".to_string());
    }

    let settings_path = settings_dir.unwrap();
    let settings_path = settings_path.join("settings.conf.json");

    if !settings_path.exists() {
        let new_settings = AppSettings::default();

        let json = serde_json::ser::to_string_pretty(&new_settings)
            .map_err(|_| "Failed to serialize default AppSettings")?;

        tokio::fs::write(settings_path.clone(), json)
            .await
            .map_err(|_| "Failed to write default AppSettings to settings.conf.json")?;
    }

    let settings_json_string = tokio::fs::read_to_string(settings_path)
        .await
        .map_err(|_| "Failed to read settings.conf.json")?;

    let settings = serde_json::de::from_str::<AppSettings>(&settings_json_string)
        .map_err(|_| "Failed to deserialize settings.conf.json into AppSettings")?;

    Ok(settings)
}

#[tauri::command]
pub async fn sync_settings(app: AppHandle, new_settings: AppSettings) -> Result<(), String> {
    println!("{new_settings:?}");

    let settings_dir = crate::fs::get_or_init_settings_path();
    if settings_dir.is_none() {
        return Err("No $HOME directory found.".to_string());
    }

    let settings_path = settings_dir.unwrap();
    let settings_path = settings_path.join("settings.conf.json");

    let json = serde_json::ser::to_string_pretty(&new_settings)
        .map_err(|_| "Failed to serialize default AppSettings")?;

    tokio::fs::write(settings_path.clone(), json)
        .await
        .map_err(|_| "Failed to write default AppSettings to settings.conf.json")?;

    let state = app
        .try_state::<AppSettingsState>()
        .ok_or("AppSettingsState not managed by Tauri")?;

    let mut settings_lock = state.settings.lock().await;
    *settings_lock = new_settings;

    Ok(())
}
