use book_searcher_core::Book;
use std::{fs::File, io::BufReader};
use tantivy_meta_tokenizer::utils::is_chinese;

fn main() {
    let mut writer = csv::Writer::from_path("chinese_books.csv").unwrap();

    let mut filter_csv = |path: &str| {
        let file = File::open(path).unwrap();
        let reader = BufReader::new(file);

        let mut rdr = csv::ReaderBuilder::new()
            .has_headers(false)
            .from_reader(reader);
        for result in rdr.deserialize::<Book>() {
            match result {
                Ok(ref book) => {
                    if is_chinese(&book.title) {
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

    filter_csv("books.csv");
}
