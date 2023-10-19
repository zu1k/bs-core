use actix_web::{
    get, http::header, middleware::Logger, web, App, HttpResponse, HttpServer, Responder,
};
use actix_web_static_files::ResourceFiles;
use book_searcher_core::{Book, Searcher};
use clap::Parser;
use log::info;
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
    #[serde(flatten)]
    query: book_searcher_core::search::SearchQuery,
    #[serde(default = "default_limit")]
    limit: usize,
    #[serde(default)]
    offset: usize,
}

#[derive(Serialize)]
struct SearchResult {
    total: usize,
    offset: usize,
    limit: usize,
    books: Vec<Book>,
}

#[get("/search")]
async fn search(query: web::Query<SearchQuery>, state: web::Data<AppState>) -> impl Responder {
    let (books, count) = state
        .searcher
        .search(&query.query, query.limit, query.offset);
    let result = SearchResult {
        total: count,
        offset: query.offset,
        limit: query.limit,
        books,
    };

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

    #[clap(
        short,
        long,
        default_value = "none",
        help = "specify index compressor: none, lz4, zstd"
    )]
    compressor: String,
}

fn main() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    let args = AppOpts::parse();
    match args.subcmd {
        SubCommand::Run(opts) => run(opts).unwrap(),
        SubCommand::Index(opts) => index(opts),
    }
}

#[actix_web::main]
async fn run(opts: Run) -> std::io::Result<()> {
    info!("Webserver started: http://{}", opts.bind);

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
    searcher.set_compressor(&opts.compressor);

    if opts.file.is_empty() {
        println!("csv file is missing!");
    } else {
        opts.file.iter().for_each(|file| searcher.index(file));
    }
}
