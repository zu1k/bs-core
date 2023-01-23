import type { Book, SearchQuery } from './searcher';
import { invoke } from '@tauri-apps/api';

export default async function search(query: SearchQuery) {
  const response = await invoke('search', { query, limit: query.limit });
  return response as Book[];
}
