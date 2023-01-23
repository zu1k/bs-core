use crate::{Book, Searcher};
pub use query::SearchQuery;
use tantivy::collector::TopDocs;

mod query;

impl Searcher {
    pub fn search(&self, query: &SearchQuery, limit: usize) -> Vec<Book> {
        let Ok(reader) = self.index.reader() else {
            return vec![]
        };

        let Ok(query) = query.parse(self) else {
            return vec![]
        };

        let searcher = reader.searcher();
        let Ok(top_docs) = searcher.search(&query, &TopDocs::with_limit(limit)) else {
            return vec![];
        };

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
