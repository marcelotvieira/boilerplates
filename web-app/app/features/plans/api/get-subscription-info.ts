import { billingFetch } from '@/lib/fetch-utils';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import CACHE_KEYS from '@/lib/cache/tags';
import type { GetSubscriptionInfoResponse } from '../types/plans.types';

export async function getSubscriptionInfo(token: string) {
  'use cache';
  cacheTag(CACHE_KEYS.SUBSCRIPTION);

  return billingFetch<GetSubscriptionInfoResponse>(
    '/subscriptions/me',
    token,
    { method: 'GET' },
  );
}
