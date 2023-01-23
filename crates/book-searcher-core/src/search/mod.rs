use crate::{Book, Searcher};
pub use query::SearchQuery;
use tantivy::{collector::TopDocs, DocId, Score, SegmentReader};

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

        let publisher_exist = self.publisher_exist;
        let pages = self.pages;
        let top_docs_by_custom_score =
            TopDocs::with_limit(limit).tweak_score(move |segment_reader: &SegmentReader| {
                let pages_reader = segment_reader.fast_fields().u64(pages).unwrap();
                let publisher_exist_reader =
                    segment_reader.fast_fields().bool(publisher_exist).unwrap();

                move |doc: DocId, original_score: Score| {
                    let mut score = original_score;
                    let pages: u64 = pages_reader.get_val(doc);
                    if pages > 0 {
                        score += 1.0;
                    }

                    let publisher_exist: bool = publisher_exist_reader.get_val(doc);
                    if publisher_exist {
                        score += 1.0;
                    }

                    score
                }
            });

        let Ok(top_docs) = searcher.search(&query, &top_docs_by_custom_score) else {
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
