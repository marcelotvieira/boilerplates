import { authenticatedFetch } from '@/lib/fetch-utils';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import CACHE_KEYS from '@/lib/cache/tags';
import type { GetProfileResponse } from '../types/user.types';

/**
 * Cached function to get user profile
 * IMPORTANT: Token must be passed as parameter (NOT from cookies)
 * This ensures cookies() is called OUTSIDE the cache scope
 */
export async function getProfile(token: string) {
  'use cache';
  cacheTag(CACHE_KEYS.USER_PROFILE);

  return authenticatedFetch<GetProfileResponse>(
    '/users/profile',
    token,
    { method: 'GET' },
  );
}
