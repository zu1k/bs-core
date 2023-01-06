//! Tantivy Meta Tokenizer
//! This is copied and modified from https://github.com/jiegec/tantivy-jieba/blob/master/src/lib.rs

use tantivy::tokenizer::{
    AsciiFoldingFilter, BoxTokenStream, LowerCaser, RemoveLongFilter, TextAnalyzer, Token,
    TokenStream, Tokenizer,
};
mod chinese;
mod latin;
pub mod utils;

pub const META_TOKENIZER: &str = "meta_tokenizer";

pub fn get_tokenizer() -> TextAnalyzer {
    TextAnalyzer::from(MetaTokenizer)
        .filter(RemoveLongFilter::limit(20))
        .filter(AsciiFoldingFilter)
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
            self.index += 1;
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
        if text.is_empty() {
            return BoxTokenStream::from(MetaTokenStream {
                tokens: vec![],
                index: 0,
            });
        }

        if utils::is_chinese(text) {
            return chinese::token_stream(text);
        }

        return latin::token_stream(text);
    }
}
