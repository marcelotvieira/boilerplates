import sgMail from '@sendgrid/mail';
export class SendGridProvider {
    apiKey;
    initialized = false;
    constructor(apiKey) {
        if (!apiKey || apiKey.trim() === '') {
            throw new Error('SendGrid API key is required');
        }
        this.apiKey = apiKey;
        this.initialize();
    }
    initialize() {
        try {
            sgMail.setApiKey(this.apiKey);
            this.initialized = true;
        }
        catch (error) {
            throw new Error('Failed to initialize SendGrid');
        }
    }
    async sendEmail(params) {
        if (!this.initialized) {
            return {
                success: false,
                error: 'SendGrid not initialized'
            };
        }
        try {
            const msg = {
                to: params.to,
                from: {
                    email: params.from,
                    name: params.fromName || 'Email Service'
                },
                subject: params.subject,
                html: params.html,
                text: params.text || this.stripHtmlTags(params.html)
            };
            const [response] = await sgMail.send(msg);
            const messageId = response.headers['x-message-id'] || `sendgrid-${Date.now()}`;
            return {
                success: true,
                messageId
            };
        }
        catch (error) {
            const errorMessage = error.response?.body?.errors?.[0]?.message ||
                error.message ||
                'Unknown SendGrid error';
            return {
                success: false,
                error: errorMessage
            };
        }
    }
    getName() {
        return 'sendgrid';
    }
    async isAvailable() {
        return this.initialized && this.apiKey !== '';
    }
    stripHtmlTags(html) {
        return html.replace(/<[^>]*>/g, '').trim();
    }
}
//# sourceMappingURL=sendgrid.provider.js.map