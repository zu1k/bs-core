//! Tantivy Meta Tokenizer
//! This is copied and modified from https://github.com/jiegec/tantivy-jieba/blob/master/src/lib.rs

use stop_word::STOP_WORDS;
use tantivy::tokenizer::{
    BoxTokenStream, LowerCaser, RemoveLongFilter, SimpleTokenizer, StopWordFilter, TextAnalyzer,
    Token, TokenStream, Tokenizer,
};
mod chinese;
mod stop_word;
pub mod utils;

pub const META_TOKENIZER: &str = "meta_tokenizer";

pub fn get_tokenizer() -> TextAnalyzer {
    TextAnalyzer::builder(MetaTokenizer {
        latin: SimpleTokenizer::default(),
    })
    .filter(RemoveLongFilter::limit(20))
    // .filter(AsciiFoldingFilter) // spammy search results
    .filter(StopWordFilter::remove(
        STOP_WORDS.iter().map(|&word| word.to_owned()),
    ))
    .filter(LowerCaser)
    .build()
}

#[derive(Clone)]
pub struct MetaTokenizer {
    latin: SimpleTokenizer,
}

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
    type TokenStream<'a> = BoxTokenStream<'a>;

    fn token_stream<'a>(&'a mut self, text: &'a str) -> BoxTokenStream<'a> {
        if text.is_empty() {
            return BoxTokenStream::new(MetaTokenStream {
                tokens: vec![],
                index: 0,
            });
        }

        if utils::is_chinese(text) {
            return BoxTokenStream::new(chinese::token_stream(text));
        }

        return BoxTokenStream::new(self.latin.token_stream(text));
    }
}
