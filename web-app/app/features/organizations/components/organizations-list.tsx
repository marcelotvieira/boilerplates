import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  DataList,
  DataListSkeleton,
  Pagination,
  ViewToggle,
  ItemsPerPageSelector,
} from '@/components/data-list';
import {
  getUserOrganizations,
} from '@/app/features/organizations/api/get-organizations';
import { OrganizationCard } from './organization-card';
import { parseDataListParams, paginateItems } from '@/lib/search-params';
import type { OrganizationMembership } from '../types/organization.types';

interface OrganizationsDataProps {
  searchParams: Record<string, string | string[] | undefined>;
  pathname: string;
}

async function OrganizationsData({
  searchParams,
  pathname,
}: OrganizationsDataProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  const { view, page, perPage } = parseDataListParams(
    searchParams,
    { view: 'grid' },
  );

  let organizations: OrganizationMembership[] | undefined;
  let error: string | undefined;

  try {
    const result = await getUserOrganizations(token);
    organizations = result.data.tenants;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Erro desconhecido';
  }

  if (error || !organizations) {
    return (
      <div className="text-destructive">
        Erro ao carregar organizações:{' '}
        {error || 'Dados não encontrados'}
      </div>
    );
  }

  const pagination = paginateItems(organizations, page, perPage);

  return (
    <>
      <DataList
        items={pagination.paginatedItems}
        viewMode={view}
        renderItem={(membership) => (
          <OrganizationCard membership={membership} />
        )}
        keyExtractor={(membership) => membership.tenant.id}
        emptyMessage="Você não pertence a nenhuma organização ainda."
        gridClassName="grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
      />
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          pathname={pathname}
          searchParams={searchParams}
        />
      )}
    </>
  );
}

interface OrganizationsListProps {
  searchParams: Record<string, string | string[] | undefined>;
  pathname: string;
}

export function OrganizationsList({
  searchParams,
  pathname,
}: OrganizationsListProps) {
  const { view, perPage } = parseDataListParams(
    searchParams,
    { view: 'grid' },
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <ViewToggle
          viewMode={view}
          pathname={pathname}
          searchParams={searchParams}
        />
        <ItemsPerPageSelector
          value={perPage}
          pathname={pathname}
          searchParams={searchParams}
        />
      </div>
      <Suspense
        fallback={(
          <DataListSkeleton
            viewMode={view}
            gridClassName="grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
          />
        )}
      >
        <OrganizationsData
          searchParams={searchParams}
          pathname={pathname}
        />
      </Suspense>
    </div>
  );
}
