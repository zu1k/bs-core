# zlib(libgen) searcher

[![GitHub stars](https://img.shields.io/github/stars/zlib-searcher/zlib-searcher)](https://github.com/zlib-searcher/zlib-searcher/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/zlib-searcher/zlib-searcher)](https://github.com/zlib-searcher/zlib-searcher/network)
[![Release](https://img.shields.io/github/release/zlib-searcher/zlib-searcher)](https://github.com/zlib-searcher/zlib-searcher/releases)
[![GitHub issues](https://img.shields.io/github/issues/zlib-searcher/zlib-searcher)](https://github.com/zlib-searcher/zlib-searcher/issues)
[![GitHub license](https://img.shields.io/github/license/zlib-searcher/zlib-searcher)](https://github.com/zlib-searcher/zlib-searcher/blob/master/LICENSE)

Search `zlib`/`libgen` index to get `ipfs_cid`.

We don't save and provide files, we provide search.

I hope everyone have a copy of the index locally, so that no need to rely on any centralized service.

## Deploy with Docker

```
git clone https://github.com/zlib-searcher/zlib-searcher.git && cd zlib-searcher
wget https://github.com/zlib-searcher/zlib-searcher/releases/download/0.6.0/index_0.6.zip && unzip index_0.6.zip
docker-compose up -d
```

Now `zlib-searcher` it will listen to `0.0.0.0:7070`.


## Usage

### 1. Download the pre-compiled binary from [Release](https://github.com/zlib-searcher/zlib-searcher/releases).

Or you can compile by yourself. Refer to [Build from source](#build-from-source) for instructions.

### 2. Download the `index` file that has been created.

We will give the corresponding `index` download links for each version in the release page.

Or you can make your own via `zlib-searcher index`.

Extract the `index` folder to the same level as the program, it should look like the following:

```
zlib_searcher_dir
├── index
│   ├── some index files...
│   └── meta.json
└── zlib-searcher
```

### 3. Run `zlib-searcher run`, it will listen to `127.0.0.1:7070`.

Access http://127.0.0.1:7070/ to use webui, or you can use the original api.

#### original search api

You can search by the following fields:

- title
- author
- publisher
- extension
- language
- isbn
- zlib_id

Examples:

- `http://127.0.0.1:7070/search?limit=30&query=余华`
- `http://127.0.0.1:7070/search?limit=30&query=title:机器学习 extension:azw3 publisher:清华`
- `http://127.0.0.1:7070/search?limit=30&query=zlib_id:18557063`
- `http://127.0.0.1:7070/search?limit=30&query=isbn:9787302423287`

## Build from source

### 1. Build `zlib-searcher`

First build frontend

```bash
make frontend_preinstall frontend
```

Then build zlib-searcher

```bash
TARGET=release make

# move the compiled binary to the project root directory
mv target/release/zlib-searcher .
```

### 2. Build `index`

Download `zlib_index_books.csv.zip` and `libgen_index_books.csv.zip` and extract the `csv` files to the project root directory.

Then run `zlib-searcher index`. You may need to `rm index/*` first.

If you have other csv files, you can run `zlib-searcher index -f *.csv` to index them.

The finally folder structure should look like this:

```
zlib_searcher_dir // in the example above, it is project root directory.
├── index
│   ├── some index files...
│   └── meta.json
└── zlib-searcher
```

## Raw data

We downloaded `libgen` sql and `zlib` sql and exported the necessary data from them.

```
id, title, author, publisher, extension, filesize, language, year, pages, isbn, ipfs_cid
```

This raw data is used to generate our `index`, you can download the raw data from here:

- [zlib_index_books.csv.zip](https://github.com/zlib-searcher/zlib-searcher/releases/download/0.4.0/zlib_index_books.csv.zip)
- [libgen_index_books.csv.zip](https://github.com/zlib-searcher/zlib-searcher/releases/download/0.4.0/libgen_index_books.csv.zip)

## License

**zlib-searcher** © [zlib-searcher's authors](https://github.com/zlib-searcher/zlib-searcher/graphs/contributors), Released under the [MIT](./LICENSE) License.