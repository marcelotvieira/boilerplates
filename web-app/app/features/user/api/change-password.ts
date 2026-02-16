import { authenticatedFetch } from '@/lib/fetch-utils';
import type { ChangePasswordInput, ChangePasswordResponse } from '../types/user.types';

export async function changePassword(
  token: string,
  data: ChangePasswordInput,
) {
  return authenticatedFetch<ChangePasswordResponse>(
    '/users/change-password',
    token,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
}
