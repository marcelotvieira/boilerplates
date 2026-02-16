import { billingFetch } from '@/lib/fetch-utils';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import CACHE_KEYS from '@/lib/cache/tags';
import type { ListPlansResponse } from '../types/plans.types';

export async function listPlans(token: string) {
  'use cache';
  cacheTag(CACHE_KEYS.PLANS);

  return billingFetch<ListPlansResponse>(
    '/plans',
    token,
    { method: 'GET' },
  );
}
