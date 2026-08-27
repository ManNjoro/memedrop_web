import { useQuery } from '@tanstack/react-query';
import { fetchSavedMemes, fetchUserMemes, fetchUserProfile } from '../api/users';
import { queryKeys } from './keys';

export function useUserProfileQuery(username: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.profile(username ?? ''),
    queryFn: () => fetchUserProfile(username!),
    enabled: !!username,
  });
}

export function useUserMemesQuery(username: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.memes(username ?? ''),
    queryFn: () => fetchUserMemes(username!),
    enabled: !!username,
  });
}

/** Own saved memes — auth required, only meaningful for the signed-in user's own Profile page. */
export function useSavedMemesQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.saved,
    queryFn: fetchSavedMemes,
    enabled,
  });
}