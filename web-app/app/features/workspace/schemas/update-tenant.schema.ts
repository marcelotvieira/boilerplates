import { z } from 'zod';

export const updateTenantSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
});

export type UpdateTenantFormData = z.infer<typeof updateTenantSchema>;
