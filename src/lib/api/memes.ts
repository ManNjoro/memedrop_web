import { apiClient, toApiClientError } from './client';
import type { ApiMediaType, ApiMemeDetail, ApiMemesResponse, ApiSort } from './types';

export type FetchMemesParams = {
  q?: string;
  mediaType?: ApiMediaType;
  sort?: ApiSort;
  cursor?: string | null;
  limit?: number;
};

export async function fetchMemes(params: FetchMemesParams = {}): Promise<ApiMemesResponse> {
  try {
    const { data } = await apiClient.get<ApiMemesResponse>('/api/memes', { params });
    return data;
  } catch (e) {
    throw toApiClientError(e);
  }
}

export async function fetchMemeById(id: string): Promise<ApiMemeDetail> {
  try {
    const { data } = await apiClient.get<ApiMemeDetail>(`/api/memes/${id}`);
    return data;
  } catch (e) {
    throw toApiClientError(e);
  }
}

export type CreateMemeInput = {
  title: string;
  description?: string;
  tags: string[];
  mediaType: ApiMediaType;
  cloudinaryPublicId: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  durationSec?: number;
  width?: number;
  height?: number;
};

export async function createMeme(input: CreateMemeInput): Promise<{ id: string }> {
  try {
    const { data } = await apiClient.post<{ id: string }>('/api/memes', input);
    return data;
  } catch (e) {
    throw toApiClientError(e);
  }
}

export async function deleteMeme(id: string): Promise<void> {
  try {
    await apiClient.delete(`/api/memes/${id}`);
  } catch (e) {
    throw toApiClientError(e);
  }
}

export async function recordDownload(id: string): Promise<{ downloadsCount: number }> {
  try {
    const { data } = await apiClient.post<{ downloadsCount: number }>(`/api/memes/${id}/download`);
    return data;
  } catch (e) {
    throw toApiClientError(e);
  }
}

export async function recordView(id: string): Promise<{ viewsCount: number }> {
  try {
    const { data } = await apiClient.post<{ viewsCount: number }>(`/api/memes/${id}/view`);
    return data;
  } catch (e) {
    throw toApiClientError(e);
  }
}

export async function likeMeme(id: string): Promise<{ liked: boolean; likesCount: number }> {
  try {
    const { data } = await apiClient.post(`/api/memes/${id}/like`);
    return data;
  } catch (e) {
    throw toApiClientError(e);
  }
}

export async function unlikeMeme(id: string): Promise<{ liked: boolean; likesCount: number }> {
  try {
    const { data } = await apiClient.delete(`/api/memes/${id}/like`);
    return data;
  } catch (e) {
    throw toApiClientError(e);
  }
}

export async function saveMeme(id: string): Promise<{ saved: boolean }> {
  try {
    const { data } = await apiClient.post(`/api/memes/${id}/save`);
    return data;
  } catch (e) {
    throw toApiClientError(e);
  }
}

export async function unsaveMeme(id: string): Promise<{ saved: boolean }> {
  try {
    const { data } = await apiClient.delete(`/api/memes/${id}/save`);
    return data;
  } catch (e) {
    throw toApiClientError(e);
  }
}