import { Book, Searcher } from './searcher';
import axios, { AxiosInstance } from 'axios';

export default class SearcherBrowser extends Searcher {
  readonly http: AxiosInstance;

  constructor() {
    super();
    this.http = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_BASE_API,
      timeout: 5000
    });
  }

  async handleSearch(query: string, limit: number): Promise<Book[]> {
    const response = await this.http.get(`search?limit=${limit}&query=${query}`);
    return response.data.books;
  }
}
