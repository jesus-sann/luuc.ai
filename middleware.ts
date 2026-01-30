import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { rateLimit, RateLimitError } from "@/lib/rate-limit";

// Rate limiter for auth routes (5 requests per minute)
const authLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 100,
  limit: 5,
});

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting to auth routes
  if (pathname === "/login" || pathname === "/register") {
    try {
      const ip = getClientIp(request);
      await authLimiter.check(5, ip);
    } catch (error) {
      if (error instanceof RateLimitError) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: error.message,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "60",
            },
          }
        );
      }
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
