import { z } from 'zod'

export const verifyEmailSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),

  code: z.string()
    .length(6, 'O código deve ter 6 dígitos')
    .regex(/^\d{6}$/, 'O código deve conter apenas números')
})

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>
