use tantivy::tokenizer::{BoxTokenStream, SimpleTokenizer, Tokenizer};

lazy_static::lazy_static! {
    static ref SIMPLE: SimpleTokenizer = SimpleTokenizer;
}

pub fn token_stream(text: &str) -> BoxTokenStream {
    SIMPLE.token_stream(text)
}
