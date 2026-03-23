// Structured logging utility for the blog application
// Supports different log levels and structured data

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  requestId?: string;
  path?: string;
  userAgent?: string;
  ip?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile?: boolean;
  filePath?: string;
  enableRemote?: boolean;
  remoteEndpoint?: string;
}

class Logger {
  private config: LoggerConfig;
  private isDevelopment: boolean;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: config.level ?? (process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO),
      enableConsole: config.enableConsole ?? true,
      enableFile: config.enableFile ?? false,
      filePath: config.filePath ?? './logs/app.log',
      enableRemote: config.enableRemote ?? false,
      remoteEndpoint: config.remoteEndpoint ?? '/api/logs',
      ...config,
    };
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private getLevelString(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return 'ERROR';
      case LogLevel.WARN:
        return 'WARN';
      case LogLevel.INFO:
        return 'INFO';
      case LogLevel.DEBUG:
        return 'DEBUG';
      default:
        return 'UNKNOWN';
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level;
  }

  private formatLogEntry(entry: LogEntry): string {
    const level = this.getLevelString(entry.level);
    const timestamp = entry.timestamp;
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const error = entry.error ? ` Error: ${entry.error.message}` : '';
    const metadata = [
      entry.userId && `user=${entry.userId}`,
      entry.requestId && `request=${entry.requestId}`,
      entry.path && `path=${entry.path}`,
      entry.ip && `ip=${entry.ip}`,
    ].filter(Boolean).join(' ');

    return `[${timestamp}] ${level}: ${entry.message}${context}${error}${metadata ? ` [${metadata}]` : ''}`;
  }

  private async writeToConsole(entry: LogEntry): Promise<void> {
    const formatted = this.formatLogEntry(entry);

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formatted);
        if (entry.error && this.isDevelopment) {
          console.error(entry.error.stack);
        }
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
    }
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    // In a real implementation, this would write to a file
    // For now, we'll just log to console in development
    if (this.isDevelopment) {
      const formatted = this.formatLogEntry(entry);
      console.log(`[FILE] ${formatted}`);
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    try {
      // In a real implementation, this would send to a remote logging service
      if (this.isDevelopment) {
        console.log(`[REMOTE] Would send log to ${this.config.remoteEndpoint}:`, entry);
      }
    } catch (error) {
      // Don't log logging errors to avoid infinite loops
      console.error('Failed to send log to remote:', error);
    }
  }

  private async log(level: LogLevel, message: string, options: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'message'>> = {}): Promise<void> {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      ...options,
    };

    try {
      if (this.config.enableConsole) {
        await this.writeToConsole(entry);
      }

      if (this.config.enableFile) {
        await this.writeToFile(entry);
      }

      if (this.config.enableRemote) {
        await this.sendToRemote(entry);
      }
    } catch (error) {
      // Fallback to basic console logging if structured logging fails
      console.error('Logging failed:', error);
      console.log(`[FALLBACK] ${this.getLevelString(level)}: ${message}`);
    }
  }

  // Public API
  async error(message: string, options?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'message'>>): Promise<void> {
    await this.log(LogLevel.ERROR, message, options);
  }

  async warn(message: string, options?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'message'>>): Promise<void> {
    await this.log(LogLevel.WARN, message, options);
  }

  async info(message: string, options?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'message'>>): Promise<void> {
    await this.log(LogLevel.INFO, message, options);
  }

  async debug(message: string, options?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'message'>>): Promise<void> {
    await this.log(LogLevel.DEBUG, message, options);
  }

  // Convenience methods for common scenarios
  async apiError(error: Error, path: string, method: string, userId?: string): Promise<void> {
    await this.error(`API Error: ${method} ${path}`, {
      error,
      path,
      userId,
      context: { method },
    });
  }

  async authError(error: Error, action: string, userId?: string): Promise<void> {
    await this.error(`Auth Error during ${action}`, {
      error,
      userId,
      context: { action },
    });
  }

  async databaseError(error: Error, operation: string, context?: Record<string, any>): Promise<void> {
    await this.error(`Database Error during ${operation}`, {
      error,
      context: { operation, ...context },
    });
  }

  async requestLog(method: string, path: string, statusCode: number, duration: number, userId?: string): Promise<void> {
    await this.info(`${method} ${path} ${statusCode}`, {
      path,
      userId,
      context: {
        method,
        statusCode,
        duration,
      },
    });
  }
}

// Create default logger instance
export const logger = new Logger();

// Create specialized loggers for different parts of the application
export const apiLogger = new Logger({
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
});

export const authLogger = new Logger({
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.WARN,
});

export const databaseLogger = new Logger({
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
});

export default logger;
