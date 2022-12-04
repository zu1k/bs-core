import type { Book } from './searcher';
import { invoke } from '@tauri-apps/api';

export default async function search(query: string, limit: number) {
  const response = await invoke('search', { query, limit });
  return response as Book[];
}
