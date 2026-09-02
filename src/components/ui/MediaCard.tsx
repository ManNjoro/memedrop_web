import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, ImageOff, Play, Share2 } from 'lucide-react';
import { Avatar } from './Avatar';
import { StatusBadge } from './Chip';
import { cn } from '@/lib/utils';

export type CardMeme = {
  id: string;
  title: string;
  // The image to show, when one exists — always set for image memes, and
  // set for video memes only when Cloudinary's auto-generated poster
  // (thumbnailUrl) is available.
  previewUrl: string | null;
  // Raw video file, used as a <video preload="metadata"> fallback when
  // previewUrl is null — the browser renders the first frame on its own
  // once metadata loads, so this still shows something real rather than a
  // blank box. Only ever set for video memes.
  videoSrc?: string;
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
  // Tracks a broken previewUrl (e.g. a stale/deleted Cloudinary asset) so we
  // can fall back gracefully instead of showing the browser's broken-image icon.
  const [imageFailed, setImageFailed] = useState(false);

  const showImage = !!meme.previewUrl && !imageFailed;
  const showVideoFallback = !showImage && meme.mediaType === 'video' && !!meme.videoSrc;

  return (
    <Link
      to={`/meme/${meme.id}`}
      aria-label={`Open meme: ${meme.title}`}
      className="group block overflow-hidden rounded-lg border border-border-light dark:border-border bg-surface-light dark:bg-surface shadow-sm transition-shadow hover:shadow-lg"
    >
      <div
        className="relative w-full overflow-hidden bg-surface-alt-light dark:bg-surface-alt"
        style={{ aspectRatio: aspect }}
      >
        {showImage ? (
          <img
            src={meme.previewUrl!}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : showVideoFallback ? (
          <video
            src={meme.videoSrc}
            preload="metadata"
            muted
            playsInline
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff size={28} className="text-text-muted" strokeWidth={1.5} />
          </div>
        )}

        {meme.mediaType === 'video' && (
          <>
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 transition-transform group-hover:scale-110">
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
              className="mr-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 cursor-pointer"
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
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 cursor-pointer"
            >
              <Download size={14} className="text-text-primary" />
            </button>
          )}
        </div>
      </div>

      <div className="px-3 py-2.5">
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