/**
 * Email Service Exceptions
 */

export class EmailServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EmailServiceError'
  }
}

export class TemplateRenderError extends EmailServiceError {
  constructor(template: string, originalError: string) {
    super(`Failed to render template ${template}: ${originalError}`)
    this.name = 'TemplateRenderError'
  }
}

export class EmailProviderError extends EmailServiceError {
  constructor(provider: string, originalError: string) {
    super(`Email provider ${provider} failed: ${originalError}`)
    this.name = 'EmailProviderError'
  }
}

export class EmailProviderUnavailableError extends EmailServiceError {
  constructor(provider: string) {
    super(`Email provider ${provider} is not available`)
    this.name = 'EmailProviderUnavailableError'
  }
}

export class InvalidEventError extends EmailServiceError {
  constructor(reason: string) {
    super(`Invalid email event: ${reason}`)
    this.name = 'InvalidEventError'
  }
}

export class EmailLogSaveError extends EmailServiceError {
  constructor(originalError: string) {
    super(`Failed to save email log: ${originalError}`)
    this.name = 'EmailLogSaveError'
  }
}
