export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = async (
  err: Error,
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
  },
  context: {
    routerKind: "Pages Router" | "App Router";
    routePath: string;
    routeType: "render" | "route" | "action" | "middleware";
  }
) => {
  // Only log in development, Sentry will capture in production
  if (process.env.NODE_ENV === "development") {
    console.error("Request error:", {
      error: err,
      request: {
        method: request.method,
        url: request.url,
      },
      context,
    });
  }
};
