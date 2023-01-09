# Book Searcher

[![GitHub stars](https://img.shields.io/github/stars/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/network)
[![Release](https://img.shields.io/github/release/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/releases)
[![GitHub issues](https://img.shields.io/github/issues/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/issues)
[![GitHub license](https://img.shields.io/github/license/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/blob/master/LICENSE)

Create and search books index, create your private library.

We don't save and provide files, we provide books searching.

## Usage

We currently offer both Desktop and Command-line versions.

### Desktop

**1. Download the pre-compiled desktop installer from [Release](https://github.com/book-searcher-org/book-searcher/releases)**

Or you can compile by yourself. Refer to [Build from source](#build-desktop-version) section for instructions.

- Windows: Book-Searcher-desktop_version_x64.msi
- macOS: Book-Searcher-desktop_version_x64.dmg
- Linux:
    - Deb: Book-Searcher-desktop_version_amd64.deb
    - AppImage: Book-Searcher-desktop_version_amd64.AppImage

**2. Prepare the `index`**

Refer to [Prepare the index](#prepare-the-index) section for instructions.

**3. Run book-searcher-desktop**

Specify the `index` folder path in the settings menu.

### Cli

**1. Download the pre-compiled binary from [Release](https://github.com/book-searcher-org/book-searcher/releases)**

Or you can compile by yourself. Refer to [Build from source](#build-cli-version) section for instructions.

**2. Prepare the `index`**

Refer to [Prepare the index](#prepare-the-index) section for instructions.

**3. Run `book-searcher run`**

It will listen to `127.0.0.1:7070`.

Access http://127.0.0.1:7070/ to use webui, or you can use the [original search api](#original-search-api).

### Deploy with Docker

```bash
mkdir book-searcher && cd book-searcher
wget https://raw.githubusercontent.com/book-searcher-org/book-searcher/master/docker-compose.yml
# Prepare the index: put csv files in the directory, and run the following command to create index
docker-compose run --rm -v "$PWD:$PWD" -w "$PWD" book-searcher /book-searcher index -f *.csv
# start book-searcher
docker-compose up -d
```

Now `book-searcher` it will listen to `0.0.0.0:7070`.

### Original Search Api

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

### Build Cli version

**1. Build frontend**

```bash
make frontend_preinstall frontend
```

**2. Build `book-searcher`**

```bash
TARGET=release make

# move the compiled binary to the project root directory
mv target/release/book-searcher .
```

### Build Desktop version

**1. Install frontend dependencies**

```bash
make frontend_preinstall
```

**2. Build `book-searcher-desktop`**

```bash
cargo tauri build
```

### Prepare the `index`

**1. Prepare the raw data**

Prepare the raw books metadata and save the `csv` files to the project root directory.

The raw data is used to generate the `index`, see [Raw data](#raw-data) section for details.

**2. Create `index`**

You may need to `rm -rf index` first.

```bash
book-searcher index -f *.csv
```

The finally folder structure should look like this:

```
book_searcher_dir
├── index
│   ├── some index files...
│   └── meta.json
└── book-searcher
```

## Raw data

This raw data is used to generate `index`, should be a `csv` file with the following fields:

```
id, title, author, publisher, extension, filesize, language, year, pages, isbn, ipfs_cid
```

## License

**book-searcher** © [The Book Searcher Authors](https://github.com/book-searcher-org/book-searcher/graphs/contributors), Released under the [BSD-3-Clause](./LICENSE) License.
