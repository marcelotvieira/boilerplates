import { EmailStatus } from '../enums/email-status.enum.js';
export class EmailLog {
    emailId;
    email;
    template;
    status;
    provider;
    eventId;
    sentAt;
    error;
    retryCount;
    messageId;
    ttl;
    constructor(props) {
        this.emailId = props.emailId;
        this.email = props.email;
        this.template = props.template;
        this.status = props.status;
        this.provider = props.provider;
        this.eventId = props.eventId;
        this.sentAt = props.sentAt;
        this.error = props.error;
        this.retryCount = props.retryCount;
        this.messageId = props.messageId;
        this.ttl = props.ttl;
    }
    static create(props) {
        return new EmailLog(props);
    }
    static createSuccess(emailId, email, template, provider, eventId, messageId, retryCount = 0) {
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
        });
    }
    static createFailure(emailId, email, template, provider, eventId, error, retryCount = 0) {
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
        });
    }
    static calculateTTL() {
        const now = new Date();
        const ninetyDaysInSeconds = 90 * 24 * 60 * 60;
        return Math.floor(now.getTime() / 1000) + ninetyDaysInSeconds;
    }
}
//# sourceMappingURL=email-log.entity.js.map