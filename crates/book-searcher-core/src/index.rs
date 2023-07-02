use crate::{always_merge_policy::AlwaysMergePolicy, Book, Searcher};
use indicatif::{ProgressBar, ProgressIterator, ProgressStyle};
use log::info;
use std::{
    fs::File,
    io::{BufRead, BufReader},
    path::Path,
};
use sysinfo::{System, SystemExt};
use tantivy::doc;

fn get_memory_arena_num_bytes() -> usize {
    let sys = System::new_all();
    let available_memory = sys.available_memory() as usize;
    let cpu_num = sys.cpus().len();
    info!("Your system has cpu {cpu_num} cores and {available_memory} Bytes available");

    let chunk_size = 1024 * 1024 * 1024; // 1GB
    let total_num_chunk = available_memory / chunk_size;

    let s = if total_num_chunk < 2 {
        // <2G
        available_memory - 100 * 1024 * 1024 // available_memory-100MB
    } else {
        // >2G
        available_memory * (total_num_chunk - 1) // available_memory-1GB
    };

    let num_threads = std::cmp::min(cpu_num, 8);
    let s = std::cmp::min(s, num_threads * 4293967294);

    info!("Using {num_threads} threads and {s} Bytes to do index");
    s
}

impl Searcher {
    pub fn index(&mut self, csv_file: impl AsRef<Path>) {
        let mut writer = self.index.writer(get_memory_arena_num_bytes()).unwrap();
        writer.set_merge_policy(Box::new(AlwaysMergePolicy));

        let file = File::open(&csv_file).unwrap();
        let reader = BufReader::new(file);

        let mut rdr = csv::ReaderBuilder::new()
            .has_headers(false)
            .from_reader(reader);

        let line_count = BufReader::new(File::open(&csv_file).unwrap())
            .lines()
            .count();

        let style = ProgressStyle::default_bar()
            .template("[{elapsed_precise}] {bar:40.cyan/blue} {pos:>7}/{len:7} {msg}")
            .unwrap();
        let bar = ProgressBar::new(line_count as u64)
            .with_message(format!("Indexing {}", csv_file.as_ref().to_str().unwrap()))
            .with_style(style);

        for result in rdr.deserialize::<Book>().progress_with(bar) {
            match result {
                Ok(item) => {
                    if skip_this_book(&item) {
                        continue;
                    }

                    let score_boost = get_book_score_boost(&item);
                    if let Err(err) = writer.add_document(doc!(
                        self.id => item.id,
                        self.title => item.title,
                        self.author => item.author,
                        self.publisher => item.publisher,
                        self.extension => item.extension,
                        self.filesize => item.filesize,
                        self.language => item.language,
                        self.year => item.year,
                        self.pages => item.pages,
                        self.isbn => item.isbn,
                        self.md5 => item.md5,
                        self.ipfs_cid => item.ipfs_cid,
                        self.cover_url => item.cover_url,
                        self.score_boost => score_boost,
                    )) {
                        println!("{err}");
                    }
                }
                Err(err) => {
                    println!("{err}");
                }
            }
        }

        writer.commit().unwrap();
        writer.wait_merging_threads().expect("merge complete");
    }

    pub fn index_background(&mut self, csv_file: impl AsRef<Path>) -> ProgressBar {
        let searcher = self.to_owned();

        let mut writer = self.index.writer(get_memory_arena_num_bytes()).unwrap();

        let file = File::open(&csv_file).unwrap();
        let reader = BufReader::new(file);

        let mut rdr = csv::ReaderBuilder::new()
            .has_headers(false)
            .from_reader(reader);

        let line_count = BufReader::new(File::open(&csv_file).unwrap())
            .lines()
            .count();

        let style = ProgressStyle::default_bar()
            .template("[{elapsed_precise}] {bar:40.cyan/blue} {pos:>7}/{len:7} {msg}")
            .unwrap();
        let bar = ProgressBar::new(line_count as u64)
            .with_message(format!("Indexing {}", csv_file.as_ref().to_str().unwrap()))
            .with_style(style);

        let bar_background = bar.clone();
        std::thread::spawn(move || {
            for result in rdr.deserialize::<Book>().progress_with(bar_background) {
                match result {
                    Ok(item) => {
                        if skip_this_book(&item) {
                            continue;
                        }

                        let score_boost = get_book_score_boost(&item);
                        if let Err(err) = writer.add_document(doc!(
                            searcher.id => item.id,
                            searcher.title => item.title,
                            searcher.author => item.author,
                            searcher.publisher => item.publisher,
                            searcher.extension => item.extension,
                            searcher.filesize => item.filesize,
                            searcher.language => item.language,
                            searcher.year => item.year,
                            searcher.pages => item.pages,
                            searcher.isbn => item.isbn,
                            searcher.md5 => item.md5,
                            searcher.ipfs_cid => item.ipfs_cid,
                            searcher.cover_url => item.cover_url,
                            searcher.score_boost => score_boost,
                        )) {
                            println!("{err}");
                        }
                    }
                    Err(err) => {
                        println!("{err}");
                    }
                }
            }

            writer.commit().unwrap();
            writer.wait_merging_threads().expect("merge complete");
        });

        bar
    }
}

// score = origin_score * (10 + score_boost).log10()
// so score_boost should less than 90
fn get_book_score_boost(book: &Book) -> u64 {
    let mut score_boost: u64 = 0;
    if !book.author.is_empty() {
        score_boost += 10;
        if book.author.contains("ePUBw") || book.author.contains("chenjin5") {
            score_boost -= 10;
        }
    }
    if !book.publisher.is_empty() {
        score_boost += 5;
        if book.publisher.contains("出版") {
            score_boost += 30;
            if book.publisher.contains('_') {
                score_boost -= 10;
            }
        } else if book.publisher.contains("cj5")
            || book.publisher.contains("chenjin5")
            || book.publisher.contains("epub")
            || book.publisher.contains("电子书")
            || book.publisher.contains("微信")
        {
            score_boost -= 10;
        }
    }
    if book.language.to_lowercase().trim() != "other" {
        score_boost += 10;
    }
    if book.year > 0 {
        score_boost += 5;
    }
    if book.pages > 0 {
        score_boost += 15;
    }

    if !book.cover_url.is_empty() {
        score_boost += 30;
    }

    score_boost
}

fn skip_this_book(book: &Book) -> bool {
    book.ipfs_cid.is_empty()
        || book.title.contains("b~c@x！%b……x￥b")
        || book.author.contains("b~c@x！%b……x￥b")
}

#[test]
fn test_csv_der() {
    let file = File::open("books.csv").unwrap();
    let reader = BufReader::new(file);

    let mut rdr = csv::ReaderBuilder::new()
        .has_headers(false)
        .from_reader(reader);
    for result in rdr.records() {
        if let Err(err) = result {
            println!("{err:?}");
            break;
        }
    }
    println!("{:?}", rdr.position());
}
