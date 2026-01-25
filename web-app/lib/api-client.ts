import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/app/features/auth/types/auth.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_IDENTITY_SERVICE_URL || "http://localhost:3001";

// Endpoints públicos (não requerem token)
const PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/request-password-reset",
  "/auth/reset-password",
  "/auth/resend-verification-code",
  "/auth/logout",
];

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private isPublicEndpoint(endpoint: string): boolean {
    return PUBLIC_ENDPOINTS.some((e) => endpoint.startsWith(e));
  }

  private async clearAuthAndRedirect(): Promise<never> {
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    cookieStore.delete("sessionData");
    redirect("/auth/login");
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const isPublic = this.isPublicEndpoint(endpoint);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Merge headers from options
    if (options?.headers) {
      const optHeaders = options.headers as Record<string, string>;
      Object.assign(headers, optHeaders);
    }

    // Rotas autenticadas: adiciona token ou desloga
    if (!isPublic) {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;

      if (!accessToken) {
        await this.clearAuthAndRedirect();
      }

      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        // 401 em rota autenticada = desloga
        if (response.status === 401 && !isPublic) {
          await this.clearAuthAndRedirect();
        }

        throw {
          ...data,
          statusCode: response.status,
        } as ApiError;
      }

      return data as T;
    } catch (error) {
      if (error && typeof error === "object" && "statusCode" in error) {
        throw error as ApiError;
      }

      throw {
        error: "NetworkError",
        message: "Não foi possível conectar ao servidor",
        statusCode: 0,
        timestamp: new Date().toISOString(),
      } as ApiError;
    }
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
    });
  }

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
