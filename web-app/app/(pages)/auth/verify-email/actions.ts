'use server';

import { redirect } from 'next/navigation';
import { verifyEmailSchema } from '@/app/features/auth/schemas/verify-email.schema';
import { publicFetch } from '@/lib/fetch-utils';
import type { VerifyEmailResponse, ResendVerificationResponse } from '@/app/features/auth/types/auth.types';

export async function verifyEmailAction(prevState: unknown, formData: FormData) {
  // 1. Extract and validate
  const rawData = {
    email: formData.get('email'),
    code: formData.get('code'),
  };

  const parsed = verifyEmailSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // 2. Direct API call
  try {
    await publicFetch<VerifyEmailResponse>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    });

  } catch (error: any) {
    // Error handling inline
    if (error.statusCode === 400 && error.details?.[0]) {
      return { error: error.details[0].message };
    }

    if (error.statusCode === 404) {
      return { error: 'Código inválido ou expirado' };
    }

    return { error: error.message || 'Erro ao verificar email' };
  }

  // 3. Redirect to panel
  redirect('/panel');
}

export async function resendCodeAction(email: string) {
  try {
    await publicFetch<ResendVerificationResponse>('/auth/resend-verification-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return {
      success: true,
      message: 'Código reenviado com sucesso!',
    };
  } catch (error: any) {
    return {
      error: error.message || 'Erro ao reenviar código',
    };
  }
}
