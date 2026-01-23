export class Logger {
    context;
    constructor(context) {
        this.context = context;
    }
    static of(context) {
        return new Logger(context);
    }
    info(message, meta) {
        this.log('INFO', message, meta);
    }
    warn(message, meta) {
        this.log('WARN', message, meta);
    }
    error(message, error, meta) {
        const errorMeta = {
            ...meta,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : error
        };
        this.log('ERROR', message, errorMeta);
    }
    debug(message, meta) {
        if (process.env.NODE_ENV === 'local' || process.env.DEBUG === 'true') {
            this.log('DEBUG', message, meta);
        }
    }
    log(level, message, meta) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            context: this.context,
            message,
            ...(meta && { meta })
        };
        console.log(JSON.stringify(logEntry));
    }
}
//# sourceMappingURL=logger.js.map