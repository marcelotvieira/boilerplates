import { z } from 'zod'

/**
 * Tenant Validation Schemas
 * Defines validation rules for tenant endpoints
 */

// Update Tenant
export const updateTenantSchema = z.object({
  name: z.string()
    .min(2, 'Tenant name must be at least 2 characters')
    .max(100, 'Tenant name must not exceed 100 characters')
    .trim()
    .optional()
})
.refine(
  (data) => data.name !== undefined,
  { message: 'Tenant name must be provided' }
)

export type UpdateTenantInput = z.infer<typeof updateTenantSchema>
