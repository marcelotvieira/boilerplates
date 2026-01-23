import { EmailProvider } from '../../core/email/enums/email-provider.enum.js'

/**
 * Environment Configuration
 *
 * Centralized configuration from environment variables
 */
export class Environment {
  // General
  public static readonly NODE_ENV = process.env.NODE_ENV || 'local'
  public static readonly STAGE = process.env.STAGE || 'local'
  public static readonly IS_LOCAL = this.NODE_ENV === 'local'

  // Email Provider
  public static readonly EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || 'mailpit') as EmailProvider
  public static readonly MAILPIT_API_URL = process.env.MAILPIT_API_URL || 'http://localhost:8025/api/v1/send'
  public static readonly SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || ''

  // Email From
  public static readonly EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'noreply@localhost'
  public static readonly EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Email Service'

  // DynamoDB
  public static readonly DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'email-logs-local'
  public static readonly DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || undefined

  // EventBridge
  public static readonly IDENTITY_EVENT_BUS_NAME = process.env.IDENTITY_EVENT_BUS_NAME || 'identity-service-local'
  public static readonly EVENTBRIDGE_ENDPOINT = process.env.EVENTBRIDGE_ENDPOINT || undefined

  /**
   * Validate required environment variables
   */
  public static validate(): void {
    const errors: string[] = []

    if (!this.EMAIL_FROM_ADDRESS) {
      errors.push('EMAIL_FROM_ADDRESS is required')
    }

    if (!this.DYNAMODB_TABLE_NAME) {
      errors.push('DYNAMODB_TABLE_NAME is required')
    }

    if (this.EMAIL_PROVIDER === EmailProvider.SENDGRID && !this.SENDGRID_API_KEY) {
      errors.push('SENDGRID_API_KEY is required when using SendGrid provider')
    }

    if (this.EMAIL_PROVIDER === EmailProvider.MAILPIT && !this.MAILPIT_API_URL) {
      errors.push('MAILPIT_API_URL is required when using Mailpit provider')
    }

    if (errors.length > 0) {
      throw new Error(`Environment validation failed:\n${errors.join('\n')}`)
    }
  }

  /**
   * Print configuration (without sensitive data)
   */
  public static print(): void {
    console.log('Environment Configuration:')
    console.log({
      NODE_ENV: this.NODE_ENV,
      STAGE: this.STAGE,
      EMAIL_PROVIDER: this.EMAIL_PROVIDER,
      EMAIL_FROM_ADDRESS: this.EMAIL_FROM_ADDRESS,
      EMAIL_FROM_NAME: this.EMAIL_FROM_NAME,
      DYNAMODB_TABLE_NAME: this.DYNAMODB_TABLE_NAME,
      DYNAMODB_ENDPOINT: this.DYNAMODB_ENDPOINT || '(default)',
      SENDGRID_API_KEY: this.SENDGRID_API_KEY ? '***' : '(not set)',
      MAILPIT_API_URL: this.MAILPIT_API_URL
    })
  }
}
