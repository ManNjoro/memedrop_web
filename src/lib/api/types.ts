export type ApiMediaType = 'image' | 'video';
export type ApiSort = 'newest' | 'oldest' | 'most_downloaded' | 'most_popular';

export type ApiMemeListItem = {
  id: string;
  title: string;
  mediaType: ApiMediaType;
  mediaUrl: string;
  thumbnailUrl: string | null;
  durationSec: number | null;
  width: number | null;
  height: number | null;
  downloadsCount: number;
  likesCount: number;
  viewsCount: number;
  createdAt: string; // ISO
  uploaderId: string;
  uploaderUsername: string;
  uploaderAvatarUrl: string | null;
};

export type ApiMemesResponse = {
  memes: ApiMemeListItem[];
  nextCursor: string | null;
};

export type ApiMemeDetail = {
  id: string;
  uploaderId: string;
  title: string;
  description: string | null;
  mediaType: ApiMediaType;
  cloudinaryPublicId: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  durationSec: number | null;
  width: number | null;
  height: number | null;
  downloadsCount: number;
  likesCount: number;
  viewsCount: number;
  createdAt: string;
  uploader: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  tags: string[];
  isLiked: boolean;
  isSaved: boolean;
};

export type ApiUserMemeItem = {
  id: string;
  uploaderId: string;
  title: string;
  description: string | null;
  mediaType: ApiMediaType;
  cloudinaryPublicId: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  durationSec: number | null;
  width: number | null;
  height: number | null;
  downloadsCount: number;
  likesCount: number;
  viewsCount: number;
  createdAt: string;
};

export type ApiUserProfile = {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  memeCount: number;
};

export type UploadSignature = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  resourceType: ApiMediaType;
  uploadUrl: string;
};