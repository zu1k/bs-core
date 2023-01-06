use tantivy::tokenizer::{BoxTokenStream, Token};

use crate::MetaTokenStream;

lazy_static::lazy_static! {
    static ref JIEBA: jieba_rs::Jieba = jieba_rs::Jieba::new();
}

pub fn token_stream<'a>(text: &'a str) -> BoxTokenStream<'a> {
    let mut indices = text.char_indices().collect::<Vec<_>>();
    indices.push((text.len(), '\0'));
    let orig_tokens = JIEBA.tokenize(text, jieba_rs::TokenizeMode::Search, false);
    let mut tokens = Vec::new();
    for i in 0..orig_tokens.len() {
        let token = &orig_tokens[i];
        tokens.push(Token {
            offset_from: indices[token.start].0,
            offset_to: indices[token.end].0,
            position: token.start,
            text: String::from(&text[(indices[token.start].0)..(indices[token.end].0)]),
            position_length: token.end - token.start,
        });
    }
    return BoxTokenStream::from(MetaTokenStream { tokens, index: 0 });
}
