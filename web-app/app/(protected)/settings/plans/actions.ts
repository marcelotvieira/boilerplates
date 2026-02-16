'use server';

import { cookies } from 'next/headers';

export async function createCheckoutSessionAction(
  planType: 'PRO' | 'ENTERPRISE',
  interval: 'month' | 'year' = 'month',
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    return { error: 'Não autenticado' };
  }

  try {
    const billingApiUrl = process.env.NEXT_PUBLIC_BILLING_API_URL || 'http://localhost:3004';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const response = await fetch(`${billingApiUrl}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        planType,
        interval,
        successUrl: `${appUrl}/settings/plans?success=true`,
        cancelUrl: `${appUrl}/settings/plans?canceled=true`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar sessão de checkout');
    }

    const data = await response.json();
    return { checkoutUrl: data.data.url };
  } catch (error: any) {
    return { error: error.message || 'Erro ao criar sessão de checkout' };
  }
}
