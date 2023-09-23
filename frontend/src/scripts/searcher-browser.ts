import type { Book, SearchQuery } from './searcher';
import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_API,
  timeout: 30000
});

export default async function search(query: SearchQuery) {
  const response = await http.get('search', { params: query });
  const books = response.data.books as Book[] | undefined;
  const total = response.data.total as number;
  return { books, total };
}
