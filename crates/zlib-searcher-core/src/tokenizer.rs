use std::sync::Arc;

use cang_jie::{CangJieTokenizer, TokenizerOption};
use jieba_rs::Jieba;
use tantivy::tokenizer::{AsciiFoldingFilter, LowerCaser, RemoveLongFilter, TextAnalyzer};

pub const META_DATA_TOKENIZER: &str = "meta_data_tokenizer";

pub fn get_tokenizer() -> TextAnalyzer {
    let cangjie = CangJieTokenizer {
        worker: Arc::new(Jieba::new()),
        option: TokenizerOption::ForSearch { hmm: false },
    };
    TextAnalyzer::from(cangjie)
        .filter(RemoveLongFilter::limit(20))
        .filter(AsciiFoldingFilter)
        .filter(LowerCaser)
}
