import type { Book, SearchQuery } from './searcher';
import { invoke } from '@tauri-apps/api/primitives';

export default async function search(query: SearchQuery) {
  const response = (await invoke('search', {
    query,
    limit: query.limit,
    offset: query.offset
  })) as [Book[] | undefined, number];
  const books = response[0];
  const total = response[1];
  return { books, total };
}
