'use server';

import { redirect } from 'next/navigation';
import { registerSchema } from '@/app/features/auth/schemas/register.schema';
import { publicFetch } from '@/lib/fetch-utils';
import type { RegisterResponse } from '@/app/features/auth/types/auth.types';

export async function registerAction(prevState: unknown, formData: FormData) {
  // 1. Extract and validate
  const rawData = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const parsed = registerSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // Remove confirmPassword before sending to API
  const { confirmPassword, ...registerData } = parsed.data;

  // 2. Direct API call
  try {
    await publicFetch<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });

  } catch (error: any) {
    // Error handling inline
    if (error.statusCode === 409) {
      return { error: 'Este email já está cadastrado' };
    }

    if (error.statusCode === 400 && error.details?.[0]) {
      return { error: error.details[0].message };
    }

    return { error: error.message || 'Erro ao realizar cadastro' };
  }

  // 3. Redirect to email verification
  redirect(`/auth/verify-email?email=${encodeURIComponent(registerData.email)}`);
}
