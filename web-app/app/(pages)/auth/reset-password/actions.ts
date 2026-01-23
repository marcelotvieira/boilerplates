'use server'

import { redirect } from 'next/navigation'
import { resetPasswordSchema } from '@/app/features/auth/schemas/reset-password.schema'
import { resetPasswordService } from '@/app/features/auth/services/reset-password.service'

export async function resetPasswordAction(_prevState: unknown, formData: FormData) {
  // 1. Extrair dados do FormData
  const rawData = {
    email: formData.get('email'),
    code: formData.get('code'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  }

  // 2. Validar com Zod
  const parsed = resetPasswordSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  // 3. Chamar service (sem confirmPassword)
  const { confirmPassword, ...resetData } = parsed.data
  const result = await resetPasswordService(resetData)

  // 4. Tratar resultado
  if (!result.ok) {
    return {
      error: result.error,
    }
  }

  // 5. Redirecionar para login com mensagem de sucesso
  redirect('/auth/login?reset=success')
}
