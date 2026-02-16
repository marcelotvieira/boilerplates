import { authenticatedFetch } from '@/lib/fetch-utils';
import type { UpdateTenantInput, UpdateTenantResponse } from '../types/workspace.types';

export async function updateTenant(token: string, data: UpdateTenantInput) {
  return authenticatedFetch<UpdateTenantResponse>(
    '/tenants/me',
    token,
    { method: 'PATCH', body: JSON.stringify(data) },
  );
}
