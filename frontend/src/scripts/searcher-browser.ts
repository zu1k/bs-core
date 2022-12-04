import type { Book } from './searcher';
import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_API,
  timeout: 5000
});

export default async function search(query: string, limit: number) {
  const response = await http.get(`search?limit=${limit}&query=${query}`);
  return response.data.books as Book[];
}
