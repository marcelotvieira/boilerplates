import { getSubscriptionInfo } from '@/app/features/plans/api/get-subscription-info';
import { listPlans } from '@/app/features/plans/api/list-plans';
import { PlansTabs } from '@/app/features/plans/components/plans-tabs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SettingsPageHeader } from '../components/settings-page-header';

export default async function PlansSettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  let plansData;
  let subscriptionData;
  let error: string | undefined;

  try {
    const [plansResult, subscriptionResult] = await Promise.all([
      listPlans(token),
      getSubscriptionInfo(token),
    ]);
    plansData = plansResult.data.plans;
    subscriptionData = subscriptionResult.data;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Erro desconhecido';
  }

  if (error || !plansData || !subscriptionData) {
    return (
      <div className="text-destructive">
        Erro ao carregar planos: {error || 'Dados não encontrados'}
      </div>
    );
  }

  console.log(plansData)

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Planos e Assinaturas"
        description="Gerencie seu plano e assinatura."
      />
      <PlansTabs plans={plansData} currentPlanSlug={subscriptionData.planType} />
    </div>
  );
}
