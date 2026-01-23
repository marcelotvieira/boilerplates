import dynamoose from 'dynamoose';
import { Environment } from '../../../shared/config/environment.js';
const emailLogSchema = new dynamoose.Schema({
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
    ttl: {
        type: Number,
        required: false
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});
export const EmailLogModel = dynamoose.model(Environment.DYNAMODB_TABLE_NAME, emailLogSchema, {
    create: false,
    waitForActive: false
});
export async function saveEmailLog(log) {
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
    });
}
export async function getEmailLog(emailId) {
    return await EmailLogModel.get({
        PK: `EMAIL#${emailId}`,
        SK: 'LOG'
    });
}
export async function getEmailLogsByEmail(email, limit = 50) {
    const results = await EmailLogModel.query('email').eq(email).limit(limit).exec();
    return results;
}
//# sourceMappingURL=email-log.model.js.map