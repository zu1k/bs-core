use crate::{Book, Searcher};
use tantivy::{collector::TopDocs, query::QueryParser};

impl Searcher {
    pub fn search(&self, query: &str, limit: usize) -> Vec<Book> {
        let reader = self.index.reader().unwrap();
        let searcher = reader.searcher();

        let mut query_parser = QueryParser::for_index(
            &self.index,
            vec![self.title, self.author, self.publisher, self.isbn],
        );
        query_parser.set_conjunction_by_default();
        let Ok(query) = query_parser.parse_query(query) else {
            return vec![]
        };

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
