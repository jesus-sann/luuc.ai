import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment detection
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",

    // Tracing sample rate
    // Reduce in production to control costs
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Session replay sampling
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.5,

    // Debug mode (only in development)
    debug: process.env.NODE_ENV === "development",

    // Trace propagation targets
    tracePropagationTargets: [
      "localhost",
      /^https:\/\/.*\.luuc\.ai/,
      /^https:\/\/luuc\.ai/,
    ],

    // Integrations
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.browserTracingIntegration(),
    ],

    // Filter out noise
    ignoreErrors: [
      // Browser extensions
      /chrome-extension/,
      /moz-extension/,
      // Network errors that are expected
      "NetworkError",
      "Failed to fetch",
      // Cancel errors from user actions
      "AbortError",
      "cancelled",
    ],

    // Before sending events
    beforeSend(event) {
      // Filter out development errors in production
      if (process.env.NODE_ENV === "development") {
        console.log("Sentry event captured:", event);
      }

      // Don't send events if DSN is not configured
      if (!SENTRY_DSN) {
        return null;
      }

      return event;
    },
  });
} else {
  console.warn(
    "Sentry DSN not configured. Error monitoring is disabled. " +
    "Set NEXT_PUBLIC_SENTRY_DSN to enable Sentry."
  );
}
