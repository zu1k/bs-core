use tantivy::tokenizer::{BoxTokenStream, Token};

use crate::MetaTokenStream;

lazy_static::lazy_static! {
    static ref JIEBA: jieba_rs::Jieba = jieba_rs::Jieba::new();
}

pub fn token_stream(text: &str) -> BoxTokenStream {
    let mut indices = text.char_indices().collect::<Vec<_>>();
    indices.push((text.len(), '\0'));
    let orig_tokens = JIEBA.tokenize(text, jieba_rs::TokenizeMode::Search, false);
    let mut tokens = Vec::new();
    for token in &orig_tokens {
        tokens.push(Token {
            offset_from: indices[token.start].0,
            offset_to: indices[token.end].0,
            position: token.start,
            text: String::from(&text[(indices[token.start].0)..(indices[token.end].0)]),
            position_length: token.end - token.start,
        });
    }
    BoxTokenStream::from(MetaTokenStream { tokens, index: 0 })
}
