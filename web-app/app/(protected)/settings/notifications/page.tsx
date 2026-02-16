import { SettingsPageHeader } from '../components/settings-page-header';

export default function NotificationsSettingsPage() {
  return (
    <>
      <SettingsPageHeader title="Notificações" description="Gerencie suas preferências de notificações." />
      <p className="text-muted-foreground">
        Conteúdo da página de notificações.
      </p>
    </>
  );
}
