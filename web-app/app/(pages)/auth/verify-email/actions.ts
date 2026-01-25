"use server";

import { redirect } from "next/navigation";
import { verifyEmailSchema } from "@/app/features/auth/schemas/verify-email.schema";
import { verifyEmailService, resendVerificationService } from "@/app/features/auth/services/verify-email.service";

export async function verifyEmailAction(prevState: unknown, formData: FormData) {
  // 1. Extrair dados
  const rawData = {
    email: formData.get("email"),
    code: formData.get("code"),
  };

  // 2. Validar
  const parsed = verifyEmailSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // 3. Chamar service
  const result = await verifyEmailService(parsed.data);

  // 4. Tratar resultado
  if (!result.ok) {
    return {
      error: result.error,
    };
  }

  // 5. Redirecionar para dashboard/painel
  redirect("/panel");
}

export async function resendCodeAction(email: string) {
  const result = await resendVerificationService({ email });

  if (!result.ok) {
    return {
      error: result.error,
    };
  }

  return {
    success: true,
    message: "Código reenviado com sucesso!",
  };
}
