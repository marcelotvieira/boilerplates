export declare class EmailServiceError extends Error {
    constructor(message: string);
}
export declare class TemplateRenderError extends EmailServiceError {
    constructor(template: string, originalError: string);
}
export declare class EmailProviderError extends EmailServiceError {
    constructor(provider: string, originalError: string);
}
export declare class EmailProviderUnavailableError extends EmailServiceError {
    constructor(provider: string);
}
export declare class InvalidEventError extends EmailServiceError {
    constructor(reason: string);
}
export declare class EmailLogSaveError extends EmailServiceError {
    constructor(originalError: string);
}
//# sourceMappingURL=email.exceptions.d.ts.map