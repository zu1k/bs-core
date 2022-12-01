import { Book, Searcher } from './searcher';

import { invoke } from '@tauri-apps/api';

export default class SearcherBrowser extends Searcher {
  async handleSearch(query: string, limit: number): Promise<Book[]> {
    const response = await invoke('search', { query, limit });
    return response as Book[];
  }
}
