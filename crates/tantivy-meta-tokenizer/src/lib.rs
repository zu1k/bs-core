//! Tantivy Meta Tokenizer
//! This is copied and modified from https://github.com/jiegec/tantivy-jieba/blob/master/src/lib.rs
//! Ascii Folding before jieba tokenize.

use tantivy::tokenizer::{BoxTokenStream, Token, TokenStream, Tokenizer, RemoveLongFilter, LowerCaser, TextAnalyzer};
mod ascii_folding;

lazy_static::lazy_static! {
    static ref JIEBA: jieba_rs::Jieba = jieba_rs::Jieba::new();
}

pub const META_TOKENIZER: &str = "meta_tokenizer";

pub fn get_tokenizer() -> TextAnalyzer {
    TextAnalyzer::from(MetaTokenizer)
        .filter(RemoveLongFilter::limit(20))
        .filter(LowerCaser)
}

#[derive(Clone)]
pub struct MetaTokenizer;

pub struct MetaTokenStream {
    tokens: Vec<Token>,
    index: usize,
}

impl TokenStream for MetaTokenStream {
    fn advance(&mut self) -> bool {
        if self.index < self.tokens.len() {
            self.index = self.index + 1;
            true
        } else {
            false
        }
    }

    fn token(&self) -> &Token {
        &self.tokens[self.index - 1]
    }

    fn token_mut(&mut self) -> &mut Token {
        &mut self.tokens[self.index - 1]
    }
}

impl Tokenizer for MetaTokenizer {
    fn token_stream<'a>(&self, text: &'a str) -> BoxTokenStream<'a> {
        let mut text = text.to_string();
        if !text.is_ascii() {
            // ignore its already ascii
            ascii_folding::to_ascii(&mut text);
        }

        let mut indices = text.char_indices().collect::<Vec<_>>();
        indices.push((text.len(), '\0'));
        let orig_tokens = JIEBA.tokenize(&text, jieba_rs::TokenizeMode::Search, true);
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
        BoxTokenStream::from(MetaTokenStream { tokens, index: 0 })
    }
}
