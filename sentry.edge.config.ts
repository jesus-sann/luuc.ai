import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment detection
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",

    // Tracing sample rate for edge runtime
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Debug mode (only in development)
    debug: process.env.NODE_ENV === "development",

    // Edge runtime has limited integrations
    integrations: [],

    // Filter out noise
    ignoreErrors: [
      // Expected edge runtime errors
      "NetworkError",
      "Failed to fetch",
    ],

    // Before sending events
    beforeSend(event) {
      // Filter sensitive data from edge requests
      if (event.request?.headers) {
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
      }

      if (process.env.NODE_ENV === "development") {
        console.log("Sentry edge event captured:", event);
      }

      return event;
    },
  });
} else {
  console.warn(
    "Sentry DSN not configured. Edge runtime error monitoring is disabled. " +
    "Set SENTRY_DSN or NEXT_PUBLIC_SENTRY_DSN to enable Sentry."
  );
}
