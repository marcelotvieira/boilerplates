import { SettingsPageHeader } from '../components/settings-page-header';

export default function GeneralSettingsPage() {
  return (
    <>
      <SettingsPageHeader title="Geral" description="Configurações gerais da plataforma." />
      <p className="text-muted-foreground">
        Conteúdo da página de configurações gerais.
      </p>
    </>
  );
}
