import { useQuery } from '@tanstack/react-query';
import { searchService, SearchResults } from '@/services/search.service';
import { useDebounce } from './use-debounce';

export function useSearch(query: string, enabled: boolean = true) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery<SearchResults>({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchService.search(debouncedQuery),
    enabled: enabled && debouncedQuery.length > 0,
    staleTime: 1000 * 60,
  });
}