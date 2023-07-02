# Book Searcher

[![GitHub stars](https://img.shields.io/github/stars/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/network)
[![Release](https://img.shields.io/github/release/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/releases)
[![GitHub issues](https://img.shields.io/github/issues/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/issues)
[![GitHub license](https://img.shields.io/github/license/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/blob/master/LICENSE)

Easy and fast book searcher, create and search your private library.

Book Searcher can index metadata for over 10 million books in one minute, and search in 30µs.

This project does not provide any book files, but only provides searching based on the user's data.

## Usage

We currently offer both Desktop and Command-line versions.
For individual users we recommend using the desktop version.

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
- md5
- id

Examples:

- `/search?limit=30&title=TITLE`
- `/search?limit=30&title=TITLE&author=AUTHOR`
- `/search?limit=30&isbn=ISBN`
- `/search?limit=30&query=title:TITLE extension:epub publisher:PUBLISHER`

We now have two search modes, `/search?limit=30&mode=explore&title=TITLE&author=AUTHOR`

- filter: the results need to meet all restrictions, default mode
- explore: the results only need to meet certain restrictions

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
id, title, author, publisher, extension, filesize, language, year, pages, isbn, ipfs_cid, cover_url, md5
```

You will need to export and maintain your own meta information for the books you have purchased, as this project only provides fast searching.

## License

**book-searcher** © [The Book Searcher Authors](https://github.com/book-searcher-org/book-searcher/graphs/contributors), Released under the [BSD-3-Clause](./LICENSE) License.
