import { v4 as uuidv4 } from 'uuid';
import { Environment } from '../shared/config/environment.js';
import { Logger } from '../shared/utils/logger.js';
import { TemplateRenderer } from '../shared/utils/template-renderer.js';
import { initializeDynamoDB } from '../infrastructure/database/dynamodb.config.js';
import { saveEmailLog } from '../infrastructure/database/models/email-log.model.js';
import { MailpitProvider } from '../infrastructure/providers/mailpit.provider.js';
import { SendGridProvider } from '../infrastructure/providers/sendgrid.provider.js';
import { EmailProvider } from '../core/email/enums/email-provider.enum.js';
import { EmailTemplate } from '../core/email/enums/email-template.enum.js';
import { EmailLog } from '../core/email/entities/email-log.entity.js';
import { InvalidEventError, EmailProviderError, EmailProviderUnavailableError } from '../shared/exceptions/email.exceptions.js';
const logger = Logger.of('ProcessEmailEventHandler');
initializeDynamoDB();
export const handler = async (event) => {
    const emailId = uuidv4();
    const eventId = event.id;
    const detailType = event['detail-type'];
    const eventData = event.detail;
    logger.info('Processing email event', {
        emailId,
        eventId,
        detailType,
        source: event.source
    });
    try {
        Environment.validate();
        const { recipientEmail, subject, template, templateData } = extractEmailData(detailType, eventData);
        logger.info('Email event data extracted', {
            emailId,
            recipientEmail,
            subject,
            template
        });
        const html = TemplateRenderer.render(template, templateData);
        logger.debug('Template rendered successfully', { emailId, template });
        const provider = getEmailProvider();
        logger.info('Using email provider', {
            emailId,
            provider: provider.getName()
        });
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
            throw new EmailProviderUnavailableError(provider.getName());
        }
        const result = await provider.sendEmail({
            to: recipientEmail,
            from: Environment.EMAIL_FROM_ADDRESS,
            fromName: Environment.EMAIL_FROM_NAME,
            subject,
            html
        });
        if (!result.success) {
            throw new EmailProviderError(provider.getName(), result.error || 'Unknown error');
        }
        logger.info('Email sent successfully', {
            emailId,
            recipientEmail,
            messageId: result.messageId,
            provider: provider.getName()
        });
        const successLog = EmailLog.createSuccess(emailId, recipientEmail, template, Environment.EMAIL_PROVIDER, eventId, result.messageId, 0);
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
        });
        logger.info('Email log saved', { emailId });
    }
    catch (error) {
        logger.error('Failed to process email event', error, {
            emailId,
            eventId,
            detailType
        });
        try {
            const recipientEmail = eventData.email || 'unknown@email.com';
            const template = mapDetailTypeToTemplate(detailType);
            const failureLog = EmailLog.createFailure(emailId, recipientEmail, template, Environment.EMAIL_PROVIDER, eventId, error.message, 0);
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
            });
            logger.info('Error log saved', { emailId });
        }
        catch (logError) {
            logger.error('Failed to save error log', logError, { emailId });
        }
        throw error;
    }
};
function extractEmailData(detailType, eventData) {
    switch (detailType) {
        case 'EmailVerificationRequested': {
            const data = eventData;
            return {
                recipientEmail: data.email,
                subject: 'Verify Your Email Address',
                template: EmailTemplate.EMAIL_VERIFICATION,
                templateData: data.templateData
            };
        }
        case 'PasswordResetRequested': {
            const data = eventData;
            return {
                recipientEmail: data.email,
                subject: 'Reset Your Password',
                template: EmailTemplate.PASSWORD_RESET,
                templateData: data.templateData
            };
        }
        case 'InviteCreated': {
            const data = eventData;
            return {
                recipientEmail: data.email,
                subject: `You're invited to join ${data.tenantName}`,
                template: EmailTemplate.INVITE,
                templateData: data.templateData
            };
        }
        default:
            throw new InvalidEventError(`Unknown detail-type: ${detailType}`);
    }
}
function mapDetailTypeToTemplate(detailType) {
    switch (detailType) {
        case 'EmailVerificationRequested':
            return EmailTemplate.EMAIL_VERIFICATION;
        case 'PasswordResetRequested':
            return EmailTemplate.PASSWORD_RESET;
        case 'InviteCreated':
            return EmailTemplate.INVITE;
        default:
            return EmailTemplate.EMAIL_VERIFICATION;
    }
}
function getEmailProvider() {
    switch (Environment.EMAIL_PROVIDER) {
        case EmailProvider.MAILPIT:
            return new MailpitProvider(Environment.MAILPIT_API_URL);
        case EmailProvider.SENDGRID:
            return new SendGridProvider(Environment.SENDGRID_API_KEY);
        default:
            throw new Error(`Unknown email provider: ${Environment.EMAIL_PROVIDER}`);
    }
}
//# sourceMappingURL=process-email-event.handler.js.map