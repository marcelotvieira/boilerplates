'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export async function logoutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (refreshToken) {
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch {
      // Ignora erros - estamos deslogando de qualquer forma
    }
  }

  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
  cookieStore.delete('sessionData');

  redirect('/auth/login');
}
