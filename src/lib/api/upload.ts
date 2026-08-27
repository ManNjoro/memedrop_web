import { apiClient, toApiClientError } from './client';
import type { ApiMediaType, UploadSignature } from './types';

export async function fetchUploadSignature(mediaType: ApiMediaType): Promise<UploadSignature> {
  try {
    const { data } = await apiClient.post<UploadSignature>('/api/upload/signature', { mediaType });
    return data;
  } catch (e) {
    throw toApiClientError(e);
  }
}

export async function cleanupOrphanedUpload(publicId: string, mediaType: ApiMediaType): Promise<void> {
  try {
    await apiClient.post('/api/upload/cleanup', { publicId, mediaType });
  } catch (e) {
    throw toApiClientError(e);
  }
}