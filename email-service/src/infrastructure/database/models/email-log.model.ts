import dynamoose from 'dynamoose'
import { Environment } from '../../../shared/config/environment.js'

/**
 * DynamoDB Schema for Email Logs
 *
 * Table: email-logs-{stage}
 *
 * Access Patterns:
 * 1. Get log by emailId (PK query)
 * 2. Get all logs for an email address (GSI query)
 * 3. TTL for 90-day compliance (LGPD)
 */

const emailLogSchema = new dynamoose.Schema(
  {
    // Primary Key
    PK: {
      type: String,
      hashKey: true,
      required: true
    },
    SK: {
      type: String,
      rangeKey: true,
      required: true
    },

    // Email Log Fields
    emailId: {
      type: String,
      required: true,
      index: {
        name: 'EmailIdIndex',
        type: 'global'
      }
    },
    email: {
      type: String,
      required: true,
      index: {
        name: 'EmailIndex',
        type: 'global',
        rangeKey: 'sentAt'
      }
    },
    template: {
      type: String,
      required: true,
      enum: ['email-verification', 'password-reset', 'invite']
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'sent', 'failed']
    },
    provider: {
      type: String,
      required: true,
      enum: ['mailpit', 'sendgrid']
    },
    eventId: {
      type: String,
      required: true
    },
    sentAt: {
      type: String,
      required: false
    },
    error: {
      type: String,
      required: false
    },
    retryCount: {
      type: Number,
      required: true,
      default: 0
    },
    messageId: {
      type: String,
      required: false
    },

    // TTL for 90-day compliance
    ttl: {
      type: Number,
      required: false
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  }
)

// Create the model
export const EmailLogModel = dynamoose.model(
  Environment.DYNAMODB_TABLE_NAME,
  emailLogSchema,
  {
    create: false, // Don't auto-create table (managed by Serverless)
    waitForActive: false
  }
)

/**
 * Save email log to DynamoDB
 */
export async function saveEmailLog(log: {
  emailId: string
  email: string
  template: string
  status: string
  provider: string
  eventId: string
  sentAt?: Date
  error?: string
  retryCount: number
  messageId?: string
  ttl?: number
}): Promise<void> {
  await EmailLogModel.create({
    PK: `EMAIL#${log.emailId}`,
    SK: 'LOG',
    emailId: log.emailId,
    email: log.email,
    template: log.template,
    status: log.status,
    provider: log.provider,
    eventId: log.eventId,
    sentAt: log.sentAt?.toISOString(),
    error: log.error,
    retryCount: log.retryCount,
    messageId: log.messageId,
    ttl: log.ttl
  })
}

/**
 * Get email log by emailId
 */
export async function getEmailLog(emailId: string): Promise<any> {
  return await EmailLogModel.get({
    PK: `EMAIL#${emailId}`,
    SK: 'LOG'
  })
}

/**
 * Query email logs by email address
 */
export async function getEmailLogsByEmail(email: string, limit: number = 50): Promise<any[]> {
  const results = await EmailLogModel.query('email').eq(email).limit(limit).exec()
  return results
}
