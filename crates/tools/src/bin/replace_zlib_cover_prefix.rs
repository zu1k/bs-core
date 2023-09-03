use book_searcher_core::Book;
use std::{fs::File, io::BufReader};

fn main() {
    let mut writer = csv::Writer::from_path("books.csv").unwrap();

    let mut filter_csv = |path: &str| {
        let file = File::open(path).unwrap();
        let reader = BufReader::new(file);

        let mut rdr = csv::ReaderBuilder::new()
            .has_headers(false)
            .from_reader(reader);
        for mut result in rdr.deserialize::<Book>() {
            match result {
                Ok(ref mut book) => {
                    if book.cover_url.starts_with("http") {
                        let u = url::Url::parse(&book.cover_url).unwrap();
                        book.cover_url =
                            format!("zlib://{}?{}", u.path(), u.query().unwrap_or_default());
                    }

                    if let Err(err) = writer.serialize(book) {
                        println!("err: {err}");
                    }
                }
                Err(err) => {
                    println!("{err}");
                }
            }
        }
        println!("{:?}", rdr.position());
    };

    filter_csv("zlib.csv");
}
