use actix_web::{
    get, http::header, middleware::Logger, web, App, HttpResponse, HttpServer, Responder,
};
use actix_web_static_files::ResourceFiles;
use log::info;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use zlib_searcher::{Book, Searcher};

include!(concat!(env!("OUT_DIR"), "/generated.rs"));

#[derive(Clone)]
struct AppState {
    searcher: Arc<Searcher>,
}

impl AppState {
    pub fn init(index_dir: &str) -> Self {
        info!("AppState init!");
        AppState {
            searcher: Arc::new(Searcher::new(index_dir)),
        }
    }
}

fn default_limit() -> usize {
    30
}

#[derive(Deserialize)]
struct SearchQuery {
    query: String,
    #[serde(default = "default_limit")]
    limit: usize,
}

#[derive(Serialize)]
struct SearchResult {
    books: Vec<Book>,
}

#[get("/search")]
async fn search(query: web::Query<SearchQuery>, state: web::Data<AppState>) -> impl Responder {
    let books = state.searcher.search(&query.query, query.limit);
    let result = SearchResult { books };

    return HttpResponse::Ok()
        .insert_header(header::ContentType::json())
        .json(result);
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    info!("zlib-searcher started!");

    let index_dir = std::env::current_exe()
        .unwrap()
        .parent()
        .unwrap()
        .join("index")
        .to_str()
        .unwrap()
        .to_string();
    let app_state = AppState::init(&index_dir);

    HttpServer::new(move || {
        let generated = generate();
        App::new()
            .wrap(Logger::default())
            .app_data(web::Data::new(app_state.clone()))
            .service(search)
            .service(ResourceFiles::new("/", generated))
    })
    .bind(("127.0.0.1", 7070))?
    .run()
    .await
}
