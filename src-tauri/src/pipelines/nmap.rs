use std::process::Command;

use anyhow::{Ok, anyhow};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, JsonSchema)]
pub(crate) struct NmapArguments {
    arguments: Vec<String>,
}

pub(super) fn run_nmap(context: NmapArguments) -> anyhow::Result<()> {
    let _r = run_nmap_elevated(context.arguments);
    Ok(())
}

pub(super) fn run_nmap_elevated(arguments: Vec<String>) -> anyhow::Result<()> {
    let mut cmd = Command::new("nmap");
    
    #[cfg(target_os = "linux")]
    let mut cmd = Command::new("pkexec");

    #[cfg(target_os = "macos")]
    let mut cmd = Command::new("osascript");

    if cfg!(target_os = "linux") {
        cmd.arg("nmap").args(arguments);
    } else if cfg!(target_os = "macos") {
        // macOS requires the whole command as a single string string
        let full_cmd = format!("nmap {}", arguments.join(" "));
        cmd.args(&[
            "-e",
            &format!(
                "do shell script \"{}\" with administrator privileges",
                full_cmd
            ),
        ]);
    } else if cfg!(target_os = "windows") {
        cmd.args(arguments);
    }

    let status = cmd.status().map_err(|_| ()).unwrap();
    if status.success() {
        Ok(())
    } else {
        Err(anyhow!("ExitStatus is not success"))
    }
}
