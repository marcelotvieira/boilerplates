export interface SendEmailParams {
    to: string;
    from: string;
    fromName?: string;
    subject: string;
    html: string;
    text?: string;
}
export interface SendEmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
export interface IEmailProvider {
    sendEmail(params: SendEmailParams): Promise<SendEmailResult>;
    getName(): string;
    isAvailable(): Promise<boolean>;
}
//# sourceMappingURL=email-provider.interface.d.ts.map