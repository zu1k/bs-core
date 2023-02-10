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

        let score_boost = self.score_boost;
        let top_docs_by_custom_score =
            TopDocs::with_limit(limit).tweak_score(move |segment_reader: &SegmentReader| {
                let score_boost = segment_reader.fast_fields().u64(score_boost).unwrap();

                move |doc: DocId, original_score: Score| {
                    let score_boost: u64 = score_boost.get_val(doc);
                    let score_boost = ((10 + score_boost) as Score).log10();
                    original_score * score_boost
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
