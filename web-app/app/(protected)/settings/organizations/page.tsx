import {
  OrganizationsList,
} from '@/app/features/organizations/components/organizations-list';
import { SettingsPageHeader } from '../components/settings-page-header';

const PATHNAME = '/settings/organizations';

export default async function OrganizationsSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawSearchParams = await searchParams;

  return (
    <>
      <SettingsPageHeader title="Organizações" description="Gerencie suas organizações e membros." />
      <OrganizationsList
        searchParams={rawSearchParams}
        pathname={PATHNAME}
      />
    </>
  );
}
