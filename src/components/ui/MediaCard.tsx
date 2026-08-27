import { Link } from 'react-router-dom';
import { Download, Play, Share2 } from 'lucide-react';
import { Avatar } from './Avatar';
import { StatusBadge } from './Chip';
import { cn } from '@/lib/utils';

export type CardMeme = {
  id: string;
  title: string;
  mediaUrl: string; // image url, or video thumbnail/poster for video cards
  mediaType: 'image' | 'video';
  durationSec?: number | null;
  creatorName: string;
  creatorAvatar?: string | null;
  uploadedAt: string; // pre-formatted, e.g. "2d ago"
  aspectRatio?: number;
};

type MediaCardProps = {
  meme: CardMeme;
  variant?: 'grid' | 'feed';
  onDownload?: () => void;
  onShare?: () => void;
};

function formatDuration(sec?: number | null) {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MediaCard({ meme, variant = 'grid', onDownload, onShare }: MediaCardProps) {
  const aspect = meme.aspectRatio ?? (variant === 'grid' ? 0.85 : 1.1);

  return (
    <Link
      to={`/meme/${meme.id}`}
      aria-label={`Open meme: ${meme.title}`}
      className="group mb-4 block overflow-hidden rounded-lg bg-surface-light dark:bg-surface"
    >
      <div
        className="relative w-full overflow-hidden bg-surface-alt-light dark:bg-surface-alt"
        style={{ aspectRatio: aspect }}
      >
        <img
          src={meme.mediaUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {meme.mediaType === 'video' && (
          <>
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50">
                <Play size={20} className="fill-text-primary text-text-primary" />
              </div>
            </div>
            {!!meme.durationSec && (
              <StatusBadge className="absolute bottom-2 right-2">{formatDuration(meme.durationSec)}</StatusBadge>
            )}
          </>
        )}

        {/* Quick actions overlay */}
        <div className="absolute right-2 top-2 flex opacity-0 transition-opacity group-hover:opacity-100">
          {onShare && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onShare();
              }}
              aria-label="Share meme"
              className="mr-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/70"
            >
              <Share2 size={14} className="text-text-primary" />
            </button>
          )}
          {onDownload && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onDownload();
              }}
              aria-label="Download meme"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/70"
            >
              <Download size={14} className="text-text-primary" />
            </button>
          )}
        </div>
      </div>

      <div className="px-2.5 py-2">
        <p className={cn('truncate text-sm font-semibold text-text-primary-light dark:text-text-primary')}>
          {meme.title}
        </p>
        <div className="mt-1.5 flex items-center">
          <Avatar src={meme.creatorAvatar} name={meme.creatorName} size="xs" />
          <p className="ml-1.5 truncate text-xs text-text-muted">
            @{meme.creatorName} · {meme.uploadedAt}
          </p>
        </div>
      </div>
    </Link>
  );
}