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
import { getInvites } from '@/app/features/workspace/api/get-invites';
import { parseDataListParams, paginateItems } from '@/lib/search-params';
import { CreateInviteDialog } from './create-invite-dialog';
import type { Invite } from '../types/workspace.types';

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  MEMBER: 'Membro',
};

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: {
    label: 'Pendente',
    className: 'text-yellow-600 border-yellow-600',
  },
  ACCEPTED: {
    label: 'Aceito',
    className: 'text-green-600 border-green-600',
  },
  EXPIRED: {
    label: 'Expirado',
    className: 'text-red-600 border-red-600',
  },
};

function InviteRow({ invite }: { invite: Invite }) {
  const createdDate = new Date(invite.createdAt)
    .toLocaleDateString('pt-BR');
  const expiresDate = new Date(invite.expiresAt)
    .toLocaleDateString('pt-BR');
  const status = statusConfig[invite.status]
    ?? { label: invite.status, className: '' };

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-medium truncate">{invite.email}</span>
        <span className="text-sm text-muted-foreground">
          Enviado em {createdDate} &middot; Expira em {expiresDate}
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Badge variant="outline">
          {roleLabels[invite.role] ?? invite.role}
        </Badge>
        <Badge variant="outline" className={status.className}>
          {status.label}
        </Badge>
      </div>
    </div>
  );
}

interface InvitesDataProps {
  searchParams: Record<string, string | string[] | undefined>;
  pathname: string;
}

async function InvitesData({
  searchParams,
  pathname,
}: InvitesDataProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  const { view, page, perPage } = parseDataListParams(
    searchParams,
    { view: 'grid' },
  );

  let invites: Invite[] | undefined;
  let error: string | undefined;

  try {
    const result = await getInvites(token);
    invites = result.data.invites;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Erro desconhecido';
  }

  if (error || !invites) {
    return (
      <div className="text-destructive">
        Erro ao carregar convites: {error || 'Dados não encontrados'}
      </div>
    );
  }

  const pagination = paginateItems(invites, page, perPage);

  return (
    <>
      <DataList
        items={pagination.paginatedItems}
        viewMode={view}
        renderItem={(invite) => <InviteRow invite={invite} />}
        keyExtractor={(invite) => invite.token}
        emptyMessage="Nenhum convite encontrado."
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

interface InvitesListProps {
  searchParams: Record<string, string | string[] | undefined>;
  pathname: string;
}

export function InvitesList({
  searchParams,
  pathname,
}: InvitesListProps) {
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
        <InvitesData searchParams={searchParams} pathname={pathname} />
      </Suspense>
    </div>
  );
}
