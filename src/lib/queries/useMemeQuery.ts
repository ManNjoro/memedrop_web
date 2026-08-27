import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteMeme,
  fetchMemeById,
  likeMeme,
  saveMeme,
  unlikeMeme,
  unsaveMeme,
} from '../api/memes';
import type { ApiMemeDetail } from '../api/types';
import { queryKeys } from './keys';

export function useMemeQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.memes.detail(id ?? ''),
    queryFn: () => fetchMemeById(id!),
    enabled: !!id,
  });
}

/** Toggles like state with an optimistic cache update, rolling back on failure. */
export function useLikeMutation(id: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.memes.detail(id);

  return useMutation({
    mutationFn: (wasLiked: boolean) => (wasLiked ? unlikeMeme(id) : likeMeme(id)),
    onMutate: async (wasLiked) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ApiMemeDetail>(queryKey);
      if (previous) {
        queryClient.setQueryData<ApiMemeDetail>(queryKey, {
          ...previous,
          isLiked: !wasLiked,
          likesCount: wasLiked ? Math.max(previous.likesCount - 1, 0) : previous.likesCount + 1,
        });
      }
      return { previous };
    },
    onError: (_err, _wasLiked, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/** Toggles saved state with an optimistic cache update, rolling back on failure. */
export function useSaveMutation(id: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.memes.detail(id);

  return useMutation({
    mutationFn: (wasSaved: boolean) => (wasSaved ? unsaveMeme(id) : saveMeme(id)),
    onMutate: async (wasSaved) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ApiMemeDetail>(queryKey);
      if (previous) {
        queryClient.setQueryData<ApiMemeDetail>(queryKey, { ...previous, isSaved: !wasSaved });
      }
      return { previous };
    },
    onError: (_err, _wasSaved, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.saved });
    },
  });
}

export function useDeleteMemeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMeme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.memes.all });
    },
  });
}