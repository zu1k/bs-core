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
}

export default async function search(query: string, limit: number) {
  if (import.meta.env.VITE_TAURI === '1') {
    return await import('./searcher-tauri').then(({ default: search }) => search(query, limit));
  } else {
    return await import('./searcher-browser').then(({ default: search }) => search(query, limit));
  }
}
