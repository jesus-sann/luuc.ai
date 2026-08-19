import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// In-memory auth rate limiter — middleware runs on Edge (stateless, ephemeral).
// Supabase RPC calls from Edge are too slow and cause MIDDLEWARE_INVOCATION_TIMEOUT.
// Full rate limiting (Supabase-backed, durable) is enforced in each API route handler.
const AUTH_WINDOW_MS = 60_000;
const AUTH_LIMIT = 10; // per IP per minute on login/register pages
const authMemory = new Map<string, { count: number; resetAt: number }>();

function checkAuthRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = authMemory.get(ip);
  if (!entry || now > entry.resetAt) {
    authMemory.set(ip, { count: 1, resetAt: now + AUTH_WINDOW_MS });
    return true;
  }
  if (entry.count >= AUTH_LIMIT) return false;
  entry.count++;
  return true;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Light in-memory rate limit on auth page POST submissions.
  // Does not call Supabase — no network round-trip in middleware.
  if (request.method === "POST" && (pathname === "/login" || pathname === "/register")) {
    const ip = getClientIp(request);
    if (!checkAuthRateLimit(ip)) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Demasiados intentos. Espera un momento." }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run middleware on page routes only — API routes do their own auth and
     * rate limiting. Excluding /api/* eliminates a redundant supabase.auth.getUser()
     * call on every API request, which was a major source of MIDDLEWARE_INVOCATION_TIMEOUT.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mjs)$).*)",
  ],
};
