use crate::MetaTokenStream;
use jieba_rs::{Jieba, TokenizeMode};
use tantivy::tokenizer::Token;

lazy_static::lazy_static! {
    static ref JIEBA: Jieba = jieba_rs::Jieba::new();
}

pub fn token_stream(text: &str) -> MetaTokenStream {
    let text = fast2s::convert(text);

    let mut indices = text.char_indices().collect::<Vec<_>>();
    indices.push((text.len(), '\0'));

    let origin_tokens = JIEBA.tokenize(&text, TokenizeMode::Search, false);
    let origin_tokens_len = origin_tokens.len();

    #[cfg(not(feature = "pinyin"))]
    let all_tokens_len = origin_tokens_len;

    #[cfg(feature = "pinyin")]
    use itertools::Itertools;
    #[cfg(feature = "pinyin")]
    use pinyin::ToPinyinMulti;
    #[cfg(feature = "pinyin")]
    let chars_pinyins: Vec<(usize, String)> = text
        .as_str()
        .to_pinyin_multi()
        .enumerate()
        .filter_map(|(idx, pm)| {
            pm.map(|pm| {
                pm.into_iter()
                    .map(move |p| (idx, p.plain().to_string()))
                    .unique()
            })
        })
        .flatten()
        .collect();
    #[cfg(feature = "pinyin")]
    let all_tokens_len = origin_tokens_len * 2 + chars_pinyins.len();

    let mut tokens = Vec::with_capacity(all_tokens_len);

    for (token_idx, token) in origin_tokens.iter().enumerate() {
        tokens.push(Token {
            offset_from: indices[token.start].0,
            offset_to: indices[token.end].0,
            text: token.word.to_string(),
            position: token_idx * 2 + 1,
            position_length: all_tokens_len,
        });

        #[cfg(feature = "pinyin")]
        {
            // every token, not pinyin_multi to limit the index size
            use pinyin::ToPinyin;
            let pinyin: String = token
                .word
                .to_pinyin()
                .flatten()
                .map(|p| p.plain())
                .collect();

            tokens.push(Token {
                offset_from: indices[token.start].0,
                offset_to: indices[token.end].0,
                text: pinyin,
                position: token_idx * 2 + 2,
                position_length: all_tokens_len,
            });
        }
    }

    #[cfg(feature = "pinyin")]
    {
        // every Chinese char
        chars_pinyins.into_iter().for_each(|(idx, p)| {
            tokens.push(Token {
                offset_from: indices[idx].0,
                offset_to: indices[idx + 1].0,
                text: p,
                position: origin_tokens_len * 2 + idx + 1,
                position_length: all_tokens_len,
            });
        });
    }

    MetaTokenStream { tokens, index: 0 }
}
