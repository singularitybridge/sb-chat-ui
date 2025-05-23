type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: any;
  error?: Error;
}

class LoggingService {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  private log(level: LogLevel, message: string, context?: any): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
    };

    // Add to buffer for potential error reporting
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // Only log to console in development
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[${level.toUpperCase()}]`, message, context || '');
    }
  }

  debug(message: string, context?: any): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: any): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: any): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | any, context?: any): void {
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date(),
      context,
      error: error instanceof Error ? error : new Error(String(error)),
    };

    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // Always log errors to console
    console.error(`[ERROR]`, message, error, context || '');
  }

  // Get recent logs for error reporting
  getRecentLogs(count: number = 20): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  // Clear log buffer
  clearLogs(): void {
    this.logBuffer = [];
  }
}

export const logger = new LoggingService();