import { apiClient } from '@/lib/api-client'
import type {
  RegisterInput,
  RegisterResponse,
  VerifyEmailInput,
  VerifyEmailResponse,
  ResendVerificationInput,
  ResendVerificationResponse,
  LoginInput,
  LoginResponse,
  ForgotPasswordInput,
  ForgotPasswordResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
} from '../types/auth.types'

export const authApi = {
  register: (data: RegisterInput) =>
    apiClient.post<RegisterResponse>('/auth/register', data),

  verifyEmail: (data: VerifyEmailInput) =>
    apiClient.post<VerifyEmailResponse>('/auth/verify-email', data),

  resendVerificationCode: (data: ResendVerificationInput) =>
    apiClient.post<ResendVerificationResponse>('/auth/resend-verification-code', data),

  login: (data: LoginInput) =>
    apiClient.post<LoginResponse>('/auth/login', data),

  forgotPassword: (data: ForgotPasswordInput) =>
    apiClient.post<ForgotPasswordResponse>('/auth/request-password-reset', data),

  resetPassword: (data: ResetPasswordInput) =>
    apiClient.post<ResetPasswordResponse>('/auth/reset-password', data),
}
