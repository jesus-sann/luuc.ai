import * as Sentry from "@sentry/nextjs";

export interface ErrorContext {
  user?: {
    id: string;
    email?: string;
    company_id?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

/**
 * Capture an exception and send it to Sentry
 * Safe to use - will not crash if Sentry is not configured
 */
export function captureException(
  error: Error,
  context?: ErrorContext
): string | undefined {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN && !process.env.SENTRY_DSN) {
    console.error("Error (Sentry not configured):", error);
    return undefined;
  }

  return Sentry.captureException(error, {
    user: context?.user
      ? {
          id: context.user.id,
          email: context.user.email,
        }
      : undefined,
    tags: {
      ...context?.tags,
      company_id: context?.user?.company_id,
    },
    extra: context?.extra,
  });
}

/**
 * Capture a message and send it to Sentry
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: ErrorContext
): string | undefined {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN && !process.env.SENTRY_DSN) {
    console.log(`${level.toUpperCase()}: ${message}`, context);
    return undefined;
  }

  return Sentry.captureMessage(message, {
    level,
    user: context?.user
      ? {
          id: context.user.id,
          email: context.user.email,
        }
      : undefined,
    tags: {
      ...context?.tags,
      company_id: context?.user?.company_id,
    },
    extra: context?.extra,
  });
}

/**
 * Set user context for all future errors
 */
export function setUser(user: {
  id: string;
  email?: string;
  company_id?: string;
}): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN && !process.env.SENTRY_DSN) {
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
  });

  if (user.company_id) {
    Sentry.setTag("company_id", user.company_id);
  }
}

/**
 * Clear user context
 */
export function clearUser(): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN && !process.env.SENTRY_DSN) {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: Sentry.SeverityLevel = "info",
  data?: Record<string, unknown>
): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN && !process.env.SENTRY_DSN) {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}

/**
 * Wrap async functions with error capturing
 */
export function withErrorCapture<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof Error) {
        captureException(error, context);
      }
      throw error;
    }
  }) as T;
}
