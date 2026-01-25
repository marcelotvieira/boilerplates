"use server";

import { redirect } from "next/navigation";
import { forgotPasswordSchema } from "@/app/features/auth/schemas/forgot-password.schema";
import { forgotPasswordService } from "@/app/features/auth/services/forgot-password.service";

export async function forgotPasswordAction(_prevState: unknown, formData: FormData) {
  // 1. Extrair dados do FormData
  const rawData = {
    email: formData.get("email"),
  };

  // 2. Validar com Zod
  const parsed = forgotPasswordSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // 3. Chamar service
  const result = await forgotPasswordService(parsed.data);

  // 4. Tratar resultado
  if (!result.ok) {
    return {
      error: result.error,
    };
  }

  // 5. Redirecionar para tela de reset com email
  redirect(`/auth/reset-password?email=${encodeURIComponent(parsed.data.email)}`);
}
