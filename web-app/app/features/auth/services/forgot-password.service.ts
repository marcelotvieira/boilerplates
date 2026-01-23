import { authApi } from '../api/auth.client'
import type { ForgotPasswordInput, ApiError, ServiceResult, ForgotPasswordResponse } from '../types/auth.types'

export async function forgotPasswordService(
  input: ForgotPasswordInput
): Promise<ServiceResult<ForgotPasswordResponse>> {
  try {
    const data = await authApi.forgotPassword(input)
    return { ok: true, data }
  } catch (error) {
    const apiError = error as ApiError

    // Erros de validação
    if (apiError.statusCode === 400 && apiError.details) {
      const firstError = apiError.details[0]
      return {
        ok: false,
        error: firstError.message,
        statusCode: 400,
      }
    }

    // Erro genérico
    return {
      ok: false,
      error: apiError.message || 'Erro ao solicitar recuperação de senha',
      statusCode: apiError.statusCode,
    }
  }
}
