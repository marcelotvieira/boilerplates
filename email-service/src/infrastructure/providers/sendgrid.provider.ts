import sgMail from '@sendgrid/mail'
import { IEmailProvider, SendEmailParams, SendEmailResult } from '../../core/email/interfaces/email-provider.interface.js'

/**
 * SendGrid Email Provider
 *
 * Production email provider using SendGrid API
 * - Requires HTTPS
 * - Free tier: 100 emails/day
 * - Reliable delivery with analytics
 */
export class SendGridProvider implements IEmailProvider {
  private readonly apiKey: string
  private initialized: boolean = false

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('SendGrid API key is required')
    }

    this.apiKey = apiKey
    this.initialize()
  }

  private initialize(): void {
    try {
      sgMail.setApiKey(this.apiKey)
      this.initialized = true
    } catch (error) {
      throw new Error('Failed to initialize SendGrid')
    }
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    if (!this.initialized) {
      return {
        success: false,
        error: 'SendGrid not initialized'
      }
    }

    try {
      const msg = {
        to: params.to,
        from: {
          email: params.from,
          name: params.fromName || 'Email Service'
        },
        subject: params.subject,
        html: params.html,
        text: params.text || this.stripHtmlTags(params.html)
      }

      const [response] = await sgMail.send(msg)

      // Extract message ID from response headers
      const messageId = response.headers['x-message-id'] as string || `sendgrid-${Date.now()}`

      return {
        success: true,
        messageId
      }
    } catch (error: any) {
      // SendGrid errors have a specific structure
      const errorMessage = error.response?.body?.errors?.[0]?.message ||
                          error.message ||
                          'Unknown SendGrid error'

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  getName(): string {
    return 'sendgrid'
  }

  async isAvailable(): Promise<boolean> {
    return this.initialized && this.apiKey !== ''
  }

  /**
   * Strip HTML tags to create plain text version
   */
  private stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim()
  }
}
