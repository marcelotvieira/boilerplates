'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loginSchema } from '@/app/features/auth/schemas/login.schema';
import { publicFetch } from '@/lib/fetch-utils';
import type { LoginResponse } from '@/app/features/auth/types/auth.types';

export async function loginAction(prevState: unknown, formData: FormData) {
  // 1. Extract and validate
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = loginSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // 2. Direct API call
  try {
    const result = await publicFetch<LoginResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(parsed.data),
      },
    );

    // 3. Set cookies
    const cookieStore = await cookies();

    cookieStore.set('accessToken', result.data.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: result.data.tokens.expiresIn,
      path: '/',
    });

    cookieStore.set('refreshToken', result.data.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Store session data (user + tenant + entitlements)
    const { user, tenant, entitlements } = result.data;
    cookieStore.set('sessionData', JSON.stringify({ user, tenant, entitlements }), {
      httpOnly: false, // Can be read by client for display
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: result.data.tokens.expiresIn,
      path: '/',
    });

    // 4. Redirect to panel
    redirect('/panel');
  } catch (error: any) {
    // Error handling inline
    if (error.statusCode === 403) {
      return {
        error: 'Email não verificado. Por favor, verifique seu email antes de fazer login.',
      };
    }

    if (error.statusCode === 401) {
      return { error: 'Email ou senha incorretos' };
    }

    if (error.statusCode === 400 && error.details?.[0]) {
      return { error: error.details[0].message };
    }

    return {
      error: error.message || 'Erro ao realizar login',
    };
  }
}
