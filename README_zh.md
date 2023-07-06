# Book Searcher

[![GitHub stars](https://img.shields.io/github/stars/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/network)
[![Release](https://img.shields.io/github/release/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/releases)
[![GitHub issues](https://img.shields.io/github/issues/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/issues)
[![GitHub license](https://img.shields.io/github/license/book-searcher-org/book-searcher)](https://github.com/book-searcher-org/book-searcher/blob/master/LICENSE)

简单而超快的图书搜索器，创建并搜索您的私人图书馆。

Book Searcher可以在一分钟内索引超过1000万本书的元数据，并以30微秒的速度进行搜索。

## 使用方式

我们目前提供桌面版和命令行版本两种选择。
对于个人用户，我们建议使用桌面版。

### 桌面版

**1. 从[Release页面](https://github.com/book-searcher-org/book-searcher/releases)下载预编译的桌面版安装程序**

或者您也可以自行编译。请参考下面的[从源代码构建](#构建桌面版)部分的说明。

- Windows: Book-Searcher-desktop_version_x64.msi
- macOS: Book-Searcher-desktop_version_x64.dmg
- Linux:
    - Deb: Book-Searcher-desktop_version_amd64.deb
    - AppImage: Book-Searcher-desktop_version_amd64.AppImage

**2. 准备 `index`**

请参考[准备index](#准备-index) 部分的说明。

**3. 运行book-searcher-desktop**

在设置菜单中指定`index`文件夹的路径。

### 命令行版

**1. 从[Release页面](https://github.com/book-searcher-org/book-searcher/releases)下载预编译的二进制文件**

或者您也可以自行编译。请参考[从源代码构建](#构建命令行版)部分的说明。

**2. 准备 `index`**

请参考[准备index](#准备-index) 部分的说明。

**3. 运行 `book-searcher run`**

它将监听 `127.0.0.1:7070`。

访问 http://127.0.0.1:7070/ 来使用 Web 用户界面，或者您可以使用[原始搜索API](#原始搜索api)。

### 使用 Docker 部署

```bash
mkdir book-searcher && cd book-searcher
wget https://raw.githubusercontent.com/book-searcher-org/book-searcher/master/docker-compose.yml
# 准备索引：将 csv 文件放在目录中，然后运行以下命令创建索引
docker-compose run --rm -v "$PWD:$PWD" -w "$PWD" book-searcher /book-searcher index -f *.csv
# 启动 book-searcher
docker-compose up -d
```

现在，`book-searcher`将监听`0.0.0.0:7070`。

### 原始搜索Api

您可以通过以下字段进行搜索：

- title
- author
- publisher
- extension
- language
- isbn
- id

示例：

- `/search?limit=30&title=TITLE`
- `/search?limit=30&title=TITLE&author=AUTHOR`
- `/search?limit=30&isbn=ISBN`
- `/search?limit=30&query=title:TITLE extension:epub publisher:PUBLISHER`

现在我们有两种搜索模式：`/search?limit=30&mode=explore&title=TITLE&author=AUTHOR`

- filter：结果需要满足所有限制条件，这是默认模式。
- explore：结果只需要满足一定的限制条件。

## 从源代码构建

### 构建命令行版

**1. 构建前端**

```bash
make frontend_preinstall frontend
```

**2. 构建 `book-searcher`**

```bash
TARGET=release make

# 将编译后的二进制文件移动到项目根目录
mv target/release/book-searcher .
```

### 构建桌面版

**1. 安装前端依赖**

```bash
make frontend_preinstall
```

**2. 构建 `book-searcher-desktop`**

```bash
cargo tauri build
```

### 准备 `index`

**1. 准备原始数据**

准备原始图书元数据并将`csv`文件保存到项目根目录。

原始数据用于生成`index`，请参考[原始数据](#原始数据)部分获取详细信息。

**2. 创建 `index`**

您可能需要先执行`rm -rf index`命令。

```bash
book-searcher index -f *.csv
```

最终的文件夹结构应该如下所示：

```
book_searcher_dir
├── index
│   ├── some index files...
│   └── meta.json
└── book-searcher
```

## 原始数据

这些原始数据用于生成`index`，应该是一个包含以下字段的`csv`文件：

```
id, title, author, publisher, extension, filesize, language, year, pages, isbn, ipfs_cid, cover_url, md5
```

您需要导出并维护自己购买的图书的元信息，因为该项目只提供快速搜索功能。

## 许可证

**book-searcher** © [The Book Searcher Authors](https://github.com/book-searcher-org/book-searcher/graphs/contributors), 根据[BSD-3-Clause]((./LICENSE))发布。
