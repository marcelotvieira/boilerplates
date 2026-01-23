import Handlebars from 'handlebars'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { EmailTemplate } from '../../core/email/enums/email-template.enum.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Template Renderer using Handlebars
 *
 * Renders email templates with dynamic data
 */
export class TemplateRenderer {
  private static templateCache = new Map<EmailTemplate, HandlebarsTemplateDelegate>()

  /**
   * Render an email template
   */
  public static render(template: EmailTemplate, data: Record<string, any>): string {
    try {
      const compiledTemplate = this.getCompiledTemplate(template)
      return compiledTemplate(data)
    } catch (error: any) {
      throw new Error(`Failed to render template ${template}: ${error.message}`)
    }
  }

  /**
   * Get compiled template (with caching)
   */
  private static getCompiledTemplate(template: EmailTemplate): HandlebarsTemplateDelegate {
    // Check cache first
    if (this.templateCache.has(template)) {
      return this.templateCache.get(template)!
    }

    // Load and compile template
    const templatePath = this.getTemplatePath(template)
    const templateSource = readFileSync(templatePath, 'utf-8')
    const compiledTemplate = Handlebars.compile(templateSource)

    // Cache for future use
    this.templateCache.set(template, compiledTemplate)

    return compiledTemplate
  }

  /**
   * Get template file path
   */
  private static getTemplatePath(template: EmailTemplate): string {
    // Templates are in: src/infrastructure/templates/
    // This file is in: src/shared/utils/
    // So we go up 2 levels and into infrastructure/templates
    const templatesDir = join(__dirname, '..', '..', 'infrastructure', 'templates')

    const templateFile = `${template}.hbs`
    return join(templatesDir, templateFile)
  }

  /**
   * Clear template cache (useful for testing)
   */
  public static clearCache(): void {
    this.templateCache.clear()
  }
}
