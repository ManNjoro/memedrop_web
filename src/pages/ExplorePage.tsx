// src/pages/ExplorePage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { CategoryChip } from '@/components/ui/Chip';
import { MediaCard } from '@/components/ui/MediaCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import { InfiniteScrollSentinel } from '@/components/ui/InfiniteScrollSentinel';
import { useMemesQuery } from '@/lib/queries/useMemesQuery';
import { toCardMeme } from '@/lib/mappers';

const EXPLORE_CATEGORIES = [
  'Programming',
  'School',
  'Work',
  'Relationships',
  'Gaming',
  'Animals',
  'Football',
  'Movies',
  'African Memes',
  'Kenyan Memes',
  'Random',
];

export function ExplorePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useMemesQuery({
    sort: 'most_popular',
    limit: 20,
  });
  const memes = data?.pages.flatMap((page) => page.memes) ?? [];

  const goToSearch = (q?: string) => {
    const params = new URLSearchParams({ q: q ?? query });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold text-text-primary-light dark:text-text-primary">Explore</h1>

      <button type="button" onClick={() => goToSearch()} className="block w-full text-left">
        <div className="pointer-events-none">
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </button>

      <h2 className="mb-3 mt-6 text-lg font-bold text-text-primary-light dark:text-text-primary">Categories</h2>
      <div className="mb-2 flex flex-wrap gap-2">
        {EXPLORE_CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat}
            label={cat}
            selected={activeCategory === cat}
            onClick={() => {
              setActiveCategory(cat);
              goToSearch(cat);
            }}
          />
        ))}
      </div>

      <h2 className="mb-3 mt-6 text-lg font-bold text-text-primary-light dark:text-text-primary">Trending now</h2>
      {isLoading ? (
        <SkeletonGrid count={8} />
      ) : isError ? (
        <EmptyState
          icon={WifiOff}
          title="Couldn't load trending memes"
          subtitle={error?.message}
          actionLabel="Try Again"
          onAction={() => refetch()}
        />
      ) : memes.length === 0 ? (
        <EmptyState icon={WifiOff} title="Nothing trending yet." subtitle="Check back soon, or drop the first meme." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {memes.map((item) => (
              <MediaCard key={item.id} meme={toCardMeme(item)} variant="grid" />
            ))}
          </div>
          <InfiniteScrollSentinel onIntersect={() => fetchNextPage()} enabled={!!hasNextPage && !isFetchingNextPage} />
          {isFetchingNextPage && <SkeletonGrid count={5} />}
          {!hasNextPage && memes.length > 0 && (
            <p className="py-6 text-center text-xs text-text-muted">You've reached the end.</p>
          )}
        </>
      )}
    </div>
  );
}