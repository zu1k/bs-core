#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use book_searcher_core::{search::SearchQuery, Book, Searcher};
use log::info;
use std::{error::Error, path::PathBuf};

const VERSION: &str = env!("CARGO_PKG_VERSION");

use serde::{Deserialize, Serialize};
use tauri::State;
use tokio::sync::Mutex;

#[non_exhaustive]
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default)]
struct AppConfig {
    pub index_dir: PathBuf,
    pub ipfs_gateways: Vec<String>,
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
            ipfs_gateways: vec![],
        }
    }
}

impl AppConfig {
    const APP_NAME: &'static str = "book-searcher-desktop";

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
    query: SearchQuery,
    limit: usize,
    offset: usize,
) -> Result<(Vec<Book>, usize), ()> {
    info!("Search: {query:?}");
    Ok(searcher.lock().await.search(&query, limit, offset))
}

#[tauri::command]
fn version() -> String {
    VERSION.to_string()
}

#[derive(Debug, Deserialize)]
pub struct CreateIndexConfig {
    pub raw_files: Vec<PathBuf>,
    pub compressor: String,
}
#[tauri::command]
async fn create_index(
    searcher: State<'_, Mutex<Searcher>>,
    create_index_config: CreateIndexConfig,
) -> Result<(), String> {
    let mut searcher = searcher.lock().await;
    let compressor = if create_index_config.compressor.is_empty() {
        "none"
    } else {
        &create_index_config.compressor
    };
    searcher.set_compressor(compressor);

    if create_index_config.raw_files.is_empty() {
        return Err("csv file is missing!".to_string());
    } else {
        create_index_config
            .raw_files
            .iter()
            .for_each(|file| searcher.index(file));
    }
    Ok(())
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
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .manage(config)
        .manage(searcher)
        .invoke_handler(tauri::generate_handler![
            version,
            search,
            get_config,
            set_config,
            create_index
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
