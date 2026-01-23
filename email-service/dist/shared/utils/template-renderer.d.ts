import { EmailTemplate } from '../../core/email/enums/email-template.enum.js';
export declare class TemplateRenderer {
    private static templateCache;
    static render(template: EmailTemplate, data: Record<string, any>): string;
    private static getCompiledTemplate;
    private static getTemplatePath;
    static clearCache(): void;
}
//# sourceMappingURL=template-renderer.d.ts.map