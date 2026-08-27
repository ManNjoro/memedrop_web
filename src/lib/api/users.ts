import { apiClient, toApiClientError } from './client';
import type { ApiMemeListItem, ApiUserMemeItem, ApiUserProfile } from './types';

export async function fetchUserProfile(username: string): Promise<ApiUserProfile> {
  try {
    const { data } = await apiClient.get<ApiUserProfile>(`/api/users/${encodeURIComponent(username)}`);
    return data;
  } catch (e) {
    throw toApiClientError(e);
  }
}

export async function fetchUserMemes(username: string): Promise<{ memes: ApiUserMemeItem[] }> {
  try {
    const { data } = await apiClient.get<{ memes: ApiUserMemeItem[] }>(
      `/api/users/${encodeURIComponent(username)}/memes`
    );
    return data;
  } catch (e) {
    throw toApiClientError(e);
  }
}

/** Upserts the signed-in user's Neon row from their live Clerk record — see the mobile app's identical endpoint for why this exists (closing the webhook-lag gap right after sign-up). */
export async function syncUser(): Promise<ApiUserProfile> {
  try {
    const { data } = await apiClient.post<ApiUserProfile>('/api/users/sync');
    return data;
  } catch (e) {
    throw toApiClientError(e);
  }
}

export async function fetchSavedMemes(): Promise<{ memes: ApiMemeListItem[] }> {
  try {
    const { data } = await apiClient.get<{ memes: ApiMemeListItem[] }>('/api/saved');
    return data;
  } catch (e) {
    throw toApiClientError(e);
  }
}