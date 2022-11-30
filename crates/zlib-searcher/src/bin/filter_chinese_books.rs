use std::{fs::File, io::BufReader};
use zlib_searcher_core::Book;

fn main() {
    let mut writer = csv::Writer::from_path("zlib_libgen_chinese_books.csv").unwrap();

    let mut filter_csv = |path: &str| {
        let file = File::open(path).unwrap();
        let reader = BufReader::new(file);

        let mut rdr = csv::ReaderBuilder::new()
            .has_headers(false)
            .from_reader(reader);
        for result in rdr.deserialize::<Book>() {
            match result {
                Ok(ref book) => {
                    if is_chinese_title(book) {
                        if let Err(err) = writer.serialize(book) {
                            println!("err: {err}");
                        }
                    }
                }
                Err(err) => {
                    println!("{err}");
                }
            }
        }
        println!("{:?}", rdr.position());
    };

    filter_csv("zlib_index_books.csv");
    filter_csv("libgen_index_books.csv");
}

fn is_chinese_title(book: &Book) -> bool {
    let chinese_char_count = book.title.matches(is_chinese_char).count();
    chinese_char_count as f32 / book.title.len() as f32 > 0.3
}

#[inline(always)]
const fn is_chinese_char(c: char) -> bool {
    matches!(c as u32,
        0x4E00..=0x9FA5 |
        0x9FA6..=0x9FFF |
        0x3400..=0x4DB5 |
        0x20000..=0x2A6D6 |
        0x2A700..=0x2B734 |
        0x2B740..=0x2B81D |
        0x2F00..=0x2FD5 |
        0x2E80..=0x2EF3 |
        0xF900..=0xFAD9 |
        0x2F800..=0x2FA1D |
        0xE815..=0xE86F |
        0xE400..=0xE5E8 |
        0xE600..=0xE6CF |
        0x31C0..=0x31E3 |
        0x2FF0..=0x2FFB |
        0x3105..=0x3120 |
        0x31A0..=0x31BA
    )
}
