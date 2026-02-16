import { authenticatedFetch } from '@/lib/fetch-utils';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import CACHE_KEYS from '@/lib/cache/tags';
import type { GetTenantResponse } from '../types/workspace.types';

export async function getTenant(token: string) {
  'use cache';
  cacheTag(CACHE_KEYS.CURRENT_TENANT);

  return authenticatedFetch<GetTenantResponse>(
    '/tenants/me',
    token,
    { method: 'GET' },
  );
}
