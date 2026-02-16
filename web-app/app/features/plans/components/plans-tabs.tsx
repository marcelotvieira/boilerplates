
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanCard } from './plan-card';
import type { PlanInfo } from '../types/plans.types';

interface PlansTabsProps {
  plans: PlanInfo[];
  currentPlanSlug: string;
}

export function PlansTabs({ plans, currentPlanSlug }: PlansTabsProps) {
  console.log(currentPlanSlug)

  return (
    <Tabs defaultValue="month">
      <TabsList className="mx-auto" variant="line">
        <TabsTrigger value="month">Mensal</TabsTrigger>
        <TabsTrigger value="year">Anual</TabsTrigger>
      </TabsList>

      <TabsContent value="month">
        <div className="flex gap-8 justify-center p-8">
          {plans.map((plan) => (
            <PlanCard
              className="w-sm"
              key={plan.slug}
              plan={plan}
              interval="month"
              isCurrentPlan={plan.slug.toUpperCase() === currentPlanSlug.toUpperCase()}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="year">
        <div className="flex justify-center gap-8 p-8">
          {plans.map((plan) => (
            <PlanCard
              className="w-sm"
              key={plan.slug}
              plan={plan}
              interval="year"
              isCurrentPlan={plan.slug.toUpperCase() === currentPlanSlug.toUpperCase()}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
