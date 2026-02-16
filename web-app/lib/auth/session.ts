import { cookies } from 'next/headers';
import type { Entitlements } from '@/app/features/auth/types/auth.types';

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
  planSlug: string
}

export interface Session {
  user: User
  tenant: Tenant
  entitlements?: Entitlements
}

// Verifica se está autenticado e retorna dados da sessão
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const sessionData = cookieStore.get('sessionData')?.value;

  // Sem token = não autenticado
  if (!accessToken || !sessionData) return null;

  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

// Acesso direto aos entitlements da sessão
export async function getEntitlements(): Promise<Entitlements | null> {
  const session = await getSession();
  return session?.entitlements ?? null;
}

// Acesso rápido ao plano do tenant
export async function getPlan(): Promise<string> {
  const session = await getSession();
  return session?.tenant?.planSlug ?? 'FREE';
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value ?? null;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get('accessToken')?.value;
}
