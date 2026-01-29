/* eslint-disable no-console */
/**
 * LOGGER UTILITY
 *
 * Centralized logging for the application.
 * This is a basic implementation that can be easily swapped with:
 * - Sentry (error tracking + performance monitoring)
 * - LogRocket (session replay + error tracking)
 * - Datadog (logs + APM)
 * - CloudWatch Logs (AWS)
 * - Google Cloud Logging (GCP)
 *
 * Usage:
 * ```ts
 * import { logger } from '@/lib/logger';
 *
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Payment failed', { error, orderId: '456' });
 * logger.warn('API rate limit approaching', { current: 95, limit: 100 });
 * ```
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  env: string;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Format log entry for structured logging
   */
  private formatLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      env: process.env.NODE_ENV || 'unknown',
    };
  }

  /**
   * Send log to external service (placeholder for future integration)
   */
  private async sendToExternalService(entry: LogEntry): Promise<void> {
    // TODO: Replace with actual service integration
    // Examples:
    //
    // Sentry:
    // if (entry.level === 'error') {
    //   Sentry.captureException(new Error(entry.message), {
    //     extra: entry.context,
    //   });
    // }
    //
    // Custom API endpoint:
    // await fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(entry),
    // });

    // For now, just return
    return Promise.resolve();
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const entry = this.formatLogEntry(level, message, context);

    // In development, use console with nice formatting
    if (this.isDevelopment) {
      const styles = {
        debug: 'color: gray',
        info: 'color: blue',
        warn: 'color: orange',
        error: 'color: red; font-weight: bold',
      };

      console.log(
        `%c[${entry.level.toUpperCase()}]%c ${entry.message}`,
        styles[level],
        'color: inherit'
      );

      if (context && Object.keys(context).length > 0) {
        console.log('Context:', context);
      }
    }

    // In production, use structured JSON logging
    if (this.isProduction) {
      // Log to console as JSON for log aggregation services
      console.log(JSON.stringify(entry));

      // Send critical errors to external service
      if (level === 'error') {
        this.sendToExternalService(entry).catch((err) => {
          // Fallback: if external service fails, at least log locally
          console.error('Failed to send log to external service:', err);
        });
      }
    }
  }

  /**
   * Debug: Detailed information for debugging
   * Only logged in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  /**
   * Info: General informational messages
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Warn: Warning messages for potentially harmful situations
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Error: Error messages for failures that need attention
   */
  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  /**
   * Track user actions for analytics
   */
  track(event: string, properties?: LogContext): void {
    this.info(`[TRACK] ${event}`, properties);

    // TODO: Integrate with analytics service
    // Examples:
    // - Mixpanel.track(event, properties)
    // - analytics.track(event, properties)
    // - gtag('event', event, properties)
  }

  /**
   * Set user context for error tracking
   */
  setUser(userId: string, metadata?: LogContext): void {
    this.debug('[USER] User context set', { userId, ...metadata });

    // TODO: Set user context in monitoring service
    // Examples:
    // - Sentry.setUser({ id: userId, ...metadata })
    // - LogRocket.identify(userId, metadata)
  }

  /**
   * Performance monitoring: measure operation duration
   */
  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - start;

      this.debug(`[PERF] ${operation}`, {
        duration: `${duration.toFixed(2)}ms`,
        success: true,
      });

      return result;
    } catch (error) {
      const duration = performance.now() - start;

      this.error(`[PERF] ${operation} failed`, {
        duration: `${duration.toFixed(2)}ms`,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger();
    const originalLog = childLogger.log.bind(childLogger);

    childLogger.log = (level: LogLevel, message: string, ctx?: LogContext) => {
      originalLog(level, message, { ...context, ...ctx });
    };

    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * INTEGRATION GUIDE
 *
 * To integrate with external services, replace the sendToExternalService method:
 *
 * === SENTRY ===
 * 1. Install: npm install @sentry/nextjs
 * 2. Run: npx @sentry/wizard@latest -i nextjs
 * 3. Update sendToExternalService:
 *    import * as Sentry from '@sentry/nextjs';
 *    if (entry.level === 'error') {
 *      Sentry.captureException(new Error(entry.message), {
 *        extra: entry.context,
 *      });
 *    }
 *
 * === LOGROCKET ===
 * 1. Install: npm install logrocket
 * 2. Initialize in app/layout.tsx:
 *    import LogRocket from 'logrocket';
 *    LogRocket.init('your-app-id');
 * 3. Update sendToExternalService:
 *    import LogRocket from 'logrocket';
 *    if (entry.level === 'error') {
 *      LogRocket.captureException(new Error(entry.message), {
 *        extra: entry.context,
 *      });
 *    }
 *
 * === CUSTOM API ===
 * Send logs to your own endpoint:
 *    await fetch('/api/logs', {
 *      method: 'POST',
 *      headers: { 'Content-Type': 'application/json' },
 *      body: JSON.stringify(entry),
 *    });
 */
