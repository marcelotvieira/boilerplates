'use server';

import { redirect } from 'next/navigation';
import { resetPasswordSchema } from '@/app/features/auth/schemas/reset-password.schema';
import { publicFetch } from '@/lib/fetch-utils';
import type { ResetPasswordResponse } from '@/app/features/auth/types/auth.types';

export async function resetPasswordAction(_prevState: unknown, formData: FormData) {
  // 1. Extract and validate
  const rawData = {
    email: formData.get('email'),
    code: formData.get('code'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const parsed = resetPasswordSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // Remove confirmPassword before sending to API
  const { confirmPassword, ...resetData } = parsed.data;

  // 2. Direct API call
  try {
    await publicFetch<ResetPasswordResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    });

    // 3. Redirect to login with success message
    redirect('/auth/login?reset=success');
  } catch (error: any) {
    // Error handling inline
    if (error.statusCode === 400 && error.details?.[0]) {
      return { error: error.details[0].message };
    }

    if (error.statusCode === 404) {
      return { error: 'Código inválido ou expirado' };
    }

    return { error: error.message || 'Erro ao redefinir senha' };
  }
}
