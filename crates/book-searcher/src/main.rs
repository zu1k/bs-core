use actix_web::{
    get, http::header, middleware::Logger, web, App, HttpResponse, HttpServer, Responder,
};
use actix_web_static_files::ResourceFiles;
use book_searcher_core::{Book, Searcher};
use clap::Parser;
use log::{info, LevelFilter};
use serde::{Deserialize, Serialize};
use std::{path::PathBuf, sync::Arc};

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
        .insert_header((header::ACCESS_CONTROL_ALLOW_ORIGIN, "*"))
        .json(result);
}

#[derive(Parser)]
#[clap(author, version, about, long_about)]
struct AppOpts {
    #[clap(subcommand)]
    subcmd: SubCommand,
}

#[derive(Parser)]
enum SubCommand {
    /// run search webserver
    Run(Run),
    /// index the raw data
    Index(Index),
}

#[derive(Parser)]
struct Run {
    #[clap(
        short,
        long,
        default_value = "127.0.0.1:7070",
        help = "webserver bind address"
    )]
    bind: String,
}

#[derive(Parser)]
struct Index {
    #[clap(short, long, num_args=1.., help = "specify csv file to be indexed")]
    file: Vec<PathBuf>,
}

fn main() {
    env_logger::builder().filter_level(LevelFilter::Info).init();

    let args = AppOpts::parse();
    match args.subcmd {
        SubCommand::Run(opts) => run(opts).unwrap(),
        SubCommand::Index(opts) => index(opts),
    }
}

#[actix_web::main]
async fn run(opts: Run) -> std::io::Result<()> {
    info!("book-searcher webserver started!");

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
    .bind(opts.bind)?
    .run()
    .await
}

fn index(opts: Index) {
    let index_dir = std::env::current_exe()
        .unwrap()
        .parent()
        .unwrap()
        .join("index")
        .to_str()
        .unwrap()
        .to_string();
    let mut searcher = Searcher::new(index_dir);

    if opts.file.is_empty() {
        println!("csv file is missing!");
    } else {
        opts.file.iter().for_each(|file| searcher.index(file));
    }
}
