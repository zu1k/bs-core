#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::error::Error;
use zlib_searcher_core::{Book, Searcher};

const VERSION: &str = env!("CARGO_PKG_VERSION");

use serde::{Deserialize, Serialize};
use tauri::State;
use tokio::sync::Mutex;

#[derive(Clone, Debug, Serialize, Deserialize)]
struct AppConfig {
    /// Index files of z-library
    pub index_dir: String,
    /// IPFS daemon RPC address
    pub ipfs_api_url: String,
    /// Where to store downloaded files
    pub download_path: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        let index_dir = std::env::current_exe()
            .unwrap()
            .parent()
            .unwrap()
            .join("index")
            .to_str()
            .unwrap()
            .to_string();
        Self {
            index_dir,
            ipfs_api_url: "http://localhost:5001".to_string(),
            download_path: "./".to_string(),
        }
    }
}

impl AppConfig {
    const APP_NAME: &'static str = "zlib-searcher-desktop";

    pub fn load() -> Result<Self, Box<dyn std::error::Error>> {
        let config = confy::load(Self::APP_NAME, None)?;
        Ok(config)
    }

    pub fn save(&self) -> Result<(), Box<dyn std::error::Error>> {
        confy::store(Self::APP_NAME, None, self)?;
        Ok(())
    }
}

#[tauri::command]
async fn get_config(config: State<'_, Mutex<AppConfig>>) -> Result<AppConfig, String> {
    Ok(config.lock().await.clone())
}

#[tauri::command]
async fn set_config(
    new_config: AppConfig,
    config: State<'_, Mutex<AppConfig>>,
) -> Result<(), String> {
    let mut config = config.lock().await;
    *config = new_config;
    config.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn search(
    searcher: tauri::State<'_, Mutex<Searcher>>,
    query: String,
    limit: usize,
) -> Result<Vec<Book>, ()> {
    Ok(searcher.lock().await.search(&query, limit))
}

#[tauri::command]
fn version() -> String {
    VERSION.to_string()
}

fn main() -> Result<(), Box<dyn Error>> {
    let config = AppConfig::load()?;
    let searcher = Mutex::new(Searcher::new(&config.index_dir));
    let config = Mutex::new(config);

    tauri::Builder::default()
        .manage(config)
        .manage(searcher)
        .invoke_handler(tauri::generate_handler![
            version, search, get_config, set_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
