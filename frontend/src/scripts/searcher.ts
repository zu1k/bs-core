import { ref } from 'vue';

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

export abstract class Searcher {
  abstract handleSearch(query: string, limit: number): Promise<Book[]>;
}

export function useSearcher() {
  const searcher = ref<Searcher | null>(null);

  // dynamically import. we do not need both at the same time
  if (!window.__TAURI_METADATA__) {
    import('./searcher-browser').then(({ default: SearcherBrowser }) => {
      searcher.value = new SearcherBrowser();
    });
  } else {
    import('./searcher-tauri').then(({ default: SearcherTauri }) => {
      searcher.value = new SearcherTauri();
    });
  }

  return searcher;
}
