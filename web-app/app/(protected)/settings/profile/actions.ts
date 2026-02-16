'use server';

import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { updateProfileSchema } from '@/app/features/user/schemas/update-profile.schema';
import { updateProfile } from '@/app/features/user/api/update-profile';
import CACHE_KEYS from '@/lib/cache/tags';

export async function updateProfileAction(prevState: unknown, formData: FormData) {
  // 1. Extract and validate
  const rawData = {
    fullName: formData.get('fullName')?.toString().trim(),
  };

  const parsed = updateProfileSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // 2. Get token OUTSIDE cache scope
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    return { error: 'Não autenticado' };
  }

  // 3. Direct API call
  try {
    const result = await updateProfile(token, parsed.data);

    // 4. Update session cookie
    const sessionData = cookieStore.get('sessionData')?.value;

    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        session.user = {
          ...session.user,
          fullName: result.data.fullName,
          email: result.data.email,
          emailVerified: result.data.emailVerified,
        };

        cookieStore.set('sessionData', JSON.stringify(session), {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
      } catch (e) {
        console.error('Failed to update session data:', e);
      }
    }

    // 5. CRITICAL: Revalidate cache
    revalidateTag(CACHE_KEYS.USER_PROFILE);

    return {
      success: 'Perfil atualizado com sucesso',
    };
  } catch (error: any) {
    // Error handling inline
    if (error.statusCode === 409) {
      return { error: 'Este email já está em uso' };
    }

    if (error.statusCode === 400 && error.details?.[0]) {
      return { error: error.details[0].message };
    }

    return { error: error.message || 'Erro ao atualizar perfil' };
  }
}
