use book_searcher_core::Book;
use serde::{Deserialize, Serialize};
use serde_jsonlines::json_lines;
use std::process::exit;

#[derive(Debug, Deserialize, Eq, PartialEq, Serialize)]
pub struct AABook {
    pub aacid: String,
    pub metadata: ZlibMetadata,
}

#[derive(Debug, Deserialize, Eq, PartialEq, Serialize)]
pub struct ZlibMetadata {
    pub zlibrary_id: u64,
    pub date_added: String,
    pub date_modified: String,
    pub extension: String,
    pub filesize_reported: u64,
    pub md5_reported: String,
    pub title: String,
    pub author: String,
    pub publisher: String,
    pub language: String,
    pub series: String,
    pub volume: String,
    pub edition: String,
    pub year: String,
    pub pages: String,
    pub description: String,
    pub cover_path: String,
    pub isbns: Vec<String>,
    pub category_id: String,
}

impl From<ZlibMetadata> for Book {
    fn from(val: ZlibMetadata) -> Self {
        let mut cover = val.cover_path;
        if !cover.is_empty() {
            cover = format!("zlib://{cover}");
        }
        Book {
            id: val.zlibrary_id,
            title: val.title,
            author: val.author,
            publisher: val.publisher,
            extension: val.extension,
            filesize: val.filesize_reported,
            language: val.language,
            year: val.year.parse().unwrap_or_default(),
            pages: val.pages.parse().unwrap_or_default(),
            isbn: val.isbns.join(","),
            ipfs_cid: String::default(),
            cover_url: cover,
            md5: val.md5_reported,
        }
    }
}

fn main() {
    let args: Vec<String> = std::env::args().collect();

    if args.len() < 3 {
        println!("Usage: jsonl2csv input.jsonl output.csv");
        exit(1);
    }

    let input = json_lines::<AABook, _>(args[1].as_str()).unwrap();
    let mut writer = csv::Writer::from_path(args[2].as_str()).unwrap();

    for book in input.flatten() {
        if let Err(err) = writer.serialize::<Book>(book.metadata.into()) {
            println!("err: {err}");
        }
    }
}
