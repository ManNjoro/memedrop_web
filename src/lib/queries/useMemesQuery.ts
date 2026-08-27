import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchMemes, type FetchMemesParams } from '../api/memes';
import { queryKeys } from './keys';

/**
 * Cursor-based infinite query for the meme feed. Shared by Home, Explore's
 * trending grid, and Search Results — each just describes *what* it wants
 * via `params`; react-query owns loading/error/pagination state.
 */
export function useMemesQuery(params: FetchMemesParams, options: { enabled?: boolean } = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.memes.list(params),
    queryFn: ({ pageParam }) => fetchMemes({ ...params, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: options.enabled ?? true,
    staleTime: 30_000,
  });
}