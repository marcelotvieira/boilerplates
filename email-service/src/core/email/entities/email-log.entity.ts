import { EmailStatus } from '../enums/email-status.enum.js'
import { EmailTemplate } from '../enums/email-template.enum.js'
import { EmailProvider } from '../enums/email-provider.enum.js'

export interface EmailLogProps {
  emailId: string
  email: string
  template: EmailTemplate
  status: EmailStatus
  provider: EmailProvider
  eventId: string
  sentAt?: Date
  error?: string
  retryCount: number
  messageId?: string
  ttl?: number
}

/**
 * Email Log Entity
 *
 * Records email sending attempts for audit and debugging
 */
export class EmailLog {
  public readonly emailId: string
  public readonly email: string
  public readonly template: EmailTemplate
  public readonly status: EmailStatus
  public readonly provider: EmailProvider
  public readonly eventId: string
  public readonly sentAt?: Date
  public readonly error?: string
  public readonly retryCount: number
  public readonly messageId?: string
  public readonly ttl?: number

  private constructor(props: EmailLogProps) {
    this.emailId = props.emailId
    this.email = props.email
    this.template = props.template
    this.status = props.status
    this.provider = props.provider
    this.eventId = props.eventId
    this.sentAt = props.sentAt
    this.error = props.error
    this.retryCount = props.retryCount
    this.messageId = props.messageId
    this.ttl = props.ttl
  }

  public static create(props: EmailLogProps): EmailLog {
    return new EmailLog(props)
  }

  public static createSuccess(
    emailId: string,
    email: string,
    template: EmailTemplate,
    provider: EmailProvider,
    eventId: string,
    messageId: string,
    retryCount: number = 0
  ): EmailLog {
    return new EmailLog({
      emailId,
      email,
      template,
      status: EmailStatus.SENT,
      provider,
      eventId,
      sentAt: new Date(),
      messageId,
      retryCount,
      ttl: this.calculateTTL()
    })
  }

  public static createFailure(
    emailId: string,
    email: string,
    template: EmailTemplate,
    provider: EmailProvider,
    eventId: string,
    error: string,
    retryCount: number = 0
  ): EmailLog {
    return new EmailLog({
      emailId,
      email,
      template,
      status: EmailStatus.FAILED,
      provider,
      eventId,
      sentAt: new Date(),
      error,
      retryCount,
      ttl: this.calculateTTL()
    })
  }

  /**
   * Calculate TTL for 90 days from now (LGPD compliance)
   */
  private static calculateTTL(): number {
    const now = new Date()
    const ninetyDaysInSeconds = 90 * 24 * 60 * 60
    return Math.floor(now.getTime() / 1000) + ninetyDaysInSeconds
  }
}
