import { IEmailProvider, SendEmailParams, SendEmailResult } from '../../core/email/interfaces/email-provider.interface.js';
export declare class MailpitProvider implements IEmailProvider {
    private readonly apiUrl;
    constructor(apiUrl?: string);
    sendEmail(params: SendEmailParams): Promise<SendEmailResult>;
    getName(): string;
    isAvailable(): Promise<boolean>;
}
//# sourceMappingURL=mailpit.provider.d.ts.map