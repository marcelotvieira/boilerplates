import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { ZodError } from 'zod'
import { AppException } from '../exceptions/app.exceptions.js'

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
}

export interface ApiSuccess<T = any> {
  data: T
  message?: string
  timestamp: string
  path?: string
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
  timestamp: string
  path?: string
  details?: any[]
}

// Success response helper seguindo padrão REST
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  path?: string,
  statusCode: number = 200
): APIGatewayProxyResultV2 {
  const response: ApiSuccess<T> = {
    data,
    message,
    timestamp: new Date().toISOString(),
    path
  }

  return {
    statusCode,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(response)
  }
}

// Error response helper seguindo padrão REST
export function createErrorResponse(
  error: AppException | Error,
  path?: string
): APIGatewayProxyResultV2 {
  let statusCode = 500
  let errorType = 'Internal Server Error'
  let message = 'Erro interno do servidor'
  let details: any[] = []

  // Handle known application exceptions
  if (error instanceof AppException) {
    statusCode = error.statusCode
    errorType = error.constructor.name
    message = error.message
  }
  // Handle Zod validation errors
  else if (error instanceof ZodError) {
    statusCode = 400
    errorType = 'Bad Request'
    message = 'Dados de entrada inválidos'
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))
  }
  // Handle JSON parse errors
  else if (error instanceof SyntaxError && error.message.includes('JSON')) {
    statusCode = 400
    errorType = 'Bad Request'
    message = 'Formato JSON inválido'
  }
  // Handle generic errors
  else {
    message = error.message || message
    errorType = error.name || errorType
  }

  const response: ApiError = {
    error: errorType,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path,
    details: details.length > 0 ? details : undefined
  }

  return {
    statusCode,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(response)
  }
}

// Options/Preflight response
export function createOptionsResponse(): APIGatewayProxyResultV2 {
  return {
    statusCode: 200,
    headers: DEFAULT_HEADERS,
    body: ''
  }
}
