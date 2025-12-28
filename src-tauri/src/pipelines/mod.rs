use std::{
    collections::HashMap, sync::{Arc, Mutex, OnceLock}
};

use anyhow::anyhow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::pipelines::{logging::add_log, math::impl_do_math_op, nmap::run_nmap};

mod logging;
mod nmap;
mod math;

type NativeFn = Arc<dyn Fn(NativeFnContext) -> anyhow::Result<()> + Send + Sync>;

#[derive(Clone)]
pub struct NativeFnMetaInfo {
    pub handler: NativeFn,
    pub schema: Value,
}

pub fn wrap_native_fn<T, F>(f: F) -> NativeFnMetaInfo
where
    T: serde::de::DeserializeOwned + schemars::JsonSchema + Send + Sync + 'static,
    F: Fn(T) -> anyhow::Result<()> + Send + Sync + 'static,
{
    let schema = serde_json::to_value(schemars::schema_for!(T)).unwrap();

    let handler =
        Arc::new(
            move |ctx: NativeFnContext| match serde_json::from_value::<T>(ctx.context) {
                Ok(typed_args) => f(typed_args),
                Err(e) => {
                    Err(anyhow!("Deserialization error for {}: {}", ctx.name, e))
                }
            },
        );

    NativeFnMetaInfo { handler, schema }
}

macro_rules! register_native {
    ($($name:expr => $func:ident),* $(,)?) => {
        {
            let mut map: HashMap<String, NativeFnMetaInfo> = HashMap::new();
            $(
                map.insert($name.to_string(), wrap_native_fn($func));
            )*
            map
        }
    };
}

fn impl_get_context() -> HashMap<String, NativeFnMetaInfo> {
    register_native![
        "nmap" => run_nmap,
        "log" => add_log,
        "println!" => add_log,
        "math" => impl_do_math_op,
    ]
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub(crate) struct NativeFnContext {
    name: String,
    context: Value,
}

static FUNCTION_LIBRARY: OnceLock<Mutex<HashMap<String, NativeFnMetaInfo>>> = OnceLock::new();

fn impl_get_native_fn_map(
) -> &'static std::sync::Mutex<HashMap<std::string::String, NativeFnMetaInfo>> {
    FUNCTION_LIBRARY.get_or_init(|| {
        let mut map: HashMap<String, NativeFnMetaInfo> = HashMap::new();
        impl_get_context().iter().for_each(|kv| {
            map.insert(kv.0.clone(), kv.1.clone());
        });
        Mutex::new(map)
    })
}

async fn impl_find_fn_in_registry(key: String) -> Result<NativeFn, String> {
    let registry = impl_get_native_fn_map()
        .lock()
        .map_err(|_| "Failed to lock registry")?;

    return match registry.get(&key) {
        Some(f) => Ok(f.clone().handler),
        None => Err(format!("Fn({key}) was not found")),
    };
}

async fn impl_invoke_from_registry(payload: NativeFnContext) -> anyhow::Result<()> {
    let event_name = payload.name.clone();
    match impl_find_fn_in_registry(event_name).await {
        Ok(f) => {
            let r = (f)(payload);
            match r {
                Ok(_) => Ok(()),
                Err(e) => Err(e),
            }
        }
        Err(e) => Err(anyhow!(e)),
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct AvailableNativeFunctionMetaData {
    name: String,
    schema: serde_json::Value,
}

/**
 * Get available native functions callable with ReactFlow Native Compute Node
 */
#[tauri::command]
pub(crate) async fn get_available_native_functions(
) -> Result<Vec<AvailableNativeFunctionMetaData>, String> {
    let registry = impl_get_native_fn_map()
        .lock()
        .map_err(|_| "Failed to lock registry")?;

    Ok(registry
        .iter()
        .map(|(name, ctx)| AvailableNativeFunctionMetaData {
            name: name.clone(),
            schema: ctx.schema.clone(),
        })
        .collect::<Vec<AvailableNativeFunctionMetaData>>())
}

/**
 * Invoke function from Native Compute Node
 */
#[tauri::command]
pub(crate) async fn invoke_native_fn(
    app: tauri::AppHandle,
    window: tauri::Window,
    invoke_ctx: NativeFnContext,
) -> Result<(), String> {
    let _ = impl_invoke_from_registry(invoke_ctx).await;
    Ok(())
}

#[cfg(test)]
mod pipeline_tests {
    use std::{fs::{File, create_dir, exists}, io::Write};

    use serde_json::json;
    use tauri::async_runtime::block_on;

    use crate::pipelines::{NativeFnContext, get_available_native_functions, impl_get_native_fn_map, impl_invoke_from_registry};

    #[test]
    fn get_native_fn_map_should_have_println() {
        let registry = impl_get_native_fn_map()
            .lock()
            .map_err(|_| "Could not lock registry");

        assert!(registry.is_ok(), "Registry retrieval is NOT ok!");
        if registry.is_err() {
            return;
        }

        let registry = registry.unwrap();
        let a = registry.get(&"println!".to_owned());
        assert!(
            a.is_some(),
            "Could not find println! function in native registry"
        );
    }

    #[test]
    fn get_available_native_functions_should_have_println() {
        block_on(async move {
            let available = get_available_native_functions().await;

            assert!(available.is_ok(), "Failed to retrieve function map");
            if available.is_err() {
                return;
            }

            let result = available.unwrap(); 
            assert!(
                result.iter().any(|f| f.name.eq("println!")),
                "Could not find println! function that should exist!"
            );
        });
    }

    #[test]
    fn invoke_function_that_exists_with_correct_payload_is_ok() {
        block_on(async move {
            let r = impl_invoke_from_registry(NativeFnContext {
                name: "println!".to_owned(),
                context: json!({
                    "level": "Info",
                    "message": "Hello from test!"
                }),
            }).await;
            assert!(r.is_ok(), "impl_invoke_from_registry encountered an error {}", r.unwrap_err());
        });
    }

    #[test]
    fn invoke_function_that_exists_with_incorrect_payload_is_err() {
        block_on(async move {
            let r = impl_invoke_from_registry(NativeFnContext {
                name: "println!".to_owned(),
                context: json!({
                    "level": "Info",
                }),
            }).await;
            assert!(r.is_err(), "impl_invoke_from_registry did not encounter an error when it should have encountered a deserialization error");
        });
    }

    #[test]
    fn invoke_function_that_does_not_exist() {
        block_on(async move {
            let r = impl_invoke_from_registry(NativeFnContext {
                name: "functionNameThatDoesntExist".to_owned(),
                context: json!({}),
            }).await;

            assert!(r.is_err(), "impl_invoke_from_registry did not raise an error when a function that does not exist was called");
        });
    }

    #[test]
    fn do_schema_dump() {
        block_on(async move {
            let available = get_available_native_functions().await;

            assert!(available.is_ok(), "Failed to retrieve function map");
            if available.is_err() {
                return;
            }

            if !exists(".generated").unwrap() {
                create_dir(".generated");
            }

            let available = available.unwrap();
            available.iter().for_each(|meta_data| {
                let f = File::create(format!(".generated/{}.json", meta_data.name));
                match f {
                    Ok(mut f) => {
                        let _ = f.write(
                            ::serde_json::to_string_pretty(&meta_data.schema)
                                .unwrap()
                                .as_bytes(),
                        );
                    }
                    Err(_) => todo!(),
                }
            });
        });
    }
}
