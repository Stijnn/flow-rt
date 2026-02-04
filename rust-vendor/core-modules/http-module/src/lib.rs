use std::{str::FromStr, sync::OnceLock, time::Duration};

use dyn_rt::{
    expose, serde::{Deserialize, Serialize}, serde_json, utils::{Plugin, PluginBuilder}
};
use reqwest::{Client, Method};

static HTTP_CLIENT: OnceLock<Client> = OnceLock::new();

#[dyn_rt::macros::plugin]
fn libmain() -> Plugin {
    PluginBuilder::new()
        .set_name("http-module")
        .set_description("A module for interfacing with the web, build on the Rust Reqwest crate.")
        .set_version(env!("CARGO_PKG_VERSION"))
        .add_commands(expose![fetch])
        .build()
}

pub fn get_client() -> &'static Client {
    HTTP_CLIENT.get_or_init(|| {
        Client::builder()
            .build()
            .unwrap()
    })
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "::dyn_rt::serde")]
#[dyn_rt::macros::reflect]
struct FetchRequest {
    method: String,
    timeout: Option<u64>,
}

#[dyn_rt::macros::command]
async fn fetch(url: String, properties: FetchRequest) -> Result<serde_json::Value, ()>
{
    let method = Method::from_str(&properties.method);
    if method.is_err() {
        // Invalid HTTP fetch method;
        return Err(());
    }

    let method = method.unwrap();

    let client = get_client();
    let mut req = client.request(method, url);

    if let Some(timeout) = properties.timeout {
        req = req.timeout(Duration::from_millis(timeout));
    }

    let req = req.build();
    if let Err(e) = req {
        // Something went wrong building the request;
        return Err(());
    }

    let req = req.unwrap();
    let res = client.execute(req).await;

    if let Err(e) = res {
        // Another error TODO: Catch and return
        return Err(());
    }

    let res = res.unwrap();
    let obj = res.json().await;
    if let Err(e) = obj {
        // Deserialize issue
        return Err(());
    }

    Ok(obj.unwrap())
}
