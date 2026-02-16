import {
  OrganizationsList,
} from '@/app/features/organizations/components/organizations-list';

const PATHNAME = '/settings/account/organizations';

export default async function AccountOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawSearchParams = await searchParams;

  return (
    <OrganizationsList
      searchParams={rawSearchParams}
      pathname={PATHNAME}
    />
  );
}
