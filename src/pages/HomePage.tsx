import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageOff, WifiOff } from 'lucide-react';
import { CategoryChip } from '@/components/ui/Chip';
import { MediaCard } from '@/components/ui/MediaCard';
import { toCardMeme } from '@/lib/mappers';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import { useMemesQuery } from '@/lib/queries/useMemesQuery';
import type { FetchMemesParams } from '@/lib/api/memes';

const CATEGORIES = ['Trending', 'Latest', 'Videos', 'Images', 'Popular'] as const;
type Category = (typeof CATEGORIES)[number];

function paramsForCategory(category: Category): FetchMemesParams {
  switch (category) {
    case 'Trending':
      return { sort: 'most_popular', limit: 13 };
    case 'Latest':
      return { sort: 'newest', limit: 13 };
    case 'Videos':
      return { mediaType: 'video', sort: 'newest', limit: 13 };
    case 'Images':
      return { mediaType: 'image', sort: 'newest', limit: 13 };
    case 'Popular':
      return { sort: 'most_downloaded', limit: 13 };
  }
}

export function HomePage() {
  const [activeCategory, setActiveCategory] = useState<Category>('Trending');
  const params = useMemo(() => paramsForCategory(activeCategory), [activeCategory]);
  const { data, isLoading, isError, error, refetch } = useMemesQuery(params);

  const memes = data?.pages.flatMap((page) => page.memes) ?? [];
  const [featured, ...rest] = memes;
  const featuredCard = featured ? toCardMeme(featured) : null;

  return (
    <div>
      <h1 className="mb-5 text-[26px] font-extrabold leading-8 text-text-primary-light dark:text-text-primary">
        Your daily dose
        <br />
        of internet chaos.
      </h1>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <CategoryChip key={cat} label={cat} selected={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
        ))}
      </div>

      {isLoading ? (
        <SkeletonGrid count={10} />
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
          {featuredCard && (
            <Link
              to={`/meme/${featuredCard.id}`}
              className="mb-6 block overflow-hidden rounded-lg border border-border-light dark:border-border bg-surface-light dark:bg-surface shadow-sm"
            >
              <div className="relative h-72 w-full sm:h-80 lg:h-96">
                {featuredCard.previewUrl ? (
                  <img src={featuredCard.previewUrl} alt="" className="h-full w-full object-cover" />
                ) : featuredCard.videoSrc ? (
                  <video src={featuredCard.videoSrc} preload="metadata" muted playsInline className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-alt-light dark:bg-surface-alt">
                    <ImageOff size={40} className="text-text-muted" strokeWidth={1.5} />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-5 pb-4 pt-16">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-text-primary">🔥 Featured</p>
                  <p className="text-xl font-bold text-text-primary">{featuredCard.title}</p>
                </div>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {rest.map((item) => (
              <MediaCard key={item.id} meme={toCardMeme(item)} variant="grid" onDownload={() => {}} onShare={() => {}} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}