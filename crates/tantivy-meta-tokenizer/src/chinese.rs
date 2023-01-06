use jieba_rs::{Jieba, TokenizeMode};
use tantivy::tokenizer::{BoxTokenStream, Token};

use crate::MetaTokenStream;

lazy_static::lazy_static! {
    static ref JIEBA: Jieba = jieba_rs::Jieba::new();
}

pub fn token_stream(text: &str) -> BoxTokenStream {
    let text = fast2s::convert(text);

    let mut indices = text.char_indices().collect::<Vec<_>>();
    indices.push((text.len(), '\0'));

    let origin_tokens = JIEBA.tokenize(&text, TokenizeMode::Search, false);
    let origin_tokens_len = origin_tokens.len();
    let mut tokens = Vec::new();

    for (token_idx, token) in origin_tokens.iter().enumerate() {
        tokens.push(Token {
            offset_from: indices[token.start].0,
            offset_to: indices[token.end].0,
            text: String::from(&text[(indices[token.start].0)..(indices[token.end].0)]),
            position: token_idx + 1,
            position_length: origin_tokens_len,
        });
    }

    BoxTokenStream::from(MetaTokenStream { tokens, index: 0 })
}
