import { authenticatedFetch } from '@/lib/fetch-utils';
import type { UpdateProfileInput, UpdateProfileResponse } from '../types/user.types';

/**
 * Update user profile (mutation - no cache)
 * Token must be passed as parameter
 */
export async function updateProfile(token: string, data: UpdateProfileInput) {
  return authenticatedFetch<UpdateProfileResponse>(
    '/users/profile',
    token,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );
}
