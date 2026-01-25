// Request types
export interface RegisterInput {
  fullName: string
  email: string
  password: string
}

export interface VerifyEmailInput {
  email: string
  code: string
}

export interface ResendVerificationInput {
  email: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ResetPasswordInput {
  email: string
  code: string
  newPassword: string
}

// Response types
export interface RegisterResponse {
  data: {
    userId: string
    email: string
    fullName: string
    tenantId: string
    tenantName: string
    role: "OWNER"
    emailVerified: boolean
  }
  message: string
}

export interface VerifyEmailResponse {
  data: {
    success: boolean
    message: string
  }
  message: string
}

export interface ResendVerificationResponse {
  data: {
    success: boolean
    message: string
    expiresAt: string
  }
  message: string
}

export interface LoginResponse {
  data: {
    user: {
      id: string
      email: string
      fullName: string
      role: string
      emailVerified: boolean
    }
    tenant: {
      id: string
      name: string
      status: string
    }
    tokens: {
      accessToken: string
      refreshToken: string
      expiresIn: number
    }
  }
  message: string
}

export interface ForgotPasswordResponse {
  data: {
    success: boolean
    message: string
  }
  message: string
}

export interface ResetPasswordResponse {
  data: {
    success: boolean
    message: string
  }
  message: string
}

// Error types
export interface ApiError {
  error: string
  message: string
  statusCode: number
  timestamp: string
  path?: string
  details?: Array<{
    field: string
    message: string
    code: string
  }>
}

// Service result types
export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; statusCode?: number };
