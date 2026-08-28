import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SearchX, WifiOff } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterChip } from '@/components/ui/Chip';
import { SortSelect } from '@/components/ui/SortSelect';
import { MediaCard } from '@/components/ui/MediaCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import { InfiniteScrollSentinel } from '@/components/ui/InfiniteScrollSentinel';
import { useMemesQuery } from '@/lib/queries/useMemesQuery';
import { toCardMeme } from '@/lib/mappers';
import type { ApiMediaType, ApiSort } from '@/lib/api/types';

type MediaFilter = 'all' | 'images' | 'videos';
const SORT_OPTIONS: ApiSort[] = ['newest', 'oldest', 'most_downloaded', 'most_popular'];

const FILTER_TO_API: Record<MediaFilter, ApiMediaType | undefined> = {
  all: undefined,
  images: 'image',
  videos: 'video',
};

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [sort, setSort] = useState<ApiSort>('newest');

  // Debounce typing so we're not firing a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  // Keep the URL in sync so the search is shareable/back-button-friendly.
  useEffect(() => {
    if (debouncedQuery) {
      navigate(`/search?q=${encodeURIComponent(debouncedQuery)}`, { replace: true });
    }
  }, [debouncedQuery, navigate]);

  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useMemesQuery(
    { q: debouncedQuery, mediaType: FILTER_TO_API[filter], sort, limit: 20 },
    { enabled: debouncedQuery.length > 0 }
  );

  const memes = data?.pages.flatMap((page) => page.memes) ?? [];

  return (
    <div>
      <h1 className="mb-4 text-xl font-extrabold text-text-primary-light dark:text-text-primary">Search</h1>

      <SearchBar value={query} onChange={setQuery} autoFocus={!initialQuery} className="mb-4" />

      {debouncedQuery.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary">
              {isLoading ? 'Searching…' : `${memes.length} meme${memes.length === 1 ? '' : 's'} found`}
            </p>
            <div className="flex gap-2">
              <FilterChip label="All" selected={filter === 'all'} onClick={() => setFilter('all')} />
              <FilterChip label="Images" selected={filter === 'images'} onClick={() => setFilter('images')} />
              <FilterChip label="Videos" selected={filter === 'videos'} onClick={() => setFilter('videos')} />
            </div>
          </div>
          <SortSelect value={sort} options={SORT_OPTIONS} onChange={setSort} />
        </div>
      )}

      {debouncedQuery.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Search for something funny"
          subtitle="Try a topic, tag, or creator — like “programming” or “Kenyan memes.”"
        />
      ) : isLoading ? (
        <SkeletonGrid count={8} />
      ) : isError ? (
        <EmptyState icon={WifiOff} title="Couldn't search right now" subtitle={error?.message} actionLabel="Try Again" onAction={() => refetch()} />
      ) : memes.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No memes found"
          subtitle="Try another search or browse trending memes."
          actionLabel="Explore Trending"
          onAction={() => navigate('/explore')}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {memes.map((item) => (
              <MediaCard key={item.id} meme={toCardMeme(item)} variant="grid" />
            ))}
          </div>
          <InfiniteScrollSentinel onIntersect={() => fetchNextPage()} enabled={!!hasNextPage && !isFetchingNextPage} />
          {isFetchingNextPage && <SkeletonGrid count={4} />}
          {!hasNextPage && memes.length > 0 && (
            <p className="py-6 text-center text-xs text-text-muted">You've reached the end.</p>
          )}
        </>
      )}
    </div>
  );
}