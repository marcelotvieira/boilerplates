import { authenticatedFetch } from '@/lib/fetch-utils';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import CACHE_KEYS from '@/lib/cache/tags';
import type { GetInvitesResponse } from '../types/workspace.types';

export async function getInvites(token: string) {
  'use cache';
  cacheTag(CACHE_KEYS.TENANT_INVITES);

  return authenticatedFetch<GetInvitesResponse>(
    '/invites',
    token,
    { method: 'GET' },
  );
}
