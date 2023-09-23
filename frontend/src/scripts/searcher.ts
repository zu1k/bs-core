export interface Book {
  id: number;
  title: string;
  author: string;
  publisher?: string;
  extension: string;
  filesize: number;
  language: string;
  year?: number;
  pages?: number;
  isbn: string;
  ipfs_cid: string;
  cover_url?: string;
  md5?: string;
}

export interface SearchQuery {
  id?: number;
  title?: string;
  author?: string;
  publisher?: string;
  extension?: string;
  language?: string;
  isbn?: string;
  md5?: string;

  query?: string;
  limit: number;
  offset: number;
}

export default async function search(query: SearchQuery) {
  if (import.meta.env.VITE_TAURI === '1') {
    return await import('./searcher-tauri').then(({ default: search }) => search(query));
  } else {
    return await import('./searcher-browser').then(({ default: search }) => search(query));
  }
}
