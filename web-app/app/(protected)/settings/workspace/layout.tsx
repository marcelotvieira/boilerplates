import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTenant } from '@/app/features/workspace/api/get-tenant';
import { TenantForm } from '@/app/features/workspace/components/tenant-form';
import { WorkspaceTabs } from '@/app/features/workspace/components/workspace-tabs';
import type { Tenant } from '@/app/features/workspace/types/workspace.types';
import { SettingsPageHeader } from '../components/settings-page-header';

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read token OUTSIDE cache scope
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  // Get user role from session
  const sessionData = cookieStore.get('sessionData')?.value;
  let userRole = '';
  console.log(sessionData)
  if (sessionData) {
    try {
      const session = JSON.parse(sessionData);
      userRole = session.user?.role ?? '';
    } catch {
      // ignore parse errors
    }
  }

  // Fetch tenant data
  let tenant: Tenant | undefined;
  let error: string | undefined;

  try {
    const result = await getTenant(token);
    tenant = result.data;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Erro desconhecido';
  }

  // Return JSX outside try/catch
  if (error || !tenant) {
    return (
      <div className="text-destructive">
        Erro ao carregar espaço de trabalho: {error || 'Dados não encontrados'}
      </div>
    );
  }

  const canEdit = userRole === 'OWNER';

  return (
    <div className="space-y-8">
      <SettingsPageHeader title="Espaço de Trabalho" description="Gerencie as configurações do seu espaço de trabalho." />
      <TenantForm tenant={tenant} canEdit={canEdit} />
      <div className="space-y-4">
        <WorkspaceTabs />
        {children}
      </div>
    </div>
  );
}
