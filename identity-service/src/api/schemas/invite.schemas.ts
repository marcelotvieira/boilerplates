import { z } from 'zod'
import { UserRole } from '../../core/users/enums/user-role.enum.js'

/**
 * Invite Validation Schemas
 * Defines validation rules for invite endpoints
 */

// Create Invite
export const createInviteSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase()
    .trim(),

  role: z.enum([UserRole.ADMIN, UserRole.MEMBER], {
    errorMap: () => ({ message: 'Role must be either ADMIN or MEMBER' })
  })
})

export type CreateInviteInput = z.infer<typeof createInviteSchema>

// Accept Invite
export const acceptInviteSchema = z.object({
  token: z.string()
    .uuid('Invalid invite token format'),

  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .trim(),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
})

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>

// Cancel Invite (path parameter)
export const cancelInviteParamsSchema = z.object({
  token: z.string()
    .uuid('Invalid invite token format')
})

export type CancelInviteParams = z.infer<typeof cancelInviteParamsSchema>

// Resend Invite (path parameter)
export const resendInviteParamsSchema = z.object({
  token: z.string()
    .uuid('Invalid invite token format')
})

export type ResendInviteParams = z.infer<typeof resendInviteParamsSchema>
