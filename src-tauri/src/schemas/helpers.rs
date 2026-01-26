use std::{io::{BufReader, Write}, path::PathBuf};

use serde::{de, ser};

use crate::schemas::helpers;

pub trait JsonFile
where
    Self: de::DeserializeOwned,
    Self: ser::Serialize
{
    fn from_json_file(path: &PathBuf) -> Result<Self, String>
    where
        Self: Sized,
    {
        helpers::impl_from_json_file::<Self>(path)
    }

    fn to_json_file(&self, path: &PathBuf) -> Result<(), String>
    where
        Self: Sized,
    {
        helpers::impl_to_json_file::<Self>(&self, path, false)
    }

    fn to_json_file_pretty(&self, path: &PathBuf) -> Result<(), String>
    where
        Self: Sized,
    {
        helpers::impl_to_json_file::<Self>(&self, path, true)
    }
}

pub(super) fn impl_from_json_file<T: serde::de::DeserializeOwned>(
    path: &PathBuf,
) -> Result<T, String> {
    if !path.exists() {
        return Err(format!("{path:?} does not exist"));
    }

    if !path.is_file() {
        return Err(format!("{path:?} is not a file"));
    }

    let f = std::fs::File::open(path).map_err(|e| "Failed to open file")?;
    let b = BufReader::new(f);

    Ok(serde_json::from_reader::<BufReader<std::fs::File>, T>(b)
        .map_err(|e| format!("Error deserializing file: {e}"))?)
}

pub(super) fn impl_to_json_file<T: serde::ser::Serialize>(
    object: &T,
    path: &PathBuf,
    pretty: bool,
) -> Result<(), String> {
    if path.exists() {
        return Err(format!("{path:?} already exists"));
    }

    let buffer = if pretty {
        serde_json::to_string_pretty(&object)
    } else {
        serde_json::to_string(&object)
    }
    .map_err(|e| format!("Failed to convert object into string. Reason: {e}"))?;

    let mut f =
        std::fs::File::create(path)
            .map_err(|e| format!("Failed to create file. Reason: {e}"))?;

    f.write_all(buffer.as_bytes())
        .map_err(|e| format!("Failed to write bytes. Reason: {e}"))?;

    Ok(())
}
