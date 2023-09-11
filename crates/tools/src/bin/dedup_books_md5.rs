use book_searcher_core::Book;
use std::{collections::HashMap, fs::File, io::BufReader};

fn main() {
    let mut map: HashMap<String, String> = HashMap::new();

    {
        let file = File::open("books.csv").unwrap();
        let reader = BufReader::new(file);

        let mut rdr = csv::ReaderBuilder::new()
            .has_headers(false)
            .from_reader(reader);
        let mut cnt = 0;
        for book in rdr.deserialize::<Book>().flatten() {
            map.entry(book.md5.clone())
                .and_modify(|e| {
                    e.push(',');
                    e.push_str(&book.isbn);
                })
                .or_insert(book.isbn);

            cnt += 1;
            if cnt % 10000 == 0 {
                println!("{cnt}");
            }
        }
        println!("{:?}", rdr.position());
    }

    let mut writer = csv::Writer::from_path("dedup.csv").unwrap();
    {
        let file = File::open("books.csv").unwrap();
        let reader = BufReader::new(file);
        let mut rdr = csv::ReaderBuilder::new()
            .has_headers(false)
            .from_reader(reader);
        let mut cnt: i32 = 0;
        for mut book in rdr.deserialize::<Book>().flatten() {
            if let Some(isbn) = map.remove(&book.md5) {
                book.isbn = isbn.clone();
                if let Err(err) = writer.serialize(book) {
                    println!("err: {err}");
                }
            }

            cnt += 1;
            if cnt % 10000 == 0 {
                println!("{cnt}");
            }
        }
        println!("{:?}", rdr.position());
    }
}
