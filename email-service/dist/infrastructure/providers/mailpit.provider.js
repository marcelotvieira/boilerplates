export class MailpitProvider {
    apiUrl;
    constructor(apiUrl = 'http://localhost:8025/api/v1/send') {
        this.apiUrl = apiUrl;
    }
    async sendEmail(params) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: {
                        email: params.from,
                        name: params.fromName || 'Email Service'
                    },
                    to: [
                        {
                            email: params.to
                        }
                    ],
                    subject: params.subject,
                    html: params.html,
                    text: params.text
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Mailpit API error: ${response.status} - ${errorText}`);
            }
            const messageId = `mailpit-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            return {
                success: true,
                messageId
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Unknown Mailpit error'
            };
        }
    }
    getName() {
        return 'mailpit';
    }
    async isAvailable() {
        try {
            const healthUrl = this.apiUrl.replace('/api/v1/send', '/api/v1/info');
            const response = await fetch(healthUrl, {
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            return response.ok;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=mailpit.provider.js.map