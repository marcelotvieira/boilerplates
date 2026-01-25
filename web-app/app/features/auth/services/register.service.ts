import { authApi } from "../api/auth.client";
import type { RegisterInput, ApiError, ServiceResult, RegisterResponse } from "../types/auth.types";

export async function registerService(
  input: RegisterInput,
): Promise<ServiceResult<RegisterResponse>> {
  try {
    const data = await authApi.register(input);
    return { ok: true, data };
  } catch (error) {
    const apiError = error as ApiError;

    // Caso específico: email duplicado
    if (apiError.statusCode === 409) {
      return {
        ok: false,
        error: "Este email já está cadastrado",
        statusCode: 409,
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
      error: apiError.message || "Erro ao realizar cadastro",
      statusCode: apiError.statusCode,
    };
  }
}
