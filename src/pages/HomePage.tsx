import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ImageOff, WifiOff } from "lucide-react";
import { CategoryChip } from "@/components/ui/Chip";
import { MediaCard } from "@/components/ui/MediaCard";
import { toCardMeme } from "@/lib/mappers";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { InfiniteScrollSentinel } from "@/components/ui/InfiniteScrollSentinel";
import { useMemesQuery } from "@/lib/queries/useMemesQuery";
import { recordDownload, type FetchMemesParams } from "@/lib/api/memes";
import { usePostHog } from "@posthog/react";

const CATEGORIES = [
  "Trending",
  "Latest",
  "Videos",
  "Images",
  "Popular",
] as const;
type Category = (typeof CATEGORIES)[number];

function paramsForCategory(category: Category): FetchMemesParams {
  switch (category) {
    case "Trending":
      return { sort: "most_popular", limit: 11 };
    case "Latest":
      return { sort: "newest", limit: 11 };
    case "Videos":
      return { mediaType: "video", sort: "newest", limit: 11 };
    case "Images":
      return { mediaType: "image", sort: "newest", limit: 11 };
    case "Popular":
      return { sort: "most_downloaded", limit: 11 };
  }
}

const getMediaUrl = (meme: ReturnType<typeof toCardMeme>) => {
  return meme.videoSrc || meme.previewUrl || null;
};

const sanitizeFilename = (name: string) => {
  return name
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
};

const getExtension = (url: string, mediaType?: string) => {
  if (mediaType === "video") return "mp4";

  try {
    const pathname = new URL(url).pathname;
    const extension = pathname.split(".").pop()?.toLowerCase();

    if (extension && /^(jpg|jpeg|png|webp|gif)$/i.test(extension)) {
      return extension;
    }
  } catch {
    // Fall back to jpg
  }

  return "jpg";
};

const copyToClipboard = async (text: string) => {
  if (!navigator.clipboard?.writeText) {
    throw new Error("Clipboard API is not supported by this browser");
  }

  await navigator.clipboard.writeText(text);
};

export function HomePage() {
  const [activeCategory, setActiveCategory] = useState<Category>("Trending");
  const [linkCopied, setLinkCopied] = useState(false);
  const params = useMemo(
    () => paramsForCategory(activeCategory),
    [activeCategory],
  );
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMemesQuery(params);
  const posthog = usePostHog();

  const memes = data?.pages.flatMap((page) => page.memes) ?? [];
  const [featured, ...rest] = memes;
  const featuredCard = featured ? toCardMeme(featured) : null;

  const onDownload = async (meme: ReturnType<typeof toCardMeme>) => {
    const url = getMediaUrl(meme);

    if (!url) {
      console.error("No media URL available for download");
      return;
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();

      const objectUrl = URL.createObjectURL(blob);

      const extension = getExtension(url, meme.videoSrc ? "video" : "image");
      const filename = `${sanitizeFilename(meme.title || "memedrop-meme")}.${extension}`;

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(objectUrl);
      recordDownload(meme.id).catch(() => {});
      posthog?.capture("meme_downloaded", {
        meme_id: meme.id,
        media_type: meme.mediaType,
      });
    } catch (error) {
      console.error("Failed to download meme:", error);

      // Fallback: open the media directly if fetching as a blob fails
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const onShare = async (meme: ReturnType<typeof toCardMeme>) => {
    const shareUrl = `${window.location.origin}/meme/${meme.id}`;

    try {
      // Use native Web Share when available
      if (navigator.share) {
        await navigator.share({
          title: meme.title,
          text: `Check out "${meme.title}" on MemeDrop`,
          url: shareUrl,
        });

        return;
      }

      // Otherwise copy the link
      await copyToClipboard(shareUrl);

      setLinkCopied(true);

      window.setTimeout(() => {
        setLinkCopied(false);
      }, 2500);
    } catch (error) {
      // User cancelled native share dialog
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("Failed to share meme:", error);
    }
  };

  return (
    <div>
      <h1 className="mb-5 text-[26px] font-extrabold leading-8 text-text-primary-light dark:text-text-primary">
        Your daily dose
        <br />
        of internet chaos.
      </h1>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat}
            label={cat}
            selected={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          />
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
                  <img
                    src={featuredCard.previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : featuredCard.videoSrc ? (
                  <video
                    src={featuredCard.videoSrc}
                    preload="metadata"
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-alt-light dark:bg-surface-alt">
                    <ImageOff
                      size={40}
                      className="text-text-muted"
                      strokeWidth={1.5}
                    />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent px-5 pb-4 pt-16">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-text-primary">
                    🔥 Featured
                  </p>
                  <p className="text-xl font-bold text-text-primary">
                    {featuredCard.title}
                  </p>
                </div>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {rest.map((item) => (
              <MediaCard
                key={item.id}
                meme={toCardMeme(item)}
                variant="grid"
                onDownload={() => onDownload(toCardMeme(item))}
                onShare={() => onShare(toCardMeme(item))}
              />
            ))}
          </div>
          <InfiniteScrollSentinel
            onIntersect={() => fetchNextPage()}
            enabled={!!hasNextPage && !isFetchingNextPage}
          />
          {isFetchingNextPage && <SkeletonGrid count={5} />}
          {!hasNextPage && memes.length > 0 && (
            <p className="py-6 text-center text-xs text-text-muted">
              You've reached the end.
            </p>
          )}
        </>
      )}
      {linkCopied && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-2 rounded-full bg-surface-alt px-4 py-3 text-sm font-semibold text-text-primary shadow-lg ring-1 ring-border">
            <Check size={18} strokeWidth={2.5} />
            Link copied!
          </div>
        </div>
      )}
    </div>
  );
}
