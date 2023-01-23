use actix_web::{http::header, middleware::Logger, web, HttpResponse};
use book_searcher_core::{Book, Searcher};
use lambda_web::{
    actix_web::{self, get, App, HttpServer, Responder},
    is_running_on_lambda, run_actix_on_lambda, LambdaError,
};
use log::{info, LevelFilter};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

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
    #[serde(flatten)]
    query: book_searcher_core::search::SearchQuery,
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
        .insert_header((header::ACCESS_CONTROL_ALLOW_ORIGIN, "*"))
        .json(result);
}

#[tokio::main]
async fn main() -> Result<(), LambdaError> {
    env_logger::builder()
        .filter_level(LevelFilter::Error)
        .init();
    let app_state = AppState::init("/mnt/data/index");

    let factory = move || {
        App::new()
            .wrap(Logger::default())
            .app_data(web::Data::new(app_state.clone()))
            .service(search)
    };

    if is_running_on_lambda() {
        // Run on AWS Lambda
        run_actix_on_lambda(factory).await?;
    } else {
        // Local server
        HttpServer::new(factory)
            .bind("127.0.0.1:7070")?
            .run()
            .await?;
    }
    Ok(())
}
