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

impl Into<Book> for ZlibMetadata {
    fn into(self) -> Book {
        let mut cover = self.cover_path;
        if !cover.is_empty() {
            cover = format!("zlib://{cover}");
        }
        Book {
            id: self.zlibrary_id,
            title: self.title,
            author: self.author,
            publisher: self.publisher,
            extension: self.extension,
            filesize: self.filesize_reported,
            language: self.language,
            year: self.year.parse().unwrap_or_default(),
            pages: self.pages.parse().unwrap_or_default(),
            isbn: self.isbns.join(","),
            ipfs_cid: String::default(),
            cover_url: cover,
            md5: self.md5_reported,
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

    for book in input {
        if let Ok(book) = book {
            if let Err(err) = writer.serialize::<Book>(book.metadata.into()) {
                println!("err: {err}");
            }
        }
    }
}
