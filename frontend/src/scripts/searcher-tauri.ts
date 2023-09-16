import type { Book, SearchQuery } from './searcher';
import { invoke } from '@tauri-apps/api';

export default async function search(query: SearchQuery) {
  const response = await invoke('search', { query, limit: query.limit, offset: query.offset });
  const books = response as Book[] | undefined;
  const total = 0;
  return { books, total };
}
