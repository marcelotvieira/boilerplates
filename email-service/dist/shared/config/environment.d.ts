import { EmailProvider } from '../../core/email/enums/email-provider.enum.js';
export declare class Environment {
    static readonly NODE_ENV: string;
    static readonly STAGE: string;
    static readonly IS_LOCAL: boolean;
    static readonly EMAIL_PROVIDER: EmailProvider;
    static readonly MAILPIT_API_URL: string;
    static readonly SENDGRID_API_KEY: string;
    static readonly EMAIL_FROM_ADDRESS: string;
    static readonly EMAIL_FROM_NAME: string;
    static readonly DYNAMODB_TABLE_NAME: string;
    static readonly DYNAMODB_ENDPOINT: string | undefined;
    static readonly IDENTITY_EVENT_BUS_NAME: string;
    static readonly EVENTBRIDGE_ENDPOINT: string | undefined;
    static validate(): void;
    static print(): void;
}
//# sourceMappingURL=environment.d.ts.map