use cang_jie::{CangJieTokenizer, TokenizerOption, CANG_JIE};
use jieba_rs::Jieba;
use std::{fs::File, io::BufReader, sync::Arc};
use zlib_searcher::Book;

#[macro_use]
extern crate tantivy;
use tantivy::{schema::*, Index, store::Compressor};

fn main() {
    let text_indexing = TextFieldIndexing::default()
        .set_tokenizer(CANG_JIE)
        .set_index_option(IndexRecordOption::WithFreqsAndPositions);
    let text_options = TextOptions::default()
        .set_indexing_options(text_indexing)
        .set_stored();

    let mut schema_builder = Schema::builder();

    let id = schema_builder.add_u64_field("id", INDEXED | STORED);
    let title = schema_builder.add_text_field("title", text_options.clone());
    let author = schema_builder.add_text_field("author", text_options.clone());
    let publisher = schema_builder.add_text_field("publisher", text_options.clone());
    let extension = schema_builder.add_text_field("extension", STRING | STORED);
    let filesize = schema_builder.add_u64_field("filesize", STORED);
    let language = schema_builder.add_text_field("language", TEXT | STORED);
    let year = schema_builder.add_u64_field("year", STORED);
    let pages = schema_builder.add_u64_field("pages", STORED);
    let isbn = schema_builder.add_text_field("isbn", TEXT | STORED);
    let ipfs_cid = schema_builder.add_text_field("ipfs_cid", STORED);

    let schema = schema_builder.build();

    // index
    let mut index = Index::create_in_dir("index", schema.clone()).unwrap();
    index.settings_mut().docstore_compression = Compressor::Brotli; // size: 2.1G, size is best
    // index.settings_mut().docstore_compression = Compressor::Lz4; // size: 3.1G, speed is best
    // index.settings_mut().docstore_compression = Compressor::Zstd; // size: 2.7G
    // index.settings_mut().docstore_compression = Compressor::Snappy; // size: 3.2G

    let tokenizer = CangJieTokenizer {
        worker: Arc::new(Jieba::new()),
        option: TokenizerOption::Unicode,
    };
    index.tokenizers().register(CANG_JIE, tokenizer);

    let mut writer = index.writer(10 * 1024 * 1024 * 1024).unwrap();

    let mut do_index = move |csv_file: &str| {
        let file = File::open(csv_file).unwrap();
        let reader = BufReader::new(file);

        let mut rdr = csv::ReaderBuilder::new()
            .has_headers(false)
            .from_reader(reader);

        for result in rdr.deserialize::<Book>() {
            match result {
                Ok(item) => {
                    if let Err(err) = writer.add_document(doc!(
                        id => item.id,
                        title => item.title,
                        author => item.author,
                        publisher => item.publisher,
                        extension => item.extension,
                        filesize => item.filesize,
                        language => item.language,
                        year => item.year,
                        pages => item.pages,
                        isbn => item.isbn,
                        ipfs_cid => item.ipfs_cid,
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
