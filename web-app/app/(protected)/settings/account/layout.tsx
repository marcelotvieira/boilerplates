import {
  AccountTabs,
} from '@/app/features/user/components/account-tabs';
import { SettingsPageHeader } from '../components/settings-page-header';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <SettingsPageHeader title="Conta" description="Gerencie as configurações da sua conta." />
      <AccountTabs />
      {children}
    </div>
  );
}
