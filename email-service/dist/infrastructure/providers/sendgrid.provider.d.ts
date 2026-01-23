import { IEmailProvider, SendEmailParams, SendEmailResult } from '../../core/email/interfaces/email-provider.interface.js';
export declare class SendGridProvider implements IEmailProvider {
    private readonly apiKey;
    private initialized;
    constructor(apiKey: string);
    private initialize;
    sendEmail(params: SendEmailParams): Promise<SendEmailResult>;
    getName(): string;
    isAvailable(): Promise<boolean>;
    private stripHtmlTags;
}
//# sourceMappingURL=sendgrid.provider.d.ts.map