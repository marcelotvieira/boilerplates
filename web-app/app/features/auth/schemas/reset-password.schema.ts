import { z } from 'zod';

export const resetPasswordSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),

  code: z.string()
    .length(6, 'O código deve ter 6 dígitos')
    .regex(/^\d{6}$/, 'O código deve conter apenas números'),

  newPassword: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),

  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
