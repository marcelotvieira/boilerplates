'use server';

import { cookies } from 'next/headers';
import {
  changePasswordSchema,
} from '@/app/features/user/schemas/change-password.schema';
import { changePassword } from '@/app/features/user/api/change-password';

export async function changePasswordAction(
  prevState: unknown,
  formData: FormData,
) {
  const rawData = {
    currentPassword: formData.get('currentPassword')?.toString(),
    newPassword: formData.get('newPassword')?.toString(),
    confirmPassword: formData.get('confirmPassword')?.toString(),
  };

  const parsed = changePasswordSchema.safeParse(rawData);

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
    await changePassword(token, {
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });

    return {
      success: 'Senha alterada com sucesso',
    };
  } catch (error: any) {
    if (error.statusCode === 401) {
      return { error: 'Senha atual incorreta' };
    }

    if (error.statusCode === 400 && error.details?.[0]) {
      return { error: error.details[0].message };
    }

    return { error: error.message || 'Erro ao alterar senha' };
  }
}
