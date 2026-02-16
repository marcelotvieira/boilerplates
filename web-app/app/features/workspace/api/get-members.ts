import { authenticatedFetch } from '@/lib/fetch-utils';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import CACHE_KEYS from '@/lib/cache/tags';
import type { GetMembersResponse } from '../types/workspace.types';

export async function getMembers(token: string) {
  'use cache';
  cacheTag(CACHE_KEYS.TENANT_MEMBERS);

  return authenticatedFetch<GetMembersResponse>(
    '/tenants/me/members',
    token,
    { method: 'GET' },
  );
}
