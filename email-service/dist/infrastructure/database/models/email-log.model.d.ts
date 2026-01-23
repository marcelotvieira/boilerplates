export declare const EmailLogModel: import("dynamoose/dist/General.js").ModelType<import("dynamoose/dist/Item.js").AnyItem>;
export declare function saveEmailLog(log: {
    emailId: string;
    email: string;
    template: string;
    status: string;
    provider: string;
    eventId: string;
    sentAt?: Date;
    error?: string;
    retryCount: number;
    messageId?: string;
    ttl?: number;
}): Promise<void>;
export declare function getEmailLog(emailId: string): Promise<any>;
export declare function getEmailLogsByEmail(email: string, limit?: number): Promise<any[]>;
//# sourceMappingURL=email-log.model.d.ts.map