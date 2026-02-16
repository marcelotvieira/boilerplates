import { z } from 'zod'

/**
 * User Validation Schemas
 * Defines validation rules for user endpoints
 */

// Update User Profile
export const updateUserProfileSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .trim()
    .optional()
})
.refine(
  (data) => data.fullName !== undefined,
  { message: 'Full name must be provided' }
)

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>

// Change Password
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),

  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
})
.refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: 'New password must be different from current password',
    path: ['newPassword']
  }
)

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// Delete User (path parameter)
export const deleteUserParamsSchema = z.object({
  userId: z.string()
    .uuid('User ID must be a valid UUID')
})

export type DeleteUserParams = z.infer<typeof deleteUserParamsSchema>
