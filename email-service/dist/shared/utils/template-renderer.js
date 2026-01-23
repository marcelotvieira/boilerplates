import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export class TemplateRenderer {
    static templateCache = new Map();
    static render(template, data) {
        try {
            const compiledTemplate = this.getCompiledTemplate(template);
            return compiledTemplate(data);
        }
        catch (error) {
            throw new Error(`Failed to render template ${template}: ${error.message}`);
        }
    }
    static getCompiledTemplate(template) {
        if (this.templateCache.has(template)) {
            return this.templateCache.get(template);
        }
        const templatePath = this.getTemplatePath(template);
        const templateSource = readFileSync(templatePath, 'utf-8');
        const compiledTemplate = Handlebars.compile(templateSource);
        this.templateCache.set(template, compiledTemplate);
        return compiledTemplate;
    }
    static getTemplatePath(template) {
        const templatesDir = join(__dirname, '..', '..', 'infrastructure', 'templates');
        const templateFile = `${template}.hbs`;
        return join(templatesDir, templateFile);
    }
    static clearCache() {
        this.templateCache.clear();
    }
}
//# sourceMappingURL=template-renderer.js.map