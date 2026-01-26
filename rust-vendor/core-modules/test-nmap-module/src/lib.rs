use std::process::Command;

use dyn_rt::{
    expose,
    serde::{Deserialize, Serialize},
    utils::{Plugin, PluginBuilder},
};

#[dyn_rt::macros::plugin]
fn libmain() -> Plugin {
    PluginBuilder::new()
        .set_name("test-nmap-module")
        .set_description("A module to utilize nmap. Warning: make sure you have nmap installed and reachable by $PATH")
        .set_version(env!("CARGO_PKG_VERSION"))
        .add_commands(expose![
            nmap_check,
            nmap_run,
            nmap_version
        ])
        .build()
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "::dyn_rt::serde")]
struct NmapArguments {}

#[dyn_rt::macros::command]
fn nmap_run(arguments: NmapArguments) -> Result<(), String> {
    if !nmap_check() {
        return Err(
            "Error: nmap_check failed. Make sure you have nmap installed and is discoverable/exposed on your $PATH".to_owned(),
        );
    }

    Ok(())
}

#[dyn_rt::macros::command]
fn nmap_version() -> Result<String, String> {
    let output = Command::new("nmap")
        .arg("-v")
        .output()
        .map_err(|e| format!("Failed to execute nmap: {}", e))?;

    if output.status.success() {
        String::from_utf8(output.stdout).map_err(|e| format!("Invalid UTF-8 in stdout: {}", e))
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        Err(format!("Nmap exited with error: {}", error_msg))
    }
}

#[dyn_rt::macros::command]
fn nmap_check() -> bool {
    nmap_version().is_ok()
}

#[cfg(test)]
mod test {
    use crate::{nmap_check, nmap_version};

    #[test]
    fn nmap_check_should_be_true() {
        let result = nmap_check();
        assert!(result, "failed to find nmap under $PATH");
    }

    #[test]
    fn nmap_version_should_give_version() {
        let result = nmap_version().map_err(|e| panic!("failed to find nmap under $PATH: {e}"));
        assert!(result.is_ok());
    }
}
