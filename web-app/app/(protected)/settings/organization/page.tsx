import { SettingsPageHeader } from '../components/settings-page-header';

export default function OrganizationSettingsPage() {
  return (
    <>
      <SettingsPageHeader title="Organização" description="Gerencie as configurações da sua organização atual." />
      <p className="text-muted-foreground">
        Conteúdo da página de organização.
      </p>
    </>
  );
}
