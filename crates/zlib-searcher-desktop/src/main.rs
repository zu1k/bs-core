#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::Arc;
use zlib_searcher_core::{Book, Searcher};

const VERSION: &str = env!("CARGO_PKG_VERSION");

struct AppState {
    searcher: Arc<Searcher>,
}

impl AppState {
    fn new() -> Self {
        let index_dir = std::env::current_exe()
            .unwrap()
            .parent()
            .unwrap()
            .join("index")
            .to_str()
            .unwrap()
            .to_string();
        AppState {
            searcher: Arc::new(Searcher::new(&index_dir)),
        }
    }
}

#[tauri::command]
fn search(state: tauri::State<AppState>, query: String, limit: usize) -> Vec<Book> {
    let searcher = state.searcher.clone();
    searcher.search(&query, limit)
}

#[tauri::command]
fn version() -> String {
    VERSION.to_string()
}

fn main() {
    let state = AppState::new();

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![version, search])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
