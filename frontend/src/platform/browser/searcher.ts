import type { UseSearcher } from '../../scripts/searcher';
import axios from 'axios';

const useSearcher: UseSearcher = () => {
  const http = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_BASE_API,
    timeout: 5000
  });
  return {
    search: async (query: string, limit: number) => {
      const response = await http.get(`search?limit=${limit}&query=${query}`);
      return response.data.books;
    }
  };
};

export default useSearcher;