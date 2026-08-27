import type { FetchMemesParams } from '../api/memes';

export const queryKeys = {
  memes: {
    all: ['memes'] as const,
    list: (params: FetchMemesParams) => ['memes', 'list', params] as const,
    detail: (id: string) => ['memes', 'detail', id] as const,
  },
  users: {
    profile: (username: string) => ['users', 'profile', username] as const,
    memes: (username: string) => ['users', 'memes', username] as const,
  },
  saved: ['saved'] as const,
};