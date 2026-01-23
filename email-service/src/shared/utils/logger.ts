/**
 * Simple Logger Utility
 *
 * Provides structured logging for the email service
 */
export class Logger {
  private context: string

  private constructor(context: string) {
    this.context = context
  }

  public static of(context: string): Logger {
    return new Logger(context)
  }

  public info(message: string, meta?: Record<string, any>): void {
    this.log('INFO', message, meta)
  }

  public warn(message: string, meta?: Record<string, any>): void {
    this.log('WARN', message, meta)
  }

  public error(message: string, error?: Error | any, meta?: Record<string, any>): void {
    const errorMeta = {
      ...meta,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    }

    this.log('ERROR', message, errorMeta)
  }

  public debug(message: string, meta?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'local' || process.env.DEBUG === 'true') {
      this.log('DEBUG', message, meta)
    }
  }

  private log(level: string, message: string, meta?: Record<string, any>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...(meta && { meta })
    }

    console.log(JSON.stringify(logEntry))
  }
}
