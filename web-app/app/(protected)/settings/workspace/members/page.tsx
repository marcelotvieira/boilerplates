import { MembersList } from '@/app/features/workspace/components/members-list';

const PATHNAME = '/settings/workspace/members';

export default async function WorkspaceMembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawSearchParams = await searchParams;

  return (
    <MembersList
      searchParams={rawSearchParams}
      pathname={PATHNAME}
    />
  );
}
