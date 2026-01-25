import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email("Email inválido")
    .toLowerCase()
    .trim(),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
