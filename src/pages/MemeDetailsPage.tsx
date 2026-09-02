import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { Download, Share2, Link2, Heart, Bookmark, MoreHorizontal, Trash2, Flag, WifiOff } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Popover, PopoverItem } from '@/components/ui/Popover';
import { Spinner } from '@/components/ui/Spinner';
import { useMemeQuery, useLikeMutation, useSaveMutation, useDeleteMemeMutation } from '@/lib/queries/useMemeQuery';
import { recordDownload, recordView } from '@/lib/api/memes';
import { formatRelativeTime, formatCompactNumber } from '@/lib/formatRelativeTime';
import { useToastStore } from '@/store/useToastStore';
import { cn } from '@/lib/utils';
import { usePostHog } from '@posthog/react';

/**
 * Cloudinary's URLs are cross-origin, and the `download` attribute on a
 * plain <a> is ignored by the spec for cross-origin links (the browser
 * just navigates to it instead of downloading). Fetching the file and
 * downloading it as a same-origin blob: URL is what actually forces a
 * download reliably across browsers.
 */
async function downloadFile(url: string, filename: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

export function MemeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const showToast = useToastStore((s) => s.showToast);
  const posthog = usePostHog();

  const { data: meme, isLoading, isError, error, refetch } = useMemeQuery(id);
  const likeMutation = useLikeMutation(id ?? '');
  const saveMutation = useSaveMutation(id ?? '');
  const deleteMutation = useDeleteMemeMutation();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const viewRecordedRef = useRef(false);

  useEffect(() => {
    if (meme && !viewRecordedRef.current) {
      viewRecordedRef.current = true;
      recordView(meme.id).catch(() => {});
    }
  }, [meme]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (isError || !meme) {
    return (
      <EmptyState
        icon={WifiOff}
        title="Couldn't load this meme"
        subtitle={error?.message ?? 'It may have been removed.'}
        actionLabel="Try Again"
        onAction={() => refetch()}
      />
    );
  }

  const isOwner = !!userId && meme.uploader.id === userId;

  // Points at the backend's server-rendered share page, not this SPA route
  // directly — this app is client-rendered with no SSR/prerendering, so a
  // link straight to /meme/:id here wouldn't have per-meme Open Graph tags
  // for Messages/WhatsApp/etc. link previews to read (those crawlers only
  // read the raw HTML response, they don't execute JS). The backend's page
  // is real server-rendered HTML with the correct og:title/og:image per
  // meme — see src/controllers/share.controller.ts in the API.
  const shareUrl = `${import.meta.env.VITE_API_URL}/meme/${meme.id}`;

  const onDownload = async () => {
    setDownloading(true);
    try {
      const ext = meme.mediaType === 'video' ? 'mp4' : 'jpg';
      await downloadFile(meme.mediaUrl, `memedrop-${meme.id}.${ext}`);
      recordDownload(meme.id).catch(() => {});
      posthog?.capture('meme_downloaded', { meme_id: meme.id, media_type: meme.mediaType });
      showToast({ message: 'Download started', variant: 'success' });
    } catch (err) {
      posthog?.captureException(err);
      showToast({ message: 'Couldn\u2019t download this meme. Try again.', variant: 'error' });
    } finally {
      setDownloading(false);
    }
  };

  const onShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: meme.title, text: `Check this out on MemeDrop: ${meme.title}`, url: shareUrl });
        posthog?.capture('meme_shared', { meme_id: meme.id, method: 'native_share' });
      } catch {
        // person cancelled the native share sheet — not an error
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      posthog?.capture('meme_shared', { meme_id: meme.id, method: 'copy_link' });
      showToast({ message: 'Link copied', variant: 'success' });
    }
  };

  const onCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    posthog?.capture('meme_shared', { meme_id: meme.id, method: 'copy_link' });
    showToast({ message: 'Link copied', variant: 'success' });
  };

  const onToggleLike = () => {
    if (!userId) {
      showToast({ message: 'Sign in to like memes.', variant: 'error' });
      return;
    }
    posthog?.capture(meme.isLiked ? 'meme_unliked' : 'meme_liked', { meme_id: meme.id, media_type: meme.mediaType });
    likeMutation.mutate(meme.isLiked);
  };

  const onToggleSave = () => {
    if (!userId) {
      showToast({ message: 'Sign in to save memes.', variant: 'error' });
      return;
    }
    posthog?.capture(meme.isSaved ? 'meme_unsaved' : 'meme_saved', { meme_id: meme.id, media_type: meme.mediaType });
    saveMutation.mutate(meme.isSaved);
  };

  const onConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(meme.id);
      posthog?.capture('meme_deleted', { meme_id: meme.id, media_type: meme.mediaType });
      setConfirmDeleteOpen(false);
      showToast({ message: 'Meme deleted', variant: 'success' });
      navigate(-1);
    } catch (e) {
      showToast({
        message: e instanceof Error ? e.message : 'Couldn\u2019t delete this meme. Try again.',
        variant: 'error',
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-lg bg-black">
        {meme.mediaType === 'video' ? (
          <video
            src={meme.mediaUrl}
            poster={meme.thumbnailUrl ?? undefined}
            controls
            className="max-h-[70vh] w-full"
          />
        ) : (
          <img src={meme.mediaUrl} alt={meme.title} className="max-h-[70vh] w-full object-contain" />
        )}
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary-light dark:text-text-primary">{meme.title}</h1>
          {!!meme.description && (
            <p className="mt-1 text-sm leading-5 text-text-secondary-light dark:text-text-secondary">
              {meme.description}
            </p>
          )}
        </div>
        <Popover
          align="right"
          trigger={({ onClick }) => (
            <button
              type="button"
              onClick={onClick}
              aria-label="More options"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-alt-light dark:bg-surface-alt hover:opacity-80"
            >
              <MoreHorizontal size={18} className="text-text-primary-light dark:text-text-primary" />
            </button>
          )}
        >
          {(close) => (
            <>
              {isOwner && (
                <PopoverItem
                  destructive
                  icon={<Trash2 size={16} />}
                  onClick={() => {
                    close();
                    setConfirmDeleteOpen(true);
                  }}
                >
                  Delete meme
                </PopoverItem>
              )}
              <PopoverItem icon={<Flag size={16} />} onClick={close}>
                Report content
              </PopoverItem>
            </>
          )}
        </Popover>
      </div>

      <Link to={`/creator/${meme.uploader.username}`} className="mt-4 flex items-center gap-2.5">
        <Avatar src={meme.uploader.avatarUrl} name={meme.uploader.username} size="sm" />
        <div>
          <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary">
            Uploaded by @{meme.uploader.username}
          </p>
          <p className="text-xs text-text-muted">{formatRelativeTime(meme.createdAt)}</p>
        </div>
      </Link>

      {meme.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {meme.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-surface-alt-light dark:bg-surface-alt px-2.5 py-1 text-xs font-medium text-secondary"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-text-muted">
        {formatCompactNumber(meme.likesCount)} {meme.likesCount === 1 ? 'like' : 'likes'} ·{' '}
        {formatCompactNumber(meme.viewsCount)} {meme.viewsCount === 1 ? 'view' : 'views'}
      </p>

      <div className="mt-5">
        <PrimaryButton onClick={onDownload} loading={downloading} icon={<Download size={18} />} className="w-full sm:w-auto">
          Download
        </PrimaryButton>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:flex sm:w-fit">
        <button
          type="button"
          onClick={onToggleLike}
          disabled={likeMutation.isPending}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold sm:min-w-32.5',
            meme.isLiked
              ? 'border-danger bg-danger/10 text-danger'
              : 'border-border-light dark:border-border bg-surface-alt-light dark:bg-surface-alt text-text-primary-light dark:text-text-primary'
          )}
        >
          <Heart size={16} className={meme.isLiked ? 'fill-danger' : ''} />
          Like
        </button>
        <button
          type="button"
          onClick={onToggleSave}
          disabled={saveMutation.isPending}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold sm:min-w-32.5',
            meme.isSaved
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border-light dark:border-border bg-surface-alt-light dark:bg-surface-alt text-text-primary-light dark:text-text-primary'
          )}
        >
          <Bookmark size={16} className={meme.isSaved ? 'fill-primary' : ''} />
          Save
        </button>
        <SecondaryButton onClick={onShare} icon={<Share2 size={16} />}>
          Share
        </SecondaryButton>
        <SecondaryButton onClick={onCopyLink} icon={<Link2 size={16} />}>
          Copy Link
        </SecondaryButton>
      </div>

      <ConfirmationModal
        open={confirmDeleteOpen}
        title="Delete this meme?"
        message="This can't be undone — it'll be removed for everyone."
        confirmLabel={deleteMutation.isPending ? 'Deleting…' : 'Delete'}
        destructive
        loading={deleteMutation.isPending}
        onConfirm={onConfirmDelete}
        onCancel={() => !deleteMutation.isPending && setConfirmDeleteOpen(false)}
      />
    </div>
  );
}