import { authenticatedFetch } from '@/lib/fetch-utils';
import type {
  CreateInviteInput,
  CreateInviteResponse,
} from '../types/workspace.types';

export async function createInvite(
  token: string,
  data: CreateInviteInput,
) {
  return authenticatedFetch<CreateInviteResponse>(
    '/invites',
    token,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
}
