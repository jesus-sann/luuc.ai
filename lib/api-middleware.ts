/**
 * API middleware for rate limiting and other security measures
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RateLimitError } from "./rate-limit";

// Rate limit configurations for different route types
const GENERATE_LIMITER = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
  limit: 10,
});

const CRUD_LIMITER = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
  limit: 30,
});

const READ_LIMITER = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
  limit: 60,
});

const AUTH_LIMITER = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100,
  limit: 5,
});

export type RouteType = "generate" | "crud" | "read" | "auth";

/**
 * Get client IP from request headers
 */
function getClientIp(request: NextRequest): string {
  // Check common proxy headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to connection info (may not work in edge runtime)
  return "unknown";
}

/**
 * Higher-order function to wrap API handlers with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  routeType: RouteType = "crud"
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      const ip = getClientIp(request);
      const token = `${ip}-${routeType}`;

      // Select appropriate rate limiter
      let limiter;
      let limit;

      switch (routeType) {
        case "generate":
          limiter = GENERATE_LIMITER;
          limit = 10;
          break;
        case "crud":
          limiter = CRUD_LIMITER;
          limit = 30;
          break;
        case "read":
          limiter = READ_LIMITER;
          limit = 60;
          break;
        case "auth":
          limiter = AUTH_LIMITER;
          limit = 5;
          break;
        default:
          limiter = CRUD_LIMITER;
          limit = 30;
      }

      // Check rate limit
      await limiter.check(limit, token);

      // Call the original handler
      return await handler(request, context);
    } catch (error) {
      if (error instanceof RateLimitError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          {
            status: 429,
            headers: {
              "Retry-After": "60",
            },
          }
        );
      }

      // Re-throw other errors to be handled by the route
      throw error;
    }
  };
}
