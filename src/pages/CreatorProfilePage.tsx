import { useParams } from 'react-router-dom';
import { Inbox, WifiOff } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { MediaCard } from '@/components/ui/MediaCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import { useUserProfileQuery, useUserMemesQuery } from '@/lib/queries/useUserQuery';
import { toCardMemeFromUserItem } from '@/lib/mappers';

export function CreatorProfilePage() {
  const { username } = useParams<{ username: string }>();
  const profileQuery = useUserProfileQuery(username);
  const memesQuery = useUserMemesQuery(username);

  const loading = profileQuery.isLoading || memesQuery.isLoading;
  const error = profileQuery.error ?? memesQuery.error;
  const items = memesQuery.data?.memes ?? [];
  const profile = profileQuery.data;
  const hasFullName = !!(profile?.firstName || profile?.lastName);

  const refetchAll = () => {
    profileQuery.refetch();
    memesQuery.refetch();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col items-center py-6">
        <Avatar src={profile?.avatarUrl} name={username ?? '?'} size="lg" />
        {hasFullName && (
          <p className="mt-3 text-base font-semibold text-text-primary-light dark:text-text-primary">
            {[profile?.firstName, profile?.lastName].filter(Boolean).join(' ')}
          </p>
        )}
        <p
          className={
            hasFullName
              ? 'mt-0.5 text-sm text-text-muted'
              : 'mt-3 text-lg font-bold text-text-primary-light dark:text-text-primary'
          }
        >
          @{username}
        </p>
        {!loading && !error && <p className="mt-1 text-xs text-text-muted">{profile?.memeCount ?? 0} memes</p>}
      </div>

      {loading ? (
        <SkeletonGrid count={4} />
      ) : error ? (
        <EmptyState
          icon={WifiOff}
          title="Couldn't load this profile"
          subtitle={error.message}
          actionLabel="Try Again"
          onAction={refetchAll}
        />
      ) : items.length === 0 ? (
        <EmptyState icon={Inbox} title="No memes here yet" subtitle={`@${username} hasn't dropped anything yet.`} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              meme={toCardMemeFromUserItem(item, username ?? '', profile?.avatarUrl)}
              variant="grid"
            />
          ))}
        </div>
      )}
    </div>
  );
}