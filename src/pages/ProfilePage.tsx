import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { Settings, Inbox, WifiOff } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { MediaCard } from '@/components/ui/MediaCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import { useUserProfileQuery, useUserMemesQuery, useSavedMemesQuery } from '@/lib/queries/useUserQuery';
import { toCardMeme, toCardMemeFromUserItem } from '@/lib/mappers';
import { cn } from '@/lib/utils';

type ProfileTab = 'uploads' | 'saved';

function formatMemberSince(date: Date | null | undefined) {
  if (!date) return '';
  return `Member since ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [tab, setTab] = useState<ProfileTab>('uploads');
  const username = user?.username ?? undefined;

  const profileQuery = useUserProfileQuery(username);
  const uploadsQuery = useUserMemesQuery(username);
  // Only fetched once the person actually opens this tab.
  const savedQuery = useSavedMemesQuery(tab === 'saved');

  const memberSince = formatMemberSince(user?.createdAt ? new Date(user.createdAt) : null);

  const uploads = uploadsQuery.data?.memes ?? [];
  const savedMemes = savedQuery.data?.memes ?? [];
  const totalDownloads = uploads.reduce((sum, m) => sum + m.downloadsCount, 0);
  const totalLikes = uploads.reduce((sum, m) => sum + m.likesCount, 0);

  const activeLoading = tab === 'uploads' ? uploadsQuery.isLoading : savedQuery.isLoading;
  const activeError = tab === 'uploads' ? uploadsQuery.error : savedQuery.error;
  const activeItems = tab === 'uploads' ? uploads : savedMemes;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-text-primary-light dark:text-text-primary">Profile</h1>
        <Link
          to="/settings"
          aria-label="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-alt-light dark:bg-surface-alt hover:opacity-80"
        >
          <Settings size={19} className="text-text-primary-light dark:text-text-primary" />
        </Link>
      </div>

      <div className="flex flex-col items-center py-6">
        <Avatar src={user?.imageUrl} name={user?.username ?? 'you'} size="lg" />
        <p className="mt-3 text-lg font-bold text-text-primary-light dark:text-text-primary">
          @{user?.username ?? 'you'}
        </p>
        <p className="mt-1 text-xs text-text-muted">{memberSince}</p>

        <div className="mt-6 flex gap-8">
          <div className="text-center">
            <p className="text-lg font-extrabold text-text-primary-light dark:text-text-primary">
              {profileQuery.data?.memeCount ?? uploads.length}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">Uploads</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-text-primary-light dark:text-text-primary">{totalDownloads}</p>
            <p className="mt-0.5 text-xs text-text-muted">Downloads</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-text-primary-light dark:text-text-primary">{totalLikes}</p>
            <p className="mt-0.5 text-xs text-text-muted">Likes</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex border-b border-border-light dark:border-border">
        <button
          type="button"
          onClick={() => setTab('uploads')}
          className={cn(
            'flex-1 border-b-2 pb-3 text-sm font-bold',
            tab === 'uploads' ? 'border-primary text-text-primary-light dark:text-text-primary' : 'border-transparent text-text-muted'
          )}
        >
          My Memes
        </button>
        <button
          type="button"
          onClick={() => setTab('saved')}
          className={cn(
            'flex-1 border-b-2 pb-3 text-sm font-bold',
            tab === 'saved' ? 'border-primary text-text-primary-light dark:text-text-primary' : 'border-transparent text-text-muted'
          )}
        >
          Saved
        </button>
      </div>

      {activeLoading ? (
        <SkeletonGrid count={4} />
      ) : activeError ? (
        <EmptyState
          icon={WifiOff}
          title={tab === 'uploads' ? "Couldn't load your memes" : "Couldn't load your saved memes"}
          subtitle={activeError.message}
          actionLabel="Try Again"
          onAction={() => (tab === 'uploads' ? uploadsQuery.refetch() : savedQuery.refetch())}
        />
      ) : activeItems.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={tab === 'uploads' ? "You haven't dropped anything yet." : 'Nothing saved yet.'}
          subtitle={
            tab === 'uploads'
              ? 'Your uploads will show up here once you drop your first meme.'
              : 'Tap the bookmark icon on a meme to save it here.'
          }
          actionLabel={tab === 'uploads' ? 'Upload Your First Meme' : undefined}
          onAction={tab === 'uploads' ? () => navigate('/upload') : undefined}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {tab === 'uploads'
            ? uploads.map((item) => (
                <MediaCard
                  key={item.id}
                  meme={toCardMemeFromUserItem(item, user?.username ?? 'you', user?.imageUrl)}
                  variant="grid"
                />
              ))
            : savedMemes.map((item) => <MediaCard key={item.id} meme={toCardMeme(item)} variant="grid" />)}
        </div>
      )}
    </div>
  );
}