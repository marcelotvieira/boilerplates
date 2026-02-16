import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getProfile } from '@/app/features/user/api/get-profile';
import { ProfileForm } from '@/app/features/user/components/profile-form';
import type { User } from '@/app/features/user/types/user.types';
import { SettingsPageHeader } from '../components/settings-page-header';

export default async function ProfileSettingsPage() {
  // Read token OUTSIDE cache scope
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  // Fetch data
  let profileData: User | undefined;
  let error: string | undefined;

  try {
    const result = await getProfile(token);
    profileData = result.data;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Erro desconhecido';
  }

  // Return JSX outside try/catch
  if (error || !profileData) {
    return (
      <div className="text-destructive">
        Erro ao carregar perfil: {error || 'Dados não encontrados'}
      </div>
    );
  }

  return (
    <>
      <SettingsPageHeader title="Perfil" description="Gerencie suas informações de perfil." />
      <ProfileForm user={profileData} />
    </>
  );
}
