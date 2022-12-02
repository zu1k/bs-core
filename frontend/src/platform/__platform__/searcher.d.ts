import type { UseSearcher } from '../../scripts/searcher';

// workaround for ts
declare const useSearcher: UseSearcher;
export { useSearcher as default };
