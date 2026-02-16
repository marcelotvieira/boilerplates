'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { createCheckoutSessionAction } from '@/app/(protected)/settings/plans/actions';

interface UpgradeButtonProps {
  planType: string;
  interval: 'month' | 'year';
}

export function UpgradeButton({ planType, interval }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);

    const result = await createCheckoutSessionAction(
      planType as 'PRO' | 'ENTERPRISE',
      interval,
    );

    if (result.error) {
      setLoading(false);
      return;
    }

    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl;
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecionando...
        </>
      ) : (
        'Assinar'
      )}
    </Button>
  );
}
