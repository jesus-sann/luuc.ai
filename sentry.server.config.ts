import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment detection
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",

    // Tracing sample rate
    // Lower in production to reduce overhead
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Debug mode (only in development)
    debug: process.env.NODE_ENV === "development",

    // Filter out noise
    ignoreErrors: [
      // Expected database errors
      "PGRST116", // Supabase row not found
      // Network timeouts that are expected
      "ETIMEDOUT",
      "ECONNREFUSED",
    ],

    // Before sending events
    beforeSend(event) {
      // Filter sensitive data
      if (event.request) {
        // Remove authorization headers
        if (event.request.headers) {
          delete event.request.headers["authorization"];
          delete event.request.headers["cookie"];
        }

        // Remove sensitive query params
        if (event.request.query_string && typeof event.request.query_string === "string") {
          const sensitiveParams = ["token", "api_key", "password", "secret"];
          for (const param of sensitiveParams) {
            if (event.request.query_string.includes(param)) {
              event.request.query_string = "[REDACTED]";
              break;
            }
          }
        }
      }

      // Filter sensitive context data
      if (event.contexts?.["Supabase"]) {
        delete event.contexts["Supabase"];
      }

      if (process.env.NODE_ENV === "development") {
        console.log("Sentry server event captured:", event);
      }

      return event;
    },
  });
} else {
  console.warn(
    "Sentry DSN not configured. Server error monitoring is disabled. " +
    "Set SENTRY_DSN or NEXT_PUBLIC_SENTRY_DSN to enable Sentry."
  );
}
