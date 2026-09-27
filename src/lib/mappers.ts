import type { CardMeme } from '@/components/ui/MediaCard';
import type { ApiMemeListItem, ApiUserMemeItem } from '@/lib/api/types';
import { formatRelativeTime } from '@/lib/formatRelativeTime';

/**
 * Maps a GET /api/memes list row into the shape MediaCard renders.
 * previewUrl and videoSrc are kept separate rather than collapsed into one
 * "mediaUrl" — a video with no Cloudinary poster yet (thumbnailUrl null)
 * must never have its raw .mp4 fed into an <img>, which fails silently and
 * renders a blank box. MediaCard falls back to an actual <video> element
 * in that case instead.
 */
export function toCardMeme(item: ApiMemeListItem): CardMeme {
  return {
    id: item.id,
    title: item.title,
    previewUrl: item.mediaType === 'video' ? item.thumbnailUrl : item.mediaUrl,
    videoSrc: item.mediaType === 'video' ? item.mediaUrl : undefined,
    mediaType: item.mediaType,
    durationSec: item.durationSec,
    creatorName: item.uploaderUsername,
    creatorAvatar: item.uploaderAvatarUrl,
    uploadedAt: formatRelativeTime(item.createdAt),
    aspectRatio: item.width && item.height ? item.width / item.height : undefined,
    downloadsCount: item.downloadsCount,
    likesCount: item.likesCount,
    viewsCount: item.viewsCount
  };
}

/** Same mapping for a user's own/public meme grid, where the uploader isn't repeated per-row. */
export function toCardMemeFromUserItem(item: ApiUserMemeItem, username: string, avatarUrl?: string | null): CardMeme {
  return {
    id: item.id,
    title: item.title,
    previewUrl: item.mediaType === 'video' ? item.thumbnailUrl : item.mediaUrl,
    videoSrc: item.mediaType === 'video' ? item.mediaUrl : undefined,
    mediaType: item.mediaType,
    durationSec: item.durationSec,
    creatorName: username,
    creatorAvatar: avatarUrl,
    uploadedAt: formatRelativeTime(item.createdAt),
    aspectRatio: item.width && item.height ? item.width / item.height : undefined,
  };
}