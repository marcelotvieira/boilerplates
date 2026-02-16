import { z } from 'zod';

export const createInviteSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .toLowerCase()
    .trim(),
  role: z.enum(['ADMIN', 'MEMBER'], {
    message: 'Selecione um cargo',
  }),
});

export type CreateInviteFormData = z.infer<typeof createInviteSchema>;
