"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { loginSchema } from "@/app/features/auth/schemas/login.schema";
import { loginService } from "@/app/features/auth/services/login.service";

export async function loginAction(prevState: unknown, formData: FormData) {
  // 1. Extrair dados do FormData
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  // 2. Validar com Zod
  const parsed = loginSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // 3. Chamar service
  const result = await loginService(parsed.data);

  // 4. Tratar resultado
  if (!result.ok) {
    return {
      error: result.error,
    };
  }

  // 5. Armazenar tokens em cookies (httpOnly, secure)
  const cookieStore = await cookies();

  cookieStore.set("accessToken", result.data.data.tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: result.data.data.tokens.expiresIn,
    path: "/",
  });

  cookieStore.set("refreshToken", result.data.data.tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: "/",
  });

  // Armazenar dados da sessão (user + tenant) para exibição
  const { user, tenant } = result.data.data;
  cookieStore.set("sessionData", JSON.stringify({ user, tenant }), {
    httpOnly: false, // Pode ser lido pelo client para display
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: result.data.data.tokens.expiresIn,
    path: "/",
  });

  // 6. Redirecionar para painel
  redirect("/panel");
}
