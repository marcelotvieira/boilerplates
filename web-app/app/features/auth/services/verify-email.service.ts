import { authApi } from "../api/auth.client";
import type {
  VerifyEmailInput,
  ResendVerificationInput,
  ApiError,
  ServiceResult,
  VerifyEmailResponse,
  ResendVerificationResponse,
} from "../types/auth.types";

export async function verifyEmailService(
  input: VerifyEmailInput,
): Promise<ServiceResult<VerifyEmailResponse>> {
  try {
    const data = await authApi.verifyEmail(input);
    return { ok: true, data };
  } catch (error) {
    const apiError = error as ApiError;

    return {
      ok: false,
      error: apiError.message || "Erro ao verificar email",
      statusCode: apiError.statusCode,
    };
  }
}

export async function resendVerificationService(
  input: ResendVerificationInput,
): Promise<ServiceResult<ResendVerificationResponse>> {
  try {
    const data = await authApi.resendVerificationCode(input);
    return { ok: true, data };
  } catch (error) {
    const apiError = error as ApiError;

    return {
      ok: false,
      error: apiError.message || "Erro ao reenviar código",
      statusCode: apiError.statusCode,
    };
  }
}
