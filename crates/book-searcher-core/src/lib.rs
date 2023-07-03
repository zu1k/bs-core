use serde::{Deserialize, Serialize};
use serde_with::{serde_as, DefaultOnError, DefaultOnNull};
use std::path::Path;
pub use tantivy::store::Compressor;
use tantivy::{
    query::QueryParser, schema::*, store::ZstdCompressor, tokenizer::TextAnalyzer, Index,
    TantivyError,
};
use tantivy_meta_tokenizer::{get_tokenizer, META_TOKENIZER};

mod always_merge_policy;
pub mod index;
pub mod search;

#[serde_as]
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct Book {
    pub id: u64,

    pub title: String,
    #[serde_as(deserialize_as = "DefaultOnNull")]
    pub author: String,
    #[serde_as(deserialize_as = "DefaultOnNull")]
    pub publisher: String,
    #[serde_as(deserialize_as = "DefaultOnNull")]
    pub extension: String,
    #[serde_as(deserialize_as = "DefaultOnError")]
    pub filesize: u64,
    #[serde_as(deserialize_as = "DefaultOnNull")]
    pub language: String,
    #[serde_as(deserialize_as = "DefaultOnError")]
    pub year: u64,
    #[serde_as(deserialize_as = "DefaultOnError")]
    pub pages: u64,
    #[serde_as(deserialize_as = "DefaultOnNull")]
    pub isbn: String,
    #[serde_as(deserialize_as = "DefaultOnNull")]
    pub ipfs_cid: String,
    #[serde_as(deserialize_as = "DefaultOnNull")]
    pub cover_url: String,
    #[serde_as(deserialize_as = "DefaultOnNull")]
    pub md5: String,
}

impl From<(&Schema, Document)> for Book {
    fn from((schema, doc): (&Schema, Document)) -> Self {
        macro_rules! get_field_text {
            ($field:expr) => {
                doc.get_first(schema.get_field($field).unwrap())
                    .unwrap()
                    .as_text()
                    .unwrap_or_default()
                    .to_owned()
            };
        }

        macro_rules! get_field_u64 {
            ($field:expr) => {
                doc.get_first(schema.get_field($field).unwrap())
                    .unwrap()
                    .as_u64()
                    .unwrap_or_default()
            };
        }

        Book {
            id: get_field_u64!("id"),
            title: get_field_text!("title"),
            author: get_field_text!("author"),
            publisher: get_field_text!("publisher"),
            extension: get_field_text!("extension"),
            filesize: get_field_u64!("filesize"),
            language: get_field_text!("language"),
            year: get_field_u64!("year"),
            pages: get_field_u64!("pages"),
            isbn: get_field_text!("isbn"),
            md5: get_field_text!("md5"),
            ipfs_cid: get_field_text!("ipfs_cid"),
            cover_url: get_field_text!("cover_url"),
        }
    }
}

#[derive(Clone)]
pub struct Searcher {
    pub compressor: Compressor,

    index: Index,
    schema: Schema,
    query_parser: QueryParser,
    tokenizer: TextAnalyzer,

    // fields
    id: Field,
    title: Field,
    author: Field,
    publisher: Field,
    extension: Field,
    filesize: Field,
    language: Field,
    year: Field,
    pages: Field,
    isbn: Field,
    md5: Field,
    ipfs_cid: Field,
    cover_url: Field,
    score_boost: Field,
}

impl Searcher {
    pub fn new(index_dir: impl AsRef<Path>) -> Self {
        let text_indexing = TextFieldIndexing::default()
            .set_tokenizer(META_TOKENIZER)
            .set_index_option(IndexRecordOption::WithFreqsAndPositions);
        let text_options = TextOptions::default()
            .set_indexing_options(text_indexing)
            .set_stored();

        let mut schema_builder = Schema::builder();
        let id = schema_builder.add_u64_field("id", INDEXED | STORED);
        let title = schema_builder.add_text_field("title", text_options.clone());
        let author = schema_builder.add_text_field("author", text_options.clone());
        let publisher = schema_builder.add_text_field("publisher", text_options);
        let extension = schema_builder.add_text_field("extension", STRING | STORED);
        let filesize = schema_builder.add_u64_field("filesize", STORED);
        let language = schema_builder.add_text_field("language", TEXT | STORED);
        let year = schema_builder.add_u64_field("year", STORED);
        let pages = schema_builder.add_u64_field("pages", STORED | FAST);
        let isbn = schema_builder.add_text_field("isbn", TEXT | STORED);
        let md5 = schema_builder.add_text_field("md5", STORED);
        let ipfs_cid = schema_builder.add_text_field("ipfs_cid", STORED);
        let cover_url = schema_builder.add_text_field("cover_url", STORED);
        let score_boost = schema_builder.add_u64_field("score_boost", FAST);
        let schema = schema_builder.build();

        // open or create index
        let index_dir = index_dir.as_ref();
        let mut index = Index::open_in_dir(index_dir).unwrap_or_else(|err| {
            if let TantivyError::OpenDirectoryError(_) | TantivyError::OpenReadError(_) = err {
                std::fs::create_dir_all(index_dir).expect("create index directory");
                Index::create_in_dir(index_dir, schema.clone()).unwrap()
            } else {
                panic!("Error opening index: {err:?}")
            }
        });

        let tokenizer = get_tokenizer();
        index
            .tokenizers()
            .register(META_TOKENIZER, tokenizer.clone());
        _ = index.set_default_multithread_executor();

        let mut query_parser = QueryParser::for_index(&index, vec![title, author, publisher, isbn]);
        query_parser.set_conjunction_by_default();

        Self {
            compressor: Compressor::Brotli,

            index,
            schema,
            query_parser,
            tokenizer,

            id,
            title,
            author,
            publisher,
            extension,
            filesize,
            language,
            year,
            pages,
            isbn,
            md5,
            ipfs_cid,
            cover_url,
            score_boost,
        }
    }

    pub fn set_compressor(&mut self, compressor: &str) {
        let compressor = match compressor {
            "none" => Compressor::None,
            "lz4" => Compressor::Lz4,
            "brotli" => Compressor::Brotli,
            "snappy" => Compressor::Snappy,
            _ => {
                if compressor.starts_with("zstd") {
                    Compressor::Zstd(ZstdCompressor::default())
                } else {
                    println!(
                        "compressor not valid: {:#?}",
                        ["none", "lz4", "brotli", "snappy", "zstd",]
                    );
                    std::process::exit(1);
                }
            }
        };

        self.index.settings_mut().docstore_compression = compressor;
    }
}
