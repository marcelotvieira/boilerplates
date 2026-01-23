import { z } from 'zod'

/**
 * Auth Validation Schemas
 * Defines validation rules for authentication endpoints
 */

// Register
export const registerSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .trim(),

  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
})

export type RegisterInput = z.infer<typeof registerSchema>

// Login
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(1, 'Password is required')
})

export type LoginInput = z.infer<typeof loginSchema>

// Verify Email
export const verifyEmailSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),

  code: z.string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers')
})

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>

// Resend Verification Code
export const resendVerificationCodeSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim()
})

export type ResendVerificationCodeInput = z.infer<typeof resendVerificationCodeSchema>

// Refresh Token
export const refreshTokenSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Refresh token is required')
})

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>

// Logout
export const logoutSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Refresh token is required')
})

export type LogoutInput = z.infer<typeof logoutSchema>

// Request Password Reset
export const requestPasswordResetSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim()
})

export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>

// Reset Password
export const resetPasswordSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),

  code: z.string()
    .length(6, 'Reset code must be 6 digits')
    .regex(/^\d{6}$/, 'Reset code must contain only numbers'),

  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
