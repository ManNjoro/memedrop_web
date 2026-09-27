import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  ImageOff,
  Play,
  Share2,
  Clock3,
  MessageCircle,
  Heart,
  Eye,
} from "lucide-react";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

export type CardMeme = {
  id: string;
  title: string;
  previewUrl: string | null;
  videoSrc?: string;
  mediaType: "image" | "video";
  durationSec?: number | null;

  creatorName: string;
  creatorAvatar?: string | null;
  uploadedAt: string;

  viewsCount?: number;
  likesCount?: number;
  downloadsCount?: number;
  commentsCount?: number;

  aspectRatio?: number;
};

type MediaCardProps = {
  meme: CardMeme;
  variant?: "grid" | "feed";
  onDownload?: () => void;
  onShare?: () => void;
};

function formatDuration(sec?: number | null) {
  if (!sec) return "";

  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);

  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatCount(value?: number | null) {
  if (!value) return "0";

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }

  return value.toString();
}

export function MediaCard({
  meme,
  variant = "grid",
  onDownload,
  onShare,
}: MediaCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const showImage = Boolean(meme.previewUrl) && !imageFailed;
  const showVideoFallback =
    !showImage && meme.mediaType === "video" && Boolean(meme.videoSrc);

  /*
   * Important:
   *
   * Grid cards use a consistent aspect ratio.
   * This prevents one portrait video from making the entire
   * grid row extremely tall.
   */
  const mediaAspect =
    variant === "grid"
      ? "4 / 5"
      : meme.aspectRatio
        ? `${meme.aspectRatio}`
        : "16 / 10";

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "border border-border-light/70 dark:border-border",
        "bg-surface-light dark:bg-surface",
        "shadow-sm",
        "transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl",
        "hover:border-border-light dark:hover:border-border",
      )}
    >
      <Link
        to={`/meme/${meme.id}`}
        aria-label={`Open meme: ${meme.title}`}
        className="block"
      >
        {/* Media */}
        <div
          className="relative w-full overflow-hidden bg-surface-alt-light dark:bg-surface-alt"
          style={{ aspectRatio: mediaAspect }}
        >
          {showImage ? (
            <img
              src={meme.previewUrl!}
              alt=""
              loading="lazy"
              onError={() => setImageFailed(true)}
              className={cn(
                "h-full w-full object-cover",
                "transition-transform duration-500 ease-out",
                "group-hover:scale-[1.04]",
              )}
            />
          ) : showVideoFallback ? (
            <video
              src={meme.videoSrc}
              preload="metadata"
              muted
              playsInline
              className={cn(
                "h-full w-full object-cover",
                "transition-transform duration-500 ease-out",
                "group-hover:scale-[1.04]",
              )}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-light/80 dark:bg-surface/80">
                <ImageOff
                  size={22}
                  strokeWidth={1.5}
                  className="text-text-muted"
                />
              </div>
            </div>
          )}

          {/* Subtle bottom gradient */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/65 via-black/15 to-transparent" />

          {/* Video indicator */}
          {meme.mediaType === "video" && (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center",
                    "rounded-full",
                    "border border-white/20",
                    "bg-black/55 backdrop-blur-md",
                    "shadow-lg",
                    "transition-all duration-300",
                    "group-hover:scale-110 group-hover:bg-black/70",
                  )}
                >
                  <Play size={19} className="ml-0.5 fill-white text-white" />
                </div>
              </div>

              {meme.durationSec ? (
                <div
                  className={cn(
                    "absolute bottom-2.5 right-2.5",
                    "flex items-center gap-1",
                    "rounded-md",
                    "bg-black/70 px-2 py-1",
                    "text-[11px] font-medium text-white",
                    "backdrop-blur-sm",
                  )}
                >
                  <Clock3 size={11} />
                  {formatDuration(meme.durationSec)}
                </div>
              ) : null}
            </>
          )}

          {/* Quick actions */}
          
        </div>

        {/* Content */}
        <div className="px-3.5 pb-3.5 pt-3">
          {/* Title */}
          <h3
            className={cn(
              "line-clamp-2",
              "text-sm font-semibold leading-5",
              "text-text-primary-light dark:text-text-primary",
              "transition-colors",
              "group-hover:text-primary",
            )}
          >
            {meme.title}
          </h3>

          {/* Creator */}
          <div className="mt-3 flex min-w-0 items-center gap-2">
            <Avatar
              src={meme.creatorAvatar}
              name={meme.creatorName}
              size="xs"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-text-primary-light dark:text-text-primary">
                @{meme.creatorName}
              </p>

              <p className="truncate text-[11px] text-text-muted">
                {meme.uploadedAt}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div
            className={cn(
              "mt-3 flex items-center gap-3",
              "border-t border-border-light/60 dark:border-border/70",
              "pt-2.5",
              "text-[11px] text-text-muted",
            )}
          >
            {/* Views */}
            <div className="flex items-center gap-1">
              <Eye size={13} strokeWidth={1.8} />
              <span>{formatCount(meme.viewsCount)}</span>
            </div>

            {/* Likes */}
            <div className="flex items-center gap-1">
              <Heart size={13} strokeWidth={1.8} />
              <span>{formatCount(meme.likesCount)}</span>
            </div>

            {/* Downloads */}
            <div className="flex items-center gap-1">
              <Download size={13} strokeWidth={1.8} />
              <span>{formatCount(meme.downloadsCount)}</span>
            </div>

            {/* Comments */}
            {meme.commentsCount !== undefined && (
              <div className="flex items-center gap-1">
                <MessageCircle size={13} strokeWidth={1.8} />
                <span>{formatCount(meme.commentsCount)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
      {(onShare || onDownload) && (
            <div
              className={cn(
                "absolute right-2.5 top-2.5",
                "flex gap-1.5",
                "opacity-0 translate-y-1",
                "transition-all duration-200",
                "group-hover:translate-y-0 group-hover:opacity-100",
                "group-focus-within:translate-y-0 group-focus-within:opacity-100"
              )}
            >
              {onShare && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onShare();
                  }}
                  aria-label="Share meme"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center",
                    "rounded-full",
                    "border border-white/10",
                    "bg-black/60 backdrop-blur-md",
                    "text-white",
                    "transition-colors",
                    "hover:bg-black/80",
                    "cursor-pointer",
                  )}
                >
                  <Share2 size={15} />
                </button>
              )}

              {onDownload && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDownload();
                  }}
                  aria-label="Download meme"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center",
                    "rounded-full",
                    "border border-white/10",
                    "bg-black/60 backdrop-blur-md",
                    "text-white",
                    "transition-colors",
                    "hover:bg-black/80",
                    "cursor-pointer",
                  )}
                >
                  <Download size={15} />
                </button>
              )}
            </div>
          )}
    </article>
  );
}
