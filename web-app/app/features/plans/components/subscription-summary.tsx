import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SubscriptionInfo } from '../types/plans.types';

interface SubscriptionSummaryProps {
  subscription: SubscriptionInfo;
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  CANCELED: 'Cancelado',
  PAST_DUE: 'Pagamento Pendente',
  TRIALING: 'Período de Teste',
};

const INTERVAL_LABELS: Record<string, string> = {
  month: 'Mensal',
  year: 'Anual',
};

export function SubscriptionSummary({ subscription }: SubscriptionSummaryProps) {
  const statusLabel = STATUS_LABELS[subscription.status] || subscription.status;
  const isActive = subscription.status === 'ACTIVE';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Assinatura Atual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Plano:</span>
            <span className="font-medium">{subscription.planType}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {statusLabel}
            </Badge>
          </div>

          {subscription.interval && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Ciclo:</span>
              <span className="font-medium">
                {INTERVAL_LABELS[subscription.interval] || subscription.interval}
              </span>
            </div>
          )}

          {subscription.cancelAtPeriodEnd && (
            <Badge variant="destructive">Cancela ao final do período</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
