import { authApi } from "../api/auth.client";
import type { ResetPasswordInput, ApiError, ServiceResult, ResetPasswordResponse } from "../types/auth.types";

export async function resetPasswordService(
  input: ResetPasswordInput,
): Promise<ServiceResult<ResetPasswordResponse>> {
  try {
    const data = await authApi.resetPassword(input);
    return { ok: true, data };
  } catch (error) {
    const apiError = error as ApiError;

    // Caso específico: código inválido ou expirado
    if (apiError.statusCode === 400) {
      return {
        ok: false,
        error: apiError.message || "Código inválido ou expirado",
        statusCode: 400,
      };
    }

    // Caso específico: usuário não encontrado
    if (apiError.statusCode === 404) {
      return {
        ok: false,
        error: "Usuário não encontrado",
        statusCode: 404,
      };
    }

    // Erros de validação
    if (apiError.statusCode === 400 && apiError.details) {
      const firstError = apiError.details[0];
      return {
        ok: false,
        error: firstError.message,
        statusCode: 400,
      };
    }

    // Erro genérico
    return {
      ok: false,
      error: apiError.message || "Erro ao redefinir senha",
      statusCode: apiError.statusCode,
    };
  }
}
