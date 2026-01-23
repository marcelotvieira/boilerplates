/**
 * Email Provider Interface
 *
 * Adapter pattern for email providers
 * Allows easy switching between Mailpit (local) and SendGrid (production)
 */

export interface SendEmailParams {
  to: string
  from: string
  fromName?: string
  subject: string
  html: string
  text?: string
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface IEmailProvider {
  /**
   * Send an email
   */
  sendEmail(params: SendEmailParams): Promise<SendEmailResult>

  /**
   * Get provider name
   */
  getName(): string

  /**
   * Check if provider is available
   */
  isAvailable(): Promise<boolean>
}
