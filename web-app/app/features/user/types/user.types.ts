// User data from API
export interface User {
  id: string
  email: string
  fullName: string
  role: string
  emailVerified: boolean
  tenant: {
    id: string
    name: string
    status: string
  }
  createdAt: string
  updatedAt: string
}

// Request/Response types
export interface GetProfileResponse {
  data: User
  message: string
}

export interface UpdateProfileInput {
  fullName: string
}

export interface UpdateProfileResponse {
  data: User
  message: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  data: { message: string }
  message: string
}
