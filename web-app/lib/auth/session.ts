import { cookies } from "next/headers";

export interface User {
  id: string
  email: string
  fullName: string
  role: string
  emailVerified: boolean
}

export interface Tenant {
  id: string
  name: string
  status: string
}

export interface Session {
  user: User
  tenant: Tenant
}

// Verifica se está autenticado e retorna dados da sessão
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const sessionData = cookieStore.get("sessionData")?.value;

  // Sem token = não autenticado
  if (!accessToken || !sessionData) return null;

  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value ?? null;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get("accessToken")?.value;
}
