use std::process::Command;

use crate::pipelines::NativeFnContext;

pub(super) fn run_nmap(context: NativeFnContext) -> Result<(), ()> {
    let arg_map = context.context.as_object();
    if arg_map.is_none() {
        return Err(());
    }

    let arg_map = arg_map.unwrap();

    let arguments = arg_map
        .get("arguments")
        .unwrap()
        .as_array()
        .unwrap()
        .iter()
        .map(|e| e.as_str().unwrap())
        .collect();

    run_nmap_elevated(arguments)
}

pub(super) fn run_nmap_elevated(arguments: Vec<&str>) -> Result<(), ()> {
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
    }

    let status = cmd.status().map_err(|_| ())?;
    if status.success() {
        Ok(())
    } else {
        Err(())
    }
}
