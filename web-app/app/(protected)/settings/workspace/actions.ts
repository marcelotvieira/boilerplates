'use server';

import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { updateTenantSchema } from '@/app/features/workspace/schemas/update-tenant.schema';
import { createInviteSchema } from '@/app/features/workspace/schemas/create-invite.schema';
import { updateTenant } from '@/app/features/workspace/api/update-tenant';
import { createInvite } from '@/app/features/workspace/api/create-invite';
import CACHE_KEYS from '@/lib/cache/tags';

export async function updateTenantAction(prevState: unknown, formData: FormData) {
  // 1. Extract and validate
  const rawData = {
    name: formData.get('name')?.toString().trim(),
  };

  const parsed = updateTenantSchema.safeParse(rawData);

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
    const result = await updateTenant(token, parsed.data);

    // 4. Update session cookie with new tenant name
    const sessionData = cookieStore.get('sessionData')?.value;

    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        session.tenant = {
          ...session.tenant,
          name: result.data.name,
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
    revalidateTag(CACHE_KEYS.CURRENT_TENANT);

    return {
      success: 'Espaço de trabalho atualizado com sucesso',
    };
  } catch (error: any) {
    if (error.statusCode === 403) {
      return { error: 'Você não tem permissão para editar este espaço de trabalho' };
    }

    if (error.statusCode === 400 && error.details?.[0]) {
      return { error: error.details[0].message };
    }

    return { error: error.message || 'Erro ao atualizar espaço de trabalho' };
  }
}

export async function createInviteAction(
  prevState: unknown,
  formData: FormData,
) {
  const rawData = {
    email: formData.get('email')?.toString().trim(),
    role: formData.get('role')?.toString(),
  };

  const parsed = createInviteSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    return { error: 'Não autenticado' };
  }

  try {
    await createInvite(token, parsed.data);

    return {
      success: 'Convite enviado com sucesso',
    };
  } catch (error: any) {
    if (error.statusCode === 403) {
      return {
        error: 'Você não tem permissão para enviar convites',
      };
    }

    if (error.statusCode === 409) {
      return { error: 'Este email já possui um convite pendente' };
    }

    if (error.statusCode === 400 && error.details?.[0]) {
      return { error: error.details[0].message };
    }

    return { error: error.message || 'Erro ao enviar convite' };
  }
}

export async function revalidateInvites() {
  revalidateTag(CACHE_KEYS.TENANT_INVITES);
}
