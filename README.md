# Book Searcher

[![GitHub stars](https://img.shields.io/github/stars/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/network)
[![Release](https://img.shields.io/github/release/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/releases)
[![GitHub issues](https://img.shields.io/github/issues/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/issues)
[![GitHub license](https://img.shields.io/github/license/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/blob/master/LICENSE)

We don't save and provide files, we provide search.

I hope everyone have a copy of the index locally, so that no need to rely on any centralized service.

## Deploy with Docker

```
git clone https://github.com/book-searcher-org/book-searcher.git && cd book-searcher

docker-compose up -d
```

Now `book-searcher` it will listen to `0.0.0.0:7070`.

## Usage

### 1. Download the pre-compiled binary from [Release](https://github.com/book-searcher-org/book-searcher/releases).

Or you can compile by yourself. Refer to [Build from source](#build-from-source) for instructions.

### 2. Create the index.

Or you can make your own via `book-searcher index`.

It should look like the following:

```
project_dir
├── index
│   ├── some index files...
│   └── meta.json
└── book-searcher
```

### 3. Run `book-searcher run`, it will listen to `127.0.0.1:7070`.

Access http://127.0.0.1:7070/ to use webui, or you can use the original api.

#### original search api

You can search by the following fields:

- title
- author
- publisher
- extension
- language
- isbn
- id

Examples:

- `http://127.0.0.1:7070/search?limit=30&query=余华`
- `http://127.0.0.1:7070/search?limit=30&query=title:机器学习 extension:azw3 publisher:清华`
- `http://127.0.0.1:7070/search?limit=30&query=id:18557063`
- `http://127.0.0.1:7070/search?limit=30&query=isbn:9787302423287`

## Build from source

### 1. Build `book-searcher`

First build frontend

```bash
make frontend_preinstall frontend
```

Then build book-searcher

```bash
TARGET=release make

# move the compiled binary to the project root directory
mv target/release/book-searcher .
```

### 2. Build `index`

Prepare the raw data, put files to the project root directory.

Then run `book-searcher index`. You may need to `rm index/*` first.

If you have other csv files, you can run `book-searcher index -f *.csv` to index them.

The finally folder structure should look like this:

```
project_dir // in the example above, it is project root directory.
├── index
│   ├── some index files...
│   └── meta.json
└── book-searcher
```

## Raw data

```
id, title, author, publisher, extension, filesize, language, year, pages, isbn, ipfs_cid
```

## License

**book-searcher** © [book-searcher's authors](https://github.com/book-searcher-org/book-searcher/graphs/contributors), Released under the [MIT](./LICENSE) License.