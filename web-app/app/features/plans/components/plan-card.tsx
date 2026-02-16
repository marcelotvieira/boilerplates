import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import type { PlanInfo } from '../types/plans.types';
import { UpgradeButton } from './upgrade-button';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: PlanInfo;
  interval: 'month' | 'year';
  isCurrentPlan: boolean;
  className?: string;
}

function formatPrice(valueInCents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueInCents / 100);
}

export function PlanCard({ plan, interval, isCurrentPlan, className }: PlanCardProps) {
  const priceOption = interval === 'month' ? plan.price.monthly : plan.price.yearly;
  const isFree = !priceOption?.value;
  const intervalLabel = interval === 'month' ? '/mês' : '/ano';

  return (
    <Card className={`relative overflow-hidden ${cn(className)} shadow-xl`}>
      {isCurrentPlan && (
        <div className="absolute top-3 right-3">
          <Badge variant="default">Plano Atual</Badge>
        </div>
      )}

      <CardHeader>

        <CardTitle>{plan.name}</CardTitle>
        <CardDescription className="text-2xl font-bold text-foreground">
          {isFree ? 'Grátis' : (
            <>
              {formatPrice(priceOption!.value)}
              <span className="text-sm font-normal text-muted-foreground">{intervalLabel}</span>
            </>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {Object.entries(plan.modules).map(([, moduleConfig]) => (
            <div key={moduleConfig.label}>
              <p className="text-sm font-medium text-muted-foreground">{moduleConfig.label}</p>
              {moduleConfig.limits && Object.entries(moduleConfig.limits).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-sm ml-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  <span>{value} {key}</span>
                </div>
              ))}
              {!moduleConfig.limits && (
                <div className="flex items-center gap-2 text-sm ml-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  <span>Ilimitado</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {!isCurrentPlan && priceOption?.priceId && (
          <UpgradeButton planType={plan.slug} interval={interval} />
        )}
      </CardContent>
    </Card>
  );
}
