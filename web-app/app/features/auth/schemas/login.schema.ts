import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(1, 'Senha é obrigatória')
})

export type LoginFormData = z.infer<typeof loginSchema>
