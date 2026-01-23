import { EmailStatus } from '../enums/email-status.enum.js';
import { EmailTemplate } from '../enums/email-template.enum.js';
import { EmailProvider } from '../enums/email-provider.enum.js';
export interface EmailLogProps {
    emailId: string;
    email: string;
    template: EmailTemplate;
    status: EmailStatus;
    provider: EmailProvider;
    eventId: string;
    sentAt?: Date;
    error?: string;
    retryCount: number;
    messageId?: string;
    ttl?: number;
}
export declare class EmailLog {
    readonly emailId: string;
    readonly email: string;
    readonly template: EmailTemplate;
    readonly status: EmailStatus;
    readonly provider: EmailProvider;
    readonly eventId: string;
    readonly sentAt?: Date;
    readonly error?: string;
    readonly retryCount: number;
    readonly messageId?: string;
    readonly ttl?: number;
    private constructor();
    static create(props: EmailLogProps): EmailLog;
    static createSuccess(emailId: string, email: string, template: EmailTemplate, provider: EmailProvider, eventId: string, messageId: string, retryCount?: number): EmailLog;
    static createFailure(emailId: string, email: string, template: EmailTemplate, provider: EmailProvider, eventId: string, error: string, retryCount?: number): EmailLog;
    private static calculateTTL;
}
//# sourceMappingURL=email-log.entity.d.ts.map