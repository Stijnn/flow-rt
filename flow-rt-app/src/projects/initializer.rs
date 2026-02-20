use std::{fs, io::Write, path::PathBuf};

use crate::{
    projects::{ProjectInformation, ProjectTOMLConfiguration},
    silence,
};

impl super::NewProject {
    pub(super) fn init_at_location(&self) -> Result<&Self, String> {
        let location = PathBuf::from(self.location.clone());
        if location.exists() {
            return Err("Directory already exists".into());
        }

        if let Err(e) = fs::create_dir_all(&location) {
            return Err(format!("Failed to create directory: {e}"));
        }

        silence!(fs::create_dir(location.join("scripts")));
        silence!(fs::File::create_new(location.join("scripts").join(".keep")));

        silence!(fs::create_dir(location.join("flows")));
        silence!(fs::File::create_new(location.join("flows").join(".keep")));

        let mut ofs = fs::File::create_new(location.join("Flow.toml")).unwrap();

        silence!(ofs.write_all(
            toml::to_string_pretty(&ProjectTOMLConfiguration {
                info: ProjectInformation {
                    name: self.name.clone(),
                    description: "".to_string(),
                    version: "0.1.0".to_string(),
                },
            })
            .unwrap_or_else(|_| panic!("Failed to create project toml exiting..."))
            .as_bytes(),
        ));

        Ok(self)
    }
}
