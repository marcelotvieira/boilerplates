import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
