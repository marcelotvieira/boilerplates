import { InvitesList } from '@/app/features/workspace/components/invites-list';

const PATHNAME = '/settings/workspace/invites';

export default async function WorkspaceInvitesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawSearchParams = await searchParams;

  return (
    <InvitesList
      searchParams={rawSearchParams}
      pathname={PATHNAME}
    />
  );
}
