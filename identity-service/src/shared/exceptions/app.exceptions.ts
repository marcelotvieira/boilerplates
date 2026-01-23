// Base exception class
export abstract class AppException extends Error {
  abstract readonly statusCode: number
  readonly timestamp: Date
  readonly metadata?: Record<string, any>

  constructor(message: string, cause?: Error, metadata?: Record<string, any>) {
    super(message)
    this.name = this.constructor.name
    this.timestamp = new Date()
    this.metadata = metadata

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }

    // Preserve original error cause
    if (cause && 'cause' in Error.prototype) {
      (this as any).cause = cause
    }
  }
}

// HTTP Status Code Based Exceptions

// 400 - Bad Request
export class BadRequestException extends AppException {
  readonly statusCode = 400
}

// 400 - Validation Error (specialized Bad Request)
export class ValidationException extends AppException {
  readonly statusCode = 400

  constructor(message: string = 'Validation failed', cause?: Error, metadata?: Record<string, any>) {
    super(message, cause, metadata)
  }
}

// 401 - Unauthorized
export class UnauthorizedException extends AppException {
  readonly statusCode = 401
}

// 403 - Forbidden
export class ForbiddenException extends AppException {
  readonly statusCode = 403
}

// 404 - Not Found
export class NotFoundException extends AppException {
  readonly statusCode = 404
}

// 409 - Conflict
export class ConflictException extends AppException {
  readonly statusCode = 409
}

// 422 - Unprocessable Entity
export class UnprocessableEntityException extends AppException {
  readonly statusCode = 422
}

// 429 - Too Many Requests
export class TooManyRequestsException extends AppException {
  readonly statusCode = 429
}

// 500 - Internal Server Error
export class InternalServerErrorException extends AppException {
  readonly statusCode = 500
}

// 502 - Bad Gateway
export class BadGatewayException extends AppException {
  readonly statusCode = 502
}

// 503 - Service Unavailable
export class ServiceUnavailableException extends AppException {
  readonly statusCode = 503
}

// 504 - Gateway Timeout
export class GatewayTimeoutException extends AppException {
  readonly statusCode = 504
}
