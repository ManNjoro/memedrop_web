import type { CardMeme } from '@/components/ui/MediaCard';
import type { ApiMemeListItem, ApiUserMemeItem } from '@/lib/api/types';
import { formatRelativeTime } from '@/lib/formatRelativeTime';

/** Maps a GET /api/memes list row into the shape MediaCard renders — video cards use the Cloudinary poster, not the raw video file, as the static preview. */
export function toCardMeme(item: ApiMemeListItem): CardMeme {
  return {
    id: item?.id,
    title: item?.title,
    mediaUrl: item?.mediaType === 'video' ? item.thumbnailUrl ?? item.mediaUrl : item?.mediaUrl,
    mediaType: item?.mediaType,
    durationSec: item?.durationSec,
    creatorName: item?.uploaderUsername,
    creatorAvatar: item?.uploaderAvatarUrl,
    uploadedAt: formatRelativeTime(item?.createdAt),
    aspectRatio: item?.width && item?.height ? item.width / item.height : undefined,
  };
}

/** Same mapping for a user's own/public meme grid, where the uploader isn't repeated per-row. */
export function toCardMemeFromUserItem(item: ApiUserMemeItem, username: string, avatarUrl?: string | null): CardMeme {
  return {
    id: item.id,
    title: item.title,
    mediaUrl: item.mediaType === 'video' ? item.thumbnailUrl ?? item.mediaUrl : item.mediaUrl,
    mediaType: item.mediaType,
    durationSec: item.durationSec,
    creatorName: username,
    creatorAvatar: avatarUrl,
    uploadedAt: formatRelativeTime(item.createdAt),
    aspectRatio: item.width && item.height ? item.width / item.height : undefined,
  };
}