"use server";

import { redirect } from "next/navigation";
import { registerSchema } from "@/app/features/auth/schemas/register.schema";
import { registerService } from "@/app/features/auth/services/register.service";

export async function registerAction(prevState: unknown, formData: FormData) {
  // 1. Extrair dados do FormData
  const rawData = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  // 2. Validar com Zod
  const parsed = registerSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // 3. Chamar service (sem confirmPassword)
  const { confirmPassword, ...registerData } = parsed.data;
  const result = await registerService(registerData);

  // 4. Tratar resultado
  if (!result.ok) {
    return {
      error: result.error,
    };
  }

  // 5. Redirecionar para verificação (passa email via query param)
  redirect(`/auth/verify-email?email=${encodeURIComponent(registerData.email)}`);
}
