import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import { CategoryChip } from '@/components/ui/Chip';
import { MediaCard } from '@/components/ui/MediaCard';
import { toCardMeme } from '@/lib/mappers';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonFeedList } from '@/components/ui/Skeleton';
import { useMemesQuery } from '@/lib/queries/useMemesQuery';
import type { FetchMemesParams } from '@/lib/api/memes';

const CATEGORIES = ['Trending', 'Latest', 'Videos', 'Images', 'Popular'] as const;
type Category = (typeof CATEGORIES)[number];

function paramsForCategory(category: Category): FetchMemesParams {
  switch (category) {
    case 'Trending':
      return { sort: 'most_popular', limit: 10 };
    case 'Latest':
      return { sort: 'newest', limit: 10 };
    case 'Videos':
      return { mediaType: 'video', sort: 'newest', limit: 10 };
    case 'Images':
      return { mediaType: 'image', sort: 'newest', limit: 10 };
    case 'Popular':
      return { sort: 'most_downloaded', limit: 10 };
  }
}

export function HomePage() {
  const [activeCategory, setActiveCategory] = useState<Category>('Trending');
  const params = useMemo(() => paramsForCategory(activeCategory), [activeCategory]);
  const { data, isLoading, isError, error, refetch } = useMemesQuery(params);

  const memes = data?.pages.flatMap((page) => page.memes) ?? [];
  const [featured, ...rest] = memes;
  console.log("featured", featured, '\n', toCardMeme(featured)?.mediaUrl)

  return (
    <div>
      <h1 className="mb-5 text-[26px] font-extrabold leading-8 text-text-primary-light dark:text-text-primary">
        Your daily dose
        <br />
        of internet chaos.
      </h1>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <CategoryChip key={cat} label={cat} selected={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
        ))}
      </div>

      {isLoading ? (
        <SkeletonFeedList count={3} />
      ) : isError ? (
        <EmptyState
          icon={WifiOff}
          title="Couldn't load your feed"
          subtitle={error?.message}
          actionLabel="Try Again"
          onAction={() => refetch()}
        />
      ) : memes.length === 0 ? (
        <EmptyState
          icon={WifiOff}
          title="Nothing dropped here yet."
          subtitle="Be the first to drop a meme in this category."
        />
      ) : (
        <>
          {featured && (
            <Link
              to={`/meme/${featured.id}`}
              className="mx-auto mb-5 block max-w-xl overflow-hidden rounded-lg bg-surface-light dark:bg-surface"
            >
              <div className="relative">
                <img src={toCardMeme(featured).mediaUrl} alt="" className="h-64 w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-black/40 px-4 py-3">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-text-primary">🔥 Featured</p>
                  <p className="text-lg font-bold text-text-primary">{featured.title}</p>
                </div>
              </div>
            </Link>
          )}

          <div className="mx-auto max-w-xl">
            {rest.map((item) => (
              <MediaCard key={item.id} meme={toCardMeme(item)} variant="feed" onDownload={() => {}} onShare={() => {}} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}