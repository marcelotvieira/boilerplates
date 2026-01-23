import { EventBridgeEvent } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'
import { Environment } from '../shared/config/environment.js'
import { Logger } from '../shared/utils/logger.js'
import { TemplateRenderer } from '../shared/utils/template-renderer.js'
import { initializeDynamoDB } from '../infrastructure/database/dynamodb.config.js'
import { saveEmailLog } from '../infrastructure/database/models/email-log.model.js'
import { IEmailProvider } from '../core/email/interfaces/email-provider.interface.js'
import { MailpitProvider } from '../infrastructure/providers/mailpit.provider.js'
import { SendGridProvider } from '../infrastructure/providers/sendgrid.provider.js'
import { EmailProvider } from '../core/email/enums/email-provider.enum.js'
import { EmailTemplate } from '../core/email/enums/email-template.enum.js'
import { EmailLog } from '../core/email/entities/email-log.entity.js'
import {
  InvalidEventError,
  EmailProviderError,
  EmailProviderUnavailableError
} from '../shared/exceptions/email.exceptions.js'

const logger = Logger.of('ProcessEmailEventHandler')

// Initialize DynamoDB once
initializeDynamoDB()

/**
 * Event types from Identity Service
 */
interface EmailVerificationRequestedData {
  email: string
  fullName: string
  verificationCode: string
  expiresAt: string
  template: string
  templateData: {
    userName: string
    code: string
    expiresInMinutes: number
  }
}

interface PasswordResetRequestedData {
  email: string
  fullName: string
  resetCode: string
  expiresAt: string
  template: string
  templateData: {
    userName: string
    code: string
    expiresInMinutes: number
  }
}

interface InviteCreatedData {
  inviteToken: string
  email: string
  tenantId: string
  tenantName: string
  role: string
  invitedBy: string
  inviteLink: string
  expiresAt: string
  template: string
  templateData: {
    recipientEmail: string
    tenantName: string
    invitedByName: string
    role: string
    inviteLink: string
    expiresInDays: number
  }
}

type EmailEventData = EmailVerificationRequestedData | PasswordResetRequestedData | InviteCreatedData

/**
 * Main Lambda Handler
 *
 * Processes email events from EventBridge:
 * 1. EmailVerificationRequested
 * 2. PasswordResetRequested
 * 3. InviteCreated
 */
