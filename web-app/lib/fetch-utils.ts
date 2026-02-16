import type { ApiError } from '@/app/features/auth/types/auth.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_IDENTITY_SERVICE_URL || 'http://localhost:3001';
const BILLING_API_URL = process.env.NEXT_PUBLIC_BILLING_API_URL || 'http://localhost:3004';

/**
 * Fetch utility for public endpoints (no authentication required)
 * Used for: login, register, password reset, email verification, etc.
 */
export async function publicFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        ...data,
        statusCode: response.status,
      } as ApiError;
    }

    return data as T;
  } catch (error) {
    // If error is already an ApiError, re-throw it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error as ApiError;
    }

    // Network error or other non-API errors
    throw {
      error: 'NetworkError',
      message: 'Não foi possível conectar ao servidor',
      statusCode: 0,
      timestamp: new Date().toISOString(),
    } as ApiError;
  }
}

/**
 * Fetch utility for authenticated endpoints
 * Requires token as parameter (NOT from cookies - to avoid cache scope violations)
 * Used for: profile data, organizations, authenticated mutations, etc.
 */
export async function authenticatedFetch<T>(
  endpoint: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        ...data,
        statusCode: response.status,
      } as ApiError;
    }

    return data as T;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error as ApiError;
    }

    throw {
      error: 'NetworkError',
      message: 'Não foi possível conectar ao servidor',
      statusCode: 0,
      timestamp: new Date().toISOString(),
    } as ApiError;
  }
}

/**
 * Fetch utility for billing-service authenticated endpoints
 * Requires token as parameter (NOT from cookies - to avoid cache scope violations)
 */
export async function billingFetch<T>(
  endpoint: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${BILLING_API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        ...data,
        statusCode: response.status,
      } as ApiError;
    }

    return data as T;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error as ApiError;
    }

    throw {
      error: 'NetworkError',
      message: 'Não foi possível conectar ao servidor',
      statusCode: 0,
      timestamp: new Date().toISOString(),
    } as ApiError;
  }
}
