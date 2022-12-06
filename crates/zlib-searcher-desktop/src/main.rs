#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use log::info;
use std::{error::Error, path::PathBuf};
use zlib_searcher_core::{Book, Searcher};

const VERSION: &str = env!("CARGO_PKG_VERSION");

use serde::{Deserialize, Serialize};
use tauri::State;
use tokio::sync::Mutex;

#[derive(Clone, Debug, Serialize, Deserialize)]
struct AppConfig {
    /// Index files of z-library
    pub index_dir: PathBuf,
}

fn get_dir(name: &str) -> Option<PathBuf> {
    let dir = std::env::current_exe().ok()?.parent()?.join(name);
    std::fs::create_dir_all(&dir).ok()?;
    let dir = dunce::canonicalize(dir).ok()?;
    Some(dir)
}

impl Default for AppConfig {
    fn default() -> Self {
        let index_dir = get_dir("index").unwrap_or_else(|| PathBuf::from("index"));
        Self {
            index_dir,
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

    pub fn configuration_file_path() -> Result<PathBuf, Box<dyn std::error::Error>> {
        Ok(confy::get_configuration_file_path(Self::APP_NAME, None)?)
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
    searcher: tauri::State<'_, Mutex<Searcher>>,
) -> Result<(), String> {
    let mut config = config.lock().await;

    // reload searcher if index_dir changed
    if config.index_dir != new_config.index_dir {
        info!("index_dir changed, reloading searcher");
        let mut searcher = searcher.lock().await;
        *searcher = Searcher::new(new_config.index_dir.clone());
    }

    *config = new_config;
    config.save().map_err(|e| e.to_string())?;

    info!("Config saved: {:?}", config);
    Ok(())
}

#[tauri::command]
async fn search(
    searcher: tauri::State<'_, Mutex<Searcher>>,
    query: String,
    limit: usize,
) -> Result<Vec<Book>, ()> {
    info!("Search: {}", query);
    Ok(searcher.lock().await.search(&query, limit))
}

#[tauri::command]
fn version() -> String {
    VERSION.to_string()
}

fn main() -> Result<(), Box<dyn Error>> {
    env_logger::init();

    let config = AppConfig::load()?;
    let searcher = Mutex::new(Searcher::new(&config.index_dir));
    let config = Mutex::new(config);

    info!(
        "load config from {:?}",
        AppConfig::configuration_file_path()?
    );

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
