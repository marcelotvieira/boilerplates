'use server';

import { redirect } from 'next/navigation';
import { forgotPasswordSchema } from '@/app/features/auth/schemas/forgot-password.schema';
import { publicFetch } from '@/lib/fetch-utils';
import type { ForgotPasswordResponse } from '@/app/features/auth/types/auth.types';

export async function forgotPasswordAction(_prevState: unknown, formData: FormData) {
  // 1. Extract and validate
  const rawData = {
    email: formData.get('email'),
  };

  const parsed = forgotPasswordSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // 2. Direct API call
  try {
    await publicFetch<ForgotPasswordResponse>('/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    });

    // 3. Redirect to reset password page
    redirect(`/auth/reset-password?email=${encodeURIComponent(parsed.data.email)}`);
  } catch (error: any) {
    // Error handling inline
    if (error.statusCode === 400 && error.details?.[0]) {
      return { error: error.details[0].message };
    }

    if (error.statusCode === 404) {
      return { error: 'Email não encontrado' };
    }

    return { error: error.message || 'Erro ao solicitar recuperação de senha' };
  }
}
