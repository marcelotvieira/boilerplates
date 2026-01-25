import { authApi } from "../api/auth.client";
import type { LoginInput, ApiError, ServiceResult, LoginResponse } from "../types/auth.types";

export async function loginService(
  input: LoginInput,
): Promise<ServiceResult<LoginResponse>> {
  try {
    const data = await authApi.login(input);
    return { ok: true, data };
  } catch (error) {
    const apiError = error as ApiError;

    // Caso específico: email não verificado
    if (apiError.statusCode === 403) {
      return {
        ok: false,
        error: apiError.message || "Email não verificado. Por favor, verifique seu email antes de fazer login.",
        statusCode: 403,
      };
    }

    // Caso específico: credenciais inválidas
    if (apiError.statusCode === 401) {
      return {
        ok: false,
        error: "Email ou senha incorretos",
        statusCode: 401,
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
      error: apiError.message || "Erro ao realizar login",
      statusCode: apiError.statusCode,
    };
  }
}
