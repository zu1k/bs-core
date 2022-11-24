use cang_jie::{CangJieTokenizer, TokenizerOption, CANG_JIE};
use jieba_rs::Jieba;
use serde::{Deserialize, Serialize};
use serde_with::{serde_as, DefaultOnError, DefaultOnNull};
use std::sync::Arc;
use tantivy::{collector::TopDocs, query::QueryParser, schema::*, Index};

#[serde_as]
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct Book {
    zlib_id: u64,

    title: String,
    #[serde_as(deserialize_as = "DefaultOnNull")]
    author: String,
    #[serde_as(deserialize_as = "DefaultOnNull")]
    publisher: String,
    extension: String,
    filesize: u64,
    #[serde_as(deserialize_as = "DefaultOnNull")]
    language: String,
    #[serde_as(deserialize_as = "DefaultOnError")]
    year: u64,
    #[serde_as(deserialize_as = "DefaultOnError")]
    pages: u64,
    #[serde_as(deserialize_as = "DefaultOnNull")]
    description: String,
    #[serde_as(deserialize_as = "DefaultOnNull")]
    isbn: String,
    ipfs_cid: String,
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
            zlib_id: get_field_u64!("zlib_id"),
            title: get_field_text!("title"),
            author: get_field_text!("author"),
            publisher: get_field_text!("publisher"),
            extension: get_field_text!("extension"),
            filesize: get_field_u64!("filesize"),
            language: get_field_text!("language"),
            year: get_field_u64!("year"),
            pages: get_field_u64!("pages"),
            description: get_field_text!("description"),
            isbn: get_field_text!("isbn"),
            ipfs_cid: get_field_text!("ipfs_cid"),
        }
    }
}

pub struct Searcher {
    index: Index,
    schema: Schema,

    // fields
    zlib_id: Field,
    title: Field,
    author: Field,
    publisher: Field,
    extension: Field,
    filesize: Field,
    language: Field,
    year: Field,
    pages: Field,
    description: Field,
    isbn: Field,
    ipfs_cid: Field,
}

impl Searcher {
    pub fn new(index_dir: &str) -> Self {
        let index = Index::open_in_dir(index_dir).unwrap();
        let tokenizer = CangJieTokenizer {
            worker: Arc::new(Jieba::new()),
            option: TokenizerOption::Unicode,
        };
        index.tokenizers().register(CANG_JIE, tokenizer);

        let text_indexing = TextFieldIndexing::default()
            .set_tokenizer(CANG_JIE)
            .set_index_option(IndexRecordOption::WithFreqsAndPositions);
        let text_options = TextOptions::default()
            .set_indexing_options(text_indexing)
            .set_stored();

        let mut schema_builder = Schema::builder();
        let zlib_id = schema_builder.add_u64_field("zlib_id", STORED);
        let title = schema_builder.add_text_field("title", text_options.clone());
        let author = schema_builder.add_text_field("author", text_options.clone());
        let publisher = schema_builder.add_text_field("publisher", text_options.clone());
        let extension = schema_builder.add_text_field("extension", STORED);
        let filesize = schema_builder.add_u64_field("filesize", STORED);
        let language = schema_builder.add_text_field("language", STORED);
        let year = schema_builder.add_u64_field("year", STORED);
        let pages = schema_builder.add_u64_field("pages", STORED);
        let description = schema_builder.add_text_field("description", STORED);
        let isbn = schema_builder.add_text_field("isbn", STRING | STORED);
        let ipfs_cid = schema_builder.add_text_field("ipfs_cid", STORED);
        let schema = schema_builder.build();

        Self {
            index,
            schema,
            zlib_id,
            title,
            author,
            publisher,
            extension,
            filesize,
            language,
            year,
            pages,
            description,
            isbn,
            ipfs_cid,
        }
    }

    pub fn search(&self, query: &str, limit: usize) -> Vec<Book> {
        let reader = self.index.reader().unwrap();
        let searcher = reader.searcher();

        let query_parser = QueryParser::for_index(
            &self.index,
            vec![
                self.title.clone(),
                self.author.clone(),
                self.publisher.clone(),
                self.isbn.clone(),
            ],
        );
        let query = query_parser.parse_query(query).unwrap();

        let top_docs = searcher
            .search(&query, &TopDocs::with_limit(limit))
            .unwrap();

        top_docs
            .iter()
            .map(|d| {
                let doc = searcher.doc(d.1).unwrap();
                let item: Book = (&self.schema, doc).into();
                item
            })
            .collect()
    }
}
