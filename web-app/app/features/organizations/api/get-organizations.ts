import { authenticatedFetch } from '@/lib/fetch-utils';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import CACHE_KEYS from '@/lib/cache/tags';
import type { ListOrganizationsResponse } from '../types/organization.types';

/**
 * Cached function to get user organizations
 * IMPORTANT: Token must be passed as parameter (NOT from cookies)
 * This ensures cookies() is called OUTSIDE the cache scope
 */
export async function getUserOrganizations(token: string) {
  'use cache';
  cacheTag(CACHE_KEYS.USER_TENANTS);

  return authenticatedFetch<ListOrganizationsResponse>(
    '/users/me/tenants',
    token,
    { method: 'GET' },
  );
}
