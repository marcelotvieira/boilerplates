export class EmailServiceError extends Error {
    constructor(message) {
        super(message);
        this.name = 'EmailServiceError';
    }
}
export class TemplateRenderError extends EmailServiceError {
    constructor(template, originalError) {
        super(`Failed to render template ${template}: ${originalError}`);
        this.name = 'TemplateRenderError';
    }
}
export class EmailProviderError extends EmailServiceError {
    constructor(provider, originalError) {
        super(`Email provider ${provider} failed: ${originalError}`);
        this.name = 'EmailProviderError';
    }
}
export class EmailProviderUnavailableError extends EmailServiceError {
    constructor(provider) {
        super(`Email provider ${provider} is not available`);
        this.name = 'EmailProviderUnavailableError';
    }
}
export class InvalidEventError extends EmailServiceError {
    constructor(reason) {
        super(`Invalid email event: ${reason}`);
        this.name = 'InvalidEventError';
    }
}
export class EmailLogSaveError extends EmailServiceError {
    constructor(originalError) {
        super(`Failed to save email log: ${originalError}`);
        this.name = 'EmailLogSaveError';
    }
}
//# sourceMappingURL=email.exceptions.js.map