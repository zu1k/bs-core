import type { Book, UseSearcher } from '../../scripts/searcher';

import { invoke } from '@tauri-apps/api';

const useSearcher: UseSearcher = () => {
  return {
    search: async (query: string, limit: number) => {
      const response = await invoke('search', { query, limit });
      return response as Book[];
    }
  };
};

export default useSearcher;
