use crate::{Book, Searcher};
use indicatif::{ProgressBar, ProgressIterator, ProgressStyle};
use std::{
    fs::File,
    io::{BufRead, BufReader},
};
use tantivy::doc;

impl Searcher {
    pub fn index(&mut self) {
        let mut writer = self.index.writer(10 * 1024 * 1024 * 1024).unwrap();

        let mut do_index = move |csv_file: &str| {
            let file = File::open(csv_file).unwrap();
            let reader = BufReader::new(file);

            let mut rdr = csv::ReaderBuilder::new()
                .has_headers(false)
                .from_reader(reader);

            let line_count = BufReader::new(File::open(csv_file).unwrap())
                .lines()
                .count();
            let style = ProgressStyle::default_bar()
                .template("[{elapsed_precise}] {bar:40.cyan/blue} {pos:>7}/{len:7} {msg}")
                .unwrap();
            let bar = ProgressBar::new(line_count as u64)
                .with_message(format!("Indexing {}", csv_file))
                .with_style(style);
            for result in rdr.deserialize::<Book>().progress_with(bar) {
                match result {
                    Ok(item) => {
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
                            self.ipfs_cid => item.ipfs_cid,
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
        };

        do_index("zlib_index_books.csv");
        do_index("libgen_index_books.csv");
    }
}

#[test]
fn test_csv_der() {
    let file = File::open("zlib_index_books.csv").unwrap();
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
