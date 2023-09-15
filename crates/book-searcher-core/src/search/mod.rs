use crate::{Book, Searcher};
pub use query::SearchQuery;
use tantivy::{
    collector::{Count, TopDocs},
    DocId, Score, SegmentReader,
};

mod query;

impl Searcher {
    pub fn search(&self, query: &SearchQuery, limit: usize, offset: usize) -> (Vec<Book>, usize) {
        let Ok(reader) = self.index.reader() else {
            return (vec![], 0);
        };

        let Ok(query) = query.parse(self) else {
            return (vec![], 0);
        };

        let searcher = reader.searcher();
        let count = searcher.search(&query, &Count).unwrap();

        let top_docs_by_custom_score = TopDocs::with_limit(limit).and_offset(offset).tweak_score(
            move |segment_reader: &SegmentReader| {
                let score_boost = segment_reader
                    .fast_fields()
                    .u64("score_boost")
                    .unwrap()
                    .first_or_default_col(1);

                move |doc: DocId, original_score: Score| {
                    let score_boost: u64 = score_boost.get_val(doc);
                    let score_boost = ((10 + score_boost) as Score).log10();
                    original_score * score_boost
                }
            },
        );

        let Ok(top_docs) = searcher.search(&query, &top_docs_by_custom_score) else {
            return (vec![], count);
        };

        let books = top_docs
            .iter()
            .map(|d| {
                let doc = searcher.doc(d.1).unwrap();
                let item: Book = (&self.schema, doc).into();
                item
            })
            .collect();

        (books, count)
    }
}
