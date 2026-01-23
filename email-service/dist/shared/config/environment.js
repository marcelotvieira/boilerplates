import { EmailProvider } from '../../core/email/enums/email-provider.enum.js';
export class Environment {
    static NODE_ENV = process.env.NODE_ENV || 'local';
    static STAGE = process.env.STAGE || 'local';
    static IS_LOCAL = this.NODE_ENV === 'local';
    static EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || 'mailpit');
    static MAILPIT_API_URL = process.env.MAILPIT_API_URL || 'http://localhost:8025/api/v1/send';
    static SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
    static EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'noreply@localhost';
    static EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Email Service';
    static DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'email-logs-local';
    static DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || undefined;
    static IDENTITY_EVENT_BUS_NAME = process.env.IDENTITY_EVENT_BUS_NAME || 'identity-service-local';
    static EVENTBRIDGE_ENDPOINT = process.env.EVENTBRIDGE_ENDPOINT || undefined;
    static validate() {
        const errors = [];
        if (!this.EMAIL_FROM_ADDRESS) {
            errors.push('EMAIL_FROM_ADDRESS is required');
        }
        if (!this.DYNAMODB_TABLE_NAME) {
            errors.push('DYNAMODB_TABLE_NAME is required');
        }
        if (this.EMAIL_PROVIDER === EmailProvider.SENDGRID && !this.SENDGRID_API_KEY) {
            errors.push('SENDGRID_API_KEY is required when using SendGrid provider');
        }
        if (this.EMAIL_PROVIDER === EmailProvider.MAILPIT && !this.MAILPIT_API_URL) {
            errors.push('MAILPIT_API_URL is required when using Mailpit provider');
        }
        if (errors.length > 0) {
            throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
        }
    }
    static print() {
        console.log('Environment Configuration:');
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
        });
    }
}
//# sourceMappingURL=environment.js.map