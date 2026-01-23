import { IEmailProvider, SendEmailParams, SendEmailResult } from '../../core/email/interfaces/email-provider.interface.js'

/**
 * Mailpit Email Provider
 *
 * Local development email provider using Mailpit HTTP API
 * - Runs on http://localhost:8025 (no HTTPS required)
 * - Perfect for local development and testing
 * - View emails in web UI at http://localhost:8025
 */
export class MailpitProvider implements IEmailProvider {
  private readonly apiUrl: string

  constructor(apiUrl: string = 'http://localhost:8025/api/v1/send') {
    this.apiUrl = apiUrl
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: {
            email: params.from,
            name: params.fromName || 'Email Service'
          },
          to: [
            {
              email: params.to
            }
          ],
          subject: params.subject,
          html: params.html,
          text: params.text
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Mailpit API error: ${response.status} - ${errorText}`)
      }

      // Mailpit doesn't return a message ID, so we generate one
      const messageId = `mailpit-${Date.now()}-${Math.random().toString(36).substring(7)}`

      return {
        success: true,
        messageId
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown Mailpit error'
      }
    }
  }

  getName(): string {
    return 'mailpit'
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Check if Mailpit is running by hitting the health endpoint
      const healthUrl = this.apiUrl.replace('/api/v1/send', '/api/v1/info')
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(3000) // 3 second timeout
      })

      return response.ok
    } catch {
      return false
    }
  }
}
