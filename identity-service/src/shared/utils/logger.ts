type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

export class Logger {
  private context: string

  private constructor(context: string) {
    this.context = context
  }

  static of(context: string): Logger {
    return new Logger(context)
  }

  private log(level: LogLevel, message: string, data?: any, context?: LogContext): void {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      context: this.context,
      message,
      ...(data && { data }),
      ...(context && { context })
    }

    const logString = JSON.stringify(logEntry)

    switch (level) {
      case 'debug':
        console.debug(logString)
        break
      case 'info':
        console.info(logString)
        break
      case 'warn':
        console.warn(logString)
        break
      case 'error':
        console.error(logString)
        break
    }
  }

  debug(message: string, data?: any, context?: LogContext): void {
    this.log('debug', message, data, context)
  }

  info(message: string, data?: any, context?: LogContext): void {
    this.log('info', message, data, context)
  }

  warn(message: string, data?: any, context?: LogContext): void {
    this.log('warn', message, data, context)
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorData = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      : error

    this.log('error', message, errorData, context)
  }
}