export const handler = async (event: EventBridgeEvent<string, any>): Promise<void> => {
  const emailId = uuidv4()
  const eventId = event.id
  const detailType = event['detail-type']
  const eventData = event.detail

  // The actual data is nested inside event.detail.data
  const actualData = eventData.data || eventData

  logger.info('Processing email event', {
    emailId,
    eventId,
    detailType,
    source: event.source
  })

  // DEBUG: Log raw event to see what's arriving
  logger.debug('Raw event received', {
    emailId,
    event: JSON.stringify(event, null, 2),
    eventDetail: JSON.stringify(eventData, null, 2)
  })

  try {
    // Validate environment
    Environment.validate()

    // Extract email data from event (using the nested data)
    const { recipientEmail, subject, template, templateData } = extractEmailData(detailType, actualData)

    logger.info('Email event data extracted', {
      emailId,
      recipientEmail,
      subject,
      template
    })

    // Render HTML template
    const html = TemplateRenderer.render(template, templateData)

    logger.debug('Template rendered successfully', { emailId, template })

    // Get email provider
    const provider = getEmailProvider()

    logger.info('Using email provider', {
      emailId,
      provider: provider.getName()
    })

    // Check provider availability
    const isAvailable = await provider.isAvailable()
    if (!isAvailable) {
      throw new EmailProviderUnavailableError(provider.getName())
    }

    // Send email
    const result = await provider.sendEmail({
      to: recipientEmail,
      from: Environment.EMAIL_FROM_ADDRESS,
      fromName: Environment.EMAIL_FROM_NAME,
      subject,
      html
    })

    if (!result.success) {
      throw new EmailProviderError(provider.getName(), result.error || 'Unknown error')
    }

    logger.info('Email sent successfully', {
      emailId,
      recipientEmail,
      messageId: result.messageId,
      provider: provider.getName()
    })

    // Save success log
    const successLog = EmailLog.createSuccess(
      emailId,
      recipientEmail,
      template,
      Environment.EMAIL_PROVIDER,
      eventId,
      result.messageId!,
      0 // retryCount (EventBridge handles retries)
    )

    await saveEmailLog({
      emailId: successLog.emailId,
      email: successLog.email,
      template: successLog.template,
      status: successLog.status,
      provider: successLog.provider,
      eventId: successLog.eventId,
      sentAt: successLog.sentAt,
      messageId: successLog.messageId,
      retryCount: successLog.retryCount,
      ttl: successLog.ttl
    })

    logger.info('Email log saved', { emailId })

  } catch (error: any) {
    logger.error('Failed to process email event', error, {
      emailId,
      eventId,
      detailType
    })

    // Save failure log
    try {
      const recipientEmail = (eventData as any).email || 'unknown@email.com'
      const template = mapDetailTypeToTemplate(detailType)

      const failureLog = EmailLog.createFailure(
        emailId,
        recipientEmail,
        template,
        Environment.EMAIL_PROVIDER,
        eventId,
        error.message,
        0
      )

      await saveEmailLog({
        emailId: failureLog.emailId,
        email: failureLog.email,
        template: failureLog.template,
        status: failureLog.status,
        provider: failureLog.provider,
        eventId: failureLog.eventId,
        sentAt: failureLog.sentAt,
        error: failureLog.error,
        retryCount: failureLog.retryCount,
        ttl: failureLog.ttl
      })

      logger.info('Error log saved', { emailId })
    } catch (logError: any) {
      logger.error('Failed to save error log', logError, { emailId })
    }

    // Rethrow error so EventBridge can retry
    throw error
  }
}

/**
 * Extract email data from event
 */
function extractEmailData(detailType: string, eventData: EmailEventData): {
  recipientEmail: string
  subject: string
  template: EmailTemplate
  templateData: Record<string, any>
} {
  switch (detailType) {
    case 'EmailVerificationRequested': {
      const data = eventData as EmailVerificationRequestedData
      return {
        recipientEmail: data.email,
        subject: 'Verifique seu Endereço de Email',
        template: EmailTemplate.EMAIL_VERIFICATION,
        templateData: data.templateData
      }
    }

    case 'PasswordResetRequested': {
      const data = eventData as PasswordResetRequestedData
      return {
        recipientEmail: data.email,
        subject: 'Redefina sua Senha',
        template: EmailTemplate.PASSWORD_RESET,
        templateData: data.templateData
      }
    }

    case 'InviteCreated': {
      const data = eventData as InviteCreatedData
      return {
        recipientEmail: data.email,
        subject: `Você foi convidado para ${data.tenantName}`,
        template: EmailTemplate.INVITE,
        templateData: data.templateData
      }
    }

    default:
      throw new InvalidEventError(`Unknown detail-type: ${detailType}`)
  }
}

/**
 * Map detail-type to EmailTemplate
 */
function mapDetailTypeToTemplate(detailType: string): EmailTemplate {
  switch (detailType) {
    case 'EmailVerificationRequested':
      return EmailTemplate.EMAIL_VERIFICATION
    case 'PasswordResetRequested':
      return EmailTemplate.PASSWORD_RESET
    case 'InviteCreated':
      return EmailTemplate.INVITE
    default:
      return EmailTemplate.EMAIL_VERIFICATION
  }
}

/**
 * Get email provider based on environment
 */
function getEmailProvider(): IEmailProvider {
  switch (Environment.EMAIL_PROVIDER) {
    case EmailProvider.MAILPIT:
      return new MailpitProvider(Environment.MAILPIT_API_URL)

    case EmailProvider.SENDGRID:
      return new SendGridProvider(Environment.SENDGRID_API_KEY)

    default:
      throw new Error(`Unknown email provider: ${Environment.EMAIL_PROVIDER}`)
  }
}
