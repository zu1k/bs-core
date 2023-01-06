use tantivy::tokenizer::{BoxTokenStream, SimpleTokenizer, Tokenizer};

lazy_static::lazy_static! {
    static ref SIMPLE: SimpleTokenizer = SimpleTokenizer;
}

pub fn token_stream<'a>(text: &'a str) -> BoxTokenStream<'a> {
    SIMPLE.token_stream(text)
}
