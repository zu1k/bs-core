export interface Book {
  title: string;
  author: string;
  publisher: string;
  extension: string;
  filesize: number;
  language: string;
  year: number;
  pages: number;
  isbn: string;
  ipfs_cid: string;
}

export interface UseSearcher {
  (): {
    search: (query: string, limit: number) => Promise<Book[]>;
  };
}
