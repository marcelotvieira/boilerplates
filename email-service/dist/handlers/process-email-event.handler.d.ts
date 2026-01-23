import { EventBridgeEvent } from 'aws-lambda';
interface EmailVerificationRequestedData {
    email: string;
    fullName: string;
    verificationCode: string;
    expiresAt: string;
    template: string;
    templateData: {
        userName: string;
        code: string;
        expiresInMinutes: number;
    };
}
interface PasswordResetRequestedData {
    email: string;
    fullName: string;
    resetCode: string;
    expiresAt: string;
    template: string;
    templateData: {
        userName: string;
        code: string;
        expiresInMinutes: number;
    };
}
interface InviteCreatedData {
    inviteToken: string;
    email: string;
    tenantId: string;
    tenantName: string;
    role: string;
    invitedBy: string;
    inviteLink: string;
    expiresAt: string;
    template: string;
    templateData: {
        recipientEmail: string;
        tenantName: string;
        invitedByName: string;
        role: string;
        inviteLink: string;
        expiresInDays: number;
    };
}
type EmailEventData = EmailVerificationRequestedData | PasswordResetRequestedData | InviteCreatedData;
export declare const handler: (event: EventBridgeEvent<string, EmailEventData>) => Promise<void>;
export {};
//# sourceMappingURL=process-email-event.handler.d.ts.map