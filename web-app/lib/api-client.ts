import { ApiError } from '@/app/features/auth/types/auth.types'

const API_BASE_URL = process.env.NEXT_PUBLIC_IDENTITY_SERVICE_URL || 'http://localhost:3001'

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw {
          ...data,
          statusCode: response.status,
        } as ApiError
      }

      return data as T
    } catch (error) {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error as ApiError
      }

      throw {
        error: 'NetworkError',
        message: 'Não foi possível conectar ao servidor',
        statusCode: 0,
        timestamp: new Date().toISOString(),
      } as ApiError
    }
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
}

export const apiClient = new ApiClient()
