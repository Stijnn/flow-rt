use serde::Deserialize;
use std::{
    fmt::Display,
    time::{SystemTime, UNIX_EPOCH},
};

#[derive(Deserialize, schemars::JsonSchema)]
pub(crate) enum LogLevel {
    Verbose = 0,
    Info = 1,
    Error = 2,
    Warning = 3,
}

impl Display for LogLevel {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let label = match self {
            LogLevel::Verbose => "VERBOSE",
            LogLevel::Info => "INFO",
            LogLevel::Error => "ERROR",
            LogLevel::Warning => "WARNING",
        };
        write!(f, "{}", label)
    }
}

#[derive(Deserialize, schemars::JsonSchema)]
pub(crate) struct LogArguments {
    level: LogLevel,
    message: String,
    with_time: Option<bool>,
}

const WITH_TIME_DEFAULT: bool = false;

pub(crate) fn add_log(args: LogArguments) -> anyhow::Result<()> {
    let timestamp = if args.with_time.unwrap_or(WITH_TIME_DEFAULT) {
        let n = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|_| ()).unwrap()
            .as_secs();
        format!("[{}]", n)
    } else {
        "".to_string()
    };

    println!("{}[{}] {}", timestamp, args.level, args.message);

    Ok(())
}
