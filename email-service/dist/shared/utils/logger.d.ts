export declare class Logger {
    private context;
    private constructor();
    static of(context: string): Logger;
    info(message: string, meta?: Record<string, any>): void;
    warn(message: string, meta?: Record<string, any>): void;
    error(message: string, error?: Error | any, meta?: Record<string, any>): void;
    debug(message: string, meta?: Record<string, any>): void;
    private log;
}
//# sourceMappingURL=logger.d.ts.map