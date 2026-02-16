import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  DataList,
  DataListSkeleton,
  Pagination,
  ViewToggle,
  ItemsPerPageSelector,
} from '@/components/data-list';
import { getMembers } from '@/app/features/workspace/api/get-members';
import { parseDataListParams, paginateItems } from '@/lib/search-params';
import type { TenantMember } from '../types/workspace.types';
import { CreateInviteDialog } from './create-invite-dialog';

const roleLabels: Record<string, string> = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  MEMBER: 'Membro',
};

function MemberRow({ member }: { member: TenantMember }) {
  const createdDate = new Date(member.createdAt)
    .toLocaleDateString('pt-BR');

  return (
    <div className="flex items-center justify-between flex-wrap gap-2 rounded-lg border p-4">
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-medium truncate">{member.fullName}</span>
        <span className="text-sm text-muted-foreground truncate">
          {member.email}
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Badge variant="outline">
          {roleLabels[member.role] ?? member.role}
        </Badge>
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {createdDate}
        </span>
      </div>
    </div>
  );
}

interface MembersDataProps {
  searchParams: Record<string, string | string[] | undefined>;
  pathname: string;
}

async function MembersData({ searchParams, pathname }: MembersDataProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  const { view, page, perPage } = parseDataListParams(
    searchParams,
    { view: 'grid' },
  );

  let members: TenantMember[] | undefined;
  let error: string | undefined;

  try {
    const result = await getMembers(token);
    members = result.data.members;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Erro desconhecido';
  }

  if (error || !members) {
    return (
      <div className="text-destructive">
        Erro ao carregar membros: {error || 'Dados não encontrados'}
      </div>
    );
  }

  const pagination = paginateItems(members, page, perPage);

  return (
    <>
      <DataList
        items={pagination.paginatedItems}
        viewMode={view}
        renderItem={(member) => <MemberRow member={member} />}
        keyExtractor={(member) => member.id}
        emptyMessage="Nenhum membro encontrado."
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

interface MembersListProps {
  searchParams: Record<string, string | string[] | undefined>;
  pathname: string;
}

export function MembersList({ searchParams, pathname }: MembersListProps) {
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
        <div className="ml-auto">
          <CreateInviteDialog triggerLabel="Convidar" />
        </div>
      </div>

      <Suspense fallback={<DataListSkeleton viewMode={view} />}>
        <MembersData searchParams={searchParams} pathname={pathname} />
      </Suspense>
    </div>
  );
}
